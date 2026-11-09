export function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return null;
    const host = parsed.hostname.toLowerCase();
    let id: string | undefined;

    if (host === 'youtu.be') {
      id = parsed.pathname.split('/').filter(Boolean)[0];
    } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) {
      id = parsed.searchParams.get('v') ?? undefined;
      id ??= parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];
    } else {
      return null;
    }

    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
}
