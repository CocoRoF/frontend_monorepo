import { useState, useCallback, useEffect, useRef } from 'react';

// ── Constants ──────────────────────────────────────────────────

const MIN_HEIGHT = 150;
const MAX_VH_RATIO = 0.6;

interface UseResizePanelOptions {
    minHeight?: number;
    maxHeight?: number;
    defaultHeight?: number;
    storageKey?: string;
}

interface UseResizePanelReturn {
    height: number;
    isResizing: boolean;
    setHeight: (h: number) => void;
    handleMouseDown: (e: React.MouseEvent) => void;
}

const loadHeight = (storageKey: string, defaultH: number): number => {
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            const h = parseInt(stored, 10);
            if (!isNaN(h) && h >= MIN_HEIGHT) return h;
        }
    } catch { /* ignore */ }
    return defaultH;
};

const saveHeight = (storageKey: string, h: number) => {
    try {
        localStorage.setItem(storageKey, String(h));
    } catch { /* ignore */ }
};

export function useResizePanel(options: UseResizePanelOptions = {}): UseResizePanelReturn {
    const {
        minHeight = MIN_HEIGHT,
        maxHeight,
        defaultHeight = 300,
        storageKey = 'xgen:bottomPanel:height',
    } = options;

    const [height, setHeightState] = useState<number>(() => loadHeight(storageKey, defaultHeight));
    const [isResizing, setIsResizing] = useState(false);

    const startY = useRef(0);
    const startHeight = useRef(0);

    const setHeight = useCallback((h: number) => {
        setHeightState(h);
        saveHeight(storageKey, h);
    }, [storageKey]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        startY.current = e.clientY;
        startHeight.current = height;
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
    }, [height]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const delta = startY.current - e.clientY;
            const max = maxHeight ?? window.innerHeight * MAX_VH_RATIO;
            const newHeight = Math.min(Math.max(startHeight.current + delta, minHeight), max);
            setHeightState(newHeight);
        };

        const handleMouseUp = () => {
            if (!isResizing) return;
            setIsResizing(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            saveHeight(storageKey, height);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, height, minHeight, maxHeight, storageKey]);

    return { height, isResizing, setHeight, handleMouseDown };
}
