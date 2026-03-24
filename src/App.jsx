import { useCallback, useRef, useState } from 'react';
import WelcomePage from './components/WelcomePage';
import {
  FileText, FolderOpen, ShieldCheck, Layers, Users,
  Video, DollarSign, CalendarDays, Lightbulb, Image, Database,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useDocuments } from './hooks/useDocuments';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Header from './components/Header';
import StatCard from './components/StatCard';
import SearchFilters from './components/SearchFilters';
import DocumentList from './components/DocumentList';
import DocumentModal from './components/DocumentModal';
import GuideTab from './components/GuideTab';
import MemoSection from './components/MemoSection';
import GuidePage from './components/GuidePage';
import AssociationsTab from './components/AssociationsTab';
import VideosTab from './components/VideosTab';
import ComptabiliteTab from './components/ComptabiliteTab';
import EvenementsTab from './components/EvenementsTab';
import IdeesTab from './components/IdeesTab';
import AffichesTab from './components/AffichesTab';
import StockageTab from './components/StockageTab';
import { ToastProvider, useToast } from './components/Toast';
import ScrollToTop from './components/ScrollToTop';
import MarqueeBanner from './components/MarqueeBanner';
import BackgroundMusic from './components/BackgroundMusic';

const TABS = [
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'memo', label: 'Mémo', icon: ShieldCheck },
  { key: 'procedures', label: 'Procédures CEA', icon: FolderOpen },
  { key: 'associations', label: 'Associations', icon: Users },
  { key: 'evenements', label: 'Événements', icon: CalendarDays },
  { key: 'videos', label: 'Vidéos', icon: Video },
  { key: 'comptabilite', label: 'Comptabilité', icon: DollarSign },
  { key: 'idees', label: 'Idées', icon: Lightbulb },
  { key: 'affiches', label: 'Affiches', icon: Image },
  { key: 'stockage', label: 'Stockage', icon: Database },
  { key: 'guide', label: 'Aide', icon: Layers },
];

function AppInner() {
  const {
    documents, grouped,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    typeFilter, setTypeFilter,
    statusFilter, setStatusFilter,
    categories, types, statuses,
    addDocument, updateDocument, deleteDocument,
    importDocuments,
  } = useDocuments();

  const toast = useToast();
  const searchRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('documents');
  const [portalView, setPortalView] = useState(() =>
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('cea-portal-view') === 'app'
      ? 'app'
      : 'landing',
  );

  const enterPortal = () => {
    sessionStorage.setItem('cea-portal-view', 'app');
    setPortalView('app');
  };

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(documents, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cea-documents.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('Export réussi !', 'success');
  }, [documents, toast]);

  const handleImport = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        importDocuments(JSON.parse(e.target?.result));
        toast('Import réussi !', 'success');
      } catch {
        toast('Erreur lors de l\'import', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [importDocuments, toast]);

  const openAdd = () => { setEditingDoc(null); setModalOpen(true); };
  const openEdit = (doc) => { setEditingDoc(doc); setModalOpen(true); };
  const handleSave = (formData) => {
    if (editingDoc) {
      updateDocument(editingDoc.id, formData);
      toast('Document modifié', 'success');
    } else {
      addDocument(formData);
      toast('Document créé', 'success');
    }
  };
  const handleDelete = (id) => {
    if (window.confirm('Supprimer ce document ?')) {
      deleteDocument(id);
      toast('Document supprimé', 'info');
    }
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  useKeyboardShortcuts({
    onNewDocument: openAdd,
    onFocusSearch: () => searchRef.current?.focus(),
    onToggleFullscreen: toggleFullscreen,
  });

  // Badge counts per tab
  const tabBadges = {
    documents: documents.length || null,
    memo: documents.filter(d => d.important).length || null,
  };

  const tabsRef = useRef(null);
  const scrollTabs = (dir) => {
    if (tabsRef.current) tabsRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  if (portalView === 'landing') {
    return <WelcomePage onEnter={enterPortal} />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Header
        onExport={handleExport}
        onImport={handleImport}
        onAdd={openAdd}
        onShowLanding={() => {
          sessionStorage.removeItem('cea-portal-view');
          setPortalView('landing');
        }}
      />

      <MarqueeBanner />

      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 pt-5 sm:pt-8 pb-12 sm:pb-16 max-lg:landscape:py-3 max-lg:landscape:space-y-3 space-y-5 sm:space-y-7 safe-pb">
        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-lg:landscape:gap-2 animate-fade-in">
          {[
            { title: 'Documents', value: documents.length, icon: FileText },
            { title: 'Catégories', value: new Set(documents.map(d => d.category)).size, icon: FolderOpen },
            { title: 'Actifs', value: documents.filter(d => d.status === 'Actif').length, icon: ShieldCheck },
            { title: 'Modèles', value: documents.filter(d => d.type === 'Modèle').length, icon: Layers },
          ].map((stat, i) => (
            <StatCard key={stat.title} {...stat} index={i} />
          ))}
        </section>

        {/* Filters */}
        <SearchFilters
          search={search} setSearch={setSearch}
          categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} categories={categories}
          typeFilter={typeFilter} setTypeFilter={setTypeFilter} types={types}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter} statuses={statuses}
          searchRef={searchRef}
        />

        {/* Tabs */}
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => scrollTabs(-1)} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-surface-alt hover:bg-copper/15 text-text-muted hover:text-copper transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
        <div ref={tabsRef} className="tabs-nav flex gap-0.5 sm:gap-1 rounded-2xl border border-border p-1 max-lg:landscape:p-0.5 overflow-x-auto max-w-full scrollbar-thin px-0.5 pb-0.5 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            const badge = tabBadges[tab.key];
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-2 max-lg:landscape:px-2 max-lg:landscape:py-1.5 max-lg:landscape:text-[11px] text-[12px] sm:text-[13px] font-semibold rounded-lg sm:rounded-xl transition-all duration-250 cursor-pointer shrink-0 whitespace-nowrap min-h-[40px] max-lg:landscape:min-h-[34px] touch-manipulation snap-start ${
                  isActive
                    ? 'bg-gradient-to-r from-[#1c1c2b] to-[#2a2a3d] text-white shadow-md shadow-black/25 ring-1 ring-white/10'
                    : 'text-text-muted hover:bg-surface-alt hover:text-primary'
                }`}
              >
                <tab.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-copper-light' : 'opacity-90'}`} />
                {tab.label}
                {badge != null && (
                  <span className={`tab-badge ${isActive ? 'bg-copper-light/25 text-copper-light' : 'bg-surface-alt text-text-light'}`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
          <button type="button" onClick={() => scrollTabs(1)} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-surface-alt hover:bg-copper/15 text-text-muted hover:text-copper transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tab content */}
        <div className="animate-tab-in" key={activeTab}>
          {activeTab === 'documents' && (
            <DocumentList grouped={grouped} onEdit={openEdit} onDelete={handleDelete} />
          )}
          {activeTab === 'memo' && <MemoSection documents={documents} />}
          {activeTab === 'procedures' && <GuidePage />}
          {activeTab === 'associations' && <AssociationsTab />}
          {activeTab === 'evenements' && <EvenementsTab />}
          {activeTab === 'videos' && <VideosTab />}
          {activeTab === 'comptabilite' && <ComptabiliteTab />}
          {activeTab === 'idees' && <IdeesTab />}
          {activeTab === 'affiches' && <AffichesTab />}
          {activeTab === 'stockage' && <StockageTab />}
          {activeTab === 'guide' && <GuideTab />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#1a1a2e] via-[#25253d] to-[#2f2f4a] text-white/60 border-t border-copper/15 safe-pb max-lg:landscape:py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 max-lg:landscape:py-2 max-lg:landscape:gap-2 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}logo-san-andreas.png`} alt="" className="w-8 h-8 opacity-90" />
            <div>
              <p className="text-xs font-bold" style={{ color: '#fff' }}>Portail C.E.A</p>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.7)' }}>State of San Andreas — Tous droits réservés</p>
            </div>
          </div>
          <p className="text-[10px] font-medium" style={{ color: '#d4af37' }}>Communication &bull; Événementiel &bull; Association</p>
        </div>
      </footer>

      <ScrollToTop />
      <BackgroundMusic />

      <DocumentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editingDoc={editingDoc}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
