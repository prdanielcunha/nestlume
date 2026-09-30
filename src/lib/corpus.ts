import { normalizeText } from './reference';

export type CorpusBook = {
  file: string;
  nameLong: string;
  nameShort: string;
  abbreviation: string;
  ubsCode: string;
  chapters: number;
  verseCount: number;
  gitBlobSha1?: string;
};

export type CorpusCatalog = {
  schemaVersion: number;
  edition: {
    id: string;
    name: string;
    abbreviation: string;
    release: string;
    textualTradition: string;
    license: string;
    attribution: string;
  };
  bookCount: number;
  chapterCount: number;
  verseCount: number;
  books: CorpusBook[];
};

export type CorpusVerse = {
  chapter: number;
  verse: number;
  text: string;
};

export type SearchHit = {
  bookCode: string;
  bookName: string;
  file: string;
  chapter: number;
  verse: number;
  text: string;
};

const ROOT = '/corpus/blivre/2018.2.0';
let catalogPromise: Promise<CorpusCatalog> | null = null;
let indexPromise: Promise<Array<{ b: string; n: string; f: string; c: number; v: number; t: string; q: string }>> | null = null;
const bookCache = new Map<string, Promise<CorpusVerse[]>>();

export function cleanVerseBody(body: string): string {
  return body
    .replace(/\\fn[\s\S]*?\\\*fn/g, ' ')
    .replace(/\\(?:added|it|bd|sc|wj)\s*\r?\n?/g, '')
    .replace(/\\\*(?:added|it|bd|sc|wj)\s*/g, '')
    .replace(/\\(?:key|fr|ft|fq|fqa|fk|fl|fv|xo|xt|xq|xk|xot|xnt)\s*\r?\n?[^\\\r\n]*/g, ' ')
    .replace(/\\\*?[A-Za-z0-9-]+/g, ' ')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseBookText(raw: string): CorpusVerse[] {
  const marker = /\\v\s+([^\s.]+)\.(\d+)\.(\d+)\s*\r?\n?/g;
  const matches = [...raw.matchAll(marker)];
  return matches.map((m, index) => ({
    chapter: Number(m[2]),
    verse: Number(m[3]),
    text: cleanVerseBody(raw.slice((m.index ?? 0) + m[0].length, index + 1 < matches.length ? matches[index + 1].index : raw.length)),
  }));
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'same-origin' });
  if (!response.ok) throw new Error(`Falha ao carregar conteúdo bíblico (${response.status}).`);
  return response.json() as Promise<T>;
}

export function loadCatalog(): Promise<CorpusCatalog> {
  catalogPromise ??= getJson<CorpusCatalog>(`${ROOT}/catalog.json`);
  return catalogPromise;
}

export async function loadBook(file: string): Promise<CorpusVerse[]> {
  const safe = file.replace(/[^a-z0-9.]/gi, '');
  if (safe !== file) throw new Error('Arquivo bíblico inválido.');
  let promise = bookCache.get(file);
  if (!promise) {
    promise = fetch(`${ROOT}/tr/${file}`, { credentials: 'same-origin' }).then(async response => {
      if (!response.ok) throw new Error(`Livro indisponível (${response.status}).`);
      return parseBookText(await response.text());
    });
    bookCache.set(file, promise);
  }
  return promise;
}

export async function loadChapter(file: string, chapter: number): Promise<CorpusVerse[]> {
  const verses = await loadBook(file);
  const result = verses.filter(v => v.chapter === chapter);
  if (!result.length) throw new Error('Capítulo não encontrado nesta edição.');
  return result;
}

export async function getBookByCode(code: string): Promise<CorpusBook | null> {
  const catalog = await loadCatalog();
  return catalog.books.find(book => book.ubsCode.toLowerCase() === code.toLowerCase()) ?? null;
}

export async function getBookByFile(file: string): Promise<CorpusBook | null> {
  const catalog = await loadCatalog();
  return catalog.books.find(book => book.file === file) ?? null;
}

export async function resolveBook(query: string): Promise<CorpusBook | null> {
  const catalog = await loadCatalog();
  const needle = normalizeText(query).replace(/\s+/g, '');
  if (!needle) return null;
  return catalog.books.find(book => {
    const candidates = [book.nameLong, book.nameShort, book.abbreviation, book.ubsCode];
    return candidates.some(value => normalizeText(value).replace(/\s+/g, '') === needle);
  }) ?? null;
}

function loadSearchIndex() {
  indexPromise ??= getJson<Array<{ b: string; n: string; f: string; c: number; v: number; t: string; q: string }>>(`${ROOT}/search-index.json`);
  return indexPromise;
}

export async function searchBible(query: string, limit = 40): Promise<SearchHit[]> {
  const needle = normalizeText(query);
  if (needle.length < 2) return [];
  const terms = needle.split(' ').filter(Boolean);
  const index = await loadSearchIndex();
  const ranked = index
    .map(row => {
      if (!terms.every(term => row.q.includes(term))) return null;
      const phrase = row.q.includes(needle) ? 4 : 0;
      const starts = row.q.startsWith(needle) ? 2 : 0;
      const density = terms.reduce((sum, term) => sum + (row.q.split(term).length - 1), 0);
      return { row, score: phrase + starts + density };
    })
    .filter((x): x is { row: (typeof index)[number]; score: number } => Boolean(x))
    .sort((a, b) => b.score - a.score || a.row.n.localeCompare(b.row.n) || a.row.c - b.row.c || a.row.v - b.row.v)
    .slice(0, limit);
  return ranked.map(({ row }) => ({ bookCode: row.b, bookName: row.n, file: row.f, chapter: row.c, verse: row.v, text: row.t }));
}

export async function identifyPastedText(text: string, limit = 5): Promise<SearchHit[]> {
  const normalized = normalizeText(text);
  const words = normalized.split(' ').filter(Boolean);
  if (words.length < 4) return [];
  const probe = words.slice(0, Math.min(10, words.length)).join(' ');
  const index = await loadSearchIndex();
  const exact = index.filter(row => row.q.includes(probe)).slice(0, limit);
  return exact.map(row => ({ bookCode: row.b, bookName: row.n, file: row.f, chapter: row.c, verse: row.v, text: row.t }));
}

export async function requestOfflineBook(file: string, expectedGitBlobSha1: string | undefined, bookCode: string, chapters: number): Promise<{ originalLanguageOk: boolean; originalLanguageChapters: number; warning?: string }> {
  if (!('serviceWorker' in navigator)) throw new Error('Modo offline não é suportado neste navegador.');
  const registration = await navigator.serviceWorker.ready;
  const worker = registration.active;
  if (!worker) throw new Error('Service worker ainda não está ativo.');
  const url = `${ROOT}/tr/${file}`;

  return await new Promise<{ originalLanguageOk: boolean; originalLanguageChapters: number; warning?: string }>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      navigator.serviceWorker.removeEventListener('message', onMessage);
      reject(new Error('Tempo limite ao preparar o livro para uso offline.'));
    }, 20000);

    function onMessage(event: MessageEvent) {
      const data = event.data ?? {};
      if (data.type !== 'CACHE_BIBLE_BOOK_RESULT' || data.url !== url) return;
      window.clearTimeout(timeout);
      navigator.serviceWorker.removeEventListener('message', onMessage);
      if (data.ok) resolve({
        originalLanguageOk: Boolean(data.originalLanguageOk),
        originalLanguageChapters: Number(data.originalLanguageChapters || 0),
        warning: data.warning || undefined,
      });
      else reject(new Error(data.error || 'Falha ao verificar pacote offline.'));
    }

    navigator.serviceWorker.addEventListener('message', onMessage);
    worker.postMessage({ type: 'CACHE_BIBLE_BOOK', url, expectedGitBlobSha1, bookCode, chapters });
  });
}
