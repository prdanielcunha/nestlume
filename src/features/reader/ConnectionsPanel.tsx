import { useEffect, useMemo, useState } from 'react';
import { messages } from '../../i18n/messages';
import { BibleConnection, ConnectionChapter, linksForPassage, loadConnections } from '../../lib/connections';

type T = Record<keyof typeof messages.pt, string>;
type ReaderTarget = { code: string; chapter: number; startVerse?: number; endVerse?: number };

export function ConnectionsPanel({
  t,
  target,
  onOpenReader,
}: {
  t: T;
  target: ReaderTarget;
  onOpenReader: (target: ReaderTarget) => void;
}) {
  const [data, setData] = useState<ConnectionChapter | null>(null);
  const [state, setState] = useState<'loading'|'ready'|'error'>('loading');

  useEffect(() => {
    let alive = true;
    setState('loading');
    loadConnections(target.code, target.chapter)
      .then(value => {
        if (!alive) return;
        setData(value);
        setState('ready');
      })
      .catch(() => {
        if (!alive) return;
        setData(null);
        setState('error');
      });
    return () => { alive = false; };
  }, [target.code, target.chapter]);

  const links = useMemo(
    () => data ? linksForPassage(data, target.startVerse, target.endVerse) : [],
    [data, target.startVerse, target.endVerse],
  );

  if (state === 'loading') return <p role="status">{t.loading}</p>;
  if (state === 'error' || !data) return <p role="status">{t.connectionsUnavailable}</p>;

  return (
    <div className="connections-panel">
      <p className="kicker">{t.relatedPassages.toUpperCase()}</p>
      <h2>{t.followConnections}</h2>
      <p>{t.connectionsIntro}</p>

      {links.length ? (
        <div className="connection-list">
          {links.map((link: BibleConnection) => (
            <button
              key={`${link.bookCode}:${link.chapter}:${link.startVerse}:${link.endVerse ?? ''}`}
              onClick={() => onOpenReader({
                code: link.bookCode,
                chapter: link.chapter,
                startVerse: link.startVerse,
                endVerse: link.endVerse,
              })}
            >
              <strong>{link.target}</strong>
              <span>{t.datasetRelevance}: {link.votes}</span>
            </button>
          ))}
        </div>
      ) : <p>{t.noConnections}</p>}

      <p className="source-note">{t.connectionsSourceNote}</p>
      <a className="text-link" href={data.canonicalSource} target="_blank" rel="noreferrer">
        OpenBible.info ↗
      </a>
    </div>
  );
}
