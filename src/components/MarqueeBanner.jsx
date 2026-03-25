import { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, Pencil, X, Check, Sparkles, Shield, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

const DEFAULT_MESSAGES = [
  { text: 'Bienvenue sur le portail officiel C.E.A — Au service de San Andreas', icon: 'shield' },
  { text: 'Documents, événements, associations — Tout votre pôle réuni en un seul espace', icon: 'zap' },
  { text: 'Chaque action compte — Construisons ensemble l\'avenir de San Andreas', icon: 'sparkle' },
  { text: 'Nouveau : exportez vos documents en PDF et Word en un clic', icon: 'zap' },
  { text: 'Restez organisés — Mettez à jour vos fiches pour une meilleure coordination', icon: 'shield' },
];

const ICON_MAP = {
  shield: Shield,
  zap: Zap,
  sparkle: Sparkles,
};

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
      else setAnnonces(DEFAULT_MESSAGES.map((m, i) => ({ id: i, message: m.text, icon: m.icon })));
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

  const renderSeparator = (key) => (
    <span key={`sep-${key}`} className="marquee-separator">
      <span className="marquee-diamond" />
    </span>
  );

  const renderMessage = (a, idx) => {
    const IconComp = ICON_MAP[a.icon] || Sparkles;
    return (
      <span key={`msg-${idx}`} className="marquee-item">
        <IconComp className="w-3 h-3 marquee-item-icon" />
        <span>{a.message}</span>
      </span>
    );
  };

  const items = annonces.flatMap((a, i) => [
    renderMessage(a, i),
    renderSeparator(i),
  ]);

  return (
    <div className="marquee-banner-wrap">
      <div className="marquee-banner-inner">
        {/* Bouton édition */}
        <button
          type="button"
          onClick={() => setEditing(!editing)}
          className="marquee-edit-btn"
          title="Gérer les annonces"
        >
          <Megaphone className="w-3.5 h-3.5" />
        </button>

        {/* Piste défilante */}
        <div className="marquee-track">
          <div className="marquee-scroll">
            <div className="marquee-content">{items}</div>
            <div className="marquee-content" aria-hidden="true">{items}</div>
          </div>
        </div>
      </div>

      {/* Panel d'édition */}
      {editing && (
        <div className="marquee-edit-panel animate-slide-up">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-copper" />
              Gérer les annonces
            </p>
            <button onClick={() => setEditing(false)} className="text-text-light hover:text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Liste */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {annonces.map(a => (
              <div key={a.id} className="marquee-edit-row">
                {editId === a.id ? (
                  <>
                    <input
                      type="text"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEdit(a.id)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm bg-surface focus:ring-2 focus:ring-copper/30 focus:border-copper/50 transition-all"
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
                    <span className="flex-1 text-text-muted truncate text-sm">{a.message}</span>
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
              className="flex-1 px-3 py-2 rounded-xl border border-border text-sm bg-surface focus:ring-2 focus:ring-copper/30 focus:border-copper/50 transition-all"
            />
            <button
              onClick={addAnnonce}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all shadow-md shadow-copper/20 hover:shadow-copper/40"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
