import React, { useEffect, useState } from 'react';
import { formatPoints } from '@/lib/format';
import { cn } from '@/lib/cn';

interface PointsValueProps {
  points: number;
  animate?: boolean;
  fullWord?: boolean;
  size?: 'sm' | 'md' | 'lg' | string;
  className?: string;
}

export const PointsValue: React.FC<PointsValueProps> = ({
  points,
  animate = false,
  fullWord = false,
  size = 'md',
  className,
}) => {
  const [displayPoints, setDisplayPoints] = useState(points);

  useEffect(() => {
    if (!animate) return;

    const start = displayPoints;
    const end = points;
    if (start === end) return;

    const duration = 500;
    const startTime = performance.now();
    let frameId: number;

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const factor = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * factor);
      setDisplayPoints(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(frame);
      }
    };

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, animate]);

  const valueToRender = animate ? displayPoints : points;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-semibold',
    card: '',
    display: '',
    none: '',
  }[size] ?? '';

  return (
    <span className={cn('tabular-nums font-medium', sizeClasses, className)}>
      {formatPoints(valueToRender, fullWord)}
    </span>
  );
};
