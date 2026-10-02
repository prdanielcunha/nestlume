import { useEffect, useMemo, useState } from 'react';
import { messages } from '../../i18n/messages';
import { CorpusBook, CorpusVerse } from '../../lib/corpus';
import { analyzeReadingLens } from '../../lib/readingLenses';
import { loadOriginalChapter, OriginalChapter } from '../../lib/originalLanguages';
import { loadPeople, peopleForPassage } from '../../lib/people';
import { loadPlaces, placesForPassage } from '../../lib/places';
import { linksForPassage, loadConnections } from '../../lib/connections';

type T = Record<keyof typeof messages.pt, string>;
type ReaderTarget = { code: string; chapter: number; startVerse?: number; endVerse?: number };
type Panel = 'context' | 'lenses' | 'original' | 'people' | 'places' | 'thread';

type Snapshot = {
  original: OriginalChapter | null;
  people: string[];
  places: string[];
  connections: string[];
};

export function IntegratedStudyHub({
  t,
  book,
  target,
  verses,
  referenceLabel,
  onSelectPanel,
  onStudy,
}: {
  t: T;
  book: CorpusBook;
  target: ReaderTarget;
  verses: CorpusVerse[];
  referenceLabel: string;
  onSelectPanel: (panel: Panel) => void;
  onStudy: () => void;
}) {
  const [snapshot, setSnapshot] = useState<Snapshot>({
    original: null,
    people: [],
    places: [],
    connections: [],
  });

  const start = target.startVerse ?? verses[0]?.verse ?? 1;
  const end = target.endVerse ?? verses.at(-1)?.verse ?? start;
  const lens = useMemo(() => analyzeReadingLens(verses), [verses]);

  useEffect(() => {
    let alive = true;

    Promise.all([
      loadOriginalChapter(book.ubsCode, target.chapter).catch(() => null),
      loadPeople(book.ubsCode, target.chapter).then(data => peopleForPassage(data, start, end).map(item => item.name)).catch(() => [] as string[]),
      loadPlaces(book.ubsCode, target.chapter).then(data => placesForPassage(data, start, end).map(item => item.name)).catch(() => [] as string[]),
      loadConnections(book.ubsCode, target.chapter).then(data => linksForPassage(data, start, end, 8).map(item => item.target)).catch(() => [] as string[]),
    ]).then(([original, people, places, connections]) => {
      if (!alive) return;
      setSnapshot({ original, people, places, connections });
    });

    return () => { alive = false; };
  }, [book.ubsCode, target.chapter, start, end]);

  const originalRows = snapshot.original?.verses.filter(row => row.v >= start && row.v <= end) ?? [];
  const firstOriginal = originalRows[0];
  const originalPreview = firstOriginal?.tokens.slice(0, 6).map(token => token.s).join(' · ') ?? '';
  const repeatedPreview = lens.repeated.slice(0, 3).map(item => `${item.word} ×${item.count}`).join(' · ');

  return (
    <section className="integrated-study-hub">
      <div className="integrated-study-heading">
        <div>
          <p className="micro-label">{t.study.toUpperCase()} · {referenceLabel.toUpperCase()}</p>
          <h2>{t.integratedStudyTitle}</h2>
          <p>{t.integratedStudyIntro}</p>
        </div>
        <button className="primary simple" onClick={onStudy}>{t.studyThisPassage}</button>
      </div>

      <div className="integrated-study-grid">
        <button onClick={() => onSelectPanel('lenses')}>
          <small>{t.helpMeSee.toUpperCase()}</small>
          <strong>{t.helpMeSee}</strong>
          <span>{repeatedPreview || (lens.contrasts.length ? `${lens.contrasts.length} contraste(s) textual(is) detectado(s)` : 'Abra para observar repetições e contrastes no trecho.')}</span>
        </button>

        <button onClick={() => onSelectPanel('original')}>
          <small>{t.originalLanguage.toUpperCase()}</small>
          <strong>{snapshot.original?.language === 'grc' ? t.greekKoine : snapshot.original?.language === 'hbo' ? t.hebrewBiblical : t.originalLanguage}</strong>
          <span>{originalPreview || t.originalActionBody}</span>
        </button>

        <button onClick={() => onSelectPanel('people')}>
          <small>{t.people.toUpperCase()}</small>
          <strong>{snapshot.people.length ? `${snapshot.people.length} · ${t.people}` : t.people}</strong>
          <span>{snapshot.people.slice(0, 4).join(' · ') || t.peopleActionBody}</span>
        </button>

        <button onClick={() => onSelectPanel('places')}>
          <small>{t.places.toUpperCase()}</small>
          <strong>{snapshot.places.length ? `${snapshot.places.length} · ${t.places}` : t.places}</strong>
          <span>{snapshot.places.slice(0, 4).join(' · ') || t.placesActionBody}</span>
        </button>

        <button onClick={() => onSelectPanel('thread')}>
          <small>{t.relatedPassages.toUpperCase()}</small>
          <strong>{snapshot.connections.length ? `${snapshot.connections.length} · ${t.relatedPassages}` : t.thread}</strong>
          <span>{snapshot.connections.slice(0, 4).join(' · ') || t.connectionsActionBody}</span>
        </button>

        <button onClick={() => onSelectPanel('context')}>
          <small>{t.context.toUpperCase()}</small>
          <strong>{book.nameShort} {target.chapter}</strong>
          <span>{t.contextActionBody}</span>
        </button>
      </div>

      <p className="integrated-study-boundary">
        {t.integratedStudyBoundary}
      </p>
    </section>
  );
}
