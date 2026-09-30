import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SOURCE_REPO = 'openbibleinfo/Bible-Geocoding-Data';
const SOURCE_COMMIT = '7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f';
const SOURCE_PATH = 'data/ancient.jsonl';
const EXPECTED_BLOB = 'b127b4446c6f4ba36ec62dde290c752afeb51bf3';
const EXPECTED_BYTES = 11550193;
const CACHE_PATH = path.resolve('.cache/openbible-geo', EXPECTED_BLOB + '.jsonl');
const OUTPUT = path.resolve('public/entities/places');

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

async function getSource() {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  let buffer;
  if (fs.existsSync(CACHE_PATH)) {
    buffer = fs.readFileSync(CACHE_PATH);
  } else {
    const url = `https://raw.githubusercontent.com/${SOURCE_REPO}/${SOURCE_COMMIT}/${SOURCE_PATH}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(90_000), headers: { 'user-agent':'NestLume-build/1.0' } });
    if (!response.ok) throw new Error(`Place source HTTP ${response.status}`);
    buffer = Buffer.from(await response.arrayBuffer());
  }
  if (buffer.length !== EXPECTED_BYTES) throw new Error(`Place source size mismatch: ${buffer.length}`);
  const hash = gitBlobSha1(buffer);
  if (hash !== EXPECTED_BLOB) throw new Error(`Place source blob mismatch: ${hash}`);
  if (!fs.existsSync(CACHE_PATH)) fs.writeFileSync(CACHE_PATH, buffer);
  return buffer.toString('utf8');
}

function parseOsis(value) {
  const match = String(value || '').match(/^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  const book = aliases[match[1]];
  if (!book) return null;
  return { book, chapter:Number(match[2]), verse:Number(match[3]) };
}

function cleanName(value) {
  return String(value || '')
    .replace(/^\[([^\]]+)\]\([^)]*\)$/, '$1')
    .trim();
}

const raw = await getSource();
const byChapter = new Map();
let places = 0;
let verseLinks = 0;
let unresolvedRefs = 0;

for (const line of raw.split(/\r?\n/)) {
  if (!line.trim()) continue;
  const item = JSON.parse(line);
  if (!item?.id || !Array.isArray(item.verses)) continue;
  places += 1;

  const associations = Object.entries(item.modern_associations || {})
    .map(([id, value]) => ({
      id,
      name: String(value?.name || ''),
      score: Number(value?.score || 0),
      slug: String(value?.url_slug || ''),
    }))
    .filter(value => value.name)
    .sort((a,b)=>b.score-a.score || a.name.localeCompare(b.name))
    .slice(0,3);

  const place = {
    id:String(item.id),
    name:cleanName(item.friendly_id || item.name || item.url_slug),
    type:String(item.type || ''),
    urlSlug:String(item.url_slug || ''),
    associations,
  };

  for (const occurrence of item.verses) {
    const ref = parseOsis(occurrence?.osis);
    if (!ref) {
      unresolvedRefs += 1;
      continue;
    }
    const key = `${ref.book}.${ref.chapter}`;
    if (!byChapter.has(key)) byChapter.set(key,new Map());
    const verses = byChapter.get(key);
    if (!verses.has(ref.verse)) verses.set(ref.verse,[]);
    const list = verses.get(ref.verse);
    if (!list.some(existing => existing.id === place.id)) list.push(place);
    verseLinks += 1;
  }
}

fs.rmSync(OUTPUT,{recursive:true,force:true});
let packages=0;
let linkedVerses=0;
for (const [key,verses] of [...byChapter.entries()].sort()) {
  const [book,chapterText]=key.split('.');
  const chapter=Number(chapterText);
  const payload={
    schemaVersion:1,
    source:'OpenBible.info Bible Geocoding Data',
    sourceCommit:SOURCE_COMMIT,
    sourceBlobSha1:EXPECTED_BLOB,
    canonicalSource:'https://github.com/openbibleinfo/Bible-Geocoding-Data',
    license:'CC BY 4.0',
    attribution:'Place data courtesy of OpenBible.info, licensed under CC BY 4.0.',
    scoreNote:'Identification scores are source-dataset evidence summaries, not probabilities and not NestLume verdicts.',
    book,chapter,
    verses:[...verses.entries()].sort((a,b)=>a[0]-b[0]).map(([verse,list])=>{
      linkedVerses+=1;
      return {verse,places:list.sort((a,b)=>a.name.localeCompare(b.name))};
    }),
  };
  const dir=path.join(OUTPUT,book);
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,`${chapter}.json`),JSON.stringify(payload));
  packages+=1;
}
fs.mkdirSync(OUTPUT,{recursive:true});
fs.writeFileSync(path.join(OUTPUT,'manifest.json'),JSON.stringify({
 schemaVersion:1,sourceCommit:SOURCE_COMMIT,sourceBlobSha1:EXPECTED_BLOB,license:'CC BY 4.0',
 places,verseLinks,unresolvedRefs,packages,linkedVerses,
},null,2)+'\n');
console.log(JSON.stringify({places,verseLinks,unresolvedRefs,packages,linkedVerses,sourceBlobSha1:EXPECTED_BLOB}));
