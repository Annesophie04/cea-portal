import { useState, useEffect } from 'react';
import {
  FileText, FolderOpen, ShieldCheck, Users, CalendarDays, ArrowRight, Sparkles,
  Moon, Sun, Video, DollarSign, Lightbulb, Image, Shield, Globe, ChevronDown,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import SkipToContent from './SkipToContent';

/* Dégradés d’icônes harmonisés (cuivre, or, ardoise) — pas d’arc-en-ciel */
const ICON_GRADIENTS = [
  'from-[#a67c2a] to-[#6b4a12]',
  'from-[#1a2838] to-[#0f1a28]',
  'from-[#c9a227] to-[#8b6914]',
  'from-[#4a4458] to-[#2d2838]',
  'from-[#b87333] to-[#7a4f18]',
  'from-[#2d4a42] to-[#1a2e28]',
  'from-[#8b7355] to-[#5c4a32]',
  'from-[#5c4a6b] to-[#3a3448]',
  'from-[#9a7618] to-[#5c4810]',
  'from-[#3d5a4a] to-[#243830]',
];

const FEATURES = [
  { icon: FileText, title: 'Documents', desc: 'Centralisez et classez tous les fichiers officiels du C.E.A.' },
  { icon: ShieldCheck, title: 'Mémo', desc: 'Les documents essentiels et contacts clés en un coup d\'œil.' },
  { icon: FolderOpen, title: 'Procédures', desc: 'Le guide complet des procédures pour chaque service.' },
  { icon: Users, title: 'Associations', desc: 'Suivi des associations, conventions et contrats.' },
  { icon: CalendarDays, title: 'Événements', desc: 'Planning et organisation des manifestations.' },
  { icon: Video, title: 'Vidéos', desc: 'Bibliothèque vidéo du pôle communication.' },
  { icon: DollarSign, title: 'Comptabilité', desc: 'Suivi des dépenses et recettes hebdomadaires.' },
  { icon: Lightbulb, title: 'Idées', desc: 'Notez et priorisez vos idées pour le C.E.A.' },
  { icon: Image, title: 'Affiches', desc: 'Galerie des affiches et visuels créés.' },
];

const STATS = [
  { label: 'Sections', value: '11', icon: Globe },
  { label: 'Outils', value: '50+', icon: Shield },
  { label: 'Accès', value: '24/7', icon: Sparkles },
];

export default function WelcomePage({ onEnter }) {
  const { dark, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    setVisible(true);
    const onScroll = () => {
      setScrolled(window.scrollY > 48);
      setParallax(window.scrollY * 0.15);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-x-hidden safe-pb">
      <SkipToContent />
      <div className="absolute inset-0 bg-surface pointer-events-none" />
      <div className="welcome-mesh absolute inset-0 pointer-events-none" aria-hidden />
      <div className="welcome-hero-glow absolute inset-x-0 top-0 pointer-events-none" aria-hidden />

      {/* Navigation flottante */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-card/85 dark:bg-[#141418]/80 backdrop-blur-xl border-b border-border/80 shadow-lg dark:shadow-black/40'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-2.5 max-lg:landscape:py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src={`${import.meta.env.BASE_URL}logo-san-andreas.png`} alt="" className="w-9 h-9 shrink-0 drop-shadow-md" />
            <span
              className={`text-sm font-bold truncate transition-all duration-300 ${
                scrolled ? 'opacity-100 text-primary' : 'opacity-0 w-0 sm:w-auto overflow-hidden'
              }`}
            >
              Portail C.E.A
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggle}
              className="glass-toggle inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border border-border text-text hover:bg-surface-alt transition-colors cursor-pointer"
              aria-pressed={dark}
            >
              {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-text-muted" />}
              <span className="hidden sm:inline">{dark ? 'Clair' : 'Sombre'}</span>
            </button>
            <button
              type="button"
              onClick={onEnter}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white shadow-md shadow-copper/25 hover:shadow-copper/40 hover:-translate-y-0.5 transition-all cursor-pointer ${
                scrolled ? 'opacity-100' : 'opacity-100 sm:opacity-0 sm:pointer-events-none'
              }`}
            >
              Accéder
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main id="contenu-principal" tabIndex={-1} className="relative z-10 flex-1">
        {/* Hero */}
        <section className="relative min-h-[100dvh] max-lg:landscape:min-h-0 max-lg:landscape:py-6 max-lg:landscape:pb-10 max-lg:landscape:pt-14 flex flex-col items-center justify-center px-4 pb-24 pt-20 md:pt-24 max-lg:landscape:justify-start">
          <div
            className={`max-w-4xl w-full text-center transition-all duration-1000 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-copper/10 dark:bg-copper/15 border border-copper/25 text-copper text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] mb-8 max-lg:landscape:mb-3 max-lg:landscape:py-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="leading-tight">State of San Andreas — Gouvernement</span>
            </div>

            <div className="flex items-center justify-center gap-4 md:gap-10 mb-10 max-lg:landscape:mb-4 max-lg:landscape:gap-5">
              <div className="relative group">
                <div className="absolute -inset-3 max-lg:landscape:-inset-1 bg-gradient-to-br from-copper/30 to-transparent rounded-full blur-2xl opacity-80 group-hover:opacity-100 transition-opacity max-lg:landscape:opacity-50" />
                <img
                  src={`${import.meta.env.BASE_URL}logo-san-andreas.png`}
                  alt="State of San Andreas"
                  className="parallax-logo relative w-[4.5rem] h-[4.5rem] md:w-28 md:h-28 max-lg:landscape:w-14 max-lg:landscape:h-14 object-contain drop-shadow-2xl"
                  style={{ transform: `translateY(${parallax}px)` }}
                />
              </div>
              <div className="h-12 md:h-20 max-lg:landscape:h-10 w-px bg-gradient-to-b from-transparent via-copper/40 to-transparent" />
              <div className="relative group">
                <div className="absolute -inset-3 max-lg:landscape:-inset-1 bg-gradient-to-br from-gold/25 to-transparent rounded-full blur-2xl opacity-80 group-hover:opacity-100 transition-opacity max-lg:landscape:opacity-50" />
                <img
                  src={`${import.meta.env.BASE_URL}logo-cea.png`}
                  alt="C.E.A"
                  className="parallax-logo relative w-[4.5rem] h-[4.5rem] md:w-28 md:h-28 max-lg:landscape:w-14 max-lg:landscape:h-14 object-contain drop-shadow-2xl"
                  style={{ transform: `translateY(${parallax * 0.7}px)` }}
                />
              </div>
            </div>

            <h1 className="text-[2.75rem] sm:text-5xl md:text-6xl lg:text-7xl max-lg:landscape:text-3xl font-extrabold text-primary tracking-tight leading-[1.05] max-lg:landscape:leading-tight">
              Portail
              <span className="block mt-1 md:mt-2 max-lg:landscape:mt-0 welcome-title-shimmer pb-1">
                C.E.A
              </span>
            </h1>

            <p className="mt-6 md:mt-8 max-lg:landscape:mt-3 text-base md:text-lg lg:text-xl max-lg:landscape:text-sm text-text-muted max-w-2xl mx-auto leading-relaxed max-lg:landscape:line-clamp-3">
              Communication, événementiel et association — un espace unique pour vos documents, procédures,
              associations et outils métiers.
            </p>

            <div className="mt-8 md:mt-10 max-lg:landscape:mt-4 inline-flex flex-wrap items-center justify-center gap-4 md:gap-10 max-lg:landscape:gap-3 px-4 sm:px-6 py-3 max-lg:landscape:py-2 rounded-2xl welcome-stat-strip">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 text-left group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-copper/20 to-gold/10 border border-copper/20 flex items-center justify-center group-hover:scale-110 group-hover:from-copper/30 group-hover:to-gold/20 transition-all duration-300">
                    <stat.icon className="w-5 h-5 text-copper" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-extrabold text-primary tabular-nums leading-none stat-value-glow">{stat.value}</p>
                    <p className="text-[10px] md:text-xs text-text-muted font-semibold uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 md:mt-12 max-lg:landscape:mt-5 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={onEnter}
                className="cta-glow group inline-flex items-center justify-center gap-3 min-h-[3rem] max-lg:landscape:min-h-[2.75rem] sm:min-h-[3.5rem] px-8 md:px-12 max-lg:landscape:px-6 text-sm md:text-lg max-lg:landscape:text-sm font-bold rounded-2xl bg-gradient-to-r from-copper to-gold-light text-white shadow-xl shadow-copper/30 hover:shadow-copper/50 hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer w-full sm:w-auto"
              >
                Accéder au portail
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => document.getElementById('welcome-features')?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute bottom-6 max-lg:landscape:bottom-3 left-1/2 -translate-x-1/2 max-lg:landscape:hidden flex flex-col items-center gap-1 text-text-light hover:text-copper transition-colors cursor-pointer group"
            aria-label="Voir les fonctionnalités"
          >
            <span className="text-[10px] uppercase tracking-widest opacity-70">Découvrir</span>
            <ChevronDown className="w-6 h-6 animate-bounce opacity-60 group-hover:opacity-100" />
          </button>
        </section>

        {/* Séparateur */}
        <div className="relative h-px max-w-4xl mx-auto px-4 bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/10" />

        {/* Grille fonctionnalités */}
        <section id="welcome-features" className="relative py-16 md:py-24 max-lg:landscape:py-8 px-4 scroll-mt-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-alt/40 to-transparent dark:via-white/[0.02] pointer-events-none" />
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-copper mb-3">Fonctionnalités</p>
              <h2 className="text-3xl md:text-4xl lg:text-[2.5rem] font-extrabold text-primary tracking-tight">
                Un portail complet
              </h2>
              <p className="mt-4 text-text-muted max-w-xl mx-auto leading-relaxed">
                Tout ce dont le pôle C.E.A a besoin au quotidien, regroupé dans une interface claire et cohérente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5" style={{ counterReset: 'feature-counter' }}>
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                const grad = ICON_GRADIENTS[i % ICON_GRADIENTS.length];
                return (
                  <div
                    key={feature.title}
                    style={{ animationDelay: `${i * 45}ms` }}
                    className="welcome-card feature-card-numbered card-inner-light rounded-2xl border border-border bg-card/95 p-6 text-left animate-fade-in"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-4 shadow-lg ring-1 ring-white/10 group-hover:shadow-xl transition-shadow`}
                    >
                      <Icon className="w-6 h-6 text-white drop-shadow-sm" />
                    </div>
                    <h3 className="font-bold text-primary text-lg">{feature.title}</h3>
                    <p className="mt-2 text-sm text-text-muted leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="relative px-4 pb-20 md:pb-28">
          <div className="max-w-4xl mx-auto">
            <div
              className="welcome-cta-final relative overflow-hidden rounded-3xl p-10 md:p-14 text-center border border-border/70 dark:border-white/10 bg-[linear-gradient(135deg,#c8d2de_0%,#d4dce8_50%,#cad4e2_100%)] dark:bg-[linear-gradient(135deg,#0d1117_0%,#161b22_40%,#1c2128_70%,#0d1117_100%)]"
            >
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-80 h-80 bg-copper/12 dark:bg-copper/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/8 dark:bg-blue-600/8 rounded-full blur-3xl" />
              </div>
              <div className="relative z-[10000] bg-card/95 backdrop-blur-md dark:bg-black/70 rounded-2xl px-8 py-10 md:px-12 md:py-12 border border-border/50 dark:border-transparent shadow-sm dark:shadow-none">
                <div className="flex items-center justify-center gap-5 mb-8">
                  <img src={`${import.meta.env.BASE_URL}logo-san-andreas.png`} alt="" className="h-11 md:h-12 w-auto opacity-95" />
                  <span className="text-text-muted/40 dark:text-white/25 text-3xl font-extralight select-none">×</span>
                  <img src={`${import.meta.env.BASE_URL}logo-cea.png`} alt="" className="h-11 md:h-12 w-auto opacity-95" />
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-primary dark:text-[#f5f0e8] dark:[text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
                  Prêt à commencer ?
                </h2>
                <p className="text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed text-text-muted dark:text-[#e8e0d4] dark:[text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">
                  Accédez à l’ensemble des outils du pôle Communication, Événementiel et Association.
                </p>
                <button
                  type="button"
                  onClick={onEnter}
                  className="cta-glow group inline-flex items-center gap-3 px-8 py-4 text-base font-bold rounded-2xl bg-gradient-to-r from-copper to-gold-light text-white shadow-lg shadow-copper/35 hover:shadow-copper/55 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  Accéder au portail
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mt-auto py-10 border-t border-border/70 bg-surface/50 dark:bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}logo-san-andreas.png`} alt="" className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-sm font-bold text-primary">Portail C.E.A</p>
              <p className="text-xs text-text-muted">State of San Andreas — Tous droits réservés</p>
            </div>
          </div>
          <p className="text-xs text-text-muted max-w-xs md:max-w-none">
            Communication &bull; Événementiel &bull; Association
          </p>
        </div>
      </footer>
    </div>
  );
}
