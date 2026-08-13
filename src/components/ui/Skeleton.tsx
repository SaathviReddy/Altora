import React from 'react';

interface SkeletonProps {
  message?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  message = 'Loading dashboard analysis...',
  className = ''
}) => {
  return (
    <div className={`w-full flex flex-col justify-center items-center py-12 px-6 bg-ivory/50 border border-charcoal/5 rounded animate-pulse ${className}`}>
      {/* Editorial layout skeleton cards */}
      <div className="w-11/12 max-w-lg space-y-4">
        <div className="h-4 bg-charcoal/10 rounded w-1/3"></div>
        <div className="h-8 bg-charcoal/5 rounded w-full"></div>
        <div className="h-4 bg-charcoal/5 rounded w-5/6"></div>
        <div className="h-4 bg-charcoal/5 rounded w-4/5"></div>
      </div>
      
      {message && (
        <span className="mt-8 text-xs font-medium uppercase tracking-widest text-brown animate-pulse">
          {message}
        </span>
      )}
    </div>
  );
};
