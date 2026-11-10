import { Icon } from '@/common/atoms/Icon';

export interface SectionTitleProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionTitle({ title, action, onAction }: SectionTitleProps) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {action && onAction && (
        <button onClick={onAction}>
          {action} <Icon name="arrow" size={15} />
        </button>
      )}
    </div>
  );
}
