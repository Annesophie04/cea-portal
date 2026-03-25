import { useState } from 'react';
import {
  Scale, FileText, PlusCircle, ClipboardCheck, RefreshCw,
  Heart, XCircle, PartyPopper, Handshake,
  ChevronRight, AlertTriangle, MapPin, Gift, Users,
  Pencil, Trash2, Plus, X, Save, RotateCcw
} from 'lucide-react';
import { associations as seedAssos, locations as seedLocs, aideFinanciere, lots } from '../data/guideContent';
import { useEditableData } from '../hooks/useEditableData';

const chapters = [
  { id: 'preambule', label: 'Préambule', icon: FileText },
  { id: 'lois', label: 'Dispositions légales', icon: Scale },
  { id: 'documents', label: 'Les documents', icon: FileText },
  { id: 'creation', label: 'Création asso.', icon: PlusCircle },
  { id: 'suivi', label: 'Suivi asso.', icon: ClipboardCheck },
  { id: 'renouvellement', label: 'Renouvellement', icon: RefreshCw },
  { id: 'dons', label: 'Dons', icon: Heart },
  { id: 'dissolution', label: 'Dissolution', icon: XCircle },
  { id: 'creation-event', label: 'Création événement', icon: PartyPopper },
  { id: 'participation', label: 'Participation event', icon: Handshake },
  { id: 'associations', label: 'Associations actives', icon: Users },
];

/* ──────────── SHARED UI ──────────── */

function SectionTitle({ children }) {
  return <h2 className="text-xl font-bold text-primary mb-4 border-b-2 border-gold pb-2">{children}</h2>;
}
function SubTitle({ children }) {
  return <h3 className="text-lg font-semibold text-primary mt-6 mb-2">{children}</h3>;
}
function InfoBox({ children, type = 'info' }) {
  const styles = {
    info: 'bg-blue-50 border-primary/20 text-primary',
    warning: 'bg-amber-50 border-warning/30 text-amber-800',
    success: 'bg-green-50 border-success/30 text-green-800',
  };
  return <div className={`border rounded-lg p-4 text-sm ${styles[type]} mb-4`}>{children}</div>;
}
function BulletList({ items }) {
  return (
    <ul className="space-y-1.5 my-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
          <ChevronRight className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
function Step({ number, children }) {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-gold text-primary font-bold text-sm flex items-center justify-center shrink-0">{number}</div>
      <div className="text-sm text-text-muted pt-1">{children}</div>
    </div>
  );
}

function ActionBtn({ onClick, icon: Icon, label, variant = 'default' }) {
  const styles = {
    default: 'border-border text-text-muted hover:bg-surface-alt',
    danger: 'border-danger/30 text-danger hover:bg-red-50',
    gold: 'bg-gold text-primary hover:bg-gold-light border-gold',
    reset: 'border-warning/30 text-warning hover:bg-amber-50',
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${styles[variant]}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function FormField({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-surface focus:bg-card transition-colors"
      />
    </div>
  );
}

/* ──────────── STATIC CHAPTERS ──────────── */

function Preambule() {
  return (
    <div>
      <SectionTitle>Préambule</SectionTitle>
      <p className="text-sm text-text-muted mb-4">
        Le gouvernement de San Andreas assiste dans la création, la modification, le suivi et la dissolution des associations de tout l'État via le pôle CEA. Également, ce pôle a pour mission de créer, d'assister et d'aider les entreprises et les associations pour faire des événements.
      </p>
      <p className="text-sm text-text-muted mb-4">
        Ce document vise à regrouper et informer sur les différentes procédures existantes pour faciliter l'administration par nos services.
      </p>
      <InfoBox type="warning">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span><strong>CONFIDENTIEL :</strong> Ce document est uniquement pour un usage en interne et ne doit jamais être publié ou transmis à une personne extérieure à nos services.</span>
        </div>
      </InfoBox>
      <SubTitle>Sommaire</SubTitle>
      <div className="grid md:grid-cols-2 gap-2">
        {chapters.filter(c => c.id !== 'preambule' && c.id !== 'associations').map((ch, i) => (
          <div key={ch.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-alt text-sm text-text-muted">
            <ch.icon className="w-4 h-4 text-gold" />
            <span>Chapitre {i + 1} — {ch.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Lois() {
  return (
    <div>
      <SectionTitle>Chapitre 1 — Dispositions légales</SectionTitle>
      <p className="text-sm text-text-muted mb-4">
        Toutes les associations et les organismes s'y rapportant doivent respecter les textes de loi en vigueur. Ce chapitre aborde les lois inscrites au livre V du Code du Travail « Des associations et organismes à but non lucratif ». Le Code du Travail fera toujours foi, même au détriment de ce document s'il n'est pas maintenu à jour.
      </p>
      <InfoBox>Dans un souci de simplification, « association et/ou organisme à but non lucratif » sera remplacé par « structure à but non lucratif ».</InfoBox>
      <SubTitle>Rappel du Code du Travail</SubTitle>
      <BulletList items={[
        'Toute association ou organisme à but non lucratif devra être créé auprès du pôle CEA via l\'intranet officiel du gouvernement.',
        'Toute association ou organisme à but lucratif est strictement interdit. Ce point fait l\'objet d\'une constante surveillance du pôle CEA.',
        'Seul un secrétaire d\'État a le pouvoir de délivrer une licence associative après lecture et validation du dossier.',
        'Lors de la création, il faut au minimum un président et un trésorier. Ces deux postes peuvent être occupés par la même personne.',
        'Une structure peut recruter un ou des bénévole(s) à titre gratuit et sans lien de subordination (Article 40).',
        'Une structure a le droit d\'organiser des événements. En contrepartie, elle doit faire une déclaration préalable et une demande d\'autorisation (Article 41).',
        'Chaque structure est soumise au contrôle du gouvernement, en particulier du pôle CEA. L\'IRS peut avoir cette autorité sous procuration d\'un secrétaire d\'État.',
        'Le gouvernement peut dissoudre une structure en cas de contrôle incomplet ou insatisfaisant (Article 42) ou dans les cas de l\'Article 43.',
        'En cas de dissolution, le matériel est saisi ou redistribué conformément à la loi.',
        'En cas de dissolution, les comptes sont gelés et clôturés après audit du CEA.',
      ]} />
    </div>
  );
}

function Documents() {
  const docs = [
    { titre: 'Dossier complet CEA', desc: 'Regroupe l\'ensemble des dossiers nécessaires au fonctionnement du service.' },
    { titre: 'Dossier des associations', desc: 'Regroupe tous les documents des associations en fonction ou en cours de création.' },
    { titre: 'Contrat de création d\'association', desc: 'Aussi appelé « licence associative », rédigé et maintenu par le CEA. Lors de sa délivrance, l\'association est officiellement ouverte.' },
    { titre: 'Candidature pour création d\'association', desc: 'Le futur président doit le compléter et le joindre à sa demande de création.' },
    { titre: 'Statuts de l\'association', desc: 'Le futur président doit le compléter et le joindre à sa demande de création.' },
    { titre: 'Registre de l\'association', desc: 'Comptabilité, suivi des biens, liste des membres. Fourni au président pour le suivi administratif.' },
    { titre: 'Don à une association', desc: 'À remplir par le président, vice-président ou trésorier pour chaque don reçu.' },
    { titre: 'Attestation de dissolution', desc: 'À remplir par les agents CEA et à faire signer par un secrétaire d\'État.' },
    { titre: 'Demande d\'événement', desc: 'À remplir par le demandeur au préalable de toute demande liée à un événement. (À concevoir)' },
  ];
  return (
    <div>
      <SectionTitle>Chapitre 2 — Les documents</SectionTitle>
      <p className="text-sm text-text-muted mb-4">Chacun de ces documents est officiel et fait l'objet de constantes améliorations par le pôle CEA et les secrétaires d'État.</p>
      <div className="grid gap-3">
        {docs.map((d, i) => (
          <div key={i} className="bg-surface-alt/50 border border-border rounded-lg p-4">
            <h4 className="font-semibold text-primary text-sm">{d.titre}</h4>
            <p className="text-sm text-text-muted mt-1">{d.desc}</p>
          </div>
        ))}
      </div>
      <SubTitle>Conditions du registre</SubTitle>
      <BulletList items={[
        'Doit contenir une comptabilité à jour',
        'Doit contenir la liste des biens de l\'association',
        'Doit contenir la liste des membres et leur(s) rôle(s)',
        'Doit contenir la liste des contrats et leur statut',
        'Doit être partagé en lecture avec le gouvernement ou hébergé dans les dossiers du gouvernement',
      ]} />
    </div>
  );
}

function CreationAsso() {
  return (
    <div>
      <SectionTitle>Chapitre 3 — Création d'une association</SectionTitle>
      <p className="text-sm text-text-muted mb-6">Ce chapitre regroupe toutes les étapes de la création d'une association, de la demande à la délivrance du « Contrat de création d'association ».</p>
      <Step number={1}>Le candidat crée un ticket « Comm Event Asso » sur l'intranet du gouvernement. Il y présente brièvement son projet pour obtenir les documents à compléter.</Step>
      <Step number={2}>
        Un agent CEA crée un dossier au nom de l'association dans le dossier « Associations ». L'agent duplique les modèles et les inclut dans le dossier. Le CEA fournit :
        <BulletList items={['Candidature pour création d\'association', 'Statut de l\'association', 'Registre de l\'association (comptabilité + liste membre + liste biens + contrats)']} />
      </Step>
      <Step number={3}>
        Le candidat remplit et transmet :
        <BulletList items={['Candidature pour création d\'association', 'Statut de l\'association', 'Registre de l\'association', 'Dossier de présentation de l\'association']} />
      </Step>
      <Step number={4}>Le pôle CEA vérifie et transmet le dossier complet au secrétaire d'État.</Step>
      <Step number={5}>Après validation, l'agent CEA complète le « Contrat de création d'association ».</Step>
      <Step number={6}>Le secrétaire d'État signe le « Contrat de création d'association ».</Step>
    </div>
  );
}

function SuiviAsso() {
  return (
    <div>
      <SectionTitle>Chapitre 4 — Suivi d'une association</SectionTitle>
      <p className="text-sm text-text-muted mb-4">Le suivi des associations est obligatoire afin que le gouvernement soit assuré du bon respect du Code du Travail. Le pôle CEA doit assurer ce suivi soit de manière régulière, soit via des inspections surprise.</p>
      <InfoBox>Le suivi doit se faire via des courriers de demande de rendez-vous. En cas de non-réponse prolongée du président ou du vice-président, le pôle CEA peut appliquer l'article 43 pour « Inactivité prolongée ».</InfoBox>
    </div>
  );
}

function Renouvellement() {
  return (
    <div>
      <SectionTitle>Chapitre 5 — Renouvellement d'une association</SectionTitle>
      <p className="text-sm text-text-muted mb-4">Certaines associations évoluent ou doivent changer de statut. Le « Contrat de création de l'association » et/ou le « Statut de l'association » doivent être corrigés et à nouveau validés par le CEA et un secrétaire d'État.</p>
      <p className="text-sm text-text-muted mb-4">Le renouvellement sera conditionné en fonction des nouvelles activités et de leur adéquation avec les autres associations et les politiques du gouvernement en place.</p>
      <InfoBox type="warning">En cas de refus de renouvellement, l'association peut continuer ses activités comme précisé dans le contrat et les statuts existants.</InfoBox>
    </div>
  );
}

function Dons() {
  return (
    <div>
      <SectionTitle>Chapitre 6 — Don à une association</SectionTitle>
      <p className="text-sm text-text-muted mb-4">Une association peut récolter des dons afin de compléter ses revenus. Les dons peuvent être faits par un particulier, une association ou une entreprise.</p>
      <InfoBox type="warning">Les entreprises procédant à un don doivent obligatoirement le déclarer lors de la déclaration d'impôt suivant le don.</InfoBox>
      <SubTitle>Informations obligatoires du document de don</SubTitle>
      <BulletList items={['Le nom de l\'association ou de l\'entreprise donatrice', 'Le montant du don', 'Le nom de l\'association recevant le don', 'Le motif du don', 'Date, lieu et signature du donateur']} />
      <SubTitle>Particularités</SubTitle>
      <BulletList items={['Un donateur particulier peut rester anonyme', 'Le donateur peut préciser à quelle fin le don doit être utilisé', 'Le motif peut être simplement « Don libre »']} />
    </div>
  );
}

function Dissolution() {
  return (
    <div>
      <SectionTitle>Chapitre 7 — Dissolution d'une association</SectionTitle>
      <p className="text-sm text-text-muted mb-4">En cas de dissolution à l'initiative du gouvernement, il est important de respecter l'article 43 du Code du Travail.</p>
      <SubTitle>Procédure obligatoire des agents CEA</SubTitle>
      <Step number={1}>Procéder à l'audit de l'association</Step>
      <Step number={2}>Saisir le matériel appartenant à l'association</Step>
      <Step number={3}>Procéder au gel et à la clôture de la comptabilité</Step>
      <Step number={4}>Compléter le document « Attestation de dissolution d'une association »</Step>
    </div>
  );
}

function CreationEvent() {
  return (
    <div>
      <SectionTitle>Chapitre 8 — Création d'événement</SectionTitle>
      <p className="text-sm text-text-muted mb-4">Dans le cas où un particulier, une association ou une entreprise est à l'initiative de l'événement, se référer au Chapitre 9.</p>
      <SubTitle>Les 6 étapes de création</SubTitle>
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        {[
          { num: 1, titre: 'L\'idée originale', desc: 'Suite à des réunions, brainstorming ou réflexion personnelle. L\'idée n\'a pas besoin d\'être précise.' },
          { num: 2, titre: 'La conception', desc: 'Finaliser l\'idée avec date, lieu, partenaires et budget. Liste des partenaires et budget obligatoires.' },
          { num: 3, titre: 'La préparation', desc: 'Contacter partenaires, associations, artistes, gouvernement, Weazel News.' },
          { num: 4, titre: 'La communication', desc: 'Plan prêt 30j avant (grand événement). Lancer 15j avant (grand) ou 7j (petit).' },
          { num: 5, titre: 'L\'animation', desc: 'Programme clair, animateur pour présentation/clôture, pas de temps mort.' },
          { num: 6, titre: 'L\'après', desc: 'Compte rendu, bilan comptable, restitution lots, clôture tombola.' },
        ].map(step => (
          <div key={step.num} className="bg-surface-alt/50 border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-gold text-primary font-bold text-xs flex items-center justify-center">{step.num}</div>
              <h4 className="font-semibold text-primary text-sm">{step.titre}</h4>
            </div>
            <p className="text-xs text-text-muted">{step.desc}</p>
          </div>
        ))}
      </div>
      <SubTitle>Outils de communication internes</SubTitle>
      <BulletList items={['Création de logo et d\'affiche', 'Communiqué direction CEA sur l\'intranet', 'Publication Birdy par le CEA']} />
      <SubTitle>Outils de communication Weazel News</SubTitle>
      <BulletList items={['Pop-up', 'Publication Birdy', 'Publication InstaPic', 'Publication article écrit et/ou vidéo', 'Publication affiche sur l\'intranet']} />
      <InfoBox><strong>Obligation :</strong> Le logo du CEA doit figurer sur tous les supports de communication et être mentionné dans les articles de presse.</InfoBox>
      <SubTitle>Clés d'une bonne animation</SubTitle>
      <BulletList items={['Programme clair, défini et accessible pour tous', 'Animateur pour la présentation et la clôture', 'Bonne communication (rédiger un discours en amont)', 'Animateurs à chaque endroit stratégique (gros événements)', 'Pas de temps mort trop long ni de temps actifs trop longs']} />
    </div>
  );
}

function ParticipationEvent() {
  return (
    <div>
      <SectionTitle>Chapitre 9 — Participation du CEA à un événement</SectionTitle>
      <p className="text-sm text-text-muted mb-4">Pour demander la participation du gouvernement et du pôle CEA à un événement, il est impératif de remplir le formulaire « Création d'un événement ». Les conditions peuvent varier en cas de réduction budgétaire.</p>
      <SubTitle>Types de participation possibles</SubTitle>
      <BulletList items={['Participer aux lots', 'Participer aux factures via une aide financière', 'Participer à la conception de l\'événement', 'Participer à l\'animation de l\'événement', 'Délivrer une déclaration préalable (obligatoire)', 'Délivrer une autorisation si usage de la voie publique']} />
      <SubTitle>Conditions pour l'aide financière</SubTitle>
      <BulletList items={['Fourniture d\'un devis avant l\'événement', 'Fourniture d\'une facture après l\'événement', 'Caractère utile et indispensable des dépenses', 'Entrée gratuite du public à l\'événement', 'Remboursement dans les 7 jours', 'Remboursement en main propre au gouvernement sur RDV']} />
      <SubTitle>Barème de l'aide financière</SubTitle>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead><tr className="bg-primary text-white"><th className="px-4 py-2.5 text-left font-semibold rounded-tl-lg">Montant total</th><th className="px-4 py-2.5 text-left font-semibold rounded-tr-lg">% d'aide</th></tr></thead>
          <tbody>
            {aideFinanciere.map((row, i) => (
              <tr key={i} className={`border-t border-border ${i % 2 === 0 ? 'bg-card' : 'bg-surface/50'}`}>
                <td className="px-4 py-2.5">{row.tranche}</td>
                <td className="px-4 py-2.5 font-semibold text-primary">{row.pourcentage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <InfoBox type="success"><strong>Note :</strong> Une aide financière du gouvernement n'est pas imposable pour les entreprises.</InfoBox>
      <SubTitle>Lots disponibles</SubTitle>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {lots.map((lot, i) => (
          <div key={i} className="flex items-center gap-2 p-3 bg-surface-alt/50 border border-border rounded-lg text-sm text-text-muted">
            <Gift className="w-4 h-4 text-gold shrink-0" />{lot}
          </div>
        ))}
      </div>
      <InfoBox type="warning">Les lots sont à récupérer auprès du pôle CEA dans les 72h avant l'événement et sur rendez-vous.</InfoBox>
    </div>
  );
}

/* ──────────── EDITABLE: LOCATIONS ──────────── */

function LocationBiens({ data }) {
  const { items, add, update, remove, reset } = data;
  const [editing, setEditing] = useState(null); // index or 'new'
  const [form, setForm] = useState({});

  const startEdit = (i) => { setEditing(i); setForm({ ...items[i] }); };
  const startAdd = () => { setEditing('new'); setForm({ nom: '', description: '', prix: '', supplement: '', duree: '2 heures' }); };
  const cancel = () => { setEditing(null); setForm({}); };
  const save = () => {
    if (!form.nom?.trim()) return;
    if (editing === 'new') add(form);
    else update(editing, form);
    cancel();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>Chapitre 10 — Location de biens gouvernementaux</SectionTitle>
      </div>
      <p className="text-sm text-text-muted mb-4">Pour chaque réservation, les citoyens doivent ouvrir un ticket sur l'intranet en précisant le bien, la date et les horaires souhaités.</p>
      <InfoBox><strong>Suivi obligatoire :</strong> CI, téléphone, preuve de paiement, lieu, date, heure, montant et statut du paiement dans #réservation.</InfoBox>

      <div className="flex gap-2 mb-4">
        <ActionBtn onClick={startAdd} icon={Plus} label="Ajouter un lieu" variant="gold" />
        <ActionBtn onClick={reset} icon={RotateCcw} label="Réinitialiser" variant="reset" />
      </div>

      {editing !== null && (
        <div className="bg-surface-alt border border-gold/30 rounded-xl p-4 mb-4 space-y-3">
          <h4 className="text-sm font-semibold text-primary">{editing === 'new' ? 'Nouveau lieu' : 'Modifier le lieu'}</h4>
          <div className="grid md:grid-cols-2 gap-3">
            <FormField label="Nom" value={form.nom || ''} onChange={v => setForm({ ...form, nom: v })} placeholder="Villa Playboy" />
            <FormField label="Prix" value={form.prix || ''} onChange={v => setForm({ ...form, prix: v })} placeholder="100 000$" />
            <FormField label="Durée de base" value={form.duree || ''} onChange={v => setForm({ ...form, duree: v })} placeholder="2 heures" />
            <FormField label="Supplément" value={form.supplement || ''} onChange={v => setForm({ ...form, supplement: v })} placeholder="25 000$ / heure sup." />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Description</label>
            <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-surface focus:bg-card transition-colors resize-y" />
          </div>
          <div className="flex gap-2">
            <ActionBtn onClick={save} icon={Save} label="Enregistrer" variant="gold" />
            <ActionBtn onClick={cancel} icon={X} label="Annuler" />
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {items.map((loc, i) => (
          <div key={loc._id || i} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gold" />
                  <h4 className="font-bold text-primary">{loc.nom}</h4>
                </div>
                <p className="text-sm text-text-muted">{loc.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-gold">{loc.prix}</p>
                <p className="text-xs text-text-light">pour {loc.duree}</p>
                <p className="text-xs text-text-light mt-1">+{loc.supplement}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
              <ActionBtn onClick={() => startEdit(i)} icon={Pencil} label="Modifier" />
              <ActionBtn onClick={() => { if (window.confirm(`Supprimer « ${loc.nom} » ?`)) remove(i); }} icon={Trash2} label="Supprimer" variant="danger" />
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-text-light text-center py-8">Aucun lieu enregistré.</p>}
      </div>
    </div>
  );
}

/* ──────────── EDITABLE: ASSOCIATIONS ──────────── */

function AssociationsActives({ data }) {
  const { items, add, update, remove, reset } = data;
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const startEdit = (i) => { setEditing(i); setForm({ ...items[i] }); };
  const startAdd = () => { setEditing('new'); setForm({ nom: '', dateCreation: '', president: '', vicePresident: '', contrat: '', statut: 'Actif' }); };
  const cancel = () => { setEditing(null); setForm({}); };
  const save = () => {
    if (!form.nom?.trim()) return;
    if (editing === 'new') add(form);
    else update(editing, form);
    cancel();
  };

  return (
    <div>
      <SectionTitle>Associations actives</SectionTitle>
      <p className="text-sm text-text-muted mb-4">Tableau de suivi des associations enregistrées auprès du pôle CEA.</p>

      <div className="flex gap-2 mb-4">
        <ActionBtn onClick={startAdd} icon={Plus} label="Ajouter une association" variant="gold" />
        <ActionBtn onClick={reset} icon={RotateCcw} label="Réinitialiser" variant="reset" />
      </div>

      {editing !== null && (
        <div className="bg-surface-alt border border-gold/30 rounded-xl p-4 mb-4 space-y-3">
          <h4 className="text-sm font-semibold text-primary">{editing === 'new' ? 'Nouvelle association' : 'Modifier l\'association'}</h4>
          <div className="grid md:grid-cols-2 gap-3">
            <FormField label="Nom" value={form.nom || ''} onChange={v => setForm({ ...form, nom: v })} placeholder="Nom de l'association" />
            <FormField label="Date de création" value={form.dateCreation || ''} onChange={v => setForm({ ...form, dateCreation: v })} placeholder="JJ/MM/AAAA" />
            <FormField label="Président" value={form.president || ''} onChange={v => setForm({ ...form, president: v })} placeholder="Prénom NOM" />
            <FormField label="Vice-président" value={form.vicePresident || ''} onChange={v => setForm({ ...form, vicePresident: v })} placeholder="Prénom NOM" />
            <FormField label="Contrat" value={form.contrat || ''} onChange={v => setForm({ ...form, contrat: v })} placeholder="Statut du contrat" />
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Statut</label>
              <select value={form.statut || 'Actif'} onChange={e => setForm({ ...form, statut: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-surface cursor-pointer">
                <option value="Actif">Actif</option>
                <option value="En cours">En cours</option>
                <option value="Dissous">Dissous</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <ActionBtn onClick={save} icon={Save} label="Enregistrer" variant="gold" />
            <ActionBtn onClick={cancel} icon={X} label="Annuler" />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-primary text-white">
              <th className="px-4 py-2.5 text-left font-semibold rounded-tl-lg">#</th>
              <th className="px-4 py-2.5 text-left font-semibold">Association</th>
              <th className="px-4 py-2.5 text-left font-semibold">Date création</th>
              <th className="px-4 py-2.5 text-left font-semibold">Président</th>
              <th className="px-4 py-2.5 text-left font-semibold">Vice-président</th>
              <th className="px-4 py-2.5 text-left font-semibold">Contrat</th>
              <th className="px-4 py-2.5 text-left font-semibold">Statut</th>
              <th className="px-4 py-2.5 text-left font-semibold rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((asso, i) => (
              <tr key={asso._id || i} className={`border-t border-border ${i % 2 === 0 ? 'bg-card' : 'bg-surface/50'} hover:bg-surface-alt/50 transition-colors`}>
                <td className="px-4 py-3 text-text-light font-medium">{i + 1}</td>
                <td className="px-4 py-3 font-semibold text-primary">{asso.nom}</td>
                <td className="px-4 py-3 text-text-muted">{asso.dateCreation}</td>
                <td className="px-4 py-3 text-text-muted">{asso.president}</td>
                <td className="px-4 py-3 text-text-muted">{asso.vicePresident}</td>
                <td className="px-4 py-3 text-text-muted text-xs">{asso.contrat}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    asso.statut === 'Actif' ? 'bg-green-50 text-success' :
                    asso.statut === 'Dissous' ? 'bg-red-50 text-danger' :
                    'bg-amber-50 text-warning'
                  }`}>{asso.statut}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <ActionBtn onClick={() => startEdit(i)} icon={Pencil} label="Modifier" />
                    <ActionBtn onClick={() => { if (window.confirm(`Supprimer « ${asso.nom} » ?`)) remove(i); }} icon={Trash2} label="Supprimer" variant="danger" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="text-sm text-text-light text-center py-8">Aucune association enregistrée.</p>}
      </div>
    </div>
  );
}

/* ──────────── MAIN COMPONENT ──────────── */

export default function GuidePage() {
  const [activePage, setActivePage] = useState('preambule');

  const assosData = useEditableData('cea-associations-v1', seedAssos);
  const locsData = useEditableData('cea-locations-v1', seedLocs);

  const PAGES = {
    preambule: () => <Preambule />,
    lois: () => <Lois />,
    documents: () => <Documents />,
    creation: () => <CreationAsso />,
    suivi: () => <SuiviAsso />,
    renouvellement: () => <Renouvellement />,
    dons: () => <Dons />,
    dissolution: () => <Dissolution />,
    'creation-event': () => <CreationEvent />,
    participation: () => <ParticipationEvent />,
    associations: () => <AssociationsActives data={assosData} />,
  };

  const renderPage = PAGES[activePage];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <nav className="lg:w-64 shrink-0">
        <div className="bg-card border border-border rounded-xl overflow-hidden sticky top-24">
          <div className="bg-primary px-4 py-3 flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}logo-cea.png`} alt="" className="w-8 h-8" />
            <div>
              <h3 className="text-sm font-bold text-white">Guide des procédures</h3>
              <p className="text-xs text-white/60">Navigation par chapitre</p>
            </div>
          </div>
          <div className="p-1.5 max-h-[65vh] overflow-y-auto">
            {chapters.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActivePage(ch.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left cursor-pointer ${
                  activePage === ch.id
                    ? 'bg-gold/15 text-primary font-semibold'
                    : 'text-text-muted hover:bg-surface-alt'
                }`}
              >
                <ch.icon className={`w-4 h-4 shrink-0 ${activePage === ch.id ? 'text-gold' : 'text-text-light'}`} />
                <span className="truncate">{ch.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 bg-card border border-border rounded-xl p-6 shadow-sm min-w-0">
        {renderPage()}
      </div>
    </div>
  );
}
