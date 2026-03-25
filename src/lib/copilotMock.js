/**
 * Réponses simulées du copilote de gestion (mock — pas d'appel API).
 * Le contexte documentaire reflète les cartes visibles (liste filtrée de l'onglet Documents).
 */

const TYPING_DELAY_MS = 520;

/**
 * @param {Array<{ id?: string, title?: string, type?: string, status?: string, category?: string }>} raw
 * @returns {Array<{ id: string, title: string, type: string, status: string, category: string }>}
 */
export function normalizeDocumentsForCopilot(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((d, i) => ({
    id: d?.id != null ? String(d.id) : `doc-${i}`,
    title: (d?.title ?? '').trim() || 'Sans titre',
    type: (d?.type ?? '').trim() || '—',
    status: (d?.status ?? '').trim() || '—',
    category: (d?.category ?? '').trim() || '—',
  }));
}

function formatDocumentsBulletList(snapshot) {
  if (!snapshot.length) {
    return `Aucun document ne correspond aux filtres actuels — élargis la recherche ou les filtres dans l'onglet Documents.`;
  }
  return snapshot
    .map((d, i) => {
      const cat = d.category && d.category !== '—' ? ` · ${d.category}` : '';
      return `${i + 1}. **${d.title}** — type : ${d.type} — statut : ${d.status}${cat}`;
    })
    .join('\n');
}

/** Compte les occurrences par valeur de champ. */
function countBy(items, getKey) {
  const m = new Map();
  for (const it of items) {
    const k = getKey(it) || '—';
    m.set(k, (m.get(k) || 0) + 1);
  }
  return m;
}

/**
 * Repères " dossier association " dérivés des titres (vue courante).
 */
function associationMarkersFromSnapshot(snapshot) {
  const titleHas = (re) => snapshot.some((d) => re.test(d.title));
  return {
    statuts: titleHas(/\bstatuts?\b/i),
    registre: titleHas(/\bregistre\b/i),
    convention: titleHas(/\bconvention\b/i),
    contratAssociation: snapshot.some(
      (d) => /\bcontrat\b/i.test(d.title) && /association/i.test(d.title),
    ),
    pvAg: titleHas(/\b(pv|procès-verbal|assemblee|assemblée)\b/i),
  };
}

/**
 * Réponse structurée : vérification documents (présent / manquant / synthèse).
 */
function buildVerifyDocumentsStructured(snapshot, documentsCount) {
  if (documentsCount === 0) {
    return [
      '**Vérification de ta sélection**',
      '',
      '**Ce qui est déjà présent**',
      '',
      '• **Aucune fiche** dans cette vue filtrée.',
      '',
      '**Ce qui manque pour une analyse utile**',
      '',
      '• Au moins **une carte documentaire** : assouplis catégorie / type / statut / recherche, ou ajoute une entrée dans **Documents**.',
    ].join('\n');
  }

  const byStatus = countBy(snapshot, (d) => d.status);
  const byType = countBy(snapshot, (d) => d.type);
  const markers = associationMarkersFromSnapshot(snapshot);
  const inRevision = snapshot.filter((d) => /révision/i.test(d.status || ''));
  const actifs = snapshot.filter((d) => /^actif$/i.test((d.status || '').trim()));

  const presenceLines = snapshot.map((d) => {
    const cat = d.category && d.category !== '—' ? ` · ${d.category}` : '';
    return `• **${d.title}** — ${d.type} · ${d.status}${cat}`;
  });

  const synthStatusLines = [...byStatus.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `• **${k}** : ${v} fiche(s)`);

  const synthTypeLines = [...byType.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `• **${k}** : ${v} fiche(s)`);

  const missing = [];
  if (!markers.statuts) missing.push('• **Statuts** : aucun titre ne contient " statuts " — prévoir une fiche dédiée si besoin légal.');
  if (!markers.registre) missing.push('• **Registre** : aucun titre ne contient " registre " — utile pour les membres / délibérations.');
  if (!markers.convention && !markers.contratAssociation) {
    missing.push(`• **Convention ou contrat d'association** : repère faible dans les titres — à ajouter si le partenariat est formalisé.`);
  }
  if (inRevision.length > 0) {
    missing.push(
      `• **${inRevision.length} fiche(s) en révision** : finaliser ou archiver : ${inRevision.map((d) => `**${d.title}**`).join(', ')}`,
    );
  }
  if (missing.length === 0) {
    missing.push('• Les **repères usuels** (statuts, registre, convention/contrat) sont couverts dans les titres — garde les liens à jour.');
  }

  return [
    '**Vérification de ta sélection**',
    '',
    `**Ce qui est déjà présent** (${documentsCount} fiche(s) dans cette vue)`,
    '',
    ...presenceLines,
    '',
    '**Synthèse rapide**',
    '',
    '**Par statut**',
    '',
    ...synthStatusLines,
    '',
    '**Par type**',
    '',
    ...synthTypeLines,
    '',
    `**À compléter ou à surveiller** (${actifs.length} fiche(s) **Actif** dans la vue)`,
    '',
    ...missing,
  ].join('\n');
}

/**
 * Réponse structurée : création association (analyse + étapes restantes).
 */
function buildCreateAssociationStructured(snapshot, documentsCount) {
  const markers = associationMarkersFromSnapshot(snapshot);

  const analyseLines =
    documentsCount === 0
      ? ['• **Aucune fiche** dans cette vue filtrée — élargis les filtres pour voir la bibliothèque ou ajoute des documents.']
      : snapshot.map((d) => {
          const cat = d.category && d.category !== '—' ? ` · ${d.category}` : '';
          return `• **${d.title}** — ${d.type} · ${d.status}${cat}`;
        });

  const repères = [];
  repères.push(
    markers.statuts
      ? '• **Statuts** : repéré dans au moins un titre.'
      : '• **Statuts** : **non repéré** dans les titres de la vue.',
  );
  repères.push(
    markers.registre
      ? '• **Registre** : repéré dans au moins un titre.'
      : '• **Registre** : **non repéré** dans les titres de la vue.',
  );
  repères.push(
    markers.convention || markers.contratAssociation
      ? `• **Convention / contrat d'association** : repéré dans au moins un titre.`
      : '• **Convention / contrat** : **non repéré** (ou partiel) dans les titres de la vue.',
  );

  const fullyCovered =
    markers.statuts &&
    markers.registre &&
    (markers.convention || markers.contratAssociation);

  /** @type {string[]} */
  let etapes = [];
  if (documentsCount === 0) {
    etapes = [
      '• Assouplir les **filtres** ou **importer** des fiches pour analyser une base non vide.',
    ];
  } else if (fullyCovered) {
    etapes = [
      '• **Contrôler** chaque fiche **Actif** : liens, contacts, cohérence des titres.',
      '• **Onglet Associations** : aligner la fiche partenaire avec les documents listés ci-dessus.',
      `• **Archiver** les versions remplacées et exporter la liste JSON depuis l'en-tête si besoin.`,
    ];
  } else {
    if (!markers.statuts) {
      etapes.push(
        `• **Statuts** : ajouter une fiche (ex. "Statuts de l'association"), type **Modèle** ou **Officiel**, catégorie **Associations**.`,
      );
    }
    if (!markers.registre) {
      etapes.push(
        '• **Registre** : créer une fiche " Registre des membres " ou équivalent une fois les statuts posés.',
      );
    }
    if (!markers.convention && !markers.contratAssociation) {
      etapes.push(
        '• **Convention / contrat** : ajouter la pièce juridique liée au C.E.A ou aux partenaires.',
      );
    }
    etapes.push(
      '• **Associations** : renseigner la fiche partenaire (contacts, dates) en renvoyant aux titres ci-dessus.',
    );
    etapes.push(
      `• **Export** : sauvegarder la liste via l'export JSON de l'en-tête après stabilisation.`,
    );
  }

  const etapesTitle = fullyCovered && documentsCount > 0 ? '**Étapes restantes (affinage)**' : '**Étapes restantes (priorisées)**';

  return [
    '**Créer une association partenaire**',
    '',
    '**Inventaire des documents de ta vue actuelle**',
    '',
    ...analyseLines,
    '',
    '**Repères détectés dans les titres**',
    '',
    ...repères,
    '',
    etapesTitle,
    '',
    ...etapes,
  ].join('\n');
}

/** Pièce " clé " pour la gouvernance association / dossier type (détection simple sur le titre). */
function isKeyGovernanceDocument(d) {
  const t = (d.title || '').toLowerCase();
  if (/\bstatuts?\b/.test(t)) return true;
  if (/\bregistre\b/.test(t)) return true;
  if (/\bconvention\b/.test(t)) return true;
  if (/\bcontrat\b/.test(t) && /association/.test(t)) return true;
  if (/règlement\s+intérieur/.test(t)) return true;
  return false;
}

const MIN_SUGGESTIONS = 3;
const MAX_SUGGESTIONS = 5;

/** Suggestions de secours (priorité croissante = servies en dernier pour compléter). */
const FALLBACK_SUGGESTIONS = [
  {
    id: 'verify-docs',
    priority: 50,
    label: 'Vérifier les liens et les statuts',
    prompt: `Analyse l'état de mes documents visibles : liens, cohérence des types et des statuts.`,
  },
  {
    id: 'suggest-improvements',
    priority: 45,
    label: 'Améliorer le classement du portail',
    prompt: 'Quelles améliorations concrètes pour mieux organiser les documents et les onglets ?',
  },
  {
    id: 'create-association',
    priority: 42,
    label: 'Créer une association partenaire',
    prompt: 'Je souhaite créer une nouvelle association partenaire : quelles étapes et quelles pièces ?',
  },
];

/**
 * Suggestions 100 % dynamiques (contexte documents + onglet actif), 3 à 5 max.
 * @param {Array<{ title?: string, type?: string, status?: string, category?: string }>} rawDocs
 * @param {string} [activeTab='documents']
 * @returns {Array<{ id: string, label: string, prompt: string, contextual?: boolean }>}
 */
export function getCopilotQuickSuggestions(rawDocs, activeTab = 'documents') {
  const snapshot = normalizeDocumentsForCopilot(rawDocs);
  const n = snapshot.length;
  const hasStatuts = snapshot.some((d) => /\bstatuts?\b/i.test(d.title));
  const hasRegistre = snapshot.some((d) => /\bregistre\b/i.test(d.title));
  const anyKey = snapshot.some(isKeyGovernanceDocument);
  const hasRevision = snapshot.some((d) => /\bEn révision\b/i.test(d.status || ''));
  const hasCategories = new Set(snapshot.map((d) => d.category).filter(Boolean)).size;

  /** @type {Array<{ id: string, label: string, prompt: string, priority: number, contextual?: boolean }>} */
  const candidates = [];

  if (n === 0) {
    candidates.push({
      id: 'ctx-empty-selection',
      priority: 100,
      contextual: true,
      label: 'Aucun document dans cette vue',
      prompt:
        'Ma vue Documents filtrée est vide. Comment retrouver des fiches ou ajouter un document sans perdre le fil ?',
    });
  } else {
    if (!anyKey) {
      candidates.push({
        id: 'ctx-key-statuts',
        priority: 98,
        contextual: true,
        label: 'Commencer par les statuts',
        prompt:
          `Je n'ai pas de pièce clé (statuts, registre, convention…) dans ma sélection. Par quoi commencer pour les statuts d'association ?`,
      });
    }
    if (hasStatuts && !hasRegistre) {
      candidates.push({
        id: 'ctx-registre',
        priority: 96,
        contextual: true,
        label: 'Ajouter le registre des membres',
        prompt:
          `J'ai les statuts mais pas de registre dans ma liste. Comment créer et structurer le registre de l'association ?`,
      });
    }
    if (n >= 2) {
      candidates.push({
        id: 'ctx-assemble-folder',
        priority: 90,
        contextual: true,
        label: 'Assembler un dossier complet',
        prompt:
          `J'ai plusieurs documents dans ma sélection. Comment les ordonner en un dossier cohérent pour un dépôt ou une transmission ?`,
      });
    }
    if (hasRevision) {
      candidates.push({
        id: 'ctx-revision',
        priority: 86,
        contextual: true,
        label: 'Relancer les fiches en révision',
        prompt:
          'Certaines fiches sont en " En révision ". Que vérifier en priorité pour les finaliser ?',
      });
    }
    if (n >= 4 && hasCategories >= 2) {
      candidates.push({
        id: 'ctx-organize-library',
        priority: 72,
        contextual: true,
        label: 'Structurer une bibliothèque fournie',
        prompt:
          `J'ai beaucoup de documents répartis dans plusieurs catégories. Comment garder une nomenclature claire ?`,
      });
    }
  }

  if (activeTab === 'associations') {
    candidates.push({
      id: 'ctx-tab-associations',
      priority: 78,
      contextual: true,
      label: 'Suivre une convention partenaire',
      prompt:
        `Je suis sur l'onglet Associations : quelles vérifications faire sur les conventions et partenaires ?`,
    });
  }
  if (activeTab === 'codes') {
    candidates.push({
      id: 'ctx-tab-codes',
      priority: 75,
      contextual: true,
      label: `S'appuyer sur le référentiel juridique`,
      prompt:
        'Je consulte le référentiel juridique : comment croiser codes et documents internes ?',
    });
  }
  if (activeTab === 'memo') {
    candidates.push({
      id: 'ctx-tab-memo',
      priority: 74,
      contextual: true,
      label: 'Aligner avec le mémo',
      prompt:
        'Je suis sur le mémo : comment les documents importants listés ici se lient à la bibliothèque Documents ?',
    });
  }

  candidates.sort((a, b) => b.priority - a.priority);

  const seen = new Set();
  const picked = [];
  for (const c of candidates) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    picked.push(c);
    if (picked.length >= MAX_SUGGESTIONS) break;
  }

  for (const f of FALLBACK_SUGGESTIONS) {
    if (picked.length >= MAX_SUGGESTIONS) break;
    if (seen.has(f.id)) continue;
    seen.add(f.id);
    picked.push({ ...f, contextual: false });
  }

  picked.sort((a, b) => b.priority - a.priority);

  while (picked.length < MIN_SUGGESTIONS) {
    const next = FALLBACK_SUGGESTIONS.find((f) => !seen.has(f.id));
    if (!next) break;
    seen.add(next.id);
    picked.push({ ...next, contextual: false });
  }

  picked.sort((a, b) => b.priority - a.priority);

  return picked.slice(0, MAX_SUGGESTIONS).map((item) => ({
    id: item.id,
    label: item.label,
    prompt: item.prompt,
    ...(item.contextual !== undefined ? { contextual: item.contextual } : {}),
  }));
}

const TAB_LABELS = {
  documents: 'Documents',
  memo: 'Mémo',
  procedures: 'Procédures CEA',
  associations: 'Associations',
  evenements: 'Événements',
  videos: 'Vidéos',
  comptabilite: 'Comptabilité',
  idees: 'Idées',
  affiches: 'Affiches',
  stockage: 'Stockage',
  location: 'Location',
  codes: 'Référentiel juridique',
  guide: 'Aide',
};

function tabLabel(key) {
  return TAB_LABELS[key] || key;
}

function buildSuggestImprovementsStructured(snapshot, documentsCount, activeTab) {
  const byType = countBy(snapshot, (d) => d.type);
  const topTypes = [...byType.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const nCat = new Set(snapshot.map((d) => d.category).filter((c) => c && c !== '—')).size;

  const parts = [
    '**Améliorer le classement du portail**',
    '',
    '**Ce que montre ta sélection actuelle**',
    '',
    `• **${documentsCount}** fiche(s) dans la vue · **${nCat}** catégorie(s) distincte(s)`,
  ];
  if (documentsCount > 0) {
    parts.push('', '**Répartition par type (aperçu)**', '');
    topTypes.forEach(([k, v]) => parts.push(`• **${k}** : ${v}`));
  } else {
    parts.push('', '• **Aucune fiche** : élargis les filtres pour obtenir des statistiques exploitables.');
  }
  parts.push(
    '',
    '**Pistes concrètes**',
    '',
    `• Harmoniser les **titres** et les **tags** entre fiches d'une même famille.`,
    '• Faire un **export JSON** avant toute réorganisation ou import massif.',
    activeTab === 'documents'
      ? '• Tu es sur **Documents** : des **descriptions** complètes aident la recherche.'
      : `• Onglet **${tabLabel(activeTab)}** : garder les raccourcis alignés sur des fiches **Actives**.`,
  );
  return parts.join('\n');
}

function mockBySuggestionId(id, ctx) {
  const { documentsCount, documentsSnapshot, activeTab } = ctx;
  const listBlock = ['**Documents correspondant à ta vue actuelle (titres · type · statut)** :', formatDocumentsBulletList(documentsSnapshot)].join('\n\n');
  switch (id) {
    case 'create-association':
      return buildCreateAssociationStructured(documentsSnapshot, documentsCount);
    case 'ctx-empty-selection':
      return [
        'Ta **vue filtrée** ne renvoie aucune carte : soit les filtres (catégorie, type, statut, recherche) sont trop stricts, soit la base est vide.',
        '**À faire** : remets les filtres sur *Toutes* / *Tous*, efface la recherche, ou ajoute une fiche via *Ajouter un document*.',
      ].join('\n\n');
    case 'ctx-revision': {
      const inRevision = documentsSnapshot.filter((d) => /révision/i.test(d.status || ''));
      return [
        '**Fiches en révision (données de ta vue)**',
        '',
        inRevision.length > 0
          ? inRevision.map((d) => `• **${d.title}** — ${d.type} · ${d.status}`).join('\n')
          : '• Aucune fiche " En révision " dans cette sélection (vérifie les filtres).',
        '',
        '**Actions recommandées**',
        '',
        '• Contrôler **lien**, **contact** et texte, puis passer en **Actif** ou **Archivé**.',
        `• Éviter les **doublons** de versions : archiver l'ancienne entrée si besoin.`,
        '',
        '**Inventaire complet de la vue**',
        '',
        formatDocumentsBulletList(documentsSnapshot),
      ].join('\n');
    }
    case 'ctx-organize-library':
      return [
        'Tu as **plusieurs catégories** et un volume de fiches : garde des **titres explicites**, des types cohérents (Officiel / Modèle / Suivi) et des tags partagés.',
        `Pense à une **arborescence** par grand thème (Associations, Événementiel…) et à un export JSON périodique depuis l'en-tête.`,
        listBlock,
      ].join('\n\n');
    case 'ctx-tab-associations':
      return [
        `Onglet **${tabLabel('associations')}** : croise les partenaires avec les fiches **Documents** (contrats, conventions) et le tableau de suivi si tu en as un.`,
        'Vérifie dates de convention, contacts et cohérence avec les statuts.',
        listBlock,
      ].join('\n\n');
    case 'ctx-tab-codes':
      return [
        `Onglet **${tabLabel('codes')}** : le référentiel juridique complète les modèles internes ; cite les articles utiles dans les descriptions de tes fiches **Documents** si besoin.`,
        listBlock,
      ].join('\n\n');
    case 'ctx-tab-memo':
      return [
        `Onglet **${tabLabel('memo')}** : les raccourcis importants doivent refléter les **documents Actifs** les plus utilisés ; mets à jour les liens si une fiche change.`,
        listBlock,
      ].join('\n\n');
    case 'verify-docs':
      return buildVerifyDocumentsStructured(documentsSnapshot, documentsCount);
    case 'suggest-improvements':
      return buildSuggestImprovementsStructured(documentsSnapshot, documentsCount, activeTab);
    case 'ctx-key-statuts':
      return [
        `Tu n'as **aucune pièce clé** repérée dans ta sélection (statuts, registre, convention, contrat d'association…). C'est souvent le bon point de départ.`,
        `**Étapes suggérées** : 1) Onglet **Documents** → *Ajouter un document*, type **Modèle** ou **Officiel**, catégorie **Associations**. 2) Titre explicite, ex. "Statuts de l'association". 3) Renseigne lien, description et contact référent.`,
        'Inspire-toi du **Modèle contrat association** déjà présent au besoin, puis fais valider la version définitive.',
        listBlock,
      ].join('\n\n');
    case 'ctx-registre':
      return [
        `Les **statuts** sont présents dans ta liste, mais **pas de registre** (membres, cotisations, PV d'AG…).`,
        '**À créer** : une fiche **Registre des membres** ou **Registre des délibérations** selon ton besoin — type **Suivi** ou **Dossier**, catégorie **Associations**.',
        `Contenu type : identité des membres, date d'adhésion, mandats, lien vers le tableur ou outil utilisé.`,
        listBlock,
      ].join('\n\n');
    case 'ctx-assemble-folder':
      return [
        `Tu as **${documentsCount}** documents dans la vue actuelle — tu peux les **assembler en dossier** pour un dépôt ou une transmission.`,
        '**Ordre courant** : 1) Couverture / sommaire, 2) Statuts & décisions, 3) Registres / listes, 4) Contrats & conventions, 5) Annexes.',
        `Utilise l'**export JSON** dans l'en-tête pour sauvegarder la liste ; pour un livrable unique, regroupe les liens vers les mêmes dossiers Drive ou un PDF fusionné manuellement.`,
        listBlock,
      ].join('\n\n');
    default:
      return mockFromFreeText('', ctx);
  }
}

function mockFromFreeText(text, ctx) {
  const t = text.toLowerCase();
  const { documentsCount, documentsSnapshot, activeTab } = ctx;

  if (/amélior|idée|suggest|optim|classement|organis/.test(t)) {
    return buildSuggestImprovementsStructured(documentsSnapshot, documentsCount, activeTab);
  }
  if (/association|partenaire|convention/.test(t)) {
    return buildCreateAssociationStructured(documentsSnapshot, documentsCount);
  }
  if (/vérif|contrôl|audit|cohérence/.test(t)) {
    return buildVerifyDocumentsStructured(documentsSnapshot, documentsCount);
  }
  if (/dossier|dossiers|zip|export/.test(t)) {
    return [
      '**Dossier et export**',
      '',
      '**À faire**',
      '',
      '• Regrouper les **mêmes thèmes** dans une catégorie claire (Associations, Événementiel…).',
      `• Utiliser l'**export JSON** depuis l'en-tête pour une sauvegarde ou un traitement externe.`,
      '',
      '**Documents pris en compte**',
      '',
      formatDocumentsBulletList(documentsSnapshot),
    ].join('\n');
  }
  if (/document|lien|404/.test(t)) {
    return buildVerifyDocumentsStructured(documentsSnapshot, documentsCount);
  }
  if (/bonjour|salut|hello|aide/.test(t)) {
    return [
      '**Bonjour**',
      '',
      `Je m'appuie sur **${documentsCount}** fiche(s) dans ta vue filtrée **Documents** (onglet actuel : **${tabLabel(activeTab)}**).`,
      '',
      '**Aperçu**',
      '',
      formatDocumentsBulletList(documentsSnapshot),
    ].join('\n');
  }

  return [
    '**Réponse courte (démo)**',
    '',
    `Je n'ai pas reconnu de mot-clé précis ; voici tout de même **ta sélection** pour t'aider à reformuler.`,
    '',
    formatDocumentsBulletList(documentsSnapshot),
    '',
    '**Essaye** : " vérifier les documents ", " créer une association ", ou une suggestion du panneau.',
  ].join('\n');
}

/**
 * @param {{
 *   suggestionId?: string,
 *   text?: string,
 *   documentsCount?: number,
 *   documents?: Array<{ id?: string, title?: string, type?: string, status?: string, category?: string }>,
 *   activeTab?: string,
 * }} input
 * @returns {Promise<string>}
 */
export function simulateCopilotReply(input) {
  const documentsSnapshot = normalizeDocumentsForCopilot(input.documents);
  const ctx = {
    documentsCount: input.documentsCount ?? documentsSnapshot.length,
    documentsSnapshot,
    activeTab: input.activeTab ?? 'documents',
  };
  const trimmed = (input.text || '').trim();
  const body =
    input.suggestionId != null
      ? mockBySuggestionId(input.suggestionId, ctx)
      : mockFromFreeText(trimmed, ctx);

  return new Promise((resolve) => {
    window.setTimeout(() => resolve(body), TYPING_DELAY_MS);
  });
}
