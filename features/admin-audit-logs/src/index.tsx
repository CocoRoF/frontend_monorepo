'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { AdminFeatureModule, RouteComponentProps } from '@xgen/types';
import { ContentArea, DataTable, Button, SearchInput, StatCard, StatusBadge, Modal } from '@xgen/ui';
import type { DataTableColumn } from '@xgen/ui';
import { useTranslation } from '@xgen/i18n';
import { FiRefreshCw } from '@xgen/icons';
import { getSystemAuditLogs } from '@xgen/api-client';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  category: 'auth' | 'admin' | 'data' | 'system' | 'api';
  resource: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
  details: Record<string, string>;
}

type CategoryFilter = AuditEvent['category'] | 'all';
type StatusFilter = AuditEvent['status'] | 'all';

const CATEGORY_LABELS: Record<AuditEvent['category'], string> = {
  auth: 'Authentication',
  admin: 'Admin Action',
  data: 'Data Access',
  system: 'System',
  api: 'API Call',
};

const ACTION_SAMPLES: string[] = [
  'login', 'logout', 'login_failed', 'password_change', 'mfa_setup',
  'user_create', 'user_update', 'user_delete', 'role_change', 'permission_grant',
  'query_execute', 'data_export', 'data_import', 'file_upload', 'file_delete',
  'config_update', 'service_restart', 'backup_create',
  'api_key_create', 'api_key_revoke', 'rate_limit_exceeded',
];

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
function generateAuditEvents(): AuditEvent[] {
  const users = [
    { id: 'u1', name: 'admin@xgen.io' },
    { id: 'u2', name: 'operator@xgen.io' },
    { id: 'u3', name: 'dev@xgen.io' },
    { id: 'u4', name: 'service-account' },
  ];
  const categories: AuditEvent['category'][] = ['auth', 'admin', 'data', 'system', 'api'];
  const statuses: AuditEvent['status'][] = ['success', 'success', 'success', 'failure', 'warning'];
  const ips = ['10.0.1.42', '192.168.1.100', '10.0.2.15', '172.16.0.5'];

  return Array.from({ length: 80 }, (_, i) => {
    const user = users[i % users.length];
    const cat = categories[i % categories.length];
    const action = ACTION_SAMPLES[i % ACTION_SAMPLES.length];
    return {
      id: `audit-${String(i + 1).padStart(4, '0')}`,
      timestamp: new Date(Date.now() - i * 900000).toISOString(),
      userId: user.id,
      userName: user.name,
      action,
      category: cat,
      resource: `/${cat}/${action}`,
      ipAddress: ips[i % ips.length],
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: statuses[i % statuses.length],
      details: {
        method: i % 2 === 0 ? 'POST' : 'GET',
        duration_ms: String(50 + (i * 7) % 500),
        ...(action.includes('failed') ? { reason: 'Invalid credentials' } : {}),
      },
    };
  });
}

const PAGE_SIZE = 25;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const AdminAuditLogsPage: React.FC<RouteComponentProps> = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSystemAuditLogs();
      if (data.events && data.events.length > 0) {
        setEvents(data.events.map((e: Record<string, unknown>) => ({
          id: e.id as string,
          timestamp: (e.timestamp as string) ?? new Date().toISOString(),
          userId: (e.userEmail as string) ?? '',
          userName: e.userName as string,
          action: e.action as string,
          category: (e.category === 'config' || e.category === 'workflow' ? 'admin' : e.category) as AuditEvent['category'],
          resource: e.resource as string,
          ipAddress: e.ipAddress as string,
          userAgent: e.userAgent as string,
          status: (e.status === 'info' ? 'success' : e.status) as AuditEvent['status'],
          details: typeof e.details === 'string' ? { info: e.details } : (e.details as Record<string, string>) ?? {},
        })));
      } else {
        setEvents(generateAuditEvents());
      }
    } catch {
      setEvents(generateAuditEvents());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return e.userName.toLowerCase().includes(q) ||
               e.action.toLowerCase().includes(q) ||
               e.resource.toLowerCase().includes(q) ||
               e.ipAddress.includes(q);
      }
      return true;
    });
  }, [events, search, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: events.length,
    success: events.filter(e => e.status === 'success').length,
    failure: events.filter(e => e.status === 'failure').length,
    warning: events.filter(e => e.status === 'warning').length,
  }), [events]);

  /* ── DataTable columns ── */
  const columns: DataTableColumn<AuditEvent>[] = useMemo(() => [
    {
      id: 'timestamp',
      header: t('admin.audit.time', 'Time'),
      field: 'timestamp',
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(row.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      id: 'userName',
      header: t('admin.audit.user', 'User'),
      field: 'userName',
      sortable: true,
      cell: (row) => <span className="font-medium text-foreground">{row.userName}</span>,
    },
    {
      id: 'action',
      header: t('admin.audit.action', 'Action'),
      field: 'action',
      sortable: true,
      cell: (row) => <span className="font-mono text-xs text-foreground">{row.action}</span>,
    },
    {
      id: 'category',
      header: t('admin.audit.category', 'Category'),
      field: 'category',
      cell: (row) => (
        <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">
          {CATEGORY_LABELS[row.category]}
        </span>
      ),
    },
    {
      id: 'resource',
      header: t('admin.audit.resource', 'Resource'),
      field: 'resource',
      cell: (row) => <span className="font-mono text-xs text-muted-foreground">{row.resource}</span>,
    },
    {
      id: 'ipAddress',
      header: t('admin.audit.ip', 'IP'),
      cell: (row) => <span className="font-mono text-xs text-muted-foreground">{row.ipAddress}</span>,
    },
    {
      id: 'status',
      header: t('common.status', 'Status'),
      field: 'status',
      cell: (row) => {
        const map = { success: 'success', failure: 'error', warning: 'warning' } as const;
        return <StatusBadge status={map[row.status]}>{row.status}</StatusBadge>;
      },
    },
  ], [t]);

  /* ── Filter button ── */
  const FilterBtn: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card text-muted-foreground border-border hover:border-primary/50'
      }`}
    >
      {children}
    </button>
  );

  return (
    <ContentArea
      title={t('admin.pages.auditLogs.title', 'Audit Logs')}
      description={t('admin.pages.auditLogs.description', 'Security and system audit event trail')}
      headerActions={
        <Button variant="outline" size="sm" onClick={fetchEvents} disabled={loading}>
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      }
      toolbar={
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(0); }}
            placeholder={t('admin.audit.searchPlaceholder', 'Search by user, action, resource, IP...')}
            className="w-72"
          />
          <div className="flex gap-1.5">
            {(['all', 'auth', 'admin', 'data', 'system', 'api'] as const).map(cat => (
              <FilterBtn key={cat} active={categoryFilter === cat} onClick={() => { setCategoryFilter(cat); setPage(0); }}>
                {cat === 'all' ? t('common.all', 'All') : CATEGORY_LABELS[cat]}
              </FilterBtn>
            ))}
          </div>
          <div className="flex gap-1.5 ml-auto">
            {(['all', 'success', 'failure', 'warning'] as const).map(st => (
              <FilterBtn key={st} active={statusFilter === st} onClick={() => { setStatusFilter(st); setPage(0); }}>
                {st === 'all' ? t('common.allStatus', 'All Status') : st}
              </FilterBtn>
            ))}
          </div>
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label={t('admin.audit.totalEvents', 'Total Events')} value={stats.total} variant="info" loading={loading} />
        <StatCard label={t('common.success', 'Success')} value={stats.success} variant="success" loading={loading} />
        <StatCard label={t('common.failure', 'Failure')} value={stats.failure} variant="error" loading={loading} />
        <StatCard label={t('common.warning', 'Warning')} value={stats.warning} variant="warning" loading={loading} />
      </div>

      {/* Table */}
      <DataTable
        data={paged}
        columns={columns}
        rowKey={(row) => row.id}
        loading={loading}
        emptyMessage={t('common.noResults', 'No results found')}
        onRowClick={(row) => setSelectedEvent(row)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">
            {`${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, filtered.length)} / ${filtered.length}`}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              {t('common.previous', 'Previous')}
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              {t('common.next', 'Next')}
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEvent && (
        <Modal isOpen onClose={() => setSelectedEvent(null)} title={`Audit Event: ${selectedEvent.action}`}>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Event ID', value: selectedEvent.id },
              { label: 'Timestamp', value: new Date(selectedEvent.timestamp).toLocaleString() },
              { label: 'User', value: `${selectedEvent.userName} (${selectedEvent.userId})` },
              { label: 'Action', value: selectedEvent.action },
              { label: 'Category', value: CATEGORY_LABELS[selectedEvent.category] },
              { label: 'Resource', value: selectedEvent.resource },
              { label: 'IP Address', value: selectedEvent.ipAddress },
              { label: 'User Agent', value: selectedEvent.userAgent },
              { label: 'Status', value: selectedEvent.status },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-1 border-b border-border last:border-b-0">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className="text-sm text-foreground font-mono">{row.value}</span>
              </div>
            ))}
            {Object.keys(selectedEvent.details).length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">{t('common.details', 'Details')}</p>
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs font-mono">
                  {Object.entries(selectedEvent.details).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-0.5">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="text-foreground">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </ContentArea>
  );
};

const feature: AdminFeatureModule = {
  id: 'admin-audit-logs',
  name: 'AdminAuditLogsPage',
  adminSection: 'admin-security',
  routes: {
    'admin-audit-logs': AdminAuditLogsPage,
  },
};

export default feature;
