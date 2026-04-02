import { useEffect, useCallback } from 'react';
import { useBottomPanel } from '../context/BottomPanelContext';

/**
 * Keyboard shortcuts for the bottom panel.
 *
 * | Shortcut              | Action                        |
 * |-----------------------|-------------------------------|
 * | Cmd/Ctrl + J          | Toggle collapse / expand      |
 * | Cmd/Ctrl + Shift + J  | Toggle fullscreen             |
 * | Cmd/Ctrl + 1          | Activate Chat tab             |
 * | Cmd/Ctrl + 2          | Activate Executor tab         |
 * | Escape                | Fullscreen → normal → collapse|
 */
export function useBottomPanelShortcuts(enabled = true) {
    const {
        panelMode,
        togglePanel,
        setFullscreen,
        collapsePanel,
        setActiveExecutionTab,
    } = useBottomPanel();

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!enabled) return;
            const mod = e.metaKey || e.ctrlKey;

            // Cmd/Ctrl + Shift + J → toggle fullscreen
            if (mod && e.shiftKey && e.key.toLowerCase() === 'j') {
                e.preventDefault();
                setFullscreen(panelMode !== 'fullscreen');
                return;
            }

            // Cmd/Ctrl + J → toggle collapse/expand
            if (mod && !e.shiftKey && e.key.toLowerCase() === 'j') {
                e.preventDefault();
                togglePanel();
                return;
            }

            // Cmd/Ctrl + 1 → Chat tab
            if (mod && e.key === '1') {
                e.preventDefault();
                setActiveExecutionTab('chat');
                return;
            }

            // Cmd/Ctrl + 2 → Executor tab
            if (mod && e.key === '2') {
                e.preventDefault();
                setActiveExecutionTab('executor');
                return;
            }

            // Escape → step down: fullscreen → expanded → collapsed
            if (e.key === 'Escape') {
                if (panelMode === 'fullscreen') {
                    e.preventDefault();
                    setFullscreen(false);
                } else if (panelMode === 'expanded') {
                    e.preventDefault();
                    collapsePanel();
                }
            }
        },
        [enabled, panelMode, togglePanel, setFullscreen, collapsePanel, setActiveExecutionTab]
    );

    useEffect(() => {
        if (!enabled) return;
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [enabled, handleKeyDown]);
}
