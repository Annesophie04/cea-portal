/**
 * Galerie vitrine (carrousel) — liste figée dans le dépôt.
 * Les visiteurs ne peuvent pas modifier ces images depuis l’app ;
 * pour changer les visuels : éditer ce fichier et/ou remplacer les fichiers dans public/welcome-gallery/
 */
const base = import.meta.env.BASE_URL;

export const WELCOME_GALLERY_IMAGES = Object.freeze([
  { src: `${base}welcome-gallery/01.png`, alt: 'Communication et événementiel C.E.A' },
  { src: `${base}welcome-gallery/02.png`, alt: 'State of San Andreas' },
  { src: `${base}welcome-gallery/03.png`, alt: 'Portail C.E.A' },
]);
