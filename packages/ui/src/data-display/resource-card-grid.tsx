'use client';

import React, { useCallback, useMemo } from 'react';
import type { ResourceCardProps, ResourceCardGridProps } from '@xgen/types';
import { ResourceCard } from './resource-card';
import { EmptyState } from '../feedback/empty-state';
import { cn } from '../lib/utils';

const EmptyIcon: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 12V36C8 38.2091 9.79086 40 12 40H36C38.2091 40 40 38.2091 40 36V16C40 13.7909 38.2091 12 36 12H26L22 8H12C9.79086 8 8 9.79086 8 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 20V32M18 26H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const columnClasses: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

export function ResourceCardGrid<T = unknown>({
  items,
  loading,
  showEmptyState = true,
  emptyStateProps,
  multiSelectMode = false,
  selectedIds = [],
  onSelectionChange,
  columns = 'auto',
  className,
}: ResourceCardGridProps<T>): React.ReactElement {
  const handleSelect = useCallback(
    (id: string, isSelected: boolean) => {
      if (!onSelectionChange) return;
      if (isSelected) {
        onSelectionChange([...selectedIds, id]);
      } else {
        onSelectionChange(selectedIds.filter((sid) => sid !== id));
      }
    },
    [selectedIds, onSelectionChange]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (items.length === 0 && showEmptyState) {
    return (
      <EmptyState
        icon={emptyStateProps?.icon || <EmptyIcon />}
        title={emptyStateProps?.title || '항목이 없습니다'}
        description={emptyStateProps?.description}
        action={emptyStateProps?.action}
      />
    );
  }

  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 'auto'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : columnClasses[columns as number] || 'grid-cols-3',
        className,
      )}
    >
      {items.map((item) => (
        <ResourceCard
          key={item.id}
          {...item}
          selectable={multiSelectMode}
          selected={selectedIds.includes(item.id)}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}

export default ResourceCardGrid;

export type { ResourceCardGridProps } from '@xgen/types';