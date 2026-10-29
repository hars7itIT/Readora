import React from 'react';
import { BookOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No articles here yet.',
  description = 'Try refreshing your feeds or choosing another subscription.',
  actionText,
  onAction,
  icon = <BookOpen size={24} />
}) => {
  return (
    <div className="empty-list">
      {icon}
      <h3>{title}</h3>
      <p>{description}</p>
      {actionText && onAction && (
        <button className="secondary-button" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};
