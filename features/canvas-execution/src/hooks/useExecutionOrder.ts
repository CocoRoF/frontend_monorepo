import { useState, useCallback, useEffect, useRef } from 'react';
import type { ExecutionOrderData } from '../types';

// ── Helpers ────────────────────────────────────────────────────

const getGraphStructureSignature = (state: any, wfId: string): string => {
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

// ── Hook ───────────────────────────────────────────────────────

interface UseExecutionOrderOptions {
    workflowId: string;
    workflowName: string;
    userId?: string | null;
    canvasState?: any;
    mockExecutionOrder?: ExecutionOrderData | null;
    fetchExecutionOrderByData?: (data: any) => Promise<ExecutionOrderData>;
    debounceMs?: number;
}

interface UseExecutionOrderReturn {
    executionOrder: ExecutionOrderData | null;
    isLoadingOrder: boolean;
    refetch: () => void;
}

export function useExecutionOrder(options: UseExecutionOrderOptions): UseExecutionOrderReturn {
    const {
        workflowId,
        workflowName,
        userId,
        canvasState,
        mockExecutionOrder,
        fetchExecutionOrderByData,
        debounceMs = 300,
    } = options;

    const [executionOrder, setExecutionOrder] = useState<ExecutionOrderData | null>(
        mockExecutionOrder ?? null
    );
    const [isLoadingOrder, setIsLoadingOrder] = useState(false);

    const previousStructureRef = useRef<string>('');
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchOrder = useCallback(async () => {
        const nodes = canvasState ? (canvasState.nodes || []) : [];
        if (nodes.length === 0) {
            setExecutionOrder(null);
            return;
        }
        if (!fetchExecutionOrderByData) return;

        setIsLoadingOrder(true);
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
    }, [canvasState, workflowName, workflowId, userId, fetchExecutionOrderByData]);

    useEffect(() => {
        if (mockExecutionOrder !== undefined) {
            setExecutionOrder(mockExecutionOrder ?? null);
            return;
        }
        const currentStructure = getGraphStructureSignature(canvasState, workflowId);
        if (currentStructure === previousStructureRef.current && executionOrder) return;
        previousStructureRef.current = currentStructure;

        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(fetchOrder, debounceMs);

        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [canvasState, workflowId, mockExecutionOrder, fetchOrder, debounceMs, executionOrder]);

    const refetch = useCallback(() => {
        previousStructureRef.current = '';
        fetchOrder();
    }, [fetchOrder]);

    return { executionOrder, isLoadingOrder, refetch };
}
