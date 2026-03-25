import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, ChevronRight, ChevronLeft, Music, Upload, Trash2, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';

const VOLUME = 0.01;
const BUCKET = 'musiques';
const DEFAULT_SRC = `${import.meta.env.BASE_URL || '/'}bg-music.mp3`;

export default function BackgroundMusic() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [currentSrc, setCurrentSrc] = useState(DEFAULT_SRC);
  const [currentName, setCurrentName] = useState('Battement connexion');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [storageDisabled, setStorageDisabled] = useState(false);

  // Load tracks from storage bucket
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.storage.from(BUCKET).list('', { limit: 50 });
      if (error) {
        setStorageDisabled(true);
        setMessage('Stockage musique indisponible: mode local actif.');
        return;
      }
      if (data?.length) {
        const list = data
          .filter((f) => {
            const name = f.name.toLowerCase();
            return name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.ogg') || name.endsWith('.m4a');
          })
          .map(f => {
            const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
            return { name: f.name.replace(/\.[^.]+$/, ''), file: f.name, url: urlData.publicUrl, local: false };
          });
        setTracks(list);
      }
    })();

    return () => {
      tracks.forEach((t) => {
        if (t.local && t.url.startsWith('blob:')) URL.revokeObjectURL(t.url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.volume = VOLUME;
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  const playTrack = (track) => {
    setMessage('');
    setCurrentSrc(track.url);
    setCurrentName(track.name);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.volume = VOLUME;
      audioRef.current.play().catch(() => {
        setMessage('Lecture bloquee: appuie sur Son puis relance la piste.');
      });
      setPlaying(true);
    }
  };

  const uploadTrack = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage('');
    setUploading(true);

    if (!file.type.startsWith('audio/')) {
      setUploading(false);
      setMessage('Format non supporte. Choisis un fichier audio.');
      e.target.value = '';
      return;
    }

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const fallbackToLocal = () => {
      const url = URL.createObjectURL(file);
      const localTrack = {
        name: file.name.replace(/\.[^.]+$/, ''),
        file: `local-${Date.now()}`,
        url,
        local: true,
      };
      setTracks((prev) => [...prev, localTrack]);
      setMessage('Piste ajoutee en local (non synchronisee cloud).');
      playTrack(localTrack);
    };

    if (storageDisabled) {
      fallbackToLocal();
      setUploading(false);
      e.target.value = '';
      return;
    }

    const { error } = await supabase.storage.from(BUCKET).upload(safeName, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: true,
    });
    if (!error) {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(safeName);
      const newTrack = { name: file.name.replace(/\.[^.]+$/, ''), file: safeName, url: urlData.publicUrl, local: false };
      setTracks((prev) => [...prev, newTrack]);
      setMessage('Piste ajoutee.');
      playTrack(newTrack);
    } else {
      setStorageDisabled(true);
      setMessage(`Cloud refuse (${error.message || 'permission'}): piste locale active.`);
      fallbackToLocal();
    }
    setUploading(false);
    e.target.value = '';
  };

  const removeTrack = async (track) => {
    if (!window.confirm(`Supprimer « ${track.name} » ?`)) return;
    setMessage('');
    if (track.local) {
      if (track.url.startsWith('blob:')) URL.revokeObjectURL(track.url);
      setTracks((prev) => prev.filter((t) => t.file !== track.file));
      if (currentSrc === track.url) {
        setCurrentSrc(DEFAULT_SRC);
        setCurrentName('Battement connexion');
        if (audioRef.current) {
          audioRef.current.src = DEFAULT_SRC;
          if (playing) audioRef.current.play().catch(() => {});
        }
      }
      return;
    }

    const { error } = await supabase.storage.from(BUCKET).remove([track.file]);
    if (!error) {
      setTracks((prev) => prev.filter((t) => t.file !== track.file));
      if (currentSrc === track.url) {
        setCurrentSrc(DEFAULT_SRC);
        setCurrentName('Battement connexion');
        if (audioRef.current) {
          audioRef.current.src = DEFAULT_SRC;
          if (playing) audioRef.current.play().catch(() => {});
        }
      }
    } else {
      setMessage('Suppression impossible sur le cloud.');
    }
  };

  return (
    <>
      <audio ref={audioRef} src={currentSrc} loop preload="auto" />

      {/* Bouton principal */}
      <div
        className="fixed bottom-4 left-0 z-[150] flex items-center transition-transform duration-300 max-lg:landscape:bottom-auto max-lg:landscape:top-[calc(env(safe-area-inset-top)+0.65rem)]"
        style={{ transform: collapsed ? 'translateX(-100%)' : 'translateX(0)' }}
      >
        <div className="flex flex-col rounded-r-lg overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
          <button
            type="button"
            onClick={toggle}
            className="flex items-center gap-1.5 pl-4 pr-3 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all min-h-[36px]"
            style={{
              background: playing ? 'linear-gradient(135deg, #b8860b, #d4af37)' : 'rgba(40,40,50,0.9)',
              color: playing ? '#fff' : 'rgba(255,255,255,0.5)',
            }}
          >
            {playing ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            {playing ? 'Son' : 'Muet'}
          </button>
          <button
            type="button"
            onClick={() => setShowPanel(!showPanel)}
            className="flex items-center gap-1.5 pl-4 pr-3 py-1 text-[9px] font-bold uppercase tracking-wider hover:brightness-110 transition-all min-h-[30px]"
            style={{
              background: 'rgba(40,40,50,0.85)',
              color: 'rgba(255,255,255,0.4)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Music className="w-3 h-3" />
            Pistes
          </button>
        </div>
      </div>

      {/* Toggle collapse */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="fixed bottom-4 max-lg:landscape:bottom-auto max-lg:landscape:top-[calc(env(safe-area-inset-top)+0.65rem)] z-[151] w-6 h-6 flex items-center justify-center rounded-r-md transition-all duration-300 hover:brightness-125"
        style={{
          left: collapsed ? 0 : '4.5rem',
          background: 'rgba(40,40,50,0.8)',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Panel de gestion des pistes */}
      {showPanel && (
        <div className="fixed bottom-16 left-4 z-[160] w-72 max-w-[calc(100vw-1.5rem)] bg-card border border-border rounded-2xl shadow-2xl animate-slide-up overflow-hidden max-lg:landscape:bottom-auto max-lg:landscape:top-[calc(env(safe-area-inset-top)+3.5rem)] max-lg:landscape:left-2">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#1c1c2b] to-[#2a2a3d]">
            <p className="text-xs font-bold text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-copper-light" /> Playlist
            </p>
            <button onClick={() => setShowPanel(false)} className="text-white/50 hover:text-white transition-colors">✕</button>
          </div>

          {/* Piste en cours */}
          <div className="px-4 py-2 border-b border-border/50 bg-copper/5">
            <p className="text-[10px] text-text-light uppercase tracking-wider">En cours</p>
            <p className="text-sm font-semibold text-primary truncate">{currentName}</p>
          </div>

          {/* Liste des pistes */}
          <div className="max-h-48 overflow-y-auto">
            {/* Piste par défaut */}
            <div className="flex items-center gap-2 px-4 py-2 hover:bg-surface-alt transition-colors">
              <button onClick={() => { setCurrentSrc(DEFAULT_SRC); setCurrentName('Battement connexion'); if (audioRef.current) { audioRef.current.src = DEFAULT_SRC; audioRef.current.volume = VOLUME; if (playing) audioRef.current.play().catch(() => {}); } }}
                className="flex-1 flex items-center gap-2 text-left min-w-0">
                <Play className="w-3.5 h-3.5 text-copper shrink-0" />
                <span className="text-sm text-text-muted truncate">Battement connexion</span>
              </button>
            </div>

            {tracks.map(track => (
              <div key={track.file} className="flex items-center gap-2 px-4 py-2 hover:bg-surface-alt transition-colors">
                <button onClick={() => playTrack(track)} className="flex-1 flex items-center gap-2 text-left min-w-0">
                  <Play className="w-3.5 h-3.5 text-copper shrink-0" />
                  <span className="text-sm text-text-muted truncate">{track.name}</span>
                </button>
                <button onClick={() => removeTrack(track)} className="text-text-light hover:text-danger transition-colors shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {tracks.length === 0 && (
              <p className="px-4 py-3 text-xs text-text-light text-center">Aucune piste ajoutée</p>
            )}
          </div>

          {/* Upload */}
          <div className="px-4 py-3 border-t border-border/50">
            {message ? (
              <p className="mb-2 text-[10px] text-text-light">{message}</p>
            ) : null}
            <label className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Envoi...' : storageDisabled ? 'Ajouter une musique locale' : 'Ajouter une musique'}
              <input type="file" accept="audio/*" className="hidden" onChange={uploadTrack} disabled={uploading} />
            </label>
          </div>
        </div>
      )}
    </>
  );
}
