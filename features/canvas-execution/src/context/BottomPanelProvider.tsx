import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { BottomPanelContext } from './BottomPanelContext';
import type {
    PanelMode,
    ExecutionOutput,
    ChatMessage,
    LogEntry,
    ExecutionOrderData,
    ExecutionNodeState,
    ExecutionNodeStatus,
    BottomPanelProviderProps,
    BottomPanelContextValue,
} from '../types';
import { hasError, hasOutputs, isStreamingOutput } from '../types';

// ── Constants ──────────────────────────────────────────────────

const STORAGE_KEY_HEIGHT = 'xgen:bottomPanel:height';
const STORAGE_KEY_CHAT = 'xgen:chat:';
const DEFAULT_HEIGHT = 300;
const MIN_HEIGHT = 150;
const MAX_CHAT_MESSAGES = 50;

// ── Helpers ────────────────────────────────────────────────────

const getGraphStructureSignature = (state: any, wfId: string) => {
    if (!state) return `${wfId}|`;
    const nodes = state.nodes || [];
    const edges = state.edges || [];
    const nodeSignatures = nodes
        .map((n: any) =>
            `${n.id}:${n.data?.nodeName}:${Math.round(n.position?.x || 0)}:${Math.round(n.position?.y || 0)}`
        )
        .sort()
        .join(',');
    const edgeSignatures = edges
        .map((e: any) => `${e.source}:${e.sourceHandle}-${e.target}:${e.targetHandle}`)
        .sort()
        .join(',');
    return `${wfId}|${nodeSignatures}|${edgeSignatures}`;
};

const normalizeExecutionOrder = (data: any): ExecutionOrderData | null => {
    if (!data) return null;
    if (data.parallel_execution_order) return data;
    if (data.execution_order) {
        return { ...data, parallel_execution_order: data.execution_order.map((id: string) => [id]) };
    }
    return data;
};

const loadHeight = (): number => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_HEIGHT);
        if (stored) {
            const h = parseInt(stored, 10);
            if (!isNaN(h) && h >= MIN_HEIGHT) return h;
        }
    } catch { /* ignore */ }
    return DEFAULT_HEIGHT;
};

const saveHeight = (h: number) => {
    try { localStorage.setItem(STORAGE_KEY_HEIGHT, String(h)); } catch { /* ignore */ }
};

const loadChatMessages = (workflowId: string): ChatMessage[] => {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY_CHAT + workflowId);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return [];
};

const saveChatMessages = (workflowId: string, messages: ChatMessage[]) => {
    try {
        const trimmed = messages.slice(-MAX_CHAT_MESSAGES);
        sessionStorage.setItem(STORAGE_KEY_CHAT + workflowId, JSON.stringify(trimmed));
    } catch { /* ignore */ }
};

// ── Provider ───────────────────────────────────────────────────

export const BottomPanelProvider: React.FC<BottomPanelProviderProps> = ({
    onExecute,
    workflowId,
    workflowName,
    userId,
    canvasState,
    mockExecutionOrder,
    fetchExecutionOrderByData,
    LogViewerComponent,
    children,
}: BottomPanelProviderProps) => {
    // ── Panel state ────────────────────────────────────────────
    const [panelMode, setPanelMode] = useState<PanelMode>('collapsed');
    const [panelHeight, setPanelHeightState] = useState<number>(loadHeight);

    // ── Execution state ────────────────────────────────────────
    const [executionOutput, setExecutionOutput] = useState<ExecutionOutput>(null);
    const [executionSource, setExecutionSource] = useState<'button' | 'chat' | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);

    // ── Chat state ─────────────────────────────────────────────
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => loadChatMessages(workflowId));
    const [chatInput, setChatInput] = useState('');
    const chatMsgIdRef = useRef(0);
    const lastOutputRef = useRef<string>('');

    // ── Executor state ─────────────────────────────────────────
    const [buttonResultText, setButtonResultText] = useState('');

    // ── Execution order ────────────────────────────────────────
    const [executionOrder, setExecutionOrder] = useState<ExecutionOrderData | null>(mockExecutionOrder ?? null);
    const [isLoadingOrder, setIsLoadingOrder] = useState(false);
    const previousStructureRef = useRef<string>('');
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Log state ──────────────────────────────────────────────
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // ── Tab state ──────────────────────────────────────────────
    const [activeExecutionTab, setActiveExecutionTab] = useState<'chat' | 'executor'>('chat');

    // ── Node execution states ──────────────────────────────────
    const [nodeStates, setNodeStates] = useState<Map<string, ExecutionNodeState>>(new Map());

    // ── Panel actions ──────────────────────────────────────────
    const togglePanel = useCallback(() => {
        setPanelMode((prev: PanelMode) => prev === 'collapsed' ? 'expanded' : 'collapsed');
    }, []);

    const expandPanel = useCallback(() => {
        setPanelMode('expanded');
    }, []);

    const collapsePanel = useCallback(() => {
        setPanelMode('collapsed');
    }, []);

    const setFullscreen = useCallback((enabled: boolean) => {
        setPanelMode(enabled ? 'fullscreen' : 'expanded');
    }, []);

    const setPanelHeight = useCallback((height: number) => {
        setPanelHeightState(height);
        saveHeight(height);
    }, []);

    // ── Output routing ─────────────────────────────────────────
    useEffect(() => {
        const currentText = (() => {
            if (!executionOutput) return '';
            if (hasError(executionOutput)) return `Error: ${executionOutput.error}`;
            if (isStreamingOutput(executionOutput)) return executionOutput.stream;
            if (hasOutputs(executionOutput)) return JSON.stringify(executionOutput.outputs, null, 2);
            return '';
        })();

        if (!currentText || currentText === lastOutputRef.current) return;
        lastOutputRef.current = currentText;

        if (executionSource === 'chat') {
            setChatMessages((prev: ChatMessage[]) => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.role === 'assistant') {
                    return [...prev.slice(0, -1), { ...lastMsg, content: currentText }];
                }
                return [...prev, {
                    id: ++chatMsgIdRef.current,
                    role: 'assistant',
                    content: currentText,
                    timestamp: Date.now(),
                }];
            });
        } else {
            setButtonResultText(currentText);
        }
    }, [executionOutput, executionSource]);

    // ── Auto-switch tabs & auto-expand ─────────────────────────
    useEffect(() => {
        if (executionSource === 'button' && isExecuting) {
            setButtonResultText('');
            setActiveExecutionTab('executor');
            expandPanel();
        }
    }, [executionSource, isExecuting, expandPanel]);

    useEffect(() => {
        if (executionSource === 'chat' && isExecuting) {
            setActiveExecutionTab('chat');
            expandPanel();
        }
    }, [executionSource, isExecuting, expandPanel]);

    // ── Chat persistence ───────────────────────────────────────
    useEffect(() => {
        saveChatMessages(workflowId, chatMessages);
    }, [chatMessages, workflowId]);

    // ── Chat send ──────────────────────────────────────────────
    const sendChatMessage = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isExecuting) return;

        setChatMessages((prev: ChatMessage[]) => [...prev, {
            id: ++chatMsgIdRef.current,
            role: 'user',
            content: trimmed,
            timestamp: Date.now(),
        }]);
        setChatInput('');
        lastOutputRef.current = '';

        // Add assistant placeholder
        setChatMessages((prev: ChatMessage[]) => [...prev, {
            id: ++chatMsgIdRef.current,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
        }]);

        await onExecute(trimmed);
    }, [isExecuting, onExecute]);

    // ── Clear actions ──────────────────────────────────────────
    const clearLogs = useCallback(() => setLogs([]), []);
    const clearOutput = useCallback(() => {
        setExecutionOutput(null);
        setButtonResultText('');
        lastOutputRef.current = '';
    }, []);

    // ── Node state management ──────────────────────────────────
    const updateNodeState = useCallback((nodeId: string, status: ExecutionNodeStatus, error?: string) => {
        setNodeStates((prev: Map<string, ExecutionNodeState>) => {
            const next = new Map(prev);
            const existing = next.get(nodeId);
            next.set(nodeId, {
                nodeId,
                status,
                startedAt: status === 'running' ? Date.now() : existing?.startedAt,
                completedAt: (status === 'completed' || status === 'failed') ? Date.now() : undefined,
                error,
            });
            return next;
        });
    }, []);

    // ── Execution order fetching ───────────────────────────────
    const fetchOrder = useCallback(async () => {
        const nodes = canvasState ? (canvasState.nodes || []) : [];
        if (nodes.length === 0) {
            setExecutionOrder(null);
            return;
        }
        if (!fetchExecutionOrderByData) return;

        if (!executionOrder) setIsLoadingOrder(true);
        try {
            const workflowData = {
                ...canvasState,
                workflow_name: workflowName,
                workflow_id: workflowId,
                user_id: userId || undefined,
            };
            const result = await fetchExecutionOrderByData(workflowData);
            setExecutionOrder(normalizeExecutionOrder(result));
        } catch {
            setExecutionOrder(null);
        } finally {
            setIsLoadingOrder(false);
        }
    }, [canvasState, workflowName, workflowId, userId, fetchExecutionOrderByData, executionOrder]);

    useEffect(() => {
        if (mockExecutionOrder !== undefined) {
            setExecutionOrder(mockExecutionOrder ?? null);
            return;
        }
        const currentStructure = getGraphStructureSignature(canvasState, workflowId);
        if (currentStructure === previousStructureRef.current && executionOrder) return;
        previousStructureRef.current = currentStructure;
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(fetchOrder, 300);
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [canvasState, workflowId, mockExecutionOrder, fetchOrder, executionOrder]);

    // ── Context value ──────────────────────────────────────────
    const value = useMemo<BottomPanelContextValue>(() => ({
        // State
        panelMode,
        panelHeight,
        executionOutput,
        executionSource,
        isExecuting,
        chatMessages,
        chatInput,
        buttonResultText,
        executionOrder,
        isLoadingOrder,
        logs,
        activeExecutionTab,
        nodeStates,

        // Actions
        togglePanel,
        expandPanel,
        collapsePanel,
        setFullscreen,
        setPanelHeight,
        setExecutionOutput,
        setExecutionSource,
        setIsExecuting,
        setLogs,
        clearLogs,
        clearOutput,
        sendChatMessage,
        setChatInput,
        setActiveExecutionTab,
        setNodeStates,
        updateNodeState,
    }), [
        panelMode, panelHeight, executionOutput, executionSource, isExecuting,
        chatMessages, chatInput, buttonResultText, executionOrder, isLoadingOrder,
        logs, activeExecutionTab, nodeStates,
        togglePanel, expandPanel, collapsePanel, setFullscreen, setPanelHeight,
        clearLogs, clearOutput, sendChatMessage, updateNodeState,
    ]);

    return (
        <BottomPanelContext.Provider value={value}>
            {children}
        </BottomPanelContext.Provider>
    );
};

export default BottomPanelProvider;
