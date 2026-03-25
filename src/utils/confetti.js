const COLORS = ['#d4af37', '#b8860b', '#e8d48b', '#c9a227', '#f0e4a8', '#a67c52', '#60a5fa', '#4ade80'];

export function fireConfetti(count = 30) {
  const container = document.body;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = `${Math.random() * 100}vw`;
    el.style.backgroundColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.animationDuration = `${2 + Math.random() * 2}s`;
    el.style.animationDelay = `${Math.random() * 0.5}s`;
    el.style.width = `${6 + Math.random() * 6}px`;
    el.style.height = `${6 + Math.random() * 6}px`;
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}
