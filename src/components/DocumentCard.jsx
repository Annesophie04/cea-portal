import { ExternalLink, Pencil, Trash2, Phone, Star, Clock } from 'lucide-react';

const TYPE_COLORS = {
  'Officiel': 'bg-gradient-to-r from-[#1c1c2b] to-[#2a2a3d] text-white',
  'Modèle': 'bg-gradient-to-r from-copper to-gold-light text-white',
  'Suivi': 'bg-gradient-to-r from-[#2d7a4f] to-[#3d9963] text-white',
  'Dossier': 'bg-gradient-to-r from-[#4a3f5c] to-[#6b5d85] text-white',
  'Archive': 'bg-gradient-to-r from-[#6b6575] to-[#8a8494] text-white',
};

const STATUS_COLORS = {
  'Actif': 'border-success/40 text-success bg-green-50/50',
  'En révision': 'border-copper/40 text-copper bg-orange-50/50',
  'Archivé': 'border-text-light/40 text-text-light bg-stone-50/50',
};

const STATUS_DOT = {
  'Actif': 'bg-success',
  'En révision': 'bg-copper',
  'Archivé': 'bg-text-light',
};

function formatDate(raw) {
  if (!raw) return '';
  try {
    return new Date(raw).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return raw; }
}

export default function DocumentCard({ doc, onEdit, onDelete }) {
  return (
    <div className={`bg-card rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden ${doc.important ? 'border-copper/40 ring-2 ring-copper/15' : 'border-border'}`}>
      {doc.important && <div className="h-0.5 gold-shimmer" />}

      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-primary leading-snug flex items-center gap-2">
              {doc.important && <Star className="w-4 h-4 text-copper shrink-0 fill-copper drop-shadow-sm" />}
              <span className="truncate">{doc.title}</span>
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Clock className="w-3 h-3 text-text-light" />
              <p className="text-[11px] text-text-light font-medium">
                {formatDate(doc.updatedAt)}
              </p>
            </div>
          </div>
          <span className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${TYPE_COLORS[doc.type] || 'bg-surface text-text'}`}>
            {doc.type}
          </span>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-3.5">
        <p className="text-sm text-text-muted line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {doc.description || 'Aucune description.'}
        </p>

        {doc.contact && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-surface-alt to-surface text-sm border border-border/50">
            <div className="w-6 h-6 rounded-full bg-copper/15 flex items-center justify-center">
              <Phone className="w-3 h-3 text-copper" />
            </div>
            <span className="font-semibold text-primary">{doc.contact}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_COLORS[doc.status] || 'border-border text-text-muted'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[doc.status] || 'bg-text-light'}`} />
            {doc.status}
          </span>
          {(doc.tags || []).map(tag => (
            <span key={tag} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/5 text-primary/70 hover:bg-primary/10 transition-colors">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-3 border-t border-border/40">
          <a
            href={doc.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex-1 justify-center sm:flex-initial"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ouvrir
          </a>
          <button
            onClick={() => onEdit(doc)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-border text-text-muted hover:bg-surface-alt hover:border-primary/20 transition-all duration-200 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            Modifier
          </button>
          <button
            onClick={() => onDelete(doc.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-danger/20 text-danger hover:bg-red-50 hover:border-danger/40 transition-all duration-200 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
