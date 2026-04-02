import React from 'react';
import { useTranslation } from '@xgen/i18n';
import { useBottomPanel } from '../context/BottomPanelContext';
import styles from '../styles/executor-tab.module.scss';

const ExecutorTab: React.FC = () => {
    const { t } = useTranslation();
    const { buttonResultText, isExecuting, executionSource } = useBottomPanel();

    const showLoading = executionSource === 'button' && isExecuting && !buttonResultText;
    const showPlaceholder = !buttonResultText && !showLoading;

    return (
        <div className={styles.area}>
            {showPlaceholder ? (
                <span className={styles.placeholder}>
                    {t('canvas.bottomPanel.executor.placeholder')}
                </span>
            ) : (
                <>
                    {showLoading && (
                        <div className={styles.loading}>
                            <span /><span /><span />
                        </div>
                    )}
                    <pre className={styles.resultPre}>{buttonResultText}</pre>
                </>
            )}
        </div>
    );
};

export default ExecutorTab;
