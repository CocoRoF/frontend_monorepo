'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { RouteComponentProps, MainFeatureModule, CanvasPagePlugin, CanvasPluginContext } from '@xgen/types';
import { FeatureRegistry } from '@xgen/types';
import { useTranslation } from '@xgen/i18n';

// Canvas packages
import { Canvas } from '@xgen/canvas-engine';
import type { CanvasRef } from '@xgen/canvas-engine';

// Canvas core UI
import {
    SideMenu,
    EditRunFloating,
    Zoombox,
    ZoomPercent,
    CanvasEmptyState,
} from '@xgen/feature-canvas-core';
import type { CanvasMode, MenuView } from '@xgen/feature-canvas-core';

import styles from './CanvasPage.module.scss';

// ── Types ──────────────────────────────────────────────────────

interface CanvasPageProps extends RouteComponentProps {
    onNavigate?: (sectionId: string) => void;
}

interface NodeModalState {
    isOpen: boolean;
    nodeId: string;
    paramId: string;
    paramName: string;
    currentValue: string;
}

interface NodeDetailModalState {
    isOpen: boolean;
    nodeId: string;
    nodeDataId: string;
    nodeName: string;
}

// ── Component ──────────────────────────────────────────────────

const CanvasPage: React.FC<CanvasPageProps> = ({ onNavigate }) => {
    const { t } = useTranslation();

    // ── Refs ──
    const canvasRef = useRef<CanvasRef>(null);
    const menuRef = useRef<HTMLElement>(null);
    const directPanelRef = useRef<HTMLElement>(null);

    // ── Core state ──
    const [canvasMode, setCanvasMode] = useState<CanvasMode>('edit');
    const [workflowId, setWorkflowId] = useState('None');
    const [workflowName, setWorkflowName] = useState('Workflow');
    const [isExecuting, setIsExecuting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const [loadingCanvas, setLoadingCanvas] = useState(true);

    // ── Canvas state tracking ──
    const [currentCanvasState, setCurrentCanvasState] = useState<any>(null);
    const [zoomPercent, setZoomPercent] = useState(100);

    // ── Panel states ──
    const [directPanel, setDirectPanel] = useState<MenuView | null>(null);
    const [bottomPanelExpanded, setBottomPanelExpanded] = useState(false);
    const [activeSidePanel, setActiveSidePanel] = useState<string | null>(null);
    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
    const [isAutoWorkflowOpen, setIsAutoWorkflowOpen] = useState(false);

    // ── Execution state ──
    const [executionOutput, setExecutionOutput] = useState<any>(null);
    const [executionLogs, setExecutionLogs] = useState<any[]>([]);
    const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());

    // ── Modal states ──
    const [nodeModalState, setNodeModalState] = useState<NodeModalState>({
        isOpen: false, nodeId: '', paramId: '', paramName: '', currentValue: '',
    });
    const [nodeDetailModalState, setNodeDetailModalState] = useState<NodeDetailModalState>({
        isOpen: false, nodeId: '', nodeDataId: '', nodeName: '',
    });
    const [documentDropModal, setDocumentDropModal] = useState<{
        isOpen: boolean; file: File; dropX: number; dropY: number;
        targetNodeId?: string; defaultCollectionName?: string;
    } | null>(null);

    // ── Plugin context ──
    const pluginContext: CanvasPluginContext = useMemo(() => ({
        canvasRef: canvasRef as React.RefObject<any>,
        canvasMode,
        workflowId,
        workflowName,
        isExecuting,
        isSaving,
    }), [canvasMode, workflowId, workflowName, isExecuting, isSaving]);

    // ── Registered plugins ──
    const plugins = useMemo(() => FeatureRegistry.getCanvasPagePlugins(), []);

    const headerPlugin = useMemo(
        () => plugins.find((p) => p.headerComponent),
        [plugins],
    );
    const sidePanels = useMemo(
        () => plugins.flatMap((p) => p.sidePanels ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        [plugins],
    );
    const bottomPanels = useMemo(
        () => plugins.flatMap((p) => p.bottomPanels ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        [plugins],
    );
    const overlays = useMemo(
        () => plugins.flatMap((p) => p.overlays ?? []),
        [plugins],
    );
    const modals = useMemo(
        () => plugins.flatMap((p) => p.modals ?? []),
        [plugins],
    );

    // ── Initialization ──
    useEffect(() => {
        // Simulate canvas initialization
        const timer = setTimeout(() => setLoadingCanvas(false), 100);
        return () => clearTimeout(timer);
    }, []);

    // ── Canvas event handlers ──
    const handleCanvasStateChange = useCallback((state: any) => {
        setCurrentCanvasState(state);
        if (state?.view?.scale) {
            setZoomPercent(Math.round(state.view.scale * 100));
        }
    }, []);

    const handleModeChange = useCallback((mode: CanvasMode) => {
        if (isExecuting) return;
        setCanvasMode(mode);
    }, [isExecuting]);

    // ── Zoom handlers ──
    const handleZoomIn = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas && typeof (canvas as any).zoomIn === 'function') {
            (canvas as any).zoomIn();
        }
    }, []);

    const handleZoomOut = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas && typeof (canvas as any).zoomOut === 'function') {
            (canvas as any).zoomOut();
        }
    }, []);

    // ── Save handler ──
    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            // Save logic will be wired by app integration
            await new Promise((resolve) => setTimeout(resolve, 500));
        } finally {
            setIsSaving(false);
        }
    }, []);

    // ── Side panel toggle ──
    const handleSidePanelToggle = useCallback((panelId: string) => {
        setActiveSidePanel((prev) => (prev === panelId ? null : panelId));
    }, []);

    // ── Empty state actions ──
    const handleEmptyAddStartNode = useCallback(() => {
        setDirectPanel('addNodes');
    }, []);

    const handleEmptyTemplateStart = useCallback(() => {
        setDirectPanel('template');
    }, []);

    const handleEmptyAICreate = useCallback(() => {
        setIsAutoWorkflowOpen(true);
    }, []);

    // ── Node modal handlers ──
    const handleOpenNodeModal = useCallback((nodeId: string, paramId: string, paramName: string, currentValue: string) => {
        setNodeModalState({ isOpen: true, nodeId, paramId, paramName, currentValue });
    }, []);

    const handleCloseNodeModal = useCallback(() => {
        setNodeModalState({ isOpen: false, nodeId: '', paramId: '', paramName: '', currentValue: '' });
    }, []);

    const handleSaveNodeModal = useCallback((value: string) => {
        if (canvasRef.current && nodeModalState.nodeId && nodeModalState.paramId) {
            (canvasRef.current as any).updateNodeParameter?.(
                nodeModalState.nodeId,
                nodeModalState.paramId,
                value,
            );
        }
        handleCloseNodeModal();
    }, [nodeModalState, handleCloseNodeModal]);

    // ── Node detail modal handlers ──
    const handleOpenNodeDetailModal = useCallback((nodeId: string, nodeDataId: string, nodeName: string) => {
        setNodeDetailModalState({ isOpen: true, nodeId, nodeDataId, nodeName });
    }, []);

    const handleCloseNodeDetailModal = useCallback(() => {
        setNodeDetailModalState({ isOpen: false, nodeId: '', nodeDataId: '', nodeName: '' });
    }, []);

    // ── Workflow load handler ──
    const handleLoadWorkflow = useCallback((workflowData: any, name?: string, id?: string) => {
        if (canvasRef.current && typeof (canvasRef.current as any).loadWorkflow === 'function') {
            (canvasRef.current as any).loadWorkflow(workflowData);
        }
        if (name) setWorkflowName(name);
        if (id) setWorkflowId(id);
    }, []);

    // ── Execution handlers ──
    const handleClearOutput = useCallback(() => setExecutionOutput(null), []);
    const handleClearLogs = useCallback(() => setExecutionLogs([]), []);

    // ── Active side panel component ──
    const ActiveSidePanelComponent = useMemo(() => {
        if (!activeSidePanel) return null;
        const panel = sidePanels.find((p) => p.id === activeSidePanel);
        return panel?.component ?? null;
    }, [activeSidePanel, sidePanels]);

    // ── Backspace prevention ──
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === 'Backspace' &&
                e.target instanceof HTMLElement &&
                e.target.tagName !== 'INPUT' &&
                e.target.tagName !== 'SELECT' &&
                e.target.tagName !== 'TEXTAREA' &&
                !e.target.isContentEditable
            ) {
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // ── Loading state ──
    if (loadingCanvas) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p className={styles.loadingText}>{t('canvas.loading', 'Canvas를 불러오는 중...')}</p>
            </div>
        );
    }

    // ── Header component ──
    const HeaderComponent = headerPlugin?.headerComponent;

    // ── Check for empty canvas ──
    const isCanvasEmpty = currentCanvasState != null &&
        (!currentCanvasState.nodes || currentCanvasState.nodes.length === 0);

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            {HeaderComponent && (
                <HeaderComponent
                    {...pluginContext}
                    onSave={handleSave}
                    onNewWorkflow={() => {/* wired by app */}}
                    onSidePanelToggle={handleSidePanelToggle}
                    onToggleAI={() => setIsAutoWorkflowOpen(true)}
                    sidePanels={sidePanels}
                />
            )}

            {/* Main content area */}
            <main className={styles.mainContent}>
                {/* Edit / Run floating toggle */}
                <EditRunFloating
                    mode={canvasMode}
                    onModeChange={handleModeChange}
                    disabled={isExecuting}
                />

                {/* Canvas area */}
                <div className={styles.canvasWrapper}>
                    <Canvas
                        ref={canvasRef}
                        onStateChange={handleCanvasStateChange}
                        onOpenNodeModal={handleOpenNodeModal}
                        onViewDetails={handleOpenNodeDetailModal}
                    />

                    {/* Empty state overlay */}
                    {isCanvasEmpty && (
                        <CanvasEmptyState
                            onAddStartNode={handleEmptyAddStartNode}
                            onTemplateStart={handleEmptyTemplateStart}
                            onAICreate={handleEmptyAICreate}
                        />
                    )}

                    {/* Zoom controls */}
                    <div
                        className={styles.zoomControls}
                        style={{ bottom: bottomPanelExpanded ? 312 : 54 }}
                    >
                        <Zoombox
                            inline
                            onZoomIn={handleZoomIn}
                            onZoomOut={handleZoomOut}
                        />
                        <ZoomPercent value={zoomPercent} />
                    </div>
                </div>

                {/* Side panel (plugin-based) */}
                {ActiveSidePanelComponent && (
                    <aside className={styles.sidePanel}>
                        <ActiveSidePanelComponent
                            {...pluginContext}
                            onClose={() => setActiveSidePanel(null)}
                            onLoadWorkflow={handleLoadWorkflow}
                        />
                    </aside>
                )}

                {/* Direct panel (from SideMenu navigation) */}
                {directPanel && (
                    <SideMenu
                        menuRef={menuRef}
                        initialView={directPanel}
                    />
                )}

                {/* Bottom panels */}
                {bottomPanels.length > 0 && (
                    <div className={styles.bottomPanel}>
                        {bottomPanels.map((panel) => {
                            const PanelComponent = panel.component;
                            return (
                                <PanelComponent
                                    key={panel.id}
                                    {...pluginContext}
                                    isExpanded={bottomPanelExpanded}
                                    onToggleExpand={() => setBottomPanelExpanded((prev) => !prev)}
                                />
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Overlays (AutoWorkflow sidebar, History panel, etc.) */}
            {overlays.map((overlay) => {
                const OverlayComponent = overlay.component;
                const isOpen =
                    overlay.id === 'auto-workflow-sidebar' ? isAutoWorkflowOpen :
                    overlay.id === 'history-panel' ? isHistoryPanelOpen :
                    false;
                const onClose =
                    overlay.id === 'auto-workflow-sidebar' ? () => setIsAutoWorkflowOpen(false) :
                    overlay.id === 'history-panel' ? () => setIsHistoryPanelOpen(false) :
                    () => {};
                return (
                    <OverlayComponent
                        key={overlay.id}
                        {...pluginContext}
                        isOpen={isOpen}
                        onClose={onClose}
                    />
                );
            })}

            {/* Modals */}
            {modals.map((modal) => {
                const ModalComponent = modal.component;
                let isOpen = false;
                let data: unknown;
                let onClose = () => {};

                if (modal.id === 'node-detail-modal') {
                    isOpen = nodeDetailModalState.isOpen;
                    data = nodeDetailModalState;
                    onClose = handleCloseNodeDetailModal;
                } else if (modal.id === 'document-drop-modal') {
                    isOpen = documentDropModal?.isOpen ?? false;
                    data = documentDropModal;
                    onClose = () => setDocumentDropModal(null);
                }

                if (!isOpen) return null;

                return (
                    <ModalComponent
                        key={modal.id}
                        {...pluginContext}
                        isOpen={isOpen}
                        data={data}
                        onClose={onClose}
                    />
                );
            })}
        </div>
    );
};

// ── Feature Module Export ───────────────────────────────────────

export const canvasEditorFeature: MainFeatureModule = {
    id: 'canvas-editor',
    name: 'Canvas Editor',
    sidebarSection: 'workflow',
    sidebarItems: [],
    routes: {
        'canvas-editor': CanvasPage,
    },
    requiresAuth: true,
};

export { CanvasPage };
export default canvasEditorFeature;
