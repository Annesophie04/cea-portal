import { QUICK_PORTAL_ACTIONS } from '../config/quickActions';

/**
 * Moteur de suggestions intelligent du copilote.
 *
 * Trois familles :
 *   navigation  — raccourcis vers d'autres onglets
 *   suggestions — prompts contextuels (règles document + onglet)
 *   actions     — utilitaires génériques (fallback)
 *
 * Extensible : ajouter un objet dans CONTEXTUAL_RULES suffit.
 *
 * @param {import('./types.js').ContextData} context
 * @returns {import('./types.js').CopilotSuggestionsBundle}
 */

/* ── helpers ─────────────────────────────────────────────────────── */

function titleHas(docs, re) {
  return docs.some((d) => re.test(d.title ?? ''));
}

function countDistinct(docs, key) {
  return new Set(docs.map((d) => d[key]).filter(Boolean)).size;
}

function normalize(docs) {
  if (!Array.isArray(docs)) return [];
  return docs.map((d) => ({
    title: (d?.title ?? '').trim() || 'Sans titre',
    type: (d?.type ?? '').trim() || '—',
    status: (d?.status ?? '').trim() || '—',
    category: (d?.category ?? '').trim() || '—',
  }));
}

/* ── règles contextuelles (priorité décroissante) ────────────────── */

const CONTEXTUAL_RULES = [
  {
    id: 'ctx-empty',
    priority: 100,
    test: ({ docs }) => docs.length === 0,
    label: 'Aucun document visible',
    prompt: 'Ma vue Documents est vide — comment retrouver mes fiches ou en ajouter ?',
  },
  {
    id: 'ctx-missing-statuts',
    priority: 98,
    test: ({ docs }) =>
      docs.length > 0 &&
      !titleHas(docs, /\bstatuts?\b/i) &&
      !titleHas(docs, /\bregistre\b/i) &&
      !titleHas(docs, /\bconvention\b/i),
    label: 'Commencer par les statuts',
    prompt: 'Aucune pièce clé (statuts, registre, convention) repérée. Par quoi commencer ?',
  },
  {
    id: 'ctx-registre',
    priority: 96,
    test: ({ docs }) =>
      titleHas(docs, /\bstatuts?\b/i) && !titleHas(docs, /\bregistre\b/i),
    label: 'Ajouter le registre',
    prompt: "J'ai les statuts mais pas de registre. Comment le créer ?",
  },
  {
    id: 'ctx-revision',
    priority: 92,
    test: ({ docs }) => docs.some((d) => /révision/i.test(d.status)),
    label: 'Fiches en révision',
    prompt: 'Certaines fiches sont en révision — que vérifier en priorité ?',
  },
  {
    id: 'ctx-assemble',
    priority: 88,
    test: ({ docs }) => docs.length >= 3,
    label: 'Assembler un dossier',
    prompt: 'Comment assembler mes documents en un dossier cohérent ?',
  },
  {
    id: 'ctx-organize',
    priority: 72,
    test: ({ docs }) => docs.length >= 5 && countDistinct(docs, 'category') >= 2,
    label: 'Structurer la bibliothèque',
    prompt: 'Beaucoup de fiches et catégories — comment garder une nomenclature claire ?',
  },
  /* ── onglet-spécifique ─── */
  {
    id: 'ctx-tab-associations',
    priority: 78,
    test: ({ tab }) => tab === 'associations',
    label: 'Conventions partenaires',
    prompt: 'Quelles vérifications faire sur les conventions et partenaires ?',
  },
  {
    id: 'ctx-tab-codes',
    priority: 76,
    test: ({ tab }) => tab === 'codes',
    label: 'Référentiel juridique',
    prompt: 'Comment croiser codes et documents internes ?',
  },
  {
    id: 'ctx-tab-memo',
    priority: 74,
    test: ({ tab }) => tab === 'memo',
    label: 'Aligner avec le mémo',
    prompt: 'Comment les documents importants se lient à la bibliothèque ?',
  },
  {
    id: 'ctx-tab-comptabilite',
    priority: 74,
    test: ({ tab }) => tab === 'comptabilite',
    label: 'Suivi comptable',
    prompt: 'Comment optimiser le suivi comptable du C.E.A ?',
  },
  {
    id: 'ctx-tab-evenements',
    priority: 74,
    test: ({ tab }) => tab === 'evenements',
    label: 'Planifier un événement',
    prompt: 'Quelles étapes pour organiser un événement avec le C.E.A ?',
  },
  {
    id: 'ctx-tab-stockage',
    priority: 73,
    test: ({ tab }) => tab === 'stockage',
    label: 'Gérer le stockage',
    prompt: "Comment organiser l'inventaire et le suivi des stocks ?",
  },
  {
    id: 'ctx-tab-location',
    priority: 73,
    test: ({ tab }) => tab === 'location',
    label: 'Suivre les locations',
    prompt: 'Comment gérer les locations de biens et le calendrier ?',
  },
  {
    id: 'ctx-tab-procedures',
    priority: 73,
    test: ({ tab }) => tab === 'procedures',
    label: 'Procédures internes',
    prompt: 'Comment améliorer et mettre à jour les procédures du C.E.A ?',
  },
  {
    id: 'ctx-tab-idees',
    priority: 72,
    test: ({ tab }) => tab === 'idees',
    label: 'Gérer les idées',
    prompt: 'Comment prioriser et suivre les idées proposées ?',
  },
  {
    id: 'ctx-tab-videos',
    priority: 72,
    test: ({ tab }) => tab === 'videos',
    label: 'Organiser les vidéos',
    prompt: 'Comment structurer la bibliothèque vidéo du portail ?',
  },
  {
    id: 'ctx-tab-affiches',
    priority: 72,
    test: ({ tab }) => tab === 'affiches',
    label: 'Gérer les affiches',
    prompt: 'Comment organiser les affiches et supports visuels ?',
  },
];

/** Actions génériques (fallback). */
const GENERIC_ACTIONS = [
  {
    id: 'verify-docs',
    label: 'Vérifier les documents',
    prompt: "Analyse l'état de mes documents : liens, types et statuts.",
  },
  {
    id: 'suggest-improvements',
    label: 'Améliorer le classement',
    prompt: 'Quelles améliorations pour mieux organiser le portail ?',
  },
  {
    id: 'create-association',
    label: 'Créer une association',
    prompt: 'Je veux créer une association partenaire : quelles étapes ?',
  },
];

/* ── limites ──────────────────────────────────────────────────────── */

const MAX_NAV = 2;
const MAX_SUGGESTIONS = 4;
const MAX_ACTIONS = 2;

/* ── main ─────────────────────────────────────────────────────────── */

export function generateSuggestions(context) {
  const { activeTab = 'documents', documents = [], pageType = 'portal' } = context;
  void pageType;
  const docs = normalize(documents);
  const ctx = { tab: activeTab, docs };

  /* 1. Navigation — onglets pertinents (exclure l'onglet courant) */
  const navigation = QUICK_PORTAL_ACTIONS
    .filter((a) => a.tabKey !== activeTab)
    .slice(0, MAX_NAV)
    .map((a) => ({ id: `nav-${a.id}`, label: a.label, tabKey: a.tabKey }));

  /* 2. Suggestions contextuelles — règles dont le test passe */
  const suggestions = CONTEXTUAL_RULES
    .filter((rule) => rule.test(ctx))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, MAX_SUGGESTIONS)
    .map((rule) => ({
      id: rule.id,
      label: rule.label,
      prompt: rule.prompt,
      contextual: true,
    }));

  /* 3. Actions génériques — compléter si peu de contextuelles */
  const usedIds = new Set(suggestions.map((s) => s.id));
  const actions = GENERIC_ACTIONS
    .filter((a) => !usedIds.has(a.id))
    .slice(0, MAX_ACTIONS)
    .map((a) => ({ id: a.id, label: a.label, prompt: a.prompt, contextual: false }));

  return { navigation, suggestions, actions };
}
