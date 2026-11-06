import { DrumArt } from '@/components/illustrations/DrumArt';
import { StoryArt } from '@/components/illustrations/StoryArt';
import { Icon } from '@/common/atoms/Icon';
import { MiniStory } from '@/common/molecules/MiniStory';
import { useNewsDetail, useNewsList } from '@/hooks';

export interface ArticleProps {
  /** Noticia a mostrar; si es null se muestra la más reciente. */
  newsId: string | null;
  onOpenNews: (id: string) => void;
}

export function ArticlePage({ newsId, onOpenNews }: ArticleProps) {
  const { data: item, loading, error } = useNewsDetail(newsId);
  const related = useNewsList({ limit: 4 });
  const others = (related.data?.items ?? []).filter((n) => n.id !== item?.id).slice(0, 3);

  return (
    <main className="shell article-layout">
      <article className="article">
        {error && <p className="news-status error">{error}</p>}
        {!error && loading && !item && <p className="news-status">Cargando noticia…</p>}
        {!error && !loading && !item && <p className="news-status">Aún no hay noticias publicadas.</p>}
        {item && (
          <>
            <span className="eyebrow dark">
              {item.category}
              {item.date && ` · ${item.date}`}
            </span>
            <h1>{item.title}</h1>
            {item.excerpt !== item.body && <p className="lead">{item.excerpt}</p>}
            <div className="article-actions">
              <button className="button secondary">
                <Icon name="volume" size={16} /> Escuchar noticia
              </button>
              <button className="plain-button">Lectura fácil</button>
            </div>
            {item.art === 'screen' ? <DrumArt /> : <StoryArt type={item.art} />}
            {item.body
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            <div className="article-tags">
              <span>{item.category}</span>
            </div>
          </>
        )}
      </article>
      <aside className="article-aside">
        <div className="aside-card orange-card">
          <strong>¿Quieres apoyar nuestros talleres?</strong>
          <p>Tu donación ayuda a mantener espacios de aprendizaje y encuentro.</p>
          <button className="button light">Donar con Asisco Pay</button>
        </div>
        <div className="aside-card teal-card">
          <strong>¿Quieres recibir esta noticia?</strong>
          <p>Únete al canal oficial de la fundación.</p>
          <a className="button light" href="https://t.me/" target="_blank" rel="noreferrer">
            <Icon name="send" size={15} /> Ir a Telegram
          </a>
        </div>
        {others.length > 0 && (
          <div className="aside-card">
            <strong>También te puede interesar</strong>
            {others.map((other) => (
              <MiniStory key={other.id} item={other} onClick={() => onOpenNews(other.id)} />
            ))}
          </div>
        )}
      </aside>
    </main>
  );
}

export function Article(props: ArticleProps) {
  return <ArticlePage {...props} />;
}
