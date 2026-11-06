import { newsService } from '@/services/news';
import { useApi } from './useApi';

export function useNewsList(params: { limit?: number; category?: string } = {}) {
  return useApi((signal) => newsService.list({ page: 1, ...params }, signal), [params.limit, params.category]);
}

/** Una noticia por id; si no hay id, trae la más reciente. */
export function useNewsDetail(id: string | null) {
  return useApi(
    (signal) => (id ? newsService.get(id, signal) : newsService.list({ limit: 1 }, signal).then((page) => page.items[0] ?? null)),
    [id],
  );
}

export function useNewsCategories() {
  return useApi((signal) => newsService.categories(signal), []);
}
