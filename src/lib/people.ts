export type BiblicalPerson = {
  id: string;
  uniqueName: string;
  name: string;
  kind: string;
  tribe: string;
  relations: {
    parents: string[];
    siblings: string[];
    partners: string[];
    offspring: string[];
  };
  forms: Array<{
    significance: string;
    strong: string;
    original: string;
    translatedName: string;
  }>;
};

export type PeopleChapter = {
  schemaVersion: 1;
  source: string;
  sourceCommit: string;
  sourceBlobSha1: string;
  license: 'CC BY 4.0';
  attribution: string;
  editorialBoundary: string;
  book: string;
  chapter: number;
  verses: Array<{ verse: number; people: BiblicalPerson[] }>;
};

const cache = new Map<string, Promise<PeopleChapter>>();

export async function loadPeople(bookCode: string, chapter: number): Promise<PeopleChapter> {
  const book = bookCode.toUpperCase();
  const key = `${book}:${chapter}`;

  if (!cache.has(key)) {
    cache.set(
      key,
      fetch(`/entities/people/${book}/${chapter}.json`, {
        credentials: 'same-origin',
        cache: 'force-cache',
      })
        .then(async response => {
          if (!response.ok) throw new Error(`Dados de pessoas indisponíveis (${response.status}).`);
          const value = await response.json() as PeopleChapter;
          if (
            value.schemaVersion !== 1 ||
            value.book !== book ||
            value.chapter !== chapter ||
            !Array.isArray(value.verses)
          ) {
            throw new Error('Pacote de pessoas inválido.');
          }
          return value;
        })
        .catch(error => {
          cache.delete(key);
          throw error;
        })
    );
  }

  return cache.get(key)!;
}

export function peopleForPassage(
  data: PeopleChapter,
  startVerse?: number,
  endVerse?: number,
): BiblicalPerson[] {
  const min = startVerse ?? 1;
  const max = endVerse ?? Number.MAX_SAFE_INTEGER;
  const merged = new Map<string, BiblicalPerson>();

  for (const row of data.verses) {
    if (row.verse < min || row.verse > max) continue;
    for (const person of row.people) {
      if (!merged.has(person.id)) merged.set(person.id, person);
    }
  }

  return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}
