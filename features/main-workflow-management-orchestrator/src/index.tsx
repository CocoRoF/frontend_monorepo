'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { RouteComponentProps, MainFeatureModule } from '@xgen/types';
import { FeatureRegistry } from '@xgen/types';
import { ContentArea, FilterTabs } from '@xgen/ui';
import { useTranslation } from '@xgen/i18n';
import './locales';

// ─────────────────────────────────────────────────────────────
// WorkflowsPage — Tab Orchestrator (Registry 기반)
// ─────────────────────────────────────────────────────────────

interface WorkflowsPageProps extends RouteComponentProps {
  onNavigate?: (sectionId: string) => void;
}

const WorkflowsPage: React.FC<WorkflowsPageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  const plugins = useMemo(() => FeatureRegistry.getWorkflowTabPlugins(), []);
  const [activeTab, setActiveTab] = useState(plugins[0]?.id ?? '');
  const [subToolbarContent, setSubToolbarContent] = useState<React.ReactNode>(null);

  const tabs = useMemo(
    () => plugins.map((p) => ({ key: p.id, label: t(p.tabLabelKey) })),
    [plugins, t],
  );

  const ActiveComponent = useMemo(
    () => plugins.find((p) => p.id === activeTab)?.component,
    [plugins, activeTab],
  );

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key);
    setSubToolbarContent(null);
  }, []);

  const handleSubToolbarChange = useCallback((content: React.ReactNode) => {
    setSubToolbarContent(content);
  }, []);

  return (
    <ContentArea
      title={t('workflows.title')}
      description={t('workflows.description')}
      toolbar={
        <FilterTabs
          tabs={tabs}
          activeKey={activeTab}
          onChange={handleTabChange}
        />
      }
      subToolbar={subToolbarContent}
      contentPadding={false}
      contentClassName="flex flex-col"
    >
      {ActiveComponent && (
        <ActiveComponent
          onNavigate={onNavigate}
          onSubToolbarChange={handleSubToolbarChange}
        />
      )}
    </ContentArea>
  );
};

// ─────────────────────────────────────────────────────────────
// Feature Export
// ─────────────────────────────────────────────────────────────

export const mainWorkflowsFeature: MainFeatureModule = {
  id: 'main-workflow-management-orchestrator',
  name: 'Workflow Management',
  sidebarSection: 'workflow',
  sidebarItems: [
    {
      id: 'workflows',
      titleKey: 'sidebar.workflow.workflows.title',
      descriptionKey: 'sidebar.workflow.workflows.description',
    },
  ],
  routes: {
    workflows: WorkflowsPage,
  },
};

export default mainWorkflowsFeature;
export { WorkflowsPage };
