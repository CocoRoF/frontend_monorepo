'use client';

import React from 'react';
import type { LatestUpdateItem } from '../types';
import { useTranslation } from '@xgen/i18n';
import { Button } from '@xgen/ui';
import { FiChevronRight } from '@xgen/icons';

interface LatestUpdatesSectionProps {
  updates: LatestUpdateItem[];
  onViewAll?: () => void;
}

export const LatestUpdatesSection: React.FC<LatestUpdatesSectionProps> = ({
  updates,
  onViewAll,
}) => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground m-0">
          {t('dashboard.latestUpdates')}
        </h3>
        {onViewAll && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAll}
            rightIcon={<FiChevronRight />}
          >
            {t('common.viewAll')}
          </Button>
        )}
      </div>

      <div className="flex flex-col">
        {updates.length === 0 ? (
          <div className="flex items-center px-6 py-4">
            <span className="text-sm text-foreground">
              {t('dashboard.noUpdates')}
            </span>
          </div>
        ) : (
          updates.map((update) => (
            <div key={update.id} className="flex items-center px-6 py-4 border-b border-border last:border-b-0">
              <span className="text-sm text-muted-foreground/60 mr-2 shrink-0">{update.prefix}</span>
              <span
                className={`text-sm ${update.isLink ? 'text-primary cursor-pointer hover:underline' : 'text-foreground'}`}
                onClick={update.onClick}
              >
                {update.text}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default LatestUpdatesSection;
