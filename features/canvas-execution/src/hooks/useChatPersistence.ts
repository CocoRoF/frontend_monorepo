import { useState, useCallback, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';

const STORAGE_KEY_PREFIX = 'xgen:chat:';
const MAX_MESSAGES = 50;

const load = (workflowId: string): ChatMessage[] => {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY_PREFIX + workflowId);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return [];
};

const save = (workflowId: string, messages: ChatMessage[]) => {
    try {
        const trimmed = messages.slice(-MAX_MESSAGES);
        sessionStorage.setItem(STORAGE_KEY_PREFIX + workflowId, JSON.stringify(trimmed));
    } catch { /* ignore */ }
};

export function useChatPersistence(workflowId: string) {
    const [messages, setMessages] = useState<ChatMessage[]>(() => load(workflowId));
    const idRef = useRef(0);

    // Persist on change
    useEffect(() => {
        save(workflowId, messages);
    }, [messages, workflowId]);

    // Reset when workflowId changes
    useEffect(() => {
        setMessages(load(workflowId));
    }, [workflowId]);

    const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
        const msg: ChatMessage = {
            id: ++idRef.current,
            role,
            content,
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, msg]);
        return msg;
    }, []);

    const updateLastAssistant = useCallback((content: string) => {
        setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant') {
                return [...prev.slice(0, -1), { ...last, content }];
            }
            return prev;
        });
    }, []);

    const clearChat = useCallback(() => {
        setMessages([]);
        try {
            sessionStorage.removeItem(STORAGE_KEY_PREFIX + workflowId);
        } catch { /* ignore */ }
    }, [workflowId]);

    return { messages, setMessages, addMessage, updateLastAssistant, clearChat };
}
