import { useState } from 'react';
import { NewsCard } from '@/common/molecules/NewsCard';
import { useApi } from '@/hooks';
import { newsService } from '@/services/news';

const NEWS_PER_PAGE = 10;
const CATEGORIES = ['Comunidad', 'Eventos', 'Salud', 'Consejos'];

export interface NewsArchiveProps {
  onOpenNews: (id: string) => void;
}

export function NewsArchive({ onOpenNews }: NewsArchiveProps) {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error } = useApi(
    (signal) =>
      newsService.history(
        {
          page,
          limit: NEWS_PER_PAGE,
          category: category || undefined,
          search: search.trim() || undefined,
        },
        signal,
      ),
    [page, category, search],
  );

  const pageCount = Math.ceil((data?.total ?? 0) / (data?.limit ?? NEWS_PER_PAGE));

  const updateCategory = (value: string) => {
    setCategory(value);
    setPage(1);
  };
  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <main className="shell content-page news-archive">
      <span className="eyebrow dark">Archivo</span>
      <h1 className="page-title">Noticias publicadas</h1>
      <p className="lead narrow">
        Explora las noticias disponibles de ASISCO UP por etiqueta o busca por su título.
      </p>

      <div className="news-archive-controls">
        <label>
          Buscar por título
          <input
            type="search"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Escribe el nombre de una noticia"
          />
        </label>
        <label>
          Filtrar por etiqueta
          <select value={category} onChange={(event) => updateCategory(event.target.value)}>
            <option value="">Todas las etiquetas</option>
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="news-status error">{error}</p>}
      {!error && loading && <p className="news-status">Cargando noticias…</p>}
      {!error && !loading && data?.items.length === 0 && (
        <p className="news-status">No se encontraron noticias con esos filtros.</p>
      )}
      {!loading && data && data.items.length > 0 && (
        <>
          <p className="news-archive-count">
            {data.total} {data.total === 1 ? 'noticia encontrada' : 'noticias encontradas'}
          </p>
          <div className="news-archive-grid">
            {data.items.map((item) => (
              <NewsCard key={item.id} item={item} onOpen={onOpenNews} />
            ))}
          </div>
          {pageCount > 1 && (
            <nav className="news-archive-pagination" aria-label="Paginación del archivo de noticias">
              <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
                Anterior
              </button>
              <span>
                Página {data.page} de {pageCount}
              </span>
              <button
                type="button"
                disabled={data.page === pageCount}
                onClick={() => setPage((current) => current + 1)}
              >
                Siguiente
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
