import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/common/atoms/Icon';
import { SectionTitle } from '@/common/molecules/SectionTitle';
import { NewsCard } from '@/common/molecules/NewsCard';
import { useNewsCategories, useNewsList } from '@/hooks';
import { Footer } from '@/layout/Footer';
import { Article } from '@/pages/Article';
import type { Page } from '@/models';

export interface HomeProps {
  onNavigate: (page: Page) => void;
  onOpenNews: (id: string) => void;
}

const TODAS = 'Todas';
const NOTICIAS_POR_PAGINA = 3;

function masRecientesPrimero<T extends { publishedAt: string | null }>(items: T[]): T[] {
  return [...items]
    .sort((a, b) => {
      const fechaA = a.publishedAt ? Date.parse(a.publishedAt) : Number.NaN;
      const fechaB = b.publishedAt ? Date.parse(b.publishedAt) : Number.NaN;
      const fechaAValida = Number.isFinite(fechaA);
      const fechaBValida = Number.isFinite(fechaB);
      if (!fechaAValida) return fechaBValida ? 1 : 0;
      if (!fechaBValida) return -1;
      return fechaB - fechaA;
    })
    .slice(0, 10);
}

export function Home({ onNavigate, onOpenNews }: HomeProps) {
  const [filter, setFilter] = useState(TODAS);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const list = useNewsList({ limit: 10, category: filter === TODAS ? undefined : filter });
  const categories = useNewsCategories();

  const carouselItems = useMemo(() => masRecientesPrimero(list.data?.items ?? []), [list.data?.items]);
  const carouselPages = useMemo(() => {
    const pages = [];
    for (let start = 0; start < carouselItems.length; start += NOTICIAS_POR_PAGINA) {
      pages.push(carouselItems.slice(start, start + NOTICIAS_POR_PAGINA));
    }
    return pages;
  }, [carouselItems]);
  const filters = [TODAS, ...(categories.data ?? [])];

  useEffect(() => setActiveNewsIndex(0), [filter, carouselItems]);

  return (
    <>
      <Article newsId={null} onOpenNews={onOpenNews} showSidebar={false} />
      <main>
        <section className="shell section news-section">
          <SectionTitle title="Últimas noticias" />
          <div className="filters" aria-label="Filtrar noticias">
            {filters.map((name) => (
              <button className={name === filter ? 'active' : ''} key={name} onClick={() => setFilter(name)}>
                {name}
              </button>
            ))}
          </div>
          {list.error && <p className="news-status error">{list.error}</p>}
          {!list.error && list.loading && !list.data && <p className="news-status">Cargando noticias…</p>}
          {!list.error && list.data?.items.length === 0 && <p className="news-status">Aún no hay noticias en esta categoría.</p>}
          <div className="news-carousel" role="region" aria-label="Carrusel de últimas noticias">
            <div
              className="news-carousel-track"
              style={{ transform: `translateX(-${activeNewsIndex * 100}%)` }}
            >
              {carouselPages.map((items, pageIndex) => (
                <div className="news-carousel-page" key={items[0].id}>
                  {items.map((item) => (
                    <NewsCard key={item.id} item={item} onOpen={onOpenNews} />
                  ))}
                  {items.length < NOTICIAS_POR_PAGINA &&
                    Array.from({ length: NOTICIAS_POR_PAGINA - items.length }, (_, index) => (
                      <div className="news-thumbnail-placeholder" key={`placeholder-${pageIndex}-${index}`} />
                    ))}
                </div>
              ))}
            </div>
            {carouselPages.length > 1 && (
              <div className="news-carousel-pagination" aria-label="Seleccionar noticia">
                {carouselPages.map((items, index) => (
                  <button
                    key={items[0].id}
                    type="button"
                    aria-label={`Mostrar miniaturas ${index * NOTICIAS_POR_PAGINA + 1} a ${index * NOTICIAS_POR_PAGINA + items.length}`}
                    aria-current={index === activeNewsIndex ? 'true' : undefined}
                    onClick={() => setActiveNewsIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="shell support-grid">
          <div className="donation-band" id="donar">
            <div className="round-icon">
              <Icon name="heart" size={28} />
            </div>
            <div className="donation-copy">
              <span>¿Quieres apoyar nuestra labor?</span>
              <p>Tu aporte abre nuevas oportunidades para nuestra comunidad.</p>
            </div>
            <button className="button dark donate-cta">Donar con Asisco Pay</button>
          </div>
        </section>
      </main>
      <Footer onNavigate={onNavigate} />
    </>
  );
}
