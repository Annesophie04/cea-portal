import { Sparkles, ArrowRight } from 'lucide-react';
import { COPILOT_INTRO_STATIC } from '../../copilot/copilotCopy';

/**
 * Bloc d'accueil premium — icône, texte et indicateur visuel.
 */
export function CopilotIntro() {
  return (
    <div className="copilot-intro flex items-start gap-2.5 rounded-xl border border-copper/10 bg-gradient-to-br from-copper/[0.04] to-transparent px-3 py-2.5 dark:border-copper/[0.08] dark:from-copper/[0.03]">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-copper/10 dark:bg-copper/[0.08]">
        <Sparkles className="h-3 w-3 text-copper dark:text-copper-light" strokeWidth={2.25} />
      </div>
      <div className="min-w-0 space-y-1">
        <p className="text-[11.5px] leading-snug text-text-muted">
          {COPILOT_INTRO_STATIC}
        </p>
        <p className="flex items-center gap-1 text-[10px] font-medium text-copper/70 dark:text-copper-light/60">
          <ArrowRight className="h-2.5 w-2.5" />
          Suggestions adaptées à votre onglet
        </p>
      </div>
    </div>
  );
}
