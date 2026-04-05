'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { CardBadge, PromptTabPluginProps } from '@xgen/types';
import { Button, EmptyState, ResourceCardGrid, FilterTabs, SearchInput, useToast } from '@xgen/ui';
import { FiEdit2, FiCopy, FiTrash2, FiUpload, FiUser, FiClock, FiRefreshCw, FiFileText, FiPlus, FiHash } from '@xgen/icons';
import { useTranslation } from '@xgen/i18n';
import { useAuth } from '@xgen/auth-provider';
import { listPrompts, deletePrompt, createPrompt, uploadToPromptStore } from './api';
import type { PromptDetail } from './api';
import { PromptCreateModal } from './prompt-create-modal';
import { PromptEditModal } from './prompt-edit-modal';
import { PromptDetailModal } from './prompt-detail-modal';
import './locales';

// ─────────────────────────────────────────────────────────────
// Constants & Helpers
// ─────────────────────────────────────────────────────────────

type TypeFilter = 'all' | 'system' | 'user' | 'template';
type OwnerFilter = 'all' | 'personal' | 'shared';

const TYPE_BADGE_VARIANT: Record<string, CardBadge['variant']> = {
  system: 'info',
  user: 'primary',
  template: 'warning',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\. /g, '. ');
}

// ─────────────────────────────────────────────────────────────
// PromptStorage Component
// ─────────────────────────────────────────────────────────────

export interface PromptStorageProps extends PromptTabPluginProps {}

export const PromptStorage: React.FC<PromptStorageProps> = ({ onNavigate, onSubToolbarChange }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isInitialized } = useAuth();

  // State
  const [prompts, setPrompts] = useState<PromptDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptDetail | null>(null);
  const [detailPrompt, setDetailPrompt] = useState<PromptDetail | null>(null);

  // Load prompts
  const fetchPrompts = useCallback(async () => {
    if (!isInitialized) return;

    try {
      setLoading(true);
      setError(null);
      const data = await listPrompts();
      setPrompts(data);
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
      setError(t('promptManagementStorage.error.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [isInitialized, t]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const isOwner = useCallback(
    (userId?: string): boolean => {
      if (!isInitialized || !user) return false;
      if (userId === undefined || userId === null) return false;
      return String(user.id) === String(userId);
    },
    [isInitialized, user],
  );

  // Filter prompts
  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      if (typeFilter === 'template') {
        if (!prompt.isTemplate) return false;
      } else if (typeFilter !== 'all') {
        if (prompt.type !== typeFilter) return false;
      }
      if (ownerFilter === 'personal' && prompt.isPublic) return false;
      if (ownerFilter === 'shared' && !prompt.isPublic) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = prompt.title.toLowerCase().includes(q);
        const matchesContent = prompt.content.toLowerCase().includes(q);
        const matchesAuthor = prompt.author.toLowerCase().includes(q);
        const matchesVars = prompt.variables.some((v) => v.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesAuthor && !matchesVars) return false;
      }
      return true;
    });
  }, [prompts, typeFilter, ownerFilter, searchTerm]);

  // Handlers
  const handleDelete = useCallback(
    async (prompt: PromptDetail) => {
      const ok = await toast.confirm({
        title: t('promptManagementStorage.confirm.deleteTitle'),
        message: t('promptManagementStorage.confirm.delete', { name: prompt.title }),
        variant: 'danger',
        confirmText: t('promptManagementStorage.confirm.confirmDelete'),
        cancelText: t('promptManagementStorage.confirm.cancel'),
      });
      if (!ok) return;

      try {
        await deletePrompt(prompt.uid);
        toast.success(t('promptManagementStorage.messages.deleteSuccess', { name: prompt.title }));
        await fetchPrompts();
      } catch (err) {
        console.error('Failed to delete prompt:', err);
        toast.error(t('promptManagementStorage.messages.deleteFailed', { name: prompt.title }));
      }
    },
    [fetchPrompts, t, toast],
  );

  const handleDuplicate = useCallback(
    async (prompt: PromptDetail) => {
      try {
        // Incremental naming: "Title" → "Title 2" → "Title 3"
        const baseTitle = prompt.title.replace(/\s+\d+$/, '');
        const existingNumbers = prompts
          .filter((p) => p.title === baseTitle || p.title.match(new RegExp(`^${baseTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+\\d+$`)))
          .map((p) => {
            const match = p.title.match(/\s+(\d+)$/);
            return match ? parseInt(match[1], 10) : 1;
          });
        const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 2;
        const newTitle = `${baseTitle} ${nextNumber}`;

        await createPrompt({
          prompt_title: newTitle,
          prompt_content: prompt.content,
          public_available: false,
          language: prompt.language,
          prompt_type: prompt.type,
        });
        toast.success(t('promptManagementStorage.messages.duplicateSuccess', { name: newTitle }));
        await fetchPrompts();
      } catch (err) {
        console.error('Failed to duplicate prompt:', err);
        toast.error(t('promptManagementStorage.messages.duplicateFailed'));
      }
    },
    [fetchPrompts, prompts, t, toast],
  );

  const handleUploadToStore = useCallback(
    async (prompt: PromptDetail) => {
      try {
        await uploadToPromptStore(prompt.keyValue);
        toast.success(t('promptManagementStorage.messages.uploadSuccess', { name: prompt.title }));
      } catch (err) {
        console.error('Failed to upload to store:', err);
        toast.error(t('promptManagementStorage.messages.uploadFailed'));
      }
    },
    [t, toast],
  );

  // Filter tabs
  const typeTabs = useMemo(() => [
    { key: 'all', label: t('promptManagementStorage.filter.all'), count: prompts.length },
    { key: 'system', label: t('promptManagementStorage.filter.system'), count: prompts.filter((p) => p.type === 'system').length },
    { key: 'user', label: t('promptManagementStorage.filter.user'), count: prompts.filter((p) => p.type === 'user').length },
    { key: 'template', label: t('promptManagementStorage.filter.template'), count: prompts.filter((p) => p.isTemplate).length },
  ], [prompts, t]);

  const ownerTabs = [
    { key: 'all', label: t('promptManagementStorage.owner.all') },
    { key: 'personal', label: t('promptManagementStorage.owner.personal') },
    { key: 'shared', label: t('promptManagementStorage.owner.shared') },
  ];

  // Build card items
  const cardItems = useMemo(() => {
    return filteredPrompts.map((prompt) => {
      const badges: CardBadge[] = [
        {
          text: t(`promptManagementStorage.types.${prompt.type}`),
          variant: TYPE_BADGE_VARIANT[prompt.type] || 'default',
        },
      ];

      if (prompt.isTemplate) {
        badges.push({ text: t('promptManagementStorage.badges.template'), variant: 'warning' });
      }
      if (prompt.isPublic) {
        badges.push({ text: t('promptManagementStorage.badges.shared'), variant: 'primary' });
      } else {
        badges.push({ text: t('promptManagementStorage.badges.personal'), variant: 'secondary' });
      }

      const primaryActions = [
        {
          id: 'edit',
          icon: <FiEdit2 />,
          label: t('promptManagementStorage.actions.edit'),
          onClick: () => setEditingPrompt(prompt),
        },
        {
          id: 'copy',
          icon: <FiCopy />,
          label: t('promptManagementStorage.actions.duplicate'),
          onClick: () => handleDuplicate(prompt),
        },
      ];

      const dropdownActions = [
        ...(isOwner(prompt.userId)
          ? [
              {
                id: 'upload',
                icon: <FiUpload />,
                label: t('promptManagementStorage.actions.uploadToStore'),
                onClick: () => handleUploadToStore(prompt),
              },
            ]
          : []),
        ...(isOwner(prompt.userId)
          ? [
              {
                id: 'delete',
                icon: <FiTrash2 />,
                label: t('promptManagementStorage.actions.delete'),
                onClick: () => handleDelete(prompt),
                danger: true,
                dividerBefore: true,
              },
            ]
          : []),
      ];

      const metadata = [
        { icon: <FiUser />, value: prompt.author },
        { icon: <FiClock />, value: formatDate(prompt.updatedAt) },
        ...(prompt.variables.length > 0
          ? [{ icon: <FiHash />, value: prompt.variables.map((v) => `{{${v}}}`).join(', ') }]
          : []),
      ];

      return {
        id: prompt.uid,
        data: prompt,
        title: prompt.title,
        description: prompt.content.length > 120 ? prompt.content.slice(0, 120) + '...' : prompt.content,
        thumbnail: {
          icon: <FiFileText />,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          iconColor: '#3b82f6',
        },
        badges,
        metadata,
        primaryActions,
        dropdownActions,
        onClick: () => setDetailPrompt(prompt),
      };
    });
  }, [filteredPrompts, isOwner, handleDelete, handleDuplicate, handleUploadToStore, t]);

  // Push subToolbar content to orchestrator
  useEffect(() => {
    onSubToolbarChange?.(
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <FilterTabs
            tabs={typeTabs}
            activeKey={typeFilter}
            onChange={(key) => setTypeFilter(key as TypeFilter)}
            variant="underline"
          />
          <FilterTabs
            tabs={ownerTabs}
            activeKey={ownerFilter}
            onChange={(key) => setOwnerFilter(key as OwnerFilter)}
            variant="underline"
          />
        </div>

        <div className="flex items-center gap-2">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('promptManagementStorage.searchPlaceholder')}
            size="sm"
            showClear
          />
          <Button variant="outline" size="sm" onClick={fetchPrompts} disabled={loading}>
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button size="sm" onClick={() => setCreateModalOpen(true)}>
            <FiPlus />
            {t('promptManagementStorage.createNew')}
          </Button>
        </div>
      </div>,
    );
  }, [onSubToolbarChange, typeFilter, ownerFilter, loading, searchTerm, fetchPrompts, t, typeTabs]);

  // Cleanup subToolbar on unmount
  useEffect(() => {
    return () => { onSubToolbarChange?.(null); };
  }, [onSubToolbarChange]);

  return (
    <div className="flex flex-col flex-1 min-h-0 p-6">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {!isInitialized ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            <p>{t('promptManagementStorage.messages.loadingAuth')}</p>
          </div>
        ) : error ? (
          <EmptyState
            icon={<FiFileText />}
            title={t('promptManagementStorage.error.title')}
            description={error}
            action={{
              label: t('promptManagementStorage.buttons.retry'),
              onClick: fetchPrompts,
            }}
          />
        ) : (
          <ResourceCardGrid
            items={cardItems}
            loading={loading}
            showEmptyState
            emptyStateProps={{
              icon: <FiFileText />,
              title: t('promptManagementStorage.empty.title'),
              description: t('promptManagementStorage.empty.description'),
            }}
          />
        )}
      </div>

      {/* Create Modal */}
      <PromptCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchPrompts}
      />

      {/* Edit Modal */}
      {editingPrompt && (
        <PromptEditModal
          isOpen={!!editingPrompt}
          onClose={() => setEditingPrompt(null)}
          onSuccess={fetchPrompts}
          prompt={editingPrompt}
        />
      )}

      {/* Detail Modal */}
      {detailPrompt && (
        <PromptDetailModal
          isOpen={!!detailPrompt}
          onClose={() => setDetailPrompt(null)}
          prompt={detailPrompt}
        />
      )}
    </div>
  );
};

export default PromptStorage;

export const promptStoragePlugin: PromptTabPlugin = {
  id: 'storage',
  name: 'Prompt Storage',
  tabLabelKey: 'promptManagement.tabs.storage',
  order: 1,
  component: PromptStorage,
};
