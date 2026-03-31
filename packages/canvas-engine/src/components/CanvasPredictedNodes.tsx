import React, { memo } from 'react';
import { Node } from './Node/index';
import type { NodeComponentProps } from './Node/index';
import type { CanvasNode, PredictedNode, Port, Parameter } from '@xgen/canvas-types';

export interface CanvasPredictedNodesProps {
    predictedNodes: PredictedNode[];
    onPredictedNodeAccept?: (nodeId: string) => void;
    onPredictedNodeReject?: (nodeId: string) => void;
}

const CanvasPredictedNodesComponent: React.FC<CanvasPredictedNodesProps> = ({
    predictedNodes,
    onPredictedNodeAccept,
    onPredictedNodeReject
}) => {
    if (!predictedNodes || predictedNodes.length === 0) return null;

    return (
        <>
            {predictedNodes.map((predicted) => {
                const canvasNode: CanvasNode = {
                    id: predicted.id,
                    data: predicted.nodeData,
                    position: predicted.position,
                };

                return (
                    <Node
                        key={predicted.id}
                        node={canvasNode}
                        isPredicted
                        isPreview
                        onPredictedNodeAccept={onPredictedNodeAccept}
                        onPredictedNodeReject={onPredictedNodeReject}
                    />
                );
            })}
        </>
    );
};

export const CanvasPredictedNodes = memo(CanvasPredictedNodesComponent);
