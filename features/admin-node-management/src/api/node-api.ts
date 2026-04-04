import { createApiClient } from '@xgen/api-client';
import type { NodeCategory } from '../types';

const api = createApiClient();

export async function getNodes(): Promise<NodeCategory[]> {
  const res = await api.get<NodeCategory[]>('/api/node/get');
  return res.data;
}
