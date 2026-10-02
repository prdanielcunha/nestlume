import { AiEvidence } from './ai';
import { CorpusBook, CorpusVerse, loadChapter } from './corpus';
import { linksForPassage, loadConnections } from './connections';
import { loadOriginalChapter } from './originalLanguages';
import { loadPeople, peopleForPassage } from './people';
import { loadPlaces, placesForPassage } from './places';
import { findEditorialStudy } from '../editorial/registry';

type PassageTarget = {
  code: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
};

function compact(value: string, max = 3900): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : clean.slice(0, max - 1).trimEnd() + '…';
}

function selectedBounds(chapter: CorpusVerse[], target: PassageTarget) {
  const maxVerse = Math.max(...chapter.map(row => row.verse));
  const start = target.startVerse ?? 1;
  const end = target.endVerse ?? Math.min(start + 9, maxVerse);
  return { start, end, maxVerse };
}

function scriptureText(rows: CorpusVerse[]) {
  return rows.map(row => `${row.verse}. ${row.text}`).join('\n');
}

function scriptureChunks(rows: CorpusVerse[], maxChars = 3600): CorpusVerse[][] {
  const chunks: CorpusVerse[][] = [];
  let current: CorpusVerse[] = [];
  let length = 0;

  for (const row of rows) {
    const lineLength = `${row.verse}. ${row.text}\n`.length;
    if (current.length && length + lineLength > maxChars) {
      chunks.push(current);
      current = [];
      length = 0;
    }
    current.push(row);
    length += lineLength;
  }
  if (current.length) chunks.push(current);
  return chunks;
}

async function optionalEvidence<T>(factory: () => Promise<T>): Promise<T | null> {
  try {
    return await factory();
  } catch {
    return null;
  }
}

export async function buildIntegratedStudyEvidence(
  book: CorpusBook,
  target: PassageTarget,
  selectedChapter?: CorpusVerse[],
): Promise<AiEvidence[]> {
  const chapter = selectedChapter ?? await loadChapter(book.file, target.chapter);
  const { start, end, maxVerse } = selectedBounds(chapter, target);
  const selected = chapter.filter(row => row.verse >= start && row.verse <= end);

  const evidence: AiEvidence[] = scriptureChunks(selected).map((rows, index, all) => ({
    id: `blivre:${book.ubsCode}:${target.chapter}:${rows[0].verse}-${rows.at(-1)!.verse}:part-${index + 1}`,
    kind: 'scripture',
    sourceLabel: `Bíblia Livre 2018.2.0 · ${book.nameShort} ${target.chapter}:${rows[0].verse}–${rows.at(-1)!.verse}${all.length > 1 ? ` · bloco ${index + 1}/${all.length}` : ''}`,
    text: scriptureText(rows),
  }));

  const contextStart = Math.max(1, start - 5);
  const contextEnd = Math.min(maxVerse, end + 5);
  if (contextStart !== start || contextEnd !== end) {
    const contextRows = chapter.filter(row => row.verse >= contextStart && row.verse <= contextEnd);
    evidence.push({
      id: `context:${book.ubsCode}:${target.chapter}:${contextStart}-${contextEnd}`,
      kind: 'scripture',
      sourceLabel: `Contexto na mesma Bíblia Livre · ${book.nameShort} ${target.chapter}:${contextStart}–${contextEnd}`,
      text: compact(scriptureText(contextRows)),
    });
  }

  const original = await optionalEvidence(() => loadOriginalChapter(book.ubsCode, target.chapter));
  if (original) {
    const rows = original.verses.filter(row => row.v >= start && row.v <= end).slice(0, 4);
    const lines: string[] = [
      `Idioma: ${original.language === 'grc' ? 'grego koiné' : 'hebraico bíblico'}.`,
      `Limite de alinhamento: ${original.alignment}.`,
    ];
    for (const row of rows) {
      const tokenLine = row.tokens.slice(0, 28).map(token => {
        const details = [
          token.s,
          token.tr ? `translit. ${token.tr}` : '',
          token.l ? `lema ${token.l}` : '',
          token.g ? `gloss ${token.g}` : '',
          token.m ? `morf. ${token.m}` : '',
        ].filter(Boolean).join(' · ');
        return details;
      }).join(' | ');
      lines.push(`v.${row.v}: ${tokenLine}`);
    }
    evidence.push({
      id: `original:${book.ubsCode}:${target.chapter}:${start}-${end}`,
      kind: 'lexical',
      sourceLabel: `${original.attribution} · ocorrência original em ${book.nameShort} ${target.chapter}`,
      text: compact(lines.join('\n')),
    });
  }

  const peopleData = await optionalEvidence(() => loadPeople(book.ubsCode, target.chapter));
  if (peopleData) {
    const people = peopleForPassage(peopleData, start, end).slice(0, 12);
    if (people.length) {
      evidence.push({
        id: `people:${book.ubsCode}:${target.chapter}:${start}-${end}`,
        kind: 'historical',
        sourceLabel: `${peopleData.attribution} · pessoas vinculadas à referência`,
        text: compact(people.map(person => {
          const relations = [
            person.tribe ? `grupo/tribo: ${person.tribe}` : '',
            person.relations.parents.length ? `pais: ${person.relations.parents.join(', ')}` : '',
            person.relations.partners.length ? `cônjuge/parceiro: ${person.relations.partners.join(', ')}` : '',
            person.relations.offspring.length ? `filhos/descendentes: ${person.relations.offspring.join(', ')}` : '',
          ].filter(Boolean).join('; ');
          return `${person.name}${person.kind ? ` (${person.kind})` : ''}${relations ? ` — ${relations}` : ''}`;
        }).join('\n')),
      });
    }
  }

  const placesData = await optionalEvidence(() => loadPlaces(book.ubsCode, target.chapter));
  if (placesData) {
    const places = placesForPassage(placesData, start, end).slice(0, 10);
    if (places.length) {
      evidence.push({
        id: `places:${book.ubsCode}:${target.chapter}:${start}-${end}`,
        kind: 'historical',
        sourceLabel: `${placesData.attribution} · lugares vinculados à referência`,
        text: compact(places.map(place => {
          const candidates = place.associations.slice(0, 3).map(item => `${item.name} (score da fonte ${item.score})`).join(', ');
          return `${place.name}${place.type ? ` · tipo: ${place.type}` : ''}${candidates ? ` · propostas modernas: ${candidates}` : ''}`;
        }).join('\n')),
      });
    }
  }

  const connectionData = await optionalEvidence(() => loadConnections(book.ubsCode, target.chapter));
  if (connectionData) {
    const links = linksForPassage(connectionData, start, end, 10);
    if (links.length) {
      evidence.push({
        id: `connections:${book.ubsCode}:${target.chapter}:${start}-${end}`,
        kind: 'editorial',
        sourceLabel: `${connectionData.attribution} · referências relacionadas para investigação`,
        text: compact([
          'Estas conexões são pistas de investigação do dataset, não prova automática de uma interpretação.',
          ...links.map(link => `${link.target} · relevância/votos no dataset: ${link.votes}`),
        ].join('\n')),
      });
    }
  }

  const editorial = findEditorialStudy({
    bookCode: book.ubsCode,
    chapter: target.chapter,
    startVerse: start,
    endVerse: end,
  });
  if (editorial) {
    const sourceTitles = new Map(editorial.sources.map(source => [source.id, source.title]));
    evidence.push({
      id: `editorial:${editorial.id}`,
      kind: 'editorial',
      sourceLabel: `NestLume · ${editorial.review.status === 'published' ? 'estudo editorial publicado' : 'rascunho editorial'} · ${editorial.title}`,
      text: compact([
        `Status: ${editorial.review.status}. Não apresentar como revisão humana se estiver em draft.`,
        `Título: ${editorial.title}`,
        `Introdução: ${editorial.lead}`,
        ...editorial.claims.map(claim => {
          const sources = claim.sourceIds.map(id => sourceTitles.get(id) ?? id).join('; ');
          return `[${claim.layer}; certeza ${claim.certainty}] ${claim.text} Fontes declaradas: ${sources}.`;
        }),
      ].join('\n')),
    });
  }

  return evidence.slice(0, 10);
}
