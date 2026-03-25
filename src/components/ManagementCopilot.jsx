import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X } from 'lucide-react';
import { COPILOT_EMPTY_HINT } from '../copilot/copilotCopy';
import { useCloseOnOutsidePress } from '../hooks/useCloseOnOutsidePress';
import { useCopilot } from '../hooks/useCopilot';
import { CopilotContainer } from './copilot/CopilotContainer';
import { cn } from '../utils/cn';

/**
 * Copilote de gestion — fermé par défaut (minimisé), panneau compact desktop (~350px),
 * feuille sur mobile. Clic extérieur referme sur desktop ; pas de blocage du flux page.
 */
export default function ManagementCopilot({
  documents = [],
  activeTab = 'documents',
  onNavigateTab,
}) {
  const panelId = useId();
  const inputId = `${panelId}-input`;
  const panelRef = useRef(null);
  const fabRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const {
    bundle,
    open,
    toggle,
    close,
    input,
    setInput,
    messages,
    loading,
    error,
    interactionState,
    handleSubmit,
    handleQuickPick,
  } = useCopilot({ documents, activeTab, onNavigateTab });

  useCloseOnOutsidePress(open, close, panelRef, fabRef);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 280);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const handleFabClick = () => {
    if (!open) {
      toggle();
      return;
    }
    inputRef.current?.focus();
  };

  return (
    <>
      <button
        type="button"
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-[128] md:hidden',
          'bg-primary-dark/45 dark:bg-black/50 backdrop-blur-[2px] motion-safe:transition-opacity motion-safe:duration-300 motion-safe:ease-out',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        tabIndex={-1}
        onClick={close}
      />

      <aside
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label="Copilote de gestion"
        className={cn(
          'fixed z-[129] flex max-w-[100vw] flex-col overflow-hidden',
          'border-l border-border/80 bg-card/95 backdrop-blur-xl shadow-[-12px_0_40px_rgba(15,23,42,0.12)]',
          'dark:border-copper/15 dark:bg-[#12121a]/92 dark:shadow-[-16px_0_48px_rgba(0,0,0,0.45),0_0_0_1px_rgba(212,175,55,0.06)]',
          'motion-safe:transition-[opacity,transform] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]',
          'motion-reduce:transition-none',
          'max-md:inset-x-0 max-md:bottom-0 max-md:mx-0 max-md:max-h-[min(92dvh,880px)] max-md:rounded-t-[1.75rem] max-md:border-x-0 max-md:border-t max-md:border-border/80 max-md:border-b-0 max-md:shadow-[0_-20px_56px_rgba(15,23,42,0.14)] dark:max-md:shadow-[0_-24px_60px_rgba(0,0,0,0.5)]',
          'max-md:translate-y-[104%] max-md:opacity-100 max-md:pointer-events-none',
          open && 'max-md:translate-y-0 max-md:pointer-events-auto',
          'md:left-auto md:right-6 md:top-auto md:h-auto md:max-h-[min(65dvh,560px)] md:w-full md:max-w-[340px] md:rounded-2xl md:border md:shadow-[0_28px_64px_-20px_rgba(15,23,42,0.2),0_0_0_1px_rgba(201,162,39,0.08)] dark:md:shadow-[0_28px_72px_-24px_rgba(0,0,0,0.55),0_0_0_1px_rgba(201,162,39,0.1)]',
          'md:bottom-[calc(2.75rem+1.5rem+1rem+env(safe-area-inset-bottom,0px))]',
          'md:translate-y-5 md:scale-[0.97] md:opacity-0 md:pointer-events-none md:origin-bottom-right',
          open && 'md:translate-y-0 md:scale-100 md:opacity-100 md:pointer-events-auto',
        )}
      >
        <div
          className="pointer-events-none h-0.5 w-full shrink-0 bg-gradient-to-r from-copper/80 via-gold-light/70 to-gold-dark/80 opacity-90 dark:opacity-80"
          aria-hidden
        />
        <CopilotContainer
          inputId={inputId}
          listRef={listRef}
          inputRef={inputRef}
          messages={messages}
          loading={loading}
          interactionState={interactionState}
          emptyHint={COPILOT_EMPTY_HINT}
          navigation={bundle.navigation}
          suggestions={bundle.suggestions}
          actions={bundle.actions}
          input={input}
          setInput={setInput}
          error={error}
          onClose={close}
          onSubmit={handleSubmit}
          onQuickPick={handleQuickPick}
        />
      </aside>

      {createPortal(
        <button
          ref={fabRef}
          type="button"
          onClick={handleFabClick}
          aria-expanded={open}
          aria-controls={panelId}
          className={cn(
            'copilot-fab-launcher fixed z-[180] flex h-11 w-11 origin-center items-center justify-center rounded-xl motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-copper/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-bg-main,#0c1520)] dark:focus-visible:ring-offset-[#0a0a14]',
            open
              ? 'border border-border/80 bg-surface-alt text-copper shadow-lg dark:border-copper/30 dark:bg-[#1e1e28] dark:text-copper-light backdrop-blur-sm'
              : 'copilot-fab-pulse border border-white/20 bg-gradient-to-br from-copper via-gold-dark to-gold-light text-white hover:scale-[1.03] active:scale-[0.98]',
          )}
          aria-label={open ? 'Focus sur le copilote' : 'Ouvrir le copilote'}
        >
          {open ? (
            <X className="h-[18px] w-[18px]" strokeWidth={2.25} />
          ) : (
            <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.25} />
          )}
        </button>,
        document.body,
      )}
    </>
  );
}
