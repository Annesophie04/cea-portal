/** Lien d’évitement — visible au focus clavier ; place le focus sur la zone principale. */
export default function SkipToContent() {
  const handleClick = (e) => {
    e.preventDefault();
    const el = document.getElementById('contenu-principal');
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    requestAnimationFrame(() => {
      try {
        el.focus({ preventScroll: true });
      } catch {
        el.focus();
      }
    });
  };

  return (
    <a href="#contenu-principal" className="cea-skip-link" onClick={handleClick}>
      Aller au contenu principal
    </a>
  );
}
