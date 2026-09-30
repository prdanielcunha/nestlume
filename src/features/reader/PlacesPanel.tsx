import { useEffect,useMemo,useState } from 'react';
import { messages } from '../../i18n/messages';
import { BiblicalPlace,PlaceChapter,loadPlaces,placesForPassage } from '../../lib/places';

type T = Record<keyof typeof messages.pt,string>;
type ReaderTarget={code:string;chapter:number;startVerse?:number;endVerse?:number};

export function PlacesPanel({t,target}:{t:T;target:ReaderTarget}){
  const [data,setData]=useState<PlaceChapter|null>(null);
  const [state,setState]=useState<'loading'|'ready'|'error'>('loading');

  useEffect(()=>{
    let alive=true;
    setState('loading');
    loadPlaces(target.code,target.chapter)
      .then(value=>{if(alive){setData(value);setState('ready');}})
      .catch(()=>{if(alive){setData(null);setState('error');}});
    return()=>{alive=false;};
  },[target.code,target.chapter]);

  const places=useMemo(()=>data?placesForPassage(data,target.startVerse,target.endVerse):[],[data,target.startVerse,target.endVerse]);

  if(state==='loading') return <p role="status">{t.loading}</p>;
  if(state==='error'||!data) return <p role="status">{t.placesUnavailable}</p>;

  return <div className="places-panel">
    <p className="kicker">{t.places.toUpperCase()}</p>
    <h2>{t.placesInPassage}</h2>
    <p>{t.placesIntro}</p>
    {places.length?<div className="place-list">{places.map((place:BiblicalPlace)=><article key={place.id}>
      <header><strong>{place.name}</strong>{place.type&&<span>{place.type}</span>}</header>
      {place.associations.length?<div className="place-candidates">
        <small>{t.modernIdentifications}</small>
        {place.associations.map(candidate=><div key={candidate.id}><span>{candidate.name}</span><span>{t.sourceScore}: {candidate.score}</span></div>)}
      </div>:<p className="source-note">{t.noModernIdentification}</p>}
    </article>)}</div>:<p>{t.noPlaces}</p>}
    <p className="source-note">{data.scoreNote} {data.attribution}</p>
    <a className="text-link" href={data.canonicalSource} target="_blank" rel="noreferrer">OpenBible.info ↗</a>
  </div>;
}
