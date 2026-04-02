'use client';

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  closeOnEsc?: boolean;
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[960px]',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen, onClose, title, size = 'md',
  closeOnEsc = true, closeOnOverlay = true, showCloseButton = true,
  children, footer, className,
}) => {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[300] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onClick={closeOnOverlay ? undefined : (e) => e.stopPropagation()}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[300] w-full -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background shadow-xl duration-200',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            sizeClasses[size],
            className
          )}
          onEscapeKeyDown={closeOnEsc ? undefined : (e) => e.preventDefault()}
          onInteractOutside={closeOnOverlay ? undefined : (e) => e.preventDefault()}
        >
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              {title && (
                <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                  {title}
                </DialogPrimitive.Title>
              )}
              {showCloseButton && (
                <DialogPrimitive.Close className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                  <X className="h-5 w-5" />
                  <span className="sr-only">닫기</span>
                </DialogPrimitive.Close>
              )}
            </div>
          )}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">{children}</div>
          {footer && <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default Modal;