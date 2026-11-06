import { useState } from 'react';
import { DrumArt } from '@/components/illustrations/DrumArt';
import { Icon } from '@/common/atoms/Icon';
import { SectionTitle } from '@/common/molecules/SectionTitle';
import { EventRow } from '@/common/molecules/EventRow';
import { NewsCard } from '@/common/molecules/NewsCard';
import { events } from '@/common/constants';
import { useNewsCategories, useNewsList } from '@/hooks';
import { Footer } from '@/layout/Footer';
import type { Page } from '@/models';

export interface HomeProps {
  onNavigate: (page: Page) => void;
  onOpenNews: (id: string) => void;
}

const TODAS = 'Todas';

export function Home({ onNavigate, onOpenNews }: HomeProps) {
  const [filter, setFilter] = useState(TODAS);
  const latest = useNewsList({ limit: 1 });
  const list = useNewsList({ limit: 6, category: filter === TODAS ? undefined : filter });
  const categories = useNewsCategories();

  const hero = latest.data?.items[0];
  const filters = [TODAS, ...(categories.data ?? [])];

  return (
    <>
      <main>
        <section className="hero shell">
          <div className="hero-copy">
            {hero ? (
              <>
                <span className="eyebrow">
                  {hero.category}
                  {hero.date && ` · ${hero.date}`}
                </span>
                <h1>{hero.title}</h1>
                <p>{hero.excerpt}</p>
              </>
            ) : (
              <>
                <span className="eyebrow">UpNews</span>
                <h1>Las historias de la Fundación ASISCO UP</h1>
                <p>{latest.loading ? 'Cargando la noticia más reciente…' : 'Muy pronto publicaremos nuestras primeras noticias.'}</p>
              </>
            )}
            <div className="hero-buttons">
              <button className="button orange" disabled={!hero} onClick={() => hero && onOpenNews(hero.id)}>
                Leer noticia <Icon name="arrow" size={16} />
              </button>
              <button className="button ghost-light">
                <Icon name="volume" size={16} /> Escuchar noticia
              </button>
            </div>
          </div>
          <div className="hero-art">
            <DrumArt />
          </div>
        </section>

        <section className="shell section">
          <SectionTitle title="Próximos eventos" action="Ver agenda" onAction={() => onNavigate('agenda')} />
          <div className="events-preview">
            {events.map((event, index) => (
              <EventRow key={event.title} event={event} featured={index === 1} />
            ))}
          </div>
        </section>

        <section className="shell section news-section">
          <SectionTitle title="Últimas noticias" action="Ver todas" onAction={() => setFilter(TODAS)} />
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
          <div className="news-grid">
            {list.data?.items.map((item) => (
              <NewsCard key={item.id} item={item} onOpen={onOpenNews} />
            ))}
          </div>
        </section>

        <section className="shell support-grid">
          <div className="telegram-band">
            <div className="round-icon">
              <Icon name="send" size={24} />
            </div>
            <div>
              <span>Las noticias de la fundación, en tu Telegram</span>
              <p>Recibe nuestras historias y eventos.</p>
            </div>
            <a className="button light" href="https://t.me/" target="_blank" rel="noreferrer">
              Unirme al canal
            </a>
          </div>
          <div className="donation-band" id="donar">
            <div className="round-icon">
              <Icon name="heart" size={24} />
            </div>
            <div>
              <span>¿Quieres apoyar nuestra labor?</span>
              <p>Tu aporte abre nuevas oportunidades.</p>
            </div>
            <button className="button dark">Donar con Asisco Pay</button>
          </div>
        </section>
      </main>
      <Footer onNavigate={onNavigate} />
    </>
  );
}
