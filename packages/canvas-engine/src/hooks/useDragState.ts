import { useState, useCallback } from 'react';
import type { DragState, View } from '@xgen/canvas-types';

interface UseDragStateProps {
    historyHelpers?: {
        recordNodeMove: (nodeId: string, fromPosition: { x: number; y: number }, toPosition: { x: number; y: number }) => void;
        recordMultiAction?: (description: string, actions: any[]) => void;
    };
}

export interface UseDragStateReturn {
    dragState: DragState;
    setDragState: React.Dispatch<React.SetStateAction<DragState>>;
    startCanvasDrag: (e: React.MouseEvent, view: View) => void;
    startNodeDrag: (e: React.MouseEvent, nodeId: string, nodePosition: { x: number; y: number }, view: View, selectedNodeIds: Set<string>) => void;
    startEdgeDrag: () => void;
    startSelectionBoxDrag: (e: React.MouseEvent, view: View, containerRect: DOMRect) => void;
    stopDrag: () => void;
}

export const useDragState = ({ historyHelpers }: UseDragStateProps = {}): UseDragStateReturn => {
    const [dragState, setDragState] = useState<DragState>({ type: 'none' });

    const startCanvasDrag = useCallback((e: React.MouseEvent, view: View) => {
        setDragState({
            type: 'canvas',
            startX: e.clientX - view.x,
            startY: e.clientY - view.y
        });
    }, []);

    const startNodeDrag = useCallback((
        e: React.MouseEvent,
        nodeId: string,
        nodePosition: { x: number; y: number },
        view: View,
        selectedNodeIds: Set<string>
    ) => {
        const nodesInDrag = new Set(selectedNodeIds);
        nodesInDrag.add(nodeId);

        // Build initial positions map for all dragged nodes
        // Note: caller should provide nodes array if multi-node positions are needed
        // For now, we store the primary node position and rely on handleMouseMove
        const initialPositions: Record<string, { x: number; y: number }> = {};

        setDragState({
            type: 'node',
            nodeId,
            offsetX: (e.clientX / view.scale) - nodePosition.x,
            offsetY: (e.clientY / view.scale) - nodePosition.y,
            initialNodePosition: { ...nodePosition },
            initialPositions,
        });
    }, []);

    const startEdgeDrag = useCallback(() => {
        setDragState({ type: 'edge' });
    }, []);

    const startSelectionBoxDrag = useCallback((e: React.MouseEvent, view: View, containerRect: DOMRect) => {
        const startX = (e.clientX - containerRect.left - view.x) / view.scale;
        const startY = (e.clientY - containerRect.top - view.y) / view.scale;

        setDragState({
            type: 'selection-box',
            selectionBox: {
                startX,
                startY,
                currentX: startX,
                currentY: startY
            }
        });
    }, []);

    const stopDrag = useCallback(() => {
        const currentDragState = dragState;

        if (currentDragState.type === 'node' && currentDragState.initialPositions && historyHelpers) {
            // Record node move history on stop
            // This is handled by the parent component that knows the final positions
        }

        setDragState({ type: 'none' });
    }, [dragState, historyHelpers]);

    return {
        dragState,
        setDragState,
        startCanvasDrag,
        startNodeDrag,
        startEdgeDrag,
        startSelectionBoxDrag,
        stopDrag
    };
};
