import React from 'react';
import { useTranslation } from '@xgen/i18n';
import { useBottomPanel } from '../context/BottomPanelContext';
import ChatTab from './ChatTab';
import ExecutorTab from './ExecutorTab';
import styles from '../styles/execution-column.module.scss';

const ExecutionColumn: React.FC = () => {
    const { t } = useTranslation();
    const {
        activeExecutionTab,
        setActiveExecutionTab,
        executionSource,
        isExecuting,
    } = useBottomPanel();

    return (
        <div className={styles.column}>
            <div className={styles.tabs}>
                <button
                    type="button"
                    className={`${styles.tab} ${activeExecutionTab === 'chat' ? styles.tabActive : ''}`}
                    onClick={() => setActiveExecutionTab('chat')}
                >
                    {t('canvas.bottomPanel.chat.title')}
                </button>
                <button
                    type="button"
                    className={`${styles.tab} ${activeExecutionTab === 'executor' ? styles.tabActive : ''}`}
                    onClick={() => setActiveExecutionTab('executor')}
                >
                    {t('canvas.bottomPanel.executor.title')}
                    {executionSource === 'button' && isExecuting && (
                        <span className={styles.tabDot} />
                    )}
                </button>
            </div>

            {activeExecutionTab === 'chat' ? <ChatTab /> : <ExecutorTab />}
        </div>
    );
};

export default ExecutionColumn;
