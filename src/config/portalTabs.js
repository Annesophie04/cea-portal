import {
  FileText,
  FolderOpen,
  ShieldCheck,
  Layers,
  Users,
  CalendarDays,
  Video,
  DollarSign,
  Lightbulb,
  Image,
  Database,
  MapPin,
  Scale,
} from 'lucide-react';

/** Configuration des onglets du portail (clé, libellé, icône). */
export const PORTAL_TABS = [
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'memo', label: 'Mémo', icon: ShieldCheck },
  { key: 'procedures', label: 'Procédures CEA', icon: FolderOpen },
  { key: 'associations', label: 'Associations', icon: Users },
  { key: 'evenements', label: 'Événements', icon: CalendarDays },
  { key: 'videos', label: 'Vidéos', icon: Video },
  { key: 'comptabilite', label: 'Comptabilité', icon: DollarSign },
  { key: 'idees', label: 'Idées', icon: Lightbulb },
  { key: 'affiches', label: 'Affiches', icon: Image },
  { key: 'stockage', label: 'Stockage', icon: Database },
  { key: 'location', label: 'Location', icon: MapPin },
  { key: 'codes', label: 'Codes', icon: Scale },
  { key: 'guide', label: 'Aide', icon: Layers },
];
