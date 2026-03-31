import React, { useMemo, memo } from 'react';
import { Node } from '../Node/index';
import type { NodeComponentProps } from '../Node/index';
import type { Port } from '@xgen/canvas-types';

/**
 * AgentXgenNode - Extends the base Node component with dynamic output
 * behavior based on whether streaming is enabled.
 *
 * When the 'streaming' parameter is true, additional outputs may be
 * dynamically shown or hidden based on the streaming configuration.
 */
export interface AgentXgenNodeProps extends NodeComponentProps {
    /** Whether to show streaming-dependent outputs */
    showStreamingOutputs?: boolean;
}

const AgentXgenNodeComponent: React.FC<AgentXgenNodeProps> = ({
    node,
    showStreamingOutputs,
    ...restProps
}) => {
    const outputs = node.data?.outputs ?? [];
    const parameters = node.data?.parameters ?? [];

    // Determine if streaming is enabled from parameters
    const isStreamingEnabled = useMemo(() => {
        if (showStreamingOutputs !== undefined) return showStreamingOutputs;
        const streamingParam = parameters.find(
            (p) => p.id === 'streaming' || p.name === 'streaming'
        );
        if (!streamingParam) return false;
        const val = streamingParam.value;
        if (typeof val === 'boolean') return val;
        if (typeof val === 'string') return val.toLowerCase() === 'true';
        return false;
    }, [parameters, showStreamingOutputs]);

    // Filter outputs based on streaming state
    const filteredNode = useMemo(() => {
        if (!node.data) return node;

        // Some outputs are only visible when streaming is enabled
        // These are typically marked with a `streaming_only` flag or
        // have specific IDs like 'stream_output', 'token_output'
        const effectiveOutputs = isStreamingEnabled
            ? outputs
            : outputs.filter((output: Port) => {
                // Keep outputs that are not streaming-only
                return !(output as any).streaming_only;
            });

        if (effectiveOutputs.length === outputs.length) return node;

        return {
            ...node,
            data: {
                ...node.data,
                outputs: effectiveOutputs
            }
        };
    }, [node, outputs, isStreamingEnabled]);

    return <Node node={filteredNode} {...restProps} />;
};

export const AgentXgenNode = memo(AgentXgenNodeComponent);
