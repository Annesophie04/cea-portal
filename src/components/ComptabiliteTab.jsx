import { useState, useEffect, useCallback } from 'react';
import { DollarSign, Plus, Trash2, Save, X, TrendingUp, TrendingDown, Wallet, ArrowUpDown, Archive, ChevronDown, ChevronUp, Calendar, Pencil } from 'lucide-react';
import { supabase } from '../lib/supabase';

const emptyForm = { libelle: '', montant: '', type: 'Dépense', categorie: 'Général', date: '', notes: '' };
const CATEGORIES_DEPENSE = ['Général', 'Événementiel', 'Communication', 'Associations', 'Location', 'Matériel', 'Autres'];

function getWeekLabel(dateStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (dt) => `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}`;
  return `Semaine du ${fmt(mon)} au ${fmt(sun)}/${year}`;
}

function getMondayISO(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export default function ComptabiliteTab() {
  const [items, setItems] = useState([]);
  const [archives, setArchives] = useState([]);
  const [weekStart, setWeekStart] = useState(getMondayISO(new Date()));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showArchives, setShowArchives] = useState(false);
  const [expandedArchive, setExpandedArchive] = useState(null);

  // Load current week + archives
  useEffect(() => {
    (async () => {
      const thisMonday = getMondayISO(new Date());
      setWeekStart(thisMonday);

      // Load current week items
      const { data: currentItems } = await supabase
        .from('comptabilite')
        .select('*')
        .eq('week_start', thisMonday);
      setItems(currentItems || []);

      // Check if there are items from previous weeks that need archiving
      const { data: oldItems } = await supabase
        .from('comptabilite')
        .select('*')
        .neq('week_start', thisMonday);

      if (oldItems && oldItems.length > 0) {
        const weeks = {};
        oldItems.forEach(item => {
          const ws = item.week_start;
          if (!weeks[ws]) weeks[ws] = [];
          weeks[ws].push(item);
        });

        for (const [ws, weekItems] of Object.entries(weeks)) {
          const depenses = weekItems.filter(i => i.type === 'Dépense').reduce((s, i) => s + (parseFloat(i.montant) || 0), 0);
          const recettes = weekItems.filter(i => i.type === 'Recette').reduce((s, i) => s + (parseFloat(i.montant) || 0), 0);

          const { data: existing } = await supabase
            .from('comptabilite_archives')
            .select('id')
            .eq('week_start', ws);

          if (!existing || existing.length === 0) {
            await supabase.from('comptabilite_archives').insert({
              week_start: ws,
              week_label: getWeekLabel(ws),
              items: weekItems,
              total_depenses: depenses,
              total_recettes: recettes,
            });
          }

          await supabase.from('comptabilite').delete().eq('week_start', ws);
        }
      }

      // Load archives
      const { data: archiveData } = await supabase
        .from('comptabilite_archives')
        .select('*')
        .order('week_start', { ascending: false });
      setArchives(archiveData || []);
    })();
  }, []);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const openEdit = (item) => {
    setForm({
      libelle: item.libelle,
      montant: String(item.montant),
      type: item.type,
      categorie: item.categorie,
      date: item.date || '',
      notes: item.notes || '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const saveItem = useCallback(async () => {
    if (!form.libelle?.trim() || !form.montant) return;

    if (editingId) {
      // Update existing
      const updated = {
        libelle: form.libelle,
        montant: parseFloat(form.montant),
        type: form.type,
        categorie: form.categorie,
        date: form.date,
        notes: form.notes,
      };
      const { data, error } = await supabase.from('comptabilite').update(updated).eq('id', editingId).select();
      if (!error && data) {
        setItems(prev => prev.map(i => i.id === editingId ? data[0] : i));
        cancelForm();
      }
    } else {
      // Insert new
      const newItem = {
        libelle: form.libelle,
        montant: parseFloat(form.montant),
        type: form.type,
        categorie: form.categorie,
        date: form.date,
        notes: form.notes,
        date_ajout: new Date().toLocaleDateString('fr-FR'),
        week_start: weekStart,
      };
      const { data, error } = await supabase.from('comptabilite').insert(newItem).select();
      if (!error && data) {
        setItems(prev => [...prev, data[0]]);
        cancelForm();
      }
    }
  }, [form, weekStart, editingId]);

  const removeItem = useCallback(async (id) => {
    const { error } = await supabase.from('comptabilite').delete().eq('id', id);
    if (!error) setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const filtered = items.filter(item => {
    if (filterType && item.type !== filterType) return false;
    if (filterCat && item.categorie !== filterCat) return false;
    return true;
  });

  const totalDepenses = items.filter(i => i.type === 'Dépense').reduce((s, i) => s + (parseFloat(i.montant) || 0), 0);
  const totalRecettes = items.filter(i => i.type === 'Recette').reduce((s, i) => s + (parseFloat(i.montant) || 0), 0);
  const solde = totalRecettes - totalDepenses;
  const totalArchiveDepenses = archives.reduce((s, a) => s + (parseFloat(a.total_depenses) || 0), 0);
  const totalArchiveRecettes = archives.reduce((s, a) => s + (parseFloat(a.total_recettes) || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Week indicator */}
      <div className="bg-gradient-to-r from-[#1c1c2b] to-[#2a2a3d] rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-copper-light" />
          <div>
            <p className="text-white font-bold text-sm">{getWeekLabel(weekStart)}</p>
            <p className="text-white/50 text-[10px]">La comptabilité se remet à zéro chaque lundi. Les semaines précédentes sont archivées.</p>
          </div>
        </div>
        {archives.length > 0 && (
          <button onClick={() => setShowArchives(!showArchives)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-all cursor-pointer">
            <Archive className="w-3.5 h-3.5" /> Archives ({archives.length})
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-light uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5" /> Opérations
          </p>
          <p className="text-3xl font-extrabold text-primary mt-1">{items.length}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-light uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" /> Dépenses
          </p>
          <p className="text-3xl font-extrabold text-danger mt-1">{totalDepenses.toLocaleString('fr-FR')} $</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-light uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Recettes
          </p>
          <p className="text-3xl font-extrabold text-success mt-1">{totalRecettes.toLocaleString('fr-FR')} $</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-light uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" /> Solde
          </p>
          <p className={`text-3xl font-extrabold mt-1 ${solde >= 0 ? 'text-success' : 'text-danger'}`}>{solde.toLocaleString('fr-FR')} $</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(!showForm); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md shadow-copper/20 hover:-translate-y-0.5">
          <Plus className="w-4 h-4" /> Ajouter une opération
        </button>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border text-sm bg-surface cursor-pointer">
          <option value="">Tous types</option>
          <option value="Dépense">Dépenses</option>
          <option value="Recette">Recettes</option>
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border text-sm bg-surface cursor-pointer">
          <option value="">Toutes catégories</option>
          {CATEGORIES_DEPENSE.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border-2 border-copper/30 rounded-2xl p-6 shadow-lg animate-slide-up">
          <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-copper" /> {editingId ? 'Modifier l\'opération' : 'Nouvelle opération'}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Libellé *</label>
              <input type="text" value={form.libelle} onChange={e => set('libelle', e.target.value)} placeholder="Description de l'opération"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Montant ($) *</label>
              <input type="number" step="0.01" min="0" value={form.montant} onChange={e => set('montant', e.target.value)} placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface cursor-pointer transition-colors">
                <option value="Dépense">Dépense</option>
                <option value="Recette">Recette</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Catégorie</label>
              <select value={form.categorie} onChange={e => set('categorie', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface cursor-pointer transition-colors">
                {CATEGORIES_DEPENSE.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Date</label>
              <input type="text" value={form.date} onChange={e => set('date', e.target.value)} placeholder="JJ/MM/AAAA"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Notes</label>
              <input type="text" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notes optionnelles..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-white transition-all" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={saveItem} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md">
              <Save className="w-4 h-4" /> {editingId ? 'Modifier' : 'Enregistrer'}
            </button>
            <button onClick={cancelForm} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-xl border border-border text-text-muted hover:bg-surface-alt transition-colors cursor-pointer">
              <X className="w-4 h-4" /> Annuler
            </button>
          </div>
        </div>
      )}

      {/* Current week table */}
      {filtered.length > 0 ? (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#1c1c2b] to-[#2a2a3d] text-white">
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">#</th>
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Libellé</th>
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Catégorie</th>
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Type</th>
                  <th className="text-right px-5 py-3 text-xs font-bold uppercase tracking-wider">Montant</th>
                  <th className="text-center px-5 py-3 text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item.id} className={`border-t border-border/40 hover:bg-surface-alt/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-surface/30'}`}>
                    <td className="px-5 py-3 text-text-light font-mono text-xs">{i + 1}</td>
                    <td className="px-5 py-3 text-text-muted text-xs">{item.date || item.date_ajout}</td>
                    <td className="px-5 py-3 font-semibold text-primary">
                      {item.libelle}
                      {item.notes && <span className="block text-[10px] text-text-light font-normal">{item.notes}</span>}
                    </td>
                    <td className="px-5 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface text-text-muted">{item.categorie}</span></td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${item.type === 'Recette' ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className={`px-5 py-3 text-right font-bold ${item.type === 'Recette' ? 'text-success' : 'text-danger'}`}>
                      {item.type === 'Recette' ? '+' : '-'}{parseFloat(item.montant)?.toLocaleString('fr-FR')} $
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button onClick={() => openEdit(item)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-border text-text-muted hover:bg-surface-alt transition-all cursor-pointer"
                          title="Modifier">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => { if (window.confirm(`Supprimer « ${item.libelle} » ?`)) removeItem(item.id); }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-danger/20 text-danger hover:bg-red-50 transition-all cursor-pointer"
                          title="Supprimer">
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
          <DollarSign className="w-10 h-10 text-text-light mx-auto mb-3" />
          <p className="text-text-muted font-semibold">Aucune opération cette semaine</p>
          <p className="text-text-light text-sm mt-1">La comptabilité de cette semaine est vide. Ajoute une opération pour commencer.</p>
        </div>
      )}

      {/* Archives */}
      {showArchives && archives.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-primary flex items-center gap-2">
              <Archive className="w-5 h-5 text-copper" /> Historique des semaines
            </h3>
            <div className="text-xs text-text-muted">
              Total archivé : <span className="text-danger font-bold">{totalArchiveDepenses.toLocaleString('fr-FR')} $</span> dépensés
              {totalArchiveRecettes > 0 && <> / <span className="text-success font-bold">{totalArchiveRecettes.toLocaleString('fr-FR')} $</span> recettes</>}
            </div>
          </div>

          {archives.map((archive, ai) => {
            const archiveItems = archive.items || [];
            return (
              <div key={archive.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedArchive(expandedArchive === ai ? null : ai)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-alt/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-copper" />
                    <span className="text-sm font-bold text-primary">{archive.week_label}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface text-text-muted">{archiveItems.length} opération{archiveItems.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-danger">-{parseFloat(archive.total_depenses).toLocaleString('fr-FR')} $</span>
                    {parseFloat(archive.total_recettes) > 0 && <span className="text-sm font-bold text-success">+{parseFloat(archive.total_recettes).toLocaleString('fr-FR')} $</span>}
                    {expandedArchive === ai ? <ChevronUp className="w-4 h-4 text-text-light" /> : <ChevronDown className="w-4 h-4 text-text-light" />}
                  </div>
                </button>

                {expandedArchive === ai && (
                  <div className="border-t border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-surface">
                          <th className="text-left px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-text-light">#</th>
                          <th className="text-left px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-text-light">Date</th>
                          <th className="text-left px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-text-light">Libellé</th>
                          <th className="text-left px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-text-light">Catégorie</th>
                          <th className="text-left px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-text-light">Type</th>
                          <th className="text-right px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-text-light">Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {archiveItems.map((item, i) => (
                          <tr key={item.id || i} className={`border-t border-border/30 ${i % 2 === 0 ? 'bg-white' : 'bg-surface/20'}`}>
                            <td className="px-5 py-2.5 text-text-light font-mono text-xs">{i + 1}</td>
                            <td className="px-5 py-2.5 text-text-muted text-xs">{item.date || item.date_ajout}</td>
                            <td className="px-5 py-2.5 font-semibold text-primary text-xs">
                              {item.libelle}
                              {item.notes && <span className="block text-[10px] text-text-light font-normal">{item.notes}</span>}
                            </td>
                            <td className="px-5 py-2.5"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface text-text-muted">{item.categorie}</span></td>
                            <td className="px-5 py-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.type === 'Recette' ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'}`}>
                                {item.type}
                              </span>
                            </td>
                            <td className={`px-5 py-2.5 text-right font-bold text-xs ${item.type === 'Recette' ? 'text-success' : 'text-danger'}`}>
                              {item.type === 'Recette' ? '+' : '-'}{parseFloat(item.montant)?.toLocaleString('fr-FR')} $
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
