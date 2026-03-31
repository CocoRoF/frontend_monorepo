import React, { useState, useMemo, useCallback, memo } from 'react';
import styles from '../../styles/Node.module.scss';
import { NodeHeader } from './components/NodeHeader';
import { NodePorts } from './components/NodePorts';
import { NodePortsCollapsed } from './components/NodePortsCollapsed';
import { NodeParameters } from './components/NodeParameters';
import { useNodeEditing } from '../../hooks/node/useNodeEditing';
import { useNodeContextMenu } from '../../hooks/node/useNodeContextMenu';
import { getDisplayNodeName, getNodeContainerClasses, getNodeContainerStyles, createCommonEventHandlers, hasInputsAndOutputs } from './utils/nodeUtils';
import { useTranslation } from '@xgen/i18n';
import type { CanvasNode, Port, Parameter } from '@xgen/canvas-types';

export interface NodeComponentProps {
    node: CanvasNode;
    isSelected?: boolean;
    isPredicted?: boolean;
    isPreview?: boolean;
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
    onPredictedNodeAccept?: (nodeId: string) => void;
    onPredictedNodeReject?: (nodeId: string) => void;
    onSchemaSyncRequest?: (nodeId: string) => void;
    selectedPortId?: string | null;
    snapPortId?: string | null;
    fetchParameterOptions?: (nodeDataId: string, apiName: string) => Promise<any[]>;
    renderContextMenu?: (props: {
        nodeId: string;
        position: { x: number; y: number };
        onClose: () => void;
    }) => React.ReactNode;
    children?: React.ReactNode;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
    node,
    isSelected = false,
    isPredicted = false,
    isPreview = false,
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
    onPredictedNodeAccept,
    onPredictedNodeReject,
    onSchemaSyncRequest,
    selectedPortId,
    snapPortId,
    fetchParameterOptions,
    renderContextMenu,
    children
}) => {
    const { locale } = useTranslation();
    const [showAdvanced, setShowAdvanced] = useState(false);

    const nodeEditing = useNodeEditing(onNodeNameChange);
    const nodeContextMenu = useNodeContextMenu({
        onToggleExpand: onNodeToggleExpand ? () => onNodeToggleExpand(node.id) : undefined,
        onToggleBypass: onNodeToggleBypass ? () => onNodeToggleBypass(node.id) : undefined,
        onDelete: undefined,
        onDuplicate: undefined,
        onCopyNode: undefined
    });

    const isCollapsed = node.isCollapsed ?? false;
    const isBypassed = node.isBypassed ?? false;
    const inputs = node.data?.inputs ?? [];
    const outputs = node.data?.outputs ?? [];
    const parameters = node.data?.parameters ?? [];
    const displayName = getDisplayNodeName(node, locale);
    const hasIO = hasInputsAndOutputs(inputs, outputs);

    const containerClasses = useMemo(() => {
        const classes = [styles.node];
        if (isSelected) classes.push(styles.selected);
        if (isCollapsed) classes.push(styles.collapsed);
        if (isBypassed) classes.push(styles.bypassed);
        if (isPredicted) classes.push(styles.predicted);
        if (isPreview) classes.push(styles.preview);
        return classes.join(' ');
    }, [isSelected, isCollapsed, isBypassed, isPredicted, isPreview]);

    const containerStyles = useMemo(
        () => getNodeContainerStyles(node),
        [node]
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (isPreview || isPredicted) return;
            if (onNodeMouseDown) {
                onNodeMouseDown(e, node.id);
            }
        },
        [isPreview, isPredicted, node.id, onNodeMouseDown]
    );

    const handleDoubleClick = useCallback(
        (e: React.MouseEvent) => {
            if (isPreview || isPredicted) return;
            if (onNodeDoubleClick) {
                onNodeDoubleClick(e, node.id);
            }
        },
        [isPreview, isPredicted, node.id, onNodeDoubleClick]
    );

    const handleContextMenu = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (isPreview || isPredicted) return;
            if (onNodeContextMenu) {
                onNodeContextMenu(e, node.id);
            }
            nodeContextMenu.handleContextMenu(e);
        },
        [isPreview, isPredicted, node.id, onNodeContextMenu, nodeContextMenu]
    );

    const handleToggleExpand = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (onNodeToggleExpand) {
                onNodeToggleExpand(node.id);
            }
        },
        [node.id, onNodeToggleExpand]
    );

    const handleToggleAdvanced = useCallback(
        (e: React.MouseEvent | React.KeyboardEvent) => {
            e.stopPropagation();
            setShowAdvanced((prev) => !prev);
        },
        []
    );

    return (
        <div
            className={containerClasses}
            style={containerStyles}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            data-node-id={node.id}
            role="button"
            tabIndex={0}
        >
            {/* Node Header */}
            <NodeHeader
                nodeId={node.id}
                displayName={displayName}
                description={node.data?.description}
                isCollapsed={isCollapsed}
                isBypassed={isBypassed}
                isPreview={isPreview}
                isPredicted={isPredicted}
                isEditing={nodeEditing.isEditing}
                editingValue={nodeEditing.editingValue}
                onEditStart={() => nodeEditing.startEditing(displayName)}
                onEditChange={(value) => nodeEditing.setEditingValue(value)}
                onEditSubmit={() => nodeEditing.submitEditing(node.id)}
                onEditCancel={() => nodeEditing.cancelEditing()}
                onToggleExpand={handleToggleExpand}
            />

            {/* Predicted Node Actions */}
            {isPredicted && (
                <div className={styles.predictedActions}>
                    <button
                        className={styles.acceptButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            onPredictedNodeAccept?.(node.id);
                        }}
                        type="button"
                    >
                        Accept
                    </button>
                    <button
                        className={styles.rejectButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            onPredictedNodeReject?.(node.id);
                        }}
                        type="button"
                    >
                        Reject
                    </button>
                </div>
            )}

            {/* Ports */}
            {hasIO && !isCollapsed && (
                <NodePorts
                    nodeId={node.id}
                    nodeDataId={node.data?.id}
                    inputs={inputs}
                    outputs={outputs}
                    parameters={parameters}
                    isPreview={isPreview}
                    isPredicted={isPredicted}
                    onPortMouseDown={onPortMouseDown}
                    onPortMouseUp={onPortMouseUp}
                    onPortMouseEnter={onPortMouseEnter}
                    onPortMouseLeave={onPortMouseLeave}
                    onSchemaSyncRequest={onSchemaSyncRequest}
                    selectedPortId={selectedPortId}
                    snapPortId={snapPortId}
                />
            )}

            {hasIO && isCollapsed && (
                <NodePortsCollapsed
                    nodeId={node.id}
                    inputs={inputs}
                    outputs={outputs}
                    parameters={parameters}
                    onPortMouseDown={onPortMouseDown}
                    onPortMouseUp={onPortMouseUp}
                    onPortMouseEnter={onPortMouseEnter}
                    onPortMouseLeave={onPortMouseLeave}
                    selectedPortId={selectedPortId}
                    snapPortId={snapPortId}
                />
            )}

            {/* Parameters */}
            {!isCollapsed && (
                <NodeParameters
                    nodeId={node.id}
                    nodeDataId={node.data?.id ?? ''}
                    parameters={parameters}
                    isPreview={isPreview}
                    isPredicted={isPredicted}
                    onParameterChange={onParameterChange}
                    onParameterNameChange={onParameterNameChange}
                    onParameterAdd={onParameterAdd}
                    onParameterDelete={onParameterDelete}
                    onClearSelection={onClearSelection}
                    onOpenNodeModal={onOpenNodeModal}
                    showAdvanced={showAdvanced}
                    onToggleAdvanced={handleToggleAdvanced}
                    fetchParameterOptions={fetchParameterOptions}
                />
            )}

            {/* Custom children (for special node extensions) */}
            {children}

            {/* Context Menu */}
            {nodeContextMenu.isOpen && renderContextMenu && (
                renderContextMenu({
                    nodeId: node.id,
                    position: nodeContextMenu.position,
                    onClose: nodeContextMenu.closeContextMenu
                })
            )}
        </div>
    );
};

export const Node = memo(NodeComponent);
