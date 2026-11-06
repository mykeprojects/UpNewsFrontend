import axios from 'axios';
import type { CreateNewsPayload, ManagedNews, UserRole } from '@/models';
import { mensajeDeError, newsApiClient } from '../http.client';

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
  async createNews(payload: CreateNewsPayload, userRole: UserRole): Promise<ManagedNews> {
    const esAdmin = userRole === 'ADMINISTRADOR';
    // Regla de UX (el backend la vuelve a validar): un tallerista nunca publica, solo envía a revisión.
    const estadoFormulario = !esAdmin && payload.estado === 'PUBLICADO' ? 'EN_REVISION' : payload.estado;

    const cuerpo = {
      titulo: payload.titulo.trim(),
      cuerpo: payload.cuerpo.trim(),
      resumen: opcional(payload.resumen),
      proposito: opcional(payload.proposito),
      etiqueta: opcional(payload.etiqueta),
      estado: estadoFormulario === 'EN_REVISION' ? 'PENDIENTE_APROBACION' : 'BORRADOR',
      imagenUrl: payload.imagenUrl || undefined,
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
