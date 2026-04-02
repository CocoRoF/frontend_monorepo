'use client';

import React from 'react';
import { cn } from '../lib/utils';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export interface SuggestionItem {
  text: string;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  suggestions?: string[];
  onSuggestionClick?: (text: string) => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon, title, description, action, suggestions, onSuggestionClick, className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {icon && <div className="mb-4 text-muted-foreground [&_svg]:h-12 [&_svg]:w-12">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            action.variant === 'secondary'
              ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              : 'bg-primary text-white hover:bg-primary/85'
          )}
        >
          {action.icon && <span className="shrink-0">{action.icon}</span>}
          {action.label}
        </button>
      )}
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {suggestions.map((text, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSuggestionClick?.(text)}
              className="px-3 py-1.5 rounded-full text-xs text-muted-foreground bg-accent hover:bg-gray-200 transition-colors"
            >
              {text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmptyState;