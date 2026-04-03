// ─────────────────────────────────────────────────────────────
// Agent Traces — Types
// ─────────────────────────────────────────────────────────────

export interface AgentTrace {
  id: number;
  trace_id: string;
  user_id: number;
  interaction_id: string;
  execution_io_id: number | null;
  workflow_id: string;
  workflow_name: string;
  node_id: string;
  node_name: string;
  status: 'running' | 'completed' | 'error';
  agent_input: string | null;
  agent_output: string | null;
  model_name: string;
  provider: string;
  total_spans: number;
  total_tool_calls: number;
  total_llm_calls: number;
  duration_ms: number | null;
  error_message: string | null;
  metadata: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentTraceSpan {
  id: number;
  trace_id: string;
  span_type:
    | 'agent_input'
    | 'llm_call'
    | 'tool_call'
    | 'tool_output'
    | 'agent_output'
    | 'error'
    | 'rag_search'
    | 'file_process';
  span_order: number;
  tool_name: string | null;
  input_data: string | null;
  output_data: string | null;
  duration_ms: number | null;
  error_message: string | null;
  metadata: string | null;
  created_at: string;
}

export interface TraceListResponse {
  traces: AgentTrace[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TraceDetailResponse {
  trace: AgentTrace;
  spans: AgentTraceSpan[];
}
