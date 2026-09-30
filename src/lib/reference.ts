const aliases: Record<string, string> = {
  joao: 'João', j: 'João', jo: 'João', john: 'João',
  proverbios: 'Provérbios', proverbio: 'Provérbios', prov: 'Provérbios', pv: 'Provérbios', proverbs: 'Provérbios',
  '1joao': '1 João', '1john': '1 João', '1jo': '1 João',
};

export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export type ParsedReference = { book: string; chapter: number; startVerse?: number; endVerse?: number };
export type ReferenceSyntax = { bookQuery: string; chapter: number; startVerse?: number; endVerse?: number };

export function parseReferenceSyntax(input: string): ReferenceSyntax | null {
  const cleaned = normalizeText(input).replace(/\s+/g, ' ');
  const match = cleaned.match(/^(.+?)\s+(\d+)(?:\s+(\d+)(?:\s+(\d+))?)?$/);
  if (!match) return null;
  const chapter = Number(match[2]);
  const startVerse = match[3] ? Number(match[3]) : undefined;
  const endVerse = match[4] ? Number(match[4]) : startVerse;
  if (chapter < 1 || (startVerse !== undefined && startVerse < 1) || (endVerse !== undefined && endVerse < startVerse!)) return null;
  return { bookQuery: match[1], chapter, startVerse, endVerse };
}

// Backward-compatible parser for the first editorial prototype coverage.
// New full-corpus flows use parseReferenceSyntax + resolveBook(catalog).
export function parseReference(input: string): ParsedReference | null {
  const syntax = parseReferenceSyntax(input);
  if (!syntax) return null;
  const compact = syntax.bookQuery.replace(/\s+/g, '');
  const book = aliases[compact];
  if (!book) return null;
  const { chapter, startVerse, endVerse } = syntax;
  if (book === 'João' && chapter > 21) return null;
  if (book === '1 João' && chapter > 5) return null;
  if (book === 'Provérbios' && chapter > 31) return null;
  return { book, chapter, startVerse, endVerse };
}
