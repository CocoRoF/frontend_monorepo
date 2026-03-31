import { useCallback } from 'react';
import type { CanvasNode, CanvasEdge, Position } from '@xgen/canvas-types';
import { calculateDistance, NODE_APPROX_WIDTH } from '../utils/canvas-utils';

interface UseAutoConnectProps {
    nodes: CanvasNode[];
    edges: CanvasEdge[];
    selectedNodeIds: Set<string>;
    addEdge: (edge: CanvasEdge) => void;
    isDuplicateEdge: (sourceNodeId: string, sourcePortId: string, targetNodeId: string, targetPortId: string) => boolean;
    areTypesCompatible: (sourceType?: string, targetType?: string) => boolean;
}

interface UseAutoConnectReturn {
    findAutoConnection: (nodeId: string) => void;
}

export const useAutoConnect = ({
    nodes,
    edges,
    selectedNodeIds,
    addEdge,
    isDuplicateEdge,
    areTypesCompatible
}: UseAutoConnectProps): UseAutoConnectReturn => {

    const findAutoConnection = useCallback((nodeId: string): void => {
        const targetNode = nodes.find(n => n.id === nodeId);
        if (!targetNode) return;

        const maxDistance = NODE_APPROX_WIDTH * 3;

        // Find nearby nodes sorted by distance
        const nearbyNodes = nodes
            .filter(n => n.id !== nodeId)
            .map(n => ({
                node: n,
                distance: calculateDistance(targetNode.position, n.position)
            }))
            .filter(item => item.distance < maxDistance)
            .sort((a, b) => {
                // Prioritize selected nodes
                const aSelected = selectedNodeIds.has(a.node.id) ? 0 : 1;
                const bSelected = selectedNodeIds.has(b.node.id) ? 0 : 1;
                if (aSelected !== bSelected) return aSelected - bSelected;
                return a.distance - b.distance;
            });

        for (const { node: nearNode } of nearbyNodes) {
            // Try: nearNode output -> targetNode input
            if (nearNode.data.outputs && targetNode.data.inputs) {
                for (const output of nearNode.data.outputs) {
                    for (const input of targetNode.data.inputs) {
                        if (!areTypesCompatible(output.type, input.type)) continue;
                        if (isDuplicateEdge(nearNode.id, output.id, targetNode.id, input.id)) continue;

                        // Check if input already has a connection (skip if not multi)
                        if (!input.isMulti) {
                            const hasExisting = edges.some(e =>
                                e.target.nodeId === targetNode.id && e.target.portId === input.id
                            );
                            if (hasExisting) continue;
                        }

                        const newEdge: CanvasEdge = {
                            id: `edge-${nearNode.id}:${output.id}-${targetNode.id}:${input.id}-${Date.now()}`,
                            source: { nodeId: nearNode.id, portId: output.id, portType: 'output' },
                            target: { nodeId: targetNode.id, portId: input.id, portType: 'input' }
                        };
                        addEdge(newEdge);
                        return;
                    }
                }
            }

            // Try: targetNode output -> nearNode input
            if (targetNode.data.outputs && nearNode.data.inputs) {
                for (const output of targetNode.data.outputs) {
                    for (const input of nearNode.data.inputs) {
                        if (!areTypesCompatible(output.type, input.type)) continue;
                        if (isDuplicateEdge(targetNode.id, output.id, nearNode.id, input.id)) continue;

                        if (!input.isMulti) {
                            const hasExisting = edges.some(e =>
                                e.target.nodeId === nearNode.id && e.target.portId === input.id
                            );
                            if (hasExisting) continue;
                        }

                        const newEdge: CanvasEdge = {
                            id: `edge-${targetNode.id}:${output.id}-${nearNode.id}:${input.id}-${Date.now()}`,
                            source: { nodeId: targetNode.id, portId: output.id, portType: 'output' },
                            target: { nodeId: nearNode.id, portId: input.id, portType: 'input' }
                        };
                        addEdge(newEdge);
                        return;
                    }
                }
            }
        }
    }, [nodes, edges, selectedNodeIds, addEdge, isDuplicateEdge, areTypesCompatible]);

    return {
        findAutoConnection
    };
};
