import { createApiClient } from '@xgen/api-client';
import type { TokenUsageResponse } from '../types';

const api = createApiClient();

export async function getUserTokenUsage(params?: {
  page?: number;
  page_size?: number;
  start_date?: string;
  end_date?: string;
}): Promise<TokenUsageResponse> {
  const res = await api.get<TokenUsageResponse>('/api/admin/user-token/usage', { params });
  return res.data;
}
