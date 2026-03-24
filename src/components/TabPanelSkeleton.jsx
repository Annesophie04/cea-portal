/** Chargement d’un onglet (code découpé) — discret et cohérent avec le thème */
export default function TabPanelSkeleton() {
  return (
    <div
      className="tab-skeleton rounded-2xl border border-border bg-card/80 p-8 md:p-10 min-h-[200px] flex flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-copper/40 dark:bg-copper/50 animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <p className="text-sm font-medium text-text-muted">Chargement de la section…</p>
    </div>
  );
}
