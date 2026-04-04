import { createApiClient } from '@xgen/api-client';
import type { Prompt, PromptListResponse } from '../types';

const api = createApiClient();

// ─────────────────────────────────────────────────────────────
// Prompt Store Admin APIs
// ─────────────────────────────────────────────────────────────

export async function getAllPrompts(options?: {
  limit?: number;
  offset?: number;
  language?: string;
}): Promise<PromptListResponse> {
  const res = await api.get<PromptListResponse>('/api/admin/prompt/list', {
    params: {
      limit: options?.limit,
      offset: options?.offset,
      language: options?.language,
    },
  });
  return res.data;
}

export async function createPrompt(data: {
  prompt_title: string;
  prompt_content: string;
  prompt_type: 'user' | 'system';
  public_available: boolean;
  is_template: boolean;
  language: string;
}): Promise<Prompt> {
  const res = await api.post<Prompt>('/api/admin/prompt/create', data);
  return res.data;
}

export async function updatePrompt(data: {
  prompt_uid: string;
  prompt_title: string;
  prompt_content: string;
  prompt_type: 'user' | 'system';
  public_available: boolean;
  is_template: boolean;
  language: string;
}): Promise<Prompt> {
  const res = await api.post<Prompt>('/api/admin/prompt/update', data);
  return res.data;
}

export async function deletePrompt(data: {
  prompt_uid: string;
}): Promise<void> {
  await api.delete('/api/admin/prompt/delete', { data });
}

export async function downloadAllPrompts(params?: {
  format?: string;
  user_id?: string;
  language?: string;
  public_available?: string;
  is_template?: string;
}): Promise<Blob> {
  const qs = new URLSearchParams();
  if (params?.format) qs.set('format', params.format);
  if (params?.user_id) qs.set('user_id', params.user_id);
  if (params?.language) qs.set('language', params.language);
  if (params?.public_available) qs.set('public_available', params.public_available);
  if (params?.is_template) qs.set('is_template', params.is_template);

  const queryString = qs.toString();
  const url = `/api/admin/prompt/download/all-prompts${queryString ? `?${queryString}` : ''}`;

  const tokenMatch =
    typeof document !== 'undefined'
      ? document.cookie.match(/xgen_access_token=([^;]+)/)
      : null;

  const headers: Record<string, string> = {};
  if (tokenMatch) {
    headers['Authorization'] = `Bearer ${tokenMatch[1]}`;
  }

  const response = await fetch(url, { method: 'GET', headers });
  if (!response.ok) {
    throw new Error('Download failed');
  }
  return response.blob();
}
