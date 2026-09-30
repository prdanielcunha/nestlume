export type BibleConnection = {
  target: string;
  bookCode: string;
  chapter: number;
  startVerse: number;
  endVerse?: number;
  votes: number;
};

export type ConnectionChapter = {
  schemaVersion: 1;
  source: string;
  canonicalSource: string;
  mirror: string;
  mirrorBlobSha1: string;
  license: string;
  attribution: string;
  transformation: string;
  book: string;
  chapter: number;
  verses: Array<{ verse: number; links: BibleConnection[] }>;
};

const cache = new Map<string, Promise<ConnectionChapter>>();

export async function loadConnections(bookCode: string, chapter: number): Promise<ConnectionChapter> {
  const book = bookCode.toUpperCase();
  const key = `${book}:${chapter}`;
  if (!cache.has(key)) {
    cache.set(key, fetch(`/connections/openbible/${book}/${chapter}.json`, {
      credentials: 'same-origin',
      cache: 'force-cache',
    }).then(async response => {
      if (!response.ok) throw new Error(`Referências relacionadas indisponíveis (${response.status}).`);
      const value = await response.json() as ConnectionChapter;
      if (value.schemaVersion !== 1 || value.book !== book || value.chapter !== chapter || !Array.isArray(value.verses)) {
        throw new Error('Pacote de referências relacionadas inválido.');
      }
      return value;
    }).catch(error => {
      cache.delete(key);
      throw error;
    }));
  }
  return cache.get(key)!;
}

export function linksForPassage(
  data: ConnectionChapter,
  startVerse?: number,
  endVerse?: number,
  limit = 20,
): BibleConnection[] {
  const min = startVerse ?? 1;
  const max = endVerse ?? Number.MAX_SAFE_INTEGER;
  const merged = new Map<string, BibleConnection>();

  for (const row of data.verses) {
    if (row.verse < min || row.verse > max) continue;
    for (const link of row.links) {
      const key = `${link.bookCode}:${link.chapter}:${link.startVerse}:${link.endVerse ?? link.startVerse}`;
      const prior = merged.get(key);
      if (!prior || link.votes > prior.votes) merged.set(key, link);
    }
  }

  return [...merged.values()]
    .sort((a, b) => b.votes - a.votes || a.target.localeCompare(b.target))
    .slice(0, limit);
}
