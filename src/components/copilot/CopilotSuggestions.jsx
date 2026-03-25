import { Zap } from 'lucide-react';

/**
 * Suggestions contextuelles (prompts intelligents selon onglet/documents).
 * @param {{
 *   items: Array<{ id: string, label: string, contextual?: boolean }>,
 *   loading: boolean,
 *   onPick: (action: { id: string }) => void,
 *   maxVisible?: number,
 * }} props
 */
export function CopilotSuggestions({ items, loading, onPick, maxVisible = 4 }) {
  if (items.length === 0) return null;

  const visible = items.slice(0, maxVisible);

  return (
    <div className="mb-2.5" data-copilot-section="suggestions">
      <p className="mb-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-text-muted/60">
        <Zap className="h-2.5 w-2.5" />
        Suggestions
      </p>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={loading}
            onClick={() => onPick(action)}
            className="copilot-chip"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
