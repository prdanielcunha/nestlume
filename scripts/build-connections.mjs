import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const MIRROR_REPO = 'kbennett2000/concord';
const MIRROR_COMMIT = '698667637c942e89422125501dba8c1a0be37b65';
const SOURCE_PATH = 'data/cross-references/cross_references.txt';
const EXPECTED_BLOB = '301fed486c8842c60dc95e930ec4d4c7bee0e101';
const EXPECTED_BYTES = 8301106;
const CACHE_PATH = path.resolve('.cache/openbible', EXPECTED_BLOB + '.txt');
const OUTPUT = path.resolve('public/connections/openbible');
const MAX_PER_VERSE = 12;

const aliases = {
  Gen:'GEN', Exod:'EXO', Exo:'EXO', Lev:'LEV', Num:'NUM', Deut:'DEU', Deu:'DEU', Josh:'JOS', Jos:'JOS',
  Judg:'JDG', Jdg:'JDG', Ruth:'RUT', Rut:'RUT', '1Sam':'1SA', '1Sa':'1SA', '2Sam':'2SA', '2Sa':'2SA',
  '1Kgs':'1KI', '1Ki':'1KI', '2Kgs':'2KI', '2Ki':'2KI', '1Chr':'1CH', '1Ch':'1CH', '2Chr':'2CH', '2Ch':'2CH',
  Ezra:'EZR', Ezr:'EZR', Neh:'NEH', Esth:'EST', Est:'EST', Job:'JOB', Ps:'PSA', Psa:'PSA', Prov:'PRO', Pro:'PRO',
  Eccl:'ECC', Ecc:'ECC', Song:'SNG', Sng:'SNG', Isa:'ISA', Jer:'JER', Lam:'LAM', Ezek:'EZK', Ezk:'EZK',
  Dan:'DAN', Hos:'HOS', Joel:'JOL', Jol:'JOL', Amos:'AMO', Amo:'AMO', Obad:'OBA', Oba:'OBA', Jonah:'JON', Jon:'JON',
  Mic:'MIC', Nah:'NAM', Nam:'NAM', Hab:'HAB', Zeph:'ZEP', Zep:'ZEP', Hag:'HAG', Zech:'ZEC', Zec:'ZEC', Mal:'MAL',
  Matt:'MAT', Mat:'MAT', Mark:'MRK', Mrk:'MRK', Luke:'LUK', Luk:'LUK', John:'JHN', Jhn:'JHN', Acts:'ACT', Act:'ACT',
  Rom:'ROM', '1Cor':'1CO', '1Co':'1CO', '2Cor':'2CO', '2Co':'2CO', Gal:'GAL', Eph:'EPH', Phil:'PHP', Php:'PHP',
  Col:'COL', '1Thess':'1TH', '1Th':'1TH', '2Thess':'2TH', '2Th':'2TH', '1Tim':'1TI', '1Ti':'1TI', '2Tim':'2TI',
  '2Ti':'2TI', Titus:'TIT', Tit:'TIT', Phlm:'PHM', Phm:'PHM', Heb:'HEB', Jas:'JAS', '1Pet':'1PE', '1Pe':'1PE',
  '2Pet':'2PE', '2Pe':'2PE', '1John':'1JN', '1Jn':'1JN', '2John':'2JN', '2Jn':'2JN', '3John':'3JN', '3Jn':'3JN',
  Jude:'JUD', Jud:'JUD', Rev:'REV',
};

function gitBlobSha1(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash('sha1').update(header).update(buffer).digest('hex');
}

function rawUrl() {
  return `https://raw.githubusercontent.com/${MIRROR_REPO}/${MIRROR_COMMIT}/${SOURCE_PATH}`;
}

async function sourceText() {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  let bytes;
  if (fs.existsSync(CACHE_PATH)) {
    bytes = fs.readFileSync(CACHE_PATH);
  } else {
    const response = await fetch(rawUrl(), { signal: AbortSignal.timeout(60_000), headers: { 'user-agent': 'NestLume-build/1.0' } });
    if (!response.ok) throw new Error(`Cross-reference source HTTP ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
  }
  if (bytes.length !== EXPECTED_BYTES) throw new Error(`Cross-reference size mismatch: ${bytes.length}`);
  const actual = gitBlobSha1(bytes);
  if (actual !== EXPECTED_BLOB) throw new Error(`Cross-reference blob mismatch: ${actual}`);
  if (!fs.existsSync(CACHE_PATH)) fs.writeFileSync(CACHE_PATH, bytes);
  return bytes.toString('utf8');
}

function verseRef(raw) {
  const match = raw.trim().match(/^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  const book = aliases[match[1]];
  if (!book) return null;
  return { book, chapter: Number(match[2]), verse: Number(match[3]) };
}

function targetRef(raw) {
  const parts = raw.trim().split('-');
  const start = verseRef(parts[0]);
  const end = parts[1] ? verseRef(parts[1]) : start;
  if (!start || !end) return null;
  return {
    start,
    end,
    display: start.book === end.book && start.chapter === end.chapter
      ? `${start.book} ${start.chapter}:${start.verse}${start.verse !== end.verse ? `–${end.verse}` : ''}`
      : `${start.book} ${start.chapter}:${start.verse}–${end.book} ${end.chapter}:${end.verse}`,
  };
}

const raw = await sourceText();
const byChapter = new Map();
let rows = 0;
let accepted = 0;
let unresolved = 0;
let attribution = 'Cross-reference data courtesy of OpenBible.info, licensed under Creative Commons Attribution (CC BY).';

for (const line of raw.split(/\r?\n/)) {
  if (!line.trim()) continue;
  if (line.startsWith('#')) {
    if (/OpenBible/i.test(line)) attribution = line.replace(/^#+\s*/, '').trim();
    continue;
  }
  const cols = line.split('\t');
  if (/From Verse/i.test(cols[0] || '')) {
    const embedded = cols.slice(3).filter(Boolean).join(' ').trim();
    if (embedded) attribution = embedded;
    continue;
  }
  if (cols.length < 3) continue;
  rows += 1;

  const from = verseRef(cols[0]);
  const target = targetRef(cols[1]);
  const votes = Number.parseInt(cols[2], 10);
  if (!from || !target || !Number.isFinite(votes)) {
    unresolved += 1;
    continue;
  }

  const key = `${from.book}.${from.chapter}`;
  if (!byChapter.has(key)) byChapter.set(key, new Map());
  const byVerse = byChapter.get(key);
  if (!byVerse.has(from.verse)) byVerse.set(from.verse, []);
  byVerse.get(from.verse).push({
    target: target.display,
    bookCode: target.start.book,
    chapter: target.start.chapter,
    startVerse: target.start.verse,
    endVerse: target.end.book === target.start.book && target.end.chapter === target.start.chapter ? target.end.verse : undefined,
    votes,
  });
  accepted += 1;
}

fs.rmSync(OUTPUT, { recursive: true, force: true });
let packageCount = 0;
let linkedVerses = 0;
let emittedLinks = 0;

for (const [key, verses] of [...byChapter.entries()].sort()) {
  const [book, chapterText] = key.split('.');
  const chapter = Number(chapterText);
  const payload = {
    schemaVersion: 1,
    source: 'OpenBible.info Bible Cross References',
    canonicalSource: 'https://www.openbible.info/labs/cross-references/',
    mirror: `https://github.com/${MIRROR_REPO}/tree/${MIRROR_COMMIT}`,
    mirrorBlobSha1: EXPECTED_BLOB,
    license: 'CC BY',
    attribution,
    transformation: `For each source verse, NestLume keeps at most ${MAX_PER_VERSE} highest-voted links; target references are canonicalized, not interpreted as doctrinal certainty.`,
    book,
    chapter,
    verses: [...verses.entries()].sort((a,b)=>a[0]-b[0]).map(([verse, links]) => {
      const selected = links.sort((a,b)=>b.votes-a.votes || a.target.localeCompare(b.target)).slice(0, MAX_PER_VERSE);
      linkedVerses += 1;
      emittedLinks += selected.length;
      return { verse, links: selected };
    }),
  };
  const dir = path.join(OUTPUT, book);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${chapter}.json`), JSON.stringify(payload));
  packageCount += 1;
}

const result = {
  sourceRows: rows,
  acceptedRows: accepted,
  unresolvedRows: unresolved,
  packages: packageCount,
  linkedVerses,
  emittedLinks,
  sourceBlobSha1: EXPECTED_BLOB,
};
fs.mkdirSync(OUTPUT, { recursive: true });
fs.writeFileSync(path.join(OUTPUT, 'manifest.json'), JSON.stringify({
  ...result,
  source: 'OpenBible.info Bible Cross References',
  canonicalSource: 'https://www.openbible.info/labs/cross-references/',
  license: 'CC BY',
  attribution,
}, null, 2) + '\n');
console.log(JSON.stringify(result));
