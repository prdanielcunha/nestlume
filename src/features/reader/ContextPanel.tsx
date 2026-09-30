import { useEffect, useState } from 'react';
import { messages } from '../../i18n/messages';
import { CorpusBook, CorpusVerse, loadChapter } from '../../lib/corpus';

type T = Record<keyof typeof messages.pt, string>;
type ReaderTarget = { code: string; chapter: number; startVerse?: number; endVerse?: number };

export function ContextPanel({ t, book, target }: { t: T; book: CorpusBook; target: ReaderTarget }) {
  const [verses, setVerses] = useState<CorpusVerse[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    setState('loading');

    loadChapter(book.file, target.chapter)
      .then(chapter => {
        if (!alive) return;
        const start = target.startVerse ?? 1;
        const end = target.endVerse ?? Math.min(start + 9, Math.max(...chapter.map(v => v.verse)));
        const from = Math.max(1, start - 3);
        const to = end + 3;
        setVerses(chapter.filter(v => v.verse >= from && v.verse <= to));
        setState('ready');
      })
      .catch(() => {
        if (alive) setState('error');
      });

    return () => { alive = false; };
  }, [book.file, target.chapter, target.startVerse, target.endVerse]);

  if (state === 'loading') return <p role="status">{t.loading}</p>;
  if (state === 'error') return <p role="status">{t.contextUnavailable}</p>;

  const selectedStart = target.startVerse ?? 1;
  const selectedEnd = target.endVerse ?? selectedStart + 9;

  return (
    <div className="passage-context-panel">
      <p className="kicker">{t.context.toUpperCase()}</p>
      <h2>{book.nameShort} {target.chapter}</h2>
      <p>{t.contextIntro}</p>
      <div className="context-verses">
        {verses.map(verse => {
          const selected = verse.verse >= selectedStart && verse.verse <= selectedEnd;
          return (
            <p key={verse.verse} className={selected ? 'selected' : ''}>
              <sup>{verse.verse}</sup>{verse.text}
            </p>
          );
        })}
      </div>
      <p className="source-note">{t.contextSourceNote}</p>
    </div>
  );
}
