const aliases: Record<string, string> = {
  joao: 'João', j: 'João', jo: 'João', john: 'João',
  proverbios: 'Provérbios', proverbio: 'Provérbios', prov: 'Provérbios', pv: 'Provérbios', proverbs: 'Provérbios',
  '1joao': '1 João', '1john': '1 João', '1jo': '1 João',
};

export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export type ParsedReference = { book: string; chapter: number; startVerse?: number; endVerse?: number };

export function parseReference(input: string): ParsedReference | null {
  const cleaned = normalizeText(input).replace(/\s+/g, ' ');
  const match = cleaned.match(/^(1\s*)?([a-z]+)\s+(\d+)(?:\s+(\d+)(?:\s+(\d+))?)?$/);
  if (!match) return null;
  const prefix = match[1] ? '1' : '';
  const key = `${prefix}${match[2]}`;
  const book = aliases[key];
  if (!book) return null;
  const chapter = Number(match[3]);
  const startVerse = match[4] ? Number(match[4]) : undefined;
  const endVerse = match[5] ? Number(match[5]) : startVerse;
  if (book === 'João' && (chapter < 1 || chapter > 21)) return null;
  if (book === '1 João' && (chapter < 1 || chapter > 5)) return null;
  if (book === 'Provérbios' && (chapter < 1 || chapter > 31)) return null;
  if (startVerse !== undefined && startVerse < 1) return null;
  if (endVerse !== undefined && endVerse < startVerse!) return null;
  return { book, chapter, startVerse, endVerse };
}
