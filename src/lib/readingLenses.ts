export type RepeatedWord = {
  word: string;
  count: number;
  verses: number[];
};

export type ContrastMarker = {
  marker: string;
  verse: number;
  excerpt: string;
};

export type ReadingLensResult = {
  repeated: RepeatedWord[];
  contrasts: ContrastMarker[];
};

const STOP_WORDS = new Set([
  'a','à','ao','aos','as','às','o','os','um','uma','uns','umas',
  'de','da','das','do','dos','em','na','nas','no','nos','por','para',
  'com','sem','sob','sobre','entre','até','ate','desde',
  'e','ou','que','se','como','porque','quando','onde','quem','qual','quais',
  'é','era','foi','são','ser','sendo','está','estava','estão',
  'ele','ela','eles','elas','lhe','lhes','seu','sua','seus','suas',
  'eu','tu','nós','vós','me','te','nos','vos','meu','minha',
  'este','esta','estes','estas','esse','essa','isso','isto','aquele','aquela',
  'não','nao','sim','já','ja','mais','menos','muito','muita','muitos','muitas',
  'também','assim','então','pois','toda','todo','todos','todas',
]);

const CONTRAST_MARKERS = [
  'mas',
  'porém',
  'contudo',
  'todavia',
  'entretanto',
  'antes',
  'ao contrário',
];

function normalizeToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9à-ÿ'-]/gi, '')
    .trim();
}

export function analyzeReadingLens(
  verses: Array<{ verse: number; text: string }>,
  maxRepeated = 8,
): ReadingLensResult {
  const index = new Map<string, { count: number; verses: Set<number>; display: string }>();

  for (const row of verses) {
    const tokens = row.text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? [];
    for (const token of tokens) {
      const normalized = normalizeToken(token);
      if (normalized.length < 3 || STOP_WORDS.has(normalized)) continue;
      const current = index.get(normalized) ?? { count: 0, verses: new Set<number>(), display: token };
      current.count += 1;
      current.verses.add(row.verse);
      if (token.length < current.display.length) current.display = token;
      index.set(normalized, current);
    }
  }

  const repeated = [...index.values()]
    .filter(item => item.count >= 2)
    .sort((a, b) => b.count - a.count || b.verses.size - a.verses.size || a.display.localeCompare(b.display))
    .slice(0, maxRepeated)
    .map(item => ({
      word: item.display,
      count: item.count,
      verses: [...item.verses].sort((a, b) => a - b),
    }));

  const contrasts: ContrastMarker[] = [];
  for (const row of verses) {
    const lower = row.text.toLocaleLowerCase('pt-BR');
    for (const marker of CONTRAST_MARKERS) {
      const index = lower.indexOf(marker);
      if (index < 0) continue;
      const start = Math.max(0, index - 42);
      const end = Math.min(row.text.length, index + marker.length + 70);
      contrasts.push({
        marker,
        verse: row.verse,
        excerpt: `${start > 0 ? '…' : ''}${row.text.slice(start, end).trim()}${end < row.text.length ? '…' : ''}`,
      });
    }
  }

  return { repeated, contrasts };
}
