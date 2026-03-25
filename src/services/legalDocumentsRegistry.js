/**
 * Logique métier pure : collection de documents juridiques (codes → livres → sections → articles).
 * Indépendant de React et du stockage — utilisé par le service et le hook.
 */

/**
 * Retrouve un article par `codeSlug` + `articleId` (identifiants stables).
 * @returns {{ code: object, book: object, sec: object, art: object } | null}
 */
export function findArticleLocation(codes, codeSlug, articleId) {
  const code = codes.find((c) => c.slug === codeSlug);
  if (!code) return null;
  for (const book of code.books || []) {
    for (const sec of book.sections || []) {
      const art = (sec.articles || []).find((a) => a.id === articleId);
      if (art) return { code, book, sec, art };
    }
  }
  return null;
}

/**
 * Recherche globale par id d'article (ids stables uniques dans le référentiel).
 * Évite les échecs si `activeSlug` et `selectedArticleId` sont désynchronisés.
 */
export function findArticleById(codes, articleId) {
  for (const code of codes) {
    for (const book of code.books || []) {
      for (const sec of book.sections || []) {
        const art = (sec.articles || []).find((a) => a.id === articleId);
        if (art) return { code, book, sec, art };
      }
    }
  }
  return null;
}

export function updateArticleInRegistry(codes, codeSlug, articleId, patch) {
  const ts = new Date().toISOString();
  return codes.map((code) => {
    if (code.slug !== codeSlug) return code;
    return {
      ...code,
      books: code.books.map((book) => ({
        ...book,
        sections: book.sections.map((sec) => ({
          ...sec,
          articles: sec.articles
            .map((a) => (a.id === articleId ? { ...a, ...patch, updatedAt: ts } : a))
            .sort((x, y) => x.order - y.order),
        })),
      })),
    };
  });
}

export function deleteArticleInRegistry(codes, codeSlug, articleId) {
  return codes.map((code) => {
    if (code.slug !== codeSlug) return code;
    return {
      ...code,
      books: code.books.map((book) => ({
        ...book,
        sections: book.sections.map((sec) => {
          const next = sec.articles.filter((a) => a.id !== articleId);
          return {
            ...sec,
            articles: next.map((a, i) => ({ ...a, order: i })),
          };
        }),
      })),
    };
  });
}

export function addArticleInRegistry(codes, codeSlug, bookId, sectionId, { articleNumber, title, content }, newId) {
  const ts = new Date().toISOString();
  const id = newId || `art-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return codes.map((code) => {
    if (code.slug !== codeSlug) return code;
    return {
      ...code,
      books: code.books.map((book) => {
        if (book.id !== bookId) return book;
        return {
          ...book,
          sections: book.sections.map((sec) => {
            if (sec.id !== sectionId) return sec;
            const maxOrder = sec.articles.reduce((m, a) => Math.max(m, a.order ?? 0), -1);
            const nextOrder = maxOrder + 1;
            return {
              ...sec,
              articles: [
                ...sec.articles,
                {
                  id,
                  articleNumber: articleNumber || String(nextOrder + 1),
                  title: title || 'Nouvel article',
                  content: content || '',
                  updatedAt: ts,
                  isEditable: true,
                  order: nextOrder,
                },
              ].sort((x, y) => x.order - y.order),
            };
          }),
        };
      }),
    };
  });
}

export function moveArticleInRegistry(codes, codeSlug, articleId, direction) {
  return codes.map((code) => {
    if (code.slug !== codeSlug) return code;
    return {
      ...code,
      books: code.books.map((book) => ({
        ...book,
        sections: book.sections.map((sec) => {
          const sorted = [...sec.articles].sort((a, b) => a.order - b.order);
          const idx = sorted.findIndex((a) => a.id === articleId);
          if (idx < 0) return sec;
          const swapWith = direction === 'up' ? idx - 1 : idx + 1;
          if (swapWith < 0 || swapWith >= sorted.length) return sec;
          const a = sorted[idx];
          const b = sorted[swapWith];
          const next = sorted.map((art) => {
            if (art.id === a.id) return { ...art, order: b.order };
            if (art.id === b.id) return { ...art, order: a.order };
            return art;
          });
          return { ...sec, articles: next.sort((x, y) => x.order - y.order) };
        }),
      })),
    };
  });
}

/** Liste plate pour recherche : { codeSlug, codeTitle, bookTitle, sectionTitle, article } */
export function flattenArticlesForSearch(codes) {
  const out = [];
  for (const code of codes) {
    for (const book of code.books || []) {
      for (const sec of book.sections || []) {
        for (const art of sec.articles || []) {
          out.push({
            codeSlug: code.slug,
            codeTitle: code.title,
            bookTitle: book.title,
            sectionTitle: sec.title,
            article: art,
          });
        }
      }
    }
  }
  return out;
}
