import { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, Pencil, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

const DEFAULT_MESSAGES = [
  'Bienvenue sur le Portail C.E.A — Communication, Événementiel & Association',
];

export default function MarqueeBanner() {
  const [annonces, setAnnonces] = useState([]);
  const [editing, setEditing] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('annonces')
        .select('*')
        .eq('active', true)
        .order('created_at');
      if (!error && data?.length) setAnnonces(data);
      else setAnnonces(DEFAULT_MESSAGES.map((m, i) => ({ id: i, message: m })));
    })();
  }, []);

  const addAnnonce = async () => {
    if (!newMsg.trim()) return;
    const { data, error } = await supabase
      .from('annonces')
      .insert({ message: newMsg.trim() })
      .select();
    if (!error && data?.[0]) {
      setAnnonces(prev => [...prev, data[0]]);
      setNewMsg('');
    }
  };

  const removeAnnonce = async (id) => {
    const { error } = await supabase.from('annonces').delete().eq('id', id);
    if (!error) setAnnonces(prev => prev.filter(a => a.id !== id));
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    const { data, error } = await supabase
      .from('annonces')
      .update({ message: editText.trim() })
      .eq('id', id)
      .select();
    if (!error && data?.[0]) {
      setAnnonces(prev => prev.map(a => a.id === id ? data[0] : a));
    }
    setEditId(null);
    setEditText('');
  };

  const messages = annonces.map(a => a.message);
  const text = messages.join('  ★  ');

  return (
    <div className="marquee-container bg-gradient-to-r from-copper/15 via-gold/10 to-copper/15 dark:from-copper/10 dark:via-gold/8 dark:to-copper/10 dark:bg-[rgba(30,30,42,0.7)] border-b border-copper/20 dark:border-copper/15 overflow-hidden relative group">
      <div className="max-w-7xl mx-auto flex items-center gap-3 py-1.5 px-4">
        <button
          type="button"
          onClick={() => setEditing(!editing)}
          className="shrink-0 hover:scale-110 transition-transform"
          title="Gérer les annonces"
        >
          <Megaphone className="w-3.5 h-3.5 text-copper" />
        </button>
        <div className="overflow-hidden flex-1">
          <span className="marquee-text text-[11px] font-semibold text-text-muted">
            {text}  ★  {text}
          </span>
        </div>
      </div>

      {/* Panel d'édition */}
      {editing && (
        <div className="border-t border-copper/20 bg-card px-4 py-3 space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Gérer les annonces</p>
            <button onClick={() => setEditing(false)} className="text-text-light hover:text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Liste */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {annonces.map(a => (
              <div key={a.id} className="flex items-center gap-2 text-sm">
                {editId === a.id ? (
                  <>
                    <input
                      type="text"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEdit(a.id)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm bg-surface"
                      autoFocus
                    />
                    <button onClick={() => saveEdit(a.id)} className="text-success hover:scale-110 transition-transform">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditId(null)} className="text-text-light hover:text-danger transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-text-muted truncate">{a.message}</span>
                    <button
                      onClick={() => { setEditId(a.id); setEditText(a.message); }}
                      className="text-text-light hover:text-copper transition-colors shrink-0"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeAnnonce(a.id)}
                      className="text-text-light hover:text-danger transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Ajouter */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addAnnonce()}
              placeholder="Nouvelle annonce..."
              className="flex-1 px-3 py-2 rounded-xl border border-border text-sm bg-surface"
            />
            <button
              onClick={addAnnonce}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
