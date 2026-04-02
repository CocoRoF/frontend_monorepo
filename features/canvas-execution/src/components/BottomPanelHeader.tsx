import React from 'react';
import { useTranslation } from '@xgen/i18n';
import { LuTrash2, LuChevronUp, LuChevronDown } from '@xgen/icons';
import { FiMaximize2, FiMinimize2 } from '@xgen/icons';
import { useBottomPanel } from '../context/BottomPanelContext';
import styles from '../styles/bottom-panel-header.module.scss';

const BottomPanelHeader: React.FC = () => {
    const { t } = useTranslation();
    const {
        panelMode,
        togglePanel,
        setFullscreen,
        clearLogs,
        clearOutput,
    } = useBottomPanel();

    const isExpanded = panelMode !== 'collapsed';
    const isFullscreen = panelMode === 'fullscreen';

    const handleClear = () => {
        clearLogs();
        clearOutput();
    };

    const handleToggleFullscreen = () => {
        setFullscreen(!isFullscreen);
    };

    return (
        <div className={styles.bar}>
            {/* Left: Execution label */}
            <div className={styles.executionSection}>
                <span className={styles.executionLabel}>
                    {t('canvas.bottomPanel.execution')}
                </span>
            </div>

            {/* Right: Log label + actions */}
            <div className={styles.logSection}>
                <span className={styles.logLabel}>
                    {t('canvas.bottomPanel.log')}
                </span>
                <div className={styles.actions}>
                    <button
                        className={styles.iconButton}
                        onClick={handleClear}
                        title={t('canvas.bottomPanel.clear')}
                        aria-label={t('canvas.bottomPanel.clear')}
                    >
                        <LuTrash2 />
                    </button>
                    <span className={styles.divider} />
                    <button
                        className={styles.iconButton}
                        onClick={handleToggleFullscreen}
                        title={
                            isFullscreen
                                ? t('canvas.bottomPanel.exitFullscreen')
                                : t('canvas.bottomPanel.fullscreen')
                        }
                        aria-label={
                            isFullscreen
                                ? t('canvas.bottomPanel.exitFullscreen')
                                : t('canvas.bottomPanel.fullscreen')
                        }
                    >
                        {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
                    </button>
                    <button
                        className={styles.iconButton}
                        onClick={togglePanel}
                        title={
                            isExpanded
                                ? t('canvas.bottomPanel.collapse')
                                : t('canvas.bottomPanel.expand')
                        }
                        aria-label={
                            isExpanded
                                ? t('canvas.bottomPanel.collapse')
                                : t('canvas.bottomPanel.expand')
                        }
                    >
                        {isExpanded ? <LuChevronDown /> : <LuChevronUp />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BottomPanelHeader;
