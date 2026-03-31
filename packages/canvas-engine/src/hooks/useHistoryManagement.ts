import { useState, useCallback, useMemo, useRef } from 'react';

export type HistoryActionType = 'NODE_MOVE' | 'NODE_CREATE' | 'NODE_DELETE' | 'EDGE_CREATE' | 'EDGE_DELETE' | 'EDGE_UPDATE' | 'MULTI_ACTION';

export interface HistoryEntry {
    id: string;
    timestamp: Date;
    actionType: HistoryActionType;
    description: string;
    canvasState?: any;
    details: {
        nodeId?: string;
        edgeId?: string;
        fromPosition?: { x: number; y: number };
        toPosition?: { x: number; y: number };
        nodeType?: string;
        sourceId?: string;
        targetId?: string;
        actions?: Array<{
            actionType: HistoryActionType;
            nodeId?: string;
            edgeId?: string;
            nodeType?: string;
            sourceId?: string;
            targetId?: string;
            position?: { x: number; y: number };
        }>;
        [key: string]: any;
    };
}

export interface UseHistoryManagementReturn {
    history: HistoryEntry[];
    currentHistoryIndex: number;
    addHistoryEntry: (actionType: HistoryActionType, description: string, details?: any, canvasState?: any) => void;
    clearHistory: () => void;
    getHistoryByType: (actionType: HistoryActionType) => HistoryEntry[];
    getRecentHistory: (count: number) => HistoryEntry[];
    historyCount: number;
    canUndo: boolean;
    canRedo: boolean;
    undo: () => HistoryEntry | null;
    redo: () => HistoryEntry | null;
    jumpToHistoryIndex: (index: number) => HistoryEntry[];
    setCanvasStateRestorer: (restorer: (canvasState: any) => void) => void;
    setCurrentStateCapture: (captureFunction: () => any) => void;
    restoreHistory: (history: HistoryEntry[], currentHistoryIndex: number) => void;
}

const MAX_HISTORY_SIZE = 50;
const DUPLICATE_PREVENTION_WINDOW_MS = 100;

const isIdenticalAction = (entry1: HistoryEntry, entry2: Partial<HistoryEntry>): boolean => {
    if (entry1.actionType !== entry2.actionType) return false;
    if (entry1.description !== entry2.description) return false;
    return JSON.stringify(entry1.details) === JSON.stringify(entry2.details);
};

export const useHistoryManagement = (): UseHistoryManagementReturn => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);
    const [currentState, setCurrentState] = useState<any>(null);
    const currentHistoryIndexRef = useRef(-1);
    const historyRef = useRef<HistoryEntry[]>([]);
    const currentStateCaptureRef = useRef<(() => any) | null>(null);
    const canvasStateRestorerRef = useRef<((canvasState: any) => void) | null>(null);

    currentHistoryIndexRef.current = currentHistoryIndex;
    historyRef.current = history;

    const addHistoryEntry = useCallback((
        actionType: HistoryActionType,
        description: string,
        details: any = {},
        canvasState?: any
    ) => {
        const currentTime = Date.now();

        const newEntryInfo = {
            actionType,
            description,
            details
        };

        const currentHistory = historyRef.current;
        const recentEntries = currentHistory.slice(0, Math.min(5, currentHistory.length));
        const isDuplicate = recentEntries.some(recentEntry => {
            const timeDiff = currentTime - recentEntry.timestamp.getTime();
            return timeDiff < DUPLICATE_PREVENTION_WINDOW_MS &&
                   isIdenticalAction(recentEntry, newEntryInfo);
        });

        if (isDuplicate) {
            return;
        }

        const newEntry: HistoryEntry = {
            id: `${currentTime}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(currentTime),
            actionType,
            description,
            details,
            canvasState
        };

        setHistory(prev => {
            const currentIndex = currentHistoryIndexRef.current;
            let currentHistory;
            if (currentIndex === -1) {
                currentHistory = prev;
            } else {
                currentHistory = prev.slice(currentIndex + 1);
            }
            const newHistory = [newEntry, ...currentHistory];
            const finalHistory = newHistory.slice(0, MAX_HISTORY_SIZE);

            historyRef.current = finalHistory;

            return finalHistory;
        });

        setCurrentHistoryIndex(-1);
        setCurrentState(null);
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        historyRef.current = [];
        setCurrentHistoryIndex(-1);
        setCurrentState(null);
    }, []);

    const canUndo = useMemo(() => history.length > 0 && currentHistoryIndex < history.length - 1, [history.length, currentHistoryIndex]);
    const canRedo = useMemo(() => currentHistoryIndex > -1, [currentHistoryIndex]);

    const undo = useCallback(() => {
        if (!canUndo) return null;

        if (currentHistoryIndex === -1 && currentStateCaptureRef.current) {
            const capturedState = currentStateCaptureRef.current();
            setCurrentState(capturedState);
        }

        const newIndex = currentHistoryIndex + 1;
        const targetEntry = history[newIndex];
        setCurrentHistoryIndex(newIndex);

        if (canvasStateRestorerRef.current && targetEntry) {
            try {
                if (targetEntry.canvasState) {
                    canvasStateRestorerRef.current(targetEntry.canvasState);
                }
            } catch (error) {
                console.error('UNDO: Failed to restore state:', error);
            }
        }

        return targetEntry || null;
    }, [canUndo, currentHistoryIndex, history]);

    const redo = useCallback(() => {
        if (!canRedo) return null;

        const newIndex = currentHistoryIndex - 1;
        setCurrentHistoryIndex(newIndex);

        try {
            if (newIndex === -1) {
                if (canvasStateRestorerRef.current && currentState) {
                    canvasStateRestorerRef.current(currentState);
                }
            } else {
                const targetEntry = history[newIndex];
                if (canvasStateRestorerRef.current && targetEntry && targetEntry.canvasState) {
                    canvasStateRestorerRef.current(targetEntry.canvasState);
                }
            }
        } catch (error) {
            console.error('REDO: Failed to restore state:', error);
        }

        return newIndex === -1 ? null : history[newIndex] || null;
    }, [canRedo, currentHistoryIndex, history, currentState]);

    const jumpToHistoryIndex = useCallback((index: number) => {
        if (index < -1 || index >= history.length) return [];

        try {
            if (currentHistoryIndex === -1 && currentStateCaptureRef.current) {
                const capturedState = currentStateCaptureRef.current();
                setCurrentState(capturedState);
            }

            setCurrentHistoryIndex(index);

            if (index === -1) {
                if (canvasStateRestorerRef.current && currentState) {
                    canvasStateRestorerRef.current(currentState);
                }
            } else {
                const targetEntry = history[index];
                if (!targetEntry) return [];

                if (canvasStateRestorerRef.current && targetEntry.canvasState) {
                    canvasStateRestorerRef.current(targetEntry.canvasState);
                }
            }

            return index === -1 ? [] : history.slice(0, index + 1);
        } catch (error) {
            console.error('JUMP: Failed to jump to history index:', error);
            return [];
        }
    }, [history, currentHistoryIndex, currentState]);

    const getHistoryByType = useCallback((actionType: HistoryActionType) => {
        return history.filter(entry => entry.actionType === actionType);
    }, [history]);

    const getRecentHistory = useCallback((count: number) => {
        return history.slice(0, count);
    }, [history]);

    const setCurrentStateCapture = useCallback((captureFunction: () => any) => {
        currentStateCaptureRef.current = captureFunction;
    }, []);

    const restoreHistory = useCallback((savedHistory: HistoryEntry[], savedIndex: number) => {
        setHistory(savedHistory);
        historyRef.current = savedHistory;
        setCurrentHistoryIndex(savedIndex);
        currentHistoryIndexRef.current = savedIndex;
    }, []);

    const historyCount = useMemo(() => history.length, [history]);

    return {
        history,
        currentHistoryIndex,
        addHistoryEntry,
        clearHistory,
        getHistoryByType,
        getRecentHistory,
        historyCount,
        canUndo,
        canRedo,
        undo,
        redo,
        jumpToHistoryIndex,
        setCanvasStateRestorer: (restorer: (canvasState: any) => void) => {
            canvasStateRestorerRef.current = restorer;
        },
        setCurrentStateCapture,
        restoreHistory
    };
};
