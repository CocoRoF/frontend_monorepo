'use client';

import React from 'react';
import type { TopWorkflowItem } from '../types';
import { useTranslation } from '@xgen/i18n';
import { Button } from '@xgen/ui';
import { FiChevronRight } from '@xgen/icons';

interface TopWorkflowsSectionProps {
  workflows: TopWorkflowItem[];
  onViewAll?: () => void;
}

export const TopWorkflowsSection: React.FC<TopWorkflowsSectionProps> = ({
  workflows,
  onViewAll,
}) => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground m-0">
          {t('dashboard.topWorkflows')}
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
        {workflows.length === 0 ? (
          <div className="flex items-center px-6 py-4">
            <span className="text-sm text-foreground">
              {t('dashboard.noWorkflows')}
            </span>
          </div>
        ) : (
          workflows.map((workflow, index) => (
            <div key={workflow.id} className="flex items-center px-6 py-4 border-b border-border last:border-b-0">
              <span className="w-6 h-6 flex items-center justify-center bg-muted rounded-full text-xs font-bold text-muted-foreground mr-4">{index + 1}</span>
              <span
                className={`text-sm ${workflow.isLink ? 'text-primary cursor-pointer hover:underline' : 'text-foreground'}`}
                onClick={workflow.onClick}
              >
                {workflow.name}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default TopWorkflowsSection;
