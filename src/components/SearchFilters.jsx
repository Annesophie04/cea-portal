import { Search, X, SlidersHorizontal, Filter } from 'lucide-react';

export default function SearchFilters({
  search, setSearch,
  categoryFilter, setCategoryFilter, categories,
  typeFilter, setTypeFilter, types,
  statusFilter, setStatusFilter, statuses,
  searchRef,
}) {
  const hasFilters = search || categoryFilter !== 'Toutes' || typeFilter !== 'Tous' || statusFilter !== 'Tous';
  const activeCount = [
    categoryFilter !== 'Toutes',
    typeFilter !== 'Tous',
    statusFilter !== 'Tous',
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('Toutes');
    setTypeFilter('Tous');
    setStatusFilter('Tous');
  };

  return (
    <div className="search-panel rounded-2xl border border-border p-4 sm:p-5 max-lg:landscape:p-3 max-lg:landscape:rounded-xl animate-fade-in" role="search" aria-label="Recherche et filtres des documents">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-copper/15 to-gold-light/10 flex items-center justify-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-copper" />
          </div>
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Recherche & Filtres</span>
        </div>
        {hasFilters && (
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-copper/10 text-copper">
                {activeCount} filtre{activeCount > 1 ? 's' : ''}
              </span>
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-danger hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Réinitialiser tous les filtres"
            >
              <X className="w-3.5 h-3.5" />
              Effacer
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
        <div className="relative group">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-copper transition-colors" />
          <input
            ref={searchRef}
            type="search"
            name="q"
            autoComplete="off"
            placeholder="Rechercher un document, une catégorie, un tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Rechercher dans les documents"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm text-text bg-surface hover:bg-surface-alt focus:bg-white dark:focus:bg-white/10 transition-all duration-200 placeholder:text-text-light/70"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface-alt flex items-center justify-center text-text-light hover:text-danger transition-colors cursor-pointer"
              aria-label="Effacer la recherche"
            >
              <X className="w-3 h-3" aria-hidden />
            </button>
          )}
        </div>

        <div className="relative">
          <Filter className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            aria-label="Filtrer par catégorie"
            className={`pl-8 pr-3.5 py-2.5 rounded-xl border text-sm bg-surface hover:bg-surface-alt cursor-pointer transition-all min-w-[8rem] ${categoryFilter !== 'Toutes' ? 'border-copper/40 text-copper font-semibold' : 'border-border text-text'}`}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          aria-label="Filtrer par type de document"
          className={`px-3.5 py-2.5 rounded-xl border text-sm bg-surface hover:bg-surface-alt cursor-pointer transition-all min-w-[7rem] ${typeFilter !== 'Tous' ? 'border-copper/40 text-copper font-semibold' : 'border-border text-text'}`}
        >
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label="Filtrer par statut"
          className={`px-3.5 py-2.5 rounded-xl border text-sm bg-surface hover:bg-surface-alt cursor-pointer transition-all min-w-[7rem] ${statusFilter !== 'Tous' ? 'border-copper/40 text-copper font-semibold' : 'border-border text-text'}`}
        >
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}
