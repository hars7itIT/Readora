import React from 'react';
import { LoaderCircle } from 'lucide-react';

interface LoadingSkeletonProps {
  label?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ label = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '36px 16px',
        color: '#7f8a7e',
        fontSize: '12px'
      }}
    >
      <LoaderCircle className="spin" size={18} />
      <span>{label}</span>
    </div>
  );
};
