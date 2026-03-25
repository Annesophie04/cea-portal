import travailPayload from './travail.parsed.json';

const now = () => new Date().toISOString();

function article(id, num, title, content, order = 0) {
  return {
    id,
    articleNumber: num,
    title,
    content,
    updatedAt: now(),
    isEditable: true,
    order,
  };
}

/** Code civil — structure + exemples (à compléter). */
export function getCodeCivilInitial() {
  return {
    id: 'code-civil',
    slug: 'code-civil',
    title: 'Code civil',
    shortDescription:
      "Règles fondamentales des personnes, des biens et des obligations au sein de l'État de San Andreas (référentiel interne C.E.A).",
    books: [
      {
        id: 'civil-b1',
        title: 'LIVRE I – DISPOSITIONS GÉNÉRALES',
        order: 0,
        sections: [
          {
            id: 'civil-b1-s1',
            title: 'Titre I – Principes et sources',
            order: 0,
            articles: [
              article(
                'civil-a-1',
                '1',
                'Objet du Code civil',
                "Le Code civil définit les règles relatives aux personnes, aux biens et aux obligations applicables sur le territoire, dans le respect des lois de l'État et des politiques internes du C.E.A.",
                0,
              ),
              article(
                'civil-a-2',
                '2',
                'Bonne foi',
                'Les parties doivent exécuter leurs obligations de bonne foi. Toute manœuvre abusive ou dolosive peut entraîner nullité, dommages et intérêts ou sanctions disciplinaires internes.',
                1,
              ),
            ],
          },
          {
            id: 'civil-b1-s2',
            title: "Titre II – Champ d'application (placeholder)",
            order: 1,
            articles: [
              article(
                'civil-a-3',
                '3',
                'Personnes physiques et morales',
                'Les dispositions relatives aux personnes physiques et morales seront complétées ici (représentation, capacité, responsabilité).',
                0,
              ),
            ],
          },
        ],
      },
      {
        id: 'civil-b2',
        title: 'LIVRE II – DES BIENS (placeholder)',
        order: 1,
        sections: [
          {
            id: 'civil-b2-s1',
            title: 'Titre I – Structure à compléter',
            order: 0,
            articles: [
              article(
                'civil-a-placeholder',
                '10',
                "Article d'exemple",
                'Ajoutez des sections et articles depuis le mode édition. Ce livre peut accueillir propriété, possession, sûretés, etc.',
                0,
              ),
            ],
          },
        ],
      },
    ],
  };
}

/** Code pénal — structure + exemples (à compléter). */
export function getCodePenalInitial() {
  return {
    id: 'code-penal',
    slug: 'code-penal',
    title: 'Code pénal',
    shortDescription:
      'Cadre répressif et procédures internes de référence pour les infractions graves (référentiel interne C.E.A — à aligner sur la juridiction compétente).',
    books: [
      {
        id: 'penal-b1',
        title: 'LIVRE I – PRINCIPES GÉNÉRAUX',
        order: 0,
        sections: [
          {
            id: 'penal-b1-s1',
            title: 'Titre I – Légalité et proportionnalité',
            order: 0,
            articles: [
              article(
                'penal-a-1',
                '1',
                'Légalité des peines',
                'Nulle peine ne peut être prononcée sans base légale ou réglementaire clairement identifiée et communiquée à la personne concernée.',
                0,
              ),
              article(
                'penal-a-2',
                '2',
                'Proportionnalité',
                "Les mesures prises doivent être proportionnées à la gravité des faits et à l'objectif de prévention recherche.",
                1,
              ),
            ],
          },
        ],
      },
      {
        id: 'penal-b2',
        title: 'LIVRE II – INFRACTIONS (placeholder)',
        order: 1,
        sections: [
          {
            id: 'penal-b2-s1',
            title: 'Titre I – À compléter',
            order: 0,
            articles: [
              article(
                'penal-a-ex',
                '50',
                "Article d'exemple",
                "Utilisez ce référentiel pour documenter les typologies d'infractions et sanctions applicables dans votre cadre d'emploi.",
                0,
              ),
            ],
          },
        ],
      },
    ],
  };
}

/** Code du travail — données structurées issues du parseur (contenu adapté, sans marque externe). */
export function getCodeTravailInitial() {
  const books = travailPayload.books.map((book, bi) => ({
    ...book,
    order: bi,
    sections: book.sections.map((sec, si) => ({
      ...sec,
      order: si,
      articles: sec.articles.map((a, ai) => ({
        ...a,
        order: ai,
        isEditable: true,
      })),
    })),
  }));

  return {
    id: 'code-travail',
    slug: 'code-travail',
    title: 'Code du travail',
    shortDescription:
      "Relations de travail, contrats, entreprises, associations, fiscalité liée à l'activité et contrôles — État de San Andreas (texte interne modifiable).",
    books,
  };
}

export function getDefaultLegalCodesRegistry() {
  return [getCodeCivilInitial(), getCodePenalInitial(), getCodeTravailInitial()];
}
