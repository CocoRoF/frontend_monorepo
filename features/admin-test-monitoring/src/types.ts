// ─────────────────────────────────────────────────────────────
// Test Monitoring — Types
// ─────────────────────────────────────────────────────────────

export interface BatchSession {
  id: number;
  batch_id: string;
  user_id: number;
  username?: string;
  workflow_id: string;
  workflow_name: string;
  status: 'running' | 'completed' | 'cancelled' | 'error';
  total_count: number;
  completed_count: number;
  success_count: number;
  error_count: number;
  progress: number;
  config_data: string;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface BatchResult {
  test_case_id: number;
  db_id: number;
  input_data: string;
  expected_output: string;
  actual_output: string;
  llm_eval_score: number | null;
  llm_eval_reason: string | null;
  status: string;
  execution_time_ms: number;
  created_at: string;
}

export interface SessionWithResults extends BatchSession {
  results?: BatchResult[];
  resultsLoading?: boolean;
  resultsExpanded?: boolean;
}

export interface ActiveSession {
  is_running: boolean;
  batch_id: string | null;
  workflow_name: string | null;
  completed_count: number;
  total_count: number;
  progress: number;
}

export interface BatchSessionsResponse {
  sessions: BatchSession[];
  accessible_user_ids: number[];
  total: number;
}

export interface BatchResultsResponse {
  results: BatchResult[];
}

export interface ActiveSessionsResponse {
  active_sessions: BatchSession[];
}
