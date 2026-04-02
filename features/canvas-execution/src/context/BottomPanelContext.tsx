import { createContext, useContext } from 'react';
import type { BottomPanelContextValue } from '../types';

export const BottomPanelContext = createContext<BottomPanelContextValue | null>(null);

export function useBottomPanel(): BottomPanelContextValue {
    const ctx = useContext(BottomPanelContext);
    if (!ctx) {
        throw new Error('useBottomPanel must be used within <BottomPanelProvider>');
    }
    return ctx;
}
