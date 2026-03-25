import { Loader2, Send, AlertCircle } from 'lucide-react';
import { COPILOT_PLACEHOLDER } from '../../copilot/copilotCopy';
import { cn } from '../../utils/cn';

/**
 * Pied du panneau : saisie + envoi — style premium avec micro-interactions.
 * @param {{
 *   inputId: string,
 *   inputRef: React.RefObject<HTMLInputElement | null>,
 *   input: string,
 *   setInput: (value: string) => void,
 *   loading: boolean,
 *   onSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
 *   placeholder?: string,
 *   errorText?: string | null,
 * }} props
 */
export function CopilotFooter({
  inputId,
  inputRef,
  input,
  setInput,
  loading,
  onSubmit,
  placeholder = COPILOT_PLACEHOLDER,
  errorText,
}) {
  const hasText = input.trim().length > 0;

  return (
    <div className="space-y-1.5">
      {errorText ? (
        <div className="flex items-center gap-1.5 rounded-lg border border-red-200/60 bg-red-50/50 px-2.5 py-1.5 dark:border-red-500/20 dark:bg-red-950/20" role="alert">
          <AlertCircle className="h-3 w-3 shrink-0 text-red-500/80 dark:text-red-400/80" />
          <p className="text-[11px] leading-snug text-red-600/90 dark:text-red-400/90">
            {errorText}
          </p>
        </div>
      ) : null}
      <form onSubmit={onSubmit} className="copilot-input-wrap">
        <label htmlFor={inputId} className="sr-only">
          Message au copilote
        </label>
        <input
          ref={inputRef}
          id={inputId}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder={placeholder}
          className="copilot-input"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !hasText}
          className={cn(
            'copilot-send-btn',
            hasText && !loading && 'copilot-send-btn-active',
          )}
          aria-label="Envoyer"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" strokeWidth={2.5} />
          )}
        </button>
      </form>
    </div>
  );
}
