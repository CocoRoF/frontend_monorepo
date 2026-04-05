'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { AdminFeatureModule, RouteComponentProps } from '@xgen/types';
import { ContentArea, DataTable, StatCard, Button } from '@xgen/ui';
import type { DataTableColumn } from '@xgen/ui';
import { useTranslation } from '@xgen/i18n';
import { FiRefreshCw, FiPlus, FiX } from '@xgen/icons';
import {
  getCrawlerSessions,
  createCrawlerSession,
  cancelCrawlerSession,
} from '@xgen/api-client';
import type { CrawlerSessionSummary, CrawlerSessionStatus } from '@xgen/api-client';

const STATUS_COLORS: Record<CrawlerSessionStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  running: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const AdminDataScraperPage: React.FC<RouteComponentProps> = () => {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<CrawlerSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [seedUrl, setSeedUrl] = useState('');
  const [maxPages, setMaxPages] = useState(100);
  const [creating, setCreating] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCrawlerSessions();
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const stats = useMemo(() => {
    const total = sessions.length;
    const active = sessions.filter((s) => s.status === 'running').length;
    const processed = sessions.reduce((sum, s) => sum + s.processed_pages, 0);
    const pending = sessions.reduce((sum, s) => sum + s.pending_pages, 0);
    const completed = sessions.filter((s) => s.status === 'completed');
    const successRate =
      completed.length > 0
        ? ((completed.length / Math.max(total, 1)) * 100).toFixed(1)
        : '0.0';
    return { total, active, processed, pending, successRate };
  }, [sessions]);

  const handleCreate = useCallback(async () => {
    if (!seedUrl.trim()) return;
    setCreating(true);
    try {
      await createCrawlerSession({ seed_url: seedUrl, max_pages: maxPages });
      setSeedUrl('');
      setShowCreate(false);
      fetchSessions();
    } catch {
      // error handled silently
    } finally {
      setCreating(false);
    }
  }, [seedUrl, maxPages, fetchSessions]);

  const handleCancel = useCallback(
    async (sessionId: string) => {
      try {
        await cancelCrawlerSession(sessionId);
        fetchSessions();
      } catch {
        // error handled silently
      }
    },
    [fetchSessions],
  );

  const statCards = [
    { label: t('admin.pages.dataScraper.totalSessions', 'Total Sessions'), value: stats.total },
    { label: t('admin.pages.dataScraper.activeSessions', 'Active'), value: stats.active },
    { label: t('admin.pages.dataScraper.processedPages', 'Processed Pages'), value: stats.processed },
    { label: t('admin.pages.dataScraper.pendingPages', 'Pending Pages'), value: stats.pending },
    { label: t('admin.pages.dataScraper.successRate', 'Success Rate'), value: `${stats.successRate}%` },
  ];

  /* ── DataTable columns ── */
  const columns: DataTableColumn<CrawlerSessionSummary>[] = useMemo(() => [
    {
      id: 'seed_url',
      header: t('admin.pages.dataScraper.url', 'URL'),
      cell: (row) => <span className="max-w-64 truncate block font-mono text-xs">{row.seed_url}</span>,
    },
    {
      id: 'status',
      header: t('common.status', 'Status'),
      field: 'status' as keyof CrawlerSessionSummary,
      cell: (row) => (
        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[row.status]}`}>
          {row.status}
        </span>
      ),
    },
    {
      id: 'processed_pages',
      header: t('admin.pages.dataScraper.processed', 'Processed'),
      field: 'processed_pages' as keyof CrawlerSessionSummary,
      sortable: true,
      cell: (row) => <span className="text-right block">{row.processed_pages}</span>,
    },
    {
      id: 'pending_pages',
      header: t('admin.pages.dataScraper.pending', 'Pending'),
      field: 'pending_pages' as keyof CrawlerSessionSummary,
      sortable: true,
      cell: (row) => <span className="text-right block">{row.pending_pages}</span>,
    },
    {
      id: 'created_at',
      header: t('common.createdAt', 'Created'),
      field: 'created_at' as keyof CrawlerSessionSummary,
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(row.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions', 'Actions'),
      cell: (row) => (
        <div className="text-center">
          {row.status === 'running' && (
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleCancel(row.session_id); }}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
          )}
          {row.error && (
            <span className="text-xs text-red-500" title={row.error}>⚠</span>
          )}
        </div>
      ),
    },
  ], [t, handleCancel]);

  return (
    <ContentArea
      title={t('admin.pages.dataScraper.title', 'Data Scraper')}
      description={t('admin.pages.dataScraper.description', 'Manage web scraping sessions')}
      headerActions={
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreate(true)}
            leftIcon={<FiPlus className="w-4 h-4" />}
          >
            {t('admin.pages.dataScraper.newSession', 'New Session')}
          </Button>
          <Button variant="outline" size="icon" onClick={fetchSessions} disabled={loading}>
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 max-lg:grid-cols-3 max-sm:grid-cols-2 mb-6">
        {statCards.map(({ label, value }, idx) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            variant={(['info', 'success', 'neutral', 'warning', 'error'] as const)[idx] ?? 'neutral'}
            loading={loading}
          />
        ))}
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="p-4 rounded-xl border border-border bg-card mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              {t('admin.pages.dataScraper.createSession', 'Create Session')}
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
              <FiX className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">
                {t('admin.pages.dataScraper.seedUrl', 'Seed URL')}
              </label>
              <input
                type="url"
                value={seedUrl}
                onChange={(e) => setSeedUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="w-32">
              <label className="text-xs text-muted-foreground mb-1 block">
                {t('admin.pages.dataScraper.maxPages', 'Max Pages')}
              </label>
              <input
                type="number"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
              disabled={creating || !seedUrl.trim()}
            >
              {creating ? t('common.creating', 'Creating...') : t('common.create', 'Create')}
            </Button>
          </div>
        </div>
      )}

      {/* Session List */}
      <DataTable
        data={sessions}
        columns={columns}
        rowKey={(row) => row.session_id}
        loading={loading}
        emptyMessage={t('admin.pages.dataScraper.noSessions', 'No scraping sessions')}
      />
    </ContentArea>
  );
};

const feature: AdminFeatureModule = {
  id: 'admin-data-scraper',
  name: 'AdminDataScraperPage',
  adminSection: 'admin-data',
  routes: {
    'admin-data-scraper': AdminDataScraperPage,
  },
};

export default feature;
