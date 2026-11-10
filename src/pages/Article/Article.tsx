import { DrumArt } from '@/components/illustrations/DrumArt';
import { StoryArt } from '@/components/illustrations/StoryArt';
import { MiniStory } from '@/common/molecules/MiniStory';
import { useNewsDetail, useNewsList } from '@/hooks';
import type { AuthUser, News } from '@/models';
import { YouTubeVideo } from '@/common/molecules/YouTubeVideo/YouTubeVideo';

export interface ArticleProps {
  /** Noticia a mostrar; si es null se muestra la más reciente. */
  newsId: string | null;
  onOpenNews: (id: string) => void;
  showSidebar?: boolean;
  user?: AuthUser | null;
}

export function ArticleContent({ item }: { item: News }) {
  return (
    <article className="article">
      <span className="eyebrow dark">
        {item.category}
        {item.date && ` · ${item.date}`}
      </span>
      <h1>{item.title}</h1>
      {item.excerpt !== item.body && <p className="lead">{item.excerpt}</p>}
      {item.mediaType === 'VIDEO' && item.imageUrl ? (
        <YouTubeVideo url={item.imageUrl} title={item.title} className="article-video" />
      ) : item.imageUrl ? (
        <img className="article-photo" src={item.imageUrl} alt={item.title} />
      ) : item.art === 'screen' ? (
        <DrumArt />
      ) : (
        <StoryArt type={item.art} />
      )}
      {item.body
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
    </article>
  );
}

function ArticleSidebar({
  item,
  onOpenNews,
  user,
}: {
  item: News | null;
  onOpenNews: (id: string) => void;
  user?: AuthUser | null;
}) {
  const related = useNewsList({ limit: 4 });
  const others = (related.data?.items ?? []).filter((news) => news.id !== item?.id).slice(0, 3);

  return (
    <aside className="article-aside">
      {!user && (
        <div className="aside-card orange-card">
          <strong>¿Quieres apoyar nuestros talleres?</strong>
          <p>Tu donación ayuda a mantener espacios de aprendizaje y encuentro.</p>
          <button className="button light">Donar con Asisco Pay</button>
        </div>
      )}
      {others.length > 0 && (
        <div className="aside-card">
          <strong>También te puede interesar</strong>
          {others.map((other) => (
            <MiniStory key={other.id} item={other} onClick={() => onOpenNews(other.id)} />
          ))}
        </div>
      )}
    </aside>
  );
}

export function ArticlePage({ newsId, onOpenNews, showSidebar = true, user }: ArticleProps) {
  const { data: item, loading, error } = useNewsDetail(newsId);

  return (
    <main className={`shell article-layout${showSidebar ? '' : ' article-layout-featured'}`}>
      {error && <p className="news-status error">{error}</p>}
      {!error && loading && !item && <p className="news-status">Cargando noticia…</p>}
      {!error && !loading && !item && <p className="news-status">Aún no hay noticias publicadas.</p>}
      {item && <ArticleContent item={item} />}
      {showSidebar && <ArticleSidebar item={item} onOpenNews={onOpenNews} user={user} />}
    </main>
  );
}

export function Article(props: ArticleProps) {
  return <ArticlePage {...props} />;
}
