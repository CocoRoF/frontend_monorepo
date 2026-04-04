import { createApiClient } from '@xgen/api-client';
import type {
  BatchSessionsResponse,
  BatchResultsResponse,
  ActiveSessionsResponse,
} from '../types';

const api = createApiClient();

// ─────────────────────────────────────────────────────────────
// Admin Batch Session APIs
// ─────────────────────────────────────────────────────────────

export async function getBatchSessions(
  page: number,
  pageSize: number,
): Promise<BatchSessionsResponse> {
  const res = await api.get<BatchSessionsResponse>(
    '/api/admin/workflow/batch/sessions',
    { params: { page, page_size: pageSize } },
  );
  return res.data;
}

export async function getBatchResults(
  batchId: string,
): Promise<BatchResultsResponse> {
  const res = await api.get<BatchResultsResponse>(
    `/api/admin/workflow/batch/results/${batchId}`,
  );
  return res.data;
}

export async function getActiveSessionsForUsers(
  userIds: number[],
): Promise<ActiveSessionsResponse> {
  const res = await api.get<ActiveSessionsResponse>(
    '/api/workflow/execute/batch/admin/active-sessions',
    { params: { user_ids: userIds.join(',') } },
  );
  return res.data;
}

export async function cancelBatch(batchId: string): Promise<void> {
  await api.post(`/api/workflow/execute/batch/cancel/${batchId}`);
}

export async function deleteBatch(batchId: string): Promise<void> {
  await api.delete(`/api/workflow/execute/batch/delete/${batchId}`);
}
