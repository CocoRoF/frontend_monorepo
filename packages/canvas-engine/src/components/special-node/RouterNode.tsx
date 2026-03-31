import React, { useState, useMemo, memo } from 'react';
import styles from '../../styles/Node.module.scss';
import { Node } from '../Node/index';
import { RouterNodePorts } from '../Node/components/RouterNodePorts';
import { RouterNodeParameters } from '../Node/components/specialized/RouterNodeParameters';
import type { NodeComponentProps } from '../Node/index';
import type { Port, Parameter } from '@xgen/canvas-types';

export interface RouterNodeProps extends NodeComponentProps {
    onOutputAdd?: (nodeId: string) => void;
    onOutputDelete?: (nodeId: string, portId: string) => void;
    onOutputRename?: (nodeId: string, portId: string, newName: string) => void;
}

const RouterNodeComponent: React.FC<RouterNodeProps> = ({
    node,
    onOutputAdd,
    onOutputDelete,
    onOutputRename,
    onPortMouseDown,
    onPortMouseUp,
    onPortMouseEnter,
    onPortMouseLeave,
    onParameterChange,
    onParameterDelete,
    onClearSelection,
    selectedPortId,
    snapPortId,
    isPreview,
    isPredicted,
    ...restProps
}) => {
    const inputs = node.data?.inputs ?? [];
    const outputs = node.data?.outputs ?? [];
    const parameters = node.data?.parameters ?? [];
    const isCollapsed = node.isCollapsed ?? false;

    return (
        <Node
            node={node}
            isPreview={isPreview}
            isPredicted={isPredicted}
            onPortMouseDown={onPortMouseDown}
            onPortMouseUp={onPortMouseUp}
            onPortMouseEnter={onPortMouseEnter}
            onPortMouseLeave={onPortMouseLeave}
            onParameterChange={onParameterChange}
            onParameterDelete={onParameterDelete}
            onClearSelection={onClearSelection}
            selectedPortId={selectedPortId}
            snapPortId={snapPortId}
            {...restProps}
        >
            {/* Override ports with RouterNodePorts */}
            {!isCollapsed && (
                <RouterNodePorts
                    nodeId={node.id}
                    nodeData={node.data!}
                    inputs={inputs}
                    outputs={outputs}
                    parameters={parameters}
                    isPreview={isPreview}
                    isPredicted={isPredicted}
                    isCollapsed={isCollapsed}
                    onPortMouseDown={onPortMouseDown}
                    onPortMouseUp={onPortMouseUp}
                    onPortMouseEnter={onPortMouseEnter}
                    onPortMouseLeave={onPortMouseLeave}
                    onOutputAdd={onOutputAdd}
                    onOutputDelete={onOutputDelete}
                    onOutputRename={onOutputRename}
                    selectedPortId={selectedPortId}
                    snapPortId={snapPortId}
                />
            )}

            {/* Override parameters with RouterNodeParameters */}
            {!isCollapsed && (
                <RouterNodeParameters
                    nodeId={node.id}
                    parameters={parameters}
                    isPreview={isPreview}
                    onParameterChange={onParameterChange}
                    onParameterDelete={onParameterDelete}
                    onClearSelection={onClearSelection}
                />
            )}
        </Node>
    );
};

export const RouterNode = memo(RouterNodeComponent);
