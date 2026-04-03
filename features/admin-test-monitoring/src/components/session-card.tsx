'use client';

import React from 'react';
import { StatusBadge, Button } from '@xgen/ui';
import {
  FiFileText, FiActivity, FiCheckCircle, FiXCircle, FiClock,
  FiChevronDown, FiChevronUp, FiPlay, FiAlertCircle, FiRefreshCw,
} from '@xgen/icons';
import type { SessionWithResults, BatchResult } from '../types';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

function statusVariant(status: string): StatusVariant {
  switch (status.toLowerCase()) {
    case 'running': return 'info';
    case 'completed': return 'success';
    case 'cancelled': return 'neutral';
    case 'error': return 'error';
    default: return 'neutral';
  }
}

function statusIcon(status: string): React.ReactNode {
  switch (status.toLowerCase()) {
    case 'running': return <FiPlay className="h-3 w-3" />;
    case 'completed': return <FiCheckCircle className="h-3 w-3" />;
    case 'cancelled':
    case 'error': return <FiXCircle className="h-3 w-3" />;
    default: return <FiActivity className="h-3 w-3" />;
  }
}

// ─────────────────────────────────────────────────────────────
// Results Table (sub-component)
// ─────────────────────────────────────────────────────────────

interface ResultsTableProps {
  results: BatchResult[];
  t: (key: string, params?: Record<string, unknown>) => string;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, t }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr className="border-b border-border bg-muted">
          <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-muted-foreground">
            {t('admin.workflowManagement.testMonitoring.columns.index')}
          </th>
          <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-muted-foreground">
            {t('admin.workflowManagement.testMonitoring.columns.input')}
          </th>
          <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-muted-foreground">
            {t('admin.workflowManagement.testMonitoring.columns.expected')}
          </th>
          <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-muted-foreground">
            {t('admin.workflowManagement.testMonitoring.columns.result')}
          </th>
          <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-muted-foreground">
            {t('admin.workflowManagement.testMonitoring.columns.status')}
          </th>
          <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-muted-foreground">
            {t('admin.workflowManagement.testMonitoring.columns.aiScore')}
          </th>
          <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-muted-foreground">
            {t('admin.workflowManagement.testMonitoring.columns.aiReason')}
          </th>
        </tr>
      </thead>
      <tbody>
        {results.map((result) => (
          <tr key={result.test_case_id} className="border-b border-border hover:bg-muted/50">
            <td className="px-3 py-2">{result.test_case_id}</td>
            <td className="max-w-[200px] truncate px-3 py-2" title={result.input_data}>
              {result.input_data}
            </td>
            <td className="max-w-[200px] truncate px-3 py-2" title={result.expected_output}>
              {result.expected_output}
            </td>
            <td className="max-w-[200px] truncate px-3 py-2" title={result.actual_output}>
              {result.actual_output}
            </td>
            <td className="px-3 py-2">
              <StatusBadge variant={result.status === 'success' ? 'success' : 'error'}>
                {result.status === 'success'
                  ? t('admin.workflowManagement.testMonitoring.resultSuccess')
                  : t('admin.workflowManagement.testMonitoring.resultFailed')}
              </StatusBadge>
            </td>
            <td className="px-3 py-2">
              {result.llm_eval_score != null
                ? t('admin.workflowManagement.testMonitoring.score', { score: result.llm_eval_score })
                : '-'}
            </td>
            <td className="max-w-[200px] truncate px-3 py-2" title={result.llm_eval_reason ?? ''}>
              {result.llm_eval_reason ?? '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Session Card
// ─────────────────────────────────────────────────────────────

interface SessionCardProps {
  session: SessionWithResults;
  t: (key: string, params?: Record<string, unknown>) => string;
  formatDate: (dateString: string) => string;
  onToggleResults: (batchId: string) => void;
  onCancel: (batchId: string) => void;
  onDelete: (batchId: string) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  session, t, formatDate, onToggleResults, onCancel, onDelete,
}) => {
  const tm = 'admin.workflowManagement.testMonitoring';

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 transition-all hover:border-primary/30 hover:shadow-sm">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {/* Title + status */}
          <div className="flex flex-wrap items-center gap-2">
            <FiFileText className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm font-semibold text-foreground">{session.workflow_name}</span>
            <StatusBadge variant={statusVariant(session.status)}>
              <span className="flex items-center gap-1">
                {statusIcon(session.status)}
                {t(`${tm}.status${session.status.charAt(0).toUpperCase()}${session.status.slice(1)}`)}
              </span>
            </StatusBadge>
          </div>

          {/* User + batch ID */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>
              <strong className="font-semibold text-foreground/70">{t(`${tm}.user`)}:</strong>{' '}
              {session.username || `User #${session.user_id}`}
            </span>
            <span className="text-border">|</span>
            <span>
              <strong className="font-semibold text-foreground/70">{t(`${tm}.batchId`)}:</strong>{' '}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">{session.batch_id}</code>
            </span>
          </div>

          {/* Meta stats */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FiActivity className="h-3.5 w-3.5" />
              {session.completed_count}/{session.total_count} ({session.progress.toFixed(1)}%)
            </span>
            <span className="flex items-center gap-1">
              <FiCheckCircle className="h-3.5 w-3.5" />
              {t(`${tm}.success`)}: {session.success_count}
            </span>
            <span className="flex items-center gap-1">
              <FiXCircle className="h-3.5 w-3.5" />
              {t(`${tm}.failure`)}: {session.error_count}
            </span>
            <span className="flex items-center gap-1">
              <FiClock className="h-3.5 w-3.5" />
              {formatDate(session.created_at)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => onToggleResults(session.batch_id)}>
            {session.resultsExpanded ? <FiChevronUp className="mr-1 h-3.5 w-3.5" /> : <FiChevronDown className="mr-1 h-3.5 w-3.5" />}
            {t(`${tm}.results`)} {session.results ? `(${session.results.length})` : ''}
          </Button>
          {session.status === 'running' ? (
            <Button variant="danger" size="sm" onClick={() => onCancel(session.batch_id)}>
              <FiXCircle className="mr-1 h-3.5 w-3.5" />
              {t(`${tm}.cancel`)}
            </Button>
          ) : (
            <Button variant="danger" size="sm" onClick={() => onDelete(session.batch_id)}>
              {t(`${tm}.deleteBtn`)}
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar (running) */}
      {session.status === 'running' && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-300"
              style={{ width: `${session.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {session.error_message && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          {session.error_message}
        </div>
      )}

      {/* Results section */}
      {session.resultsExpanded && (
        <div className="mt-3 border-t border-border pt-3">
          {session.resultsLoading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <FiRefreshCw className="h-4 w-4 animate-spin" />
              {t(`${tm}.loadingResults`)}
            </div>
          ) : session.results && session.results.length > 0 ? (
            <ResultsTable results={session.results} t={t} />
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t(`${tm}.noResults`)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionCard;
