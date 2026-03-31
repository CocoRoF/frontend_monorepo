import { useState, useCallback, useRef } from 'react';
import type { View } from '@xgen/canvas-types';

export interface UseCanvasViewProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export interface UseCanvasViewReturn {
    view: View;
    setView: React.Dispatch<React.SetStateAction<View>>;
    getCenteredView: () => View;
    handleWheel: (e: WheelEvent) => void;
}

const MIN_SCALE = 0.1;
const MAX_SCALE = 2.0;
const ZOOM_SPEED = 0.001;

export const useCanvasView = ({ containerRef }: UseCanvasViewProps): UseCanvasViewReturn => {
    const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 });
    const viewRef = useRef(view);
    viewRef.current = view;

    const getCenteredView = useCallback((): View => {
        const container = containerRef.current;
        if (!container) return { x: 0, y: 0, scale: 1 };
        const rect = container.getBoundingClientRect();
        return {
            x: rect.width / 2,
            y: rect.height / 2,
            scale: 1
        };
    }, [containerRef]);

    const handleWheel = useCallback((e: WheelEvent): void => {
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const currentView = viewRef.current;
        const delta = -e.deltaY * ZOOM_SPEED;
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, currentView.scale * (1 + delta)));
        const scaleFactor = newScale / currentView.scale;

        const newX = mouseX - (mouseX - currentView.x) * scaleFactor;
        const newY = mouseY - (mouseY - currentView.y) * scaleFactor;

        setView({ x: newX, y: newY, scale: newScale });
    }, [containerRef]);

    return {
        view,
        setView,
        getCenteredView,
        handleWheel
    };
};
