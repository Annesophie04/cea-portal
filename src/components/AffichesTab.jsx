import { useState, useRef } from 'react';
import {
  Image, Plus, Trash2, Save, X, ExternalLink, Maximize2, Eye, Upload, Loader,
} from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useToast } from './Toast';
import { uploadAfficheImage } from '../lib/affichesStorage';

const emptyForm = { titre: '', imageUrl: '', description: '', evenement: '', auteur: '' };
const columnMap = {
  titre: 'titre',
  imageUrl: 'image_url',
  description: 'description',
  evenement: 'evenement',
  auteur: 'auteur',
  dateAjout: 'date_ajout',
};

function isValidImageUrl(s) {
  const t = s?.trim();
  if (!t) return false;
  if (t.startsWith('data:image/')) return true;
  try {
    const u = new URL(t);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export default function AffichesTab() {
  const toast = useToast();
  const { items, add, remove } = useSupabaseData('affiches', [], { columnMap });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [previewId, setPreviewId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const previewItem = items.find((a) => a.id === previewId);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    const { publicUrl, error } = await uploadAfficheImage(file);
    setUploading(false);
    if (error) {
      toast(error, 'error');
      return;
    }
    set('imageUrl', publicUrl);
    toast('Image envoyée sur le serveur.', 'success');
  };

  const save = async () => {
    if (!form.titre?.trim()) {
      toast('Indique un titre pour l’affiche.', 'warning');
      return;
    }
    if (!isValidImageUrl(form.imageUrl)) {
      toast('Ajoute une image : lien valide (https://…) ou fichier depuis ton PC.', 'warning');
      return;
    }
    const res = await add({ ...form, dateAjout: new Date().toLocaleDateString('fr-FR') });
    if (!res?.ok) {
      toast(res?.error || 'Impossible d’enregistrer l’affiche.', 'error');
      return;
    }
    setForm(emptyForm);
    setShowForm(false);
    toast('Affiche enregistrée.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-primary flex items-center gap-2">
            <Image className="w-6 h-6 text-copper" /> Affiches
          </h2>
          <p className="text-sm text-text-muted mt-1">
            {items.length} affiche{items.length > 1 ? 's' : ''} enregistrée{items.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md shadow-copper/20 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Ajouter une affiche
        </button>
      </div>

      {showForm && (
        <div className="bg-card border-2 border-copper/30 rounded-2xl p-6 shadow-lg animate-slide-up">
          <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-copper" /> Nouvelle affiche
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="affiche-titre" className="block text-xs font-semibold text-text-muted mb-1.5">
                Titre *
              </label>
              <input
                id="affiche-titre"
                type="text"
                value={form.titre}
                onChange={(e) => set('titre', e.target.value)}
                placeholder="Nom de l'affiche"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all"
              />
            </div>

            <div className="md:col-span-2 rounded-2xl border-2 border-copper/25 bg-surface-alt/50 dark:bg-white/[0.03] p-4 space-y-4">
              <p className="text-sm font-bold text-primary">Image de l’affiche *</p>
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="w-full sm:w-auto min-h-[3rem] inline-flex items-center justify-center gap-2.5 px-6 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white shadow-md shadow-copper/25 hover:from-gold-light hover:to-copper hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" /> Envoi en cours…
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Importer depuis mon ordinateur
                  </>
                )}
              </button>
              <p className="text-xs text-text-muted">
                Le fichier est envoyé sur le cloud Supabase ; l’aperçu apparaît ci-dessous une fois prêt.
              </p>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-border" aria-hidden />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-light">ou</span>
                <div className="h-px flex-1 bg-border" aria-hidden />
              </div>

              <div>
                <label htmlFor="affiche-url" className="block text-xs font-semibold text-text-muted mb-1.5">
                  Lien direct vers l’image (Discord, Imgur, etc.)
                </label>
                <input
                  id="affiche-url"
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  value={form.imageUrl}
                  onChange={(e) => set('imageUrl', e.target.value)}
                  placeholder="https://cdn.discordapp.com/attachments/…/image.png"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all font-mono text-[13px]"
                />
                <p className="text-[11px] text-text-light mt-1.5 leading-relaxed">
                  <strong className="text-text-muted">Discord :</strong> ouvre l’image en grand → clic droit → « Copier
                  l’adresse du lien » (URL se terminant par .png / .jpg / .webp).
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="affiche-event" className="block text-xs font-semibold text-text-muted mb-1.5">
                Événement lié
              </label>
              <input
                id="affiche-event"
                type="text"
                value={form.evenement}
                onChange={(e) => set('evenement', e.target.value)}
                placeholder="Nom de l'événement"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all"
              />
            </div>
            <div>
              <label htmlFor="affiche-auteur" className="block text-xs font-semibold text-text-muted mb-1.5">
                Auteur / Créateur
              </label>
              <input
                id="affiche-auteur"
                type="text"
                value={form.auteur}
                onChange={(e) => set('auteur', e.target.value)}
                placeholder="Qui a fait l'affiche"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="affiche-desc" className="block text-xs font-semibold text-text-muted mb-1.5">
                Description
              </label>
              <input
                id="affiche-desc"
                type="text"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Description courte..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-surface hover:bg-surface-alt focus:bg-card transition-all"
              />
            </div>
          </div>

          {form.imageUrl && (
            <div className="mt-4 p-3 bg-surface rounded-xl border border-border">
              <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-2">Aperçu</p>
              <img
                src={form.imageUrl}
                alt=""
                className="max-h-48 rounded-lg object-contain mx-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              type="button"
              onClick={save}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Enregistrer
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-xl border border-border text-text-muted hover:bg-surface-alt transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" /> Annuler
            </button>
          </div>
        </div>
      )}

      {previewItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewId(null)}
          role="presentation"
        >
          <div className="relative max-w-4xl max-h-[90vh] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewId(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewItem.imageUrl}
              alt={previewItem.titre}
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            />
            <p className="text-center text-white/80 text-sm font-semibold mt-3">{previewItem.titre}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((affiche) => (
          <div
            key={affiche.id}
            className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
          >
            <div
              className="relative h-56 bg-primary-light cursor-pointer"
              onClick={() => setPreviewId(affiche.id)}
              onKeyDown={(e) => e.key === 'Enter' && setPreviewId(affiche.id)}
              role="button"
              tabIndex={0}
              aria-label={`Agrandir ${affiche.titre}`}
            >
              <img
                src={affiche.imageUrl}
                alt={affiche.titre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <div className="w-10 h-10 rounded-full bg-card/95 flex items-center justify-center shadow-lg">
                    <Maximize2 className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-extrabold text-primary line-clamp-2">{affiche.titre}</h3>
              {affiche.evenement && <p className="text-[11px] text-copper font-semibold mt-1">{affiche.evenement}</p>}
              {affiche.auteur && <p className="text-[10px] text-text-light mt-0.5">Par {affiche.auteur}</p>}
              {affiche.description && <p className="text-xs text-text-muted mt-1 line-clamp-2">{affiche.description}</p>}
              <p className="text-[10px] text-text-light mt-1">{affiche.dateAjout}</p>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border/40 flex-wrap">
                <a
                  href={affiche.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-border text-text-muted hover:bg-surface-alt transition-all"
                >
                  <ExternalLink className="w-3 h-3" /> Ouvrir
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewId(affiche.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-border text-text-muted hover:bg-surface-alt transition-all cursor-pointer"
                >
                  <Eye className="w-3 h-3" /> Voir
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Supprimer « ${affiche.titre} » ?`)) remove(affiche.id);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-danger/20 text-danger hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <Image className="w-10 h-10 text-text-light mx-auto mb-3" aria-hidden />
          <p className="text-text-muted font-semibold">Aucune affiche enregistrée</p>
          <p className="text-text-light text-sm mt-1 max-w-md mx-auto">
            Clique sur « Ajouter une affiche », puis envoie une image depuis ton PC ou colle un lien direct (ex. pièce
            jointe Discord).
          </p>
        </div>
      )}
    </div>
  );
}
