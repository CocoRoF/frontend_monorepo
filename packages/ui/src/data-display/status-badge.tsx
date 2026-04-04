'use client';

import React from 'react';
import { cn } from '../lib/utils';

export type StatusBadgeVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

export interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: StatusBadgeVariant;
  className?: string;
  /** 점(dot) 표시 여부 */
  dot?: boolean;
}

const variantStyles: Record<StatusBadgeVariant, string> = {
  success: 'bg-success/8 text-success border-success/15',
  warning: 'bg-warning/8 text-warning border-warning/15',
  error:   'bg-error/8 text-error border-error/15',
  info:    'bg-info/8 text-info border-info/15',
  neutral: 'bg-gray-50 text-gray-500 border-gray-200',
};

const dotStyles: Record<StatusBadgeVariant, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error:   'bg-error',
  info:    'bg-info',
  neutral: 'bg-gray-400',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  variant = 'neutral',
  className,
  dot = true,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', dotStyles[variant])}
        />
      )}
      {children}
    </span>
  );
};

export default StatusBadge;
