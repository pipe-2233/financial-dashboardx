import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin inline-block ${sizeClasses[size]} ${className}`}>
      <div className="h-full w-full border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
    </div>
  );
};

interface LoadingCardProps {
  title?: string;
  height?: number;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ 
  title = 'Loading...', 
  height = 200 
}) => {
  return (
    <div className="card">
      <div 
        className="flex flex-col items-center justify-center text-gray-500"
        style={{ height }}
      >
        <LoadingSpinner size="lg" className="mb-3" />
        <span className="text-sm font-medium">{title}</span>
      </div>
    </div>
  );
};
