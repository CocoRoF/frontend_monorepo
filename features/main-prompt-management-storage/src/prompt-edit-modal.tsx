'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Label, Input, Textarea, useToast } from '@xgen/ui';
import { FiCheck } from '@xgen/icons';
import { useTranslation } from '@xgen/i18n';
import { updatePrompt, uploadToPromptStore } from './api';
import type { PromptDetail } from './api';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface PromptEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prompt: PromptDetail;
}

interface FormData {
  prompt_title: string;
  prompt_content: string;
  public_available: boolean;
  language: 'ko' | 'en';
  prompt_type: 'user' | 'system';
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const PromptEditModal: React.FC<PromptEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  prompt,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [form, setForm] = useState<FormData>({
    prompt_title: '',
    prompt_content: '',
    public_available: false,
    language: 'ko',
    prompt_type: 'user',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && prompt) {
      setForm({
        prompt_title: prompt.title,
        prompt_content: prompt.content,
        public_available: prompt.isPublic,
        language: (prompt.language as 'ko' | 'en') || 'ko',
        prompt_type: prompt.type,
      });
      setErrors({});
    }
  }, [isOpen, prompt]);

  const set = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.prompt_title.trim()) e.prompt_title = t('promptManagementStorage.modal.errors.titleRequired');
    else if (form.prompt_title.length > 100) e.prompt_title = t('promptManagementStorage.modal.errors.titleTooLong');
    if (!form.prompt_content.trim()) e.prompt_content = t('promptManagementStorage.modal.errors.contentRequired');
    else if (form.prompt_content.length > 5000) e.prompt_content = t('promptManagementStorage.modal.errors.contentTooLong');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    try {
      await updatePrompt({
        prompt_uid: prompt.uid,
        ...form,
      });
      // If made public and wasn't before, upload to store
      if (form.public_available && !prompt.isPublic) {
        try {
          await uploadToPromptStore(prompt.keyValue);
        } catch {
          // Store upload is optional
        }
      }
      toast.success(t('promptManagementStorage.modal.editSuccess'));
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('promptManagementStorage.modal.editFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const ToggleBtn: React.FC<{
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }> = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={submitting}
      className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-muted-foreground border-input hover:bg-accent'
      }`}
    >
      {children}
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('promptManagementStorage.modal.editTitle')}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            {t('promptManagementStorage.modal.cancel')}
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || !form.prompt_title.trim() || !form.prompt_content.trim()}
          >
            <FiCheck className="mr-1" />
            {submitting ? t('promptManagementStorage.modal.saving') : t('promptManagementStorage.modal.save')}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <Label>
            {t('promptManagementStorage.modal.titleLabel')} <span className="text-red-500">*</span>
          </Label>
          <Input
            value={form.prompt_title}
            onChange={(e) => set('prompt_title', e.target.value)}
            placeholder={t('promptManagementStorage.modal.titlePlaceholder')}
            maxLength={100}
            disabled={submitting}
          />
          {errors.prompt_title && (
            <p className="text-xs text-red-500">{errors.prompt_title}</p>
          )}
          <p className="text-xs text-muted-foreground text-right">{form.prompt_title.length}/100</p>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5">
          <Label>
            {t('promptManagementStorage.modal.contentLabel')} <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={form.prompt_content}
            onChange={(e) => set('prompt_content', e.target.value)}
            placeholder={t('promptManagementStorage.modal.contentPlaceholder')}
            rows={8}
            maxLength={5000}
            disabled={submitting}
          />
          {errors.prompt_content && (
            <p className="text-xs text-red-500">{errors.prompt_content}</p>
          )}
          <p className="text-xs text-muted-foreground text-right">{form.prompt_content.length}/5000</p>
        </div>

        {/* Language */}
        <div className="flex flex-col gap-1.5">
          <Label>{t('promptManagementStorage.modal.language')}</Label>
          <div className="flex gap-2">
            <ToggleBtn active={form.language === 'ko'} onClick={() => set('language', 'ko')}>
              {t('promptManagementStorage.modal.korean')}
            </ToggleBtn>
            <ToggleBtn active={form.language === 'en'} onClick={() => set('language', 'en')}>
              {t('promptManagementStorage.modal.english')}
            </ToggleBtn>
          </div>
        </div>

        {/* Prompt Type */}
        <div className="flex flex-col gap-1.5">
          <Label>{t('promptManagementStorage.modal.promptType')}</Label>
          <div className="flex gap-2">
            <ToggleBtn active={form.prompt_type === 'user'} onClick={() => set('prompt_type', 'user')}>
              {t('promptManagementStorage.modal.userPrompt')}
            </ToggleBtn>
            <ToggleBtn active={form.prompt_type === 'system'} onClick={() => set('prompt_type', 'system')}>
              {t('promptManagementStorage.modal.systemPrompt')}
            </ToggleBtn>
          </div>
          <p className="text-xs text-muted-foreground">
            {form.prompt_type === 'system'
              ? t('promptManagementStorage.modal.systemPromptDesc')
              : t('promptManagementStorage.modal.userPromptDesc')}
          </p>
        </div>

        {/* Visibility */}
        <div className="flex flex-col gap-1.5">
          <Label>{t('promptManagementStorage.modal.visibility')}</Label>
          <div className="flex gap-2">
            <ToggleBtn active={!form.public_available} onClick={() => set('public_available', false)}>
              {t('promptManagementStorage.modal.private')}
            </ToggleBtn>
            <ToggleBtn active={form.public_available} onClick={() => set('public_available', true)}>
              {t('promptManagementStorage.modal.public')}
            </ToggleBtn>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default PromptEditModal;
