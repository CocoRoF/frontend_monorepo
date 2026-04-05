'use client';

import React, { useState } from 'react';
import { Modal, Button, Badge } from '@xgen/ui';
import { FiCopy, FiCheck, FiStar } from '@xgen/icons';
import { useTranslation } from '@xgen/i18n';
import type { StorePrompt } from './api';

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
          className={`w-4 h-4 transition-colors ${
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
// Props
// ─────────────────────────────────────────────────────────────

interface PromptLibraryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: StorePrompt;
  currentRating: number;
  onRate: (prompt: StorePrompt, rating: number) => void;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const PromptLibraryDetailModal: React.FC<PromptLibraryDetailModalProps> = ({
  isOpen,
  onClose,
  prompt,
  currentRating,
  onRate,
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
            {t('promptManagementLibrary.modal.close')}
          </Button>
          <Button size="sm" onClick={handleCopy}>
            {copied ? <FiCheck className="mr-1" /> : <FiCopy className="mr-1" />}
            {copied
              ? t('promptManagementLibrary.modal.copied')
              : t('promptManagementLibrary.modal.copyContent')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{prompt.author}</span>
          <span className="text-border">·</span>
          <span>{formatDate(prompt.createdAt)}</span>
          <span className="text-border">·</span>
          <span>{prompt.language.toUpperCase()}</span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={prompt.type === 'system' ? 'default' : 'secondary'}>
            {t(`promptManagementLibrary.types.${prompt.type}`)}
          </Badge>
          {prompt.isTemplate && (
            <Badge variant="outline">
              {t('promptManagementLibrary.badges.template')}
            </Badge>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-3 border border-border rounded-lg p-3">
          <span className="text-sm font-medium text-foreground">
            {t('promptManagementLibrary.modal.rateThisPrompt')}
          </span>
          <StarRating
            rating={currentRating}
            onRate={(value) => onRate(prompt, value)}
          />
          <span className="text-xs text-muted-foreground">
            {prompt.ratingCount > 0
              ? t('promptManagementLibrary.card.rating', {
                  rating: currentRating.toFixed(1),
                  count: prompt.ratingCount,
                })
              : t('promptManagementLibrary.card.noRating')}
          </span>
        </div>

        {/* Content */}
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">
              {t('promptManagementLibrary.modal.contentLabel')}
            </h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
              {copied ? t('promptManagementLibrary.modal.copied') : t('promptManagementLibrary.modal.copy')}
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
              {t('promptManagementLibrary.modal.variables')}
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

        {/* Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-muted-foreground">{t('promptManagementLibrary.modal.charCount')}</span>
            <span className="text-foreground">{prompt.content.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">{t('promptManagementLibrary.modal.isTemplate')}</span>
            <span className="text-foreground">
              {prompt.isTemplate ? t('promptManagementLibrary.modal.yes') : t('promptManagementLibrary.modal.no')}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PromptLibraryDetailModal;
