import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  Download,
  FileJson,
  Gavel,
  Scale,
  Search,
  Pencil,
  Eye,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Library,
} from 'lucide-react';
import {
  useLegalDocumentsLibrary,
  flattenArticlesForSearch,
  findArticleById,
} from '../../hooks/useLegalDocumentsLibrary';
import ArticleBody from './ArticleBody';
import { cn } from '../../utils/cn';

const CODE_ICONS = {
  'code-civil': Scale,
  'code-penal': Gavel,
  'code-travail': BookOpen,
};

function articleSnapshot(art) {
  return {
    articleNumber: String(art.articleNumber ?? '').trim(),
    title: String(art.title ?? '').trim(),
    content: String(art.content ?? ''),
  };
}

function ArticleEditForm({
  codeSlug,
  article,
  updateArticle,
  moveArticle,
  deleteArticle,
  onAddArticle,
  onSaved,
}) {
  const baseline = useMemo(() => articleSnapshot(article), [article]);

  const [num, setNum] = useState(() => articleSnapshot(article).articleNumber);
  const [title, setTitle] = useState(() => articleSnapshot(article).title);
  const [content, setContent] = useState(() => articleSnapshot(article).content);

  const dirty = useMemo(() => {
    return (
      num !== baseline.articleNumber || title !== baseline.title || content !== baseline.content
    );
  }, [num, title, content, baseline]);

  const save = () => {
    if (!dirty) return;
    updateArticle(codeSlug, article.id, {
      articleNumber: num,
      title,
      content,
    });
    onSaved?.();
    if (import.meta.env.DEV) {
      console.debug('[legalCodes] UI — enregistrement demandé', {
        codeSlug,
        articleId: article.id,
        payload: articleSnapshot({ ...article, articleNumber: num, title, content }),
      });
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => moveArticle(codeSlug, article.id, 'up')}
          className="p-2 rounded-lg border border-border hover:bg-surface-alt"
          title="Monter"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => moveArticle(codeSlug, article.id, 'down')}
          className="p-2 rounded-lg border border-border hover:bg-surface-alt"
          title="Descendre"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onAddArticle}
          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-copper/30 text-copper text-xs font-bold hover:bg-copper/10"
        >
          <Plus className="h-3.5 w-3.5" /> Article
        </button>
        <button
          type="button"
          onClick={() => deleteArticle(codeSlug, article.id)}
          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-danger/30 text-danger text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Numéro d'article</label>
        <input
          value={num}
          onChange={(e) => setNum(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-border bg-surface px-3 py-2 text-sm dark:bg-black/25 dark:border-white/10"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Titre</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm dark:bg-black/25 dark:border-white/10"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Contenu</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-mono leading-relaxed dark:bg-black/25 dark:border-white/10 resize-y min-h-[280px]"
        />
      </div>
      {dirty && (
        <p className="text-xs font-semibold text-amber-800 dark:text-amber-200/90 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" aria-hidden />
          Modifications non enregistrées
        </p>
      )}
      <button
        type="button"
        onClick={save}
        disabled={!dirty}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-copper to-gold-dark text-white text-sm font-bold shadow-md shadow-copper/25 hover:from-gold-light hover:to-copper transition-all disabled:opacity-45 disabled:pointer-events-none disabled:grayscale"
      >
        Enregistrer les modifications
      </button>
      <p className="text-[10px] text-text-muted">
        Dernière mise à jour enregistrée : {new Date(article.updatedAt).toLocaleString('fr-FR')}
      </p>
    </div>
  );
}

export default function CodesTab() {
  const {
    resource: legalDocumentsResource,
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
  } = useLegalDocumentsLibrary();

  const [activeSlug, setActiveSlug] = useState(codes[0]?.slug ?? 'code-travail');
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState('');
  const [codeFilter, setCodeFilter] = useState('all');
  const [saveNotice, setSaveNotice] = useState(false);
  const saveNoticeTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  const flashSaveNotice = useCallback(() => {
    setSaveNotice(true);
    if (saveNoticeTimerRef.current) clearTimeout(saveNoticeTimerRef.current);
    saveNoticeTimerRef.current = setTimeout(() => {
      setSaveNotice(false);
      saveNoticeTimerRef.current = null;
    }, 4500);
  }, []);

  useEffect(
    () => () => {
      if (saveNoticeTimerRef.current) clearTimeout(saveNoticeTimerRef.current);
    },
    [],
  );

  const flatSearch = useMemo(() => flattenArticlesForSearch(codes), [codes]);

  const searchHits = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return flatSearch.filter(({ codeSlug, article, bookTitle, sectionTitle }) => {
      if (codeFilter !== 'all' && codeSlug !== codeFilter) return false;
      const blob = [article.title, article.content, bookTitle, sectionTitle].join(' ').toLowerCase();
      return blob.includes(q);
    }).slice(0, 40);
  }, [flatSearch, search, codeFilter]);

  const selection = selectedArticleId ? findArticleById(codes, selectedArticleId) : null;

  /* Réinitialise l'id sélectionné si l'article n'existe plus (suppression / import). */
  useEffect(() => {
    if (selectedArticleId && !findArticleById(codes, selectedArticleId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- dérivé des codes après suppression/import
      setSelectedArticleId(null);
    }
  }, [codes, selectedArticleId]);

  const tabSlug = selection?.code.slug ?? activeSlug;
  const activeCode = codes.find((c) => c.slug === tabSlug) ?? codes[0];

  const selectArticle = useCallback((slug, articleId) => {
    setActiveSlug(slug);
    setSelectedArticleId(articleId);
    requestAnimationFrame(() => {
      document.getElementById(`legal-art-${articleId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, []);

  const onAddArticle = useCallback(() => {
    if (!selection) return;
    const newId = addArticle(selection.code.slug, selection.book.id, selection.sec.id, {
      articleNumber: '',
      title: 'Nouvel article',
      content: '',
    });
    if (newId) setSelectedArticleId(newId);
  }, [selection, addArticle]);

  if (!activeCode) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-text-muted">
        Aucun référentiel chargé.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      <header className="rounded-2xl border border-border/80 bg-card/90 dark:bg-[#12121a]/90 backdrop-blur-sm p-4 sm:p-5 shadow-sm dark:shadow-black/30 dark:border-copper/15">
        {persistError && (
          <div
            className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-danger/40 bg-red-50 px-3 py-2 text-xs text-danger dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            <span>
              Échec de l'enregistrement local : {persistError}. Les changements restent en mémoire jusqu'au prochain
              rechargement.
            </span>
            <button
              type="button"
              onClick={clearPersistError}
              className="shrink-0 font-bold underline hover:no-underline"
            >
              Masquer
            </button>
          </div>
        )}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-copper/20 to-gold-dark/15 ring-1 ring-copper/25">
              <Library className="h-5 w-5 text-copper dark:text-copper-light" />
            </span>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-primary tracking-tight">
                {legalDocumentsResource.label}
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5 max-w-2xl">
                {legalDocumentsResource.headerSubtitle}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setEditMode((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors',
                editMode
                  ? 'border-copper/40 bg-copper/10 text-copper dark:text-copper-light'
                  : 'border-border bg-surface-alt/80 text-text-muted hover:text-copper',
              )}
            >
              {editMode ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {editMode ? 'Édition' : 'Lecture'}
            </button>
            <button
              type="button"
              onClick={exportJson}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-border bg-surface-alt/80 text-text-muted hover:text-copper transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-border bg-surface-alt/80 text-text-muted hover:text-copper transition-colors"
            >
              <FileJson className="h-3.5 w-3.5" /> Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJson(f);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={resetToSeed}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-border text-text-muted hover:border-danger/40 hover:text-danger transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Réinit.
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Recherche par mot-clé (titres, contenu, sections)…"
              className="w-full rounded-xl border border-border bg-surface pl-10 pr-3 py-2.5 text-sm text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-copper/35 dark:bg-black/20 dark:border-white/10"
            />
          </div>
          <select
            value={codeFilter}
            onChange={(e) => setCodeFilter(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium text-text cursor-pointer dark:bg-black/20 dark:border-white/10 shrink-0"
            aria-label="Filtrer par code"
          >
            <option value="all">Tous les codes</option>
            {codes.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {searchHits.length > 0 && (
          <div className="mt-3 rounded-xl border border-border/60 bg-surface-alt/50 dark:bg-white/[0.03] p-2 max-h-48 overflow-y-auto">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2 py-1">Résultats</p>
            <ul className="space-y-0.5">
              {searchHits.map(({ codeSlug, codeTitle, sectionTitle, article }) => (
                <li key={`${codeSlug}-${article.id}`}>
                  <button
                    type="button"
                    onClick={() => selectArticle(codeSlug, article.id)}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-copper/10 flex flex-col gap-0.5"
                  >
                    <span className="font-semibold text-primary truncate">
                      Art. {article.articleNumber} — {article.title}
                    </span>
                    <span className="text-[10px] text-text-muted truncate">
                      {codeTitle} · {sectionTitle}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 min-h-[min(70vh,720px)]">
        {/* Sélecteur de code + plan */}
        <aside className="lg:w-[min(100%,320px)] shrink-0 flex flex-col gap-3">
          <div className="flex rounded-2xl border border-border dark:border-copper/15 p-1 bg-surface-alt/40 dark:bg-black/20 gap-0.5">
            {codes.map((c) => {
              const Icon = CODE_ICONS[c.slug] || BookOpen;
              const on = c.slug === tabSlug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => {
                    setActiveSlug(c.slug);
                    setSelectedArticleId(null);
                  }}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all min-w-0',
                    on
                      ? 'bg-gradient-to-r from-copper to-gold-dark text-white shadow-md shadow-copper/25'
                      : 'text-text-muted hover:text-copper hover:bg-card/80',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate w-full text-center leading-tight">{c.title.replace('Code ', '')}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-border dark:border-copper/15 bg-card/95 dark:bg-[#12121a]/95 p-3 sm:p-4 flex-1 overflow-hidden flex flex-col shadow-sm dark:shadow-black/40">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 px-1">Plan</p>
            <nav className="overflow-y-auto scrollbar-thin space-y-3 flex-1 pr-1" aria-label="Livres et articles">
              {activeCode.books.map((book) => (
                <div key={book.id}>
                  <p className="text-[11px] font-bold text-copper dark:text-copper-light px-1 py-1 border-b border-border/50 dark:border-white/[0.06] mb-1.5">
                    {book.title}
                  </p>
                  {book.sections.map((sec) => (
                    <div key={sec.id} className="mb-2">
                      <p className="text-[10px] font-semibold text-text-muted px-1 flex items-center gap-1">
                        <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
                        <span className="line-clamp-2">{sec.title}</span>
                      </p>
                      <ul className="mt-1 space-y-0.5 pl-2 border-l border-copper/20 ml-1.5">
                        {[...sec.articles].sort((a, b) => a.order - b.order).map((art) => (
                          <li key={art.id}>
                            <button
                              type="button"
                              id={`nav-${art.id}`}
                              onClick={() => selectArticle(activeCode.slug, art.id)}
                              className={cn(
                                'w-full text-left px-2 py-1 rounded-lg text-[11px] transition-colors',
                                selectedArticleId === art.id
                                  ? 'bg-copper/15 text-primary font-semibold dark:bg-copper/20'
                                  : 'text-text-muted hover:bg-surface-alt hover:text-text',
                              )}
                            >
                              <span className="text-copper dark:text-copper-light font-bold mr-1">{art.articleNumber}.</span>
                              <span className="line-clamp-2">{art.title}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Contenu article */}
        <section className="flex-1 min-w-0 rounded-2xl border border-border dark:border-copper/15 bg-card/95 dark:bg-[#12121a]/95 shadow-sm dark:shadow-black/40 overflow-hidden flex flex-col">
          {!selection ? (
            <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-text-muted">
              <BookOpen className="h-12 w-12 opacity-30 mb-3" />
              <p className="text-sm font-medium">Sélectionnez un article dans le plan ou via la recherche.</p>
              <p className="text-xs mt-2 max-w-md opacity-80">{activeCode.shortDescription}</p>
            </div>
          ) : (
            <>
              <div className="shrink-0 border-b border-border/70 dark:border-white/[0.07] px-4 sm:px-6 py-4 bg-gradient-to-r from-copper/[0.06] to-transparent dark:from-copper/10">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0" id={`legal-art-${selection.art.id}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-copper dark:text-copper-light mb-1">
                      {activeCode.title} · {selection.book.title}
                    </p>
                    <h2 className="text-base sm:text-lg font-bold text-primary leading-snug">
                      Article {selection.art.articleNumber}
                      {selection.art.title ? ` — ${selection.art.title}` : ''}
                    </h2>
                    <p className="text-[10px] text-text-muted mt-1">{selection.sec.title}</p>
                  </div>
                </div>
              </div>

              {saveNotice && (
                <div
                  className="shrink-0 mx-4 sm:mx-6 mt-3 rounded-xl border border-success/30 bg-green-50 px-3 py-2 text-xs font-medium text-success dark:bg-green-950/35 dark:text-green-200"
                  role="status"
                >
                  Modifications enregistrées — le référentiel a été mis à jour (mémoire locale).
                </div>
              )}

              <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-5 scrollbar-thin">
                {editMode ? (
                  <ArticleEditForm
                    key={`${selection.art.id}-${selection.art.updatedAt}`}
                    codeSlug={selection.code.slug}
                    article={selection.art}
                    updateArticle={updateArticle}
                    moveArticle={moveArticle}
                    deleteArticle={deleteArticle}
                    onAddArticle={onAddArticle}
                    onSaved={flashSaveNotice}
                  />
                ) : (
                  <div className="max-w-3xl">
                    <ArticleBody text={selection.art.content} className="text-[15px] sm:text-base" />
                    <p className="text-[10px] text-text-muted mt-6 pt-4 border-t border-border/50">
                      Mis à jour le {new Date(selection.art.updatedAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
