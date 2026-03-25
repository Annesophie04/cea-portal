import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PORTAL_TABS } from '../config/portalTabs';
import { COPILOT_WELCOME_MARKDOWN, COPILOT_NAV_CONFIRM, COPILOT_ERROR_GENERIC } from '../copilot/copilotCopy';
import { generateSuggestions } from '../copilot/generateSuggestions';
import { sendCopilotMessage } from '../copilot/sendCopilotMessage';

function tabLabel(tabKey) {
  return PORTAL_TABS.find((t) => t.key === tabKey)?.label ?? tabKey;
}

/**
 * @param {{ documents?: unknown[], activeTab?: string, onNavigateTab?: (key: string) => void }} options
 */
export function useCopilot({ documents = [], activeTab = 'documents', onNavigateTab } = {}) {
  const bundle = useMemo(
    () => generateSuggestions({ activeTab, documents, pageType: 'portal' }),
    [activeTab, documents],
  );

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successPulse, setSuccessPulse] = useState(false);
  const successTimerRef = useRef(null);

  const [messages, setMessages] = useState(() => [
    { id: 'welcome', role: 'assistant', content: COPILOT_WELCOME_MARKDOWN },
  ]);

  const interactionState = useMemo(() => {
    if (loading) return 'loading';
    if (error) return 'error';
    if (successPulse) return 'success';
    const hasUser = messages.some((m) => m.role === 'user');
    if (!hasUser) return 'empty';
    return 'idle';
  }, [loading, error, successPulse, messages]);

  const clearSuccessTimer = useCallback(() => {
    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  }, []);

  const flashSuccess = useCallback(() => {
    clearSuccessTimer();
    setSuccessPulse(true);
    successTimerRef.current = window.setTimeout(() => {
      setSuccessPulse(false);
      successTimerRef.current = null;
    }, 2200);
  }, [clearSuccessTimer]);

  useEffect(
    () => () => {
      clearSuccessTimer();
    },
    [clearSuccessTimer],
  );

  const pushExchange = useCallback(
    async (userText, suggestionId) => {
      setError(null);
      const userMsg = { id: `u-${Date.now()}`, role: 'user', content: userText };
      setMessages((m) => [...m, userMsg]);
      setLoading(true);
      try {
        const reply = await sendCopilotMessage(userText, {
          suggestionId,
          documents,
          activeTab,
        });
        setMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'assistant', content: reply }]);
        flashSuccess();
      } catch (e) {
        console.error(e);
        setError(COPILOT_ERROR_GENERIC);
      } finally {
        setLoading(false);
      }
    },
    [documents, activeTab, flashSuccess],
  );

  const sendMessage = useCallback(
    (text) => {
      const t = String(text).trim();
      if (!t || loading) return;
      setInput('');
      pushExchange(t, undefined);
    },
    [loading, pushExchange],
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage],
  );

  const handleQuickPick = useCallback(
    (item) => {
      if (loading) return;
      setError(null);
      if (item.tabKey != null && typeof onNavigateTab === 'function') {
        onNavigateTab(item.tabKey);
        const section = tabLabel(item.tabKey);
        setMessages((m) => [
          ...m,
          { id: `u-${Date.now()}`, role: 'user', content: `→ ${item.label}` },
          { id: `a-${Date.now()}`, role: 'assistant', content: COPILOT_NAV_CONFIRM(section) },
        ]);
        flashSuccess();
        return;
      }
      if (item.prompt) {
        pushExchange(item.prompt, item.id);
      }
    },
    [loading, onNavigateTab, pushExchange, flashSuccess],
  );

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  return {
    bundle,
    open,
    setOpen,
    toggle,
    close,
    input,
    setInput,
    messages,
    loading,
    error,
    setError,
    interactionState,
    handleSubmit,
    handleQuickPick,
    sendMessage,
  };
}
