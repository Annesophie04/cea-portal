import { useState } from 'react';
import { Lightbulb, Plus, Trash2, Pencil, Save, X, Star, Tag } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';

const emptyForm = { titre: '', contenu: '', categorie: 'Général', priorite: 'Normale' };
const CATEGORIES = ['Général', 'Communication', 'Événementiel', 'Associations', 'Amélioration', 'Projet'];
const PRIORITES = ['Basse', 'Normale', 'Haute', 'Urgente'];
const columnMap = { titre: 'titre', contenu: 'contenu', categorie: 'categorie', priorite: 'priorite', dateAjout: 'date_ajout' };

export default function IdeesTab() {
  const { items, add, update, remove } = useSupabaseData('idees', [], { columnMap });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterCat, setFilterCat] = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const startAdd = () => { setEditing('new'); setForm(emptyForm); };
  const startEdit = (item) => { setEditing(item.id); setForm({ ...emptyForm, ...item }); };
  const cancel = () => { setEditing(null); setForm(emptyForm); };
  const save = () => {
    if (!form.titre?.trim()) return;
    if (editing === 'new') add({ ...form, dateAjout: new Date().toLocaleDateString('fr-FR') });
    else update(editing, form);
    cancel();
  };

  const filtered = filterCat ? items.filter(i => i.categorie === filterCat) : items;

  const prioriteColor = (p) => {
    switch (p) {
      case 'Urgente': return 'bg-red-50 text-danger';
      case 'Haute': return 'bg-orange-50 text-copper';
      case 'Normale': return 'bg-blue-50 text-blue-600';
      case 'Basse': return 'bg-surface text-text-muted';
      default: return 'bg-surface text-text-muted';
    }
  };
  const prioriteBorder = (p) => {
    switch (p) {
      case 'Urgente': return 'border-l-4 border-l-danger';
      case 'Haute': return 'border-l-4 border-l-copper';
      case 'Normale': return 'border-l-4 border-l-blue-400';
      case 'Basse': return 'border-l-4 border-l-border';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-primary flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-copper" /> Idées
          </h2>
          <p className="text-sm text-text-muted mt-1">{items.length} idée{items.length > 1 ? 's' : ''} notée{items.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border text-sm bg-surface cursor-pointer">
            <option value="">Toutes catégories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={startAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md shadow-copper/20 hover:-translate-y-0.5">
            <Plus className="w-4 h-4" /> Nouvelle idée
          </button>
        </div>
      </div>

      {editing !== null && (
        <div className="bg-card border-2 border-copper/30 rounded-2xl p-6 shadow-lg animate-slide-up">
          <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-copper" />
            {editing === 'new' ? 'Nouvelle idée' : `Modifier — ${form.titre}`}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Titre *</label>
              <input type="text" value={form.titre} onChange={e => set('titre', e.target.value)} placeholder="Résumé de l'idée"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">Catégorie</label>
                <select value={form.categorie} onChange={e => set('categorie', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface cursor-pointer transition-colors">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">Priorité</label>
                <select value={form.priorite} onChange={e => set('priorite', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface cursor-pointer transition-colors">
                  {PRIORITES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Détails</label>
              <textarea value={form.contenu} onChange={e => set('contenu', e.target.value)} rows={4} placeholder="Décris ton idée en détail..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all resize-y" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md">
              <Save className="w-4 h-4" /> Enregistrer
            </button>
            <button onClick={cancel} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-xl border border-border text-text-muted hover:bg-surface-alt transition-colors cursor-pointer">
              <X className="w-4 h-4" /> Annuler
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((idee) => (
          <div key={idee.id} className={`bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${prioriteBorder(idee.priorite)}`}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-base font-extrabold text-primary">{idee.titre}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${prioriteColor(idee.priorite)}`}>
                      {idee.priorite === 'Urgente' && <Star className="w-2.5 h-2.5 inline mr-0.5" />}
                      {idee.priorite}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface text-text-muted flex items-center gap-0.5">
                      <Tag className="w-2.5 h-2.5" /> {idee.categorie}
                    </span>
                  </div>
                  {idee.contenu && <p className="text-sm text-text-muted mt-2 whitespace-pre-line">{idee.contenu}</p>}
                  <p className="text-[10px] text-text-light mt-2">Ajoutée le {idee.dateAjout}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                <button onClick={() => startEdit(idee)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-muted hover:bg-surface-alt transition-all cursor-pointer">
                  <Pencil className="w-3 h-3" /> Modifier
                </button>
                <button onClick={() => { if (window.confirm(`Supprimer « ${idee.titre} » ?`)) remove(idee.id); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-danger/20 text-danger hover:bg-red-50 transition-all cursor-pointer">
                  <Trash2 className="w-3 h-3" /> Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <Lightbulb className="w-10 h-10 text-text-light mx-auto mb-3" />
          <p className="text-text-muted font-semibold">Aucune idée notée</p>
          <p className="text-text-light text-sm mt-1">Clique sur "Nouvelle idée" pour commencer à noter tes idées.</p>
        </div>
      )}
    </div>
  );
}
