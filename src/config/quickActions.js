import { Users, FolderKanban, ShieldCheck, BookOpen, Scale } from 'lucide-react';

/**
 * Raccourcis " Actions rapides " : icône + libellé court + onglet cible.
 */
export const QUICK_PORTAL_ACTIONS = [
  { id: 'assoc', tabKey: 'associations', label: 'Associations', icon: Users },
  { id: 'dossier', tabKey: 'documents', label: 'Dossier', icon: FolderKanban },
  { id: 'conformite', tabKey: 'documents', label: 'Conformité', icon: ShieldCheck },
  { id: 'procedures', tabKey: 'procedures', label: 'Procédures', icon: BookOpen },
  { id: 'codes', tabKey: 'codes', label: 'Codes', icon: Scale },
];

const NAV_COPILOT_MAX = 2;

/**
 * Raccourcis de navigation pour le copilote (évite l'onglet déjà ouvert).
 * @param {string} activeTab
 * @param {{ max?: number }} [opts]
 * @returns {Array<{ id: string, label: string, tabKey: string }>}
 */
export function getPortalNavCopilotSuggestions(activeTab, opts = {}) {
  const max = opts.max ?? NAV_COPILOT_MAX;
  return QUICK_PORTAL_ACTIONS.filter((a) => a.tabKey !== activeTab)
    .slice(0, max)
    .map((a) => ({
      id: `nav-${a.id}`,
      label: a.label,
      tabKey: a.tabKey,
    }));
}
