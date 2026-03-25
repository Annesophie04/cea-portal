import { useState, useEffect, useCallback } from 'react';
import {
  Package, Plus, Trash2, Save, X, Pencil, Eye, EyeOff,
  AlertTriangle, CheckCircle, Clock, Box, ChevronDown, ChevronUp,
  Calendar, DollarSign, User, MapPin,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const CATEGORIES_MATERIEL = ['Mobilier', 'Sonorisation', 'Éclairage', 'Décoration', 'Électronique', 'Structure', 'Véhicule', 'Autre'];
const ETATS = ['Neuf', 'Bon état', 'Usé', 'En réparation'];
const STATUTS_RESA = ['En attente', 'Confirmée', 'En cours', 'Rendu', 'En retard'];

const ETAT_COLORS = {
  'Neuf': 'bg-green-50 text-success border-success/30',
  'Bon état': 'bg-blue-50 text-blue-600 border-blue-300/30',
  'Usé': 'bg-orange-50 text-warning border-warning/30',
  'En réparation': 'bg-red-50 text-danger border-danger/30',
};

const STATUT_COLORS = {
  'En attente': 'bg-orange-50 text-warning border-warning/30',
  'Confirmée': 'bg-blue-50 text-blue-600 border-blue-300/30',
  'En cours': 'bg-amber-50 text-amber-700 border-amber-300/30',
  'Rendu': 'bg-green-50 text-success border-success/30',
  'En retard': 'bg-red-50 text-danger border-danger/30',
};

export default function LocationsTab() {
  const [materiels, setMateriels] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [view, setView] = useState('materiel'); // 'materiel' | 'reservations'
  const [showForm, setShowForm] = useState(false);
  const [showResaForm, setShowResaForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingResaId, setEditingResaId] = useState(null);
  const [expandedResa, setExpandedResa] = useState(null);

  const emptyMateriel = { nom: '', categorie: 'Mobilier', quantite: '1', etat: 'Bon état', description: '', prix_unitaire: '' };
  const emptyResa = { materiel_id: '', emprunteur: '', evenement: '', date_debut: '', date_fin: '', quantite: '1', prix_total: '', statut: 'En attente', notes: '' };

  const [form, setForm] = useState(emptyMateriel);
  const [resaForm, setResaForm] = useState(emptyResa);

  useEffect(() => {
    (async () => {
      const { data: mats } = await supabase.from('location_materiels').select('*').order('nom');
      if (mats) setMateriels(mats);
      const { data: resas } = await supabase.from('location_reservations').select('*').order('date_debut', { ascending: false });
      if (resas) setReservations(resas);
    })();
  }, []);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const setResa = (k, v) => setResaForm(prev => ({ ...prev, [k]: v }));

  // --- Matériel CRUD ---
  const cancelForm = () => { setShowForm(false); setForm(emptyMateriel); setEditingId(null); };

  const saveMateriel = useCallback(async () => {
    if (!form.nom?.trim()) return;
    const payload = {
      nom: form.nom,
      categorie: form.categorie,
      quantite: parseInt(form.quantite) || 1,
      etat: form.etat,
      description: form.description,
      prix_unitaire: parseFloat(form.prix_unitaire) || 0,
    };

    if (editingId) {
      const { data, error } = await supabase.from('location_materiels').update(payload).eq('id', editingId).select();
      if (!error && data) { setMateriels(prev => prev.map(m => m.id === editingId ? data[0] : m)); cancelForm(); }
    } else {
      const { data, error } = await supabase.from('location_materiels').insert(payload).select();
      if (!error && data) { setMateriels(prev => [...prev, data[0]]); cancelForm(); }
    }
  }, [form, editingId]);

  const deleteMateriel = useCallback(async (id) => {
    if (!window.confirm('Supprimer ce matériel ?')) return;
    const { error } = await supabase.from('location_materiels').delete().eq('id', id);
    if (!error) setMateriels(prev => prev.filter(m => m.id !== id));
  }, []);

  const openEditMateriel = (m) => {
    setForm({ nom: m.nom, categorie: m.categorie, quantite: String(m.quantite), etat: m.etat, description: m.description || '', prix_unitaire: String(m.prix_unitaire || '') });
    setEditingId(m.id);
    setShowForm(true);
  };

  // --- Réservations CRUD ---
  const cancelResaForm = () => { setShowResaForm(false); setResaForm(emptyResa); setEditingResaId(null); };

  const saveResa = useCallback(async () => {
    if (!resaForm.materiel_id || !resaForm.emprunteur?.trim()) return;
    const payload = {
      materiel_id: resaForm.materiel_id,
      materiel_nom: materiels.find(m => m.id === resaForm.materiel_id)?.nom || '',
      emprunteur: resaForm.emprunteur,
      evenement: resaForm.evenement,
      date_debut: resaForm.date_debut,
      date_fin: resaForm.date_fin,
      quantite: parseInt(resaForm.quantite) || 1,
      prix_total: parseFloat(resaForm.prix_total) || 0,
      statut: resaForm.statut,
      notes: resaForm.notes,
    };

    if (editingResaId) {
      const { data, error } = await supabase.from('location_reservations').update(payload).eq('id', editingResaId).select();
      if (!error && data) { setReservations(prev => prev.map(r => r.id === editingResaId ? data[0] : r)); cancelResaForm(); }
    } else {
      const { data, error } = await supabase.from('location_reservations').insert(payload).select();
      if (!error && data) { setReservations(prev => [data[0], ...prev]); cancelResaForm(); }
    }
  }, [resaForm, editingResaId, materiels]);

  const deleteResa = useCallback(async (id) => {
    if (!window.confirm('Supprimer cette réservation ?')) return;
    const { error } = await supabase.from('location_reservations').delete().eq('id', id);
    if (!error) setReservations(prev => prev.filter(r => r.id !== id));
  }, []);

  const openEditResa = (r) => {
    setResaForm({
      materiel_id: r.materiel_id || '',
      emprunteur: r.emprunteur,
      evenement: r.evenement || '',
      date_debut: r.date_debut || '',
      date_fin: r.date_fin || '',
      quantite: String(r.quantite || 1),
      prix_total: String(r.prix_total || ''),
      statut: r.statut || 'En attente',
      notes: r.notes || '',
    });
    setEditingResaId(r.id);
    setShowResaForm(true);
  };

  // Stats
  const enCours = reservations.filter(r => r.statut === 'En cours').length;
  const enRetard = reservations.filter(r => r.statut === 'En retard').length;
  const totalRevenus = reservations.filter(r => r.statut === 'Rendu' || r.statut === 'En cours').reduce((s, r) => s + (parseFloat(r.prix_total) || 0), 0);

  // Quantité en location pour un matériel
  const getEnLocation = (matId) => {
    return reservations
      .filter(r => r.materiel_id === matId && (r.statut === 'En cours' || r.statut === 'Confirmée'))
      .reduce((s, r) => s + (parseInt(r.quantite) || 0), 0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-primary flex items-center gap-2">
            <Package className="w-6 h-6 text-copper" /> Locations
          </h2>
          <p className="text-sm text-text-muted mt-1">Gestion du matériel et des réservations pour les événements</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-light uppercase tracking-wider flex items-center gap-1.5"><Box className="w-3.5 h-3.5" /> Matériels</p>
          <p className="text-3xl font-extrabold text-primary mt-1">{materiels.length}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-light uppercase tracking-wider flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> En location</p>
          <p className="text-3xl font-extrabold text-copper mt-1">{enCours}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-light uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> En retard</p>
          <p className="text-3xl font-extrabold text-danger mt-1">{enRetard}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-light uppercase tracking-wider flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Revenus</p>
          <p className="text-3xl font-extrabold text-success mt-1">{totalRevenus.toLocaleString('fr-FR')} $</p>
        </div>
      </div>

      {/* Tab switch */}
      <div className="flex gap-2">
        <button onClick={() => setView('materiel')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
            view === 'materiel'
              ? 'bg-gradient-to-r from-[#1c1c2b] to-[#2a2a3d] text-white shadow-md'
              : 'bg-surface border border-border text-text-muted hover:bg-surface-alt'
          }`}>
          <Box className="w-4 h-4" /> Matériel ({materiels.length})
        </button>
        <button onClick={() => setView('reservations')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
            view === 'reservations'
              ? 'bg-gradient-to-r from-[#1c1c2b] to-[#2a2a3d] text-white shadow-md'
              : 'bg-surface border border-border text-text-muted hover:bg-surface-alt'
          }`}>
          <Calendar className="w-4 h-4" /> Réservations ({reservations.length})
        </button>
      </div>

      {/* ===== MATERIEL VIEW ===== */}
      {view === 'materiel' && (
        <>
          <button onClick={() => { cancelForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md shadow-copper/20 hover:-translate-y-0.5">
            <Plus className="w-4 h-4" /> Ajouter du matériel
          </button>

          {showForm && (
            <div className="bg-card border-2 border-copper/30 rounded-2xl p-6 shadow-lg animate-slide-up">
              <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-copper" /> {editingId ? 'Modifier le matériel' : 'Nouveau matériel'}
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Nom *</label>
                  <input type="text" value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="Ex: Barnum 3x3m"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Catégorie</label>
                  <select value={form.categorie} onChange={e => set('categorie', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface cursor-pointer">
                    {CATEGORIES_MATERIEL.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Quantité</label>
                  <input type="number" min="1" value={form.quantite} onChange={e => set('quantite', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">État</label>
                  <select value={form.etat} onChange={e => set('etat', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface cursor-pointer">
                    {ETATS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Prix unitaire ($)</label>
                  <input type="number" step="0.01" min="0" value={form.prix_unitaire} onChange={e => set('prix_unitaire', e.target.value)} placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Description</label>
                  <input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Détails..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={saveMateriel} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md">
                  <Save className="w-4 h-4" /> {editingId ? 'Modifier' : 'Enregistrer'}
                </button>
                <button onClick={cancelForm} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-xl border border-border text-text-muted hover:bg-surface-alt transition-colors cursor-pointer">
                  <X className="w-4 h-4" /> Annuler
                </button>
              </div>
            </div>
          )}

          {materiels.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {materiels.map(mat => {
                const enLoc = getEnLocation(mat.id);
                const dispo = (mat.quantite || 0) - enLoc;
                return (
                  <div key={mat.id} className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all group overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-primary truncate">{mat.nom}</h3>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface text-text-muted mt-1">{mat.categorie}</span>
                        </div>
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold border ${ETAT_COLORS[mat.etat] || 'bg-surface text-text-muted'}`}>
                          {mat.etat}
                        </span>
                      </div>

                      {mat.description && <p className="text-xs text-text-muted mt-2 line-clamp-2">{mat.description}</p>}

                      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/40">
                        <div className="text-center">
                          <p className="text-lg font-extrabold text-primary">{mat.quantite || 0}</p>
                          <p className="text-[10px] text-text-light font-semibold uppercase">Total</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-extrabold ${dispo > 0 ? 'text-success' : 'text-danger'}`}>{dispo}</p>
                          <p className="text-[10px] text-text-light font-semibold uppercase">Dispo</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-extrabold text-copper">{enLoc}</p>
                          <p className="text-[10px] text-text-light font-semibold uppercase">En loc.</p>
                        </div>
                        {mat.prix_unitaire > 0 && (
                          <div className="text-center ml-auto">
                            <p className="text-lg font-extrabold text-primary">{parseFloat(mat.prix_unitaire).toLocaleString('fr-FR')} $</p>
                            <p className="text-[10px] text-text-light font-semibold uppercase">/ unité</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                        <button onClick={() => openEditMateriel(mat)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-border text-text-muted hover:bg-surface-alt transition-all cursor-pointer">
                          <Pencil className="w-3 h-3" /> Modifier
                        </button>
                        <button onClick={() => deleteMateriel(mat.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-danger/20 text-danger hover:bg-red-50 transition-all cursor-pointer">
                          <Trash2 className="w-3 h-3" /> Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-16 text-center">
              <Package className="w-10 h-10 text-text-light mx-auto mb-3" />
              <p className="text-text-muted font-semibold">Aucun matériel enregistré</p>
              <p className="text-text-light text-sm mt-1">Ajoute du matériel pour commencer à gérer les locations.</p>
            </div>
          )}
        </>
      )}

      {/* ===== RESERVATIONS VIEW ===== */}
      {view === 'reservations' && (
        <>
          <button onClick={() => { cancelResaForm(); setShowResaForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md shadow-copper/20 hover:-translate-y-0.5">
            <Plus className="w-4 h-4" /> Nouvelle réservation
          </button>

          {showResaForm && (
            <div className="bg-card border-2 border-copper/30 rounded-2xl p-6 shadow-lg animate-slide-up">
              <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-copper" /> {editingResaId ? 'Modifier la réservation' : 'Nouvelle réservation'}
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Matériel *</label>
                  <select value={resaForm.materiel_id} onChange={e => setResa('materiel_id', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface cursor-pointer">
                    <option value="">-- Choisir --</option>
                    {materiels.map(m => <option key={m.id} value={m.id}>{m.nom} ({m.quantite - getEnLocation(m.id)} dispo)</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Emprunteur *</label>
                  <input type="text" value={resaForm.emprunteur} onChange={e => setResa('emprunteur', e.target.value)} placeholder="Nom / Organisation"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Événement</label>
                  <input type="text" value={resaForm.evenement} onChange={e => setResa('evenement', e.target.value)} placeholder="Nom de l'événement"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Date début</label>
                  <input type="text" value={resaForm.date_debut} onChange={e => setResa('date_debut', e.target.value)} placeholder="JJ/MM/AAAA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Date fin</label>
                  <input type="text" value={resaForm.date_fin} onChange={e => setResa('date_fin', e.target.value)} placeholder="JJ/MM/AAAA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Quantité</label>
                  <input type="number" min="1" value={resaForm.quantite} onChange={e => setResa('quantite', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Prix payé ($)</label>
                  <input type="number" step="0.01" min="0" value={resaForm.prix_total} onChange={e => setResa('prix_total', e.target.value)} placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Statut</label>
                  <select value={resaForm.statut} onChange={e => setResa('statut', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface cursor-pointer">
                    {STATUTS_RESA.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Notes</label>
                  <input type="text" value={resaForm.notes} onChange={e => setResa('notes', e.target.value)} placeholder="Remarques..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={saveResa} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md">
                  <Save className="w-4 h-4" /> {editingResaId ? 'Modifier' : 'Enregistrer'}
                </button>
                <button onClick={cancelResaForm} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-xl border border-border text-text-muted hover:bg-surface-alt transition-colors cursor-pointer">
                  <X className="w-4 h-4" /> Annuler
                </button>
              </div>
            </div>
          )}

          {reservations.length > 0 ? (
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#1c1c2b] to-[#2a2a3d] text-white">
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Matériel</th>
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Emprunteur</th>
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Événement</th>
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Période</th>
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Qté</th>
                      <th className="text-right px-5 py-3 text-xs font-bold uppercase tracking-wider">Prix</th>
                      <th className="text-center px-5 py-3 text-xs font-bold uppercase tracking-wider">Statut</th>
                      <th className="text-center px-5 py-3 text-xs font-bold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((resa, i) => (
                      <tr key={resa.id} className={`border-t border-border/40 hover:bg-surface-alt/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-surface/30'}`}>
                        <td className="px-5 py-3 font-semibold text-primary">{resa.materiel_nom || '—'}</td>
                        <td className="px-5 py-3 text-text-muted">
                          <span className="flex items-center gap-1.5"><User className="w-3 h-3" />{resa.emprunteur}</span>
                        </td>
                        <td className="px-5 py-3 text-text-muted text-xs">{resa.evenement || '—'}</td>
                        <td className="px-5 py-3 text-text-muted text-xs">
                          {resa.date_debut || '?'} → {resa.date_fin || '?'}
                        </td>
                        <td className="px-5 py-3 text-center font-bold text-primary">{resa.quantite}</td>
                        <td className="px-5 py-3 text-right font-bold text-copper">{parseFloat(resa.prix_total || 0).toLocaleString('fr-FR')} $</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${STATUT_COLORS[resa.statut] || 'bg-surface text-text-muted'}`}>
                            {resa.statut}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button onClick={() => openEditResa(resa)}
                              className="p-1.5 rounded-lg border border-border text-text-muted hover:bg-surface-alt transition-all cursor-pointer" title="Modifier">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button onClick={() => deleteResa(resa.id)}
                              className="p-1.5 rounded-lg border border-danger/20 text-danger hover:bg-red-50 transition-all cursor-pointer" title="Supprimer">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-16 text-center">
              <Calendar className="w-10 h-10 text-text-light mx-auto mb-3" />
              <p className="text-text-muted font-semibold">Aucune réservation</p>
              <p className="text-text-light text-sm mt-1">Crée une réservation pour suivre les locations de matériel.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
