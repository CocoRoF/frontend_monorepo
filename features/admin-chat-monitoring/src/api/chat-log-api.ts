import { createApiClient } from '@xgen/api-client';
import type { ChatLogsResponse } from '../types';

const api = createApiClient();

export async function getChatLogs(
  page: number,
  pageSize: number,
  userId?: number | null,
): Promise<ChatLogsResponse> {
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };
  if (userId != null) {
    params.user_id = userId;
  }
  const response = await api.get<ChatLogsResponse>(
    '/api/admin/workflow/all-io-logs',
    { params },
  );
  return response.data;
}

export async function downloadChatLogsExcel(
  userId?: string,
  workflowId?: string,
  startDate?: string,
  endDate?: string,
  dataProcessing?: boolean,
): Promise<Blob> {
  // For blob downloads the standard api client parses JSON, so we build
  // the URL the same way the client would and use fetch directly with the
  // same auth cookie the client relies on.  This is the accepted monorepo
  // pattern for file-download endpoints.
  const params = new URLSearchParams();
  if (userId) params.set('user_id', userId);
  if (workflowId) params.set('workflow_id', workflowId);
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  if (dataProcessing !== undefined) params.set('data_processing', String(dataProcessing));

  const qs = params.toString();
  const url = `/api/admin/workflow/download/excel/all-io-logs${qs ? `?${qs}` : ''}`;

  // Reuse the cookie-based auth that the ApiClient uses
  const tokenMatch = typeof document !== 'undefined'
    ? document.cookie.match(/xgen_access_token=([^;]+)/)
    : null;

  const headers: Record<string, string> = {};
  if (tokenMatch) {
    headers['Authorization'] = `Bearer ${tokenMatch[1]}`;
  }

  const response = await fetch(url, { method: 'GET', headers });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({ detail: 'Download failed' }));
    throw new Error(errBody.detail || `HTTP ${response.status}`);
  }
  return response.blob();
}
