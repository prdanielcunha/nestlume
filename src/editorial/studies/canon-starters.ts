import { EditorialStudy } from '../schema';

type Seed = {
  id: string;
  bookCode: string;
  bookName: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  title: string;
  lead: string;
  observations: [string, string, string];
  claims: [string, string, string];
};

function study(seed: Seed): EditorialStudy {
  const reference = `${seed.bookName} ${seed.chapter}:${seed.startVerse}–${seed.endVerse}`;
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
      edition: 'release 2018.2.0',
      locator: reference,
      license: 'CC BY 3.0 Brasil (corpus integrado)',
    }],
    claims: seed.claims.map((text, index) => ({
      id: `${seed.id}-c${index + 1}`,
      layer: index === 0 ? 'context' : index === 1 ? 'interpretation' : 'application',
      text,
      sourceIds: [sourceId],
      certainty: 'high',
    })),
    sections: [
      {
        id: 'observe',
        eyebrow: 'OBSERVE O MOVIMENTO',
        title: 'Comece pelo que o texto coloca diante dos olhos',
        body: seed.observations[0],
        layer: 'context',
        claimIds: [`${seed.id}-c1`],
      },
      {
        id: 'center',
        eyebrow: 'DESCUBERTA CENTRAL',
        title: 'A afirmação que organiza a passagem',
        body: seed.observations[1],
        layer: 'interpretation',
        claimIds: [`${seed.id}-c2`],
      },
      {
        id: 'life',
        eyebrow: 'PARA LEVAR À VIDA',
        title: 'A resposta nasce do próprio texto',
        body: seed.observations[2],
        layer: 'application',
        claimIds: [`${seed.id}-c3`],
      },
    ],
    review: { status: 'draft', reviewer: null, reviewedAt: null },
  };
}

export const canonStarterStudies: EditorialStudy[] = [
  study({
    id: 'genesis-1-1-5-creation-light',
    bookCode: 'GEN', bookName: 'Gênesis', chapter: 1, startVerse: 1, endVerse: 5,
    title: 'Quando Deus fala, a escuridão não define o fim',
    lead: 'A primeira página da Bíblia apresenta Deus antes de apresentar qualquer personagem humano: Deus cria, fala, separa e chama a luz de boa.',
    observations: [
      'O trecho começa com Deus criando céus e terra e descreve a terra sem forma, vazia e coberta de trevas. A primeira ação verbal registrada é Deus dizer que haja luz.',
      'A luz aparece como resultado da palavra de Deus; em seguida Deus distingue luz e trevas e dá nome ao dia e à noite. A passagem organiza o caos por meio da ação e da palavra divinas.',
      'Antes de transformar a criação em metáfora para problemas pessoais, o texto convida a reconhecer quem age no princípio. A aplicação começa em olhar para Deus como Criador e receber sua palavra com reverência.',
    ],
    claims: [
      'Gênesis 1:1–5 apresenta Deus como Criador e coloca sua palavra no início do aparecimento da luz.',
      'No trecho, Deus distingue e nomeia luz e trevas depois de declarar a luz boa.',
      'Uma aplicação fiel começa reconhecendo o protagonismo de Deus no texto, sem transformar automaticamente cada elemento da criação em símbolo pessoal.',
    ],
  }),
  study({
    id: 'psalm-23-1-6-shepherd',
    bookCode: 'PSA', bookName: 'Salmos', chapter: 23, startVerse: 1, endVerse: 6,
    title: 'O Pastor que conduz também atravessa o vale',
    lead: 'O salmo não promete uma vida sem vale. Ele descreve segurança porque o Pastor está presente tanto nos lugares de descanso quanto no caminho escuro.',
    observations: [
      'O poema alterna imagens de provisão, direção, vale, proteção, mesa e casa. O cenário muda, mas a presença do SENHOR permanece o eixo.',
      'No vale da sombra da morte, a linguagem muda de falar “dele” para falar “contigo”: “tu estás comigo”. A confiança não depende da ausência de perigo, mas da companhia do Pastor.',
      'O salmo oferece linguagem para confiar sem negar o caminho difícil. Sua esperança termina não em controle das circunstâncias, mas em bondade, misericórdia e permanência na casa do SENHOR.',
    ],
    claims: [
      'Salmos 23 reúne provisão, direção, perigo, proteção e comunhão sob a imagem do SENHOR como pastor.',
      'A razão expressa para não temer no vale é a presença do SENHOR: “tu estás comigo”.',
      'O fechamento do salmo orienta a esperança para a bondade e misericórdia que acompanham o salmista e para habitar na casa do SENHOR.',
    ],
  }),
  study({
    id: 'isaiah-53-3-6-suffering-servant',
    bookCode: 'ISA', bookName: 'Isaías', chapter: 53, startVerse: 3, endVerse: 6,
    title: 'Ferido por aquilo que não era dele',
    lead: 'O trecho concentra desprezo, sofrimento, culpa e paz numa figura que sofre em relação aos pecados de outros.',
    observations: [
      'A passagem descreve o servo como desprezado e familiarizado com dores, enquanto o grupo narrador reconhece que havia interpretado seu sofrimento de modo errado.',
      'Os versos 4–6 repetem a transferência: nossas enfermidades, nossas dores, nossas transgressões, nossas iniquidades; o castigo ligado à nossa paz recai sobre ele.',
      'O texto impede uma leitura distante: o “nós” é parte do argumento. A resposta começa em abandonar a postura de mero espectador e reconhecer a dimensão pessoal da culpa e da paz descritas ali.',
    ],
    claims: [
      'Isaías 53:3–6 descreve uma figura desprezada e sofredora cuja dor é interpretada em relação às faltas de outros.',
      'O trecho repete linguagem de substituição entre o sofrimento do servo e as transgressões/iniquidades do grupo narrador.',
      'A aplicação textual inclui o leitor na lógica do “nós”, em vez de tratar o sofrimento do servo apenas como observação externa.',
    ],
  }),
  study({
    id: 'matthew-5-1-12-beatitudes',
    bookCode: 'MAT', bookName: 'Mateus', chapter: 5, startVerse: 1, endVerse: 12,
    title: 'Bem-aventurados: o Reino visto por outro ângulo',
    lead: 'Jesus começa o ensino público chamando de bem-aventuradas pessoas que o mundo nem sempre chamaria de vencedoras.',
    observations: [
      'A sequência menciona pobres em espírito, os que choram, mansos, famintos por justiça, misericordiosos, limpos de coração, pacificadores e perseguidos.',
      'As promessas apontam repetidamente para Deus e seu Reino: consolação, misericórdia, ver Deus, ser chamado filho de Deus e possuir o Reino dos céus.',
      'A passagem não funciona como oito técnicas de sucesso. Ela chama o discípulo a avaliar a vida pelo Reino e a permanecer fiel mesmo quando essa fidelidade inclui sofrimento e perseguição.',
    ],
    claims: [
      'Mateus 5:1–12 chama de bem-aventurados grupos marcados por dependência, sofrimento, misericórdia, pureza, paz e fidelidade sob perseguição.',
      'As promessas das bem-aventuranças são centradas na ação, presença e Reino de Deus.',
      'A aplicação coerente não é usar as bem-aventuranças como fórmula de sucesso, mas receber seus valores como retrato de vida orientada pelo Reino.',
    ],
  }),
  study({
    id: 'luke-15-11-32-two-sons',
    bookCode: 'LUK', bookName: 'Lucas', chapter: 15, startVerse: 11, endVerse: 32,
    title: 'Dois filhos perdidos de maneiras diferentes',
    lead: 'A parábola termina com um filho dentro da festa e outro do lado de fora discutindo com o pai. O coração do pai fica no centro dos dois encontros.',
    observations: [
      'O filho mais novo rompe, desperdiça e retorna planejando falar como servo. O pai corre, recebe, veste, celebra e chama o retorno de vida depois da morte e reencontro depois de perda.',
      'O filho mais velho nunca saiu fisicamente, mas sua fala mostra distância relacional: ele contabiliza anos de serviço e se recusa a entrar. O pai também sai ao encontro dele.',
      'A parábola convida a deixar tanto a rebelião explícita quanto a justiça própria entrar na luz do amor do pai. O final aberto força o ouvinte a decidir se entrará na alegria do reencontro.',
    ],
    claims: [
      'Lucas 15:11–32 mostra o pai saindo ao encontro tanto do filho mais novo que retorna quanto do filho mais velho que se recusa a entrar.',
      'O filho mais novo é recebido e celebrado, enquanto o filho mais velho revela ressentimento e linguagem de mérito apesar de permanecer em casa.',
      'O final aberto mantém diante do leitor a resposta do filho mais velho ao convite do pai para participar da alegria pelo irmão reencontrado.',
    ],
  }),
  study({
    id: 'romans-8-1-11-no-condemnation',
    bookCode: 'ROM', bookName: 'Romanos', chapter: 8, startVerse: 1, endVerse: 11,
    title: 'Nenhuma condenação e uma nova direção de vida',
    lead: 'Romanos 8 abre não com um incentivo vago, mas com uma declaração: nenhuma condenação há para os que estão em Cristo Jesus.',
    observations: [
      'O trecho contrasta carne e Espírito e descreve a ação de Deus em Cristo onde a lei era incapaz por causa da fraqueza humana.',
      'A ausência de condenação não aparece como indiferença moral. Paulo imediatamente fala de uma nova orientação segundo o Espírito, com mente e vida direcionadas por ele.',
      'A passagem permite abandonar tanto o desespero da condenação quanto a ideia de que graça significa ausência de transformação. Em Cristo, a declaração e a nova direção caminham juntas no argumento.',
    ],
    claims: [
      'Romanos 8:1–11 começa declarando ausência de condenação para os que estão em Cristo Jesus e atribui libertação à ação de Deus.',
      'O trecho contrasta a orientação da carne com a orientação do Espírito e associa esta última a vida e paz.',
      'Uma aplicação coerente mantém juntas a segurança expressa no versículo 1 e a vida orientada pelo Espírito desenvolvida nos versículos seguintes.',
    ],
  }),
  study({
    id: 'first-corinthians-13-1-13-love',
    bookCode: '1CO', bookName: '1 Coríntios', chapter: 13, startVerse: 1, endVerse: 13,
    title: 'Quando dons impressionantes não bastam',
    lead: 'Paulo coloca amor no centro justamente depois de falar sobre dons. A passagem não diminui habilidade; ela pergunta o que permanece quando habilidade existe sem amor.',
    observations: [
      'O capítulo começa com cenários extremos: línguas, profecia, conhecimento, fé e entrega de bens. Sem amor, Paulo diz que tudo isso pode resultar em nada para a pessoa.',
      'A descrição do amor é feita por verbos e disposições concretas: paciência, bondade, ausência de inveja, orgulho e busca egoísta; alegria com a verdade; perseverança.',
      'A aplicação não é apenas sentir mais. O texto oferece critérios observáveis para avaliar como dons, conhecimento e ações são exercidos em relação às pessoas.',
    ],
    claims: [
      '1 Coríntios 13:1–13 afirma que manifestações e sacrifícios impressionantes podem ser vazios sem amor.',
      'O amor é descrito por atitudes e comportamentos concretos, não apenas por emoção.',
      'A passagem permite avaliar o exercício de dons e conhecimento pelo modo como tratam as pessoas e se alinham às características do amor descritas no texto.',
    ],
  }),
  study({
    id: 'ephesians-2-1-10-grace',
    bookCode: 'EPH', bookName: 'Efésios', chapter: 2, startVerse: 1, endVerse: 10,
    title: 'Da morte para a vida, pela graça',
    lead: 'O movimento do texto é radical: mortos em delitos, mas Deus; salvos pela graça; criados em Cristo para boas obras.',
    observations: [
      'Paulo descreve primeiro a antiga condição em linguagem de morte e sujeição. A virada ocorre com “mas Deus”, seguida por misericórdia, amor, vivificação e posição com Cristo.',
      'Os versos 8–9 retiram da salvação a base de vanglória humana: ela é pela graça, mediante a fé, dom de Deus, não resultado de obras.',
      'O versículo 10 impede concluir que boas obras são irrelevantes. Elas não aparecem como causa da salvação, mas como caminho preparado para aqueles que são feitura de Deus em Cristo.',
    ],
    claims: [
      'Efésios 2:1–10 contrasta uma condição de morte em delitos com a ação misericordiosa de Deus que vivifica com Cristo.',
      'O trecho apresenta a salvação como graça recebida mediante a fé e não como motivo para vanglória por obras.',
      'Boas obras aparecem no versículo 10 como finalidade/caminho da nova criação em Cristo, não como base de mérito apresentada nos versículos 8–9.',
    ],
  }),
  study({
    id: 'james-1-19-27-hearing-doing',
    bookCode: 'JAS', bookName: 'Tiago', chapter: 1, startVerse: 19, endVerse: 27,
    title: 'Ouvir a Palavra até ela chegar às mãos',
    lead: 'Tiago aproxima ouvido, boca, ira, espelho, prática e cuidado dos vulneráveis. Espiritualidade não fica confinada ao momento de escutar.',
    observations: [
      'O trecho começa pedindo prontidão para ouvir e lentidão para falar e se irar. Depois muda para a imagem da Palavra implantada e do espelho.',
      'O contraste principal está entre apenas ouvir e praticar. O ouvinte que não pratica é comparado a alguém que olha o próprio rosto e logo esquece o que viu.',
      'A religião descrita como pura inclui domínio da fala, cuidado de órfãos e viúvas e preservação diante da corrupção do mundo. A aplicação é deliberadamente concreta.',
    ],
    claims: [
      'Tiago 1:19–27 liga ouvir, falar e ira ao modo como a Palavra é recebida.',
      'O texto contrasta ouvir sem praticar com olhar no espelho e esquecer, e chama bem-aventurado o praticante perseverante.',
      'O fechamento da passagem inclui controle da língua, cuidado de órfãos e viúvas e integridade pessoal como expressões concretas de religião.',
    ],
  }),
  study({
    id: 'revelation-21-1-7-new-creation',
    bookCode: 'REV', bookName: 'Apocalipse', chapter: 21, startVerse: 1, endVerse: 7,
    title: 'A esperança termina com Deus habitando com seu povo',
    lead: 'A visão final não é de pessoas escapando para uma abstração, mas de nova criação, cidade santa e a habitação de Deus com a humanidade.',
    observations: [
      'João vê novo céu e nova terra e a nova Jerusalém descendo. Em seguida uma voz anuncia a morada de Deus com os seres humanos.',
      'O texto descreve o fim de lágrimas, morte, luto, clamor e dor e coloca tudo sob a declaração daquele que está no trono: “eis que faço novas todas as coisas”.',
      'A esperança cristã apresentada aqui permite lamentar o que ainda dói sem tratá-lo como definitivo. O futuro narrado pertence ao Deus que promete fazer novas todas as coisas.',
    ],
    claims: [
      'Apocalipse 21:1–7 reúne nova criação, nova Jerusalém e a habitação de Deus com seu povo.',
      'A visão anuncia o fim de morte, luto, clamor e dor e atribui a renovação àquele que está sentado no trono.',
      'A aplicação pode sustentar esperança no sofrimento presente sem negar a dor, porque a passagem localiza sua superação na ação futura de Deus.',
    ],
  }),
];
