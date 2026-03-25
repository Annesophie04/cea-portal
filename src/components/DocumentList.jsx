import { FolderOpen } from 'lucide-react';
import DocumentCard from './DocumentCard';

export default function DocumentList({ grouped, onEdit, onDelete }) {
  const entries = Object.entries(grouped);

  if (entries.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-16 text-center animate-fade-in">
        <div className="empty-state-icon w-20 h-20 rounded-2xl bg-gradient-to-br from-copper/15 to-gold/10 border border-copper/20 flex items-center justify-center mx-auto mb-5">
          <FolderOpen className="w-9 h-9 text-copper" />
        </div>
        <p className="text-text-muted text-lg font-bold">Aucun document trouvé</p>
        <p className="text-text-light text-sm mt-2 max-w-xs mx-auto leading-relaxed">Modifiez vos filtres ou ajoutez un nouveau document pour commencer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {entries.map(([categoryName, docs]) => (
        <section key={categoryName}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-copper to-gold-dark" />
            <h2 className="text-lg font-extrabold text-primary tracking-tight">{categoryName}</h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-primary/8 text-primary">
              {docs.length}
            </span>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {docs.map(doc => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
