'use client';

import React, { useState } from 'react';
import { cn } from '../lib/utils';

export interface CardMetadata {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
}

export interface CardAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

export interface CardBadge {
  text: string;
  variant: BadgeVariant;
}

const badgeClasses: Record<BadgeVariant, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
  default: 'bg-gray-100 text-gray-600',
};

export interface CardProps {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string | React.ReactNode;
  metadata?: CardMetadata[];
  badge?: CardBadge;
  actions?: CardAction[];
  selectable?: boolean;
  selected?: boolean;
  onClick?: () => void;
  onSelect?: (id: string, selected: boolean) => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  id,
  title,
  description,
  thumbnail,
  metadata,
  badge,
  actions,
  selectable,
  selected,
  onClick,
  onSelect,
  className,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-card-menu]') ||
        (e.target as HTMLElement).closest('[data-card-checkbox]')) {
      return;
    }
    if (selectable && onSelect) {
      onSelect(id, !selected);
    } else if (onClick) {
      onClick();
    }
  };

  const handleActionClick = (action: CardAction, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!action.disabled) {
      action.onClick();
      setMenuOpen(false);
    }
  };

  const isClickable = onClick || (selectable && onSelect);

  return (
    <div
      className={cn(
        'relative rounded-lg border border-border bg-card overflow-hidden transition-shadow',
        selected && 'ring-2 ring-primary border-primary',
        isClickable && 'cursor-pointer hover:shadow-md',
        className,
      )}
      onClick={handleCardClick}
    >
      {thumbnail && (
        <div className="h-40 bg-gray-50 overflow-hidden flex items-center justify-center">
          {typeof thumbnail === 'string' ? (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          ) : (
            thumbnail
          )}
        </div>
      )}

      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">{title}</h3>
          {badge && (
            <span className={cn('shrink-0 px-2 py-0.5 rounded-full text-xs font-medium', badgeClasses[badge.variant])}>
              {badge.text}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>}
        {metadata && metadata.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            {metadata.map((meta, idx) => (
              <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                {meta.icon && <span className="text-muted-foreground/70">{meta.icon}</span>}
                <span>{meta.label}:</span>
                <span className="font-medium text-foreground">{meta.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {actions && actions.length > 0 && (
        <div data-card-menu className="absolute top-2 right-2">
          <button
            type="button"
            className="p-1 rounded-md hover:bg-gray-100 text-muted-foreground"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            aria-label="More actions"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-md border border-border bg-popover shadow-lg py-1">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors',
                      action.danger ? 'text-error hover:bg-error/5' : 'text-foreground hover:bg-gray-50',
                      action.disabled && 'opacity-50 cursor-not-allowed',
                    )}
                    onClick={(e) => handleActionClick(action, e)}
                    disabled={action.disabled}
                  >
                    {action.icon && <span className="w-4 h-4">{action.icon}</span>}
                    {action.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {selectable && (
        <div data-card-checkbox className="absolute top-2 left-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect?.(id, !selected)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
        </div>
      )}
    </div>
  );
};

export default Card;