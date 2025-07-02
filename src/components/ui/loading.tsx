import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const LoadingSpinner = ({ size = 'md', className, text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
};

// Page loading overlay
export const PageLoadingOverlay = ({ text = "Loading..." }: { text?: string }) => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

// Button loading state
export const ButtonLoading = ({ text = "Loading..." }: { text?: string }) => (
  <div className="flex items-center gap-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>{text}</span>
  </div>
);

// Inline loading
export const InlineLoading = ({ text }: { text?: string }) => (
  <div className="flex items-center gap-2 py-4">
    <LoadingSpinner size="sm" />
    {text && <span className="text-sm text-muted-foreground">{text}</span>}
  </div>
);

export default LoadingSpinner;