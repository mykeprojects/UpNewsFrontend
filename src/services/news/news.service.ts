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
   * Envía la creación de la noticia al backend de UP News utilizando newsApiClient.
   * El interceptor de Axios adjunta automáticamente `Authorization: Bearer <token>`
   * leyendo el token almacenado en las cookies.
   */
  async createNews(
    payload: CreateNewsPayload,
    userRole: UserRole,
  ): Promise<CreateNewsResponse> {
    const sanitizedPayload: CreateNewsPayload = {
      ...payload,
      esta_activo: userRole === 'ADMINISTRADOR' ? Boolean(payload.esta_activo) : false,
      estado:
        userRole === 'TALLERISTA' && payload.estado === 'PUBLICADO'
          ? 'EN_REVISION'
          : payload.estado,
    };

    try {
      const response = await newsApiClient.post<CreateNewsResponse>(
        '/api/publicaciones',
        sanitizedPayload,
      );
      return response.data;
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
