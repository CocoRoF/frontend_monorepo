'use client';

import React, { useCallback } from 'react';
import { Modal, Button } from '@xgen/ui';
import { useTranslation } from '@xgen/i18n';
import { FiCopy } from '@xgen/icons';

interface ChatLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const ChatLogDetailModal: React.FC<ChatLogDetailModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
}) => {
  const { t } = useTranslation();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // Fallback: silent fail
    }
  }, [content]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FiCopy className="h-3.5 w-3.5" />}
            onClick={handleCopy}
          >
            {t('common.copy')}
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      }
    >
      <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-4 text-sm text-foreground font-mono">
        {content}
      </pre>
    </Modal>
  );
};

export default ChatLogDetailModal;
