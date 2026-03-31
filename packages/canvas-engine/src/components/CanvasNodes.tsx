import React, { memo, useMemo } from 'react';
import { Node } from './Node/index';
import { findSpecialNode } from './special-node/specialNode';
import type { NodeComponentProps } from './Node/index';
import type { CanvasNode, Port, Parameter } from '@xgen/canvas-types';

export interface CanvasNodesProps {
    nodes: CanvasNode[];
    selectedNodeIds: string[];
    onNodeMouseDown?: (e: React.MouseEvent, nodeId: string) => void;
    onNodeDoubleClick?: (e: React.MouseEvent, nodeId: string) => void;
    onNodeContextMenu?: (e: React.MouseEvent, nodeId: string) => void;
    onPortMouseDown?: (e: React.MouseEvent, nodeId: string, port: Port, portType: 'input' | 'output', portElement: HTMLElement) => void;
    onPortMouseUp?: (e: React.MouseEvent, nodeId: string, port: Port, portType: 'input' | 'output') => void;
    onPortMouseEnter?: (e: React.MouseEvent, nodeId: string, port: Port, portType: 'input' | 'output') => void;
    onPortMouseLeave?: (e: React.MouseEvent, nodeId: string, port: Port, portType: 'input' | 'output') => void;
    onNodeNameChange?: (nodeId: string, newName: string) => void;
    onNodeToggleExpand?: (nodeId: string) => void;
    onNodeToggleBypass?: (nodeId: string) => void;
    onParameterChange?: (nodeId: string, paramId: string, value: Parameter['value']) => void;
    onParameterNameChange?: (nodeId: string, paramId: string, newName: string) => void;
    onParameterAdd?: (nodeId: string, parameter: Parameter) => void;
    onParameterDelete?: (nodeId: string, paramId: string) => void;
    onClearSelection?: () => void;
    onOpenNodeModal?: (nodeId: string, paramId: string, paramName: string, paramValue: string) => void;
    onSchemaSyncRequest?: (nodeId: string) => void;
    selectedPortId?: string | null;
    snapPortId?: string | null;
    fetchParameterOptions?: (nodeDataId: string, apiName: string) => Promise<any[]>;
    renderContextMenu?: NodeComponentProps['renderContextMenu'];
}

const CanvasNodesComponent: React.FC<CanvasNodesProps> = ({
    nodes,
    selectedNodeIds,
    onNodeMouseDown,
    onNodeDoubleClick,
    onNodeContextMenu,
    onPortMouseDown,
    onPortMouseUp,
    onPortMouseEnter,
    onPortMouseLeave,
    onNodeNameChange,
    onNodeToggleExpand,
    onNodeToggleBypass,
    onParameterChange,
    onParameterNameChange,
    onParameterAdd,
    onParameterDelete,
    onClearSelection,
    onOpenNodeModal,
    onSchemaSyncRequest,
    selectedPortId,
    snapPortId,
    fetchParameterOptions,
    renderContextMenu
}) => {
    return (
        <>
            {nodes.map((node) => {
                const isSelected = selectedNodeIds.includes(node.id);

                // Check for special node
                const specialConfig = node.data ? findSpecialNode(node.data) : null;

                const commonProps: NodeComponentProps = {
                    node,
                    isSelected,
                    onNodeMouseDown,
                    onNodeDoubleClick,
                    onNodeContextMenu,
                    onPortMouseDown,
                    onPortMouseUp,
                    onPortMouseEnter,
                    onPortMouseLeave,
                    onNodeNameChange,
                    onNodeToggleExpand,
                    onNodeToggleBypass,
                    onParameterChange,
                    onParameterNameChange,
                    onParameterAdd,
                    onParameterDelete,
                    onClearSelection,
                    onOpenNodeModal,
                    onSchemaSyncRequest,
                    selectedPortId,
                    snapPortId,
                    fetchParameterOptions,
                    renderContextMenu
                };

                if (specialConfig) {
                    const SpecialComponent = specialConfig.component;
                    return (
                        <SpecialComponent
                            key={node.id}
                            {...commonProps}
                            {...(specialConfig.additionalProps ?? {})}
                        />
                    );
                }

                return <Node key={node.id} {...commonProps} />;
            })}
        </>
    );
};

export const CanvasNodes = memo(CanvasNodesComponent);
