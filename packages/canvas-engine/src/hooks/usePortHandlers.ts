import { useCallback } from 'react';
import type {
    CanvasEdge,
    CanvasNode,
    PredictedNode,
    Position,
    EdgePreview
} from '@xgen/canvas-types';
import {
    generatePortKey,
    findPortData,
    isClick,
    areTypesCompatible
} from '../utils/canvas-utils';

export interface PortMouseEventData {
    nodeId: string;
    portId: string;
    portType: 'input' | 'output';
    isMulti?: boolean;
    type: string;
}

interface UsePortHandlersProps {
    edges: CanvasEdge[];
    nodes: CanvasNode[];
    predictedNodes: PredictedNode[];
    portPositions: Record<string, Position>;
    isDraggingOutput: boolean;
    isDraggingInput: boolean;
    portClickStart: { data: PortMouseEventData; timestamp: number; position: { x: number; y: number } } | null;

    edgePreviewRef: React.MutableRefObject<EdgePreview | null>;

    setPortClickStart: React.Dispatch<React.SetStateAction<any>>;
    setEdgePreview: React.Dispatch<React.SetStateAction<EdgePreview | null>>;
    setSnappedPortKey: React.Dispatch<React.SetStateAction<string | null>>;
    setIsSnapTargetValid: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDraggingOutput: (value: boolean) => void;
    setIsDraggingInput: (value: boolean) => void;
    setCurrentOutputType: (value: string | null) => void;
    setCurrentInputType: (value: string | null) => void;
    setSourcePortForConnection: (value: any) => void;
    setPredictedNodes: React.Dispatch<React.SetStateAction<PredictedNode[]>>;
    setEdges: React.Dispatch<React.SetStateAction<CanvasEdge[]>>;

    startEdgeDrag: () => void;
    removeEdge: (edgeId: string) => void;
    addNode: (node: CanvasNode) => void;
    addEdge: (edge: CanvasEdge) => void;
    clearPredictedNodes: () => void;
    isDuplicateEdge: (sourceNodeId: string, sourcePortId: string, targetNodeId: string, targetPortId: string) => boolean;
    generatePredictedNodes: (outputType: string, targetPos: Position) => PredictedNode[];
    generatePredictedOutputNodes: (inputType: string, targetPos: Position) => PredictedNode[];

    isNodePredicted: (nodeId: string) => boolean;
}

interface UsePortHandlersReturn {
    handlePortMouseDown: (data: PortMouseEventData, mouseEvent?: React.MouseEvent) => void;
    handlePortMouseUp: (data: PortMouseEventData, mouseEvent?: React.MouseEvent) => void;
}

export const usePortHandlers = ({
    edges,
    nodes,
    predictedNodes,
    portPositions,
    isDraggingOutput,
    isDraggingInput,
    portClickStart,
    edgePreviewRef,
    setPortClickStart,
    setEdgePreview,
    setSnappedPortKey,
    setIsSnapTargetValid,
    setIsDraggingOutput,
    setIsDraggingInput,
    setCurrentOutputType,
    setCurrentInputType,
    setSourcePortForConnection,
    setPredictedNodes,
    setEdges,
    startEdgeDrag,
    removeEdge,
    addNode,
    addEdge,
    clearPredictedNodes,
    isDuplicateEdge,
    generatePredictedNodes,
    generatePredictedOutputNodes,
    isNodePredicted
}: UsePortHandlersProps): UsePortHandlersReturn => {

    const handlePortMouseDown = useCallback((data: PortMouseEventData, mouseEvent?: React.MouseEvent): void => {
        const { nodeId, portId, portType, isMulti, type } = data;

        if (mouseEvent) {
            setPortClickStart({
                data,
                timestamp: Date.now(),
                position: { x: mouseEvent.clientX, y: mouseEvent.clientY }
            });
        }

        if (portType === 'input') {
            let existingEdge: CanvasEdge | undefined;
            if (!isMulti) {
                existingEdge = edges.find(e => e.target.nodeId === nodeId && e.target.portId === portId);
            } else {
                existingEdge = edges.findLast(e => e.target.nodeId === nodeId && e.target.portId === portId);
            }

            if (existingEdge) {
                startEdgeDrag();
                const sourcePosKey = generatePortKey(existingEdge.source.nodeId, existingEdge.source.portId, existingEdge.source.portType as 'input' | 'output');
                const sourcePos = portPositions[sourcePosKey];
                const targetPosKey = generatePortKey(existingEdge.target.nodeId, existingEdge.target.portId, existingEdge.target.portType as 'input' | 'output');
                const targetPos = portPositions[targetPosKey];

                const sourcePortData = findPortData(nodes, existingEdge.source.nodeId, existingEdge.source.portId, existingEdge.source.portType);

                if (sourcePos && sourcePortData) {
                    setEdgePreview({
                        source: { ...existingEdge.source, type: sourcePortData.type },
                        startPos: sourcePos,
                        targetPos: targetPos
                    });
                }

                removeEdge(existingEdge.id);
                return;
            } else {
                startEdgeDrag();
                setIsDraggingInput(true);
                setCurrentInputType(type);
                setSourcePortForConnection({ nodeId, portId, portType, type });

                const startPosKey = generatePortKey(nodeId, portId, portType as 'input' | 'output');
                const startPos = portPositions[startPosKey];
                if (startPos) {
                    setEdgePreview({
                        source: { nodeId, portId, portType, type },
                        startPos,
                        targetPos: startPos
                    });
                }
                return;
            }
        }

        if (portType === 'output') {
            startEdgeDrag();
            setIsDraggingOutput(true);
            setCurrentOutputType(type);
            setSourcePortForConnection({ nodeId, portId, portType, type });

            const startPosKey = generatePortKey(nodeId, portId, portType as 'input' | 'output');
            const startPos = portPositions[startPosKey];
            if (startPos) {
                setEdgePreview({
                    source: { nodeId, portId, portType, type },
                    startPos,
                    targetPos: startPos
                });
            }
            return;
        }
    }, [
        edges,
        portPositions,
        nodes,
        startEdgeDrag,
        setPortClickStart,
        setEdgePreview,
        removeEdge,
        setIsDraggingInput,
        setIsDraggingOutput,
        setCurrentInputType,
        setCurrentOutputType,
        setSourcePortForConnection
    ]);

    const handlePortMouseUp = useCallback((data: PortMouseEventData, mouseEvent?: React.MouseEvent): void => {
        const { nodeId, portId, portType, type } = data;
        const currentEdgePreview = edgePreviewRef.current;

        const isClickAction = portClickStart && mouseEvent &&
            isClick(
                portClickStart.timestamp,
                portClickStart.position,
                { x: mouseEvent.clientX, y: mouseEvent.clientY }
            );

        if (isClickAction &&
            portClickStart.data.nodeId === nodeId &&
            portClickStart.data.portId === portId &&
            portClickStart.data.portType === portType) {

            const portPosKey = generatePortKey(nodeId, portId, portType as 'input' | 'output');
            const portPos = portPositions[portPosKey];

            if (portPos) {
                setSourcePortForConnection({ nodeId, portId, portType, type });
                setEdgePreview({
                    source: { nodeId, portId, portType, type },
                    startPos: portPos,
                    targetPos: portPos
                });

                let predicted: any[] = [];
                if (portType === 'output') {
                    setIsDraggingOutput(true);
                    setCurrentOutputType(type);
                    predicted = generatePredictedNodes(type, portPos);
                } else if (portType === 'input') {
                    setIsDraggingInput(true);
                    setCurrentInputType(type);
                    predicted = generatePredictedOutputNodes(type, portPos);
                }

                if (predicted.length > 0) {
                    setPredictedNodes(predicted);
                }
            }

            setPortClickStart(null);
            return;
        }

        setPortClickStart(null);

        if (!currentEdgePreview) return;

        if (!areTypesCompatible(currentEdgePreview.source.type, type)) {
            setSnappedPortKey(null);
            setIsSnapTargetValid(true);
            setEdgePreview(null);
            return;
        }

        if (currentEdgePreview.source.portType === portType) {
            setEdgePreview(null);
            return;
        }

        if (currentEdgePreview.source.nodeId === nodeId) {
            setEdgePreview(null);
            return;
        }

        // Handle predicted node connection
        if (isNodePredicted(nodeId)) {
            const predictedNode = predictedNodes.find(pNode => pNode.id === nodeId);
            if (predictedNode) {
                const newNode: CanvasNode = {
                    id: `${predictedNode.nodeData.id}-${Date.now()}`,
                    data: predictedNode.nodeData,
                    position: predictedNode.position,
                    isExpanded: true,
                };

                addNode(newNode);

                let newEdge: CanvasEdge;
                if (isDraggingOutput) {
                    newEdge = {
                        id: `edge-${currentEdgePreview.source.nodeId}:${currentEdgePreview.source.portId}-${newNode.id}:${portId}-${Date.now()}`,
                        source: currentEdgePreview.source,
                        target: { nodeId: newNode.id, portId, portType }
                    };
                } else {
                    newEdge = {
                        id: `edge-${newNode.id}:${portId}-${currentEdgePreview.source.nodeId}:${currentEdgePreview.source.portId}-${Date.now()}`,
                        source: { nodeId: newNode.id, portId, portType: 'output' },
                        target: currentEdgePreview.source
                    };
                }

                addEdge(newEdge);
                clearPredictedNodes();
            }

            setEdgePreview(null);
            return;
        }

        // Handle normal node connection
        if (isDuplicateEdge(
            currentEdgePreview.source.nodeId,
            currentEdgePreview.source.portId,
            nodeId,
            portId
        )) {
            setEdgePreview(null);
            return;
        }

        let newEdge: CanvasEdge;
        if (currentEdgePreview.source.portType === 'output') {
            newEdge = {
                id: `edge-${currentEdgePreview.source.nodeId}:${currentEdgePreview.source.portId}-${nodeId}:${portId}-${Date.now()}`,
                source: currentEdgePreview.source,
                target: { nodeId, portId, portType }
            };
        } else {
            newEdge = {
                id: `edge-${nodeId}:${portId}-${currentEdgePreview.source.nodeId}:${currentEdgePreview.source.portId}-${Date.now()}`,
                source: { nodeId, portId, portType },
                target: currentEdgePreview.source
            };
        }

        addEdge(newEdge);
        clearPredictedNodes();
        setEdgePreview(null);
        setSnappedPortKey(null);
        setIsSnapTargetValid(true);
    }, [
        edges,
        nodes,
        predictedNodes,
        portPositions,
        isDraggingOutput,
        isDraggingInput,
        portClickStart,
        edgePreviewRef,
        setPortClickStart,
        setEdgePreview,
        setSnappedPortKey,
        setIsSnapTargetValid,
        setIsDraggingOutput,
        setIsDraggingInput,
        setCurrentOutputType,
        setCurrentInputType,
        setSourcePortForConnection,
        setPredictedNodes,
        addNode,
        addEdge,
        clearPredictedNodes,
        isDuplicateEdge,
        generatePredictedNodes,
        generatePredictedOutputNodes,
        isNodePredicted
    ]);

    return {
        handlePortMouseDown,
        handlePortMouseUp
    };
};
