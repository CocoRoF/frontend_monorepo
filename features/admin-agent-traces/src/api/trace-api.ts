import { createApiClient } from '@xgen/api-client';
import type { TraceListResponse, TraceDetailResponse } from '../types';

const api = createApiClient();

// ─────────────────────────────────────────────────────────────
// Agent Trace APIs
// ─────────────────────────────────────────────────────────────

export async function getTraceList(params?: {
  page?: number;
  page_size?: number;
  workflow_id?: string;
  status?: string;
}): Promise<TraceListResponse> {
  const res = await api.get<TraceListResponse>('/api/workflow/trace/list', {
    params: {
      page: params?.page,
      page_size: params?.page_size,
      workflow_id: params?.workflow_id,
      status: params?.status,
    },
  });
  return res.data;
}

export async function getTraceDetail(
  traceId: string,
): Promise<TraceDetailResponse> {
  const res = await api.get<TraceDetailResponse>(
    `/api/workflow/trace/detail/${encodeURIComponent(traceId)}`,
  );
  return res.data;
}
