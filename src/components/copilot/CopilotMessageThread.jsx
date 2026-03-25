import { formatAssistantMessage } from './formatAssistantMessage';
import { cn } from '../../utils/cn';
import { COPILOT_EMPTY_HINT } from '../../copilot/copilotCopy';
import { CopilotIntro } from './CopilotIntro';
import { CopilotTypingIndicator } from './CopilotTypingIndicator';

/**
 * Zone scrollable : fil de messages + intro + indicateur de frappe.
 * @param {{
 *   listRef: React.RefObject<HTMLDivElement | null>,
 *   messages: Array<{ id: string, role: 'user' | 'assistant', content: string }>,
 *   loading: boolean,
 *   interactionState?: import('../../copilot/types.js').CopilotInteractionState,
 *   emptyHint?: string,
 * }} props
 */
export function CopilotMessageThread({
  listRef,
  messages,
  loading,
  interactionState = 'idle',
  emptyHint = COPILOT_EMPTY_HINT,
}) {
  return (
    <div
      ref={listRef}
      className="copilot-messages scrollbar-thin flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain px-3.5 py-3"
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            'copilot-msg',
            msg.role === 'user' && 'copilot-msg-user',
            msg.role === 'assistant' && msg.id !== 'welcome' && 'copilot-msg-assistant',
          )}
        >
          {msg.role === 'user' ? (
            <p className="text-[13px] font-medium leading-snug text-text">{msg.content}</p>
          ) : msg.id === 'welcome' ? (
            <div className="space-y-2">
              <div className="copilot-response space-y-1.5 text-[13px] leading-relaxed text-text/90 dark:text-text/85">
                {formatAssistantMessage(msg.content)}
              </div>
              <CopilotIntro />
              {interactionState === 'empty' ? (
                <p className="text-[10px] leading-snug text-text-muted/85">{emptyHint}</p>
              ) : null}
            </div>
          ) : (
            <div className="copilot-response space-y-1.5 text-[13px] leading-relaxed text-text/90 dark:text-text/85">
              {formatAssistantMessage(msg.content)}
            </div>
          )}
        </div>
      ))}

      {loading && <CopilotTypingIndicator />}
    </div>
  );
}
