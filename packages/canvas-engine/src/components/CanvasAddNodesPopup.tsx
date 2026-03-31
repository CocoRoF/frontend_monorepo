import React, { useState, useMemo, useCallback, memo } from 'react';
import { FiX } from 'react-icons/fi';
import styles from '../styles/Node.module.scss';
import { getLocalizedNodeName } from './Node/utils/nodeUtils';
import { useTranslation } from '@xgen/i18n';
import type { NodeData } from '@xgen/canvas-types';

export interface CanvasAddNodesPopupProps {
    isOpen: boolean;
    position: { x: number; y: number };
    availableNodes: NodeData[];
    onSelectNode: (nodeData: NodeData) => void;
    onClose: () => void;
}

const CanvasAddNodesPopupComponent: React.FC<CanvasAddNodesPopupProps> = ({
    isOpen,
    position,
    availableNodes,
    onSelectNode,
    onClose
}) => {
    const { t, locale } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNodes = useMemo(() => {
        if (!searchQuery.trim()) return availableNodes;
        const query = searchQuery.toLowerCase();
        return availableNodes.filter((nodeData) => {
            const name = getLocalizedNodeName(nodeData, locale).toLowerCase();
            const id = nodeData.id.toLowerCase();
            return name.includes(query) || id.includes(query);
        });
    }, [availableNodes, searchQuery, locale]);

    const handleSelectNode = useCallback(
        (nodeData: NodeData) => {
            onSelectNode(nodeData);
            onClose();
        },
        [onSelectNode, onClose]
    );

    if (!isOpen) return null;

    return (
        <div
            className={styles.addNodesPopup}
            style={{ left: position.x, top: position.y }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className={styles.popupHeader}>
                <span className={styles.popupTitle}>
                    {t('canvas.addNode', 'Add Node')}
                </span>
                <button
                    className={styles.popupCloseButton}
                    onClick={onClose}
                    type="button"
                >
                    <FiX />
                </button>
            </div>
            <div className={styles.popupSearch}>
                <input
                    type="text"
                    placeholder={t('canvas.searchNodes', 'Search nodes...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className={styles.searchInput}
                    autoFocus
                />
            </div>
            <div className={styles.popupNodeList}>
                {filteredNodes.length > 0 ? (
                    filteredNodes.map((nodeData) => (
                        <div
                            key={nodeData.id}
                            className={styles.popupNodeItem}
                            onClick={() => handleSelectNode(nodeData)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSelectNode(nodeData);
                            }}
                            role="button"
                            tabIndex={0}
                        >
                            <span className={styles.popupNodeName}>
                                {getLocalizedNodeName(nodeData, locale)}
                            </span>
                            <span className={styles.popupNodeId}>{nodeData.id}</span>
                        </div>
                    ))
                ) : (
                    <div className={styles.popupEmpty}>
                        {t('canvas.noNodesFound', 'No nodes found')}
                    </div>
                )}
            </div>
        </div>
    );
};

export const CanvasAddNodesPopup = memo(CanvasAddNodesPopupComponent);
