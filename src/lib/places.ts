export type ModernPlaceCandidate = {
  id: string;
  name: string;
  score: number;
  slug: string;
};

export type BiblicalPlace = {
  id: string;
  name: string;
  type: string;
  urlSlug: string;
  associations: ModernPlaceCandidate[];
};

export type PlaceChapter = {
  schemaVersion: 1;
  source: string;
  sourceCommit: string;
  sourceBlobSha1: string;
  canonicalSource: string;
  license: 'CC BY 4.0';
  attribution: string;
  scoreNote: string;
  book: string;
  chapter: number;
  verses: Array<{ verse: number; places: BiblicalPlace[] }>;
};

const cache = new Map<string, Promise<PlaceChapter>>();

export async function loadPlaces(bookCode: string, chapter: number): Promise<PlaceChapter> {
  const book=bookCode.toUpperCase();
  const key=`${book}:${chapter}`;
  if(!cache.has(key)){
    cache.set(key,fetch(`/entities/places/${book}/${chapter}.json`,{credentials:'same-origin',cache:'force-cache'})
      .then(async response=>{
        if(!response.ok) throw new Error(`Dados de lugares indisponíveis (${response.status}).`);
        const value=await response.json() as PlaceChapter;
        if(value.schemaVersion!==1||value.book!==book||value.chapter!==chapter||!Array.isArray(value.verses)) throw new Error('Pacote de lugares inválido.');
        return value;
      })
      .catch(error=>{cache.delete(key);throw error;}));
  }
  return cache.get(key)!;
}

export function placesForPassage(data: PlaceChapter,startVerse?:number,endVerse?:number): BiblicalPlace[] {
  const min=startVerse??1;
  const max=endVerse??Number.MAX_SAFE_INTEGER;
  const merged=new Map<string,BiblicalPlace>();
  for(const row of data.verses){
    if(row.verse<min||row.verse>max) continue;
    for(const place of row.places) if(!merged.has(place.id)) merged.set(place.id,place);
  }
  return [...merged.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
