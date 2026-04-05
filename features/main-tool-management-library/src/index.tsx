'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { CardBadge, ToolTabPlugin, ToolTabPluginProps } from '@xgen/types';
import { Button, EmptyState, ResourceCardGrid, FilterTabs, SearchInput, useToast } from '@xgen/ui';
import {
  FiDownload,
  FiTrash2,
  FiUser,
  FiClock,
  FiStar,
  FiRefreshCw,
  FiTool,
  FiUpload,
} from '@xgen/icons';
import { useTranslation } from '@xgen/i18n';
import { useAuth } from '@xgen/auth-provider';
import {
  listStoreToolsDetail,
  downloadStoreToolToStorage,
  deleteStoreToolUpload,
  rateStoreTool,
} from './api';
import type { StoreTool, StoreToolAPIResponse } from './api';
import { ToolStoreUploadModal } from './tool-store-upload-modal';
import { ToolStoreDetailModal } from './tool-store-detail-modal';
import './locales';

// ─────────────────────────────────────────────────────────────
// Constants & Helpers
// ─────────────────────────────────────────────────────────────

type LibraryFilter = 'all' | 'my';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\. /g, '. ');
}

// ─────────────────────────────────────────────────────────────
// Star Rating Component
// ─────────────────────────────────────────────────────────────

const StarRating: React.FC<{
  rating: number;
  onRate: (value: number) => void;
}> = ({ rating, onRate }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <span
      className="inline-flex gap-0.5 cursor-pointer"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`w-3.5 h-3.5 transition-colors ${
            star <= (hovered || Math.round(rating))
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground'
          }`}
          onMouseEnter={() => setHovered(star)}
          onClick={(e) => {
            e.stopPropagation();
            onRate(star);
          }}
        />
      ))}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────
// ToolLibrary Component
// ─────────────────────────────────────────────────────────────

export interface ToolLibraryProps extends ToolTabPluginProps {}

export const ToolLibrary: React.FC<ToolLibraryProps> = ({ onNavigate, onSubToolbarChange }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isInitialized } = useAuth();

  // State
  const [tools, setTools] = useState<StoreTool[]>([]);
  const [rawToolsMap, setRawToolsMap] = useState<Record<string, StoreToolAPIResponse>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [detailTool, setDetailTool] = useState<StoreTool | null>(null);

  // Optimistic ratings
  const [optimisticRatings, setOptimisticRatings] = useState<Record<string, number>>({});

  // Load tools
  const fetchTools = useCallback(
    async (silent = false) => {
      if (!isInitialized) return;

      try {
        if (!silent) setLoading(true);
        setError(null);
        const data = await listStoreToolsDetail();
        setTools(data);
      } catch (err) {
        console.error('Failed to fetch store tools:', err);
        setError(t('toolManagementLibrary.error.loadFailed'));
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [isInitialized, t],
  );

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  // Also fetch raw data for detail modal
  useEffect(() => {
    const fetchRaw = async () => {
      if (!isInitialized) return;
      try {
        const { createApiClient } = await import('@xgen/api-client');
        const api = createApiClient();
        const resp = await api.get<{ tools: StoreToolAPIResponse[] }>('/api/tools/store/list/detail');
        const map: Record<string, StoreToolAPIResponse> = {};
        for (const t of resp.data.tools || []) {
          map[t.function_upload_id] = t;
        }
        setRawToolsMap(map);
      } catch {
        // Non-critical — detail modal will still work without raw data
      }
    };
    fetchRaw();
  }, [isInitialized, tools]);

  const isOwner = useCallback(
    (userId?: number): boolean => {
      if (!isInitialized || !user) return false;
      if (userId === undefined || userId === null) return false;
      return Number(user.id) === Number(userId);
    },
    [isInitialized, user],
  );

  // Filter & search
  const filteredTools = useMemo(() => {
    let result = tools;

    if (filter === 'my') {
      result = result.filter((tool) => isOwner(tool.userId));
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (tool) =>
          tool.name.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q) ||
          tool.author.toLowerCase().includes(q) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [tools, filter, isOwner, searchTerm]);

  // ── Handlers ──

  const handleDownload = useCallback(
    async (tool: StoreTool) => {
      const ok = await toast.confirm({
        title: t('toolManagementLibrary.confirm.downloadTitle'),
        message: t('toolManagementLibrary.confirm.downloadMessage', { name: tool.name }),
        variant: 'info',
        confirmText: t('toolManagementLibrary.actions.download'),
      });
      if (!ok) return;

      try {
        await downloadStoreToolToStorage(tool.keyValue, tool.uploadId);
        toast.success(t('toolManagementLibrary.messages.downloadSuccess'));
      } catch (err) {
        console.error('Failed to download tool:', err);
        toast.error(
          err instanceof Error
            ? err.message
            : t('toolManagementLibrary.messages.downloadFailed'),
        );
      }
    },
    [toast, t],
  );

  const handleDelete = useCallback(
    async (tool: StoreTool) => {
      const ok = await toast.confirm({
        title: t('toolManagementLibrary.confirm.deleteTitle'),
        message: t('toolManagementLibrary.confirm.delete', { name: tool.name }),
        variant: 'danger',
        confirmText: t('toolManagementLibrary.actions.delete'),
      });
      if (!ok) return;

      try {
        await deleteStoreToolUpload(tool.uploadId);
        toast.success(t('toolManagementLibrary.messages.deleteSuccess'));
        await fetchTools();
      } catch (err) {
        console.error('Failed to delete store tool:', err);
        toast.error(
          err instanceof Error
            ? err.message
            : t('toolManagementLibrary.messages.deleteFailed'),
        );
      }
    },
    [fetchTools, toast, t],
  );

  const handleRate = useCallback(
    async (tool: StoreTool, rating: number) => {
      if (!user) {
        toast.error(t('toolManagementLibrary.messages.loginRequired'));
        return;
      }

      // Optimistic update
      setOptimisticRatings((prev) => ({ ...prev, [tool.uploadId]: rating }));

      try {
        await rateStoreTool(tool.keyValue, Number(user.id), tool.uploadId, rating);
        toast.success(t('toolManagementLibrary.messages.rateSuccess', { rating }));
        await fetchTools(true);
        setOptimisticRatings((prev) => {
          const next = { ...prev };
          delete next[tool.uploadId];
          return next;
        });
      } catch (err) {
        // Rollback
        setOptimisticRatings((prev) => {
          const next = { ...prev };
          delete next[tool.uploadId];
          return next;
        });
        console.error('Failed to rate tool:', err);
        toast.error(
          err instanceof Error
            ? err.message
            : t('toolManagementLibrary.messages.rateFailed'),
        );
      }
    },
    [user, fetchTools, toast, t],
  );

  // Upload success handler
  const handleUploadSuccess = useCallback(() => {
    fetchTools();
  }, [fetchTools]);

  // Filter tabs
  const filterTabs = [
    { key: 'all', label: t('toolManagementLibrary.filter.all') },
    { key: 'my', label: t('toolManagementLibrary.filter.my') },
  ];

  // Build card items
  const cardItems = useMemo(() => {
    return filteredTools.map((tool) => {
      const badges: CardBadge[] = [
        { text: t('toolManagementLibrary.badges.tool'), variant: 'primary' },
      ];

      const currentRating =
        optimisticRatings[tool.uploadId] !== undefined
          ? optimisticRatings[tool.uploadId]
          : tool.ratingAvg;

      const ratingText =
        tool.ratingCount > 0
          ? t('toolManagementLibrary.card.rating', {
              rating: currentRating.toFixed(1),
              count: tool.ratingCount,
            })
          : t('toolManagementLibrary.card.noRating');

      const primaryActions = [
        {
          id: 'download',
          icon: <FiDownload />,
          label: t('toolManagementLibrary.actions.download'),
          onClick: () => handleDownload(tool),
        },
      ];

      const dropdownActions = isOwner(tool.userId)
        ? [
            {
              id: 'delete',
              icon: <FiTrash2 />,
              label: t('toolManagementLibrary.actions.delete'),
              onClick: () => handleDelete(tool),
              danger: true,
            },
          ]
        : [];

      return {
        id: tool.uploadId,
        data: tool,
        title: tool.name,
        description: tool.description,
        thumbnail: {
          icon: <FiTool />,
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          iconColor: '#8b5cf6',
        },
        badges,
        metadata: [
          { icon: <FiUser />, value: tool.author },
          { icon: <FiClock />, value: formatDate(tool.createdAt) },
          { icon: <FiStar />, value: ratingText },
          ...(tool.apiMethod ? [{ value: tool.apiMethod }] : []),
          ...(tool.parameterCount > 0
            ? [{ value: t('toolManagementLibrary.card.params', { count: tool.parameterCount }) }]
            : []),
        ],
        primaryActions,
        dropdownActions,
        onClick: () => setDetailTool(tool),
      };
    });
  }, [filteredTools, isOwner, optimisticRatings, handleDownload, handleDelete, handleRate, t]);

  // Push subToolbar content to orchestrator
  useEffect(() => {
    onSubToolbarChange?.(
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <FilterTabs
            tabs={filterTabs}
            activeKey={filter}
            onChange={(key) => setFilter(key as LibraryFilter)}
            variant="underline"
          />
        </div>

        <div className="flex items-center gap-2">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('toolManagementLibrary.search.placeholder')}
            size="sm"
            showClear
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            title={t('toolManagementLibrary.upload.title')}
          >
            <FiUpload />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTools()}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>,
    );
  }, [onSubToolbarChange, filter, loading, searchTerm, fetchTools, t]);

  // Cleanup subToolbar on unmount
  useEffect(() => {
    return () => {
      onSubToolbarChange?.(null);
    };
  }, [onSubToolbarChange]);

  return (
    <div className="flex flex-col flex-1 min-h-0 p-6">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {!isInitialized ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            <p>{t('toolManagementLibrary.messages.loadingAuth')}</p>
          </div>
        ) : error ? (
          <EmptyState
            icon={<FiTool />}
            title={t('toolManagementLibrary.error.title')}
            description={error}
            action={{
              label: t('toolManagementLibrary.buttons.retry'),
              onClick: fetchTools,
            }}
          />
        ) : (
          <ResourceCardGrid
            items={cardItems}
            loading={loading}
            showEmptyState
            emptyStateProps={{
              icon: <FiTool />,
              title: t('toolManagementLibrary.empty.title'),
              description: t('toolManagementLibrary.empty.description'),
            }}
          />
        )}
      </div>

      {/* Upload Modal */}
      <ToolStoreUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Detail Modal */}
      {detailTool && (
        <ToolStoreDetailModal
          tool={detailTool}
          rawData={rawToolsMap[detailTool.uploadId] ?? null}
          isOpen={!!detailTool}
          onClose={() => setDetailTool(null)}
          onDownload={(tool) => {
            setDetailTool(null);
            handleDownload(tool);
          }}
        />
      )}
    </div>
  );
};

export default ToolLibrary;

export const toolLibraryPlugin: ToolTabPlugin = {
  id: 'library',
  name: 'Tool Library',
  tabLabelKey: 'toolStorage.tabs.library',
  order: 2,
  component: ToolLibrary,
};
