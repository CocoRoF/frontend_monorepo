'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, useToast } from '@xgen/ui';
import { FiUpload } from '@xgen/icons';
import { useTranslation } from '@xgen/i18n';
import { listMyStoragePrompts, uploadPromptToStore } from './api';
import type { StoragePromptItem } from './api';

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface PromptStoreUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const PromptStoreUploadModal: React.FC<PromptStoreUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [prompts, setPrompts] = useState<StoragePromptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Load user's private prompts on open
  const loadPrompts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listMyStoragePrompts();
      // Only show private (non-public) prompts — public ones are already in the store
      setPrompts(data.filter((p) => !p.isPublic));
    } catch {
      toast.error(t('promptManagementLibrary.upload.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    if (isOpen) {
      loadPrompts();
      setSelected(new Set());
    }
  }, [isOpen, loadPrompts]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === prompts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(prompts.map((p) => p.id)));
    }
  };

  const handleSubmit = async () => {
    if (selected.size === 0) return;

    try {
      setUploading(true);
      const promises = Array.from(selected).map((id) => uploadPromptToStore(id));
      await Promise.all(promises);
      toast.success(t('promptManagementLibrary.upload.success', { count: selected.size }));
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('promptManagementLibrary.upload.errors.uploadFailed');
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('promptManagementLibrary.upload.title')}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={uploading}>
            {t('promptManagementLibrary.upload.cancel')}
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={uploading || selected.size === 0}>
            <FiUpload className="mr-1" />
            {uploading
              ? t('promptManagementLibrary.upload.uploading')
              : t('promptManagementLibrary.upload.submit', { count: selected.size })}
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          {t('promptManagementLibrary.upload.loading')}
        </div>
      ) : prompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
          <p>{t('promptManagementLibrary.upload.noPrompts')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Select All */}
          <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-accent cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={selected.size === prompts.length}
              onChange={toggleAll}
              disabled={uploading}
              className="rounded border-input"
            />
            <span className="text-sm font-medium">
              {t('promptManagementLibrary.upload.selectAll')} ({prompts.length})
            </span>
          </label>

          {/* Prompt list */}
          <div className="max-h-[300px] overflow-y-auto flex flex-col gap-1">
            {prompts.map((prompt) => (
              <label
                key={prompt.id}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-accent cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.has(prompt.id)}
                  onChange={() => toggleSelect(prompt.id)}
                  disabled={uploading}
                  className="rounded border-input"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{prompt.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {prompt.language.toUpperCase()} · {prompt.type}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {selected.size > 0 && (
            <p className="text-xs text-muted-foreground">
              {t('promptManagementLibrary.upload.selectedCount', { count: selected.size })}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
};

export default PromptStoreUploadModal;
