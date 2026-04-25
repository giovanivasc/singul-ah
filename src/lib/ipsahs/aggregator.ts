/**
 * Agregador determinístico do IP-SAHS (multi-respondente).
 *
 * Filosofia:
 *   - Nunca inventa nada. Apenas consolida, conta e calcula.
 *   - Saída serve tanto para a UI "Visão Agregada" quanto como INPUT
 *     estruturado para o prompt de IA do Mapeamento (economia de tokens
 *     + redução de alucinação).
 */

// -----------------------------------------------------------------------------
// Tipos
// -----------------------------------------------------------------------------

/** Identifica a tabela de origem do registro — preserva rastreabilidade do fichamento. */
export type IPSahsSourceTable = 'instrument_records' | 'ip_sahs_responses';

export interface IPSahsRespondentInput {
  /** source_record_id — usado para rastreabilidade do fichamento. */
  id: string;
  sourceTable: IPSahsSourceTable;
  name: string;
  role: string;
  dateISO?: string;
  rawAnswers: Record<string, any>;
}

export interface LikertItemAgg {
  idx: number;
  label: string;
  /** valores brutos com origem (respondent.name) para exibição */
  values: { respondent: string; role: string; value: number }[];
  mean: number | null;
  stddev: number | null;
  n: number;
  /** sinaliza divergência substancial entre respondentes (σ > 1.2) */
  divergent: boolean;
}

export interface LikertBlockAgg {
  id: 'cognitivo' | 'criativo' | 'motivacao' | 'socioemocional';
  title: string;
  subtitle: string;
  items: LikertItemAgg[];
  blockMean: number | null;
  n: number;
}

export interface FrequencyEntry {
  label: string;
  count: number;
  respondents: string[];
}

export interface TextEntry {
  sourceId: string;
  sourceTable: IPSahsSourceTable;
  respondent: string;
  role: string;
  text: string;
}

export interface SuggestionEntry {
  sourceId: string;
  sourceTable: IPSahsSourceTable;
  respondent: string;
  role: string;
  component: string;
  content: string;
  methodology: string;
}

export type AlertSeverity = 'info' | 'warn' | 'high';

export interface AggregatedAlert {
  severity: AlertSeverity;
  title: string;
  details: string;
}

export interface AggregatedIPSahs {
  respondents: { id: string; name: string; role: string; dateISO?: string }[];
  nRespondents: number;

  likertBlocks: LikertBlockAgg[];

  interactionSocial: FrequencyEntry[];
  socialInteractionExamples: TextEntry[];

  desafiosReacao: FrequencyEntry[];
  desafiosReacaoExamples: TextEntry[];

  interests: FrequencyEntry[];
  otherInterests: TextEntry[];

  potentialities: TextEntry[];
  difficulties: TextEntry[];
  demotivation: TextEntry[];

  needsPedagogical: TextEntry[];
  needsBehavioral: TextEntry[];
  needsEmotional: TextEntry[];

  strategyAdopted: FrequencyEntry[]; // "Sim"/"Não"
  strategyExperience: TextEntry[];

  suggestions: SuggestionEntry[];

  additionalNotes: TextEntry[];
  otherBehaviors: TextEntry[];

  alerts: AggregatedAlert[];
}

// -----------------------------------------------------------------------------
// Definição dos 20 itens Likert e blocos SRBCSS-R
// -----------------------------------------------------------------------------

const LIKERT_ITEMS: Record<number, string> = {
  1:  'Tem facilidade para aprender',
  2:  'Demonstra vocabulário avançado para a idade/série',
  3:  'Tem facilidade em fazer conexões entre disciplinas',
  4:  'Mantém foco prolongado em temas específicos',
  5:  'Mostra grande curiosidade e questiona frequentemente',
  6:  'Resolve problemas de forma criativa, fora do convencional',
  7:  'Propõe ideias ou soluções inusitadas em atividades',
  8:  'Gosta de reinventar tarefas ou desafios propostos',
  9:  'Expressa-se através de humor, sarcasmo, analogias ou metáforas',
  10: 'Cria histórias, desenhos ou jogos únicos',
  11: 'Mostra paixão por tópicos específicos',
  12: 'Busca ativamente materiais ou atividades além do currículo',
  13: 'Fica frustrado com tarefas repetitivas ou pouco desafiadoras',
  14: 'Se entedia facilmente com conteúdos apresentados em sala',
  15: 'Se distrai facilmente quando não está desafiado',
  16: 'Sensível a injustiças ou questões éticas (ex.: defende colegas)',
  17: 'Prefere trabalhar sozinho ou com alunos de mesma habilidade',
  18: 'Questiona regras ou autoridades quando não vê lógica nelas',
  19: 'Coopera bem em grupos',
  20: 'Tem grande atenção aos detalhes'
};

const BLOCKS: Array<{
  id: LikertBlockAgg['id'];
  title: string;
  subtitle: string;
  items: number[];
}> = [
  { id: 'cognitivo',      title: 'Habilidades Cognitivas e Intelectuais',     subtitle: 'Aquisição, retenção e processamento de informações', items: [1, 2, 3, 5, 20] },
  { id: 'criativo',       title: 'Pensamento Criativo e Produtivo',           subtitle: 'Originalidade, flexibilidade e soluções divergentes', items: [6, 7, 8, 9, 10] },
  { id: 'motivacao',      title: 'Motivação e Envolvimento com a Tarefa',     subtitle: 'Persistência e direcionamento intrínseco', items: [4, 11, 12] },
  { id: 'socioemocional', title: 'Aspectos Socioemocionais e Comportamentais', subtitle: 'Ajustamento, afetividade e relações interpessoais', items: [13, 14, 15, 16, 17, 18, 19] }
];

// Divergência considerada relevante pedagogicamente
const DIVERGENCE_SIGMA_THRESHOLD = 1.2;

// -----------------------------------------------------------------------------
// Helpers numéricos
// -----------------------------------------------------------------------------

function mean(arr: number[]): number | null {
  if (!arr.length) return null;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function stddev(arr: number[]): number | null {
  if (arr.length < 2) return null;
  const m = mean(arr)!;
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function extractLikert(rawAnswers: Record<string, any>, idx: number): number | null {
  const profile = rawAnswers?.behavioral_profile;
  let raw: any = null;
  if (Array.isArray(profile)) raw = profile[idx - 1];
  else if (profile && typeof profile === 'object') raw = profile[idx] ?? profile[String(idx)];
  const v = Number(raw);
  return Number.isFinite(v) && v >= 1 && v <= 5 ? v : null;
}

function pushFreq(map: Map<string, FrequencyEntry>, label: string, respondent: string) {
  const key = label.trim();
  if (!key) return;
  const existing = map.get(key);
  if (existing) {
    existing.count += 1;
    if (!existing.respondents.includes(respondent)) existing.respondents.push(respondent);
  } else {
    map.set(key, { label: key, count: 1, respondents: [respondent] });
  }
}

function hasText(v: any): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

// -----------------------------------------------------------------------------
// Função principal
// -----------------------------------------------------------------------------

export function aggregateIPSahs(inputs: IPSahsRespondentInput[]): AggregatedIPSahs {
  const respondents = inputs.map(r => ({ id: r.id, name: r.name, role: r.role, dateISO: r.dateISO }));

  // --- Likert ---
  const likertBlocks: LikertBlockAgg[] = BLOCKS.map(block => {
    const items: LikertItemAgg[] = block.items.map(itemIdx => {
      const values = inputs
        .map(r => {
          const v = extractLikert(r.rawAnswers, itemIdx);
          return v === null ? null : { respondent: r.name || 'Sem identificação', role: r.role || '', value: v };
        })
        .filter((x): x is { respondent: string; role: string; value: number } => x !== null);

      const nums = values.map(x => x.value);
      const m = mean(nums);
      const sd = stddev(nums);
      return {
        idx: itemIdx,
        label: LIKERT_ITEMS[itemIdx],
        values,
        mean: m,
        stddev: sd,
        n: values.length,
        divergent: sd !== null && sd > DIVERGENCE_SIGMA_THRESHOLD
      };
    });

    const itemMeans = items.map(x => x.mean).filter((x): x is number => x !== null);
    return {
      id: block.id,
      title: block.title,
      subtitle: block.subtitle,
      items,
      blockMean: itemMeans.length ? mean(itemMeans) : null,
      n: items.reduce((max, it) => Math.max(max, it.n), 0)
    };
  });

  // --- Categóricos: interação social, reação a desafios, estratégia adotada ---
  const interactionSocialMap = new Map<string, FrequencyEntry>();
  const desafiosReacaoMap = new Map<string, FrequencyEntry>();
  const strategyMap = new Map<string, FrequencyEntry>();
  const interestsMap = new Map<string, FrequencyEntry>();

  // Acumuladores de texto
  const socialExamples: TextEntry[] = [];
  const desafiosExamples: TextEntry[] = [];
  const otherInterests: TextEntry[] = [];
  const potentialities: TextEntry[] = [];
  const difficulties: TextEntry[] = [];
  const demotivation: TextEntry[] = [];
  const needsPed: TextEntry[] = [];
  const needsBeh: TextEntry[] = [];
  const needsEmo: TextEntry[] = [];
  const strategyExperience: TextEntry[] = [];
  const suggestionsAcc: SuggestionEntry[] = [];
  const additionalNotes: TextEntry[] = [];
  const otherBehaviors: TextEntry[] = [];

  for (const r of inputs) {
    const a = r.rawAnswers || {};
    const who = r.name || 'Sem identificação';
    const role = r.role || '';

    const push = (arr: TextEntry[], text: any) => {
      if (hasText(text)) arr.push({ sourceId: r.id, sourceTable: r.sourceTable, respondent: who, role, text: text.trim() });
    };

    // categóricos
    if (hasText(a.social_interaction_option)) pushFreq(interactionSocialMap, a.social_interaction_option, who);
    if (hasText(a.desafios_reacao_option))    pushFreq(desafiosReacaoMap, a.desafios_reacao_option, who);

    if (typeof a.adopted_strategy === 'boolean') {
      pushFreq(strategyMap, a.adopted_strategy ? 'Sim' : 'Não', who);
    }

    // interesses
    if (Array.isArray(a.areas_of_interest)) {
      a.areas_of_interest.forEach((tag: any) => { if (hasText(tag)) pushFreq(interestsMap, tag, who); });
    }

    push(socialExamples,      a.social_interaction_example);
    push(desafiosExamples,    a.desafios_reacao_example);
    push(otherInterests,      a.other_interests);
    push(potentialities,      a.potentialities_response);
    push(difficulties,        a.pedagogical_difficulties_response);
    push(demotivation,        a.demotivation_signs_response);
    push(needsPed,            a.needs_pedagogical);
    push(needsBeh,            a.needs_behavioral);
    push(needsEmo,            a.needs_emotional);
    push(strategyExperience,  a.strategy_experience_response);
    push(additionalNotes,     a.additional_notes);
    push(otherBehaviors,      a.other_behaviors);

    if (Array.isArray(a.suggestions)) {
      a.suggestions.forEach((s: any) => {
        if (!s) return;
        const comp = String(s.component || '').trim();
        const cont = String(s.content || '').trim();
        const meth = String(s.methodology || '').trim();
        if (!comp && !cont && !meth) return;
        suggestionsAcc.push({ sourceId: r.id, sourceTable: r.sourceTable, respondent: who, role, component: comp, content: cont, methodology: meth });
      });
    }
  }

  const toSortedFreq = (m: Map<string, FrequencyEntry>) =>
    Array.from(m.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  // --- Alertas determinísticos (baseados em literatura SRBCSS-R) ---
  const alerts: AggregatedAlert[] = [];
  const findBlock = (id: LikertBlockAgg['id']) => likertBlocks.find(b => b.id === id)!;
  const findItem = (idx: number) => likertBlocks.flatMap(b => b.items).find(it => it.idx === idx)!;

  if (inputs.length === 1) {
    alerts.push({
      severity: 'info',
      title: 'Apenas 1 respondente',
      details: 'Os dados ainda não cruzam fontes diferentes. Consolide ao menos 2 perspectivas (ex.: professor regente + AEE) para aumentar a robustez do mapeamento.'
    });
  }

  const cognitivo = findBlock('cognitivo');
  const criativo = findBlock('criativo');
  const motivacao = findBlock('motivacao');
  const socio = findBlock('socioemocional');

  if (cognitivo.blockMean !== null && cognitivo.blockMean >= 4.5) {
    alerts.push({
      severity: 'high',
      title: 'Perfil cognitivo destacado',
      details: `Média do bloco cognitivo = ${cognitivo.blockMean.toFixed(2)}. Indica desempenho intelectual consistentemente acima do esperado para a faixa etária.`
    });
  }
  if (criativo.blockMean !== null && criativo.blockMean >= 4) {
    alerts.push({
      severity: 'high',
      title: 'Perfil criativo elevado',
      details: `Média do bloco criativo = ${criativo.blockMean.toFixed(2)}. Sugere originalidade, humor/analogia e capacidade de gerar soluções divergentes.`
    });
  }
  if (motivacao.blockMean !== null && motivacao.blockMean >= 4.5) {
    alerts.push({
      severity: 'high',
      title: 'Alta motivação intrínseca',
      details: `Média do bloco motivação = ${motivacao.blockMean.toFixed(2)}. Indica envolvimento intenso com tópicos de interesse e autonomia de aprendizagem.`
    });
  }

  // Desmotivação em sala (itens 13 e 14)
  const i13 = findItem(13);
  const i14 = findItem(14);
  if ((i13.mean !== null && i13.mean >= 4) || (i14.mean !== null && i14.mean >= 4)) {
    alerts.push({
      severity: 'warn',
      title: 'Sinais de desmotivação frente ao currículo regular',
      details: `Itens 13 (frustração com repetição, média ${i13.mean?.toFixed(2) ?? '—'}) e 14 (tédio em sala, média ${i14.mean?.toFixed(2) ?? '—'}) elevados. Sinaliza necessidade de desafios mais complexos.`
    });
  }

  // Distração correlacionada a falta de desafio (item 15 alto + 14 alto)
  const i15 = findItem(15);
  if (i15.mean !== null && i14.mean !== null && i15.mean >= 4 && i14.mean >= 4) {
    alerts.push({
      severity: 'warn',
      title: 'Distração ligada à ausência de desafio',
      details: 'Itens 14 (tédio) e 15 (distração) altos simultaneamente sugerem que a dispersão observada é efeito — e não causa — da ausência de desafio cognitivo adequado.'
    });
  }

  // Sensibilidade ética
  const i16 = findItem(16);
  if (i16.mean !== null && i16.mean >= 4) {
    alerts.push({
      severity: 'info',
      title: 'Sensibilidade ética acentuada',
      details: `Item 16 (senso de justiça) com média ${i16.mean.toFixed(2)}. Observar impacto socioemocional em situações de conflito em sala.`
    });
  }

  // Divergência relevante entre respondentes
  const divergentItems = likertBlocks.flatMap(b => b.items).filter(it => it.divergent);
  if (divergentItems.length > 0) {
    alerts.push({
      severity: 'warn',
      title: `Divergência entre respondentes em ${divergentItems.length} item${divergentItems.length > 1 ? 'ns' : ''}`,
      details: `Desvio-padrão > ${DIVERGENCE_SIGMA_THRESHOLD} em: ${divergentItems.map(i => `#${i.idx} (σ=${i.stddev?.toFixed(2)})`).join(', ')}. Possível especificidade ambiental — investigar contexto (sala regular vs AEE vs casa).`
    });
  }

  return {
    respondents,
    nRespondents: respondents.length,
    likertBlocks,
    interactionSocial: toSortedFreq(interactionSocialMap),
    socialInteractionExamples: socialExamples,
    desafiosReacao: toSortedFreq(desafiosReacaoMap),
    desafiosReacaoExamples: desafiosExamples,
    interests: toSortedFreq(interestsMap),
    otherInterests,
    potentialities,
    difficulties,
    demotivation,
    needsPedagogical: needsPed,
    needsBehavioral: needsBeh,
    needsEmotional: needsEmo,
    strategyAdopted: toSortedFreq(strategyMap),
    strategyExperience,
    suggestions: suggestionsAcc,
    additionalNotes,
    otherBehaviors,
    alerts
  };
}
