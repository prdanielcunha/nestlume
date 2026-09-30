export type OriginalToken = {
  p: number;
  s: string;
  tr: string;
  en: string;
  d: string;
  m: string;
  l: string;
  g: string;
};

export type OriginalVerse = {
  v: number;
  tokens: OriginalToken[];
};

export type OriginalChapter = {
  schemaVersion: 1;
  sourceCommit: string;
  license: 'CC BY 4.0';
  attribution: string;
  book: string;
  chapter: number;
  language: 'grc' | 'hbo';
  direction: 'ltr' | 'rtl';
  alignment: string;
  verses: OriginalVerse[];
};

const chapterCache = new Map<string, Promise<OriginalChapter>>();

export function originalLanguageForBook(bookCode: string): 'grc' | 'hbo' {
  const nt = new Set([
    'MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL',
    '1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV',
  ]);
  return nt.has(bookCode.toUpperCase()) ? 'grc' : 'hbo';
}

export function loadOriginalChapter(bookCode: string, chapter: number): Promise<OriginalChapter> {
  const book = bookCode.toUpperCase();
  if (!/^[1-3A-Z0-9]{3}$/.test(book) || !Number.isInteger(chapter) || chapter < 1) {
    return Promise.reject(new Error('Referência original inválida.'));
  }

  const key = `${book}:${chapter}`;
  if (!chapterCache.has(key)) {
    chapterCache.set(key, fetch(`/original/step/chapters/${book}/${chapter}.json`, {
      credentials: 'same-origin',
      cache: 'force-cache',
    }).then(async response => {
      if (!response.ok) throw new Error(`Dados do idioma original indisponíveis (${response.status}).`);
      const value = await response.json() as OriginalChapter;
      if (
        value.schemaVersion !== 1 ||
        value.book !== book ||
        value.chapter !== chapter ||
        value.license !== 'CC BY 4.0' ||
        !Array.isArray(value.verses)
      ) {
        throw new Error('Pacote de idioma original inválido.');
      }
      return value;
    }).catch(error => {
      chapterCache.delete(key);
      throw error;
    }));
  }

  return chapterCache.get(key)!;
}

export function findOriginalVerse(chapter: OriginalChapter, verse: number): OriginalVerse | null {
  return chapter.verses.find(row => row.v === verse) ?? null;
}
