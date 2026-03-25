import { Download, Upload, Plus, Moon, Sun, Home, Maximize, Minimize } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import HeaderClock from './HeaderClock';
import { exportToPDF, exportToWord } from '../utils/exportDocuments';

export default function Header({ onExport, onImport, onAdd, onShowLanding, documents }) {
  const { dark, toggle } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  // Fermer le menu export si clic en dehors
  useEffect(() => {
    if (!showExportMenu) return;
    const close = () => setShowExportMenu(false);
    window.addEventListener('click', close, { once: true });
    return () => window.removeEventListener('click', close);
  }, [showExportMenu]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Thin gold accent line */}
      <div className="h-1 gold-shimmer" />

      <div className="bg-gradient-to-r from-slate-300/75 via-[#d4dce8] to-slate-300/75 dark:from-[#111119] dark:via-[#1c1c2b] dark:to-[#2a2a3d] backdrop-blur-sm text-text dark:text-white border-b border-border/80 dark:border-transparent shadow-md shadow-black/5 dark:shadow-xl dark:shadow-black/30 header-bar pt-[env(safe-area-inset-top)] max-lg:landscape:shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 max-lg:landscape:py-2 max-lg:landscape:gap-2 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 sm:gap-5 min-w-0 max-lg:landscape:gap-2">
            {/* Logo San Andreas */}
            <div className="relative">
              <div className="absolute -inset-1 bg-copper/25 rounded-full blur-md max-lg:landscape:hidden" />
              <img
                src={`${import.meta.env.BASE_URL}logo-san-andreas.png`}
                alt="State of San Andreas"
                className="relative w-12 h-12 sm:w-14 sm:h-14 max-lg:landscape:w-10 max-lg:landscape:h-10 shrink-0 drop-shadow-[0_2px_8px_rgba(184,115,51,0.5)]"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.28em] sm:tracking-[0.35em] text-copper-light font-bold max-lg:landscape:truncate">
                State of San Andreas
              </p>
              <h1 className="text-base sm:text-xl md:text-2xl font-extrabold mt-0.5 leading-tight tracking-tight truncate max-lg:landscape:text-sm text-primary dark:text-white">
                Portail documentaire C.E.A
              </h1>
              <p className="text-[11px] mt-0.5 font-medium tracking-wide max-lg:landscape:hidden text-text-muted">
                Communication &bull; Événementiel &bull; Association
              </p>
            </div>

            {/* Logo CEA */}
            <div className="relative hidden md:block">
              <div className="absolute -inset-1 bg-copper/25 rounded-full blur-md" />
              <img
                src={`${import.meta.env.BASE_URL}logo-cea.png`}
                alt="C.E.A"
                className="relative w-14 h-14 shrink-0 drop-shadow-[0_2px_8px_rgba(184,115,51,0.5)]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2.5 justify-end w-full md:w-auto items-center max-lg:landscape:gap-1 max-lg:landscape:flex-nowrap max-lg:landscape:overflow-x-auto max-lg:landscape:pb-0.5 max-lg:landscape:-mr-1 scrollbar-thin">
            <HeaderClock />

            {onShowLanding && (
              <button
                type="button"
                onClick={onShowLanding}
                className="header-btn-secondary inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 max-lg:landscape:px-2 max-lg:landscape:py-1.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer shrink-0"
                title="Vitrine d'accueil"
              >
                <Home className="w-4 h-4" />
                <span className="hidden lg:inline max-lg:landscape:hidden">Accueil</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggle}
              className="header-btn-secondary inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 max-lg:landscape:px-2 max-lg:landscape:py-1.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer shrink-0"
              title={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              aria-pressed={dark}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden lg:inline max-lg:landscape:hidden">{dark ? 'Clair' : 'Sombre'}</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="header-btn-secondary inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 max-lg:landscape:px-2 max-lg:landscape:py-1.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer shrink-0"
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran (F11)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Export menu */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); }}
                className="header-btn-secondary inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 max-lg:landscape:px-2 max-lg:landscape:py-1.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span className="max-lg:landscape:hidden">Exporter</span>
              </button>
              {showExportMenu && (
                <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 min-w-[160px] animate-slide-up">
                  <button
                    type="button"
                    onClick={() => { exportToPDF(documents || []); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-alt transition-colors text-left"
                  >
                    <span className="text-danger font-bold text-xs">PDF</span>
                    Exporter en PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => { exportToWord(documents || []); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-alt transition-colors text-left border-t border-border/50"
                  >
                    <span className="text-blue-600 font-bold text-xs">DOC</span>
                    Exporter en Word
                  </button>
                  <button
                    type="button"
                    onClick={() => { onExport(); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-alt transition-colors text-left border-t border-border/50"
                  >
                    <span className="text-copper font-bold text-xs">JSON</span>
                    Exporter en JSON
                  </button>
                </div>
              )}
            </div>

            <label className="header-btn-secondary inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 max-lg:landscape:px-2 max-lg:landscape:py-1.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer shrink-0">
              <Upload className="w-4 h-4 shrink-0" />
              <span className="max-lg:landscape:hidden">Importer</span>
              <input
                type="file"
                accept="application/json,.pdf,.doc,.docx"
                className="hidden"
                onChange={onImport}
              />
            </label>

            <button
              type="button"
              onClick={onAdd}
              className="cta-glow inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 min-h-[40px] max-lg:landscape:min-h-[36px] sm:min-h-[44px] px-3 sm:px-5 py-2 max-lg:landscape:px-2.5 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all duration-200 cursor-pointer shadow-lg shadow-copper/30 hover:shadow-copper/50 active:scale-[0.98] touch-manipulation shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline max-lg:landscape:hidden">Ajouter un document</span>
              <span className="inline sm:hidden">Document</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
