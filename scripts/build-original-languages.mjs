import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import manifest from '../src/editorial/lexical/step-source-manifest.json' with { type: 'json' };

const ROOT = path.resolve('public/original/step');
const CACHE = path.resolve('.cache/stepbible');
const BIBLE_DIR = path.resolve('public/corpus/blivre/2018.2.0/tr');
const SOURCE_REPO = 'STEPBible/STEPBible-Data';
const COMMIT = manifest.commit;
const ONLY_CHECK = process.argv.includes('--check');

const BOOK_CODES = {
  Gen:'GEN', Exo:'EXO', Lev:'LEV', Num:'NUM', Deu:'DEU', Jos:'JOS', Jdg:'JDG', Rut:'RUT',
  '1Sa':'1SA', '2Sa':'2SA', '1Ki':'1KI', '2Ki':'2KI', '1Ch':'1CH', '2Ch':'2CH',
  Ezr:'EZR', Neh:'NEH', Est:'EST', Job:'JOB', Psa:'PSA', Pro:'PRO', Ecc:'ECC', Sng:'SNG',
  Isa:'ISA', Jer:'JER', Lam:'LAM', Ezk:'EZK', Dan:'DAN', Hos:'HOS', Jol:'JOL', Amo:'AMO',
  Oba:'OBA', Jon:'JON', Mic:'MIC', Nam:'NAM', Hab:'HAB', Zep:'ZEP', Hag:'HAG', Zec:'ZEC', Mal:'MAL',
  Mat:'MAT', Mrk:'MRK', Luk:'LUK', Jhn:'JHN', Act:'ACT', Rom:'ROM', '1Co':'1CO', '2Co':'2CO',
  Gal:'GAL', Eph:'EPH', Php:'PHP', Col:'COL', '1Th':'1TH', '2Th':'2TH', '1Ti':'1TI', '2Ti':'2TI',
  Tit:'TIT', Phm:'PHM', Heb:'HEB', Jas:'JAS', '1Pe':'1PE', '2Pe':'2PE', '1Jn':'1JN', '2Jn':'2JN',
  '3Jn':'3JN', Jud:'JUD', Rev:'REV',
};

function gitBlobSha1(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash('sha1').update(header).update(buffer).digest('hex');
}

function sourceUrl(sourcePath) {
  return `https://raw.githubusercontent.com/${SOURCE_REPO}/${COMMIT}/${sourcePath.split('/').map(encodeURIComponent).join('/')}`;
}

async function fetchPinned(dataset) {
  fs.mkdirSync(CACHE, { recursive: true });
  const cachePath = path.join(CACHE, `${dataset.id}-${dataset.gitBlobSha1}.txt`);
  let buffer;

  if (fs.existsSync(cachePath)) {
    buffer = fs.readFileSync(cachePath);
  } else {
    const response = await fetch(sourceUrl(dataset.path), {
      headers: { 'user-agent': 'NestLume-build/1.0' },
      signal: AbortSignal.timeout(120_000),
    });
    if (!response.ok) throw new Error(`${dataset.id}: HTTP ${response.status} from pinned source`);
    buffer = Buffer.from(await response.arrayBuffer());
  }

  if (buffer.length !== dataset.sizeBytes) {
    throw new Error(`${dataset.id}: size mismatch ${buffer.length} != ${dataset.sizeBytes}`);
  }
  const actual = gitBlobSha1(buffer);
  if (actual !== dataset.gitBlobSha1) {
    throw new Error(`${dataset.id}: Git blob mismatch ${actual} != ${dataset.gitBlobSha1}`);
  }

  if (!fs.existsSync(cachePath)) fs.writeFileSync(cachePath, buffer);
  return buffer.toString('utf8');
}

function normalizeText(value) {
  return value.normalize('NFC').trim();
}

function parseLexicon(raw, language) {
  const byDStrong = new Map();
  const byEStrong = new Map();

  for (const line of raw.split(/\r?\n/)) {
    const cols = line.split('\t');
    if (cols.length < 8) continue;
    const eStrong = cols[0]?.trim();
    if (!/^[GH]\d+[A-Za-z]?$/.test(eStrong)) continue;

    const dStrong = cols[1]?.trim() || eStrong;
    const entry = {
      d: dStrong,
      e: eStrong,
      l: normalizeText(cols[3] || ''),
      tr: normalizeText(cols[4] || ''),
      g: (cols[6] || '').trim(),
      lang: language,
    };
    if (!entry.l || !entry.g) continue;
    if (!byDStrong.has(dStrong)) byDStrong.set(dStrong, entry);
    if (!byEStrong.has(eStrong)) byEStrong.set(eStrong, entry);
  }

  return { byDStrong, byEStrong };
}

function splitLemmaGloss(raw) {
  const index = raw.indexOf('=');
  if (index < 0) return { lemma: normalizeText(raw), gloss: '' };
  return {
    lemma: normalizeText(raw.slice(0, index)),
    gloss: raw.slice(index + 1).trim(),
  };
}

function splitGreekSurface(raw) {
  const value = normalizeText(raw);
  const match = value.match(/^(.*)\s+\(([^()]*)\)\s*$/);
  if (!match) return { surface: value, transliteration: '' };
  return { surface: normalizeText(match[1]), transliteration: normalizeText(match[2]) };
}

function parseGreek(raw) {
  const chapters = new Map();
  let rows = 0;
  let kept = 0;

  for (const line of raw.split(/\r?\n/)) {
    const cols = line.split('\t');
    if (cols.length < 6) continue;
    const ref = cols[0]?.match(/^([A-Za-z0-9]+)\.(\d+)\.(\d+).*?#(\d+)/);
    if (!ref) continue;
    rows += 1;

    const editions = new Set((cols[5] || '').split('+').map(x => x.trim()).filter(Boolean));
    if (!editions.has('TR')) continue;

    const book = BOOK_CODES[ref[1]];
    if (!book) throw new Error(`Unknown TAGNT book code: ${ref[1]}`);
    const chapter = Number(ref[2]);
    const verse = Number(ref[3]);
    const position = Number(ref[4]);
    const { surface, transliteration } = splitGreekSurface(cols[1] || '');
    if (!surface) continue;

    const dCell = (cols[3] || '').trim();
    const eq = dCell.indexOf('=');
    const dStrong = (eq >= 0 ? dCell.slice(0, eq) : dCell).trim();
    const morph = (eq >= 0 ? dCell.slice(eq + 1) : '').trim();
    const { lemma, gloss } = splitLemmaGloss(cols[4] || '');

    const key = `${book}.${chapter}`;
    if (!chapters.has(key)) chapters.set(key, new Map());
    const verses = chapters.get(key);
    if (!verses.has(verse)) verses.set(verse, new Map());
    const tokens = verses.get(verse);
    if (!tokens.has(position)) {
      tokens.set(position, {
        p: position,
        s: surface,
        tr: transliteration,
        en: (cols[2] || '').trim(),
        d: dStrong,
        m: morph,
        l: lemma,
        g: gloss,
      });
      kept += 1;
    }
  }

  return { chapters, rows, kept };
}

function rootDStrong(value) {
  const raw = (value || '').trim().replace(/^\{/, '').replace(/\}$/, '');
  return raw.replace(/_[A-Za-z0-9]+$/, '');
}

function rootMorph(dStrongCell, grammarCell) {
  const ds = String(dStrongCell || '').split('/');
  const gs = String(grammarCell || '').split('/');
  const idx = ds.findIndex(part => part.includes('{'));
  return normalizeText((idx >= 0 && idx < gs.length ? gs[idx] : grammarCell) || '');
}

function lookupHebrewLexicon(lexicon, dStrong) {
  if (!dStrong) return null;
  const exact = lexicon.byDStrong.get(dStrong);
  if (exact) return exact;
  const normalized = dStrong.replace(/_[A-Za-z0-9]+$/, '');
  if (lexicon.byDStrong.has(normalized)) return lexicon.byDStrong.get(normalized);
  const base = normalized.match(/^H0*(\d+)/);
  if (!base) return null;
  const numeric = Number(base[1]);
  for (const [key, value] of lexicon.byEStrong) {
    const match = key.match(/^H0*(\d+)/);
    if (match && Number(match[1]) === numeric) return value;
  }
  return null;
}

function parseHebrew(raw, lexicon) {
  const chapters = new Map();
  let rows = 0;
  let kept = 0;

  for (const line of raw.split(/\r?\n/)) {
    const cols = line.split('\t');
    if (cols.length < 9) continue;
    const ref = cols[0]?.match(/^([A-Za-z0-9]+)\.(\d+)\.(\d+).*?#(\d+)/);
    if (!ref) continue;
    rows += 1;

    const book = BOOK_CODES[ref[1]];
    if (!book) throw new Error(`Unknown TAHOT book code: ${ref[1]}`);
    const chapter = Number(ref[2]);
    const verse = Number(ref[3]);
    if (verse === 0) continue;
    const position = Number(ref[4]);

    const surface = normalizeText((cols[1] || '').replaceAll('/', '').replaceAll('\\', ''));
    if (!surface) continue;
    const dStrong = rootDStrong(cols[8]);
    const lexical = lookupHebrewLexicon(lexicon, dStrong);

    const key = `${book}.${chapter}`;
    if (!chapters.has(key)) chapters.set(key, new Map());
    const verses = chapters.get(key);
    if (!verses.has(verse)) verses.set(verse, new Map());
    const tokens = verses.get(verse);
    if (!tokens.has(position)) {
      tokens.set(position, {
        p: position,
        s: surface,
        tr: normalizeText(cols[2] || lexical?.tr || ''),
        en: (cols[3] || '').trim(),
        d: dStrong,
        m: rootMorph(cols[4], cols[5]),
        l: lexical?.l || '',
        g: lexical?.g || '',
      });
      kept += 1;
    }
  }

  return { chapters, rows, kept };
}

function corpusCodes() {
  const codes = new Set();
  for (const file of fs.readdirSync(BIBLE_DIR).filter(name => name.endsWith('.txt'))) {
    const raw = fs.readFileSync(path.join(BIBLE_DIR, file), 'utf8');
    const code = raw.match(/\\ubs-code\s*\r?\n([^\r\n]+)/)?.[1]?.trim();
    if (code) codes.add(code);
  }
  if (codes.size !== 66) throw new Error(`Expected 66 BLIVRE book codes, found ${codes.size}`);
  return codes;
}

function writeChapterPackages(allChapters, validCodes, metadata) {
  if (!ONLY_CHECK) fs.rmSync(ROOT, { recursive: true, force: true });
  let chapterCount = 0;
  let verseCount = 0;
  let tokenCount = 0;
  const books = new Set();

  for (const [key, verses] of [...allChapters.entries()].sort()) {
    const [book, chapterText] = key.split('.');
    const chapter = Number(chapterText);
    if (!validCodes.has(book)) throw new Error(`Original-language package does not map to BLIVRE book code ${book}`);
    books.add(book);

    const payload = {
      schemaVersion: 1,
      sourceCommit: COMMIT,
      license: 'CC BY 4.0',
      attribution: 'STEP Bible — https://www.STEPBible.org/',
      book,
      chapter,
      language: metadata.languageFor(book),
      direction: metadata.languageFor(book) === 'hbo' ? 'rtl' : 'ltr',
      alignment: 'verse-level; no automatic word-to-Portuguese alignment',
      verses: [...verses.entries()].sort((a,b)=>a[0]-b[0]).map(([verse, tokens]) => ({
        v: verse,
        tokens: [...tokens.values()].sort((a,b)=>a.p-b.p),
      })),
    };

    chapterCount += 1;
    verseCount += payload.verses.length;
    tokenCount += payload.verses.reduce((sum, row) => sum + row.tokens.length, 0);

    if (!ONLY_CHECK) {
      const dir = path.join(ROOT, 'chapters', book);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${chapter}.json`), JSON.stringify(payload));
    }
  }

  if (books.size !== 66) throw new Error(`Expected original-language data for 66 books, found ${books.size}`);
  if (chapterCount < 1180) throw new Error(`Unexpectedly low chapter coverage: ${chapterCount}`);

  return { books: books.size, chapters: chapterCount, verses: verseCount, tokens: tokenCount };
}

async function main() {
  const byId = new Map(manifest.datasets.map(dataset => [dataset.id, dataset]));
  const required = ['TBESG','TBESH','TAGNT-MAT-JHN','TAGNT-ACT-REV','TAHOT-GEN-DEU','TAHOT-JOS-EST','TAHOT-JOB-SNG','TAHOT-ISA-MAL'];
  for (const id of required) if (!byId.has(id)) throw new Error(`Missing pinned dataset ${id}`);

  const validCodes = corpusCodes();
  const [tbesgRaw, tbeshRaw] = await Promise.all([
    fetchPinned(byId.get('TBESG')),
    fetchPinned(byId.get('TBESH')),
  ]);
  const greekLexicon = parseLexicon(tbesgRaw, 'grc');
  const hebrewLexicon = parseLexicon(tbeshRaw, 'hbo');

  const allChapters = new Map();
  const stats = { sourceCommit: COMMIT, greekRows:0, greekTokens:0, hebrewRows:0, hebrewTokens:0 };

  for (const id of ['TAGNT-MAT-JHN','TAGNT-ACT-REV']) {
    const parsed = parseGreek(await fetchPinned(byId.get(id)));
    stats.greekRows += parsed.rows;
    stats.greekTokens += parsed.kept;
    for (const [key, value] of parsed.chapters) allChapters.set(key, value);
  }

  for (const id of ['TAHOT-GEN-DEU','TAHOT-JOS-EST','TAHOT-JOB-SNG','TAHOT-ISA-MAL']) {
    const parsed = parseHebrew(await fetchPinned(byId.get(id)), hebrewLexicon);
    stats.hebrewRows += parsed.rows;
    stats.hebrewTokens += parsed.kept;
    for (const [key, value] of parsed.chapters) allChapters.set(key, value);
  }

  const coverage = writeChapterPackages(allChapters, validCodes, {
    languageFor: book => ['MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV'].includes(book) ? 'grc' : 'hbo',
  });

  const outputManifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: SOURCE_REPO,
    sourceCommit: COMMIT,
    sourceLicense: 'CC BY 4.0',
    attribution: 'STEP Bible — https://www.STEPBible.org/',
    ntSelection: 'TAGNT tokens attested in TR, matching the integrated BLIVRE NT textual tradition at word-selection level',
    otSelection: 'TAHOT primary English/NRSV reference; verse 0 superscriptions omitted',
    portugueseAlignment: 'none automatic',
    ...coverage,
    buildStats: stats,
  };

  if (!ONLY_CHECK) {
    fs.mkdirSync(ROOT, { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'manifest.json'), JSON.stringify(outputManifest, null, 2) + '\n');
  }

  console.log(JSON.stringify(outputManifest));
}

await main();
