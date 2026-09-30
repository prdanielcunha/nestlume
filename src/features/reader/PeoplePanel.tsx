import { useEffect, useMemo, useState } from 'react';
import { messages } from '../../i18n/messages';
import { BiblicalPerson, PeopleChapter, loadPeople, peopleForPassage } from '../../lib/people';

type T = Record<keyof typeof messages.pt, string>;
type ReaderTarget = { code: string; chapter: number; startVerse?: number; endVerse?: number };

function RelationList({ label, values }: { label: string; values: string[] }) {
  if (!values.length) return null;
  return (
    <div className="person-relation">
      <small>{label}</small>
      <p>{values.join(' · ')}</p>
    </div>
  );
}

export function PeoplePanel({ t, target }: { t: T; target: ReaderTarget }) {
  const [data, setData] = useState<PeopleChapter | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    setState('loading');
    loadPeople(target.code, target.chapter)
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
    return () => {
      alive = false;
    };
  }, [target.code, target.chapter]);

  const people = useMemo(
    () => data ? peopleForPassage(data, target.startVerse, target.endVerse) : [],
    [data, target.startVerse, target.endVerse],
  );

  if (state === 'loading') return <p role="status">{t.loading}</p>;
  if (state === 'error' || !data) return <p role="status">{t.peopleUnavailable}</p>;

  return (
    <div className="people-panel">
      <p className="kicker">{t.people.toUpperCase()}</p>
      <h2>{t.peopleInPassage}</h2>
      <p>{t.peopleIntro}</p>

      {people.length ? (
        <div className="person-list">
          {people.map((person: BiblicalPerson) => (
            <article key={person.id}>
              <header>
                <strong>{person.name}</strong>
                {person.kind && <span>{person.kind}</span>}
              </header>

              {person.forms.length > 0 && (
                <div className="person-forms">
                  {person.forms.slice(0, 4).map((form, index) => (
                    <div key={`${person.id}-${form.strong}-${index}`}>
                      <b dir="auto">{form.original || form.translatedName}</b>
                      <span>{form.translatedName || form.strong}</span>
                      {form.strong && <small>{form.strong}</small>}
                    </div>
                  ))}
                </div>
              )}

              {person.tribe && <div className="person-relation"><small>{t.tribe}</small><p>{person.tribe}</p></div>}
              <RelationList label={t.parents} values={person.relations.parents} />
              <RelationList label={t.siblings} values={person.relations.siblings} />
              <RelationList label={t.partners} values={person.relations.partners} />
              <RelationList label={t.offspring} values={person.relations.offspring} />
            </article>
          ))}
        </div>
      ) : (
        <p>{t.noPeople}</p>
      )}

      <p className="source-note">{data.editorialBoundary}</p>
      <p className="source-note">{data.attribution}</p>
      <a
        className="text-link"
        href="https://github.com/STEPBible/STEPBible-Data"
        target="_blank"
        rel="noreferrer"
      >
        STEP Bible ↗
      </a>
    </div>
  );
}
