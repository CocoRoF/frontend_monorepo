'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { AdminFeatureModule, RouteComponentProps } from '@xgen/types';
import { ContentArea, Button, useToast } from '@xgen/ui';
import { useTranslation } from '@xgen/i18n';
import { FiRefreshCw, FiDownload, FiPlus } from '@xgen/icons';

import { getAllPrompts, deletePrompt } from './api/prompt-api';
import type { Prompt } from './types';
import PromptCard from './components/prompt-card';
import PromptCreateModal from './components/prompt-create-modal';
import PromptEditModal from './components/prompt-edit-modal';
import PromptExpandModal from './components/prompt-expand-modal';
import DownloadDropdown from './components/download-dropdown';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const PS = 'admin.workflowManagement.promptStore';

type LanguageFilter = 'all' | 'ko' | 'en';
type TypeFilter = 'all' | 'user' | 'system';
type VisibilityFilter = 'all' | 'template' | 'shared' | 'private';

// ─────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────

const AdminPromptStorePage: React.FC<RouteComponentProps> = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Data
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<Prompt | null>(null);

  // Download dropdown
  const [downloadOpen, setDownloadOpen] = useState(false);

  // ── Load prompts ──
  const loadPrompts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPrompts({
        language: languageFilter === 'all' ? undefined : languageFilter,
      });
      setPrompts(data.prompts ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t(`${PS}.error`);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [languageFilter, t]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // ── Filtered prompts ──
  const filteredPrompts = useMemo(() => {
    let result = prompts;

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((p) => p.prompt_type === typeFilter);
    }

    // Visibility filter
    if (visibilityFilter === 'template') {
      result = result.filter((p) => p.is_template);
    } else if (visibilityFilter === 'shared') {
      result = result.filter((p) => p.public_available);
    } else if (visibilityFilter === 'private') {
      result = result.filter((p) => !p.public_available);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.prompt_title.toLowerCase().includes(q) ||
          p.prompt_content.toLowerCase().includes(q) ||
          (p.username && p.username.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [prompts, typeFilter, visibilityFilter, searchQuery]);

  // ── Handlers ──
  const handleCopy = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.prompt_content);
      toast.success(t(`${PS}.toast.copySuccess`));
    } catch {
      // Clipboard not available
    }
  };

  const handleDelete = async (prompt: Prompt) => {
    const confirmed = await toast.confirm({
      title: t(`${PS}.toast.deleteConfirmTitle`),
      message: t(`${PS}.toast.deleteConfirmMessage`, {
        item: prompt.prompt_title,
        type: t(`${PS}.toast.itemType`),
      }),
      variant: 'danger',
      confirmText: t(`${PS}.toast.delete`),
      cancelText: t(`${PS}.toast.cancel`),
    });
    if (!confirmed) return;

    try {
      await deletePrompt({ prompt_uid: prompt.prompt_uid });
      await loadPrompts();
    } catch {
      // Error handled by API layer
    }
  };

  // ── Language tab config ──
  const languageTabs: { key: LanguageFilter; label: string }[] = [
    { key: 'all', label: `🌐 ${t(`${PS}.languageFilter.all`)}` },
    { key: 'ko', label: `🇰🇷 ${t(`${PS}.languageFilter.ko`)}` },
    { key: 'en', label: `🇺🇸 ${t(`${PS}.languageFilter.en`)}` },
  ];

  const typeTabs: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: t(`${PS}.promptTypeFilter.all`) },
    { key: 'user', label: t(`${PS}.promptTypeFilter.user`) },
    { key: 'system', label: t(`${PS}.promptTypeFilter.system`) },
  ];

  const visibilityTabs: { key: VisibilityFilter; label: string }[] = [
    { key: 'all', label: t(`${PS}.filter.all`) },
    { key: 'template', label: t(`${PS}.filter.template`) },
    { key: 'shared', label: t(`${PS}.filter.shared`) },
    { key: 'private', label: t(`${PS}.filter.private`) },
  ];

  // ── Error state ──
  if (error && prompts.length === 0) {
    return (
      <ContentArea>
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <h3 className="text-base font-semibold text-destructive">
            {t(`${PS}.error`)}
          </h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="primary" onClick={loadPrompts}>
            {t(`${PS}.refresh`)}
          </Button>
        </div>
      </ContentArea>
    );
  }

  // ── Render ──
  return (
    <ContentArea>
      <div className="flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {t(`${PS}.title`)}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(`${PS}.subtitle`)}
            </p>
          </div>
        </div>

        {/* Controls bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
          {/* Language filter tabs */}
          <div className="flex items-center gap-1">
            {languageTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  languageFilter === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setLanguageFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Prompt type filter */}
          <div className="flex items-center gap-1">
            {typeTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  typeFilter === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setTypeFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Visibility filter */}
          <div className="flex items-center gap-1">
            {visibilityTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  visibilityFilter === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setVisibilityFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search + actions bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <input
            type="text"
            className="min-w-[240px] flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder={t(`${PS}.searchPlaceholder`)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Actions */}
          <div className="relative flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDownloadOpen((prev) => !prev)}
            >
              <FiDownload className="mr-1 h-3.5 w-3.5" />
              {t(`${PS}.download.title`)}
            </Button>
            <DownloadDropdown
              isOpen={downloadOpen}
              onToggle={() => setDownloadOpen(false)}
            />
            <Button variant="primary" size="sm" onClick={loadPrompts}>
              <FiRefreshCw className="mr-1 h-3.5 w-3.5" />
              {t(`${PS}.refresh`)}
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            <p className="text-sm">{t(`${PS}.loading`)}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredPrompts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? t(`${PS}.noResultsSearch`)
                : prompts.length === 0
                  ? t(`${PS}.noResults`)
                  : t(`${PS}.noResultsFilter`)}
            </p>
          </div>
        )}

        {/* Prompt grid */}
        {!loading && filteredPrompts.length >= 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Add new card */}
            <button
              type="button"
              className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-card p-4 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              onClick={() => setCreateModalOpen(true)}
            >
              <FiPlus className="h-8 w-8" />
              <span className="text-sm font-semibold">
                {t(`${PS}.addCard.title`)}
              </span>
              <span className="text-xs">
                {t(`${PS}.addCard.description`)}
              </span>
            </button>

            {/* Prompt cards */}
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onCopy={handleCopy}
                onEdit={(p) => setEditingPrompt(p)}
                onDelete={handleDelete}
                onClick={(p) => setExpandedPrompt(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <PromptCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={loadPrompts}
      />

      {/* Edit Modal */}
      {editingPrompt && (
        <PromptEditModal
          isOpen={!!editingPrompt}
          prompt={editingPrompt}
          onClose={() => setEditingPrompt(null)}
          onUpdated={loadPrompts}
        />
      )}

      {/* Expand Modal */}
      {expandedPrompt && (
        <PromptExpandModal
          isOpen={!!expandedPrompt}
          prompt={expandedPrompt}
          onClose={() => setExpandedPrompt(null)}
        />
      )}
    </ContentArea>
  );
};

// ─────────────────────────────────────────────────────────────
// Feature Module
// ─────────────────────────────────────────────────────────────

const feature: AdminFeatureModule = {
  id: 'admin-prompt-store',
  name: 'AdminPromptStorePage',
  adminSection: 'admin-workflow',
  routes: {
    'admin-prompt-store': AdminPromptStorePage,
  },
};

export default feature;
