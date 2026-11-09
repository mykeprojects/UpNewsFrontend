import { getYouTubeEmbedUrl } from '@/utils/youtube.util';

interface YouTubeVideoProps {
  url: string;
  title: string;
  className?: string;
}

export function YouTubeVideo({ url, title, className = '' }: YouTubeVideoProps) {
  const embedUrl = getYouTubeEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <div className={`youtube-video ${className}`.trim()}>
      <iframe
        src={embedUrl}
        title={title}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
