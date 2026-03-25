/**
 * Actions utilitaires (prompts génériques / compléments).
 * Style plus discret que les suggestions contextuelles.
 * @param {{
 *   items: Array<{ id: string, label: string }>,
 *   loading: boolean,
 *   onPick: (action: { id: string }) => void,
 *   maxVisible?: number,
 * }} props
 */
export function CopilotActions({ items, loading, onPick, maxVisible = 4 }) {
  if (items.length === 0) return null;

  const visible = items.slice(0, maxVisible);

  return (
    <div className="mb-2 flex flex-wrap gap-1.5" data-copilot-section="actions">
      {visible.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled={loading}
          onClick={() => onPick(action)}
          className="copilot-chip copilot-chip-subtle"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
