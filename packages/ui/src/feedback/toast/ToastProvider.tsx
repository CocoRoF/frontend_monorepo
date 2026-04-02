'use client';

import React, { createContext, useCallback, useMemo, useRef } from 'react';
import { Toaster, toast as sonnerToast } from 'sonner';
import type {
  ToastType,
  ToastOptions,
  ConfirmToastOptions,
  ToastContextValue,
  ToastProviderProps,
} from './toast-types';

export const ToastContext = createContext<ToastContextValue | null>(null);

const positionMap: Record<string, 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'> = {
  'top-left': 'top-left',
  'top-center': 'top-center',
  'top-right': 'top-right',
  'bottom-left': 'bottom-left',
  'bottom-center': 'bottom-center',
  'bottom-right': 'bottom-right',
};

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'bottom-right',
  maxToasts = 5,
  defaultDuration = 3000,
  offset,
}) => {
  const confirmResolvers = useRef<Map<string, (v: boolean) => void>>(new Map());

  const toastApi = useMemo(() => {
    const success = (message: string, options?: ToastOptions): string => {
      const id = options?.id || String(Date.now());
      sonnerToast.success(message, { id, duration: options?.duration ?? defaultDuration, icon: options?.icon });
      return id;
    };

    const error = (message: string, options?: ToastOptions): string => {
      const id = options?.id || String(Date.now());
      sonnerToast.error(message, { id, duration: options?.duration ?? 4000, icon: options?.icon });
      return id;
    };

    const warning = (message: string, options?: ToastOptions): string => {
      const id = options?.id || String(Date.now());
      sonnerToast.warning(message, { id, duration: options?.duration ?? 4000, icon: options?.icon });
      return id;
    };

    const info = (message: string, options?: ToastOptions): string => {
      const id = options?.id || String(Date.now());
      sonnerToast.info(message, { id, duration: options?.duration ?? defaultDuration, icon: options?.icon });
      return id;
    };

    const loading = (message: string, options?: Omit<ToastOptions, 'duration'>): string => {
      const id = options?.id || String(Date.now());
      sonnerToast.loading(message, { id, icon: options?.icon });
      return id;
    };

    const confirm = (opts: ConfirmToastOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        const id = String(Date.now());
        confirmResolvers.current.set(id, resolve);

        sonnerToast(opts.title, {
          id,
          description: opts.message,
          duration: Infinity,
          action: {
            label: opts.confirmText || '확인',
            onClick: () => {
              confirmResolvers.current.get(id)?.(true);
              confirmResolvers.current.delete(id);
            },
          },
          cancel: {
            label: opts.cancelText || '취소',
            onClick: () => {
              confirmResolvers.current.get(id)?.(false);
              confirmResolvers.current.delete(id);
            },
          },
          onDismiss: () => {
            if (confirmResolvers.current.has(id)) {
              confirmResolvers.current.get(id)?.(false);
              confirmResolvers.current.delete(id);
            }
          },
        });
      });
    };

    const dismiss = (id: string) => {
      sonnerToast.dismiss(id);
    };

    const dismissAll = () => {
      sonnerToast.dismiss();
    };

    const update = (id: string, type: ToastType, message: string, options?: ToastOptions) => {
      const method = type === 'loading' ? sonnerToast.loading
        : type === 'success' ? sonnerToast.success
        : type === 'error' ? sonnerToast.error
        : type === 'warning' ? sonnerToast.warning
        : sonnerToast.info;
      method(message, { id, duration: options?.duration, icon: options?.icon });
    };

    return { toast: { success, error, warning, info, loading, confirm, dismiss, dismissAll, update } };
  }, [defaultDuration]);

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      <Toaster
        position={positionMap[position]}
        visibleToasts={maxToasts}
        offset={offset ? `${offset.y ?? 0}px` : undefined}
        richColors
        closeButton
      />
    </ToastContext.Provider>
  );
};