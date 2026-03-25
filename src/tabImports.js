/**
 * Imports dynamiques des onglets — source unique pour lazy() et préchargement.
 */
export const tabImports = {
  memo: () => import('./components/MemoSection'),
  procedures: () => import('./components/GuidePage'),
  associations: () => import('./components/AssociationsTab'),
  evenements: () => import('./components/EvenementsTab'),
  videos: () => import('./components/VideosTab'),
  comptabilite: () => import('./components/ComptabiliteTab'),
  idees: () => import('./components/IdeesTab'),
  affiches: () => import('./components/AffichesTab'),
  stockage: () => import('./components/StockageTab'),
  location: () => import('./components/LocationTab'),
  guide: () => import('./components/GuideTab'),
  codes: () => import('./components/codes/CodesTab'),
};

/** Précharge le chunk d’un onglet (survol ou idle) — sans effet sur « documents ». */
export function prefetchTabPanel(key) {
  const loader = tabImports[key];
  if (loader) loader();
}

const PREFETCH_IDLE_KEYS = ['memo', 'videos'];

/** Précharge les onglets les plus consultés quand le navigateur est au repos. */
export function prefetchIdlePopularTabs() {
  const run = () => {
    PREFETCH_IDLE_KEYS.forEach((k) => tabImports[k]?.());
  };
  if (typeof window === 'undefined') return () => {};
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(run, { timeout: 4000 });
    return () => window.cancelIdleCallback(id);
  }
  const t = window.setTimeout(run, 800);
  return () => window.clearTimeout(t);
}
