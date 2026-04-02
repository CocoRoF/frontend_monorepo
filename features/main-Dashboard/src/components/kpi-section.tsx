'use client';

import React from 'react';
import type { DashboardOverview } from '../types';
import { useTranslation } from '@xgen/i18n';

interface KpiSectionProps {
  overview: DashboardOverview;
}

const kpiBorderColors: Record<string, string> = {
  total: 'border-l-primary',
  normal: 'border-l-green-500',
  paused: 'border-l-yellow-500',
  error: 'border-l-red-500',
};

export const KpiSection: React.FC<KpiSectionProps> = ({ overview }) => {
  const { t } = useTranslation();

  const kpis = [
    { key: 'total', value: overview.total },
    { key: 'normal', value: overview.normal },
    { key: 'paused', value: overview.paused },
    { key: 'error', value: overview.error },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground m-0">
          {t('dashboard.workplaceOverview')}
        </h2>
        {overview.updatedAt && (
          <span className="text-sm text-muted-foreground/60">
            {t('dashboard.lastUpdated', { time: overview.updatedAt })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {kpis.map(({ key, value }) => (
          <div key={key} className={`flex flex-col gap-1 p-6 bg-white rounded-xl shadow-md border-l-4 ${kpiBorderColors[key]}`}>
            <p className="text-sm text-muted-foreground m-0">
              {t(`dashboard.kpi.${key}`)}
            </p>
            <p className="text-3xl font-bold text-foreground m-0">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default KpiSection;
