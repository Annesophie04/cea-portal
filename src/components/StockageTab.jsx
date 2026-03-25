import { useState, useEffect, useCallback } from 'react';
import { Database, Plus, Trash2, Save, X, ChevronDown, ChevronUp, Pencil, CheckSquare, Square, ListPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

/* ── Seed : liste Alcool pré-remplie ── */
const SEED_ALCOOL = {
  titre: 'Alcool',
  description: 'Inventaire complet des boissons alcoolisées en stock',
  couleur: 'purple',
  items: [
    { id: '1', text: 'Whisky Coca — 235x (23.5 kg)', done: false, icon: '🥃' },
    { id: '2', text: 'The Special Gal — 57x (5.7 kg)', done: false, icon: '🍸' },
    { id: '3', text: 'Cabernet Sauvignon — 1328x (132.8 kg)', done: false, icon: '🍷' },
    { id: '4', text: 'Cabernet Sauvignon — 34x (3.4 kg)', done: false, icon: '🍷' },
    { id: '5', text: 'Eau de Vie — 350x (35 kg)', done: false, icon: '🍶' },
    { id: '6', text: 'Tequila Dorada — 3x (0.3 kg)', done: false, icon: '🍹' },
    { id: '7', text: 'The Special Bat — 7x (0.7 kg)', done: false, icon: '🍸' },
    { id: '8', text: 'Billonger Bond — 66x (6.6 kg)', done: false, icon: '🍺' },
    { id: '9', text: 'Billonger Bond — 24x (2.4 kg)', done: false, icon: '🍺' },
    { id: '10', text: 'Billonger Bond — 310x (31 kg)', done: false, icon: '🍺' },
    { id: '11', text: 'Saké — 387x (38.7 kg)', done: false, icon: '🍶' },
    { id: '12', text: 'Saké — 149x (14.9 kg)', done: false, icon: '🍶' },
    { id: '13', text: 'Saké — 32x (3.2 kg)', done: false, icon: '🍶' },
    { id: '14', text: 'Bière Denvers — 195x (19.5 kg)', done: false, icon: '🍺' },
    { id: '15', text: 'Bière Denvers — 549x (54.9 kg)', done: false, icon: '🍺' },
    { id: '16', text: 'Bière Denvers R — 272x (27.2 kg)', done: false, icon: '🍺' },
    { id: '17', text: 'Bière Denvers R — 54x (5.4 kg)', done: false, icon: '🍺' },
    { id: '18', text: 'Bière Denvers P — 375x (37.5 kg)', done: false, icon: '🍺' },
    { id: '19', text: 'Bière Denvers P — 50x (5 kg)', done: false, icon: '🍺' },
    { id: '20', text: 'Bière Denvers T — 192x (19.2 kg)', done: false, icon: '🍺' },
    { id: '21', text: 'Bière Denvers T — 58x (5.8 kg)', done: false, icon: '🍺' },
    { id: '22', text: 'Ouzo — 59x (5.9 kg)', done: false, icon: '🥃' },
    { id: '23', text: 'Mojito — 931x (93.1 kg)', done: false, icon: '🍹' },
    { id: '24', text: 'The Special Mo — 214x (21.4 kg)', done: false, icon: '🍸' },
    { id: '25', text: 'The Special Tec — 10x (1 kg)', done: false, icon: '🍸' },
    { id: '26', text: 'The Special Tec — 86x (8.6 kg)', done: false, icon: '🍸' },
    { id: '27', text: 'Le Spéciale Diam — 629x (62.9 kg)', done: false, icon: '💎' },
    { id: '28', text: 'Skyy — 36x (3.6 kg)', done: false, icon: '🍸' },
    { id: '29', text: 'Skyy — 13x (1.3 kg)', done: false, icon: '🍸' },
    { id: '30', text: 'The Special Irish — 5x (0.5 kg)', done: false, icon: '☘️' },
    { id: '31', text: 'Ti Punch — 895x (89.5 kg)', done: false, icon: '🍹' },
    { id: '32', text: 'Beach House — 643x (64.3 kg)', done: false, icon: '🏖️' },
    { id: '33', text: 'Beach House — 74x (7.4 kg)', done: false, icon: '🏖️' },
    { id: '34', text: 'Bourbon Original — 2x (0.2 kg)', done: false, icon: '🥃' },
    { id: '35', text: 'Bourbon Original — 12x (1.2 kg)', done: false, icon: '🥃' },
    { id: '36', text: 'Bourbon Original — 804x (80.4 kg)', done: false, icon: '🥃' },
    { id: '37', text: 'Kentucky Peach — 134x (13.4 kg)', done: false, icon: '🍑' },
    { id: '38', text: 'The Special Yell — 34x (3.4 kg)', done: false, icon: '🍸' },
  ],
};

/* ── Seed : liste Nourriture pré-remplie ── */
const SEED_NOURRITURE = {
  titre: 'Nourriture',
  description: 'Stock alimentaire — produits et boissons non alcoolisées',
  couleur: 'orange',
  items: [
    { id: 'n1', text: 'Fynix — 1 840x (184 g)', done: false, icon: '🥤' },
    { id: 'n2', text: 'Fynix — 40x (4 g)', done: false, icon: '🥤' },
    { id: 'n3', text: 'Tiramisus — 1 197x (3.591 kg)', done: false, icon: '🍰' },
    { id: 'n4', text: 'Fruits — 1x (0.1 g)', done: false, icon: '🍇' },
    { id: 'n5', text: 'Frappuccino — 49x (49 g)', done: false, icon: '☕' },
    { id: 'n6', text: 'Jus d\'orange — 13 095x (1.31 kg)', done: false, icon: '🍊' },
    { id: 'n7', text: 'Carpaccio de saumon — 17x (34 g)', done: false, icon: '🐟' },
    { id: 'n8', text: 'Jus de Cerises — 5 458x (545.8 g)', done: false, icon: '🍒' },
    { id: 'n9', text: 'Lasagne — 229x (687 g)', done: false, icon: '🍝' },
    { id: 'n10', text: 'Eau — 5x (0.5 g)', done: false, icon: '💧' },
    { id: 'n11', text: 'Frites — 630x (63 g)', done: false, icon: '🍟' },
  ],
};

/* ── Seed : liste Surplus pré-remplie ── */
const SEED_SURPLUS = {
  titre: 'Surplus',
  description: 'Stock surplus — produits divers en réserve',
  couleur: 'green',
  items: [
    { id: 's1', text: 'Purple Queen — 32x (3.2 g)', done: false, icon: '🌿' },
    { id: 's2', text: 'Critical Kush — 70x (7 g)', done: false, icon: '🌿' },
    { id: 's3', text: 'Monster Royal G — 17x (1.7 g)', done: false, icon: '🌿' },
    { id: 's4', text: 'Lemon Haze — 20x (2 g)', done: false, icon: '🌿' },
    { id: 's5', text: 'Journaux — 1x (50 g)', done: false, icon: '📰' },
    { id: 's6', text: 'Northern Light — 23x (2.3 g)', done: false, icon: '🌿' },
    { id: 's7', text: 'Lingette anti-graisse — 1x (0.1 g)', done: false, icon: '🧻' },
    { id: 's8', text: 'Royal Gorilla — 40x (4 g)', done: false, icon: '🌿' },
  ],
};

const SEED_LISTS = [SEED_ALCOOL, SEED_NOURRITURE, SEED_SURPLUS];

const COLORS = [
  { name: 'Bleu', value: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dark: 'dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' },
  { name: 'Vert', value: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dark: 'dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400' },
  { name: 'Orange', value: 'orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dark: 'dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400' },
  { name: 'Violet', value: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dark: 'dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400' },
  { name: 'Rouge', value: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dark: 'dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400' },
  { name: 'Cuivre', value: 'copper', bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', dark: 'dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' },
];

function getColor(value) {
  return COLORS.find(c => c.value === value) || COLORS[0];
}

export default function StockageTab() {
  const [lists, setLists] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [listForm, setListForm] = useState({ titre: '', description: '', couleur: 'blue' });
  const [editingListId, setEditingListId] = useState(null);
  const [expandedList, setExpandedList] = useState(null);
  const [newItemText, setNewItemText] = useState({});

  // Load lists from Supabase + seed listes manquantes
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('stockage_listes')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) {
        const existingTitles = new Set(data.map(l => l.titre));
        const missing = SEED_LISTS.filter(s => !existingTitles.has(s.titre));
        if (missing.length > 0) {
          const { data: seeded, error } = await supabase
            .from('stockage_listes')
            .insert(missing)
            .select();
          if (!error && seeded) {
            setLists([...seeded, ...data]);
            return;
          }
        }
        setLists(data);
      }
    })();
  }, []);

  const cancelForm = () => {
    setShowForm(false);
    setListForm({ titre: '', description: '', couleur: 'blue' });
    setEditingListId(null);
  };

  const saveList = useCallback(async () => {
    if (!listForm.titre?.trim()) return;

    if (editingListId) {
      const { data, error } = await supabase
        .from('stockage_listes')
        .update({
          titre: listForm.titre,
          description: listForm.description,
          couleur: listForm.couleur,
        })
        .eq('id', editingListId)
        .select();
      if (!error && data) {
        setLists(prev => prev.map(l => l.id === editingListId ? data[0] : l));
        cancelForm();
      }
    } else {
      const { data, error } = await supabase
        .from('stockage_listes')
        .insert({
          titre: listForm.titre,
          description: listForm.description,
          couleur: listForm.couleur,
          items: [],
        })
        .select();
      if (!error && data) {
        setLists(prev => [data[0], ...prev]);
        cancelForm();
        setExpandedList(data[0].id);
      }
    }
  }, [listForm, editingListId]);

  const deleteList = useCallback(async (id) => {
    if (!window.confirm('Supprimer cette liste et tous ses éléments ?')) return;
    const { error } = await supabase.from('stockage_listes').delete().eq('id', id);
    if (!error) setLists(prev => prev.filter(l => l.id !== id));
  }, []);

  const openEditList = (list) => {
    setListForm({ titre: list.titre, description: list.description || '', couleur: list.couleur || 'blue' });
    setEditingListId(list.id);
    setShowForm(true);
  };

  // Item operations
  const addItem = useCallback(async (listId) => {
    const text = newItemText[listId]?.trim();
    if (!text) return;

    const list = lists.find(l => l.id === listId);
    if (!list) return;

    const currentItems = list.items || [];
    const newItem = { id: Date.now().toString(), text, done: false };
    const updatedItems = [...currentItems, newItem];

    const { data, error } = await supabase
      .from('stockage_listes')
      .update({ items: updatedItems })
      .eq('id', listId)
      .select();

    if (!error && data) {
      setLists(prev => prev.map(l => l.id === listId ? data[0] : l));
      setNewItemText(prev => ({ ...prev, [listId]: '' }));
    }
  }, [lists, newItemText]);

  const toggleItem = useCallback(async (listId, itemId) => {
    const list = lists.find(l => l.id === listId);
    if (!list) return;

    const updatedItems = (list.items || []).map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );

    const { data, error } = await supabase
      .from('stockage_listes')
      .update({ items: updatedItems })
      .eq('id', listId)
      .select();

    if (!error && data) {
      setLists(prev => prev.map(l => l.id === listId ? data[0] : l));
    }
  }, [lists]);

  const removeItem = useCallback(async (listId, itemId) => {
    const list = lists.find(l => l.id === listId);
    if (!list) return;

    const updatedItems = (list.items || []).filter(item => item.id !== itemId);

    const { data, error } = await supabase
      .from('stockage_listes')
      .update({ items: updatedItems })
      .eq('id', listId)
      .select();

    if (!error && data) {
      setLists(prev => prev.map(l => l.id === listId ? data[0] : l));
    }
  }, [lists]);

  const editItem = useCallback(async (listId, itemId, newText) => {
    if (!newText?.trim()) return;
    const list = lists.find(l => l.id === listId);
    if (!list) return;

    const updatedItems = (list.items || []).map(item =>
      item.id === itemId ? { ...item, text: newText } : item
    );

    const { data, error } = await supabase
      .from('stockage_listes')
      .update({ items: updatedItems })
      .eq('id', listId)
      .select();

    if (!error && data) {
      setLists(prev => prev.map(l => l.id === listId ? data[0] : l));
    }
  }, [lists]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-primary flex items-center gap-2">
            <Database className="w-6 h-6 text-copper" /> Stockage
          </h2>
          <p className="text-sm text-text-muted mt-1">
            {lists.length} liste{lists.length > 1 ? 's' : ''} — Organisez vos informations en listes personnalisées
          </p>
        </div>
        <button onClick={() => { cancelForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md shadow-copper/20 hover:-translate-y-0.5">
          <Plus className="w-4 h-4" /> Nouvelle liste
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border-2 border-copper/30 rounded-2xl p-6 shadow-lg animate-slide-up">
          <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-copper" /> {editingListId ? 'Modifier la liste' : 'Nouvelle liste'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Nom de la liste *</label>
              <input type="text" value={listForm.titre} onChange={e => setListForm(f => ({ ...f, titre: e.target.value }))}
                placeholder="Ex: Matériel à acheter, Contacts, Todo..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Couleur</label>
              <div className="flex gap-2 mt-1">
                {COLORS.map(c => (
                  <button key={c.value} type="button" onClick={() => setListForm(f => ({ ...f, couleur: c.value }))}
                    className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${c.bg} ${c.dark} ${
                      listForm.couleur === c.value ? 'ring-2 ring-copper ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.name} />
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Description (optionnelle)</label>
              <input type="text" value={listForm.description} onChange={e => setListForm(f => ({ ...f, description: e.target.value }))}
                placeholder="À quoi sert cette liste..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={saveList} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md">
              <Save className="w-4 h-4" /> {editingListId ? 'Modifier' : 'Créer'}
            </button>
            <button onClick={cancelForm} className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-xl border border-border text-text-muted hover:bg-surface-alt transition-colors cursor-pointer">
              <X className="w-4 h-4" /> Annuler
            </button>
          </div>
        </div>
      )}

      {/* Lists */}
      <div className="space-y-4">
        {lists.map(list => {
          const color = getColor(list.couleur);
          const items = list.items || [];
          const doneCount = items.filter(i => i.done).length;
          const isExpanded = expandedList === list.id;

          return (
            <div key={list.id} className={`bg-card rounded-2xl border shadow-sm overflow-hidden transition-all ${color.border} ${color.dark}`}>
              {/* List header */}
              <button
                onClick={() => setExpandedList(isExpanded ? null : list.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-alt/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-3 h-8 rounded-full ${color.bg} ${color.dark}`} />
                  <div className="text-left min-w-0">
                    <h3 className="text-sm font-bold text-primary truncate">{list.titre}</h3>
                    {list.description && <p className="text-[11px] text-text-muted truncate">{list.description}</p>}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface text-text-muted shrink-0">
                    {doneCount}/{items.length}
                  </span>
                  {items.length > 0 && (
                    <div className="hidden sm:flex items-center gap-1 shrink-0">
                      <div className="w-24 h-1.5 rounded-full bg-surface overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${color.bg} ${color.dark}`}
                          style={{ width: `${items.length > 0 ? (doneCount / items.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button onClick={(e) => { e.stopPropagation(); openEditList(list); }}
                    className="p-1.5 rounded-lg hover:bg-surface-alt transition-colors cursor-pointer" title="Modifier la liste">
                    <Pencil className="w-3.5 h-3.5 text-text-muted" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteList(list.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer" title="Supprimer la liste">
                    <Trash2 className="w-3.5 h-3.5 text-danger" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-text-light" /> : <ChevronDown className="w-4 h-4 text-text-light" />}
                </div>
              </button>

              {/* Expanded list content */}
              {isExpanded && (
                <div className="border-t border-border/40 px-5 py-4 space-y-2">
                  {/* Add item input */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newItemText[list.id] || ''}
                      onChange={e => setNewItemText(prev => ({ ...prev, [list.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') addItem(list.id); }}
                      placeholder="Ajouter un élément..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all"
                    />
                    <button onClick={() => addItem(list.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-sm">
                      <ListPlus className="w-4 h-4" /> Ajouter
                    </button>
                  </div>

                  {/* Items */}
                  {items.length === 0 ? (
                    <p className="text-center text-text-light text-sm py-6">Liste vide — ajoute des éléments ci-dessus</p>
                  ) : (
                    <div className="space-y-1">
                      {items.map(item => (
                        <ListItem
                          key={item.id}
                          item={item}
                          listId={list.id}
                          color={color}
                          onToggle={toggleItem}
                          onRemove={removeItem}
                          onEdit={editItem}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lists.length === 0 && !showForm && (
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <Database className="w-10 h-10 text-text-light mx-auto mb-3" />
          <p className="text-text-muted font-semibold">Aucune liste créée</p>
          <p className="text-text-light text-sm mt-1">Clique sur "Nouvelle liste" pour organiser tes informations.</p>
        </div>
      )}
    </div>
  );
}

function ListItem({ item, listId, color, onToggle, onRemove, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);

  const save = () => {
    if (editText.trim() && editText !== item.text) {
      onEdit(listId, item.id, editText);
    }
    setEditing(false);
  };

  return (
    <div className={`group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-alt/50 transition-colors ${
      item.done ? 'opacity-60' : ''
    }`}>
      <button onClick={() => onToggle(listId, item.id)} className="shrink-0 cursor-pointer">
        {item.done
          ? <CheckSquare className={`w-5 h-5 ${color.text} ${color.dark}`} />
          : <Square className="w-5 h-5 text-text-light hover:text-text-muted transition-colors" />
        }
      </button>

      {item.icon && (
        <span className="text-lg shrink-0 select-none" title={item.text}>{item.icon}</span>
      )}

      {editing ? (
        <input
          type="text"
          value={editText}
          onChange={e => setEditText(e.target.value)}
          onBlur={save}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          autoFocus
          className="flex-1 px-2 py-1 rounded-lg border border-border text-sm bg-surface focus:bg-card transition-all"
        />
      ) : (
        <span
          className={`flex-1 text-sm cursor-pointer ${item.done ? 'line-through text-text-light' : 'text-primary'}`}
          onDoubleClick={() => { setEditText(item.text); setEditing(true); }}
        >
          {item.text}
        </span>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={() => { setEditText(item.text); setEditing(true); }}
          className="p-1 rounded-md hover:bg-surface-alt transition-colors cursor-pointer" title="Modifier">
          <Pencil className="w-3 h-3 text-text-muted" />
        </button>
        <button onClick={() => onRemove(listId, item.id)}
          className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer" title="Supprimer">
          <Trash2 className="w-3 h-3 text-danger" />
        </button>
      </div>
    </div>
  );
}
