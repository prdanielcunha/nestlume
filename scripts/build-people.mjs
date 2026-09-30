import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SOURCE_REPO='STEPBible/STEPBible-Data';
const SOURCE_COMMIT='b99716b0cddb648ddb95cc786a197180f2f97d48';
const SOURCE_PATH='Proper Nouns/TIPNR - Translators Individualised Proper Names with all References - STEPBible.org CC BY.txt';
const EXPECTED_BLOB='6fd63c7a5fe651a412f6bfd7dd22398e07d95001';
const EXPECTED_BYTES=7967205;
const CACHE_PATH=path.resolve('.cache/stepbible',EXPECTED_BLOB+'.txt');
const OUTPUT=path.resolve('public/entities/people');

const BOOK_CODES={
 Gen:'GEN',Exo:'EXO',Lev:'LEV',Num:'NUM',Deu:'DEU',Jos:'JOS',Jdg:'JDG',Rut:'RUT','1Sa':'1SA','2Sa':'2SA',
 '1Ki':'1KI','2Ki':'2KI','1Ch':'1CH','2Ch':'2CH',Ezr:'EZR',Neh:'NEH',Est:'EST',Job:'JOB',Psa:'PSA',Pro:'PRO',
 Ecc:'ECC',Sng:'SNG',Isa:'ISA',Jer:'JER',Lam:'LAM',Ezk:'EZK',Dan:'DAN',Hos:'HOS',Jol:'JOL',Amo:'AMO',Oba:'OBA',
 Jon:'JON',Mic:'MIC',Nam:'NAM',Hab:'HAB',Zep:'ZEP',Hag:'HAG',Zec:'ZEC',Mal:'MAL',Mat:'MAT',Mrk:'MRK',Luk:'LUK',
 Jhn:'JHN',Act:'ACT',Rom:'ROM','1Co':'1CO','2Co':'2CO',Gal:'GAL',Eph:'EPH',Php:'PHP',Col:'COL','1Th':'1TH',
 '2Th':'2TH','1Ti':'1TI','2Ti':'2TI',Tit:'TIT',Phm:'PHM',Heb:'HEB',Jas:'JAS','1Pe':'1PE','2Pe':'2PE',
 '1Jn':'1JN','2Jn':'2JN','3Jn':'3JN',Jud:'JUD',Rev:'REV'
};

function gitBlobSha1(buffer){
 const header=Buffer.from(`blob ${buffer.length}\0`);
 return crypto.createHash('sha1').update(header).update(buffer).digest('hex');
}
async function sourceText(){
 fs.mkdirSync(path.dirname(CACHE_PATH),{recursive:true});
 let buffer;
 if(fs.existsSync(CACHE_PATH)) buffer=fs.readFileSync(CACHE_PATH);
 else{
  const url=`https://raw.githubusercontent.com/${SOURCE_REPO}/${SOURCE_COMMIT}/${SOURCE_PATH.split('/').map(encodeURIComponent).join('/')}`;
  const response=await fetch(url,{signal:AbortSignal.timeout(90_000),headers:{'user-agent':'NestLume-build/1.0'}});
  if(!response.ok) throw new Error(`TIPNR HTTP ${response.status}`);
  buffer=Buffer.from(await response.arrayBuffer());
 }
 if(buffer.length!==EXPECTED_BYTES) throw new Error(`TIPNR size mismatch: ${buffer.length}`);
 const hash=gitBlobSha1(buffer);
 if(hash!==EXPECTED_BLOB) throw new Error(`TIPNR blob mismatch: ${hash}`);
 if(!fs.existsSync(CACHE_PATH)) fs.writeFileSync(CACHE_PATH,buffer);
 return buffer.toString('utf8');
}
function parseExactRef(raw){
 const match=String(raw||'').trim().match(/^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)[a-z]?$/);
 if(!match) return null;
 const book=BOOK_CODES[match[1]];
 if(!book) return null;
 return {book,chapter:Number(match[2]),verse:Number(match[3])};
}
function cleanRelationNames(raw){
 return String(raw||'')
  .split(/[,+]/)
  .map(part=>part.trim())
  .filter(Boolean)
  .map(part=>part.replace(/\(.[^)]*\)$/,'').split('@')[0].trim())
  .filter(Boolean)
  .slice(0,40);
}
function originalFromStrongCell(raw){
 const equal=String(raw||'').indexOf('=');
 return equal>=0?String(raw).slice(equal+1).trim():'';
}
function strongFromStrongCell(raw){
 const left=String(raw||'').split('=')[0];
 return left.split('«')[0].trim();
}

const raw=await sourceText();
const chunks=raw.split(/(?=^\$=+\s*PERSON\(s\))/m);
const byChapter=new Map();
let people=0;
let exactOccurrences=0;
let discardedAiDescriptionFields=0;

for(const chunk of chunks){
 if(!/^\$=+\s*PERSON\(s\)/m.test(chunk)) continue;
 const lines=chunk.split(/\r?\n/);
 const headerIndex=lines.findIndex(line=>/^\$=+\s*PERSON\(s\)/.test(line));
 const header=lines[headerIndex+1]?.split('\t')||[];
 if(header.length<2) continue;
 const identity=String(header[0]||'').trim();
 if(!identity||identity.startsWith('UnifiedName')) continue;

 const eq=identity.lastIndexOf('=');
 const uniqueName=(eq>=0?identity.slice(0,eq):identity).trim();
 const uStrong=(eq>=0?identity.slice(eq+1):'').trim();
 const name=uniqueName.split('@')[0].trim();
 if(!name) continue;

 const person={
  id:uStrong||crypto.createHash('sha1').update(uniqueName).digest('hex').slice(0,12),
  uniqueName,
  name,
  kind:String(header[8]||'').trim()||'Person',
  tribe:String(header[6]||'').trim(),
  relations:{
   parents:cleanRelationNames(header[2]),
   siblings:cleanRelationNames(header[3]),
   partners:cleanRelationNames(header[4]),
   offspring:cleanRelationNames(header[5]),
  },
  forms:[],
 };
 people+=1;

 const refs=new Map();
 for(let i=headerIndex+2;i<lines.length;i++){
  const line=lines[i];
  if(!line||line.startsWith('$')) break;
  if(/^@(?:Brief|Short|Article)/.test(line)){discardedAiDescriptionFields+=1;continue;}
  if(!line.startsWith('–')) continue;
  const cols=line.split('\t');
  const significance=String(cols[0]||'').replace(/^–\s*/,'').trim();
  if(!significance||significance==='Total') continue;
  const strong=strongFromStrongCell(cols[2]);
  const original=originalFromStrongCell(cols[2]);
  const translatedName=String(cols[3]||'').trim();
  const referenceCell=String(cols[4]||'');
  const exactRefs=referenceCell.split(';').map(parseExactRef).filter(Boolean);
  if(exactRefs.length){
   person.forms.push({significance,strong,original,translatedName});
   for(const ref of exactRefs) refs.set(`${ref.book}.${ref.chapter}.${ref.verse}`,ref);
  }
 }

 for(const ref of refs.values()){
  const key=`${ref.book}.${ref.chapter}`;
  if(!byChapter.has(key)) byChapter.set(key,new Map());
  const verses=byChapter.get(key);
  if(!verses.has(ref.verse)) verses.set(ref.verse,[]);
  const list=verses.get(ref.verse);
  if(!list.some(item=>item.id===person.id)) list.push(person);
  exactOccurrences+=1;
 }
}

fs.rmSync(OUTPUT,{recursive:true,force:true});
let packages=0;
let linkedVerses=0;
for(const [key,verses] of [...byChapter.entries()].sort()){
 const [book,chapterText]=key.split('.');
 const chapter=Number(chapterText);
 const payload={
  schemaVersion:1,
  source:'STEP Bible TIPNR',
  sourceCommit:SOURCE_COMMIT,
  sourceBlobSha1:EXPECTED_BLOB,
  license:'CC BY 4.0',
  attribution:'STEP Bible — https://www.STEPBible.org/',
  editorialBoundary:'AI-generated @Brief/@Short/@Article fields are intentionally discarded; this package contains structured identity/reference/relationship data only.',
  book,chapter,
  verses:[...verses.entries()].sort((a,b)=>a[0]-b[0]).map(([verse,list])=>{
   linkedVerses+=1;
   return {verse,people:list.sort((a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id))};
  })
 };
 const dir=path.join(OUTPUT,book);
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,`${chapter}.json`),JSON.stringify(payload));
 packages+=1;
}
fs.mkdirSync(OUTPUT,{recursive:true});
fs.writeFileSync(path.join(OUTPUT,'manifest.json'),JSON.stringify({
 schemaVersion:1,sourceCommit:SOURCE_COMMIT,sourceBlobSha1:EXPECTED_BLOB,license:'CC BY 4.0',
 people,exactOccurrences,packages,linkedVerses,discardedAiDescriptionFields,
},null,2)+'\n');
console.log(JSON.stringify({people,exactOccurrences,packages,linkedVerses,discardedAiDescriptionFields,sourceBlobSha1:EXPECTED_BLOB}));
