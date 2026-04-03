'use client';

import React, { useState, useEffect } from 'react';
import { Modal, StatusBadge, Button } from '@xgen/ui';
import { useTranslation } from '@xgen/i18n';
import { getTraceDetail } from '../api/trace-api';
import type { AgentTrace, AgentTraceSpan } from '../types';

// ─────────────────────────────────────────────────────────────
// Span configuration
// ─────────────────────────────────────────────────────────────

interface SpanConfig {
  icon: string;
  labelKey: string;
  borderColor: string;
  bgColor: string;
}

const SPAN_CONFIG: Record<string, SpanConfig> = {
  agent_input:  { icon: '📥', labelKey: 'agentInput',  borderColor: 'border-l-blue-500',   bgColor: 'bg-blue-50' },
  rag_search:   { icon: '🔍', labelKey: 'ragSearch',   borderColor: 'border-l-yellow-500', bgColor: 'bg-yellow-50' },
  file_process: { icon: '📎', labelKey: 'fileProcess', borderColor: 'border-l-purple-500', bgColor: 'bg-purple-50' },
  llm_call:     { icon: '🤖', labelKey: 'llmCall',     borderColor: 'border-l-violet-500', bgColor: 'bg-violet-50' },
  tool_call:    { icon: '🔧', labelKey: 'toolCall',     borderColor: 'border-l-green-500',  bgColor: 'bg-green-50' },
  tool_output:  { icon: '📋', labelKey: 'toolOutput',  borderColor: 'border-l-green-300',  bgColor: 'bg-green-50' },
  agent_output: { icon: '📤', labelKey: 'agentOutput', borderColor: 'border-l-orange-500', bgColor: 'bg-orange-50' },
  error:        { icon: '❌', labelKey: 'error',        borderColor: 'border-l-red-500',    bgColor: 'bg-red-50' },
};

const AUTO_EXPAND_TYPES = new Set(['agent_input', 'agent_output', 'error', 'rag_search', 'file_process']);

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatDuration(ms: number | null): string {
  if (ms == null) return '-';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function statusVariant(status: string): 'success' | 'info' | 'error' {
  if (status === 'completed') return 'success';
  if (status === 'running') return 'info';
  return 'error';
}

// ─────────────────────────────────────────────────────────────
// Span Body
// ─────────────────────────────────────────────────────────────

const SpanBody: React.FC<{ span: AgentTraceSpan; t: (key: string) => string }> = ({ span, t }) => {
  const sb = 'admin.workflowManagement.agentTraces.spanBody';
  const parts: React.ReactNode[] = [];

  if (span.input_data) {
    parts.push(
      <div key="input">
        <div className="mb-1 text-[11px] font-semibold text-muted-foreground">{t(`${sb}.input`)}</div>
        <div>{span.input_data}</div>
      </div>,
    );
  }
  if (span.output_data) {
    parts.push(
      <div key="output" className={parts.length > 0 ? 'mt-2' : ''}>
        <div className="mb-1 text-[11px] font-semibold text-muted-foreground">{t(`${sb}.output`)}</div>
        <div>{span.output_data}</div>
      </div>,
    );
  }
  if (span.error_message) {
    parts.push(
      <div key="error" className={`text-destructive ${parts.length > 0 ? 'mt-2' : ''}`}>
        <div className="mb-1 text-[11px] font-semibold text-muted-foreground">{t(`${sb}.error`)}</div>
        <div>{span.error_message}</div>
      </div>,
    );
  }

  if (parts.length === 0) return null;

  return (
    <div className="max-h-[300px] overflow-y-auto whitespace-pre-wrap break-words border-t border-border bg-card px-3 py-2 font-mono text-xs leading-relaxed">
      {parts}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Span Item
// ─────────────────────────────────────────────────────────────

const SpanItem: React.FC<{
  span: AgentTraceSpan;
  index: number;
  isExpanded: boolean;
  onToggle: (index: number) => void;
  t: (key: string) => string;
}> = ({ span, index, isExpanded, onToggle, t }) => {
  const cfg = SPAN_CONFIG[span.span_type] || {
    icon: '•',
    labelKey: span.span_type,
    borderColor: 'border-l-gray-300',
    bgColor: 'bg-gray-50',
  };
  const hasBody = span.input_data || span.output_data || span.error_message;
  const label = t(`admin.workflowManagement.agentTraces.spanLabels.${cfg.labelKey}`) || span.span_type;
  const fullLabel = span.tool_name ? `${label}: ${span.tool_name}` : label;

  return (
    <div className="overflow-hidden rounded border border-border">
      <div
        className={`flex cursor-pointer select-none items-center gap-2 border-l-[3px] px-3 py-2 text-sm hover:brightness-[0.97] ${cfg.borderColor} ${cfg.bgColor}`}
        onClick={() => hasBody && onToggle(index)}
      >
        <span className="shrink-0 text-base">{cfg.icon}</span>
        <span className="flex-1 font-semibold">{fullLabel}</span>
        {span.duration_ms != null && (
          <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
            {formatDuration(span.duration_ms)}
          </span>
        )}
        {hasBody && (
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
      </div>
      {isExpanded && <SpanBody span={span} t={t} />}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Trace Detail Modal
// ─────────────────────────────────────────────────────────────

interface TraceDetailModalProps {
  traceId: string;
  onClose: () => void;
}

const DT = 'admin.workflowManagement.agentTraces.detail';

const TraceDetailModal: React.FC<TraceDetailModalProps> = ({ traceId, onClose }) => {
  const { t } = useTranslation();
  const [trace, setTrace] = useState<AgentTrace | null>(null);
  const [spans, setSpans] = useState<AgentTraceSpan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSpans, setExpandedSpans] = useState<Set<number>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getTraceDetail(traceId);
        setTrace(data.trace);
        setSpans(data.spans);

        // Auto-expand important span types
        const autoExpand = new Set<number>();
        data.spans.forEach((s, i) => {
          if (AUTO_EXPAND_TYPES.has(s.span_type)) {
            autoExpand.add(i);
          }
        });
        setExpandedSpans(autoExpand);
      } catch (err) {
        console.error('Failed to load trace detail:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [traceId]);

  const toggleSpan = (index: number) => {
    setExpandedSpans((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <Modal isOpen onClose={onClose} size="lg" title="">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
          <p className="text-sm">{t('admin.workflowManagement.agentTraces.detailLoading')}</p>
        </div>
      ) : trace ? (
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border px-4 pb-3">
            <h3 className="text-base font-semibold text-foreground">
              {trace.workflow_name || trace.workflow_id}
            </h3>
            <StatusBadge variant={statusVariant(trace.status)}>
              {trace.status}
            </StatusBadge>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-b border-border bg-muted px-4 py-2 text-xs text-muted-foreground">
            <span>{t(`${DT}.duration`)}: <strong className="text-foreground">{formatDuration(trace.duration_ms)}</strong></span>
            <span>{t(`${DT}.llm`)}: <strong className="text-foreground">{trace.total_llm_calls}</strong></span>
            <span>{t(`${DT}.tool`)}: <strong className="text-foreground">{trace.total_tool_calls}</strong></span>
            <span>{t(`${DT}.spans`)}: <strong className="text-foreground">{trace.total_spans}</strong></span>
          </div>

          {/* Span tree */}
          <div className="max-h-[50vh] overflow-y-auto px-4 py-3">
            {spans.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t('admin.workflowManagement.agentTraces.noSpanData')}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {spans.map((span, i) => (
                  <SpanItem
                    key={span.id || i}
                    span={span}
                    index={i}
                    isExpanded={expandedSpans.has(i)}
                    onToggle={toggleSpan}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Summary bar */}
          <div className="flex gap-4 border-t border-border bg-muted px-4 py-2 font-mono text-xs text-muted-foreground">
            <span>{t(`${DT}.total`)}: {formatDuration(trace.duration_ms)}</span>
            <span>{t(`${DT}.llm`)}: {trace.total_llm_calls}</span>
            <span>{t(`${DT}.tool`)}: {trace.total_tool_calls}</span>
            <span>{t(`${DT}.spans`)}: {spans.length}</span>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default TraceDetailModal;
