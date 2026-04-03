'use client';

import React from 'react';
import { useTranslation } from '@xgen/i18n';
import { LuPlus } from '@xgen/icons';

export interface CanvasEmptyStateProps {
    onStartAgent: () => void;
    /** Optional card button component — injected to avoid coupling to shared UI */
    CardButton?: React.ComponentType<any>;
    /** Optional icon component */
    AgentIcon?: React.ComponentType<any>;
}

const CanvasEmptyState: React.FC<CanvasEmptyStateProps> = ({
    onStartAgent,
    CardButton,
    AgentIcon,
}) => {
    const { t } = useTranslation();

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-[100] [&>*]:pointer-events-auto">
            {CardButton ? (
                <CardButton
                    topIcon={<LuPlus />}
                    prefixIcon={AgentIcon ? <AgentIcon width={20} height={20} /> : null}
                    content={t('canvas.emptyState.startAgent', 'Start Agent')}
                    variant="primary"
                    onClick={onStartAgent}
                />
            ) : (
                <button
                    type="button"
                    className="flex flex-col items-center justify-center gap-2 w-60 min-w-60 h-[120px] min-h-[120px] shrink-0 p-4 rounded-lg border border-gray-200 bg-white cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={onStartAgent}
                >
                    <LuPlus className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('canvas.emptyState.startAgent', 'Start Agent')}</span>
                </button>
            )}
        </div>
    );
};

export default CanvasEmptyState;
