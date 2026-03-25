import { CopilotHeader } from './CopilotHeader';
import { CopilotMessageThread } from './CopilotMessageThread';
import { CopilotNavigation } from './CopilotNavigation';
import { CopilotSuggestions } from './CopilotSuggestions';
import { CopilotActions } from './CopilotActions';
import { CopilotFooter } from './CopilotFooter';

/**
 * Composition du panneau copilote (sans changer le layout global).
 * @param {{
 *   inputId: string,
 *   listRef: React.RefObject<HTMLDivElement | null>,
 *   inputRef: React.RefObject<HTMLInputElement | null>,
 *   messages: Array<{ id: string, role: 'user' | 'assistant', content: string }>,
 *   loading: boolean,
 *   interactionState: import('../../copilot/types.js').CopilotInteractionState,
 *   emptyHint?: string,
 *   navigation: Array<{ id: string, label: string, tabKey?: string | null }>,
 *   suggestions: Array<{ id: string, label: string, prompt?: string }>,
 *   actions: Array<{ id: string, label: string, prompt?: string }>,
 *   input: string,
 *   setInput: (value: string) => void,
 *   error?: string | null,
 *   onClose: () => void,
 *   onSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
 *   onQuickPick: (item: { id: string }) => void,
 * }} props
 */
export function CopilotContainer({
  inputId,
  listRef,
  inputRef,
  messages,
  loading,
  interactionState,
  emptyHint,
  navigation,
  suggestions,
  actions,
  input,
  setInput,
  error,
  onClose,
  onSubmit,
  onQuickPick,
}) {
  return (
    <div className="flex h-full flex-col" data-copilot-state={interactionState}>
      <CopilotHeader onClose={onClose} />

      <div className="mx-3 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent dark:via-white/[0.06]" />

      <CopilotMessageThread
        listRef={listRef}
        messages={messages}
        loading={loading}
        interactionState={interactionState}
        emptyHint={emptyHint}
      />

      <div className="shrink-0 px-3.5 pb-2">
        <CopilotNavigation items={navigation} loading={loading} onPick={onQuickPick} />
        <CopilotSuggestions items={suggestions} loading={loading} onPick={onQuickPick} />
        <CopilotActions items={actions} loading={loading} onPick={onQuickPick} />
        {interactionState === 'success' && (
          <p className="mb-1.5 text-center text-[10px] text-text-muted/80" role="status" aria-live="polite">
            Réponse prête
          </p>
        )}
        <CopilotFooter
          inputId={inputId}
          inputRef={inputRef}
          input={input}
          setInput={setInput}
          loading={loading}
          onSubmit={onSubmit}
          errorText={error}
        />
      </div>
    </div>
  );
}
