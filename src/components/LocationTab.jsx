import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Plus, Trash2, Pencil, Save, X, AlertCircle, ImagePlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  normalizePhotos,
  uploadLocationPhotoToStorage,
  fileToDataUrlLimited,
} from '../lib/locationPhotos';

const STORAGE_KEY = 'cea-locations-biens';
const MAX_PHOTOS = 24;

const emptyForm = {
  libelle: '',
  adresse: '',
  precisions: '',
  photos: [],
};

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocal(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function photoPayload(form) {
  const list = Array.isArray(form.photos) ? form.photos.filter(Boolean) : [];
  return list;
}

export default function LocationTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useSupabase, setUseSupabase] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [infoBanner, setInfoBanner] = useState('');
  const fileInputRef = useRef(null);
  const editingIdRef = useRef(editingId);
  editingIdRef.current = editingId;

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('location_biens')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('location_biens:', error);
      setUseSupabase(false);
      setItems(loadLocal());
      setInfoBanner(
        'Supabase indisponible ou table « location_biens » absente : affichage des données locales. Exécute le SQL du fichier supabase-migration-location-biens.sql dans le tableau Supabase.',
      );
      return;
    }

    setUseSupabase(true);
    setInfoBanner('');
    if (data) setItems(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const startAdd = () => {
    setSaveError('');
    setEditingId('new');
    setForm(emptyForm);
  };

  const startEdit = (item) => {
    setSaveError('');
    setEditingId(item.id || item._id);
    setForm({
      libelle: item.libelle ?? '',
      adresse: item.adresse ?? '',
      precisions: item.precisions ?? '',
      photos: normalizePhotos(item),
    });
  };

  const cancel = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSaveError('');
  };

  const removePhotoAt = (index) => {
    setForm((prev) => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index),
    }));
  };

  const addPhotosFromFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    const room = MAX_PHOTOS - (form.photos?.length || 0);
    const toAdd = files.slice(0, Math.max(0, room));
    if (toAdd.length === 0) {
      setSaveError(`Maximum ${MAX_PHOTOS} photos.`);
      return;
    }
    setSaveError('');
    setUploadingPhotos(true);
    const next = [...(form.photos || [])];
    try {
      for (const file of toAdd) {
        let url;
        if (useSupabase) {
          try {
            url = await uploadLocationPhotoToStorage(file);
          } catch (err) {
            console.warn('Storage upload failed, fallback local:', err);
            url = await fileToDataUrlLimited(file);
          }
        } else {
          url = await fileToDataUrlLimited(file);
        }
        next.push(url);
      }
      setForm((prev) => ({ ...prev, photos: next }));
    } catch (e) {
      setSaveError(e?.message || 'Impossible d’ajouter cette image.');
    } finally {
      setUploadingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const saveLocalItem = (isNew) => {
    const photos = photoPayload(form);
    if (isNew) {
      const row = {
        _id: Date.now().toString(),
        libelle: form.libelle.trim(),
        adresse: form.adresse?.trim() || '',
        precisions: form.precisions?.trim() || '',
        photos,
      };
      const next = [row, ...items.map((it) => ({ ...it }))];
      saveLocal(next);
      setItems(next);
      cancel();
      return;
    }
    const idx = items.findIndex((it) => String(it.id || it._id) === String(editingId));
    if (idx < 0) return;
    const next = items.map((it, i) =>
      i === idx
        ? {
            ...it,
            libelle: form.libelle.trim(),
            adresse: form.adresse?.trim() || '',
            precisions: form.precisions?.trim() || '',
            photos,
          }
        : it,
    );
    saveLocal(next);
    setItems(next);
    cancel();
  };

  async function save() {
    if (!form.libelle?.trim()) {
      setSaveError('Le libellé est obligatoire.');
      return;
    }
    setSaveError('');
    setSaving(true);

    const photos = photoPayload(form);
    const payload = {
      libelle: form.libelle.trim(),
      adresse: form.adresse?.trim() || null,
      precisions: form.precisions?.trim() || null,
      photos,
    };

    try {
      if (!useSupabase) {
        saveLocalItem(editingId === 'new');
        return;
      }

      if (editingId === 'new') {
        const { data, error } = await supabase.from('location_biens').insert(payload).select();
        if (error) throw error;
        if (data?.[0]) {
          setItems((prev) => [data[0], ...prev]);
        } else {
          await load();
        }
        cancel();
        return;
      }

      if (editingId) {
        const { data, error } = await supabase
          .from('location_biens')
          .update(payload)
          .eq('id', editingId)
          .select();
        if (error) throw error;
        if (data?.[0]) {
          setItems((prev) => prev.map((it) => (it.id === editingId ? data[0] : it)));
        } else {
          await load();
        }
        cancel();
      }
    } catch (e) {
      const msg = e?.message || e?.error_description || String(e);
      console.error('Location save:', e);
      try {
        saveLocalItem(editingId === 'new');
        setUseSupabase(false);
        setInfoBanner(
          'Enregistrement effectué en local uniquement (échec Supabase). Vérifie la table « location_biens » (colonne photos), le bucket Storage et les droits.',
        );
      } catch {
        setSaveError(msg || 'Enregistrement impossible.');
      }
    } finally {
      setSaving(false);
    }
  }

  const handleRemove = async (id) => {
    if (!window.confirm('Supprimer ce bien / lieu ?')) return;
    setSaveError('');

    if (!useSupabase) {
      const next = items.filter((it) => it.id !== id && it._id !== id);
      saveLocal(next);
      setItems(next);
      if (editingIdRef.current === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      return;
    }

    const { error } = await supabase.from('location_biens').delete().eq('id', id);
    if (error) {
      console.error(error);
      try {
        const next = items.filter((it) => it.id !== id && it._id !== id);
        saveLocal(next);
        setItems(next);
        setUseSupabase(false);
        setInfoBanner('Suppression appliquée en local (sync Supabase impossible).');
      } catch {
        setSaveError(error.message || 'Suppression impossible.');
      }
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (editingIdRef.current === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
  };

  const listKey = (item, index) => item.id || item._id || String(index);

  return (
    <div className="space-y-6 max-lg:landscape:space-y-4 animate-fade-in">
      {infoBanner ? (
        <div className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p className="leading-relaxed">{infoBanner}</p>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-extrabold text-primary flex items-center gap-2">
            <MapPin className="w-6 h-6 text-copper shrink-0" />
            Location
          </h2>
          <p className="text-sm text-text-muted mt-1 max-w-xl leading-relaxed">
            Biens immobiliers et lieux d’activité (locaux, espaces, adresses). Ne concerne pas le matériel ni le stock.
          </p>
        </div>
        <button
          type="button"
          onClick={startAdd}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md shadow-copper/20 active:scale-[0.98] shrink-0 w-full sm:w-auto touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {editingId !== null && (
        <div className="bg-card border-2 border-copper/30 rounded-2xl p-4 sm:p-6 max-lg:landscape:p-3 shadow-lg animate-slide-up">
          <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-copper" />
            {editingId === 'new' ? 'Nouveau bien / lieu' : 'Modifier'}
          </h3>
          {saveError ? (
            <p className="mb-3 text-sm text-danger flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {saveError}
            </p>
          ) : null}
          <div className="grid gap-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Libellé *</label>
              <input
                type="text"
                value={form.libelle}
                onChange={(e) => set('libelle', e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-border text-base sm:text-sm bg-surface hover:bg-surface-alt focus:bg-white dark:focus:bg-white/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Adresse / situation</label>
              <input
                type="text"
                value={form.adresse}
                onChange={(e) => set('adresse', e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-border text-base sm:text-sm bg-surface hover:bg-surface-alt focus:bg-white dark:focus:bg-white/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Précisions</label>
              <textarea
                value={form.precisions}
                onChange={(e) => set('precisions', e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-base sm:text-sm bg-surface hover:bg-surface-alt focus:bg-white dark:focus:bg-white/10 transition-all resize-y min-h-[120px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2">Photos</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addPhotosFromFiles(e.target.files)}
              />
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  disabled={uploadingPhotos || (form.photos?.length || 0) >= MAX_PHOTOS}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-muted hover:bg-surface-alt hover:text-primary transition-colors disabled:opacity-50 touch-manipulation w-full sm:w-auto"
                >
                  <ImagePlus className="w-4 h-4" />
                  {uploadingPhotos ? 'Import…' : 'Ajouter des photos'}
                </button>
                <span className="text-xs text-text-light self-center w-full sm:w-auto">
                  {(form.photos?.length || 0)}/{MAX_PHOTOS}
                </span>
              </div>
              {(form.photos?.length || 0) > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {form.photos.map((url, i) => (
                    <div
                      key={`${url}-${i}`}
                      className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-border bg-surface-alt"
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={() => removePhotoAt(i)}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/55 text-white hover:bg-black/75 touch-manipulation"
                        aria-label="Retirer la photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row flex-wrap gap-2 mt-4">
            <button
              type="button"
              disabled={saving}
              onClick={cancel}
              className="inline-flex items-center justify-center gap-1.5 min-h-[48px] px-5 py-2.5 text-sm font-medium rounded-xl border border-border text-text-muted hover:bg-surface-alt transition-colors cursor-pointer disabled:opacity-50 touch-manipulation sm:min-h-[44px]"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            <button
              type="button"
              disabled={saving || uploadingPhotos}
              onClick={save}
              className="inline-flex items-center justify-center gap-1.5 min-h-[48px] px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer shadow-md disabled:opacity-60 disabled:pointer-events-none touch-manipulation sm:min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-text-muted py-8 text-center border border-dashed border-border rounded-2xl">
          Chargement…
        </p>
      ) : items.length === 0 && editingId === null ? (
        <p className="text-sm text-text-muted py-8 text-center border border-dashed border-border rounded-2xl">
          Aucun bien enregistré.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const pics = normalizePhotos(item);
            return (
              <div
                key={listKey(item, index)}
                className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all p-4 sm:p-5 flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-primary text-base">{item.libelle}</h3>
                    {item.adresse ? (
                      <p className="text-sm text-text-muted mt-1 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                        <span className="break-words">{item.adresse}</span>
                      </p>
                    ) : null}
                    {item.precisions ? (
                      <p className="text-sm text-text-muted mt-2 whitespace-pre-wrap break-words">{item.precisions}</p>
                    ) : null}
                  </div>
                  <div className="flex items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 text-sm font-medium rounded-xl border border-border text-text-muted hover:bg-surface-alt hover:text-primary transition-colors cursor-pointer touch-manipulation"
                    >
                      <Pencil className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id || item._id)}
                      className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 text-sm font-medium rounded-xl border border-danger/25 text-danger hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer touch-manipulation"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
                {pics.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-border/60">
                    {pics.map((url, i) => (
                      <a
                        key={`${url}-${i}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-[4/3] rounded-xl overflow-hidden border border-border bg-surface-alt focus:outline-none focus-visible:ring-2 focus-visible:ring-copper"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
