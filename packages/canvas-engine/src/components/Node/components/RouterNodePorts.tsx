import React, { useState, useCallback, useMemo } from 'react';
import { LuPlus, LuTrash2 } from 'react-icons/lu';
import { FiEdit3 } from 'react-icons/fi';
import styles from '../../../styles/Node.module.scss';
import { filterPortsByDependency } from '../utils/portUtils';
import { getPortTypeDisplay, getPortClasses, generatePortKey } from '../utils/nodeUtils';
import { useTranslation } from '@xgen/i18n';
import type { Port, Parameter, NodeData } from '@xgen/canvas-types';

export interface RouterNodePortsProps {
    nodeId: string;
    nodeData: NodeData;
    inputs: Port[];
    outputs: Port[];
    parameters: Parameter[];
    isPreview?: boolean;
    isPredicted?: boolean;
    isCollapsed?: boolean;
    onPortMouseDown?: (e: React.MouseEvent, nodeId: string, port: Port, portType: 'input' | 'output', portElement: HTMLElement) => void;
    onPortMouseUp?: (e: React.MouseEvent, nodeId: string, port: Port, portType: 'input' | 'output') => void;
    onPortMouseEnter?: (e: React.MouseEvent, nodeId: string, port: Port, portType: 'input' | 'output') => void;
    onPortMouseLeave?: (e: React.MouseEvent, nodeId: string, port: Port, portType: 'input' | 'output') => void;
    onOutputAdd?: (nodeId: string) => void;
    onOutputDelete?: (nodeId: string, portId: string) => void;
    onOutputRename?: (nodeId: string, portId: string, newName: string) => void;
    selectedPortId?: string | null;
    snapPortId?: string | null;
}

export const RouterNodePorts: React.FC<RouterNodePortsProps> = ({
    nodeId,
    nodeData,
    inputs,
    outputs,
    parameters,
    isPreview = false,
    isPredicted = false,
    isCollapsed = false,
    onPortMouseDown,
    onPortMouseUp,
    onPortMouseEnter,
    onPortMouseLeave,
    onOutputAdd,
    onOutputDelete,
    onOutputRename,
    selectedPortId,
    snapPortId
}) => {
    const { t } = useTranslation();
    const [editingPortId, setEditingPortId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState('');

    const filteredInputs = useMemo(
        () => filterPortsByDependency(inputs, parameters),
        [inputs, parameters]
    );

    const filteredOutputs = useMemo(
        () => filterPortsByDependency(outputs, parameters),
        [outputs, parameters]
    );

    const handleStartEditing = useCallback((port: Port) => {
        if (isPreview) return;
        setEditingPortId(port.id);
        setEditingValue(port.name);
    }, [isPreview]);

    const handleSubmitRename = useCallback(() => {
        if (editingPortId && editingValue.trim() && onOutputRename) {
            onOutputRename(nodeId, editingPortId, editingValue.trim());
        }
        setEditingPortId(null);
        setEditingValue('');
    }, [editingPortId, editingValue, nodeId, onOutputRename]);

    const handleCancelEditing = useCallback(() => {
        setEditingPortId(null);
        setEditingValue('');
    }, []);

    const handleAddOutput = useCallback(() => {
        if (isPreview || !onOutputAdd) return;
        onOutputAdd(nodeId);
    }, [isPreview, nodeId, onOutputAdd]);

    const handleDeleteOutput = useCallback((portId: string) => {
        if (isPreview || !onOutputDelete) return;
        onOutputDelete(nodeId, portId);
    }, [isPreview, nodeId, onOutputDelete]);

    const renderPort = (port: Port, portType: 'input' | 'output', isOutput: boolean) => {
        const portKey = generatePortKey(nodeId, port.id, portType);
        const isSelected = selectedPortId === portKey;
        const isSnap = snapPortId === portKey;
        const typeDisplay = getPortTypeDisplay(port);
        const isEditing = editingPortId === port.id;

        return (
            <div
                key={port.id}
                className={`${styles.port} ${isOutput ? styles.outputPort : styles.inputPort} ${isSelected ? styles.selectedPort : ''} ${isSnap ? styles.snapPort : ''}`}
            >
                <div
                    className={getPortClasses(port, portType, isSelected, isSnap)}
                    data-port-id={portKey}
                    data-port-type={portType}
                    onMouseDown={(e) => {
                        if (!isPreview && !isPredicted && onPortMouseDown) {
                            onPortMouseDown(e, nodeId, port, portType, e.currentTarget);
                        }
                    }}
                    onMouseUp={(e) => {
                        if (!isPreview && !isPredicted && onPortMouseUp) {
                            onPortMouseUp(e, nodeId, port, portType);
                        }
                    }}
                    onMouseEnter={(e) => {
                        if (!isPreview && !isPredicted && onPortMouseEnter) {
                            onPortMouseEnter(e, nodeId, port, portType);
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isPreview && !isPredicted && onPortMouseLeave) {
                            onPortMouseLeave(e, nodeId, port, portType);
                        }
                    }}
                />
                <div className={styles.portInfo}>
                    {isEditing && isOutput ? (
                        <input
                            className={styles.portRenameInput}
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') handleSubmitRename();
                                if (e.key === 'Escape') handleCancelEditing();
                            }}
                            onBlur={handleSubmitRename}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    ) : (
                        <span className={styles.portName}>{port.name}</span>
                    )}
                    {typeDisplay && <span className={styles.portType}>{typeDisplay}</span>}
                </div>
                {isOutput && !isPreview && (
                    <div className={styles.routerPortActions}>
                        <button
                            className={styles.routerPortActionBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditing(port);
                            }}
                            title={t('canvas.node.rename', 'Rename')}
                            type="button"
                        >
                            <FiEdit3 size={12} />
                        </button>
                        {filteredOutputs.length > 1 && (
                            <button
                                className={styles.routerPortActionBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteOutput(port.id);
                                }}
                                title={t('canvas.node.deleteOutput', 'Delete output')}
                                type="button"
                            >
                                <LuTrash2 size={12} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (isCollapsed) {
        return null;
    }

    return (
        <div className={styles.portSection}>
            {/* Input Ports */}
            {filteredInputs.length > 0 && (
                <div className={styles.inputPorts}>
                    <div className={styles.portGroupHeader}>
                        <span className={styles.portGroupLabel}>INPUT</span>
                    </div>
                    {filteredInputs.map((port) => renderPort(port, 'input', false))}
                </div>
            )}

            {/* Output Ports */}
            <div className={styles.outputPorts}>
                <div className={styles.portGroupHeader}>
                    <span className={styles.portGroupLabel}>OUTPUT</span>
                    {!isPreview && (
                        <button
                            className={styles.addOutputButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddOutput();
                            }}
                            title={t('canvas.node.addOutput', 'Add output')}
                            type="button"
                        >
                            <LuPlus size={14} />
                        </button>
                    )}
                </div>
                {filteredOutputs.map((port) => renderPort(port, 'output', true))}
            </div>
        </div>
    );
};
