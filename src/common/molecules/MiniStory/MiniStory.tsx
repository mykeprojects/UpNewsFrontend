import { StoryArt } from '@/components/illustrations/StoryArt';

export interface MiniStoryProps {
  item: {
    art: string;
    title: string;
  };
  onClick?: () => void;
}

export function MiniStory({ item, onClick }: MiniStoryProps) {
  return (
    <div className="mini-story" onClick={onClick} role={onClick ? 'button' : undefined} style={onClick ? { cursor: 'pointer' } : undefined}>
      <StoryArt type={item.art} />
      <span>{item.title}</span>
    </div>
  );
}
