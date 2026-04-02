import React, { useRef, type MouseEvent } from 'react';
import { LuCopy } from '@xgen/icons';
import { useTranslation } from '@xgen/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@xgen/ui';
import MiniCanvas, { type Template } from './MiniCanvas';
import styles from '../styles/template-preview.module.scss';

interface TemplatePreviewProps {
    template: Template | null;
    onClose: () => void;
    onUseTemplate: (template: Template | null) => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onClose, onUseTemplate }) => {
    const { t } = useTranslation();
    const previewRef = useRef<HTMLDivElement>(null);

    const handleUseTemplate = (tmpl: Template | null): void => {
        onUseTemplate(tmpl);
        onClose();
    };

    return (
        <Dialog open={!!template} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent
                className={styles.previewContainer}
                ref={previewRef}
                data-template-preview="true"
                onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                onMouseDown={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                aria-describedby={undefined}
            >
                <DialogHeader className={styles.header}>
                    <div className={styles.titleSection}>
                        <DialogTitle asChild>
                            <h3>{template?.name}</h3>
                        </DialogTitle>
                        <div className={styles.tagsContainer}>
                            {template?.tags?.map((tag) => (
                                <span key={tag} className={styles.category}>{tag}</span>
                            ))}
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <button
                            className={styles.useButton}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUseTemplate(template); }}
                            onMouseDown={(e) => e.stopPropagation()}
                            title={t('canvas.templatePreview.useTemplate', 'Use Template')}
                            type="button"
                        >
                            <LuCopy />
                            {t('canvas.templatePreview.useTemplate', 'Use Template')}
                        </button>
                    </div>
                </DialogHeader>

                <div className={styles.previewContent}>
                    <div className={styles.canvasContainer}>
                        {template && <MiniCanvas template={template} />}
                    </div>
                    <div className={styles.templateInfo}>
                        <p className={styles.description}>{template?.description}</p>
                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>Nodes:</span>
                                <span className={styles.statValue}>{template?.nodes}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TemplatePreview;
