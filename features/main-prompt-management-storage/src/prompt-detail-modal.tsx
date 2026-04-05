'use client';

import React, { useState } from 'react';
import { Modal, Button, Badge } from '@xgen/ui';
import { FiCopy, FiCheck } from '@xgen/icons';
import { useTranslation } from '@xgen/i18n';
import type { PromptDetail } from './api';

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface PromptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: PromptDetail;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({
  isOpen,
  onClose,
  prompt,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={prompt.title}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('promptManagementStorage.modal.close')}
          </Button>
          <Button size="sm" onClick={handleCopy}>
            {copied ? <FiCheck className="mr-1" /> : <FiCopy className="mr-1" />}
            {copied
              ? t('promptManagementStorage.modal.copied')
              : t('promptManagementStorage.modal.copyContent')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{prompt.author}</span>
          <span className="text-border">·</span>
          <span>{formatDate(prompt.updatedAt)}</span>
          <span className="text-border">·</span>
          <span>{prompt.language.toUpperCase()}</span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={prompt.type === 'system' ? 'default' : 'secondary'}>
            {t(`promptManagementStorage.types.${prompt.type}`)}
          </Badge>
          {prompt.isTemplate && (
            <Badge variant="outline">
              {t('promptManagementStorage.badges.template')}
            </Badge>
          )}
          <Badge variant={prompt.isPublic ? 'default' : 'secondary'}>
            {prompt.isPublic
              ? t('promptManagementStorage.badges.shared')
              : t('promptManagementStorage.badges.personal')}
          </Badge>
        </div>

        {/* Content */}
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">
              {t('promptManagementStorage.modal.contentLabel')}
            </h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
              {copied ? t('promptManagementStorage.modal.copied') : t('promptManagementStorage.modal.copy')}
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted rounded-md p-3 max-h-[300px] overflow-y-auto">
            {prompt.content}
          </pre>
        </div>

        {/* Variables */}
        {prompt.variables.length > 0 && (
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              {t('promptManagementStorage.modal.variables')}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {prompt.variables.map((v) => (
                <Badge key={v} variant="outline">
                  {`{{${v}}}`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Additional info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-muted-foreground">{t('promptManagementStorage.modal.charCount')}</span>
            <span className="text-foreground">{prompt.content.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">{t('promptManagementStorage.modal.isTemplate')}</span>
            <span className="text-foreground">{prompt.isTemplate ? t('promptManagementStorage.modal.yes') : t('promptManagementStorage.modal.no')}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PromptDetailModal;
