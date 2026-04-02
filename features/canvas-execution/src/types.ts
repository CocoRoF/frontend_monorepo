// ═══════════════════════════════════════════════════════════════
// @xgen/feature-canvas-execution — Type Definitions
// ═══════════════════════════════════════════════════════════════

// ── Execution Output Types ─────────────────────────────────────

export interface ExecutionError {
    error: string;
}

export interface ExecutionSuccess {
    outputs: Record<string, any>;
}

export interface ExecutionStream {
    stream: string;
}

export type ExecutionOutput = ExecutionError | ExecutionSuccess | ExecutionStream | null;

// ── Type Guards ────────────────────────────────────────────────

export const hasError = (output: ExecutionOutput): output is ExecutionError =>
    output !== null && 'error' in output;

export const hasOutputs = (output: ExecutionOutput): output is ExecutionSuccess =>
    output !== null && 'outputs' in output;

export const isStreamingOutput = (output: ExecutionOutput): output is ExecutionStream =>
    output !== null && 'stream' in output;

// ── Panel Mode ─────────────────────────────────────────────────

export type PanelMode = 'collapsed' | 'expanded' | 'fullscreen';

// ── Log Types ──────────────────────────────────────────────────

export type LogEventType = 'tool_call' | 'tool_result' | 'tool_error';
export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';

export interface LogEntry {
    level: LogLevel;
    timestamp: string;
    node_id?: string;
    node_name?: string;
    message: string;
    event_type?: LogEventType;
    tool_name?: string;
    tool_input?: string;
    result?: string;
    result_length?: number;
    citations?: string | unknown[];
    error?: string;
}

// ── Chat Types ─────────────────────────────────────────────────

export interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

// ── Execution Order Types ──────────────────────────────────────

export interface ExecutionOrderData {
    parallel_execution_order?: string[][];
    execution_order?: string[];
    nodes?: Record<string, { data?: { nodeName?: string } }>;
}

export type ExecutionGroup = string[];

export type ExecutionNodeStatus = 'pending' | 'running' | 'completed' | 'failed' | 'bypassed';

export interface ExecutionNodeState {
    nodeId: string;
    status: ExecutionNodeStatus;
    startedAt?: number;
    completedAt?: number;
    error?: string;
}

// ── Log Viewer Props (DI interface) ────────────────────────────

export interface LogViewerProps {
    logs: LogEntry[];
    onClearLogs?: () => void;
    className?: string;
}

// ── Context State & Actions ────────────────────────────────────

export interface BottomPanelState {
    panelMode: PanelMode;
    panelHeight: number;
    executionOutput: ExecutionOutput;
    executionSource: 'button' | 'chat' | null;
    isExecuting: boolean;
    chatMessages: ChatMessage[];
    chatInput: string;
    buttonResultText: string;
    executionOrder: ExecutionOrderData | null;
    isLoadingOrder: boolean;
    logs: LogEntry[];
    activeExecutionTab: 'chat' | 'executor';
    nodeStates: Map<string, ExecutionNodeState>;
}

export interface BottomPanelActions {
    togglePanel: () => void;
    expandPanel: () => void;
    collapsePanel: () => void;
    setFullscreen: (enabled: boolean) => void;
    setPanelHeight: (height: number) => void;
    setExecutionOutput: (output: ExecutionOutput) => void;
    setExecutionSource: (source: 'button' | 'chat' | null) => void;
    setIsExecuting: (executing: boolean) => void;
    setLogs: (logs: LogEntry[]) => void;
    clearLogs: () => void;
    clearOutput: () => void;
    sendChatMessage: (text: string) => void;
    setChatInput: (text: string) => void;
    setActiveExecutionTab: (tab: 'chat' | 'executor') => void;
    setNodeStates: (states: Map<string, ExecutionNodeState>) => void;
    updateNodeState: (nodeId: string, status: ExecutionNodeStatus, error?: string) => void;
}

export type BottomPanelContextValue = BottomPanelState & BottomPanelActions;

// ── Bottom Panel Provider Props ────────────────────────────────

export interface BottomPanelProviderProps {
    onExecute: (inputText?: string) => Promise<void>;
    workflowId: string;
    workflowName: string;
    userId?: string | null;
    canvasState?: any;
    mockExecutionOrder?: ExecutionOrderData | null;
    fetchExecutionOrderByData?: (data: any) => Promise<ExecutionOrderData>;
    LogViewerComponent?: React.ComponentType<LogViewerProps>;
    children: React.ReactNode;
}

// ── Component Props (New) ──────────────────────────────────────

export interface ResizeHandleProps {
    onResize: (newHeight: number) => void;
    onResizeEnd?: () => void;
    disabled?: boolean;
}

export interface BottomPanelHeaderProps {
    className?: string;
}

export interface ExecutionColumnProps {
    className?: string;
}

export interface ChatTabProps {
    className?: string;
}

export interface ExecutorTabProps {
    className?: string;
}

export interface ExecutionOrderColumnProps {
    className?: string;
}

export interface ExecutionOrderItemProps {
    index: number;
    group: ExecutionGroup;
    nodeStates: Map<string, ExecutionNodeState>;
    getNodeName: (nodeId: string) => string;
}

export interface LogColumnProps {
    className?: string;
}

// ── Legacy Component Props (kept for backward compat) ──────────

export interface OutputRendererProps {
    output: ExecutionOutput;
}

export interface ExecutionPanelProps {
    onExecute: () => void;
    onClear: () => void;
    output: ExecutionOutput;
    isLoading: boolean;
}

export interface DetailPanelProps {
    embedded?: boolean;
    embeddedLayout?: 'tabs' | 'split';
    workflowName: string;
    workflowId: string;
    userId?: string | null;
    canvasState?: any;
    logs?: any[];
    onClearLogs?: () => void;
    activeNodes?: Set<string>;
    onApplyLayout?: () => void;
    fetchExecutionOrderByData?: (workflowData: any) => Promise<any>;
    fetchExecutionOrder?: (workflowName: string, workflowId: string, userId?: string) => Promise<any>;
    LogViewerComponent?: React.ComponentType<{ logs: any[]; onClearLogs?: () => void }>;
}

export interface BottomExecutionLogPanelProps {
    isExpanded: boolean;
    onToggleExpanded: () => void;
    onClearOutput: () => void;
    onCopyOutput?: () => void;
    output: ExecutionOutput;
    isLoading: boolean;
    workflowName: string;
    workflowId: string;
    userId?: string | null;
    canvasState?: any;
    logs?: any[];
    onClearLogs?: () => void;
    activeNodes?: Set<string>;
    onApplyLayout?: () => void;
    fetchExecutionOrderByData?: (workflowData: any) => Promise<any>;
    fetchExecutionOrder?: (workflowName: string, workflowId: string, userId?: string) => Promise<any>;
    LogViewerComponent?: React.ComponentType<{ logs: any[]; onClearLogs?: () => void }>;
}

export interface CanvasExecutionLogPanelProps {
    expanded: boolean;
    onToggleExpand: () => void;
    onClearLogs: () => void;
    onFullscreen?: () => void;
    children: React.ReactNode;
}

export interface CanvasBottomPanelContentProps {
    output: ExecutionOutput;
    onClearOutput?: () => void;
    logs?: any[];
    onClearLogs?: () => void;
    workflowName: string;
    workflowId: string;
    userId?: string | null;
    canvasState?: any;
    activeNodes?: Set<string>;
    onApplyLayout?: () => void;
    onExecuteWithInput?: (inputText?: string) => Promise<void>;
    isExecuting?: boolean;
    executionSource?: 'button' | 'chat' | null;
    mockExecutionOrder?: {
        parallel_execution_order?: string[][];
        execution_order?: string[];
        nodes?: Record<string, { data?: { nodeName?: string } }>;
    } | null;
    fetchExecutionOrderByData?: (workflowData: any) => Promise<any>;
    LogViewerComponent?: React.ComponentType<{ logs: any[]; onClearLogs?: () => void; className?: string }>;
}
