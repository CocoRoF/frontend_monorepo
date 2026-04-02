import React, { useMemo, useCallback } from 'react';
import { useTranslation } from '@xgen/i18n';
import { LuCheck, LuX, LuPlay } from '@xgen/icons';
import { useBottomPanel } from '../context/BottomPanelContext';
import type { ExecutionGroup, ExecutionNodeState } from '../types';
import styles from '../styles/execution-order.module.scss';

// ── Status Icon ────────────────────────────────────────────────

const StatusIcon: React.FC<{ status?: ExecutionNodeState['status'] }> = ({ status }) => {
    if (!status || status === 'pending') return null;

    const classMap: Record<string, string> = {
        running: styles.statusRunning,
        completed: styles.statusCompleted,
        failed: styles.statusFailed,
        bypassed: styles.statusBypassed,
    };

    const iconMap: Record<string, React.ReactNode> = {
        running: <LuPlay />,
        completed: <LuCheck />,
        failed: <LuX />,
    };

    return (
        <span className={`${styles.statusIcon} ${classMap[status] || ''}`}>
            {iconMap[status] || null}
        </span>
    );
};

// ── Order Item ─────────────────────────────────────────────────

interface OrderItemProps {
    index: number;
    group: ExecutionGroup;
    nodeStates: Map<string, ExecutionNodeState>;
    getNodeName: (nodeId: string) => string;
}

const OrderItem: React.FC<OrderItemProps> = ({ index, group, nodeStates, getNodeName }) => {
    const isGroup = group.length > 1;

    return (
        <div className={`${styles.row} ${isGroup ? styles.rowGroup : ''}`}>
            <span className={styles.num}>{index + 1}</span>
            {!isGroup ? (
                <>
                    <span className={styles.nodeName}>{getNodeName(group[0])}</span>
                    <StatusIcon status={nodeStates.get(group[0])?.status} />
                </>
            ) : (
                <div className={styles.groupColumn}>
                    {group.map((nodeId, subIndex) => (
                        <div key={nodeId} className={styles.subItem}>
                            <span className={styles.subIndex}>{subIndex + 1}.</span>
                            <span className={styles.subName}>{getNodeName(nodeId)}</span>
                            <StatusIcon status={nodeStates.get(nodeId)?.status} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Execution Order Column ─────────────────────────────────────

const ExecutionOrderColumn: React.FC = () => {
    const { t } = useTranslation();
    const { executionOrder, isLoadingOrder, nodeStates } = useBottomPanel();

    const getExecutionGroups = useMemo((): ExecutionGroup[] => {
        if (!executionOrder) return [];
        if (Array.isArray(executionOrder.parallel_execution_order)) return executionOrder.parallel_execution_order;
        if (Array.isArray(executionOrder.execution_order)) return executionOrder.execution_order.map((id: string) => [id]);
        return [];
    }, [executionOrder]);

    const filteredOrder = useMemo(() => {
        return getExecutionGroups.filter((g) => g.length > 0);
    }, [getExecutionGroups]);

    const getNodeName = useCallback((nodeId: string): string => {
        return executionOrder?.nodes?.[nodeId]?.data?.nodeName ?? nodeId;
    }, [executionOrder]);

    const hasData = filteredOrder.length > 0;

    return (
        <div className={styles.column}>
            <div className={styles.header}>
                <span className={styles.headerTitle}>
                    {t('canvas.bottomPanel.order.title')}
                </span>
            </div>
            <div className={styles.list}>
                {isLoadingOrder && !executionOrder && (
                    <div className={styles.loading}>
                        {t('canvas.bottomPanel.order.loading')}
                    </div>
                )}
                {filteredOrder.map((group, index) => (
                    <OrderItem
                        key={group.join('-')}
                        index={index}
                        group={group}
                        nodeStates={nodeStates}
                        getNodeName={getNodeName}
                    />
                ))}
                {!isLoadingOrder && !hasData && (
                    <div className={styles.empty}>
                        {t('canvas.bottomPanel.order.empty')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExecutionOrderColumn;
