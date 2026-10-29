import React from 'react';
import { X } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="notice error-notice">
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss error">
          <X size={14} />
        </button>
      )}
    </div>
  );
};
