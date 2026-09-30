import { useEffect, useMemo, useState } from 'react';
import { messages } from '../../i18n/messages';
import {
  OriginalChapter,
  OriginalToken,
  findOriginalVerse,
  loadOriginalChapter,
} from '../../lib/originalLanguages';

type T = Record<keyof typeof messages.pt, string>;

export function OriginalLanguagePanel({
  t,
  bookCode,
  chapter,
  initialVerse,
}: {
  t: T;
  bookCode: string;
  chapter: number;
  initialVerse?: number;
}) {
  const [data, setData] = useState<OriginalChapter | null>(null);
  const [verse, setVerse] = useState(initialVerse ?? 1);
  const [selected, setSelected] = useState<OriginalToken | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    setState('loading');
    setSelected(null);

    loadOriginalChapter(bookCode, chapter)
      .then(value => {
        if (!alive) return;
        setData(value);
        const requested = initialVerse ?? value.verses[0]?.v ?? 1;
        setVerse(requested);
        setState('ready');
      })
      .catch(() => {
        if (!alive) return;
        setData(null);
        setState('error');
      });

    return () => { alive = false; };
  }, [bookCode, chapter, initialVerse]);

  const row = useMemo(() => data ? findOriginalVerse(data, verse) : null, [data, verse]);
  const languageName = data?.language === 'grc' ? t.greekKoine : t.hebrewBiblical;

  if (state === 'loading') {
    return <div className="original-state" role="status">{t.loadingOriginal}</div>;
  }

  if (state === 'error' || !data) {
    return (
      <div className="original-state" role="status">
        <p className="kicker">{t.originalLanguage.toUpperCase()}</p>
        <h2>{t.originalUnavailable}</h2>
        <p>{t.originalUnavailableBody}</p>
      </div>
    );
  }

  if (!row) {
    return (
      <div className="original-state" role="status">
        <p className="kicker">{t.originalLanguage.toUpperCase()}</p>
        <h2>{bookCode} {chapter}:{verse}</h2>
        <p>{t.originalReferenceMismatch}</p>
        <p className="source-note">STEP Bible · snapshot <code>{data.sourceCommit.slice(0, 10)}…</code> · CC BY 4.0.</p>
      </div>
    );
  }

  return (
    <div className="original-panel">
      <p className="kicker">{t.originalLanguage.toUpperCase()} · {languageName.toUpperCase()}</p>
      <div className="original-heading">
        <h2>{bookCode} {chapter}:{verse}</h2>
        <label>
          <span>{t.verse}</span>
          <select
            value={verse}
            onChange={event => {
              setVerse(Number(event.target.value));
              setSelected(null);
            }}
          >
            {data.verses.map(item => <option key={item.v} value={item.v}>{item.v}</option>)}
          </select>
        </label>
      </div>

      <p className="source-note">{t.noWordAlignment}</p>

      <div className="original-line" dir={data.direction} lang={data.language}>
        {row.tokens.map(token => (
          <button
            key={token.p}
            className={selected?.p === token.p ? 'selected' : ''}
            onClick={() => setSelected(token)}
            aria-pressed={selected?.p === token.p}
          >
            <strong>{token.s}</strong>
            {token.tr && <small>{token.tr}</small>}
          </button>
        ))}
      </div>

      {selected ? (
        <section className="token-detail">
          <p className="micro-label">{t.verifiedSource.toUpperCase()}</p>
          <h3 lang={data.language} dir={data.direction}>{selected.s}</h3>
          <dl>
            <div><dt>{t.surfaceForm}</dt><dd lang={data.language} dir={data.direction}>{selected.s}</dd></div>
            <div><dt>{t.transliteration}</dt><dd>{selected.tr || t.notAvailable}</dd></div>
            <div><dt>{t.lemma}</dt><dd lang={data.language} dir={data.direction}>{selected.l || t.notAvailable}</dd></div>
            <div><dt>{t.morphology}</dt><dd>{selected.m || t.notAvailable}</dd></div>
            <div><dt>Extended Strong</dt><dd>{selected.d || t.notAvailable}</dd></div>
            <div><dt>{t.lexicalGloss}</dt><dd>{selected.g || t.notAvailable}</dd></div>
            <div><dt>{t.wordTranslation}</dt><dd>{selected.en || t.notAvailable}</dd></div>
          </dl>
        </section>
      ) : (
        <p className="original-hint">{t.selectOriginalWord}</p>
      )}

      <p className="source-note">
        STEP Bible · snapshot <code>{data.sourceCommit.slice(0, 10)}…</code> · CC BY 4.0.
        {' '}{t.originalSourceNote}
      </p>
    </div>
  );
}
