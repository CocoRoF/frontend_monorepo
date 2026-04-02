import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '@xgen/i18n';
import { useBottomPanel } from '../context/BottomPanelContext';
import type { LogEntry, LogViewerProps } from '../types';
import styles from '../styles/log-column.module.scss';

// ── Fallback Log Viewer ────────────────────────────────────────

const DefaultLogViewer: React.FC<LogViewerProps> = ({ logs, className }) => (
    <div className={className}>
        {logs.map((log, i) => (
            <div key={i} style={{ padding: '2px 16px', fontSize: 12, fontFamily: 'monospace' }}>
                <span style={{ color: '#7a7f89' }}>[{log.timestamp}]</span>{' '}
                <span style={{ color: log.level === 'ERROR' ? '#e03131' : '#40444d' }}>
                    {log.message}
                </span>
            </div>
        ))}
    </div>
);

// ── Log Column ─────────────────────────────────────────────────

interface LogColumnInternalProps {
    LogViewerComponent?: React.ComponentType<LogViewerProps>;
}

const LogColumn: React.FC<LogColumnInternalProps> = ({ LogViewerComponent }) => {
    const { t } = useTranslation();
    const { logs, clearLogs } = useBottomPanel();

    const [searchQuery, setSearchQuery] = useState('');
    const [showDebug, setShowDebug] = useState(false);
    const [showTools, setShowTools] = useState(true);
    const [autoScroll, setAutoScroll] = useState(true);

    const Viewer = LogViewerComponent || DefaultLogViewer;

    const filteredLogs = useMemo(() => {
        let filtered = logs;

        // Level filters
        if (!showDebug) {
            filtered = filtered.filter(l => l.level !== 'DEBUG');
        }
        if (!showTools) {
            filtered = filtered.filter(l => !l.event_type);
        }

        // Text search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(l =>
                l.message.toLowerCase().includes(q) ||
                (l.node_name && l.node_name.toLowerCase().includes(q)) ||
                (l.tool_name && l.tool_name.toLowerCase().includes(q))
            );
        }

        return filtered;
    }, [logs, showDebug, showTools, searchQuery]);

    const hasSearch = searchQuery.trim().length > 0;
    const noResults = hasSearch && filteredLogs.length === 0;

    return (
        <div className={styles.column}>
            <div className={styles.toolbar}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder={t('canvas.bottomPanel.logViewer.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>
                        <input
                            type="checkbox"
                            checked={showDebug}
                            onChange={(e) => setShowDebug(e.target.checked)}
                        />
                        {t('canvas.bottomPanel.logViewer.showDebug')}
                    </label>
                    <label className={styles.filterLabel}>
                        <input
                            type="checkbox"
                            checked={showTools}
                            onChange={(e) => setShowTools(e.target.checked)}
                        />
                        {t('canvas.bottomPanel.logViewer.showTools')}
                    </label>
                </div>
                <label className={styles.autoScrollLabel}>
                    <input
                        type="checkbox"
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                    />
                    {t('canvas.bottomPanel.logViewer.autoScroll')}
                </label>
            </div>
            {noResults ? (
                <div className={styles.noMatch}>
                    {t('canvas.bottomPanel.logViewer.noMatch')}
                </div>
            ) : (
                <Viewer
                    logs={filteredLogs}
                    onClearLogs={clearLogs}
                    className={styles.logViewerFill}
                />
            )}
        </div>
    );
};

export default LogColumn;
