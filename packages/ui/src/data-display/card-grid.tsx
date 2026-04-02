'use client';

import React from 'react';
import { cn } from '../lib/utils';

export interface CardGridColumns {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export type CardGridGap = 'sm' | 'md' | 'lg';

const gapClasses: Record<CardGridGap, string> = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

export interface CardGridProps {
  children: React.ReactNode;
  columns?: CardGridColumns;
  gap?: CardGridGap;
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md',
  className,
}) => {
  return (
    <div
      className={cn('grid', gapClasses[gap], className)}
      style={{
        '--columns-sm': columns.sm ?? 1,
        '--columns-md': columns.md ?? 2,
        '--columns-lg': columns.lg ?? 3,
        '--columns-xl': columns.xl ?? 4,
        gridTemplateColumns: `repeat(var(--columns-sm), minmax(0, 1fr))`,
      } as React.CSSProperties}
    >
      <style>{`
        @media (min-width: 768px) {
          [style*="--columns-md"] { grid-template-columns: repeat(var(--columns-md), minmax(0, 1fr)) !important; }
        }
        @media (min-width: 1024px) {
          [style*="--columns-lg"] { grid-template-columns: repeat(var(--columns-lg), minmax(0, 1fr)) !important; }
        }
        @media (min-width: 1280px) {
          [style*="--columns-xl"] { grid-template-columns: repeat(var(--columns-xl), minmax(0, 1fr)) !important; }
        }
      `}</style>
      {children}
    </div>
  );
};

export default CardGrid;