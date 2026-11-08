import axios from 'axios';
import type {
  CreateNewsPayload,
  CreateNewsResponse,
  News,
  NewsPage,
  UserRole,
} from '@/models';
import { apiGet } from '../http';
import { newsApiClient } from '../http.client';
import type { PaginaDto, PublicacionDto } from './news.dto';
import { toNews, toNewsPage } from './news.mapper';

/** Endpoints públicos y protegidos del backend de UP News (/api/publicaciones...). */
export const newsService = {
  list(params: { page?: number; limit?: number; category?: string } = {}, signal?: AbortSignal): Promise<NewsPage> {
    return apiGet<PaginaDto<PublicacionDto>>(
      '/api/publicaciones',
      { pagina: params.page, limite: params.limit, etiqueta: params.category },
      signal,
    ).then(toNewsPage);
  },

  get(id: string, signal?: AbortSignal): Promise<News> {
    return apiGet<PublicacionDto>(`/api/publicaciones/${encodeURIComponent(id)}`, {}, signal).then(toNews);
  },

  categories(signal?: AbortSignal): Promise<string[]> {
    return apiGet<string[]>('/api/publicaciones/etiquetas', {}, signal);
  },

  /**
   * 1. Crea la noticia en POST /api/gestion/publicaciones (con estado BORRADOR o PENDIENTE_APROBACION).
   * 2. Si el usuario es ADMINISTRADOR y solicita publicarla/activarla inmediatamente,
   *    llama a POST /api/gestion/publicaciones/:id/aprobar-y-activar.
   */
  async createNews(
    payload: CreateNewsPayload,
    userRole: UserRole,
    options?: { approveAndActivate?: boolean },
  ): Promise<CreateNewsResponse> {
    const isDraft = payload.estado === 'BORRADOR';
    const creationEstado = isDraft ? 'BORRADOR' : 'PENDIENTE_APROBACION';

    const shouldApproveAndActivate =
      userRole === 'ADMINISTRADOR' &&
      !isDraft &&
      Boolean(options?.approveAndActivate ?? (payload.estado === 'PUBLICADO' || payload.esta_activo));

    const sanitizedPayload: CreateNewsPayload = {
      titulo: payload.titulo.trim(),
      cuerpo: payload.cuerpo.trim(),
      ...(payload.resumen?.trim() ? { resumen: payload.resumen.trim() } : {}),
      ...(payload.proposito?.trim() ? { proposito: payload.proposito.trim() } : {}),
      ...(payload.etiqueta?.trim() ? { etiqueta: payload.etiqueta.trim() } : {}),
      ...(payload.imagenUrl?.trim() ? { imagenUrl: payload.imagenUrl.trim() } : {}),
      estado: creationEstado,
    };

    try {
      // 1. Crear la noticia (devuelve la noticia creada con su `id`)
      const response = await newsApiClient.post<CreateNewsResponse>(
        '/api/gestion/publicaciones',
        sanitizedPayload,
      );
      const createdNews = response.data;
      const noticiaId = createdNews?.id ?? createdNews?.data?.id;

      // 2. Aprobar y activar inmediatamente (solo rol ADMIN / DIRECTORA)
      if (shouldApproveAndActivate && noticiaId !== undefined && noticiaId !== null) {
        await newsApiClient.post(
          `/api/gestion/publicaciones/${encodeURIComponent(String(noticiaId))}/aprobar-y-activar`,
        );
      }

      return createdNews;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as { mensaje?: string; message?: string; error?: string })?.mensaje ||
          (error.response?.data as { mensaje?: string; message?: string; error?: string })?.message ||
          (error.response?.data as { mensaje?: string; message?: string; error?: string })?.error;
        if (message) {
          throw new Error(message);
        }
      }
      throw error;
    }
  },
};
