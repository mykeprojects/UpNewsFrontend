import axios from 'axios';
import type { BackendNewsStatus, CreateNewsPayload, ManagedNews, UserRole } from '@/models';
import { fueCancelada, mensajeDeError, newsApiClient } from '../http.client';

/** Parámetros firmados que devuelve POST /api/gestion/upload-signature. */
interface FirmaSubida {
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  signature: string;
  timestamp: number;
  overwrite: false;
}

export const TAMANO_MAXIMO_IMAGEN = 10 * 1024 * 1024;
export const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];

/** Quita textos vacíos: el backend no acepta "" en campos opcionales. */
function opcional(valor: string): string | undefined {
  const limpio = valor.trim();
  return limpio ? limpio : undefined;
}

/**
 * Gestión de noticias desde la web (requiere sesión: el interceptor adjunta el Bearer).
 * Traduce lo que captura el formulario al contrato del backend:
 *
 *   Formulario              Backend
 *   BORRADOR             →  POST /gestion/publicaciones  { estado: "BORRADOR" }
 *   EN_REVISION          →  POST /gestion/publicaciones  { estado: "PENDIENTE_APROBACION" }
 *   PUBLICADO (admin)    →  crear borrador + POST /:id/aprobar            (queda aprobada, sin mostrar)
 *   PUBLICADO + activa   →  crear borrador + POST /:id/aprobar-y-activar  (visible en la web)
 */
export const newsGestionService = {
  /**
   * Obtiene todas las publicaciones gestionables por el usuario autenticado
   * (GET /gestion/publicaciones devuelve un arreglo directo ManagedNews[])
   * y filtra en el cliente según el estado requerido ('BORRADOR' o 'PENDIENTE_APROBACION').
   */
  async listByStatus(estado: BackendNewsStatus, signal?: AbortSignal): Promise<ManagedNews[]> {
    try {
      const { data } = await newsApiClient.get<ManagedNews[]>('/gestion/publicaciones', { signal });
      const lista = Array.isArray(data) ? data : [];
      return lista.filter((item) => item.estado === estado);
    } catch (error) {
      if (signal?.aborted || fueCancelada(error)) throw error;
      throw new Error(mensajeDeError(error, 'No se pudieron cargar las publicaciones'));
    }
  },

  /** Obtiene una publicación interna (borrador o solicitud) por su ID. */
  async getById(id: string, signal?: AbortSignal): Promise<ManagedNews> {
    try {
      const { data } = await newsApiClient.get<ManagedNews>(
        `/gestion/publicaciones/${encodeURIComponent(id)}`,
        { signal },
      );
      return data;
    } catch (error) {
      if (signal?.aborted || fueCancelada(error)) throw error;
      throw new Error(mensajeDeError(error, 'No se pudo cargar el borrador'));
    }
  },

  async createNews(payload: CreateNewsPayload, userRole: UserRole): Promise<ManagedNews> {
    const esAdmin = userRole === 'ADMINISTRADOR';
    if (payload.imagenUrl && payload.videoUrl?.trim()) {
      throw new Error('Adjunta una imagen o un video de YouTube, no ambos.');
    }
    // Regla de UX (el backend la vuelve a validar): un tallerista nunca publica, solo envía a revisión.
    const estadoFormulario = !esAdmin && payload.estado === 'PUBLICADO' ? 'EN_REVISION' : payload.estado;

    const cuerpo = {
      titulo: payload.titulo.trim(),
      cuerpo: payload.cuerpo.trim(),
      resumen: opcional(payload.resumen),
      proposito: opcional(payload.proposito),
      etiqueta: opcional(payload.etiqueta),
      estado: estadoFormulario === 'EN_REVISION' ? 'PENDIENTE_APROBACION' : 'BORRADOR',
      imagenUrl: payload.videoUrl?.trim() || payload.imagenUrl || undefined,
    };

    try {
      const { data: creada } = await newsApiClient.post<ManagedNews>('/gestion/publicaciones', cuerpo);
      if (!(esAdmin && estadoFormulario === 'PUBLICADO')) return creada;

      const accion = payload.esta_activo ? 'aprobar-y-activar' : 'aprobar';
      const { data: aprobada } = await newsApiClient.post<ManagedNews>(
        `/gestion/publicaciones/${encodeURIComponent(creada.id)}/${accion}`,
      );
      return aprobada;
    } catch (error) {
      throw new Error(mensajeDeError(error, 'No se pudo guardar la noticia'));
    }
  },

  /**
   * Actualiza un borrador existente en /publicar/:id:
   * 1. PATCH /gestion/publicaciones/:id SIN el campo `estado` (schema .omit({ estado: true }).strict()).
   * 2. Si el estado deseado es EN_REVISION, llama a POST /:id/enviar (sin body).
   * 3. Si es admin y el estado deseado es PUBLICADO, llama a POST /:id/aprobar-y-activar o POST /:id/aprobar.
   */
  async updateNews(id: string, payload: CreateNewsPayload, userRole: UserRole): Promise<ManagedNews> {
    const esAdmin = userRole === 'ADMINISTRADOR';
    if (payload.imagenUrl && payload.videoUrl?.trim()) {
      throw new Error('Adjunta una imagen o un video de YouTube, no ambos.');
    }
    const estadoFormulario = !esAdmin && payload.estado === 'PUBLICADO' ? 'EN_REVISION' : payload.estado;

    const cuerpoPatch = {
      titulo: payload.titulo.trim(),
      cuerpo: payload.cuerpo.trim(),
      resumen: opcional(payload.resumen),
      proposito: opcional(payload.proposito),
      etiqueta: opcional(payload.etiqueta),
      imagenUrl: payload.videoUrl?.trim() || payload.imagenUrl,
    };

    try {
      const encodedId = encodeURIComponent(id);
      const { data: actualizada } = await newsApiClient.patch<ManagedNews>(
        `/gestion/publicaciones/${encodedId}`,
        cuerpoPatch,
      );

      if (estadoFormulario === 'BORRADOR') {
        return actualizada;
      }

      if (estadoFormulario === 'EN_REVISION') {
        const { data: enviada } = await newsApiClient.post<ManagedNews>(
          `/gestion/publicaciones/${encodedId}/enviar`,
        );
        return enviada;
      }

      const accion = payload.esta_activo ? 'aprobar-y-activar' : 'aprobar';
      const { data: aprobada } = await newsApiClient.post<ManagedNews>(
        `/gestion/publicaciones/${encodedId}/${accion}`,
      );
      return aprobada;
    } catch (error) {
      throw new Error(mensajeDeError(error, 'No se pudo actualizar el borrador'));
    }
  },

  /**
   * Tallerista: solicita la publicación de un borrador existente
   * pasando de 'BORRADOR' a 'PENDIENTE_APROBACION' vía POST /gestion/publicaciones/:id/enviar (sin body).
   */
  async requestPublication(id: string): Promise<ManagedNews> {
    try {
      const { data } = await newsApiClient.post<ManagedNews>(
        `/gestion/publicaciones/${encodeURIComponent(id)}/enviar`,
      );
      return data;
    } catch (error) {
      throw new Error(mensajeDeError(error, 'No se pudo enviar el borrador a revisión'));
    }
  },

  /**
   * Administrador / Directora: aprueba y activa inmediatamente en la web
   * vía POST /gestion/publicaciones/:id/aprobar-y-activar.
   */
  async approveAndPublish(id: string): Promise<ManagedNews> {
    try {
      const { data } = await newsApiClient.post<ManagedNews>(
        `/gestion/publicaciones/${encodeURIComponent(id)}/aprobar-y-activar`,
      );
      return data;
    } catch (error) {
      throw new Error(mensajeDeError(error, 'No se pudo aprobar y publicar la noticia'));
    }
  },

  /**
   * Sube una imagen directo a Cloudinary con una firma temporal del backend.
   * El secreto de Cloudinary nunca llega al navegador. Devuelve la URL segura (https).
   */
  async uploadImage(file: File): Promise<string> {
    if (!TIPOS_IMAGEN.includes(file.type)) {
      throw new Error('La imagen debe ser JPG, PNG o WebP.');
    }
    if (file.size > TAMANO_MAXIMO_IMAGEN) {
      throw new Error('La imagen no puede pesar más de 10 MB.');
    }

    let firma: FirmaSubida;
    try {
      ({ data: firma } = await newsApiClient.post<FirmaSubida>('/gestion/upload-signature'));
    } catch (error) {
      throw new Error(mensajeDeError(error, 'No se pudo preparar la subida de la imagen'));
    }

    const formulario = new FormData();
    formulario.append('file', file);
    formulario.append('api_key', firma.apiKey);
    formulario.append('timestamp', String(firma.timestamp));
    formulario.append('signature', firma.signature);
    formulario.append('folder', firma.folder);
    formulario.append('public_id', firma.publicId);
    formulario.append('overwrite', String(firma.overwrite));

    try {
      // axios "limpio": a Cloudinary NO se le envía el token de la fundación.
      const { data } = await axios.post<{ secure_url: string }>(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(firma.cloudName)}/image/upload`,
        formulario,
      );
      return data.secure_url;
    } catch (error) {
      const detalle = axios.isAxiosError(error)
        ? (error.response?.data as { error?: { message?: string } } | undefined)?.error?.message
        : undefined;
      throw new Error(detalle ? `Cloudinary rechazó la imagen: ${detalle}` : 'No se pudo subir la imagen');
    }
  },
};
