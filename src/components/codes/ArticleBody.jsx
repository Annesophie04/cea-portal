/**
 * Affichage du corps d'article (puces * sur lignes, paragraphes).
 */
export default function ArticleBody({ text, className = '' }) {
  if (!text) return <p className={`text-text-muted text-sm ${className}`}>—</p>;
  const parts = text.split(/\n\n+/);
  return (
    <div className={`space-y-3 text-sm leading-relaxed text-text dark:text-text/90 ${className}`}>
      {parts.map((para, i) => {
        const lines = para.split('\n').map((l) => l.trim()).filter(Boolean);
        const bullets = lines.filter((l) => l.startsWith('*'));
        if (bullets.length > 0 && bullets.length === lines.length) {
          return (
            <ul key={i} className="list-none space-y-1.5 pl-0">
              {bullets.map((line, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-copper/70 dark:bg-copper-light/80" aria-hidden />
                  <span>{line.replace(/^\*\s*/, '')}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {para}
          </p>
        );
      })}
    </div>
  );
}
