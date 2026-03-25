/**
 * Persistance locale des codes juridiques (mock).
 *
 * Pour brancher une API / Supabase plus tard :
 * 1. Implémenter un adaptateur dans `services/legalDocumentsLibrary.js` (load / persist async).
 * 2. Dans `useLegalDocumentsLibrary`, remplacer les appels synchrones par l'adaptateur
 *    (ou hydrater depuis React Query / SWR).
 * 3. Garder la même forme d'objet { version, codes } (voir `data/legalCodes/registryContracts.js`).
 */

import { normalizeLegalRegistry } from '../data/legalCodes/registryContracts';

export const LEGAL_CODES_STORAGE_KEY = 'cea-legal-codes-v1';

export function loadLegalCodesFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LEGAL_CODES_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.codes || !Array.isArray(data.codes)) return null;
    return normalizeLegalRegistry(data);
  } catch {
    return null;
  }
}

/** @returns {{ ok: true } | { ok: false, error: string }} */
export function saveLegalCodesToLocalStorage(payload) {
  try {
    localStorage.setItem(LEGAL_CODES_STORAGE_KEY, JSON.stringify(payload));
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("legalCodes: impossible d'écrire localStorage", e);
    return { ok: false, error: msg || 'Écriture locale impossible' };
  }
}

export function clearLegalCodesLocalStorage() {
  localStorage.removeItem(LEGAL_CODES_STORAGE_KEY);
}
