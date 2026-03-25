/**
 * Indicateur de chargement (points animés).
 */
export function CopilotTypingIndicator() {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="copilot-typing" aria-hidden>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
