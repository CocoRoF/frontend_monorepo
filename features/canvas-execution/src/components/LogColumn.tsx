import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '@xgen/i18n';
import { useBottomPanel } from '../context/BottomPanelContext';
import type { LogEntry, LogViewerProps } from '../types';

// ── Fallback Log Viewer ────────────────────────────────────────

const DefaultLogViewer: React.FC<LogViewerProps> = ({ logs, className }) => (
    <div className={className}>
        {logs.map((log, i) => (
            <div key={i} className="py-0.5 px-4 text-xs font-mono">
                <span className="text-[var(--color-gray-500)]">[{log.timestamp}]</span>{' '}
                <span className={log.level === 'ERROR' ? 'text-red-600' : 'text-[var(--color-gray-600)]'}>
                    {log.message}
                </span>
            </div>
        ))}
    </div>
);

const filterLabelClass = 'flex items-center gap-1 text-[11px] text-[var(--color-gray-500)] cursor-pointer whitespace-nowrap select-none [&_input[type=checkbox]]:m-0 [&_input[type=checkbox]]:accent-primary';

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

        if (!showDebug) {
            filtered = filtered.filter(l => l.level !== 'DEBUG');
        }
        if (!showTools) {
            filtered = filtered.filter(l => !l.event_type);
        }

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
        <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 py-1.5 px-3 border-b border-[var(--color-line-50)] bg-[var(--color-bg-50)] shrink-0">
                <input
                    type="text"
                    className="flex-1 py-1 px-2 border border-[var(--color-line-50)] rounded-lg text-xs leading-[18px] text-[var(--color-gray-600)] bg-white outline-none min-w-0 focus:border-primary placeholder:text-[var(--color-gray-400)]"
                    placeholder={t('canvas.bottomPanel.logViewer.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex items-center gap-1.5">
                    <label className={filterLabelClass}>
                        <input
                            type="checkbox"
                            checked={showDebug}
                            onChange={(e) => setShowDebug(e.target.checked)}
                        />
                        {t('canvas.bottomPanel.logViewer.showDebug')}
                    </label>
                    <label className={filterLabelClass}>
                        <input
                            type="checkbox"
                            checked={showTools}
                            onChange={(e) => setShowTools(e.target.checked)}
                        />
                        {t('canvas.bottomPanel.logViewer.showTools')}
                    </label>
                </div>
                <label className={`${filterLabelClass} ml-auto`}>
                    <input
                        type="checkbox"
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                    />
                    {t('canvas.bottomPanel.logViewer.autoScroll')}
                </label>
            </div>
            {noResults ? (
                <div className="p-4 text-xs text-[var(--color-gray-500)] text-center">
                    {t('canvas.bottomPanel.logViewer.noMatch')}
                </div>
            ) : (
                <Viewer
                    logs={filteredLogs}
                    onClearLogs={clearLogs}
                    className="flex-1 min-h-0 overflow-hidden flex flex-col text-[15px]"
                />
            )}
        </div>
    );
};

export default LogColumn;
