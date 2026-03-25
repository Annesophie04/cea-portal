import { ArrowRight } from 'lucide-react';

/**
 * Raccourcis vers d'autres onglets du portail.
 * @param {{
 *   items: Array<{ id: string, label: string }>,
 *   loading: boolean,
 *   onPick: (action: { id: string }) => void,
 *   maxVisible?: number,
 * }} props
 */
export function CopilotNavigation({ items, loading, onPick, maxVisible = 3 }) {
  if (items.length === 0) return null;

  const visible = items.slice(0, maxVisible);

  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      {visible.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled={loading}
          onClick={() => onPick(action)}
          className="copilot-chip-nav"
        >
          <ArrowRight className="h-3 w-3 shrink-0 opacity-60" />
          {action.label}
        </button>
      ))}
    </div>
  );
}
