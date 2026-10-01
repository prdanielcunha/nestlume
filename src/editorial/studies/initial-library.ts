import { EditorialStudy } from '../schema';

type StudySeed = {
  id: string;
  bookCode: 'JHN' | 'PRO';
  chapter: number;
  startVerse: number;
  endVerse: number;
  title: string;
  lead: string;
  discoveryTitle: string;
  discoveryBody: string;
  discoveryClaim: string;
  applicationTitle: string;
  applicationBody: string;
  applicationClaim: string;
};

function scriptureDraft(seed: StudySeed): EditorialStudy {
  const bookName = seed.bookCode === 'JHN' ? 'João' : 'Provérbios';
  const reference = `${bookName} ${seed.chapter}:${seed.startVerse}–${seed.endVerse}`;
  const sourceId = `blivre-${seed.bookCode.toLowerCase()}-${seed.chapter}-${seed.startVerse}-${seed.endVerse}`;

  return {
    schemaVersion: 1,
    id: seed.id,
    version: '0.1.0-draft',
    locale: 'pt-BR',
    reference: {
      editionId: 'blivre-2018.2.0-tr',
      bookCode: seed.bookCode,
      chapter: seed.chapter,
      startVerse: seed.startVerse,
      endVerse: seed.endVerse,
    },
    title: seed.title,
    lead: seed.lead,
    sources: [{
      id: sourceId,
      kind: 'scripture',
      title: `Bíblia Livre — ${reference}`,
      edition: 'release 2018.2.0 / Textus Receptus',
      locator: reference,
      license: 'CC BY 3.0 Brasil (corpus integrado)',
    }],
    claims: [
      {
        id: `${seed.id}-discovery`,
        layer: 'interpretation',
        text: seed.discoveryClaim,
        sourceIds: [sourceId],
        certainty: 'high',
      },
      {
        id: `${seed.id}-application`,
        layer: 'application',
        text: seed.applicationClaim,
        sourceIds: [sourceId],
        certainty: 'high',
      },
    ],
    sections: [
      {
        id: 'central',
        eyebrow: 'DESCOBERTA CENTRAL',
        title: seed.discoveryTitle,
        body: seed.discoveryBody,
        layer: 'interpretation',
        claimIds: [`${seed.id}-discovery`],
      },
      {
        id: 'application',
        eyebrow: 'PARA LEVAR À VIDA',
        title: seed.applicationTitle,
        body: seed.applicationBody,
        layer: 'application',
        claimIds: [`${seed.id}-application`],
      },
    ],
    review: {
      status: 'draft',
      reviewer: null,
      reviewedAt: null,
    },
  };
}

export const initialEditorialLibrary: EditorialStudy[] = [
  scriptureDraft({
    id: 'john-3-1-21-new-birth',
    bookCode: 'JHN',
    chapter: 3,
    startVerse: 1,
    endVerse: 21,
    title: 'A vida que não começa do lado de fora',
    lead: 'Nicodemos chega com certezas religiosas e encontra uma pergunta mais profunda: de onde vem a vida que consegue enxergar o Reino de Deus?',
    discoveryTitle: 'Jesus desloca a conversa de desempenho para nascimento',
    discoveryBody: 'Nicodemos começa reconhecendo sinais e chamando Jesus de Mestre. Jesus responde falando de nascer novamente, de água e do Espírito. O centro da conversa não é acumular informação religiosa, mas receber uma vida cuja origem é o Espírito e cuja resposta é crer no Filho.',
    discoveryClaim: 'João 3:1–21 move a conversa de sinais e conhecimento religioso para novo nascimento pelo Espírito, fé no Filho e vinda à luz.',
    applicationTitle: 'A luz não pede maquiagem',
    applicationBody: 'O final do trecho contrasta esconder-se nas trevas com vir à luz. A resposta coerente ao amor de Deus não é apenas admirar uma doutrina, mas aproximar a vida da verdade, permitindo que ela seja exposta diante de Deus.',
    applicationClaim: 'O próprio trecho relaciona crer no Filho e vir à luz com uma vida praticada na verdade diante de Deus.',
  }),
  scriptureDraft({
    id: 'john-4-1-26-living-water',
    bookCode: 'JHN',
    chapter: 4,
    startVerse: 1,
    endVerse: 26,
    title: 'Quando a sede encontra quem está diante dela',
    lead: 'A conversa começa com água de um poço e termina diante da pergunta sobre quem Jesus é e como o Pai procura adoradores.',
    discoveryTitle: 'Jesus não oferece só uma solução para a sede',
    discoveryBody: 'A mulher pensa primeiro na água física e no esforço de voltar ao poço. Jesus conduz a conversa para a “água viva”, para a verdade de sua própria história e para uma adoração que não cabe apenas numa disputa de localização.',
    discoveryClaim: 'João 4:1–26 conecta a oferta de água viva, a exposição verdadeira da vida da mulher e a adoração ao Pai em espírito e em verdade.',
    applicationTitle: 'Adoração e verdade caminham juntas',
    applicationBody: 'Jesus não contorna a realidade da mulher para falar de espiritualidade. Ele traz sua história à conversa e, ao mesmo tempo, a convida a olhar além da disputa entre lugares. O texto convida a aproximar de Deus uma vida inteira, sem separar adoração de verdade.',
    applicationClaim: 'No diálogo, Jesus trata a história real da mulher antes de ensinar sobre adoração em espírito e em verdade.',
  }),
  scriptureDraft({
    id: 'john-6-25-40-bread-of-life',
    bookCode: 'JHN',
    chapter: 6,
    startVerse: 25,
    endVerse: 40,
    title: 'Mais do que o pão que acaba',
    lead: 'A multidão procura Jesus depois de comer. Ele transforma a busca por outra refeição numa conversa sobre aquilo que permanece para a vida eterna.',
    discoveryTitle: 'O sinal aponta além da saciedade imediata',
    discoveryBody: 'Jesus diz que a multidão o procura porque comeu e se fartou. Em seguida, contrasta a comida que perece com a que permanece, identifica a obra de Deus como crer naquele que foi enviado e se apresenta como o pão da vida.',
    discoveryClaim: 'João 6:25–40 contrasta a busca pela comida que perece com a fé em Jesus, apresentado no trecho como o pão da vida que dá vida eterna.',
    applicationTitle: 'Nem toda busca por Jesus busca Jesus',
    applicationBody: 'O texto permite uma pergunta desconfortável e útil: o que estamos realmente procurando quando nos aproximamos de Cristo? Jesus não despreza a fome humana, mas não permite que o benefício recebido ocupe o lugar daquele que o dá.',
    applicationClaim: 'Jesus distingue no trecho a busca motivada pelo pão recebido da fé nele como aquele que o Pai enviou.',
  }),
  scriptureDraft({
    id: 'john-10-1-18-good-shepherd',
    bookCode: 'JHN',
    chapter: 10,
    startVerse: 1,
    endVerse: 18,
    title: 'A voz do Pastor e a vida das ovelhas',
    lead: 'O Bom Pastor não é definido por aparência de liderança, mas por conhecer, conduzir, proteger e entregar a própria vida pelas ovelhas.',
    discoveryTitle: 'O contraste revela o coração do Pastor',
    discoveryBody: 'Jesus contrapõe sua ação à do ladrão e do contratado. Enquanto um destrói e o outro abandona quando o perigo chega, o Bom Pastor conhece suas ovelhas e dá a vida por elas. A abundância do versículo 10 pertence a esse quadro de cuidado sacrificial.',
    discoveryClaim: 'João 10:1–18 define o Bom Pastor em contraste com ladrões e contratados: ele conhece suas ovelhas, as conduz e dá a própria vida por elas.',
    applicationTitle: 'Reconhecer a voz também é aprender o caráter',
    applicationBody: 'No trecho, as ovelhas reconhecem a voz do pastor porque pertencem a uma relação de conhecimento e cuidado. Discernimento cristão não precisa nascer do fascínio por qualquer voz forte; pode começar perguntando se aquilo combina com o caráter do Pastor que dá a vida.',
    applicationClaim: 'A passagem associa seguir a voz do pastor ao conhecimento entre pastor e ovelhas e ao cuidado sacrificial do Bom Pastor.',
  }),
  scriptureDraft({
    id: 'john-13-1-17-washed-feet',
    bookCode: 'JHN',
    chapter: 13,
    startVerse: 1,
    endVerse: 17,
    title: 'Grandeza com uma toalha nas mãos',
    lead: 'João apresenta Jesus consciente de quem é e de onde veio; exatamente então ele se levanta da mesa e assume o lugar de quem serve.',
    discoveryTitle: 'A autoridade de Jesus não o afasta do serviço',
    discoveryBody: 'O narrador afirma que Jesus sabia que o Pai havia colocado todas as coisas em suas mãos. A cena seguinte não é de exibição de poder: ele lava os pés dos discípulos e chama o gesto de exemplo. Identidade e serviço não aparecem como opostos.',
    discoveryClaim: 'João 13:1–17 coloca lado a lado a consciência de autoridade de Jesus e sua decisão de lavar os pés dos discípulos como exemplo.',
    applicationTitle: 'Saber não substitui fazer',
    applicationBody: 'Jesus conclui a cena dizendo que há bem-aventurança em praticar o que os discípulos agora sabem. O texto não deixa o serviço apenas como ideia bonita: ele o transforma em padrão a ser reproduzido.',
    applicationClaim: 'Jesus aplica o lava-pés aos discípulos dizendo que devem fazer uns aos outros como ele fez e relaciona felicidade à prática.',
  }),
  scriptureDraft({
    id: 'john-15-1-17-abide-and-fruit',
    bookCode: 'JHN',
    chapter: 15,
    startVerse: 1,
    endVerse: 17,
    title: 'Fruto nasce de permanência',
    lead: 'Na imagem da videira, produtividade não começa com pressão para produzir. Começa com permanecer ligado à fonte da vida.',
    discoveryTitle: 'Antes do fruto, vem o permanecer',
    discoveryBody: 'Jesus repete a linguagem de permanecer: nele, em suas palavras e em seu amor. O ramo não produz por esforço independente; sua fecundidade depende da união com a videira. O fruto aparece ligado a discipulado, amor e obediência.',
    discoveryClaim: 'João 15:1–17 apresenta permanecer em Jesus, em suas palavras e em seu amor como base para fruto, obediência e amor mútuo.',
    applicationTitle: 'O mandamento tem a forma do amor de Jesus',
    applicationBody: 'O amor pedido aos discípulos não é deixado sem referência: “assim como eu vos amei”. A comunidade cristã recebe não apenas a ordem de amar, mas um modelo marcado por entrega.',
    applicationClaim: 'No trecho, Jesus ordena que os discípulos amem uns aos outros tomando seu próprio amor por eles como padrão.',
  }),
  scriptureDraft({
    id: 'proverbs-1-1-7-beginning-knowledge',
    bookCode: 'PRO',
    chapter: 1,
    startVerse: 1,
    endVerse: 7,
    title: 'A sabedoria começa antes da resposta',
    lead: 'A abertura de Provérbios descreve para que o livro existe e encerra a introdução com uma afirmação que organiza o restante: o temor do SENHOR é o princípio do conhecimento.',
    discoveryTitle: 'O sábio continua ouvindo',
    discoveryBody: 'A introdução não apresenta sabedoria como privilégio de quem já sabe tudo. Ela quer instruir simples e jovens, mas também diz que o sábio ouvirá e crescerá em conhecimento. A postura sábia inclui permanecer ensinável.',
    discoveryClaim: 'Provérbios 1:1–7 apresenta a sabedoria como formação em entendimento, justiça e prudência, e afirma que até o sábio cresce ao ouvir.',
    applicationTitle: 'Conhecimento bíblico começa com uma relação correta com Deus',
    applicationBody: 'O versículo 7 coloca o temor do SENHOR no início do conhecimento e contrasta essa postura com desprezar sabedoria e instrução. Aprender, nesse enquadramento, envolve reverência e disposição para ser corrigido.',
    applicationClaim: 'Provérbios 1:7 identifica o temor do SENHOR como princípio do conhecimento e contrapõe isso ao desprezo pela sabedoria e instrução.',
  }),
  scriptureDraft({
    id: 'proverbs-3-1-12-trust',
    bookCode: 'PRO',
    chapter: 3,
    startVerse: 1,
    endVerse: 12,
    title: 'Confiar quando o próprio entendimento parece suficiente',
    lead: 'Provérbios 3 não pede uma fé desligada da vida. Coração, caminhos, bens e resposta à correção aparecem dentro do mesmo chamado à confiança.',
    discoveryTitle: 'Confiar é recusar a autossuficiência',
    discoveryBody: 'O texto manda confiar no SENHOR de todo o coração e não se apoiar no próprio entendimento. Em seguida, essa confiança alcança caminhos concretos: afastar-se do mal, honrar a Deus com os bens e receber sua correção.',
    discoveryClaim: 'Provérbios 3:1–12 descreve confiança no SENHOR em contraste com autossuficiência e a conecta a caminhos, bens e resposta à correção.',
    applicationTitle: 'Correção também pode caber dentro do amor',
    applicationBody: 'O trecho termina dizendo para não rejeitar a correção do SENHOR e a explica pela figura de um pai que corrige o filho a quem quer bem. Isso não transforma toda dor em correção divina; dentro do texto, porém, impede tratar toda repreensão como abandono.',
    applicationClaim: 'Provérbios 3:11–12 apresenta a correção do SENHOR no quadro de uma relação de amor semelhante à de pai e filho.',
  }),
  scriptureDraft({
    id: 'proverbs-4-20-27-guard-heart',
    bookCode: 'PRO',
    chapter: 4,
    startVerse: 20,
    endVerse: 27,
    title: 'Guardar o coração muda o caminho inteiro',
    lead: 'O coração aparece no centro de uma sequência que envolve ouvidos, olhos, boca e pés. A sabedoria bíblica alcança a pessoa inteira e o rumo que ela escolhe.',
    discoveryTitle: 'O coração não aparece isolado do comportamento',
    discoveryBody: 'Depois de mandar guardar o coração, o texto fala da boca, dos olhos e do caminho dos pés. A imagem não convida a olhar apenas para sentimentos internos; mostra que aquilo que se guarda por dentro se relaciona com fala, foco e direção.',
    discoveryClaim: 'Provérbios 4:20–27 liga guardar o coração a disciplinar fala, olhar e caminho, apresentando uma formação integrada da vida.',
    applicationTitle: 'Direção também se decide em pequenos movimentos',
    applicationBody: 'O trecho termina pedindo que o caminho seja ponderado e que os pés não se desviem. Em vez de esperar apenas grandes decisões, a sabedoria presta atenção ao rumo formado por escolhas repetidas.',
    applicationClaim: 'A passagem chama o leitor a ponderar o curso dos pés e evitar desvios para o mal, conectando sabedoria a direção prática.',
  }),
];
