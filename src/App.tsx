import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Locale, messages } from './i18n/messages';
import {
  CorpusBook,
  CorpusVerse,
  SearchHit,
  getBookByCode,
  identifyPastedText,
  loadChapter,
  requestOfflineBook,
  resolveBook,
  searchBible,
} from './lib/corpus';
import { parseReferenceSyntax } from './lib/reference';
import { AskPage } from './features/ai/AskPage';
import { john1PrologueStudy } from './editorial/studies/john-1-1-18';
import {
  NotebookBackup,
  NotebookEntry,
  ReadingPosition,
  clearPersonalData,
  deleteEntry,
  exportBackup,
  getReadingPosition,
  importBackup,
  listEntries,
  saveEntry,
  saveReadingPosition,
  validateBackup,
} from './lib/notebook';

type T = Record<keyof typeof messages.pt, string>;
type Page = 'today' | 'explore' | 'read' | 'paste' | 'ask' | 'notebook' | 'states';
type Panel = 'logos' | 'john' | 'thread' | 'source' | null;
type Theme = 'system' | 'light' | 'dark';
type ReaderTarget = { code: string; chapter: number; startVerse?: number; endVerse?: number };

function routeFromLocation(): Page {
  const path = window.location.pathname;
  if (path.startsWith('/explorar')) return 'explore';
  if (path.startsWith('/ler')) return 'read';
  if (path.startsWith('/colar')) return 'paste';
  if (path.startsWith('/perguntar')) return 'ask';
  if (path.startsWith('/caderno')) return 'notebook';
  if (path.startsWith('/estados')) return 'states';
  return 'today';
}

function targetFromLocation(): ReaderTarget {
  const match = window.location.pathname.match(/^\/ler\/([^/]+)\/(\d+)/i);
  const params = new URLSearchParams(window.location.search);
  const rawVerses = params.get('v') ?? '';
  const verseMatch = rawVerses.match(/^(\d+)(?:-(\d+))?$/);
  return {
    code: (match?.[1] ?? 'JHN').toUpperCase(),
    chapter: Math.max(1, Number(match?.[2] ?? 1)),
    startVerse: verseMatch ? Number(verseMatch[1]) : undefined,
    endVerse: verseMatch ? Number(verseMatch[2] ?? verseMatch[1]) : undefined,
  };
}

function readerPath(target: ReaderTarget): string {
  const range = target.startVerse
    ? `?v=${target.startVerse}${target.endVerse && target.endVerse !== target.startVerse ? `-${target.endVerse}` : ''}`
    : '';
  return `/ler/${target.code.toLowerCase()}/${target.chapter}${range}`;
}

export default function App() {
  const [page, setPage] = useState<Page>(() => routeFromLocation());
  const [routeVersion, setRouteVersion] = useState(0);
  const [panel, setPanel] = useState<Panel>(null);
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('nestlume:locale') as Locale) || 'pt');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('nestlume:theme') as Theme) || 'system');
  const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem('nestlume:fontScale') || 1));
  const t = messages[locale] as T;

  useEffect(() => {
    localStorage.setItem('nestlume:locale', locale);
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : locale;
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('nestlume:theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('nestlume:fontScale', String(fontScale));
  }, [fontScale]);

  useEffect(() => {
    const pop = () => {
      setPage(routeFromLocation());
      setPanel(null);
      setRouteVersion(version => version + 1);
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);

  const navigate = (next: Exclude<Page, 'read'>) => {
    const path = { today: '/', explore: '/explorar', paste: '/colar', ask: '/perguntar', notebook: '/caderno', states: '/estados' }[next];
    window.history.pushState({}, '', path);
    setPage(next);
    setPanel(null);
    setRouteVersion(version => version + 1);
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  const openReader = (target: ReaderTarget) => {
    window.history.pushState({}, '', readerPath(target));
    setPage('read');
    setPanel(null);
    setRouteVersion(version => version + 1);
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <div className="app-shell">
      <Header locale={locale} setLocale={setLocale} theme={theme} setTheme={setTheme} onHome={() => navigate('today')} t={t} />
      <main>
        {page === 'today' && <Today t={t} onNavigate={navigate} onOpenReader={openReader} />}
        {page === 'explore' && <Explore t={t} onNavigate={navigate} onOpenReader={openReader} />}
        {page === 'read' && (
          <Reader
            key={routeVersion}
            t={t}
            target={targetFromLocation()}
            fontScale={fontScale}
            setFontScale={setFontScale}
            panel={panel}
            setPanel={setPanel}
            onOpenReader={openReader}
          />
        )}
        {page === 'paste' && <Paste t={t} onOpenReader={openReader} />}
        {page === 'ask' && <AskPage t={t} locale={locale} onOpenReader={openReader} onNotebook={() => navigate('notebook')} />}
        {page === 'notebook' && <Notebook t={t} onOpenReader={openReader} />}
        {page === 'states' && <States t={t} onNavigate={navigate} />}
      </main>
      <BottomNav page={page} t={t} navigate={navigate} />
    </div>
  );
}

function Header({ locale, setLocale, theme, setTheme, onHome, t }: {
  locale: Locale; setLocale: (locale: Locale) => void; theme: Theme; setTheme: (theme: Theme) => void; onHome: () => void; t: T;
}) {
  return (
    <header className="topbar">
      <button className="brand" onClick={onHome} aria-label="NestLume — início">
        <span className="brand-mark">N</span><span>NestLume</span>
      </button>
      <div className="top-actions">
        <label className="select-wrap"><span className="sr-only">{t.language}</span>
          <select aria-label={t.language} value={locale} onChange={event => setLocale(event.target.value as Locale)}>
            <option value="pt">PT</option><option value="en">EN</option><option value="es">ES</option>
          </select>
        </label>
        <label className="select-wrap"><span className="sr-only">{t.theme}</span>
          <select aria-label={t.theme} value={theme} onChange={event => setTheme(event.target.value as Theme)}>
            <option value="system">{t.system}</option><option value="light">{t.light}</option><option value="dark">{t.dark}</option>
          </select>
        </label>
      </div>
    </header>
  );
}

function Today({ t, onNavigate, onOpenReader }: {
  t: T; onNavigate: (page: Exclude<Page, 'read'>) => void; onOpenReader: (target: ReaderTarget) => void;
}) {
  const [position, setPosition] = useState<ReadingPosition | null>(null);
  useEffect(() => { getReadingPosition().then(setPosition).catch(() => setPosition(null)); }, []);

  return (
    <div className="page page-home">
      <section className="hero editorial-width">
        <p className="kicker">JOÃO · VENHAM E VEJAM</p>
        <h1>Há mais luz no texto<br />do que pressa consegue ver.</h1>
        <p className="hero-copy">Leia a Bíblia inteira com espaço para perceber contexto, palavras, conexões e fontes — sem transformar profundidade em espetáculo.</p>
        <div className="hero-actions">
          <button className="primary" onClick={() => onOpenReader(position ? {
            code: position.bookCode, chapter: position.chapter, startVerse: position.verse,
          } : { code: 'JHN', chapter: 1, startVerse: 1, endVerse: 18 })}>
            {t.continue}<span>{position ? `${position.bookName} ${position.chapter}` : 'João 1:1–18'}</span>
          </button>
          <button className="secondary" onClick={() => onNavigate('explore')}>{t.begin}</button>
        </div>
      </section>
      <section className="today-trail editorial-width">
        <div className="trail-rule" />
        <p className="micro-label">BÍBLIA COMPLETA · BLIVRE 2018</p>
        <button className="discovery-teaser" onClick={() => onOpenReader({ code: 'JHN', chapter: 1, startVerse: 1, endVerse: 18 })}>
          <span className="teaser-number">01</span>
          <span><strong>“No princípio” não começa em Belém.</strong><small>Abra João 1:1–18 e veja a primeira camada editorial do NestLume.</small></span>
          <span aria-hidden="true">→</span>
        </button>
      </section>
    </div>
  );
}

function Explore({ t, onNavigate, onOpenReader }: {
  t: T; onNavigate: (page: Exclude<Page, 'read'>) => void; onOpenReader: (target: ReaderTarget) => void;
}) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<SearchHit[]>([]);

  async function runQuery(value = query) {
    const term = value.trim();
    setError('');
    setHits([]);
    if (!term) {
      setError(t.searchPlaceholder);
      return;
    }
    setLoading(true);
    try {
      const syntax = parseReferenceSyntax(term);
      if (syntax) {
        const book = await resolveBook(syntax.bookQuery);
        if (!book || syntax.chapter > book.chapters) {
          setError('Referência não encontrada nesta edição. O NestLume não corrige silenciosamente uma passagem inválida.');
          return;
        }
        const chapter = await loadChapter(book.file, syntax.chapter);
        const maxVerse = Math.max(...chapter.map(verse => verse.verse));
        if ((syntax.startVerse && syntax.startVerse > maxVerse) || (syntax.endVerse && syntax.endVerse > maxVerse)) {
          setError(`O capítulo ${syntax.chapter} de ${book.nameShort} termina no versículo ${maxVerse} nesta edição.`);
          return;
        }
        onOpenReader({ code: book.ubsCode, chapter: syntax.chapter, startVerse: syntax.startVerse, endVerse: syntax.endVerse });
        return;
      }
      setHits(await searchBible(term, 40));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.error);
    } finally {
      setLoading(false);
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void runQuery();
  };

  return (
    <div className="page narrow-page">
      <p className="kicker">{t.explore.toUpperCase()}</p>
      <h1 className="page-title">Por onde você quer entrar?</h1>
      <p className="page-intro">Digite uma referência exata ou procure palavras na Bíblia Livre. A busca textual é local ao corpus — não é apresentada como busca semântica.</p>
      <form className="reference-search" onSubmit={submit}>
        <label htmlFor="reference">{t.passage} / {t.words}</label>
        <div className="search-row">
          <input id="reference" value={query} onChange={event => setQuery(event.target.value)} placeholder={t.searchPlaceholder} autoComplete="off" />
          <button type="submit" disabled={loading}>{loading ? t.loading : t.search}</button>
        </div>
        {error && <p className="field-error" role="alert">{error}</p>}
      </form>

      <div className="theme-strip" aria-label="Sugestões de busca textual">
        {['luz', 'graça', 'Espírito', 'aliança', 'sabedoria'].map(theme => (
          <button key={theme} onClick={() => { setQuery(theme); void runQuery(theme); }}>{theme}</button>
        ))}
      </div>

      {hits.length > 0 && <section className="search-results" aria-live="polite">
        <p className="micro-label">{hits.length} RESULTADOS MAIS RELEVANTES</p>
        {hits.map(hit => (
          <button key={`${hit.bookCode}-${hit.chapter}-${hit.verse}`} onClick={() => onOpenReader({
            code: hit.bookCode, chapter: hit.chapter, startVerse: hit.verse, endVerse: hit.verse,
          })}>
            <strong>{hit.bookName} {hit.chapter}:{hit.verse}</strong>
            <span>{hit.text}</span>
          </button>
        ))}
      </section>}

      {!loading && query.trim() && !error && hits.length === 0 && !parseReferenceSyntax(query) && <p className="empty-inline">{t.noResults}</p>}

      <div className="entry-list">
        <button onClick={() => onOpenReader({ code: 'JHN', chapter: 1, startVerse: 1, endVerse: 18 })}>
          <span><strong>João 1:1–18</strong><small>Primeiro encontro editorial — antes de Belém</small></span><span>Estudo inicial</span>
        </button>
        <button onClick={() => onNavigate('paste')}>
          <span><strong>{t.paste}</strong><small>{t.pastePrivacy}</small></span><span>{t.localOnly}</span>
        </button>
        <button onClick={() => onNavigate('ask')}>
          <span><strong>{t.askNestLume}</strong><small>{t.askNestLumeBody}</small></span><span>{t.prepare}</span>
        </button>
      </div>
    </div>
  );
}

function Reader({ t, target, fontScale, setFontScale, panel, setPanel, onOpenReader }: {
  t: T;
  target: ReaderTarget;
  fontScale: number;
  setFontScale: (scale: number) => void;
  panel: Panel;
  setPanel: (panel: Panel) => void;
  onOpenReader: (target: ReaderTarget) => void;
}) {
  const [book, setBook] = useState<CorpusBook | null>(null);
  const [verses, setVerses] = useState<CorpusVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [offlineState, setOfflineState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    Promise.all([getBookByCode(target.code), getBookByCode(target.code).then(async current => current ? loadChapter(current.file, target.chapter) : [])])
      .then(async ([currentBook, chapter]) => {
        if (!alive) return;
        if (!currentBook || !chapter.length || target.chapter > currentBook.chapters) throw new Error('Passagem não encontrada nesta edição.');
        const maxVerse = Math.max(...chapter.map(verse => verse.verse));
        if ((target.startVerse && target.startVerse > maxVerse) || (target.endVerse && target.endVerse > maxVerse)) {
          throw new Error(`Este capítulo termina no versículo ${maxVerse} nesta edição.`);
        }
        setBook(currentBook);
        setVerses(chapter.filter(verse => (!target.startVerse || verse.verse >= target.startVerse) && (!target.endVerse || verse.verse <= target.endVerse)));
        await saveReadingPosition({
          bookFile: currentBook.file,
          bookCode: currentBook.ubsCode,
          bookName: currentBook.nameShort,
          chapter: target.chapter,
          verse: target.startVerse,
        });
      })
      .catch(cause => { if (alive) setError(cause instanceof Error ? cause.message : t.error); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [target.code, target.chapter, target.startVerse, target.endVerse, t.error]);

  const isJohnOne = book?.ubsCode === 'JHN' && target.chapter === 1;
  const studyVisible = isJohnOne && (!target.startVerse || target.startVerse <= 18);

  async function bookmark() {
    if (!book) return;
    await saveEntry({
      kind: 'bookmark',
      bookFile: book.file,
      bookCode: book.ubsCode,
      bookName: book.nameShort,
      chapter: target.chapter,
      startVerse: target.startVerse,
      endVerse: target.endVerse,
      text: verses.map(verse => verse.text).join(' ').slice(0, 420),
    });
    setSaved(true);
  }

  async function saveNote() {
    if (!book || !note.trim()) return;
    await saveEntry({
      kind: 'note',
      bookFile: book.file,
      bookCode: book.ubsCode,
      bookName: book.nameShort,
      chapter: target.chapter,
      startVerse: target.startVerse,
      endVerse: target.endVerse,
      note: note.trim(),
    });
    setNote('');
    setNoteSaved(true);
    window.setTimeout(() => setNoteSaved(false), 2200);
  }

  async function downloadOffline() {
    if (!book) return;
    setOfflineState('loading');
    try {
      await requestOfflineBook(book.file, book.gitBlobSha1);
      setOfflineState('ready');
    } catch {
      setOfflineState('error');
    }
  }

  if (loading) return <div className="page narrow-page loading-state" role="status">{t.loading}</div>;
  if (error || !book) return <div className="page narrow-page"><p className="kicker">{t.error.toUpperCase()}</p><h1 className="page-title">Passagem indisponível</h1><p className="field-error" role="alert">{error}</p></div>;

  const referenceLabel = `${book.nameShort} ${target.chapter}${target.startVerse ? `:${target.startVerse}${target.endVerse && target.endVerse !== target.startVerse ? `–${target.endVerse}` : ''}` : ''}`;

  return (
    <div className="reader-layout">
      <article className="reader-column">
        <div className="reader-toolbar">
          <div><p className="micro-label">BÍBLIA LIVRE · RELEASE 2018.2.0</p><h1>{referenceLabel}</h1></div>
          <div className="reader-controls" aria-label="Controles de leitura">
            <button onClick={() => setFontScale(Math.max(.9, fontScale - .1))} aria-label="Diminuir texto">A−</button>
            <button onClick={() => setFontScale(Math.min(1.3, fontScale + .1))} aria-label="Aumentar texto">A+</button>
            <button onClick={() => void bookmark()}>{saved ? t.saved : t.save}</button>
          </div>
        </div>

        <nav className="chapter-nav" aria-label="Navegação entre capítulos">
          <button disabled={target.chapter <= 1} onClick={() => onOpenReader({ code: book.ubsCode, chapter: target.chapter - 1 })}>{t.previousChapter}</button>
          <span>{target.chapter} / {book.chapters}</span>
          <button disabled={target.chapter >= book.chapters} onClick={() => onOpenReader({ code: book.ubsCode, chapter: target.chapter + 1 })}>{t.nextChapter}</button>
        </nav>

        <div className="scripture" style={{ '--font-scale': fontScale } as React.CSSProperties}>
          {verses.map(verse => (
            <p key={verse.verse} id={'v' + verse.verse}>
              <sup>{verse.verse}</sup>{renderVerse(verse.text, verse.verse, isJohnOne, setPanel)}
            </p>
          ))}
        </div>

        <div className="reader-meta">
          <p className="attribution">Bíblia Livre (BLIVRE), © Diego Santos, Mario Sérgio e Marco Teles, fevereiro de 2018. Corpus integrado: release 2018.2.0 / Textus Receptus, CC BY 3.0 Brasil. <button onClick={() => setPanel('source')}>{t.source}</button></p>
          <button className="offline-button" onClick={() => void downloadOffline()} disabled={offlineState === 'loading'}>
            {offlineState === 'loading' ? t.loading : offlineState === 'ready' ? 'Disponível offline' : t.downloadOffline}
          </button>
          {offlineState === 'error' && <p className="field-error" role="alert">Não foi possível validar e salvar este livro offline.</p>}
        </div>

        {studyVisible ? (
          <>
            <div className="study-divider"><span>{t.study}</span></div>
            <section className="study-prose">
              <p className="kicker">RASCUNHO EDITORIAL · JOÃO 1:1–18</p>
              <h2>{john1PrologueStudy.title}</h2>
              <p className="lead">{john1PrologueStudy.lead}</p>
              {john1PrologueStudy.sections.map(section => {
                const claims = john1PrologueStudy.claims.filter(claim => section.claimIds.includes(claim.id));
                return (
                  <div className="study-section" key={section.id}>
                    <p className="micro-label">{section.eyebrow}</p>
                    <h3>{section.title}</h3>
                    <p>{section.body}</p>
                    <details className="study-evidence">
                      <summary>{t.evidence}</summary>
                      {claims.map(claim => {
                        const certainty = claim.certainty === 'high' ? t.certaintyHigh : claim.certainty === 'medium' ? t.certaintyMedium : t.certaintyLow;
                        const sources = john1PrologueStudy.sources.filter(source => claim.sourceIds.includes(source.id));
                        return (
                          <div className="claim-evidence" key={claim.id}>
                            <div className="claim-meta">
                              <span>{claim.layer.toUpperCase()}</span>
                              <span>{t.certainty}: <strong>{certainty}</strong></span>
                            </div>
                            <p>{claim.text}</p>
                            <small>{t.supportingSources}</small>
                            <ul>
                              {sources.map(source => <li key={source.id}><strong>{source.title}</strong>{source.locator ? ` · ${source.locator}` : ''}</li>)}
                            </ul>
                          </div>
                        );
                      })}
                    </details>
                  </div>
                );
              })}
              <button className="thread-card" onClick={() => setPanel('thread')}>
                <span className="micro-label">{t.thread.toUpperCase()}</span><strong>Criação → Luz → Nova criação</strong><span>Seguir conexão →</span>
              </button>
              <p className="source-note">Este encontro é um rascunho editorial de demonstração. Ele não recebe selo de revisão humana até que uma pessoa revisora real seja registrada.</p>
            </section>
          </>
        ) : (
          <section className="unavailable-study">
            <p className="micro-label">COBERTURA EDITORIAL</p>
            <h2>{t.unavailableStudy}</h2>
            <p>{t.unavailableStudyBody}</p>
          </section>
        )}

        <section className="reader-note-box">
          <label className="field"><span>{t.note} · {t.localOnly}</span>
            <textarea value={note} onChange={event => setNote(event.target.value)} placeholder="O que você percebeu, quer lembrar ou investigar depois?" />
          </label>
          <button className="secondary compact" disabled={!note.trim()} onClick={() => void saveNote()}>{noteSaved ? t.saved : t.addNote}</button>
        </section>
      </article>

      <aside className={'context-panel ' + (panel ? 'open' : '')} aria-hidden={!panel}>
        {panel && <PanelContent panel={panel} book={book} onClose={() => setPanel(null)} />}
      </aside>
      {panel && <button className="panel-backdrop" onClick={() => setPanel(null)} aria-label={t.close} />}
      {isJohnOne && <button className="floating-explore" onClick={() => setPanel(panel ? null : 'logos')}>Explorar <span>Palavra</span></button>}
    </div>
  );
}

function renderVerse(text: string, verse: number, interactive: boolean, setPanel: (panel: Panel) => void) {
  if (!interactive) return text;
  if (verse === 1 || verse === 14) {
    const parts = text.split('Palavra');
    if (parts.length > 1) return <>{parts[0]}<button className="word-link" onClick={() => setPanel('logos')}>Palavra</button>{parts.slice(1).join('Palavra')}</>;
  }
  if (verse === 6) {
    const parts = text.split('João');
    if (parts.length > 1) return <>{parts[0]}<button className="word-link" onClick={() => setPanel('john')}>João</button>{parts.slice(1).join('João')}</>;
  }
  return text;
}

function PanelContent({ panel, book, onClose }: { panel: Exclude<Panel, null>; book: CorpusBook; onClose: () => void }) {
  const content = useMemo(() => ({
    logos: <><p className="kicker">GREGO · JOÃO 1:1</p><h2>λόγος</h2><p className="translit">lógos</p><p>Nesta passagem, a expressão traduzida por <strong>“Palavra”</strong> identifica aquele que estava com Deus, era Deus e se fez carne. O sentido vem da frase e do argumento de João — não da soma de todos os significados possíveis de um dicionário.</p><dl><div><dt>Lema</dt><dd>λόγος</dd></div><div><dt>Idioma</dt><dd>Grego koiné</dd></div><div><dt>Certeza</dt><dd>A identificação básica é segura; o conjunto lexical definitivo ainda não foi incorporado.</dd></div></dl><p className="source-note">Nenhum alinhamento palavra a palavra além do que foi curado para este exemplo é inferido automaticamente.</p></>,
    john: <><p className="kicker">PESSOA · JOÃO 1:6</p><h2>João Batista</h2><p>O próprio trecho o apresenta como homem enviado por Deus e testemunha da Luz — e imediatamente nega que ele próprio fosse a Luz.</p><div className="certainty"><span>Identidade</span><strong>João Batista</strong><small>Não confundir automaticamente com João filho de Zebedeu ou com a questão da autoria do evangelho.</small></div></>,
    thread: <><p className="kicker">FIO DA BÍBLIA</p><h2>Luz que atravessa a história</h2><ol className="thread-list"><li><span>Gênesis 1</span><p>Luz aparece no cenário da criação. A ligação com João começa pela abertura “No princípio”.</p></li><li><span>João 1</span><p>Vida e luz são usadas para apresentar a Palavra. É conexão literária explícita, não um código escondido.</p></li><li><span>João 8</span><p>O evangelho retomará a linguagem da luz na fala de Jesus.</p></li></ol><p className="source-note">Percurso inicial e curado; não é apresentado como lista de todas as ocorrências.</p></>,
    source: <><p className="kicker">PROVENIÊNCIA DO TEXTO</p><h2>Bíblia Livre</h2><dl><div><dt>Arquivo deste livro</dt><dd>{book.file}</dd></div><div><dt>Release integrada</dt><dd>2018.2.0</dd></div><div><dt>Tradição textual</dt><dd>Textus Receptus</dd></div><div><dt>Licença da release integrada</dt><dd>Creative Commons Atribuição 3.0 Brasil</dd></div><div><dt>Integridade</dt><dd>{book.gitBlobSha1 ? `Git blob ${book.gitBlobSha1.slice(0, 12)}…` : 'Verificada no build'}</dd></div></dl><p>O manifesto registra a identidade de cada arquivo importado da release oficial dos autores. A distribuição atual do eBible é registrada separadamente e não é tratada como byte idêntica sem prova.</p><a className="text-link" href="https://github.com/blivre/BibliaLivre/releases/tag/2018.2.0" target="_blank" rel="noreferrer">Abrir release de origem ↗</a></>,
  }), [book]);

  return <div className="panel-inner"><button className="panel-close" onClick={onClose}>Fechar</button>{content[panel]}</div>;
}

function Paste({ t, onOpenReader }: { t: T; onOpenReader: (target: ReaderTarget) => void }) {
  const [text, setText] = useState('');
  const [version, setVersion] = useState('');
  const [reference, setReference] = useState('');
  const [matches, setMatches] = useState<SearchHit[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    setMatches([]);
    setMessage('');
    try {
      if (reference.trim()) {
        const syntax = parseReferenceSyntax(reference);
        if (syntax) {
          const book = await resolveBook(syntax.bookQuery);
          if (book && syntax.chapter <= book.chapters) {
            onOpenReader({ code: book.ubsCode, chapter: syntax.chapter, startVerse: syntax.startVerse, endVerse: syntax.endVerse });
            return;
          }
        }
        setMessage('A referência informada não pôde ser confirmada nesta edição. O texto não foi alterado.');
      }
      const candidates = await identifyPastedText(text, 6);
      setMatches(candidates);
      if (!candidates.length) setMessage(t.unknown + '. O conteúdo continua preservado nesta tela e nada será completado automaticamente.');
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page narrow-page paste-page">
      <p className="kicker">{t.paste.toUpperCase()}</p>
      <h1 className="page-title">Traga o texto que você já tem.</h1>
      <p className="page-intro">Nada é lido da área de transferência automaticamente. {t.pastePrivacy}</p>
      <label className="field"><span>Texto</span><textarea value={text} onChange={event => setText(event.target.value)} placeholder="Cole aqui a passagem, anotação ou trecho que você quer estudar…" /></label>
      <div className="field-grid">
        <label className="field"><span>{t.versionOptional}</span><input value={version} onChange={event => setVersion(event.target.value)} placeholder="Ex.: NVI" /></label>
        <label className="field"><span>{t.referenceOptional}</span><input value={reference} onChange={event => setReference(event.target.value)} placeholder="Ex.: João 1:1–5" /></label>
      </div>
      <p className="privacy-inline">Versão declarada: <strong>{version.trim() || 'não informada'}</strong>. O NestLume não adivinha nem publica a versão colada.</p>
      <button className="primary simple" disabled={!text.trim() || loading} onClick={() => void analyze()}>{loading ? t.loading : t.identifyLocal}</button>
      {message && <div className="match-box muted" role="status"><p>{message}</p></div>}
      {matches.length > 0 && <div className="match-box">
        <p className="micro-label">{t.possibleMatch.toUpperCase()}</p>
        {matches.map(hit => <button className="paste-match" key={`${hit.bookCode}-${hit.chapter}-${hit.verse}`} onClick={() => onOpenReader({
          code: hit.bookCode, chapter: hit.chapter, startVerse: hit.verse, endVerse: hit.verse,
        })}><strong>{hit.bookName} {hit.chapter}:{hit.verse}</strong><span>{hit.text}</span></button>)}
      </div>}
    </div>
  );
}

function Notebook({ t, onOpenReader }: { t: T; onOpenReader: (target: ReaderTarget) => void }) {
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [position, setPosition] = useState<ReadingPosition | null>(null);
  const [backup, setBackup] = useState<NotebookBackup | null>(null);
  const [message, setMessage] = useState('');

  async function refresh() {
    const [nextEntries, nextPosition] = await Promise.all([listEntries(), getReadingPosition()]);
    setEntries(nextEntries);
    setPosition(nextPosition);
  }

  useEffect(() => { void refresh(); }, []);

  async function remove(id: string) {
    await deleteEntry(id);
    await refresh();
  }

  async function downloadBackup() {
    const snapshot = await exportBackup();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `nestlume-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function chooseBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const valid = validateBackup(parsed);
      if (!valid.ok) {
        setMessage(valid.reason);
        setBackup(null);
        return;
      }
      setBackup(valid.backup);
      setMessage('');
    } catch {
      setMessage('Arquivo de backup inválido.');
      setBackup(null);
    } finally {
      event.target.value = '';
    }
  }

  async function applyBackup(strategy: 'merge' | 'replace') {
    if (!backup) return;
    const result = await importBackup(backup, strategy);
    setMessage(`${result.imported} registros importados${result.replaced ? ' após substituição confirmada' : ' por mesclagem'}.`);
    setBackup(null);
    await refresh();
  }

  async function clearAll() {
    if (!window.confirm('Apagar todas as anotações, marcações e posição de leitura salvas neste navegador?')) return;
    await clearPersonalData();
    setMessage('Dados locais apagados.');
    await refresh();
  }

  return (
    <div className="page narrow-page">
      <p className="kicker">{t.notebook.toUpperCase()}</p>
      <h1 className="page-title">Guarde o caminho, não uma pontuação.</h1>
      <p className="page-intro">Posição, perguntas e anotações ficam no IndexedDB deste navegador. Não são enviadas ao MillionsNest nem a um provedor de IA.</p>

      {position && <button className="notebook-item" onClick={() => onOpenReader({
        code: position.bookCode, chapter: position.chapter, startVerse: position.verse,
      })}><span><small>ÚLTIMA LEITURA</small><strong>{position.bookName} {position.chapter}{position.verse ? `:${position.verse}` : ''}</strong><em>Retomar →</em></span></button>}

      <div className="notebook-list">
        {entries.map(entry => <article className="notebook-entry" key={entry.id}>
          <button className="entry-open" onClick={() => onOpenReader({
            code: entry.bookCode, chapter: entry.chapter, startVerse: entry.startVerse, endVerse: entry.endVerse,
          })}>
            <span className="micro-label">{entry.kind.toUpperCase()}</span>
            <strong>{entry.bookName} {entry.chapter}{entry.startVerse ? `:${entry.startVerse}` : ''}</strong>
            {entry.note && <p>{entry.note}</p>}
            {!entry.note && entry.text && <p>{entry.text}</p>}
          </button>
          <button className="entry-delete" onClick={() => void remove(entry.id)}>{t.delete}</button>
        </article>)}
        {!entries.length && <div className="empty-state"><h2>Ainda está quieto por aqui.</h2><p>Guarde uma leitura ou escreva uma anotação para começar.</p></div>}
      </div>

      <section className="backup-panel">
        <p className="micro-label">BACKUP LOCAL</p>
        <div className="backup-actions">
          <button onClick={() => void downloadBackup()}>{t.exportData}</button>
          <label className="file-button">{t.importData}<input type="file" accept="application/json,.json" onChange={event => void chooseBackup(event)} /></label>
          <button className="danger-link" onClick={() => void clearAll()}>{t.clearAll}</button>
        </div>
        {backup && <div className="backup-preview">
          <strong>{t.backupPreview}</strong>
          <p>{backup.records.length} registros · exportado em {new Date(backup.exportedAt).toLocaleString()}</p>
          <div><button onClick={() => void applyBackup('merge')}>{t.backupMerge}</button><button onClick={() => void applyBackup('replace')}>{t.backupReplace}</button></div>
        </div>}
        {message && <p className="privacy-inline" role="status">{message}</p>}
      </section>
    </div>
  );
}

function States({ t, onNavigate }: { t: T; onNavigate: (page: Exclude<Page, 'read'>) => void }) {
  return (
    <div className="page narrow-page">
      <p className="kicker">ESTADOS DE RECUPERAÇÃO</p>
      <h1 className="page-title">Quando algo não está disponível, o app diz a verdade.</h1>
      <div className="state-stack">
        <section><span>IA indisponível</span><h2>{t.noAi}</h2><p>{t.noAiBody}</p><button onClick={() => onNavigate('explore')}>Usar biblioteca</button></section>
        <section><span>Sem rede</span><h2>Livros baixados continuam legíveis.</h2><p>O usuário escolhe explicitamente quais livros deseja guardar. O pacote só é confirmado depois da verificação de integridade.</p></section>
        <section><span>Referência inválida</span><h2>“João 99” não existe.</h2><p>O NestLume mostra o erro; não troca a referência silenciosamente por algo que “parece” correto.</p></section>
        <section><span>Sem comentário</span><h2>A Bíblia não vira um spinner.</h2><p>Quando ainda não há estudo editorial para uma passagem, o texto bíblico continua disponível e o limite é informado.</p></section>
      </div>
    </div>
  );
}

function BottomNav({ page, t, navigate }: { page: Page; t: T; navigate: (page: Exclude<Page, 'read'>) => void }) {
  if (page === 'read') return null;
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      <button className={page === 'today' ? 'active' : ''} onClick={() => navigate('today')}>{t.today}</button>
      <button className={page === 'explore' || page === 'paste' || page === 'ask' ? 'active' : ''} onClick={() => navigate('explore')}>{t.explore}</button>
      <button className={page === 'notebook' ? 'active' : ''} onClick={() => navigate('notebook')}>{t.notebook}</button>
    </nav>
  );
}
