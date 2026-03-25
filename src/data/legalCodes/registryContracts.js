/**
 * Contrat du référentiel juridique : forme stable pour seed, localStorage, import JSON
 * et branchement futur (API / Supabase).
 *
 * Hiérarchie : Code → Livres → Sections → Articles (pas de texte libre unique au niveau code).
 */

/** @typedef {{ version?: number, savedAt?: string, codes: LegalCode[] }} LegalRegistryRoot */

/**
 * @typedef {Object} LegalCode
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} [shortDescription]
 * @property {LegalBook[]} books
 */

/**
 * @typedef {Object} LegalBook
 * @property {string} id
 * @property {string} title
 * @property {number} order
 * @property {LegalSection[]} sections
 */

/**
 * @typedef {Object} LegalSection
 * @property {string} id
 * @property {string} title
 * @property {number} order
 * @property {LegalArticle[]} articles
 */

/**
 * @typedef {Object} LegalArticle
 * @property {string} id
 * @property {string} articleNumber
 * @property {string} title
 * @property {string} content
 * @property {string} updatedAt
 * @property {boolean} [isEditable]
 * @property {number} order
 */

export const LEGAL_REGISTRY_VERSION = 1;

function normalizeArticle(a, ai, sectionId) {
  const order = typeof a?.order === 'number' ? a.order : ai;
  return {
    ...a,
    id: a?.id ?? `${sectionId}-art-${ai}`,
    articleNumber: a?.articleNumber != null ? String(a.articleNumber) : String(ai + 1),
    title: a?.title ?? '',
    content: a?.content ?? '',
    updatedAt: a?.updatedAt ?? new Date().toISOString(),
    isEditable: a?.isEditable !== false,
    order,
  };
}

function normalizeSection(sec, si, bookId) {
  const id = sec?.id ?? `${bookId}-sec-${si}`;
  return {
    ...sec,
    id,
    title: sec?.title ?? '',
    order: typeof sec?.order === 'number' ? sec.order : si,
    articles: (sec?.articles ?? []).map((a, ai) => normalizeArticle(a, ai, id)),
  };
}

function normalizeBook(book, bi, codeSlug) {
  const id = book?.id ?? `${codeSlug}-book-${bi}`;
  return {
    ...book,
    id,
    title: book?.title ?? '',
    order: typeof book?.order === 'number' ? book.order : bi,
    sections: (book?.sections ?? []).map((s, si) => normalizeSection(s, si, id)),
  };
}

function normalizeCode(code, cIdx) {
  const slug = code?.slug ?? `code-${cIdx}`;
  return {
    ...code,
    id: code?.id ?? slug,
    slug,
    title: code?.title ?? '',
    shortDescription: code?.shortDescription ?? '',
    books: (code?.books ?? []).map((b, bi) => normalizeBook(b, bi, slug)),
  };
}

/**
 * Valide / complète un payload persistant (localStorage, import, réponse API).
 * Idempotent sur les données déjà conformes ; préserve les champs supplémentaires via spread.
 *
 * @param {unknown} raw
 * @returns {LegalRegistryRoot}
 */
export function normalizeLegalRegistry(raw) {
  if (!raw || typeof raw !== 'object') {
    return { version: LEGAL_REGISTRY_VERSION, codes: [] };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  const codes = Array.isArray(o.codes) ? o.codes : [];
  return {
    version: typeof o.version === 'number' ? o.version : LEGAL_REGISTRY_VERSION,
    ...(typeof o.savedAt === 'string' ? { savedAt: o.savedAt } : {}),
    codes: codes.map((c, i) => normalizeCode(c, i)),
  };
}
