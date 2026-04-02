import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@xgen/ui';
import styles from '../styles/node-modal.module.scss';

export interface NodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (value: string) => void;
    parameterName: string;
    initialValue: string;
}

const NodeModal: React.FC<NodeModalProps> = ({
    isOpen,
    onClose,
    onSave,
    parameterName,
    initialValue,
}) => {
    const [value, setValue] = useState<string>(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue, isOpen]);

    const handleSave = () => {
        onSave(value);
        onClose();
    };

    const handleCancel = () => {
        setValue(initialValue);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleCancel(); }}>
            <DialogContent className={styles.modalContent} aria-describedby={undefined}>
                <DialogHeader className={styles.modalHeader}>
                    <DialogTitle>Edit {parameterName}</DialogTitle>
                </DialogHeader>
                <div className={styles.modalBody}>
                    <textarea
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrag={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDragEnd={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        draggable={false}
                        className={styles.textarea}
                        placeholder={`Enter ${parameterName}...`}
                        autoFocus
                    />
                </div>
                <DialogFooter className={styles.modalFooter}>
                    <button className={styles.cancelButton} onClick={handleCancel} type="button">Cancel</button>
                    <button className={styles.saveButton} onClick={handleSave} type="button">Save</button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NodeModal;
