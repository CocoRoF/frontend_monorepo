import { createApiClient } from '@xgen/api-client';
import type { Workflow } from '../types';

const api = createApiClient();

// ─────────────────────────────────────────────────────────────
// Workflow Store APIs
// ─────────────────────────────────────────────────────────────

export async function listWorkflowStore(): Promise<{ workflows: Workflow[] }> {
  const res = await api.get<{ workflows: Workflow[] }>(
    '/api/workflow/store/list',
  );
  return res.data;
}

export async function deleteWorkflowFromStore(
  workflowId: string,
  currentVersion: number,
  isTemplate: boolean,
): Promise<void> {
  await api.delete('/api/workflow/store/delete', {
    params: {
      workflow_id: workflowId,
      current_version: currentVersion,
      is_template: isTemplate,
    },
  });
}

export async function updateWorkflowDeploy(
  workflowId: string,
  updateDict: Record<string, unknown>,
): Promise<void> {
  await api.post(
    `/api/admin/workflow/update/${encodeURIComponent(workflowId)}`,
    updateDict,
  );
}
