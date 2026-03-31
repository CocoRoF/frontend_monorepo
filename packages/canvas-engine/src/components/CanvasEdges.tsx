import React, { memo, useMemo } from 'react';
import { Edge } from './Edge';
import styles from '../styles/Edge.module.scss';
import type { CanvasEdge, CanvasNode, EdgePreview } from '@xgen/canvas-types';

export interface CanvasEdgesProps {
    edges: CanvasEdge[];
    nodes: CanvasNode[];
    selectedEdgeIds: string[];
    edgePreview?: EdgePreview | null;
    scale?: number;
    onEdgeClick?: (e: React.MouseEvent, edgeId: string) => void;
    onEdgeContextMenu?: (e: React.MouseEvent, edgeId: string) => void;
}

/**
 * Get the bounding rect of a port element from the DOM.
 */
function getPortPosition(
    nodeId: string,
    portId: string,
    portType: 'input' | 'output',
    nodes: CanvasNode[]
): { x: number; y: number } | null {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return null;

    const ports = portType === 'input'
        ? (node.data?.inputs ?? [])
        : (node.data?.outputs ?? []);

    const port = ports.find((p) => p.id === portId);
    if (!port) return null;

    // Port positions should be computed from node position + port offset
    // This is a simplified calculation; actual positions depend on DOM measurement
    const portX = portType === 'output'
        ? (node.position?.x ?? 0) + (node.width ?? 200)
        : (node.position?.x ?? 0);

    const portIndex = ports.indexOf(port);
    const portY = (node.position?.y ?? 0) + 40 + portIndex * 24 + 12;

    return { x: portX, y: portY };
}

const CanvasEdgesComponent: React.FC<CanvasEdgesProps> = ({
    edges,
    nodes,
    selectedEdgeIds,
    edgePreview,
    scale = 1,
    onEdgeClick,
    onEdgeContextMenu
}) => {
    // Sort edges: selected edges on top
    const sortedEdges = useMemo(() => {
        return [...edges].sort((a, b) => {
            const aSelected = selectedEdgeIds.includes(a.id) ? 1 : 0;
            const bSelected = selectedEdgeIds.includes(b.id) ? 1 : 0;
            return aSelected - bSelected;
        });
    }, [edges, selectedEdgeIds]);

    return (
        <svg className={styles.edgesContainer}>
            {sortedEdges.map((edge) => {
                const isSelected = selectedEdgeIds.includes(edge.id);
                const sourcePos = getPortPosition(
                    edge.source.nodeId,
                    edge.source.portId,
                    'output',
                    nodes
                );
                const targetPos = getPortPosition(
                    edge.target.nodeId,
                    edge.target.portId,
                    'input',
                    nodes
                );

                if (!sourcePos || !targetPos) return null;

                return (
                    <Edge
                        key={edge.id}
                        id={edge.id}
                        sourcePos={sourcePos}
                        targetPos={targetPos}
                        sourcePortType="output"
                        targetPortType="input"
                        isSelected={isSelected}
                        onEdgeClick={(edgeId, e) => e && onEdgeClick?.(e, edgeId)}
                    />
                );
            })}

            {/* Edge Preview (during drag) */}
            {edgePreview && (
                <Edge
                    id="edge-preview"
                    sourcePos={edgePreview.startPos}
                    targetPos={edgePreview.targetPos}
                    sourcePortType={edgePreview.source.type as 'input' | 'output'}
                    targetPortType="input"
                    isPreview
                />
            )}
        </svg>
    );
};

export const CanvasEdges = memo(CanvasEdgesComponent);
