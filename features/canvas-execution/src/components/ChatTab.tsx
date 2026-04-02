import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useTranslation } from '@xgen/i18n';
import { LuSend } from '@xgen/icons';
import { useBottomPanel } from '../context/BottomPanelContext';
import styles from '../styles/chat-tab.module.scss';

const ChatTab: React.FC = () => {
    const { t } = useTranslation();
    const {
        chatMessages,
        chatInput,
        isExecuting,
        sendChatMessage,
        setChatInput,
    } = useBottomPanel();

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage(chatInput);
        }
    }, [chatInput, sendChatMessage]);

    const handleSend = useCallback(() => {
        sendChatMessage(chatInput);
    }, [chatInput, sendChatMessage]);

    return (
        <>
            <div className={styles.chatArea} ref={scrollRef}>
                {chatMessages.length === 0 ? (
                    <span className={styles.placeholder}>
                        {t('canvas.bottomPanel.chat.placeholder')}
                    </span>
                ) : (
                    chatMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.assistantBubble}`}
                        >
                            {msg.role === 'assistant' && !msg.content && isExecuting ? (
                                <div className={styles.typing}>
                                    <span /><span /><span />
                                </div>
                            ) : (
                                <pre className={styles.bubbleContent}>{msg.content}</pre>
                            )}
                        </div>
                    ))
                )}
            </div>
            <div className={styles.inputBar}>
                <textarea
                    className={styles.input}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('canvas.bottomPanel.chat.inputHint')}
                    disabled={isExecuting}
                    rows={1}
                />
                <button
                    className={styles.sendBtn}
                    onClick={handleSend}
                    disabled={isExecuting || !chatInput.trim()}
                    title={t('canvas.bottomPanel.chat.send')}
                    type="button"
                >
                    <LuSend />
                </button>
            </div>
        </>
    );
};

export default ChatTab;
