'use client';

import React from 'react';
import { Modal, Button, Badge, StatusBadge } from '@xgen/ui';
import {
  FiDownload,
  FiTool,
  FiUser,
  FiLink,
  FiInfo,
  FiStar,
  FiShield,
  FiHash,
  FiSlash,
  LuCode,
} from '@xgen/icons';
import { useTranslation } from '@xgen/i18n';
import type { StoreTool, StoreToolAPIResponse } from './api';

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface ToolStoreDetailModalProps {
  tool: StoreTool;
  rawData?: StoreToolAPIResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (tool: StoreTool) => void;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatJson(value: unknown): string {
  if (!value) return '{}';
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    const obj = parsed as Record<string, unknown>;
    return Object.keys(obj).length > 0
      ? JSON.stringify(obj, null, 2)
      : '{}';
  } catch {
    return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  }
}

// ─────────────────────────────────────────────────────────────
// Section Component
// ─────────────────────────────────────────────────────────────

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({
  icon,
  title,
  children,
}) => (
  <div className="border border-border rounded-lg p-4">
    <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
      {icon}
      {title}
    </h3>
    {children}
  </div>
);

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-baseline gap-2 py-1">
    <span className="text-xs font-medium text-muted-foreground min-w-[100px] shrink-0">{label}</span>
    <span className="text-sm text-foreground break-all">{value}</span>
  </div>
);

const CodeBlock: React.FC<{ icon?: React.ReactNode; label: string; content: string }> = ({
  icon,
  label,
  content,
}) => (
  <div className="mt-2">
    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <pre className="bg-muted rounded-md p-3 text-xs text-foreground overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap break-all">
      {content}
    </pre>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const ToolStoreDetailModal: React.FC<ToolStoreDetailModalProps> = ({
  tool,
  rawData,
  isOpen,
  onClose,
  onDownload,
}) => {
  const { t } = useTranslation();
  const fd = rawData?.function_data;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tool.name}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('toolManagementLibrary.detail.close')}
          </Button>
          <Button size="sm" onClick={() => onDownload(tool)}>
            <FiDownload className="mr-1" />
            {t('toolManagementLibrary.detail.download')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
        {/* ── Basic Information ── */}
        <Section icon={<FiInfo />} title={t('toolManagementLibrary.detail.basicInfo')}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <InfoRow label={t('toolManagementLibrary.detail.id')} value={tool.id} />
            <InfoRow
              label={t('toolManagementLibrary.detail.author')}
              value={
                <span className="flex items-center gap-1">
                  <FiUser className="w-3 h-3" />
                  {tool.author}
                </span>
              }
            />
            <InfoRow
              label={t('toolManagementLibrary.detail.status')}
              value={
                fd ? (
                  <StatusBadge
                    variant={fd.status === 'active' ? 'success' : 'neutral'}
                  >
                    {fd.status === 'active'
                      ? t('toolManagementLibrary.detail.statusActive')
                      : t('toolManagementLibrary.detail.statusInactive')}
                  </StatusBadge>
                ) : '—'
              }
            />
            <InfoRow
              label={t('toolManagementLibrary.detail.created')}
              value={formatDate(tool.createdAt)}
            />
          </div>
          {tool.description && (
            <div className="mt-3 p-3 bg-muted rounded-md text-sm text-foreground">
              {tool.description}
            </div>
          )}
        </Section>

        {/* ── API Configuration ── */}
        {fd && (
          <Section icon={<FiLink />} title={t('toolManagementLibrary.detail.apiConfig')}>
            {/* URL */}
            <div className="p-2 bg-muted rounded-md mb-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                <FiLink className="w-3 h-3" />
                <span>{t('toolManagementLibrary.detail.apiUrl')}</span>
              </div>
              <span className="text-sm text-foreground break-all">{fd.api_url}</span>
            </div>

            {/* Method / Timeout / Body Type */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <InfoRow label={t('toolManagementLibrary.detail.httpMethod')} value={fd.api_method} />
              <InfoRow
                label={t('toolManagementLibrary.detail.timeout')}
                value={`${fd.api_timeout}s`}
              />
              {fd.body_type && (
                <InfoRow label={t('toolManagementLibrary.detail.bodyType')} value={fd.body_type} />
              )}
            </div>

            {/* Header */}
            <CodeBlock
              icon={<LuCode className="w-3 h-3" />}
              label={t('toolManagementLibrary.detail.apiHeader')}
              content={formatJson(fd.api_header)}
            />

            {/* Body Schema */}
            <CodeBlock
              icon={<LuCode className="w-3 h-3" />}
              label={t('toolManagementLibrary.detail.apiBody')}
              content={formatJson(fd.api_body)}
            />

            {/* Static Body */}
            {!!fd.static_body && (
              <CodeBlock
                icon={<LuCode className="w-3 h-3" />}
                label={t('toolManagementLibrary.detail.staticBody')}
                content={formatJson(fd.static_body)}
              />
            )}
          </Section>
        )}

        {/* ── Response Filter ── */}
        {fd && (
          <Section icon={<FiSlash />} title={t('toolManagementLibrary.detail.responseFilter')}>
            {fd.response_filter ? (
              <div className="grid grid-cols-1 gap-1">
                <InfoRow
                  label={t('toolManagementLibrary.detail.filterStatus')}
                  value={
                    <span className="text-green-600 font-medium text-xs">
                      {t('toolManagementLibrary.detail.filterActive')}
                    </span>
                  }
                />
                <InfoRow
                  label={t('toolManagementLibrary.detail.filterPath')}
                  value={fd.response_filter_path || '—'}
                />
                <InfoRow
                  label={t('toolManagementLibrary.detail.filterField')}
                  value={fd.response_filter_field || '—'}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('toolManagementLibrary.detail.filterDisabled')}
              </p>
            )}
          </Section>
        )}

        {/* ── Tags ── */}
        {tool.tags.length > 0 && (
          <Section icon={<FiHash />} title={t('toolManagementLibrary.detail.tags')}>
            <div className="flex flex-wrap gap-1.5">
              {tool.tags.map((tag, i) => (
                <Badge key={i} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </Section>
        )}

        {/* ── Rating ── */}
        {tool.ratingCount > 0 && (
          <Section icon={<FiStar />} title={t('toolManagementLibrary.detail.ratingInfo')}>
            <div className="grid grid-cols-2 gap-1">
              <InfoRow
                label={t('toolManagementLibrary.detail.rating')}
                value={`${tool.ratingAvg.toFixed(1)} / 5.0`}
              />
              <InfoRow
                label={t('toolManagementLibrary.detail.ratingCount')}
                value={`${tool.ratingCount}`}
              />
            </div>
          </Section>
        )}

        {/* ── Metadata ── */}
        {rawData?.metadata && Object.keys(rawData.metadata).length > 0 && (
          <Section icon={<FiShield />} title={t('toolManagementLibrary.detail.metadata')}>
            <pre className="bg-muted rounded-md p-3 text-xs text-foreground overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(rawData.metadata as Record<string, unknown>, null, 2)}
            </pre>
          </Section>
        )}
      </div>
    </Modal>
  );
};

export default ToolStoreDetailModal;
