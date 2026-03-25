import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LEGAL_DOCUMENTS_LIBRARY_RESOURCE,
  LEGAL_REGISTRY_VERSION,
  clearLegalDocumentsCollection,
  getSeedLegalDocumentsCollection,
  loadLegalDocumentsCollection,
  normalizeLegalDocumentsCollectionPayload,
  persistLegalDocumentsCollection,
} from '../services/legalDocumentsLibrary';
import {
  addArticleInRegistry,
  deleteArticleInRegistry,
  findArticleLocation,
  moveArticleInRegistry,
  updateArticleInRegistry,
} from '../services/legalDocumentsRegistry';

export { findArticleById, findArticleLocation, flattenArticlesForSearch } from '../services/legalDocumentsRegistry';

function deepClone(v) {
  return JSON.parse(JSON.stringify(v));
}

function normalizeArticlePatch(patch) {
  return {
    articleNumber: String(patch.articleNumber ?? '').trim(),
    title: String(patch.title ?? '').trim(),
    content: String(patch.content ?? ''),
  };
}

const DEBUG_CODES = import.meta.env.DEV;

/**
 * Accès React à la ressource métier " collection de documents juridiques "
 * (même rôle que useDocuments pour la bibliothèque de fichiers).
 */
export function useLegalDocumentsLibrary() {
  const baseline = useMemo(() => getSeedLegalDocumentsCollection(), []);

  const [codes, setCodes] = useState(() => {
    const saved = loadLegalDocumentsCollection();
    if (saved?.codes?.length) return saved.codes;
    return deepClone(baseline);
  });

  const [persistError, setPersistError] = useState(null);

  useEffect(() => {
    const result = persistLegalDocumentsCollection(codes);
    if (result.ok) {
      setPersistError(null);
    } else {
      setPersistError(result.error ?? 'Écriture locale impossible');
    }
  }, [codes]);

  const clearPersistError = useCallback(() => setPersistError(null), []);

  const updateArticle = useCallback((codeSlug, articleId, patch) => {
    const normalized = normalizeArticlePatch(patch);
    if (DEBUG_CODES) {
      console.debug('[legalCodes] updateArticle — entrée', {
        codeSlug,
        articleId,
        payload: normalized,
      });
    }
    setCodes((prev) => {
      const next = updateArticleInRegistry(prev, codeSlug, articleId, normalized);
      if (DEBUG_CODES) {
        const loc = findArticleLocation(next, codeSlug, articleId);
        console.debug('[legalCodes] updateArticle — après fusion', {
          articleId,
          enregistré: loc?.art ?? null,
          structure: loc ? `${loc.code.slug} → ${loc.book.id} → ${loc.sec.id}` : null,
        });
      }
      return next;
    });
  }, []);

  const deleteArticle = useCallback((codeSlug, articleId) => {
    if (!window.confirm('Supprimer cet article ?')) return;
    setCodes((prev) => deleteArticleInRegistry(prev, codeSlug, articleId));
  }, []);

  const addArticle = useCallback((codeSlug, bookId, sectionId, payload) => {
    const newId = `art-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setCodes((prev) => addArticleInRegistry(prev, codeSlug, bookId, sectionId, payload, newId));
    return newId;
  }, []);

  const moveArticle = useCallback((codeSlug, articleId, direction) => {
    setCodes((prev) => moveArticleInRegistry(prev, codeSlug, articleId, direction));
  }, []);

  const resetToSeed = useCallback(() => {
    if (
      !window.confirm(
        "Réinitialiser tous les codes aux données d'origine ? Les modifications locales seront perdues.",
      )
    ) {
      return;
    }
    clearLegalDocumentsCollection();
    setCodes(deepClone(baseline));
  }, [baseline]);

  const exportJson = useCallback(() => {
    const blob = new Blob(
      [JSON.stringify({ version: LEGAL_REGISTRY_VERSION, codes }, null, 2)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${LEGAL_DOCUMENTS_LIBRARY_RESOURCE.exportFileBaseName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [codes]);

  const importJson = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const normalized = normalizeLegalDocumentsCollectionPayload(data);
        if (!normalized.codes.length) throw new Error('Format invalide');
        setCodes(normalized.codes);
      } catch (e) {
        console.error(e);
        window.alert('Import impossible : fichier JSON invalide.');
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    /** Métadonnées de la ressource (id, libellés, clé de stockage). */
    resource: LEGAL_DOCUMENTS_LIBRARY_RESOURCE,
    codes,
    persistError,
    clearPersistError,
    updateArticle,
    deleteArticle,
    addArticle,
    moveArticle,
    resetToSeed,
    exportJson,
    importJson,
  };
}
