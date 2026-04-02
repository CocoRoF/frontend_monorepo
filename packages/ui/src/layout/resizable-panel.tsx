'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '../lib/utils';

export type ResizableDirection = 'horizontal' | 'vertical';

export interface ResizablePanelProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  direction?: ResizableDirection;
  defaultSplit?: number;
  minSize?: number;
  maxSize?: number;
  onResize?: (size: number) => void;
  className?: string;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  leftPanel,
  rightPanel,
  direction = 'horizontal',
  defaultSplit = 50,
  minSize = 20,
  maxSize = 80,
  onResize,
  className,
}) => {
  const [split, setSplit] = useState(defaultSplit);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let newSplit: number;
      if (direction === 'horizontal') {
        newSplit = ((e.clientX - rect.left) / rect.width) * 100;
      } else {
        newSplit = ((e.clientY - rect.top) / rect.height) * 100;
      }
      newSplit = Math.max(minSize, Math.min(maxSize, newSplit));
      setSplit(newSplit);
      onResize?.(newSplit);
    },
    [direction, minSize, maxSize, onResize]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex w-full h-full overflow-hidden',
        isHorizontal ? 'flex-row' : 'flex-col',
        className,
      )}
    >
      <div
        className="overflow-auto"
        style={{ [isHorizontal ? 'width' : 'height']: `${split}%` }}
      >
        {leftPanel}
      </div>
      <div
        className={cn(
          'shrink-0 flex items-center justify-center group',
          isHorizontal
            ? 'w-1 cursor-col-resize hover:bg-primary/20'
            : 'h-1 cursor-row-resize hover:bg-primary/20',
          'bg-border transition-colors',
        )}
        onMouseDown={handleMouseDown}
        role="separator"
        aria-orientation={direction}
        tabIndex={0}
      >
        <div
          className={cn(
            'rounded-full bg-gray-400 group-hover:bg-primary transition-colors',
            isHorizontal ? 'w-0.5 h-6' : 'h-0.5 w-6',
          )}
        />
      </div>
      <div
        className="overflow-auto flex-1"
        style={{ [isHorizontal ? 'width' : 'height']: `${100 - split}%` }}
      >
        {rightPanel}
      </div>
    </div>
  );
};

export default ResizablePanel;