import type { News, NewsPage } from '@/models';
import { mensajeDeError, newsApiClient } from '../http.client';
import type { PaginaDto, PublicacionDto } from './news.dto';
import { toNews, toNewsPage } from './news.mapper';

async function get<T>(path: string, params: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  try {
    const { data } = await newsApiClient.get<T>(path, { params, signal });
    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(mensajeDeError(error, 'Error al consultar las noticias'));
  }
}

/** Endpoints públicos del backend de UP News (GET /api/publicaciones...). */
export const newsService = {
  list(params: { page?: number; limit?: number; category?: string } = {}, signal?: AbortSignal): Promise<NewsPage> {
    return get<PaginaDto<PublicacionDto>>(
      '/publicaciones',
      { pagina: params.page, limite: params.limit, etiqueta: params.category },
      signal,
    ).then(toNewsPage);
  },

  get(id: string, signal?: AbortSignal): Promise<News> {
    return get<PublicacionDto>(`/publicaciones/${encodeURIComponent(id)}`, {}, signal).then(toNews);
  },

  categories(signal?: AbortSignal): Promise<string[]> {
    return get<string[]>('/publicaciones/etiquetas', {}, signal);
  },
};
