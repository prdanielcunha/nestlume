import { useMemo } from 'react';
import { messages } from '../../i18n/messages';
import { analyzeReadingLens } from '../../lib/readingLenses';

type T = Record<keyof typeof messages.pt, string>;

export function ReadingLensesPanel({
  t,
  verses,
}: {
  t: T;
  verses: Array<{ verse: number; text: string }>;
}) {
  const analysis = useMemo(() => analyzeReadingLens(verses), [verses]);

  return (
    <div className="reading-lenses">
      <p className="kicker">{t.helpMeSee.toUpperCase()}</p>
      <h2>{t.readingLenses}</h2>
      <p>{t.readingLensesIntro}</p>

      <section>
        <p className="micro-label">{t.repeatedWords.toUpperCase()}</p>
        {analysis.repeated.length ? (
          <div className="lens-word-list">
            {analysis.repeated.map(item => (
              <article key={item.word}>
                <strong>{item.word}</strong>
                <span>{item.count}× · {t.verse} {item.verses.join(', ')}</span>
              </article>
            ))}
          </div>
        ) : (
          <p className="source-note">{t.noRepeatedWords}</p>
        )}
      </section>

      <section>
        <p className="micro-label">{t.contrastMarkers.toUpperCase()}</p>
        {analysis.contrasts.length ? (
          <div className="lens-contrast-list">
            {analysis.contrasts.map((item, index) => (
              <article key={`${item.verse}-${item.marker}-${index}`}>
                <strong>{t.verse} {item.verse} · “{item.marker}”</strong>
                <p>{item.excerpt}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="source-note">{t.noContrastMarkers}</p>
        )}
      </section>

      <p className="source-note">{t.lensBoundary}</p>
    </div>
  );
}
