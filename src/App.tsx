import { FormEvent, useEffect, useMemo, useState } from 'react';
import { bibleEdition, john1_1_18 } from './data/john1';
import { Locale, messages } from './i18n/messages';
import { parseReference } from './lib/reference';

type T = Record<keyof typeof messages.pt, string>;

type Page = 'today' | 'explore' | 'read' | 'paste' | 'notebook' | 'states';
type Panel = 'logos' | 'john' | 'thread' | 'source' | null;
type Theme = 'system' | 'light' | 'dark';

const studySections = {
  central: {
    eyebrow: 'DESCOBERTA CENTRAL',
    title: 'João começa antes de Belém',
    body: 'O prólogo não apresenta Jesus apenas como alguém que entrou na história. João recua ao “princípio” e descreve a Palavra já junto de Deus — e, ao mesmo tempo, como Deus. A cena de Belém só pode ser entendida depois dessa afirmação maior: aquele que se fez carne não começou a existir quando nasceu.',
  },
  context: {
    eyebrow: 'CONTEXTO',
    title: '“No princípio” acende uma memória',
    body: 'A abertura ecoa deliberadamente Gênesis. Isso não transforma cada palavra em código secreto; cria um horizonte literário. João apresenta a chegada de Jesus dentro da linguagem de criação, vida e luz. A conexão é textual e visível antes de ser uma aplicação teológica.',
  },
  interpretation: {
    eyebrow: 'INTERPRETAÇÃO',
    title: 'A Palavra não é João Batista',
    body: 'O texto interrompe o prólogo para apresentar “um homem enviado por Deus, cujo nome era João”. Em seguida, esclarece: ele não era a Luz. A distinção impede fundir o testemunho com aquele de quem ele testemunha.',
  },
  application: {
    eyebrow: 'APLICAÇÃO',
    title: 'Conhecer Deus ganha um rosto',
    body: 'O movimento final do trecho é revelação: o Filho torna o Pai conhecido. A aplicação nasce do argumento do texto — a fé cristã não busca um Deus abstrato atrás de Jesus; olha para Jesus para compreender quem Deus se revelou ser.',
  },
};

function routeFromLocation(): Page {
  const path = window.location.pathname;
  if (path.startsWith('/explorar')) return 'explore';
  if (path.startsWith('/ler')) return 'read';
  if (path.startsWith('/colar')) return 'paste';
  if (path.startsWith('/caderno')) return 'notebook';
  if (path.startsWith('/estados')) return 'states';
  return 'today';
}

function pathFor(page: Page): string {
  return { today: '/', explore: '/explorar', read: '/ler/joao/1', paste: '/colar', notebook: '/caderno', states: '/estados' }[page];
}

export default function App() {
  const [page, setPage] = useState<Page>(() => routeFromLocation());
  const [panel, setPanel] = useState<Panel>(null);
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('nestlume:locale') as Locale) || 'pt');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('nestlume:theme') as Theme) || 'system');
  const [fontScale, setFontScale] = useState(1);
  const [saved, setSaved] = useState(false);
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
    const pop = () => setPage(routeFromLocation());
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);

  const navigate = (next: Page) => {
    const path = pathFor(next);
    window.history.pushState({}, '', path);
    setPage(next);
    setPanel(null);
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <div className="app-shell">
      <Header locale={locale} setLocale={setLocale} theme={theme} setTheme={setTheme} onHome={() => navigate('today')} />
      <main>
        {page === 'today' && <Today t={t} onNavigate={navigate} />}
        {page === 'explore' && <Explore t={t} onNavigate={navigate} />}
        {page === 'read' && <Reader t={t} fontScale={fontScale} setFontScale={setFontScale} panel={panel} setPanel={setPanel} saved={saved} setSaved={setSaved} />}
        {page === 'paste' && <Paste t={t} onNavigate={navigate} />}
        {page === 'notebook' && <Notebook t={t} onNavigate={navigate} saved={saved} />}
        {page === 'states' && <States t={t} onNavigate={navigate} />}
      </main>
      <BottomNav page={page} t={t} navigate={navigate} />
    </div>
  );
}

function Header({ locale, setLocale, theme, setTheme, onHome }: { locale: Locale; setLocale: (l: Locale) => void; theme: Theme; setTheme: (t: Theme) => void; onHome: () => void }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={onHome} aria-label="NestLume — início"><span className="brand-mark">N</span><span>NestLume</span></button>
      <div className="top-actions">
        <label className="select-wrap"><span className="sr-only">Idioma</span><select value={locale} onChange={e => setLocale(e.target.value as Locale)}><option value="pt">PT</option><option value="en">EN</option><option value="es">ES</option></select></label>
        <label className="select-wrap"><span className="sr-only">Tema</span><select value={theme} onChange={e => setTheme(e.target.value as Theme)}><option value="system">◐</option><option value="light">Claro</option><option value="dark">Escuro</option></select></label>
      </div>
    </header>
  );
}

function Today({ t, onNavigate }: { t: T; onNavigate: (p: Page) => void }) {
  return (
    <div className="page page-home">
      <section className="hero editorial-width">
        <p className="kicker">JOÃO · VENHAM E VEJAM</p>
        <h1>Há mais luz no texto<br />do que pressa consegue ver.</h1>
        <p className="hero-copy">Leia a Bíblia com espaço para perceber contexto, palavras, conexões e fontes — sem transformar profundidade em espetáculo.</p>
        <div className="hero-actions">
          <button className="primary" onClick={() => onNavigate('read')}>{t.continue}<span>João 1:1–18</span></button>
          <button className="secondary" onClick={() => onNavigate('explore')}>{t.begin}</button>
        </div>
      </section>
      <section className="today-trail editorial-width">
        <div className="trail-rule" />
        <p className="micro-label">UM DETALHE PARA LEVAR COM VOCÊ</p>
        <button className="discovery-teaser" onClick={() => onNavigate('read')}>
          <span className="teaser-number">01</span>
          <span><strong>“No princípio” não começa em Belém.</strong><small>Veja por que João abre o evangelho com palavras que fazem Gênesis reaparecer na memória.</small></span>
          <span aria-hidden="true">→</span>
        </button>
      </section>
    </div>
  );
}

function Explore({ t, onNavigate }: { t: T; onNavigate: (p: Page) => void }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseReference(query);
    if (!parsed || parsed.book !== 'João' || parsed.chapter !== 1) {
      setError(query.trim() ? 'Não encontrei essa referência na cobertura atual do protótipo. Nenhuma passagem foi inventada ou corrigida silenciosamente.' : 'Digite uma referência, por exemplo: João 1:1–18.');
      return;
    }
    setError('');
    onNavigate('read');
  };
  return (
    <div className="page narrow-page">
      <p className="kicker">{t.explore.toUpperCase()}</p>
      <h1 className="page-title">Por onde você quer entrar?</h1>
      <p className="page-intro">Uma passagem, uma pergunta ou um texto que já está com você.</p>
      <form className="reference-search" onSubmit={submit}>
        <label htmlFor="reference">Passagem</label>
        <div className="search-row"><input id="reference" value={query} onChange={e => setQuery(e.target.value)} placeholder="João 1:1–18" autoComplete="off" /><button type="submit">Abrir</button></div>
        {error && <p className="field-error" role="alert">{error}</p>}
      </form>
      <div className="entry-list">
        <button onClick={() => onNavigate('read')}><span><strong>João 1:1–18</strong><small>Antes de Belém — o Deus que veio morar entre nós</small></span><span>Disponível</span></button>
        <button onClick={() => onNavigate('paste')}><span><strong>{t.paste}</strong><small>Seu texto fica neste dispositivo neste protótipo.</small></span><span>Privado</span></button>
        <div className="entry-disabled"><span><strong>Perguntar livremente</strong><small>A IA só será habilitada após aprovação de custo, idade, privacidade e qualidade.</small></span><span>Bloqueado</span></div>
      </div>
    </div>
  );
}

function Reader({ t, fontScale, setFontScale, panel, setPanel, saved, setSaved }: { t: T; fontScale: number; setFontScale: (n: number) => void; panel: Panel; setPanel: (p: Panel) => void; saved: boolean; setSaved: (v: boolean) => void }) {
  return (
    <div className="reader-layout">
      <article className="reader-column">
        <div className="reader-toolbar">
          <div><p className="micro-label">BÍBLIA LIVRE · 2018</p><h1>João 1:1–18</h1></div>
          <div className="reader-controls" aria-label="Controles de leitura"><button onClick={() => setFontScale(Math.max(.9, fontScale - .1))} aria-label="Diminuir texto">A−</button><button onClick={() => setFontScale(Math.min(1.3, fontScale + .1))} aria-label="Aumentar texto">A+</button><button onClick={() => setSaved(!saved)}>{saved ? t.saved : t.save}</button></div>
        </div>
        <div className="scripture" style={{ '--font-scale': fontScale } as React.CSSProperties}>
          {john1_1_18.map(v => <p key={v.verse} id={'v' + v.verse}><sup>{v.verse}</sup>{renderVerse(v.text, v.verse, setPanel)}</p>)}
        </div>
        <p className="attribution">{bibleEdition.attribution} <button onClick={() => setPanel('source')}>{t.source}</button></p>
        <div className="study-divider"><span>Estudo</span></div>
        <section className="study-prose">
          <p className="kicker">ANTES DE BELÉM</p>
          <h2>O Deus que veio morar entre nós</h2>
          <p className="lead">João não começa com uma manjedoura. Ele abre uma porta muito mais antiga: “No princípio”. Antes de acompanhar Jesus pelas estradas da Galileia, o evangelho quer que saibamos quem está caminhando por elas.</p>
          {Object.values(studySections).map(section => <div className="study-section" key={section.title}><p className="micro-label">{section.eyebrow}</p><h3>{section.title}</h3><p>{section.body}</p></div>)}
          <button className="thread-card" onClick={() => setPanel('thread')}><span className="micro-label">{t.thread.toUpperCase()}</span><strong>Criação → Luz → Nova criação</strong><span>Seguir conexão →</span></button>
        </section>
      </article>
      <aside className={'context-panel ' + (panel ? 'open' : '')} aria-hidden={!panel}>
        {panel && <PanelContent panel={panel} onClose={() => setPanel(null)} />}
      </aside>
      {panel && <button className="panel-backdrop" onClick={() => setPanel(null)} aria-label={t.close} />}
      <button className="floating-explore" onClick={() => setPanel(panel ? null : 'logos')}>Explorar <span>Palavra</span></button>
    </div>
  );
}

function renderVerse(text: string, verse: number, setPanel: (p: Panel) => void) {
  if (verse === 1 || verse === 14) {
    const parts = text.split('Palavra');
    return <>{parts[0]}<button className="word-link" onClick={() => setPanel('logos')}>Palavra</button>{parts[1]}</>;
  }
  if (verse === 6) {
    const parts = text.split('João');
    return <>{parts[0]}<button className="word-link" onClick={() => setPanel('john')}>João</button>{parts[1]}</>;
  }
  return text;
}

function PanelContent({ panel, onClose }: { panel: Exclude<Panel, null>; onClose: () => void }) {
  const content = useMemo(() => ({
    logos: <><p className="kicker">GREGO · JOÃO 1:1</p><h2>λόγος</h2><p className="translit">lógos</p><p>Nesta passagem, a expressão traduzida por <strong>“Palavra”</strong> identifica aquele que estava com Deus, era Deus e se fez carne. O sentido vem da frase e do argumento de João — não da soma de todos os significados possíveis de um dicionário.</p><dl><div><dt>Lema</dt><dd>λόγος</dd></div><div><dt>Idioma</dt><dd>Grego koiné</dd></div><div><dt>Certeza</dt><dd>Alta para a identificação lexical; interpretação deve seguir o contexto.</dd></div></dl><p className="source-note">Fonte lexical definitiva ainda não incorporada ao protótipo. Nenhum alinhamento palavra-a-palavra adicional é anunciado.</p></>,
    john: <><p className="kicker">PESSOA · JOÃO 1:6</p><h2>João Batista</h2><p>O próprio trecho o apresenta como homem enviado por Deus e testemunha da Luz — e imediatamente nega que ele próprio fosse a Luz.</p><div className="certainty"><span>Identidade</span><strong>João Batista</strong><small>Não confundir automaticamente com João filho de Zebedeu ou com a questão da autoria do evangelho.</small></div></>,
    thread: <><p className="kicker">FIO DA BÍBLIA</p><h2>Luz que atravessa a história</h2><ol className="thread-list"><li><span>Gênesis 1</span><p>Luz aparece no cenário da criação. A ligação com João começa pela abertura “No princípio”.</p></li><li><span>João 1</span><p>Vida e luz são usadas para apresentar a Palavra. É conexão literária explícita, não um código escondido.</p></li><li><span>João 8</span><p>O evangelho retomará a linguagem da luz na fala de Jesus.</p></li></ol><p className="source-note">Este percurso diferencia citação, eco literário e relação temática. Cobertura inicial — não “todas as ocorrências”.</p></>,
    source: <><p className="kicker">FONTE DO TEXTO</p><h2>Bíblia Livre</h2><dl><div><dt>ID</dt><dd>porbr2018 / PORBLJ</dd></div><div><dt>Edição</dt><dd>2018</dd></div><div><dt>Fonte</dt><dd>eBible.org</dd></div><div><dt>Licença declarada pela distribuição atual</dt><dd>Creative Commons Attribution 4.0</dd></div></dl><p>{bibleEdition.attribution}</p><a className="text-link" href={bibleEdition.chapterUrl} target="_blank" rel="noreferrer">Abrir capítulo na fonte ↗</a></>,
  }), []);
  return <div className="panel-inner"><button className="panel-close" onClick={onClose}>Fechar</button>{content[panel]}</div>;
}

function Paste({ t, onNavigate }: { t: T; onNavigate: (p: Page) => void }) {
  const [text, setText] = useState('');
  const [version, setVersion] = useState('');
  const [reference, setReference] = useState('');
  const [result, setResult] = useState<'idle' | 'match' | 'unknown'>('idle');
  const analyze = () => {
    const normalized = text.toLowerCase();
    if (normalized.includes('no princípio era a palavra') || parseReference(reference)?.book === 'João') setResult('match');
    else setResult('unknown');
  };
  return <div className="page narrow-page paste-page"><p className="kicker">{t.paste.toUpperCase()}</p><h1 className="page-title">Traga o texto que você já tem.</h1><p className="page-intro">Nada é lido da sua área de transferência automaticamente. Neste protótipo, o conteúdo permanece somente no estado local da página e não é enviado a um provedor de IA.</p><label className="field"><span>Texto</span><textarea value={text} onChange={e => setText(e.target.value)} placeholder="Cole aqui a passagem, anotação ou trecho que você quer estudar…" /></label><div className="field-grid"><label className="field"><span>Versão informada por você <small>opcional</small></span><input value={version} onChange={e => setVersion(e.target.value)} placeholder="Ex.: NVI" /></label><label className="field"><span>Referência <small>opcional</small></span><input value={reference} onChange={e => setReference(e.target.value)} placeholder="Ex.: João 1:1–5" /></label></div><button className="primary simple" disabled={!text.trim()} onClick={analyze}>Identificar sem enviar</button>{result === 'match' && <div className="match-box"><p className="micro-label">CORRESPONDÊNCIA POSSÍVEL</p><h2>João 1</h2><p>A redação parece corresponder à passagem que já possui estudo no acervo autorizado. Confirme a referência; o NestLume não adivinha a versão.</p><button onClick={() => onNavigate('read')}>Abrir estudo publicado</button></div>}{result === 'unknown' && <div className="match-box muted"><p className="micro-label">NÃO IDENTIFICADO COM SEGURANÇA</p><p>O texto foi preservado. Você pode ajustar a referência ou continuar com ele no caderno. Nenhum texto ausente será completado automaticamente.</p></div>}</div>;
}

function Notebook({ t, onNavigate, saved }: { t: T; onNavigate: (p: Page) => void; saved: boolean }) {
  return <div className="page narrow-page"><p className="kicker">{t.notebook.toUpperCase()}</p><h1 className="page-title">Guarde o caminho, não uma pontuação.</h1><p className="page-intro">O caderno existe para continuidade: posição, perguntas e descobertas — não para medir espiritualidade.</p>{saved ? <button className="notebook-item" onClick={() => onNavigate('read')}><span><small>LEITURA GUARDADA</small><strong>João 1:1–18</strong><em>Voltar ao ponto de leitura →</em></span></button> : <div className="empty-state"><h2>Ainda está quieto por aqui.</h2><p>Quando você guardar uma leitura ou uma descoberta, ela aparecerá aqui.</p><button onClick={() => onNavigate('read')}>Ler João 1</button></div>}<div className="local-note"><p className="micro-label">PRIVACIDADE DO PROTÓTIPO</p><p>Preferências e estado de leitura ficam no navegador. Sincronização, conta e exportação ainda não fazem parte deste lote.</p></div></div>;
}

function States({ t, onNavigate }: { t: T; onNavigate: (p: Page) => void }) {
  return <div className="page narrow-page"><p className="kicker">ESTADOS DE RECUPERAÇÃO</p><h1 className="page-title">Quando algo não está disponível, o app diz a verdade.</h1><div className="state-stack"><section><span>IA indisponível</span><h2>{t.noAi}</h2><p>{t.noAiBody}</p><button onClick={() => onNavigate('explore')}>Usar biblioteca</button></section><section><span>Sem rede</span><h2>O que foi salvo continua legível.</h2><p>O shell da PWA possui estratégia de cache. Pacotes bíblicos completos offline entram somente após a importação íntegra do corpus.</p></section><section><span>Referência inválida</span><h2>“João 99” não existe.</h2><p>O NestLume mostra o erro; não troca a referência silenciosamente por algo que “parece” correto.</p></section></div></div>;
}

function BottomNav({ page, t, navigate }: { page: Page; t: T; navigate: (p: Page) => void }) {
  if (page === 'read') return null;
  return <nav className="bottom-nav" aria-label="Navegação principal"><button className={page === 'today' ? 'active' : ''} onClick={() => navigate('today')}>{t.today}</button><button className={page === 'explore' || page === 'paste' ? 'active' : ''} onClick={() => navigate('explore')}>{t.explore}</button><button className={page === 'notebook' ? 'active' : ''} onClick={() => navigate('notebook')}>{t.notebook}</button></nav>;
}
