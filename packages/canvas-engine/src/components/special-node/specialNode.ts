import type { CanvasNode } from '@xgen/canvas-types';
import type { FC } from 'react';
import type { NodeComponentProps } from '../Node/index';

export interface SpecialNodeConfig {
    /** Test function to check if a node matches this special node type */
    matcher: (nodeData: { id: string; name?: string; [key: string]: any }) => boolean;
    /** The component to render for this special node type */
    component: FC<NodeComponentProps>;
    /** Additional default props to pass to the component */
    additionalProps?: Record<string, any>;
    /** Display label for this special node type */
    label: string;
}

const SPECIAL_NODES: SpecialNodeConfig[] = [];

/**
 * Register a special node renderer.
 * Called by feature packages to inject their special node components.
 */
export function registerSpecialNode(config: SpecialNodeConfig): void {
    // Prevent duplicate registration
    const existingIndex = SPECIAL_NODES.findIndex(
        (n) => n.label === config.label
    );
    if (existingIndex >= 0) {
        SPECIAL_NODES[existingIndex] = config;
    } else {
        SPECIAL_NODES.push(config);
    }
}

/**
 * Find a special node configuration that matches the given node data.
 * Returns the config if found, or null if the node is a standard node.
 */
export function findSpecialNode(
    nodeData: { id: string; name?: string; [key: string]: any }
): SpecialNodeConfig | null {
    for (const config of SPECIAL_NODES) {
        if (config.matcher(nodeData)) {
            return config;
        }
    }
    return null;
}

/**
 * Get all registered special node configurations.
 */
export function getSpecialNodes(): readonly SpecialNodeConfig[] {
    return SPECIAL_NODES;
}

/**
 * Built-in matchers for common special node types.
 * Feature packages can use these or define their own.
 */
export const SpecialNodeMatchers = {
    router: (nodeData: { id: string }) =>
        nodeData.id.toLowerCase().includes('router'),
    agentXgen: (nodeData: { id: string }) =>
        nodeData.id.toLowerCase().includes('agentxgen') ||
        nodeData.id.toLowerCase().includes('agent_xgen'),
    schemaProvider: (nodeData: { id: string }) =>
        nodeData.id.toLowerCase().includes('schemaprovider') ||
        nodeData.id.toLowerCase().includes('schema_provider')
} as const;
