import type { News, NewsPage } from '@/models';
import { apiGet } from '../http';
import type { PaginaDto, PublicacionDto } from './news.dto';
import { toNews, toNewsPage } from './news.mapper';

/** Endpoints públicos del backend de UP News (GET /api/publicaciones...). */
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
};
