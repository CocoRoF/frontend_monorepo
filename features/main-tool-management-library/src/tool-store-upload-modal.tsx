'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Label, Textarea, Input, useToast } from '@xgen/ui';
import { FiUpload } from '@xgen/icons';
import { useTranslation } from '@xgen/i18n';
import { uploadToolToStore, listMyStorageTools } from './api';
import type { MyStorageTool } from './api';

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface ToolStoreUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const ToolStoreUploadModal: React.FC<ToolStoreUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [myTools, setMyTools] = useState<MyStorageTool[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [selectedToolId, setSelectedToolId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [metadata, setMetadata] = useState('{}');

  // Load user's storage tools on open
  const loadMyTools = useCallback(async () => {
    try {
      setLoadingTools(true);
      const tools = await listMyStorageTools();
      setMyTools(tools);
    } catch {
      toast.error(t('toolManagementLibrary.upload.errors.loadToolsFailed'));
    } finally {
      setLoadingTools(false);
    }
  }, [toast, t]);

  useEffect(() => {
    if (isOpen) {
      loadMyTools();
      // Reset form
      setSelectedToolId(null);
      setDescription('');
      setTags('');
      setMetadata('{}');
    }
  }, [isOpen, loadMyTools]);

  // Auto-fill description when tool selected
  const handleToolSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const toolId = e.target.value ? Number(e.target.value) : null;
    setSelectedToolId(toolId);
    if (toolId) {
      const tool = myTools.find((t) => t.id === toolId);
      if (tool) setDescription(tool.description || '');
    } else {
      setDescription('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToolId) {
      toast.error(t('toolManagementLibrary.upload.errors.selectTool'));
      return;
    }

    const tagArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    let metadataObj: Record<string, unknown> = {};
    if (metadata.trim()) {
      try {
        metadataObj = JSON.parse(metadata);
      } catch {
        toast.error(t('toolManagementLibrary.upload.errors.invalidMetadata'));
        return;
      }
    }

    try {
      setUploading(true);
      await uploadToolToStore(selectedToolId, {
        function_upload_id: selectedToolId.toString(),
        description: description.trim(),
        tags: tagArray,
        metadata: metadataObj,
      });
      toast.success(t('toolManagementLibrary.upload.success'));
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('toolManagementLibrary.upload.errors.uploadFailed');
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('toolManagementLibrary.upload.title')}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={uploading}>
            {t('toolManagementLibrary.upload.cancel')}
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={uploading || !selectedToolId}>
            <FiUpload className="mr-1" />
            {uploading
              ? t('toolManagementLibrary.upload.uploading')
              : t('toolManagementLibrary.upload.submit')}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Tool selector */}
        <div className="flex flex-col gap-1.5">
          <Label>{t('toolManagementLibrary.upload.selectTool')} <span className="text-red-500">*</span></Label>
          <select
            value={selectedToolId ?? ''}
            onChange={handleToolSelect}
            disabled={loadingTools || uploading}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{t('toolManagementLibrary.upload.selectToolPlaceholder')}</option>
            {myTools.map((tool) => (
              <option key={tool.id} value={tool.id}>
                {tool.functionName} ({tool.functionId})
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <Label>{t('toolManagementLibrary.upload.description')}</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('toolManagementLibrary.upload.descriptionPlaceholder')}
            rows={3}
            disabled={uploading}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <Label>{t('toolManagementLibrary.upload.tags')}</Label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={t('toolManagementLibrary.upload.tagsPlaceholder')}
            disabled={uploading}
          />
          <p className="text-xs text-muted-foreground">{t('toolManagementLibrary.upload.tagsHint')}</p>
        </div>

        {/* Metadata */}
        <div className="flex flex-col gap-1.5">
          <Label>{t('toolManagementLibrary.upload.metadata')}</Label>
          <Textarea
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            placeholder={t('toolManagementLibrary.upload.metadataPlaceholder')}
            rows={3}
            disabled={uploading}
          />
          <p className="text-xs text-muted-foreground">{t('toolManagementLibrary.upload.metadataHint')}</p>
        </div>
      </form>
    </Modal>
  );
};

export default ToolStoreUploadModal;
