import { Sparkles, X } from 'lucide-react';

/**
 * En-tête du panneau copilote (titre + fermeture).
 * @param {{ onClose: () => void }} props
 */
export function CopilotHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <div className="copilot-icon-glow flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-copper/20 to-gold-dark/15">
          <Sparkles className="h-3.5 w-3.5 text-copper dark:text-copper-light" strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <h2 className="text-[13px] font-bold leading-none tracking-tight text-primary">Copilote</h2>
          <p className="mt-0.5 text-[9px] leading-none text-text-muted">Assistant C.E.A</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-muted/70 transition-all hover:bg-surface-alt hover:text-text dark:hover:bg-white/[0.06]"
        aria-label="Fermer"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}
