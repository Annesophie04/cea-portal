import { useState } from 'react';
import {
  Users, Plus, Pencil, Trash2, Save, X, RotateCcw,
  User, Calendar, FileCheck, Phone, MapPin, Wallet, ExternalLink
} from 'lucide-react';
import { associations as seedAssos } from '../data/guideContent';
import { useSupabaseData } from '../hooks/useSupabaseData';

const columnMap = {
  nom: 'nom', dateCreation: 'date_creation', president: 'president',
  vicePresident: 'vice_president', tresorier: 'tresorier', telephone: 'telephone',
  siege: 'siege', contrat: 'contrat', lienContrat: 'lien_contrat',
  statut: 'statut', notes: 'notes',
};

const emptyForm = {
  nom: '', dateCreation: '', president: '', vicePresident: '', tresorier: '',
  contrat: '', lienContrat: '', statut: 'Actif', telephone: '', siege: '', notes: '',
};

export default function AssociationsTab() {
  const { items, add, update, remove, reset, loading } = useSupabaseData('associations', seedAssos, { columnMap });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedAsso, setSelectedAsso] = useState(null);

  const startEdit = (item) => { setEditing(item.id); setForm({ ...emptyForm, ...item }); setSelectedAsso(null); };
  const startAdd = () => { setEditing('new'); setForm(emptyForm); setSelectedAsso(null); };
  const cancel = () => { setEditing(null); setForm(emptyForm); };
  const save = () => {
    if (!form.nom?.trim()) return;
    if (editing === 'new') add(form);
    else update(editing, form);
    cancel();
  };
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const actives = items.filter(a => a.statut === 'Actif').length;
  const enCours = items.filter(a => a.statut === 'En cours').length;

  if (loading) return <div className="text-center py-16 text-text-muted">Chargement...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-light uppercase tracking-wider">Total</p>
          <p className="text-3xl font-extrabold text-primary mt-1">{items.length}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-light uppercase tracking-wider">Actives</p>
          <p className="text-3xl font-extrabold text-success mt-1">{actives}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-light uppercase tracking-wider">En cours</p>
          <p className="text-3xl font-extrabold text-copper mt-1">{enCours}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-light uppercase tracking-wider">Dissoutes</p>
          <p className="text-3xl font-extrabold text-danger mt-1">{items.filter(a => a.statut === 'Dissous').length}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={startAdd} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all duration-200 cursor-pointer shadow-md shadow-copper/20 hover:-translate-y-0.5">
          <Plus className="w-4 h-4" /> Ajouter une association
        </button>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-copper/30 text-copper hover:bg-copper/8 transition-colors cursor-pointer">
          <RotateCcw className="w-4 h-4" /> Réinitialiser
        </button>
      </div>

      {/* Form */}
      {editing !== null && (
        <div className="bg-card border-2 border-copper/30 rounded-2xl p-6 shadow-lg animate-slide-up">
          <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-copper" />
            {editing === 'new' ? 'Nouvelle association' : `Modifier — ${form.nom}`}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Nom *', key: 'nom', ph: "Nom de l'association" },
              { label: 'Date de création', key: 'dateCreation', ph: 'JJ/MM/AAAA' },
              { label: 'Président', key: 'president', ph: 'Prénom NOM' },
              { label: 'Vice-président', key: 'vicePresident', ph: 'Prénom NOM' },
              { label: 'Trésorier', key: 'tresorier', ph: 'Prénom NOM' },
              { label: 'Téléphone', key: 'telephone', ph: '555-0100' },
              { label: 'Siège', key: 'siege', ph: 'Adresse ou lieu' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">{f.label}</label>
                <input
                  type="text" value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
                  placeholder={f.ph}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Contrat</label>
              <input
                type="text" value={form.contrat || ''} onChange={e => set('contrat', e.target.value)}
                placeholder="Statut du contrat"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Lien du contrat</label>
              <input
                type="url" value={form.lienContrat || ''} onChange={e => set('lienContrat', e.target.value)}
                placeholder="https://docs.google.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Statut</label>
              <select value={form.statut || 'Actif'} onChange={e => set('statut', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface cursor-pointer transition-colors">
                <option value="Actif">Actif</option>
                <option value="En cours">En cours</option>
                <option value="Dissous">Dissous</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Notes</label>
              <textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={2}
                placeholder="Notes internes..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all resize-y"
              />
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

      {/* Cards grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {items.map((asso) => (
          <div
            key={asso.id}
            className={`bg-card rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer ${
              selectedAsso === asso.id ? 'border-copper ring-2 ring-copper/20' : 'border-border'
            }`}
            onClick={() => setSelectedAsso(selectedAsso === asso.id ? null : asso.id)}
          >
            {/* Status bar */}
            <div className={`h-1 ${
              asso.statut === 'Actif' ? 'bg-gradient-to-r from-[#2d7a4f] to-[#3d9963]' :
              asso.statut === 'Dissous' ? 'bg-gradient-to-r from-danger to-red-400' :
              'bg-gradient-to-r from-copper to-gold-light'
            }`} />

            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-base font-extrabold text-primary">{asso.nom}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3 h-3 text-text-light" />
                    <span className="text-xs text-text-light">Créée le {asso.dateCreation}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  asso.statut === 'Actif' ? 'bg-green-50 text-success' :
                  asso.statut === 'Dissous' ? 'bg-red-50 text-danger' :
                  'bg-orange-50 text-copper'
                }`}>{asso.statut}</span>
              </div>

              {/* Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-3.5 h-3.5 text-copper" />
                  <span className="text-text-muted"><strong className="text-primary">Président :</strong> {asso.president}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-3.5 h-3.5 text-text-light" />
                  <span className="text-text-muted"><strong className="text-primary">Vice :</strong> {asso.vicePresident}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Wallet className="w-3.5 h-3.5 text-copper" />
                  <span className="text-text-muted"><strong className="text-primary">Trésorier :</strong> {asso.tresorier || <span className="italic text-text-light">Non défini</span>}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileCheck className="w-3.5 h-3.5 text-text-light" />
                  <span className="text-text-muted text-xs">{asso.contrat}</span>
                  {asso.lienContrat && (
                    <a
                      href={asso.lienContrat}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-lg bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all shadow-sm hover:shadow-md"
                    >
                      <ExternalLink className="w-3 h-3" /> Voir
                    </a>
                  )}
                </div>
                {asso.telephone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3.5 h-3.5 text-copper" />
                    <span className="font-semibold text-primary">{asso.telephone}</span>
                  </div>
                )}
                {asso.siege && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-text-light" />
                    <span className="text-text-muted">{asso.siege}</span>
                  </div>
                )}
              </div>

              {/* Expanded details */}
              {selectedAsso === asso.id && asso.notes && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs font-semibold text-text-light uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-text-muted">{asso.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-border/40">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); startEdit(asso); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-muted hover:bg-surface-alt hover:border-primary/20 transition-all cursor-pointer"
                >
                  <Pencil className="w-3 h-3" /> Modifier
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); if (window.confirm(`Supprimer « ${asso.nom} » ?`)) remove(asso.id); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-danger/20 text-danger hover:bg-red-50 hover:border-danger/40 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <Users className="w-10 h-10 text-text-light mx-auto mb-3" />
          <p className="text-text-muted font-semibold">Aucune association enregistrée</p>
          <p className="text-text-light text-sm mt-1">Clique sur "Ajouter une association" pour commencer.</p>
        </div>
      )}
    </div>
  );
}
