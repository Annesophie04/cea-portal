/**
 * Ressource métier : collection éditable de documents juridiques.
 * Point unique pour seed, persistance locale, normalisation — à remplacer ou compléter
 * par un adaptateur API / Supabase sans changer le hook ni les composants.
 */

import { getDefaultLegalCodesRegistry } from '../data/legalCodes/initialRegistry';
import { LEGAL_REGISTRY_VERSION, normalizeLegalRegistry } from '../data/legalCodes/registryContracts';
import {
  LEGAL_CODES_STORAGE_KEY,
  clearLegalCodesLocalStorage,
  loadLegalCodesFromLocalStorage,
  saveLegalCodesToLocalStorage,
} from '../lib/legalCodesPersistence';

/** Identifiant stable de la ressource dans l'application (copilot, analytics, futur API). */
export const LEGAL_DOCUMENTS_LIBRARY_RESOURCE = {
  id: 'cea-legal-documents-library',
  label: 'Référentiel juridique',
  /** Texte d'introduction affiché dans l'onglet (collection éditable, pas une page statique). */
  headerSubtitle:
    'Codes civil, pénal et du travail — navigation structurée, recherche et édition locale (export / import JSON).',
  description:
    'Collection éditable de documents juridiques : codes, livres, sections et articles.',
  storageKey: LEGAL_CODES_STORAGE_KEY,
  exportFileBaseName: 'cea-referentiel-juridique',
};

export { LEGAL_REGISTRY_VERSION };

export function getSeedLegalDocumentsCollection() {
  return getDefaultLegalCodesRegistry();
}

/** État persisté ou null si aucune donnée valide. */
export function loadLegalDocumentsCollection() {
  return loadLegalCodesFromLocalStorage();
}

/** @returns {{ ok: true } | { ok: false, error: string }} */
export function persistLegalDocumentsCollection(codes) {
  return saveLegalCodesToLocalStorage({
    version: LEGAL_REGISTRY_VERSION,
    savedAt: new Date().toISOString(),
    codes,
  });
}

export function clearLegalDocumentsCollection() {
  clearLegalCodesLocalStorage();
}

export function normalizeLegalDocumentsCollectionPayload(raw) {
  return normalizeLegalRegistry(raw);
}
