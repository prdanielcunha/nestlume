import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve('public/corpus/blivre/2018.2.0');
const booksDir = path.join(root, 'tr');
const manifestPath = path.join(root, 'manifest.json');
const checkOnly = process.argv.includes('--check');

function field(raw, marker) {
  const re = new RegExp('\\\\' + marker + '\\s*\\r?\\n([^\\r\\n]+)');
  return raw.match(re)?.[1]?.trim() ?? '';
}

export function cleanVerseBody(body) {
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

export function parseBook(raw, file) {
  const marker = /\\v\s+([^\s.]+)\.(\d+)\.(\d+)\s*\r?\n?/g;
  const matches = [...raw.matchAll(marker)];
  const verses = matches.map((m, i) => ({
    chapter: Number(m[2]),
    verse: Number(m[3]),
    text: cleanVerseBody(raw.slice((m.index ?? 0) + m[0].length, i + 1 < matches.length ? matches[i + 1].index : raw.length)),
  }));
  if (!verses.length) throw new Error(`No verses parsed from ${file}`);
  return {
    file,
    nameLong: field(raw, 'name-long'),
    nameShort: field(raw, 'name-short'),
    abbreviation: field(raw, 'abbreviation'),
    ubsCode: field(raw, 'ubs-code'),
    chapters: Math.max(...verses.map(v => v.chapter)),
    verseCount: verses.length,
    verses,
  };
}

function gitBlobSha1(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash('sha1').update(header).update(buffer).digest('hex');
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const expected = new Map(manifest.files.map(x => [x.name, x]));
const files = fs.readdirSync(booksDir).filter(x => x.endsWith('.txt')).sort();
if (files.length !== 66) throw new Error(`Expected 66 books, found ${files.length}`);

const books = [];
for (const file of files) {
  const buffer = fs.readFileSync(path.join(booksDir, file));
  const raw = buffer.toString('utf8');
  const source = expected.get(file);
  if (!source) throw new Error(`Missing manifest entry for ${file}`);
  const actualHash = gitBlobSha1(buffer);
  if (actualHash !== source.gitBlobSha1) throw new Error(`Integrity mismatch for ${file}: ${actualHash} != ${source.gitBlobSha1}`);
  books.push(parseBook(raw, file));
}

const chapterCount = books.reduce((sum, b) => sum + b.chapters, 0);
const verseCount = books.reduce((sum, b) => sum + b.verseCount, 0);
if (chapterCount !== 1189) throw new Error(`Expected 1189 chapters, found ${chapterCount}`);
if (verseCount !== 31102) throw new Error(`Expected 31102 verses for the pinned TR corpus, found ${verseCount}`);

const catalog = {
  schemaVersion: 1,
  edition: manifest.edition,
  integrity: manifest.integrity,
  bookCount: books.length,
  chapterCount,
  verseCount,
  books: books.map(({ verses, ...book }) => ({
    ...book,
    gitBlobSha1: expected.get(book.file)?.gitBlobSha1 ?? '',
  })),
};

const searchIndex = books.flatMap(book => book.verses.map(v => ({
  b: book.ubsCode,
  n: book.nameShort,
  f: book.file,
  c: v.chapter,
  v: v.verse,
  t: v.text,
  q: v.text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(),
})));

if (!checkOnly) {
  fs.writeFileSync(path.join(root, 'catalog.json'), JSON.stringify(catalog));
  fs.writeFileSync(path.join(root, 'search-index.json'), JSON.stringify(searchIndex));
}

console.log(JSON.stringify({ books: books.length, chapters: chapterCount, verses: verseCount, indexedVerses: searchIndex.length, mode: checkOnly ? 'check' : 'build' }));
