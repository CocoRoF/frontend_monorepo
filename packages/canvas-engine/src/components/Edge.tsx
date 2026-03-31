import React, { memo, useMemo } from 'react';
import type { Position } from '@xgen/canvas-types';
import styles from '../styles/Edge.module.scss';

interface EdgeProps {
    id: string;
    sourcePos: Position;
    targetPos: Position;
    sourcePortType: 'input' | 'output';
    targetPortType: 'input' | 'output';
    sourceExpanded?: boolean;
    targetExpanded?: boolean;
    onEdgeClick?: (edgeId: string, e?: React.MouseEvent) => void;
    isSelected?: boolean;
    isPreview?: boolean;
}

const STUB_EXPANDED = 24;
const STUB_COLLAPSED = 8;
const CURVATURE_RATIO = 0.5;
const MIN_CONTROL_OFFSET = 40;
const MAX_Y_INFLUENCE = 150;

function buildPath(
    sourcePos: Position,
    targetPos: Position,
    sourcePortType: 'input' | 'output',
    targetPortType: 'input' | 'output',
    sourceExpanded: boolean = true,
    targetExpanded: boolean = true
): string {
    const srcStub = sourceExpanded ? STUB_EXPANDED : STUB_COLLAPSED;
    const tgtStub = targetExpanded ? STUB_COLLAPSED : STUB_COLLAPSED;

    const srcDir = sourcePortType === 'output' ? 1 : -1;
    const tgtDir = targetPortType === 'input' ? -1 : 1;

    const sx = sourcePos.x + srcDir * srcStub;
    const sy = sourcePos.y;
    const tx = targetPos.x + tgtDir * tgtStub;
    const ty = targetPos.y;

    const dx = Math.abs(tx - sx);
    const dy = Math.abs(ty - sy);
    const yInfluence = Math.min(dy * 0.2, MAX_Y_INFLUENCE);

    const controlOffset = Math.max(dx * CURVATURE_RATIO, MIN_CONTROL_OFFSET) + yInfluence;

    const cx1 = sx + srcDir * controlOffset;
    const cy1 = sy;
    const cx2 = tx + tgtDir * controlOffset;
    const cy2 = ty;

    return `M ${sourcePos.x} ${sourcePos.y} L ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty} L ${targetPos.x} ${targetPos.y}`;
}

const EdgeComponent: React.FC<EdgeProps> = ({
    id,
    sourcePos,
    targetPos,
    sourcePortType,
    targetPortType,
    sourceExpanded = true,
    targetExpanded = true,
    onEdgeClick,
    isSelected = false,
    isPreview = false,
}) => {
    const pathD = useMemo(
        () => buildPath(sourcePos, targetPos, sourcePortType, targetPortType, sourceExpanded, targetExpanded),
        [sourcePos, targetPos, sourcePortType, targetPortType, sourceExpanded, targetExpanded]
    );

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onEdgeClick) {
            onEdgeClick(id, e);
        }
    };

    return (
        <g className={`${styles.edge} ${isSelected ? styles.selected : ''} ${isPreview ? styles.preview : ''}`}>
            {/* Hitbox (wider invisible path for click detection) */}
            <path
                d={pathD}
                className={styles.hitbox}
                onClick={handleClick}
                fill="none"
                strokeWidth={14}
                stroke="transparent"
                style={{ cursor: 'pointer' }}
            />
            {/* Visible path */}
            <path
                d={pathD}
                className={styles.path}
                fill="none"
                strokeWidth={isSelected ? 2.5 : 2}
            />
        </g>
    );
};

export const Edge = memo(EdgeComponent);
export default Edge;
