type LexicalBundle = {
  provenance: { commit: string };
  lexicon: Record<string, {
    eStrong: string;
    greek: string | null;
    transliteration: string | null;
    morph: string | null;
    gloss: string | null;
  }>;
  tokens: Array<{
    refInstance: string;
    surface: string | null;
    lemma: string | null;
    grammar: string | null;
    eStrong: string;
    editions: string[];
  }>;
  curatedMappings: Array<{
    displayedWord: string;
    verse: number;
    eStrong: string;
    sourceInstances: string[];
    mappingType: string;
    certainty: string;
  }>;
};

export function LexicalPanel({ bundle, verse, eStrong = 'G3056' }: {
  bundle: LexicalBundle;
  verse: number;
  eStrong?: string;
}) {
  const lexeme = bundle.lexicon[eStrong];
  const mapping = bundle.curatedMappings.find(item => item.eStrong === eStrong && item.verse === verse);
  const occurrence = bundle.tokens.find(token =>
    token.eStrong === eStrong && mapping?.sourceInstances.includes(token.refInstance)
  );

  if (!lexeme || !occurrence || !mapping) {
    return (
      <>
        <p className="kicker">IDIOMA ORIGINAL · DADO INDISPONÍVEL</p>
        <h2>Este vínculo ainda não foi validado.</h2>
        <p>O NestLume não cria alinhamento palavra por palavra quando a fonte correspondente ainda não foi incorporada.</p>
      </>
    );
  }

  return (
    <>
      <p className="kicker">GREGO · JOÃO 1:{verse} · DADO VERIFICADO</p>
      <h2>{lexeme.greek}</h2>
      <p className="translit">{lexeme.transliteration}</p>
      <p>
        Nesta passagem, <strong>“{mapping.displayedWord}”</strong> está ligado de forma curada à ocorrência
        grega indicada abaixo. O significado contextual continua sendo determinado pela frase e pelo argumento
        da passagem — não pela soma de todos os sentidos possíveis de um léxico.
      </p>
      <dl>
        <div><dt>Forma no versículo</dt><dd>{occurrence.surface}</dd></div>
        <div><dt>Lema</dt><dd>{occurrence.lemma ?? lexeme.greek}</dd></div>
        <div><dt>Transliteração</dt><dd>{lexeme.transliteration}</dd></div>
        <div><dt>Morfologia</dt><dd>{occurrence.grammar}</dd></div>
        <div><dt>Gloss lexical</dt><dd>{lexeme.gloss}</dd></div>
        <div><dt>Idioma</dt><dd>Grego koiné</dd></div>
        <div><dt>Mapeamento</dt><dd>Curado para João 1:{verse}</dd></div>
        <div><dt>Certeza</dt><dd>Alta para forma, lema e vínculo curado neste recorte.</dd></div>
      </dl>
      <p className="source-note">
        Fonte lexical/morfológica: STEP Bible, snapshot <code>{bundle.provenance.commit.slice(0, 10)}…</code>,
        CC BY 4.0. A ocorrência está atestada em TR no dataset integrado. O NestLume não generaliza este vínculo
        automaticamente para outras traduções.
      </p>
      <a
        className="text-link"
        href={`https://github.com/STEPBible/STEPBible-Data/tree/${bundle.provenance.commit}`}
        target="_blank"
        rel="noreferrer"
      >
        Abrir fonte fixada ↗
      </a>
    </>
  );
}
