import { StoryArt } from '@/components/illustrations/StoryArt';
import { Icon } from '@/common/atoms/Icon';
import type { News } from '@/models';

export interface NewsCardProps {
  item: News;
  onOpen: (id: string) => void;
}

export function NewsCard({ item, onOpen }: NewsCardProps) {
  return (
    <article className="news-card" onClick={() => onOpen(item.id)}>
      <div className={`news-art ${item.tone}`}>
        {item.imageUrl ? (
          <img className="news-photo" src={item.imageUrl} alt="" loading="lazy" />
        ) : (
          <StoryArt type={item.art} />
        )}
      </div>
      <div className="news-card-body">
        <span>
          {item.category}
          {item.date && ` · ${item.date}`}
        </span>
        <h3>{item.title}</h3>
        <p>{item.excerpt}</p>
        <button>
          Leer noticia <Icon name="arrow" size={14} />
        </button>
      </div>
    </article>
  );
}
