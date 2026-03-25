import { useState } from 'react';
import { CalendarDays, Plus, Trash2, Pencil, Save, X, MapPin, Wallet, Users } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';

const emptyForm = {
  titre: '', date: '', heure: '', lieu: '', description: '',
  organisateur: '', statut: 'À venir', budget: '', participants: '',
};
const STATUTS = ['À venir', 'En cours', 'Terminé', 'Annulé'];

export default function EvenementsTab() {
  const { items, add, update, remove } = useSupabaseData('evenements', []);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatut, setFilterStatut] = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const startAdd = () => { setEditing('new'); setForm(emptyForm); };
  const startEdit = (item) => { setEditing(item.id); setForm({ ...emptyForm, ...item }); };
  const cancel = () => { setEditing(null); setForm(emptyForm); };
  const save = () => {
    if (!form.titre?.trim()) return;
    if (editing === 'new') add(form);
    else update(editing, form);
    cancel();
  };

  const filtered = filterStatut ? items.filter(e => e.statut === filterStatut) : items;
  const aVenir = items.filter(e => e.statut === 'À venir').length;
  const enCours = items.filter(e => e.statut === 'En cours').length;
  const termines = items.filter(e => e.statut === 'Terminé').length;

  const statutColor = (s) => {
    switch (s) {
      case 'À venir': return 'bg-blue-50 text-blue-600';
      case 'En cours': return 'bg-orange-50 text-copper';
      case 'Terminé': return 'bg-green-50 text-success';
      case 'Annulé': return 'bg-red-50 text-danger';
      default: return 'bg-surface text-text-muted';
    }
  };
  const statutBar = (s) => {
    switch (s) {
      case 'À venir': return 'bg-gradient-to-r from-blue-400 to-blue-500';
      case 'En cours': return 'bg-gradient-to-r from-copper to-gold-light';
      case 'Terminé': return 'bg-gradient-to-r from-[#2d7a4f] to-[#3d9963]';
      case 'Annulé': return 'bg-gradient-to-r from-danger to-red-400';
      default: return 'bg-border';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-light uppercase tracking-wider">Total</p>
          <p className="text-3xl font-extrabold text-primary mt-1">{items.length}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-light uppercase tracking-wider">À venir</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">{aVenir}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-light uppercase tracking-wider">En cours</p>
          <p className="text-3xl font-extrabold text-copper mt-1">{enCours}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-light uppercase tracking-wider">Terminés</p>
          <p className="text-3xl font-extrabold text-success mt-1">{termines}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={startAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md shadow-copper/20 hover:-translate-y-0.5">
          <Plus className="w-4 h-4" /> Ajouter un événement
        </button>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border text-sm bg-surface cursor-pointer">
          <option value="">Tous statuts</option>
          {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {editing !== null && (
        <div className="bg-card border-2 border-copper/30 rounded-2xl p-6 shadow-lg animate-slide-up">
          <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-copper" />
            {editing === 'new' ? 'Nouvel événement' : `Modifier — ${form.titre}`}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Titre *</label>
              <input type="text" value={form.titre} onChange={e => set('titre', e.target.value)} placeholder="Nom de l'événement"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Date</label>
              <input type="text" value={form.date} onChange={e => set('date', e.target.value)} placeholder="JJ/MM/AAAA"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Heure</label>
              <input type="text" value={form.heure} onChange={e => set('heure', e.target.value)} placeholder="20h00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Lieu</label>
              <input type="text" value={form.lieu} onChange={e => set('lieu', e.target.value)} placeholder="Lieu de l'événement"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Organisateur</label>
              <input type="text" value={form.organisateur} onChange={e => set('organisateur', e.target.value)} placeholder="Nom de l'organisateur"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Statut</label>
              <select value={form.statut} onChange={e => set('statut', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface cursor-pointer transition-colors">
                {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Budget prévu ($)</label>
              <input type="text" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Participants estimés</label>
              <input type="text" value={form.participants} onChange={e => set('participants', e.target.value)} placeholder="Nombre"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Détails de l'événement..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all resize-y" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={save} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md">
              <Save className="w-4 h-4" /> Enregistrer
            </button>
            <button type="button" onClick={cancel} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-xl border border-border text-text-muted hover:bg-surface-alt transition-colors cursor-pointer">
              <X className="w-4 h-4" /> Annuler
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((evt) => (
          <div key={evt.id} className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className={`h-1 ${statutBar(evt.statut)}`} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-base font-extrabold text-primary">{evt.titre}</h3>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${statutColor(evt.statut)}`}>{evt.statut}</span>
              </div>
              <div className="space-y-2">
                {evt.date && (
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="w-3.5 h-3.5 text-copper" />
                    <span className="text-text-muted">{evt.date}{evt.heure ? ` à ${evt.heure}` : ''}</span>
                  </div>
                )}
                {evt.lieu && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-text-light" />
                    <span className="text-text-muted">{evt.lieu}</span>
                  </div>
                )}
                {evt.organisateur && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-3.5 h-3.5 text-copper" />
                    <span className="text-text-muted"><strong className="text-primary">Org :</strong> {evt.organisateur}</span>
                  </div>
                )}
                {evt.participants && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-3.5 h-3.5 text-text-light" />
                    <span className="text-text-muted">{evt.participants} participants</span>
                  </div>
                )}
                {evt.budget && (
                  <div className="flex items-center gap-2 text-sm">
                    <Wallet className="w-3.5 h-3.5 text-copper" />
                    <span className="text-text-muted">Budget : {evt.budget} $</span>
                  </div>
                )}
              </div>
              {evt.description && <p className="text-xs text-text-muted mt-3 line-clamp-2">{evt.description}</p>}
              <div className="flex gap-2 mt-4 pt-3 border-t border-border/40">
                <button type="button" onClick={() => startEdit(evt)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-muted hover:bg-surface-alt transition-all cursor-pointer">
                  <Pencil className="w-3 h-3" /> Modifier
                </button>
                <button type="button" onClick={() => { if (window.confirm(`Supprimer « ${evt.titre} » ?`)) remove(evt.id); }}
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
          <CalendarDays className="w-10 h-10 text-text-light mx-auto mb-3" />
          <p className="text-text-muted font-semibold">Aucun événement enregistré</p>
          <p className="text-text-light text-sm mt-1">Clique sur "Ajouter un événement" pour commencer.</p>
        </div>
      )}
    </div>
  );
}
