import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { WaveLine } from './WaveLine';

interface RewardImageProps {
  src?: string;
  alt: string;
  aspectRatio?: '3/4' | '4/3' | '1/1' | '16/9';
  className?: string;
}

export const RewardImage: React.FC<RewardImageProps> = ({
  src,
  alt,
  aspectRatio = '3/4',
  className,
}) => {
  const [error, setError] = useState(false);

  const ratioClasses = {
    '3/4': 'aspect-[3/4]',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    '16/9': 'aspect-[16/9]',
  }[aspectRatio];

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-blush-100 flex items-center justify-center',
        ratioClasses,
        className
      )}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-4 text-center text-ink-500">
          <WaveLine className="w-16 h-4 text-coral-600 mb-2 opacity-60" />
          <span className="text-xs uppercase tracking-widest font-sans font-medium text-ink-500">
            Trove Treat
          </span>
        </div>
      )}
    </div>
  );
};
