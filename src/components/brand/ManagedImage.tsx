import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { WaveLine } from './WaveLine';

export interface ManagedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackGradient?: string;
  fallbackText?: string;
  containerClassName?: string;
}

export const ManagedImage: React.FC<ManagedImageProps> = ({
  src,
  alt,
  fallbackGradient = 'linear-gradient(135deg, var(--sand-200), var(--shell-100))',
  fallbackText,
  className,
  containerClassName,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'w-full h-full flex flex-col items-center justify-center p-4 text-center select-none overflow-hidden',
          containerClassName || className
        )}
        style={{ background: fallbackGradient }}
        role="img"
        aria-label={alt}
      >
        <WaveLine className="w-12 h-3 text-ink-900/40 mb-1" />
        {fallbackText && (
          <span className="text-xs uppercase tracking-widest font-sans font-medium text-ink-900/70">
            {fallbackText}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );
};
