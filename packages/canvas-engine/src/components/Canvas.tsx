'use client';

import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import type { CanvasNode, CanvasEdge, CanvasMemo, EdgePreview, Position, View, PredictedNode } from '@xgen/canvas-types';
import { areTypesCompatible } from '../utils/canvas-utils';
import type { CanvasProps, CanvasRef } from '../types';

// Hooks
import { useCanvasView } from '../hooks/useCanvasView';
import { useCanvasSelection } from '../hooks/useCanvasSelection';
import { useNodeManagement } from '../hooks/useNodeManagement';
import { useEdgeManagement } from '../hooks/useEdgeManagement';
import { useMemoManagement } from '../hooks/useMemoManagement';
import { useDragState } from '../hooks/useDragState';
import { usePredictedNodes } from '../hooks/usePredictedNodes';
import { useCanvasEventHandlers } from '../hooks/useCanvasEventHandlers';
import { usePortHandlers } from '../hooks/usePortHandlers';
import { useKeyboardHandlers } from '../hooks/useKeyboardHandlers';
import { useAutoConnect } from '../hooks/useAutoConnect';
import { useHistoryManagement } from '../hooks/useHistoryManagement';

// Components
import { CanvasNodes } from './CanvasNodes';
import { CanvasEdges } from './CanvasEdges';
import { CanvasMemos } from './CanvasMemos';
import { CanvasPredictedNodes } from './CanvasPredictedNodes';

import styles from '../styles/Canvas.module.scss';

// ── Constants ──────────────────────────────────────────────────

const ZOOM_STEP = 0.1;
const MIN_SCALE = 0.1;
const MAX_SCALE = 2.0;

// ── Component ──────────────────────────────────────────────────

export const Canvas = forwardRef<CanvasRef, CanvasProps>(function Canvas(props, ref) {
    const {
        initialNodes = [],
        initialEdges = [],
        initialMemos = [],
        availableNodeSpecs = [],
        readOnly = false,
        onNodesChange,
        onEdgesChange,
        onMemosChange,
        onStateChange,
        onNodeContextMenu,
        onCanvasContextMenu,
        onNodeDoubleClick,
        onOpenNodeModal,
        onViewDetails,
        className,
    } = props;

    // ── Refs ──
    const containerRef = useRef<HTMLDivElement>(null);
    const edgePreviewRef = useRef<EdgePreview | null>(null);
    const snappedPortKeyRef = useRef<string | null>(null);

    // ── Additional state ──
    const [edgePreview, setEdgePreview] = useState<EdgePreview | null>(null);
    const [snappedPortKey, setSnappedPortKey] = useState<string | null>(null);
    const [isSnapTargetValid, setIsSnapTargetValid] = useState(false);
    const [portClickStart, setPortClickStart] = useState<any>(null);
    const [portPositions] = useState<Record<string, Position>>({});
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [selectedMemoIds, setSelectedMemoIds] = useState<string[]>([]);

    // ── Hooks composition ──

    // 1. History management
    const history = useHistoryManagement();

    const historyHelpers = useMemo(() => ({
        recordNodeMove: (nodeId: string, fromPosition: { x: number; y: number }, toPosition: { x: number; y: number }) => {
            history.addHistoryEntry('NODE_MOVE', `Move node ${nodeId}`, { nodeId, fromPosition, toPosition });
        },
        recordNodeCreate: (nodeId: string, nodeType: string, position: { x: number; y: number }) => {
            history.addHistoryEntry('NODE_CREATE', `Create node ${nodeType}`, { nodeId, nodeType, position });
        },
        recordNodeDelete: (nodeId: string, nodeType: string) => {
            history.addHistoryEntry('NODE_DELETE', `Delete node ${nodeType}`, { nodeId, nodeType });
        },
        recordEdgeCreate: (edgeId: string, sourceId: string, targetId: string) => {
            history.addHistoryEntry('EDGE_CREATE', `Create edge`, { edgeId, sourceId, targetId });
        },
        recordEdgeDelete: (edgeId: string, sourceId: string, targetId: string) => {
            history.addHistoryEntry('EDGE_DELETE', `Delete edge`, { edgeId, sourceId, targetId });
        },
        recordMultiAction: (description: string, actions: any[]) => {
            history.addHistoryEntry('MULTI_ACTION', description, { actions });
        },
    }), [history]);

    // 2. Canvas view (pan & zoom)
    const { view, setView, getCenteredView, handleWheel } = useCanvasView({ containerRef });

    // 3. Selection
    const {
        selectedNodeIds, selectedEdgeIds, clearSelection,
        selectNode, selectEdge, toggleNodeSelection, toggleEdgeSelection, setSelection,
    } = useCanvasSelection();

    // 4. Edge management
    const {
        edges, setEdges, addEdge, removeEdge, removeNodeEdges,
        isDuplicateEdge, replaceInputEdge,
    } = useEdgeManagement({ historyHelpers });

    // 5. Memo management
    const { memos, setMemos, addMemo, updateMemoContent, updateMemoPosition, deleteMemo } = useMemoManagement();

    // 6. Node management
    const {
        nodes, setNodes, copiedNodes,
        addNode, deleteNode, copyNodes, pasteNodes,
        updateNodeParameter, updateNodeName,
        toggleBypass,
    } = useNodeManagement({ historyHelpers, edges, onPasteEdges: (newEdges) => newEdges.forEach(e => addEdge(e, true)) });

    // 7. Drag state
    const {
        dragState, setDragState,
        startCanvasDrag, startNodeDrag, startEdgeDrag, startSelectionBoxDrag, stopDrag,
    } = useDragState({ historyHelpers });

    // 8. Predicted nodes
    const {
        predictedNodes, setPredictedNodes,
        isDraggingOutput, isDraggingInput,
        setIsDraggingOutput, setIsDraggingInput,
        setCurrentOutputType, setCurrentInputType,
        sourcePortForConnection, setSourcePortForConnection,
        generatePredictedNodes, generatePredictedOutputNodes,
        clearPredictedNodes, isPredictedNodeId,
    } = usePredictedNodes({
        availableNodeSpecs,
        areTypesCompatible,
    });

    // 9. Auto connect
    const { findAutoConnection } = useAutoConnect({
        nodes, edges, selectedNodeIds,
        addEdge, isDuplicateEdge, areTypesCompatible,
    });

    // 10. Port handlers
    const { handlePortMouseDown, handlePortMouseUp } = usePortHandlers({
        edges, nodes, predictedNodes, portPositions,
        isDraggingOutput, isDraggingInput,
        portClickStart,
        edgePreviewRef,
        setPortClickStart, setEdgePreview, setSnappedPortKey, setIsSnapTargetValid,
        setIsDraggingOutput, setIsDraggingInput,
        setCurrentOutputType, setCurrentInputType,
        setSourcePortForConnection, setPredictedNodes, setEdges,
        startEdgeDrag, removeEdge,
        addNode, addEdge,
        clearPredictedNodes, isDuplicateEdge,
        generatePredictedNodes, generatePredictedOutputNodes,
        isNodePredicted: isPredictedNodeId,
    });

    // 11. Canvas event handlers
    const {
        handleCanvasMouseDown, handleMouseMove, handleMouseUp,
        handleNodeMouseDown, handleEdgeClick,
    } = useCanvasEventHandlers({
        dragState, view, portPositions,
        nodes, edges, predictedNodes,
        isDraggingOutput, isDraggingInput,
        portClickStart, selectedNodeIds, selectedEdgeIds,
        containerRef, edgePreviewRef, snappedPortKeyRef,
        setView, setNodes, setEdgePreview, setSnappedPortKey, setIsSnapTargetValid,
        setPortClickStart, setPredictedNodes,
        clearSelection, startCanvasDrag, startSelectionBoxDrag,
        clearPredictedNodes, generatePredictedNodes, generatePredictedOutputNodes,
        stopDrag, selectNode, selectEdge,
        toggleNodeSelection, toggleEdgeSelection, setSelection,
        startNodeDrag, setDragState,
        isNodePredicted: isPredictedNodeId,
        handlePortMouseUp,
    });

    // 12. Keyboard handlers
    const { handleKeyDown } = useKeyboardHandlers({
        selectedNodeIds, selectedEdgeIds,
        copyNodes, pasteNodes,
        deleteNode: (nodeId: string) => {
            const connectedEdges = removeNodeEdges(nodeId);
            deleteNode(nodeId, connectedEdges);
        },
        removeEdge,
        removeNodeEdges,
        clearSelection, selectNode, setSelection,
        toggleBypass,
        toggleExpanded: (nodeId: string) => {
            setExpandedNodes(prev => {
                const next = new Set(prev);
                if (next.has(nodeId)) next.delete(nodeId);
                else next.add(nodeId);
                return next;
            });
        },
        undo: history.undo,
        redo: history.redo,
        canUndo: history.canUndo,
        canRedo: history.canRedo,
        historyHelpers,
        nodes, edges,
    });

    // ── Initialize with initial data ──
    useEffect(() => {
        if (initialNodes.length > 0) setNodes(initialNodes);
        if (initialEdges.length > 0) setEdges(initialEdges);
        if (initialMemos.length > 0) setMemos(initialMemos);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Attach wheel event listener ──
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    // ── Attach keyboard event listener ──
    useEffect(() => {
        if (readOnly) return;
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown, readOnly]);

    // ── Propagate state changes to parent ──
    useEffect(() => {
        onNodesChange?.(nodes);
    }, [nodes, onNodesChange]);

    useEffect(() => {
        onEdgesChange?.(edges);
    }, [edges, onEdgesChange]);

    useEffect(() => {
        onMemosChange?.(memos);
    }, [memos, onMemosChange]);

    useEffect(() => {
        onStateChange?.({ view, nodes, edges, memos });
    }, [view, nodes, edges, memos, onStateChange]);

    // ── Imperative handle ──
    useImperativeHandle(ref, () => ({
        getNodes: () => nodes,
        setNodes,
        getEdges: () => edges,
        setEdges,
        getMemos: () => memos,
        setMemos,
        addNode: (node: CanvasNode) => addNode(node),
        deleteNode: (nodeId: string) => {
            const connectedEdges = removeNodeEdges(nodeId);
            deleteNode(nodeId, connectedEdges);
        },
        addEdge: (edge: CanvasEdge) => addEdge(edge),
        removeEdge: (edgeId: string) => removeEdge(edgeId),
        getView: () => view,
        setView,
        getSelectedNodeIds: () => selectedNodeIds,
        clearSelection,
        validate: () => {
            for (const node of nodes) {
                const inputs = node.data?.inputs ?? [];
                for (const input of inputs) {
                    if (input.required) {
                        const hasConnection = edges.some(
                            (e) => e.target.nodeId === node.id && e.target.portId === input.id,
                        );
                        if (!hasConnection) {
                            return {
                                isValid: false,
                                nodeId: node.id,
                                nodeName: node.data.nodeName,
                                inputName: input.name,
                            };
                        }
                    }
                }
            }
            return { isValid: true };
        },
        undo: () => { history.undo(); },
        redo: () => { history.redo(); },
        canUndo: () => history.canUndo,
        canRedo: () => history.canRedo,
        toggleExpanded: (nodeId: string) => {
            setExpandedNodes(prev => {
                const next = new Set(prev);
                if (next.has(nodeId)) next.delete(nodeId);
                else next.add(nodeId);
                return next;
            });
        },
        findAutoConnection,
        getCanvasState: () => ({ view, nodes, edges, memos }),
        loadWorkflow: (state) => {
            if (state.nodes) setNodes(state.nodes);
            if (state.edges) setEdges(state.edges);
            if (state.memos) setMemos(state.memos);
            if (state.view) setView(state.view);
            clearSelection();
            history.clearHistory();
        },
        zoomIn: () => {
            setView((prev) => {
                const newScale = Math.min(MAX_SCALE, prev.scale + ZOOM_STEP);
                return { ...prev, scale: newScale };
            });
        },
        zoomOut: () => {
            setView((prev) => {
                const newScale = Math.max(MIN_SCALE, prev.scale - ZOOM_STEP);
                return { ...prev, scale: newScale };
            });
        },
        updateNodeParameter: (nodeId, paramId, value) => {
            updateNodeParameter(nodeId, paramId, value);
        },
    }), [
        nodes, edges, memos, view, selectedNodeIds,
        setNodes, setEdges, setMemos, setView,
        addNode, deleteNode, addEdge, removeEdge, removeNodeEdges,
        clearSelection, updateNodeParameter, findAutoConnection,
        history,
    ]);

    // ── Derived values ──
    const selectedNodeIdArray = useMemo(
        () => Array.from(selectedNodeIds),
        [selectedNodeIds],
    );
    const selectedEdgeIdArray = useMemo(
        () => Array.from(selectedEdgeIds),
        [selectedEdgeIds],
    );

    // ── Node callbacks ──
    const handleNodeNameChangeCallback = useCallback(
        (nodeId: string, newName: string) => updateNodeName(nodeId, newName),
        [updateNodeName],
    );

    const handleParameterChangeCallback = useCallback(
        (nodeId: string, paramId: string, value: any) => updateNodeParameter(nodeId, paramId, value),
        [updateNodeParameter],
    );

    const handleNodeToggleExpand = useCallback((nodeId: string) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) next.delete(nodeId);
            else next.add(nodeId);
            return next;
        });
    }, []);

    const handleNodeToggleBypass = useCallback(
        (nodeId: string) => toggleBypass(nodeId),
        [toggleBypass],
    );

    // ── Canvas container class ──
    const containerClassName = [styles.canvasContainer, className].filter(Boolean).join(' ');

    return (
        <div
            ref={containerRef}
            className={containerClassName}
            onMouseDown={readOnly ? undefined : handleCanvasMouseDown}
            onMouseMove={readOnly ? undefined : handleMouseMove}
            onMouseUp={readOnly ? undefined : handleMouseUp}
            onMouseLeave={readOnly ? undefined : () => handleMouseUp()}
            onDoubleClick={readOnly ? undefined : (e) => {
                if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains(styles.canvasGrid)) {
                    const rect = containerRef.current!.getBoundingClientRect();
                    const worldX = (e.clientX - rect.left - view.x) / view.scale;
                    const worldY = (e.clientY - rect.top - view.y) / view.scale;
                    onCanvasContextMenu?.({ x: worldX, y: worldY }, 'add-node');
                }
            }}
        >
            {/* Transformed content layer */}
            <div
                className={styles.canvasGrid}
                style={{
                    transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
                    transformOrigin: '0 0',
                }}
            >
                {/* Nodes */}
                <CanvasNodes
                    nodes={nodes}
                    selectedNodeIds={selectedNodeIdArray}
                    onNodeMouseDown={handleNodeMouseDown}
                    onNodeNameChange={handleNodeNameChangeCallback}
                    onNodeToggleExpand={handleNodeToggleExpand}
                    onNodeToggleBypass={handleNodeToggleBypass}
                    onParameterChange={handleParameterChangeCallback}
                    onOpenNodeModal={onOpenNodeModal}
                    onClearSelection={clearSelection}
                />

                {/* Edges (SVG layer) */}
                <CanvasEdges
                    edges={edges}
                    nodes={nodes}
                    selectedEdgeIds={selectedEdgeIdArray}
                    edgePreview={edgePreview}
                    scale={view.scale}
                    onEdgeClick={(e, edgeId) => handleEdgeClick(edgeId, e)}
                />

                {/* Memos */}
                <CanvasMemos
                    memos={memos}
                    selectedMemoIds={selectedMemoIds}
                    scale={view.scale}
                    onMemoChange={(memoId, changes) => {
                        if (changes.content !== undefined) updateMemoContent(memoId, changes.content);
                        if (changes.position) updateMemoPosition(memoId, changes.position);
                    }}
                    onMemoDelete={deleteMemo}
                />

                {/* Predicted nodes */}
                {predictedNodes.length > 0 && (
                    <CanvasPredictedNodes
                        predictedNodes={predictedNodes}
                    />
                )}

                {/* Selection box */}
                {dragState.type === 'selection-box' && dragState.selectionBox && (
                    <div
                        style={{
                            position: 'absolute',
                            left: Math.min(dragState.selectionBox.startX, dragState.selectionBox.currentX),
                            top: Math.min(dragState.selectionBox.startY, dragState.selectionBox.currentY),
                            width: Math.abs(dragState.selectionBox.currentX - dragState.selectionBox.startX),
                            height: Math.abs(dragState.selectionBox.currentY - dragState.selectionBox.startY),
                            border: '1px solid #305EEB',
                            backgroundColor: 'rgba(48, 94, 235, 0.1)',
                            pointerEvents: 'none',
                            zIndex: 1000,
                        }}
                    />
                )}
            </div>
        </div>
    );
});

export default Canvas;
