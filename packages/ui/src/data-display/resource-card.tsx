'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type {
  ResourceCardProps,
  CardBadge,
  CardMetaItem,
  CardActionButton,
  CardDropdownItem,
  CardThumbnail,
} from '@xgen/types';
import { cn } from '../lib/utils';

const MoreIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="3" r="1.5" fill="currentColor" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <circle cx="8" cy="13" r="1.5" fill="currentColor" />
  </svg>
);

const FolderIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 5.83333V14.1667C2.5 15.0871 3.24619 15.8333 4.16667 15.8333H15.8333C16.7538 15.8333 17.5 15.0871 17.5 14.1667V7.5C17.5 6.57953 16.7538 5.83333 15.8333 5.83333H10L8.33333 4.16667H4.16667C3.24619 4.16667 2.5 4.91286 2.5 5.83333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const badgeVariantClasses: Record<string, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
  default: 'bg-gray-100 text-gray-600',
  secondary: 'bg-gray-100 text-gray-500',
  primary: 'bg-primary/10 text-primary',
};

export function ResourceCard<T = unknown>({
  id,
  data,
  title,
  description,
  errorMessage,
  thumbnail,
  badges,
  metadata,
  primaryActions,
  dropdownActions,
  selectable,
  selected,
  onClick,
  onDoubleClick,
  onSelect,
  inactive,
  inactiveMessage,
  className,
}: ResourceCardProps<T>): React.ReactElement {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-card-actions]') || target.closest('[data-card-checkbox]')) return;
      if (selectable && onSelect) {
        onSelect(id, !selected);
      } else if (onClick) {
        onClick(data);
      }
    },
    [id, data, selectable, selected, onClick, onSelect]
  );

  const handleCardDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (inactive || selectable) return;
      const target = e.target as HTMLElement;
      if (target.closest('[data-card-actions]')) return;
      if (onDoubleClick) {
        e.preventDefault();
        e.stopPropagation();
        onDoubleClick(data);
      }
    },
    [data, inactive, selectable, onDoubleClick]
  );

  const handleActionClick = useCallback((action: CardActionButton, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!action.disabled) action.onClick();
  }, []);

  const handleDropdownItemClick = useCallback((item: CardDropdownItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.disabled) {
      item.onClick();
      setMenuOpen(false);
    }
  }, []);

  const renderThumbnail = () => {
    if (!thumbnail) {
      return (
        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-gray-100 text-muted-foreground">
          <FolderIcon />
        </div>
      );
    }

    return (
      <div
        className="flex items-center justify-center h-10 w-10 rounded-md overflow-hidden shrink-0"
        style={{
          backgroundColor: thumbnail.backgroundColor || undefined,
          color: thumbnail.iconColor || undefined,
        }}
      >
        {thumbnail.imageUrl ? (
          <img src={thumbnail.imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : thumbnail.icon ? (
          thumbnail.icon
        ) : (
          <FolderIcon />
        )}
      </div>
    );
  };

  const renderBadges = () => {
    if (!badges || badges.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1">
        {badges.map((badge, index) => (
          <span
            key={`${badge.text}-${index}`}
            className={cn('px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase', badgeVariantClasses[badge.variant] || badgeVariantClasses.default)}
            title={badge.tooltip}
          >
            {badge.text}
          </span>
        ))}
      </div>
    );
  };

  const renderMetadata = () => {
    if (!metadata || metadata.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {metadata.map((meta, index) => (
          <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground" title={meta.tooltip || String(meta.value)}>
            {meta.icon}
            {meta.label && <span>{meta.label}:</span>}
            <span>{meta.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderActions = () => {
    if (inactive) {
      return (
        <div data-card-actions className="pt-2 border-t border-border mt-2">
          <div className="text-xs text-muted-foreground italic">{inactiveMessage || '비활성 상태'}</div>
        </div>
      );
    }

    const hasPrimary = primaryActions && primaryActions.length > 0;
    const hasDropdown = dropdownActions && dropdownActions.length > 0;
    if (!hasPrimary && !hasDropdown) return null;

    return (
      <div data-card-actions className="flex items-center justify-between pt-2 border-t border-border mt-2">
        <div className="flex items-center gap-1">
          {primaryActions?.map((action) => (
            <button
              key={action.id}
              className={cn(
                'p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors',
                action.disabled && 'opacity-40 cursor-not-allowed',
              )}
              title={action.disabled ? action.disabledMessage : action.label}
              disabled={action.disabled}
              onClick={(e) => handleActionClick(action, e)}
            >
              {action.icon}
            </button>
          ))}
        </div>

        <div className="flex items-center">
          {hasDropdown && (
            <div ref={dropdownRef} className="relative">
              <button
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors"
                title="더보기"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              >
                <MoreIcon />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                  <div className="absolute right-0 bottom-full mb-1 z-50 min-w-[160px] rounded-md border border-border bg-popover shadow-lg py-1">
                    {dropdownActions!.map((item, index) => (
                      <React.Fragment key={item.id}>
                        {item.dividerBefore && index > 0 && <div className="h-px bg-border my-1" />}
                        <button
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors',
                            item.danger ? 'text-error hover:bg-error/5' : 'text-foreground hover:bg-gray-50',
                            item.disabled && 'opacity-50 cursor-not-allowed',
                          )}
                          disabled={item.disabled}
                          onClick={(e) => handleDropdownItemClick(item, e)}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const isClickable = onClick || (selectable && onSelect);

  return (
    <div
      className={cn(
        'relative rounded-lg border border-border bg-card p-4 transition-all',
        selected && 'ring-2 ring-primary border-primary',
        isClickable && 'cursor-pointer hover:shadow-md',
        inactive && 'opacity-60',
        menuOpen && 'z-10',
        className,
      )}
      onClick={handleCardClick}
      onDoubleClick={handleCardDoubleClick}
      data-card-id={id}
    >
      {selectable && (
        <div data-card-checkbox className="absolute top-3 right-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect?.(id, !selected)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
        </div>
      )}

      <div className="flex items-start gap-3 mb-2">
        {renderThumbnail()}
        {renderBadges()}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground line-clamp-1" title={title}>{title}</h3>
        {description && <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>}
        {errorMessage && <p className="text-xs text-error">오류: {errorMessage}</p>}
        {renderMetadata()}
      </div>

      {renderActions()}
    </div>
  );
}

export default ResourceCard;

export type {
  ResourceCardProps,
  CardBadge,
  CardMetaItem,
  CardActionButton,
  CardDropdownItem,
  CardThumbnail,
} from '@xgen/types';