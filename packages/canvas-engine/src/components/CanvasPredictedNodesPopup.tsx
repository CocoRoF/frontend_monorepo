import React, { useState, useMemo, useCallback, memo } from 'react';
import { FiX } from 'react-icons/fi';
import styles from '../styles/Node.module.scss';
import { getLocalizedNodeName } from './Node/utils/nodeUtils';
import { useTranslation } from '@xgen/i18n';
import type { PredictedNode } from '@xgen/canvas-types';

export interface CanvasPredictedNodesPopupProps {
    isOpen: boolean;
    position: { x: number; y: number };
    predictedNodes: PredictedNode[];
    onSelectPredictedNode: (node: PredictedNode) => void;
    onClose: () => void;
}

const CanvasPredictedNodesPopupComponent: React.FC<CanvasPredictedNodesPopupProps> = ({
    isOpen,
    position,
    predictedNodes,
    onSelectPredictedNode,
    onClose
}) => {
    const { t, locale } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNodes = useMemo(() => {
        if (!searchQuery.trim()) return predictedNodes;
        const query = searchQuery.toLowerCase();
        return predictedNodes.filter((node) => {
            const name = getLocalizedNodeName(node.data, locale).toLowerCase();
            const id = node.data.id.toLowerCase();
            return name.includes(query) || id.includes(query);
        });
    }, [predictedNodes, searchQuery, locale]);

    const handleSelectNode = useCallback(
        (node: PredictedNode) => {
            onSelectPredictedNode(node);
            onClose();
        },
        [onSelectPredictedNode, onClose]
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
                    {t('canvas.predictedNodes', 'Predicted Nodes')}
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
                    filteredNodes.map((node) => (
                        <div
                            key={node.id}
                            className={`${styles.popupNodeItem} ${styles.predicted}`}
                            onClick={() => handleSelectNode(node)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSelectNode(node);
                            }}
                            role="button"
                            tabIndex={0}
                        >
                            <span className={styles.popupNodeName}>
                                {getLocalizedNodeName(node.data, locale)}
                            </span>
                            {node.confidence !== undefined && (
                                <span className={styles.confidenceBadge}>
                                    {Math.round(node.confidence * 100)}%
                                </span>
                            )}
                        </div>
                    ))
                ) : (
                    <div className={styles.popupEmpty}>
                        {t('canvas.noPredictedNodes', 'No predicted nodes')}
                    </div>
                )}
            </div>
        </div>
    );
};

export const CanvasPredictedNodesPopup = memo(CanvasPredictedNodesPopupComponent);
