import { Star, Phone, ExternalLink, AlertTriangle, FileText, Users, PartyPopper } from 'lucide-react';

export default function MemoSection({ documents }) {
  const importantDocs = documents.filter(d => d.important);

  if (importantDocs.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-16 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-surface-alt flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-text-light" />
        </div>
        <p className="text-text-muted text-lg font-semibold">Aucun document marqué comme important</p>
        <p className="text-text-light text-sm mt-1">Modifie un document et coche "Marquer comme important" pour le voir ici.</p>
      </div>
    );
  }

  const summaryCards = [
    { icon: FileText, title: 'Procédures', color: 'from-[#1c1c2b] to-[#2a2a3d]', text: 'Le Guide des procédures CEA est le document de référence. Toute action interne doit respecter les protocoles qui y sont définis.' },
    { icon: Users, title: 'Associations', color: 'from-[#2d7a4f] to-[#3d9963]', text: 'Le suivi des associations et le modèle de contrat sont indispensables pour toute convention. Aucune association ne peut opérer sans agrément validé.' },
    { icon: PartyPopper, title: 'Événementiel', color: 'from-copper to-gold-light', text: 'Le dossier événementiel centralise les plannings, autorisations et budgets. Consultez-le avant d\'organiser tout événement officiel.' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-copper/12 via-copper/8 to-transparent border border-copper/20 p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-copper/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-copper to-gold-dark flex items-center justify-center shadow-lg shadow-copper/25 shrink-0">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-primary">Mémo — Documents essentiels</h2>
            <p className="text-sm text-text-muted mt-1 max-w-xl">
              Récapitulatif des documents les plus importants du pôle C.E.A avec les numéros de contact associés.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#111119] to-[#1c1c2b] text-white text-left">
                <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">#</th>
                <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Document</th>
                <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Catégorie</th>
                <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Type</th>
                <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Statut</th>
                <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Contact</th>
                <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider">Lien</th>
              </tr>
            </thead>
            <tbody>
              {importantDocs.map((doc, i) => (
                <tr key={doc.id} className={`border-t border-border/60 hover:bg-copper/5 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-surface/30'}`}>
                  <td className="px-5 py-4 text-text-light font-bold">{i + 1}</td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-primary">{doc.title}</p>
                    <p className="text-xs text-text-light mt-0.5 max-w-xs truncate">{doc.description}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-alt text-text-muted">{doc.category}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/8 text-primary">{doc.type}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      doc.status === 'Actif' ? 'bg-green-50 text-success' :
                      doc.status === 'En révision' ? 'bg-amber-50 text-warning' :
                      'bg-gray-100 text-text-light'
                    }`}>{doc.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    {doc.contact ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-copper/15 flex items-center justify-center">
                          <Phone className="w-3 h-3 text-copper" />
                        </div>
                        <span className="font-bold text-primary">{doc.contact}</span>
                      </div>
                    ) : <span className="text-text-light">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <a href={doc.link} target="_blank" rel="noreferrer"
                       className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-copper to-gold-light text-white hover:from-gold-light hover:to-copper transition-all duration-200 shadow-sm hover:shadow-md">
                      <ExternalLink className="w-3 h-3" />Ouvrir
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="relative bg-card rounded-2xl border border-border p-5 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-bold text-text-light uppercase tracking-wider">{card.title}</p>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">{card.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
