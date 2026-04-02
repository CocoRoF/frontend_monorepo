import React from 'react';
import { useBottomPanel } from '../context/BottomPanelContext';
import ExecutionColumn from './ExecutionColumn';
import ExecutionOrderColumn from './ExecutionOrderColumn';
import LogColumn from './LogColumn';
import type { LogViewerProps } from '../types';
import styles from '../styles/bottom-panel-content.module.scss';

interface BottomPanelContentProps {
    LogViewerComponent?: React.ComponentType<LogViewerProps>;
}

const BottomPanelContent: React.FC<BottomPanelContentProps> = ({ LogViewerComponent }) => {
    const { panelMode } = useBottomPanel();
    const isVisible = panelMode !== 'collapsed';

    return (
        <div className={`${styles.content} ${!isVisible ? styles.contentHidden : ''}`}>
            <ExecutionColumn />
            <ExecutionOrderColumn />
            <LogColumn LogViewerComponent={LogViewerComponent} />
        </div>
    );
};

export default BottomPanelContent;
