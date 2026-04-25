import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import {
  Brain, Sparkles, Database, Loader2, ArrowRight, Activity,
  Users, ShieldCheck, Plus, Highlighter, X, CheckCircle2, Info,
  Maximize2, Trash2, Archive, RefreshCcw, ChevronLeft, Check,
  ClipboardList, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from '../components/Navigation';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import IPSahsReader from '../components/IPSahsReader';
import IPSahsAggregatedView from '../components/IPSahsAggregatedView';
import { aggregateIPSahs } from '../lib/ipsahs/aggregator';
import IABanner from '../components/IABanner';

export const SYSTEM_PROMPT_ESTUDO_CASO = `Você é um especialista em Educação Especial, Altas Habilidades/Superdotação (AH/SD) e Legislação Brasileira de Inclusão (LBI – Lei 13.146/2015) e Decreto 12.686/2025. Sua tarefa é analisar TODOS os relatos brutos disponíveis (IF-SAHS, IP-SAHS individuais e consolidação, Entrevista e análise automática N-ILS) juntamente com os fichamentos prévios feitos pelo professor e gerar uma síntese rigorosa do Estudo de Caso do estudante.

REGRAS VITAIS:
1. Baseie-se SOMENTE nos dados fornecidos. Não invente informações que não estejam explicitamente nos relatos ou fichamentos.
2. Não force convergência quando houver divergência legítima entre ambientes (ex.: sala regular vs. AEE, casa vs. escola). Trate isso como "especificidade ambiental" e registre o contexto entre parênteses no item.
3. Os fichamentos do professor são pistas ALTAMENTE RELEVANTES: valide-os contra os relatos e incorpore os que se confirmarem. Mantenha a essência do que o professor marcou.
4. Classifique barreiras ESTRITAMENTE segundo a LBI (use um desses rótulos no início do item quando aplicável): "Barreira Urbanística:", "Barreira Arquitetônica:", "Barreira nos Transportes:", "Barreira de Comunicação/Informação:", "Barreira Atitudinal:", "Barreira Tecnológica:". Demandas pedagógicas que não sejam barreiras LBI devem iniciar com "Demanda Pedagógica:".
5. Estratégias devem ser CONCRETAS, acionáveis pelo professor e alinhadas às barreiras mapeadas.
6. Use frases curtas, objetivas e em português. Evite jargão desnecessário.
7. Retorne APENAS um objeto JSON válido, SEM markdown, sem cercas de código, sem comentários. Estrutura obrigatória:

{
  "currentContext": [
    { "text": "Item curto e objetivo.", "category": "acadêmico" }
  ],
  "learningStyle": [
    { "text": "Item curto e objetivo." }
  ],
  "potentialsInterests": [
    { "text": "Item curto e objetivo." }
  ],
  "demandsBarriers": [
    { "text": "Barreira Atitudinal: rigidez metodológica de alguns docentes." }
  ],
  "accessibilityStrategies": [
    { "text": "Fragmentação de tarefas com checklist visual.", "category": "instrucional" }
  ]
}

Valores permitidos para "category" em currentContext: acadêmico, cognitivo, linguístico, social, emocional, psicológico, físico.
Valores permitidos para "category" em accessibilityStrategies: instrucional, ambiental, avaliação.
learningStyle, potentialsInterests e demandsBarriers NÃO devem conter o campo "category".`;

function buildMappingPrompt(params: {
  studentName: string;
  sources: DataSource[];
  snippets: HighlightSnippet[];
}): string {
  const { studentName, sources, snippets } = params;

  const sectionFor = (kind: InstrumentKind): string => {
    const src = sources.find(s => s.id === kind);
    if (!src || src.versions.length === 0) return `### ${kind.toUpperCase()}\n(Sem preenchimentos registrados)\n`;
    const blocks = src.versions.map((v, idx) => {
      const header = v.isConsolidated
        ? `Versão Consolidada IA (${new Date(v.dateISO).toLocaleDateString('pt-BR')})`
        : `Versão ${idx + 1} — ${v.label}`;
      return `--- ${header} ---\n${v.content || '(sem conteúdo)'}`;
    }).join('\n\n');
    return `### ${src.title}\n${blocks}\n`;
  };

  const snippetBlock = snippets.length === 0
    ? '(Nenhum fichamento registrado pelo professor.)'
    : snippets
        .filter(s => (s.status || 'ativo') === 'ativo')
        .map(s => `- [${s.category.toUpperCase()}] "${s.text}" (fonte: ${s.instrument_source})`)
        .join('\n') || '(Nenhum fichamento ativo.)';

  return `${SYSTEM_PROMPT_ESTUDO_CASO}

=====================================================
ESTUDANTE: ${studentName}
=====================================================

DADOS DOS INSTRUMENTOS (relatos brutos e análises automáticas):

${sectionFor('if-sahs')}
${sectionFor('ip-sahs')}
${sectionFor('entrevista')}
${sectionFor('n-ils')}

=====================================================
FICHAMENTOS PRÉVIOS DO PROFESSOR (pistas prioritárias):
=====================================================
${snippetBlock}

=====================================================
TAREFA:
Gere AGORA o objeto JSON conforme a estrutura obrigatória descrita acima.
Nada além do JSON na sua resposta.`;
}

function safeParseAIJson<T = any>(raw: string): T {
  if (!raw) throw new Error('IA retornou vazio.');
  let cleaned = raw.trim();
  // Remove cercas de código ```json ... ```
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) cleaned = fenceMatch[1].trim();
  // Recorta do primeiro { até o último }
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) cleaned = cleaned.slice(first, last + 1);
  return JSON.parse(cleaned) as T;
}

function normalizeMappingResponse(obj: any): CaseStudySynthesis {
  const toTopics = (arr: any, allowedCats?: string[]): TopicItem[] => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((it: any) => {
        const text = typeof it === 'string' ? it : (it?.text ?? '');
        const cat = typeof it === 'object' && it?.category ? String(it.category).toLowerCase() : undefined;
        if (!text || !String(text).trim()) return null;
        const category = allowedCats
          ? (cat && allowedCats.includes(cat) ? cat : allowedCats[0])
          : undefined;
        const topic: TopicItem = { id: crypto.randomUUID(), text: String(text).trim(), selected: true, category };
        return topic;
      })
      .filter((x): x is TopicItem => x !== null);
  };

  const contextCats = CONTEXT_CATEGORIES.map(c => c.id);
  const accessCats = ACCESSIBILITY_CATEGORIES.map(c => c.id);

  return {
    currentContext:        toTopics(obj?.currentContext, contextCats),
    learningStyle:         toTopics(obj?.learningStyle),
    potentialsInterests:   toTopics(obj?.potentialsInterests),
    demandsBarriers:       toTopics(obj?.demandsBarriers),
    accessibilityStrategies: toTopics(obj?.accessibilityStrategies, accessCats)
  };
}

import { AxisItem, HighlightSnippet } from '../types/database';

type InstrumentKind = 'if-sahs' | 'ip-sahs' | 'entrevista' | 'n-ils';

type InstrumentVersion = {
  id: string;                                           // UUID do registro de origem
  sourceTable: 'instrument_records' | 'ip_sahs_responses' | 'n_ils_responses' | 'ip_sahs_consolidations';
  label: string;                                        // Descrição da versão (respondente + data)
  dateISO: string;                                      // Para ordenação
  content: string;                                      // Texto achatado usado no fichamento
  // Campos adicionais usados para a consolidação IA do IP-SAHS
  rawAnswers?: Record<string, any>;
  respondentName?: string;
  respondentRole?: string;
  isConsolidated?: boolean;
};

type DataSource = {
  id: InstrumentKind;
  title: string;
  subtitle: string;
  icon: any;
  colorClass: string;
  bgColorClass: string;
  versions: InstrumentVersion[];
};

// ---------- Helpers ---------------------------------------------------------
// Campos técnicos que não devem aparecer ao fichar respostas.
const META_KEYS = new Set([
  'id', 'student_id', 'teacher_id', 'instrument_id',
  'created_at', 'updated_at', 'completed_at', 'deleted_at',
  'status', 'version', 'respondent_name', 'respondent_role',
  'role', 'pendingQuestions', 'respondentRelation'
]);

// Mapa de rótulos amigáveis para chaves conhecidas.
const FIELD_LABELS: Record<string, string> = {
  discipline: 'Disciplina',
  behavioral_profile: 'Perfil Comportamental (Frequência 1–5)',
  other_behaviors: 'Outros comportamentos observados',
  social_interaction_option: 'Interação Social (opção escolhida)',
  social_interaction_example: 'Exemplos de Interação Social',
  desafios_reacao_option: 'Reação a Desafios (opção escolhida)',
  desafios_reacao_example: 'Exemplos de Reação a Desafios',
  areas_of_interest: 'Áreas de Interesse',
  other_interests: 'Outros Interesses',
  potentialities_response: 'Potencialidades e facilidades',
  pedagogical_difficulties_response: 'Maiores dificuldades pedagógicas',
  demotivation_signs_response: 'Sinais de desmotivação',
  needs_pedagogical: 'Necessidades Pedagógicas',
  needs_behavioral: 'Necessidades Comportamentais',
  needs_emotional: 'Necessidades Emocionais',
  adopted_strategy: 'Já adotou estratégia pedagógica?',
  strategy_experience_response: 'Estratégias adotadas e eficácia',
  suggestions: 'Sugestões para o Plano de Suplementação',
  additional_notes: 'Observações / Informações Adicionais'
};

const humanizeKey = (key: string): string =>
  FIELD_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

function formatValue(val: any): string {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return '—';
    if (typeof val[0] === 'object' && val[0] !== null) {
      return val.map((item, i) => {
        const inner = Object.entries(item)
          .filter(([k, v]) => k !== 'id' && v !== null && v !== '')
          .map(([k, v]) => `${humanizeKey(k)}: ${formatValue(v)}`)
          .join(' | ');
        return `  ${i + 1}. ${inner}`;
      }).join('\n');
    }
    return val.map(v => `  • ${v}`).join('\n');
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val as Record<string, any>);
    // Perfil numérico (índice → valor 1–5)
    if (entries.length > 0 && entries.every(([, v]) => typeof v === 'number')) {
      return entries.map(([k, v]) => `  Item ${+k + 1}: ${v}/5`).join('\n');
    }
    return entries
      .filter(([k]) => !META_KEYS.has(k))
      .map(([k, v]) => `${humanizeKey(k)}: ${formatValue(v)}`)
      .join('\n');
  }
  return String(val);
}

function flattenAnswersToText(raw: any): string {
  if (!raw) return '';
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch { return raw; }
  }
  // IF-SAHS / Entrevista frequentemente encapsulam em { responses: {...} }
  const answers = (raw && typeof raw === 'object' && raw.responses && typeof raw.responses === 'object')
    ? raw.responses
    : raw;
  const lines: string[] = [];
  for (const [key, val] of Object.entries(answers as Record<string, any>)) {
    if (META_KEYS.has(key)) continue;
    if (val === null || val === undefined || val === '') continue;
    lines.push(`${humanizeKey(key)}:`);
    lines.push(formatValue(val));
    lines.push('');
  }
  return lines.join('\n').trim();
}

function buildNilsAnalysisText(r: any): string {
  const d = (a: number, b: number) => (r?.[a] || 0) - (r?.[b] || 0);
  // Ignorar eslint; utilitário usa chaves do n_ils_responses
  const ativoRef = (r?.ati_val || 0) - (r?.ref_val || 0);
  const sensInt = (r?.sen_val || 0) - (r?.int_val || 0);
  const visVer = (r?.vis_val || 0) - (r?.ver_val || 0);
  const seqGlo = (r?.seq_val || 0) - (r?.glo_val || 0);
  void d; // silencia lint

  const intensity = (v: number) => {
    const abs = Math.abs(v);
    if (abs === 0) return 'equilíbrio entre os polos';
    if (abs <= 1) return 'leve preferência';
    if (abs <= 3) return 'preferência moderada';
    return 'forte preferência';
  };
  const polo = (v: number, pos: string, neg: string) =>
    v > 0 ? pos : v < 0 ? neg : `${pos} / ${neg}`;
  const formatDim = (label: string, v: number, pos: string, neg: string) =>
    `${label}: ${intensity(v)} pelo polo ${polo(v, pos, neg)} (diferencial ${v > 0 ? '+' : ''}${v}).`;

  return [
    'Perfil de Estilo de Aprendizagem (N-ILS):',
    '',
    formatDim('Dimensão Processamento', ativoRef, 'Ativo', 'Reflexivo'),
    formatDim('Dimensão Percepção', sensInt, 'Sensorial', 'Intuitivo'),
    formatDim('Dimensão Representação', visVer, 'Visual', 'Verbal'),
    formatDim('Dimensão Organização', seqGlo, 'Sequencial', 'Global')
  ].join('\n');
}

const INSTRUMENT_DEFAULTS: Record<InstrumentKind, Omit<DataSource, 'versions' | 'subtitle'>> = {
  'if-sahs':   { id: 'if-sahs',   title: 'IF-SAHS',   icon: Users,         colorClass: 'text-blue-600',   bgColorClass: 'bg-blue-100' },
  'ip-sahs':   { id: 'ip-sahs',   title: 'IP-SAHS',   icon: ClipboardList, colorClass: 'text-orange-600', bgColorClass: 'bg-orange-100' },
  'entrevista':{ id: 'entrevista',title: 'Entrevista',icon: MessageSquare, colorClass: 'text-emerald-600',bgColorClass: 'bg-emerald-100' },
  'n-ils':     { id: 'n-ils',     title: 'N-ILS',     icon: Brain,         colorClass: 'text-purple-600', bgColorClass: 'bg-purple-100' }
};

type TopicItem = { id: string; text: string; selected: boolean; source?: string; category?: string };

type CaseStudySynthesis = {
  currentContext: TopicItem[];
  learningStyle: TopicItem[];
  potentialsInterests: TopicItem[];
  demandsBarriers: TopicItem[];
  accessibilityStrategies: TopicItem[];
};

export const CONTEXT_CATEGORIES = [
  { id: 'acadêmico', label: 'Acadêmico', colorClass: 'bg-blue-100 text-blue-800' },
  { id: 'cognitivo', label: 'Cognitivo', colorClass: 'bg-purple-100 text-purple-800' },
  { id: 'linguístico', label: 'Linguístico', colorClass: 'bg-pink-100 text-pink-800' },
  { id: 'social', label: 'Social', colorClass: 'bg-emerald-100 text-emerald-800' },
  { id: 'emocional', label: 'Emocional', colorClass: 'bg-orange-100 text-orange-800' },
  { id: 'psicológico', label: 'Psicológico', colorClass: 'bg-yellow-100 text-yellow-800' },
  { id: 'físico', label: 'Físico/Sensorial', colorClass: 'bg-cyan-100 text-cyan-800' }
];

export const ACCESSIBILITY_CATEGORIES = [
  { id: 'instrucional', label: 'Instrucional', colorClass: 'bg-indigo-100 text-indigo-800' },
  { id: 'ambiental', label: 'Ambiental', colorClass: 'bg-teal-100 text-teal-800' },
  { id: 'avaliação', label: 'Avaliação', colorClass: 'bg-rose-100 text-rose-800' }
];

function AutoResizeTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [props.value]);

  return (
    <textarea
      {...props}
      ref={ref}
      onInput={(e) => {
        e.currentTarget.style.height = 'auto';
        e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
        if (props.onInput) props.onInput(e);
      }}
    />
  );
}

function TopicEditorList({
  topics,
  onChange,
  placeholder,
  categories
}: {
  topics: TopicItem[];
  onChange: (topics: TopicItem[]) => void;
  placeholder: string;
  categories?: { id: string; label: string; colorClass: string; }[];
}) {
  const [newTopicInput, setNewTopicInput] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState(categories ? categories[0].id : '');
  const safeTopics = Array.isArray(topics) ? topics : [];

  return (
    <div className="space-y-3">
       {safeTopics.map(t => {
         const cat = categories?.find(c => c.id === t.category);
         return (
         <div key={t.id} className="flex flex-col sm:flex-row items-start gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 h-auto">
           <div className="flex items-start gap-3 w-full sm:w-auto flex-1">
             <button aria-label={t.selected ? "Desmarcar" : "Marcar"} onClick={() => onChange(safeTopics.map(p => p.id === t.id ? {...p, selected: !p.selected} : p))} className={cn("w-5 h-5 mt-0.5 rounded-full flex items-center justify-center border shrink-0 transition-colors", t.selected ? "bg-primary border-primary text-white" : "border-slate-300 hover:border-slate-400")}>
               {t.selected && <div className="w-2.5 h-2.5 bg-white rounded-full"/>}
             </button>
             <AutoResizeTextarea aria-label="Texto" title="Texto" placeholder="Texto..." className={cn("resize-none overflow-hidden h-auto bg-transparent text-sm focus:outline-none transition-all whitespace-normal break-words flex-1 leading-relaxed", !t.selected && "line-through text-slate-400")} value={t.text} onChange={e => onChange(safeTopics.map(p => p.id === t.id ? {...p, text: e.target.value} : p))} rows={1}/>
           </div>
           <div className="flex items-start justify-between sm:justify-end w-full sm:w-auto gap-2 ml-8 sm:ml-0 mt-2 sm:mt-0">
             {categories && (
                <select aria-label="Selecionar categoria" title="Selecionar categoria" value={t.category || ''} onChange={(e) => onChange(safeTopics.map(p => p.id === t.id ? {...p, category: e.target.value} : p))} className={cn("text-[10px] capitalize font-bold tracking-wider px-1.5 py-0 rounded-full whitespace-nowrap shrink-0 outline-none cursor-pointer appearance-none text-center mt-0.5", cat ? cat.colorClass : "bg-slate-100 text-slate-600")}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
             )}
             <button aria-label="Remover" title="Remover" onClick={() => onChange(safeTopics.filter(p => p.id !== t.id))} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg shrink-0 mt-0.5"><Trash2 size={16}/></button>
           </div>
         </div>
       )})}
       <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 pt-4 border-t border-slate-100">
         <input type="text" placeholder={placeholder} className="flex-1 w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={newTopicInput} onChange={e => setNewTopicInput(e.target.value)} onKeyDown={(e) => {
           if(e.key === 'Enter' && newTopicInput.trim()) {
             if (categories && !newTopicCategory) return;
             onChange([...safeTopics, { id: crypto.randomUUID(), text: newTopicInput.trim(), selected: true, category: categories ? newTopicCategory : undefined }]);
             setNewTopicInput('');
           }
         }}/>
         {categories && (
            <select value={newTopicCategory} onChange={(e) => setNewTopicCategory(e.target.value)} className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 py-3 px-3 rounded-xl outline-none cursor-pointer focus:ring-2 focus:ring-primary/20">
              {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
         )}
         <button onClick={() => {
             if(newTopicInput.trim() && (!categories || newTopicCategory)) {
               onChange([...safeTopics, { id: crypto.randomUUID(), text: newTopicInput.trim(), selected: true, category: categories ? newTopicCategory : undefined }]);
               setNewTopicInput('');
             }
         }} className="w-full sm:w-auto bg-slate-900 text-white px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shrink-0">
            <Plus size={16}/> Adicionar
         </button>
       </div>
    </div>
  );
}

export default function ConvergenceEditor() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  
  // Left Column States
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [readingSource, setReadingSource] = useState<DataSource | null>(null);
  const [selectedVersionIdx, setSelectedVersionIdx] = useState(0);
  const [snippets, setSnippets] = useState<HighlightSnippet[]>([]);
  const [isSnippetsExpanded, setIsSnippetsExpanded] = useState(false);
  // Modo de leitura do modal IP-SAHS: alterna entre versão individual e visão agregada determinística.
  const [readingMode, setReadingMode] = useState<'version' | 'aggregated'>('version');
  
  // Generation & Right Column States
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  const [activeSegmentMapping, setActiveSegmentMapping] = useState<'contexto' | 'estrategias'>('contexto');
  const [activeTabMapping, setActiveTabMapping] = useState<'caracterizacao' | 'estilos' | 'potencialidades' | 'demandas'>('caracterizacao');

  const [caseStudySynthesis, setCaseStudySynthesis] = useState<CaseStudySynthesis>({
    currentContext: [],
    learningStyle: [],
    potentialsInterests: [],
    demandsBarriers: [],
    accessibilityStrategies: []
  });
  const [lastConsolidation, setLastConsolidation] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  // Status do gateway de IA ('unknown' enquanto checa, 'ready' / 'missing-key' / 'offline')
  const [aiStatus, setAiStatus] = useState<'unknown' | 'ready' | 'missing-key' | 'offline'>('unknown');

  // Health-check do backend de IA (não bloqueia a página).
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
        if (!res.ok) throw new Error('health não ok');
        const data = await res.json();
        if (!cancelled) setAiStatus(data.aiReady ? 'ready' : 'missing-key');
      } catch {
        if (!cancelled) setAiStatus('offline');
      }
    };
    check();
    return () => { cancelled = true; };
  }, []);

  // Carrega a síntese já gerada a partir de convergence_records (Supabase)
  const [convergenceRowId, setConvergenceRowId] = useState<string | null>(null);
  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('convergence_records')
        .select('id, synthesis_data, last_updated, updated_at, created_at')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error('[Convergence] erro ao carregar síntese:', error);
        return;
      }
      if (data) {
        setConvergenceRowId(data.id);
        if (data.synthesis_data) {
          setCaseStudySynthesis(data.synthesis_data as CaseStudySynthesis);
          setHasGenerated(true);
        }
        const stamp = data.last_updated || (data as any).updated_at || data.created_at;
        if (stamp) setLastConsolidation(new Date(stamp).toLocaleString('pt-BR'));
      }
    })();
    return () => { cancelled = true; };
  }, [studentId]);

  // Busca instrumentos reais + fichamentos do Supabase
  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;

    async function fetchAll() {
      setLoadingSources(true);

      const [records, ipLegacy, nils, snips, ipConsolid] = await Promise.all([
        supabase.from('instrument_records')
          .select('id, type, respondent_name, respondent_role, answers, created_at, updated_at')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false }),
        supabase.from('ip_sahs_responses')
          .select('*')
          .eq('student_id', studentId)
          .order('completed_at', { ascending: false }),
        supabase.from('n_ils_responses')
          .select('*')
          .eq('student_id', studentId)
          .eq('status', 'active')
          .order('updated_at', { ascending: false }),
        supabase.from('highlight_snippets')
          .select('*')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false }),
        supabase.from('ip_sahs_consolidations')
          .select('*')
          .eq('student_id', studentId)
          .eq('status', 'ativo')
          .order('created_at', { ascending: false })
          .limit(1)
      ]);

      if (cancelled) return;

      const recordsData = records.data || [];
      const ipLegacyData = ipLegacy.data || [];
      const nilsData = nils.data || [];
      const ipConsolidData = ipConsolid.data || [];

      const labelFor = (respondent?: string, role?: string, date?: string) => {
        const parts = [respondent || role || 'Sem identificação'];
        if (role && respondent) parts.push(role);
        if (date) parts.push(new Date(date).toLocaleDateString('pt-BR'));
        return parts.filter(Boolean).join(' • ');
      };

      const ifSahsVersions: InstrumentVersion[] = recordsData
        .filter(r => r.type?.startsWith('if_sahs'))
        .map(r => ({
          id: r.id,
          sourceTable: 'instrument_records' as const,
          label: labelFor(r.respondent_name, r.respondent_role, r.created_at),
          dateISO: r.updated_at || r.created_at,
          content: flattenAnswersToText(r.answers)
        }));

      const interviewVersions: InstrumentVersion[] = recordsData
        .filter(r => r.type?.startsWith('interview'))
        .map(r => ({
          id: r.id,
          sourceTable: 'instrument_records' as const,
          label: labelFor(r.respondent_name, r.respondent_role, r.created_at),
          dateISO: r.updated_at || r.created_at,
          content: flattenAnswersToText(r.answers)
        }));

      const ipSahsIndividual: InstrumentVersion[] = [
        ...recordsData
          .filter(r => r.type === 'ip_sahs')
          .map(r => ({
            id: r.id,
            sourceTable: 'instrument_records' as const,
            label: labelFor(r.respondent_name, r.respondent_role, r.created_at),
            dateISO: r.updated_at || r.created_at,
            content: flattenAnswersToText(r.answers),
            rawAnswers: (r.answers as Record<string, any>) || {},
            respondentName: r.respondent_name || '',
            respondentRole: r.respondent_role || ''
          })),
        ...ipLegacyData.map((r: any) => {
          const { respondent_name, role, ...rest } = r;
          return {
            id: r.id,
            sourceTable: 'ip_sahs_responses' as const,
            label: labelFor(respondent_name, role, r.completed_at || r.created_at),
            dateISO: r.completed_at || r.created_at,
            content: flattenAnswersToText(r),
            rawAnswers: rest,
            respondentName: respondent_name || '',
            respondentRole: role || ''
          };
        })
      ];

      const ipSahsConsolidatedVersion: InstrumentVersion[] = ipConsolidData.map((c: any) => ({
        id: c.id,
        sourceTable: 'ip_sahs_consolidations' as const,
        label: `✨ Versão Consolidada IA • ${new Date(c.created_at).toLocaleDateString('pt-BR')}`,
        dateISO: c.created_at,
        content: (c.consolidated_data?.analysis as string) || '',
        isConsolidated: true
      }));

      // Consolidada sempre como primeira opção quando existir
      const ipSahsVersions: InstrumentVersion[] = [...ipSahsConsolidatedVersion, ...ipSahsIndividual];

      const nilsVersions: InstrumentVersion[] = nilsData.map((r: any) => ({
        id: r.id,
        sourceTable: 'n_ils_responses' as const,
        label: `Análise automática • ${new Date(r.updated_at || r.created_at).toLocaleDateString('pt-BR')}`,
        dateISO: r.updated_at || r.created_at,
        content: buildNilsAnalysisText(r)
      }));

      const toSubtitle = (count: number) =>
        count === 0 ? 'Nenhum preenchimento' : count === 1 ? '1 preenchimento' : `${count} preenchimentos`;

      const nextSources: DataSource[] = [
        { ...INSTRUMENT_DEFAULTS['if-sahs'],   versions: ifSahsVersions,    subtitle: toSubtitle(ifSahsVersions.length) },
        { ...INSTRUMENT_DEFAULTS['ip-sahs'],   versions: ipSahsVersions,    subtitle: toSubtitle(ipSahsVersions.length) },
        { ...INSTRUMENT_DEFAULTS['entrevista'],versions: interviewVersions, subtitle: toSubtitle(interviewVersions.length) },
        { ...INSTRUMENT_DEFAULTS['n-ils'],     versions: nilsVersions,      subtitle: nilsVersions.length ? 'Análise automática disponível' : 'Nenhum preenchimento' }
      ];

      setSources(nextSources);
      setSnippets((snips.data || []) as HighlightSnippet[]);
      setLoadingSources(false);
    }

    fetchAll().catch(err => {
      console.error('[Convergence] erro carregando fontes:', err);
      setLoadingSources(false);
    });

    return () => { cancelled = true; };
  }, [studentId]);

  // Modal Filters/Sort States
  const [filterStatus, setFilterStatus] = useState<'ativo' | 'armazenado'>('ativo');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'category' | 'source'>('recent');

  const availableSources = Array.from(new Set(snippets.map(s => s.instrument_source)));

  const filteredAndSortedSnippets = snippets
    .filter(s => (s.status || 'ativo') === filterStatus)
    .filter(s => filterCategory === 'all' || s.category === filterCategory)
    .filter(s => filterSource === 'all' || s.instrument_source === filterSource)
    .sort((a, b) => {
       if (sortBy === 'category') return a.category.localeCompare(b.category);
       if (sortBy === 'source') return a.instrument_source.localeCompare(b.instrument_source);
       return Number(b.id) - Number(a.id);
    });

  const handleHighlight = async (category: 'demandas' | 'contexto' | 'potencialidades' | 'duvida') => {
    const sel = window.getSelection();
    const selection = sel?.toString().trim();
    if (!selection) {
      alert('Por favor, selecione um trecho do texto antes de clicar no botão.');
      return;
    }
    if (!readingSource || !studentId) return;

    // --- Modo "Visão Agregada": inferimos sourceId/sourceTable/respondente a partir do DOM ---
    let resolvedSourceId: string | null = null;
    let resolvedSourceTable: string | null = null;
    let resolvedInstrumentSource: string | null = null;

    if (readingMode === 'aggregated' && readingSource.id === 'ip-sahs' && sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const findBlock = (node: Node | null): HTMLElement | null => {
        let el: Node | null = node;
        while (el && el.nodeType !== 1) el = el.parentNode;
        return (el as HTMLElement | null)?.closest('[data-source-id]') ?? null;
      };
      const startBlock = findBlock(range.startContainer);
      const endBlock = findBlock(range.endContainer);
      if (!startBlock || !endBlock) {
        alert('Seleção fora de um bloco rastreável. Selecione texto dentro de um único relato de respondente.');
        return;
      }
      if (startBlock !== endBlock) {
        alert('A seleção atravessa respondentes diferentes. Para preservar a rastreabilidade, selecione um trecho contido em um único bloco.');
        return;
      }
      resolvedSourceId = startBlock.dataset.sourceId ?? null;
      resolvedSourceTable = startBlock.dataset.sourceTable ?? null;
      const who = startBlock.dataset.respondent || 'Sem identificação';
      const role = startBlock.dataset.role || '';
      resolvedInstrumentSource = `${readingSource.title} — ${who}${role ? ` (${role})` : ''}`;
    }

    const version = readingSource.versions[selectedVersionIdx];
    const instrumentSource = resolvedInstrumentSource
      ?? (version ? `${readingSource.title} — ${version.label}` : readingSource.title);

    const payload = {
      student_id: studentId,
      instrument_source: instrumentSource,
      source_record_id: resolvedSourceId ?? version?.id ?? null,
      source_table: resolvedSourceTable ?? version?.sourceTable ?? null,
      text: selection,
      category,
      status: 'ativo' as const
    };

    const { data, error } = await supabase
      .from('highlight_snippets')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('[Convergence] erro ao salvar fichamento:', error);
      alert('Erro ao salvar marcação: ' + error.message);
      return;
    }
    setSnippets(prev => [data as HighlightSnippet, ...prev]);
    window.getSelection()?.removeAllRanges();
  };

  const handleChangeCategory = async (id: string, newCategory: 'demandas' | 'contexto' | 'potencialidades' | 'duvida') => {
    const previous = snippets;
    setSnippets(prev => prev.map(s => s.id === id ? { ...s, category: newCategory } : s));
    const { error } = await supabase
      .from('highlight_snippets')
      .update({ category: newCategory })
      .eq('id', id);
    if (error) {
      console.error('[Convergence] erro ao atualizar categoria:', error);
      alert('Erro ao atualizar categoria: ' + error.message);
      setSnippets(previous);
    }
  };

  const handleUpdateSnippetStatus = async (id: string, status: 'ativo' | 'armazenado') => {
    const previous = snippets;
    setSnippets(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    const { error } = await supabase
      .from('highlight_snippets')
      .update({ status })
      .eq('id', id);
    if (error) {
      console.error('[Convergence] erro ao alterar status do fichamento:', error);
      setSnippets(previous);
    }
  };

  const handleDeleteSnippet = async (id: string) => {
    if (!confirm('Deseja realmente apagar este registro em definitivo?')) return;
    const previous = snippets;
    setSnippets(prev => prev.filter(s => s.id !== id));
    const { error } = await supabase
      .from('highlight_snippets')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('[Convergence] erro ao excluir fichamento:', error);
      alert('Erro ao excluir: ' + error.message);
      setSnippets(previous);
    }
  };

  // A função legada handleConsolidateIPSahs foi removida: a nova "Visão Agregada"
  // determinística (src/lib/ipsahs/aggregator.ts + IPSahsAggregatedView) substitui
  // a consolidação por IA com mais transparência e zero custo de tokens.
  // Registros antigos em `ip_sahs_consolidations` continuam sendo exibidos para
  // preservar histórico, mas novas consolidações não são mais criadas.

  const handleGenerate = async () => {
    if (!studentId) return;
    const hasAnyData = sources.some(s => s.versions.length > 0);
    if (!hasAnyData && snippets.length === 0) {
      alert('Não há dados de instrumentos nem fichamentos para gerar o mapeamento.');
      return;
    }

    setIsGenerating(true);
    try {
      const studentRes = await supabase
        .from('students').select('full_name').eq('id', studentId).single();
      const studentName = studentRes.data?.full_name || 'Aluno';

      const prompt = buildMappingPrompt({
        studentName,
        sources,
        snippets: snippets.filter(s => (s.status || 'ativo') === 'ativo')
      });
      const model = 'gemini-1.5-flash';

      const aiRes = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model })
      });
      if (!aiRes.ok) {
        const err = await aiRes.json().catch(() => ({}));
        throw new Error(err.error || `Falha na IA (${aiRes.status})`);
      }
      const { result: raw } = await aiRes.json();
      if (!raw || typeof raw !== 'string') {
        throw new Error('A IA retornou um conteúdo vazio ou inválido.');
      }

      let parsed: any;
      try {
        parsed = safeParseAIJson(raw);
      } catch (e: any) {
        console.error('[Convergence] JSON inválido da IA:', raw);
        throw new Error('A IA retornou um JSON inválido. Tente novamente.');
      }
      const synthesis = normalizeMappingResponse(parsed);

      const nowIso = new Date().toISOString();
      const payload: Record<string, any> = {
        student_id: studentId,
        synthesis_data: synthesis,
        ai_prompt: prompt,
        ai_model: model,
        last_updated: nowIso
      };

      let savedId = convergenceRowId;
      if (savedId) {
        const { error: updErr } = await supabase
          .from('convergence_records')
          .update(payload)
          .eq('id', savedId);
        if (updErr) throw updErr;
      } else {
        // Garante default para axis_data legado caso a coluna seja NOT NULL
        const insertPayload = {
          ...payload,
          axis_data: { I: [], II: [], III: [], IV: [] }
        };
        const { data: inserted, error: insErr } = await supabase
          .from('convergence_records')
          .insert(insertPayload)
          .select('id')
          .single();
        if (insErr) throw insErr;
        savedId = inserted.id;
        setConvergenceRowId(savedId);
      }

      setCaseStudySynthesis(synthesis);
      setHasGenerated(true);
      setLastConsolidation(new Date(nowIso).toLocaleString('pt-BR'));
    } catch (err: any) {
      console.error('[Convergence] erro ao gerar mapeamento:', err);
      alert('Erro ao gerar mapeamento: ' + (err.message || 'desconhecido'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Debounce de persistência para evitar escrita a cada tecla
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistSynthesis = (synthesis: CaseStudySynthesis) => {
    if (!studentId || !convergenceRowId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from('convergence_records')
        .update({ synthesis_data: synthesis, last_updated: new Date().toISOString() })
        .eq('id', convergenceRowId);
      if (error) console.error('[Convergence] erro ao salvar edição da síntese:', error);
    }, 700);
  };

  const handleTopicChange = (updater: (prev: CaseStudySynthesis) => CaseStudySynthesis) => {
    setCaseStudySynthesis(prev => {
      const updated = updater(prev);
      persistSynthesis(updated);
      return updated;
    });
  };



  const handleApproveAndProceed = () => {
    setShowToast(true);
    setTimeout(() => {
       navigate(`/students/${studentId}`);
    }, 1500);
  };

  const renderHighlightedText = (text: string, versionRecordId?: string) => {
    const sourceSnippets = snippets.filter(s => {
      if (s.status === 'armazenado') return false;
      if (!versionRecordId) return false;
      return (s as any).source_record_id === versionRecordId;
    });
    if (sourceSnippets.length === 0) return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text) }} className="leading-relaxed whitespace-pre-wrap" />;

    // Mapeamento de cores
    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'demandas': return 'bg-red-100 text-red-800';
        case 'contexto': return 'bg-blue-100 text-blue-800';
        case 'potencialidades': return 'bg-green-100 text-green-800';
        case 'duvida': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100';
      }
    };

    let resultText = text;
    // Substituição grosseira porém segura para React usando dangerouslySetInnerHTML para o modal de leitura
    sourceSnippets.forEach(snippet => {
      // Escapa caracteres especiais para usar no regex
      const escapedText = snippet.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(${escapedText})`, 'gi');
      resultText = resultText.replace(regex, `<mark class="${getCategoryColor(snippet.category)} px-1 rounded">$1</mark>`);
    });

    return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resultText) }} className="leading-relaxed whitespace-pre-wrap" />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <TopBar title="Análise de Convergência" showBack />
      
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 16, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[100] bg-[#1DB954] text-white px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3 tracking-wide"
          >
            <CheckCircle2 size={24} /> Mapeamento aprovado! O PEI foi atualizado.
          </motion.div>
        )}
      </AnimatePresence>
      
      {lastConsolidation && (
        <div className="bg-blue-50 border-b border-blue-100/50 px-6 py-3 flex items-center justify-center gap-2 text-sm font-bold text-blue-700 shadow-inner">
          <CheckCircle2 size={16} /> Mapeamento consolidado pela última vez em: {lastConsolidation}
        </div>
      )}

      {(aiStatus === 'offline' || aiStatus === 'missing-key') && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-center gap-2 text-sm font-bold text-amber-800 shadow-inner">
          <Info size={16} />
          {aiStatus === 'offline'
            ? 'Gateway de IA offline. Rode `npm run dev` (ou `npm run dev:server`) e recarregue.'
            : 'GEMINI_API_KEY ausente no servidor. Preencha em .env.local e reinicie `npm run dev`.'}
        </div>
      )}
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
        <StudentPageHeader title="Mapeamento Assistido" studentId={studentId} />

        <IABanner feature="Convergência assistida de instrumentos (IF-SAHS, IP-SAHS, N-ILS, entrevista)" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* COLUNA ESQUERDA: Fontes de Dados e Snippets */}
          <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 atmospheric-shadow flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
               <Database className="text-primary" size={24} />
               <h2 className="text-xl font-black text-on-surface tracking-tight">Base de Dados</h2>
            </div>
            
            <p className="text-sm text-slate-500 font-medium">
              Clique nos instrumentos para ler o relato bruto e realizar marcações (fichamento).
            </p>
            
            <div className="space-y-4">
               {loadingSources ? (
                  <div className="flex items-center justify-center py-10 text-slate-400 gap-3">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-xs font-black uppercase tracking-widest">Carregando instrumentos...</span>
                  </div>
               ) : sources.map(source => {
                 const Icon = source.icon;
                 const empty = source.versions.length === 0;
                 const snippetCount = snippets.filter(s =>
                    s.status !== 'armazenado' &&
                    source.versions.some(v => v.id === (s as any).source_record_id)
                 ).length;
                 return (
                   <button
                     key={source.id}
                     onClick={() => {
                        if (empty) return;
                        setSelectedVersionIdx(0);
                        setReadingMode('version');
                        setReadingSource(source);
                     }}
                     disabled={empty}
                     className={cn(
                       "w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors text-left",
                       empty ? "opacity-60 cursor-not-allowed" : "group hover:border-primary/30 cursor-pointer"
                     )}
                   >
                     <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", source.bgColorClass, source.colorClass)}>
                           <Icon size={18} />
                        </div>
                        <div>
                           <p className="font-bold text-sm text-slate-700">{source.title}</p>
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                             {source.subtitle}
                             {snippetCount > 0 && <span className="ml-2 text-primary">• {snippetCount} marcações</span>}
                           </p>
                        </div>
                     </div>
                     {!empty && <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />}
                   </button>
                 );
               })}
            </div>

            <button
               disabled={isGenerating || aiStatus === 'offline' || aiStatus === 'missing-key'}
               onClick={handleGenerate}
               title={
                 aiStatus === 'offline' ? 'Gateway de IA offline' :
                 aiStatus === 'missing-key' ? 'GEMINI_API_KEY não configurada' :
                 undefined
               }
               className={cn(
                 "mt-auto w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95",
                 (isGenerating || aiStatus === 'offline' || aiStatus === 'missing-key')
                   ? "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed"
                   : "bg-primary text-white shadow-primary/20 hover:brightness-110"
               )}
            >
               {isGenerating ? (
                  <><Loader2 size={20} className="animate-spin" /> Processando IA...</>
               ) : (
                  <><Sparkles size={20} /> {lastConsolidation ? "Atualizar Mapeamento (IA)" : "Gerar Mapeamento do Estudo de Caso (IA)"}</>
               )}
            </button>
            
            {hasGenerated && (
               <div className="flex items-center gap-2 justify-center text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 py-2 rounded-xl border border-green-200 mt-[-10px]">
                  <CheckCircle2 size={14} /> Mapeamento Concluído
               </div>
            )}
          </div>
          
          {/* Seção Marcadores do Professor (Versão Compacta Sempre Renderizada) */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] p-6 border border-slate-100 atmospheric-shadow flex flex-col gap-4">
            <div className="flex items-center gap-3">
               <Highlighter className="text-primary" size={24} />
               <div>
                 <h2 className="text-lg font-black text-on-surface tracking-tight">Fichamento Prévio</h2>
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-0.5">{snippets.filter(s => s.status !== 'armazenado').length} marcações ativas</p>
               </div>
            </div>
            
            <div className="flex flex-col gap-2">
               <button 
                 onClick={() => { setFilterStatus('ativo'); setIsSnippetsExpanded(true); }}
                 className="w-full py-3 bg-slate-50 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
               >
                 <Maximize2 size={16} /> Expandir Marcadores
               </button>
            </div>
          </motion.div>
        </div>

        {/* COLUNA DIREITA: Resultado Legal Art. 11 e Checklists */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 atmospheric-shadow flex flex-col items-center justify-center text-center">
             <ShieldCheck size={32} className="text-primary mb-3" />
             <h2 className="text-2xl font-black text-on-surface tracking-tight">Síntese do Estudo de Caso</h2>
             <p className="text-sm font-medium text-slate-500 mt-2 max-w-xl">
               Esta estrutura obedece ao <strong>Art. 11 do Decreto 12.686/2025</strong> e mapeia as barreiras em conformidade com a <strong>LBI (Lei Brasileira de Inclusão)</strong>.
             </p>
          </div>

          <AnimatePresence mode="wait">
             {!hasGenerated && !isGenerating && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-slate-50 border-2 border-dashed border-slate-200 flex-1 rounded-[32px] flex flex-col items-center justify-center p-12 text-center"
                >
                   <Brain size={48} className="text-slate-300 mb-6" />
                   <p className="text-slate-500 font-bold text-lg max-w-sm mb-2">Aguardando Análise da Inteligência Artificial</p>
                   <p className="text-slate-400 text-sm">Clique em "Gerar Mapeamento" na coluna ao lado para cruzar os dados da base.</p>
                </motion.div>
             )}

             {isGenerating && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-primary/5 border border-primary/20 flex-1 rounded-[32px] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent animate-pulse rounded-[32px]" />
                   <Loader2 size={48} className="text-primary animate-spin mb-6 relative z-10" />
                   <p className="text-primary font-black text-lg max-w-sm mb-2 relative z-10">Lendo Fatos e Preferências...</p>
                   <p className="text-slate-500 text-sm font-medium relative z-10">Adequando marcadores e barreiras aos tipos previstos na LBI.</p>
                </motion.div>
             )}

             {hasGenerated && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                    {/* Formulário de Síntese em Formato Checklist Curador */}
                    <div className="bg-slate-50/50 p-2 rounded-2xl border border-slate-100 flex flex-wrap justify-center gap-2 w-fit mx-auto mb-4">
                        <button 
                          onClick={() => setActiveSegmentMapping('contexto')}
                          className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            activeSegmentMapping === 'contexto' 
                              ? "bg-white text-primary shadow-sm border border-slate-200/60" 
                              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                          )}
                        >
                          Contexto Biopsicossocial e Educacional
                        </button>
                        <button 
                          onClick={() => setActiveSegmentMapping('estrategias')}
                          className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            activeSegmentMapping === 'estrategias' 
                              ? "bg-white text-primary shadow-sm border border-slate-200/60" 
                              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                          )}
                        >
                          Estratégias e Recursos de Acessibilidade
                        </button>
                    </div>

                    {activeSegmentMapping === 'contexto' && (
                      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden atmospheric-shadow animate-in fade-in slide-in-from-bottom-4 duration-300">
                         {/* Tabs Menu - Estilo Fichário */}
                         <div className="flex border-b border-slate-200 bg-slate-100 overflow-x-auto pt-2 px-2 gap-1">
                           {[
                             { id: 'caracterizacao', label: 'Caracterização' },
                             { id: 'estilos', label: 'Estilos de aprendizagem' },
                             { id: 'potencialidades', label: 'Potencialidades e Interesses' },
                             { id: 'demandas', label: 'Demandas e barreiras' }
                           ].map(tab => (
                             <button
                               key={tab.id}
                               onClick={() => setActiveTabMapping(tab.id as typeof activeTabMapping)}
                               className={cn(
                                 "px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap rounded-t-xl border-t border-x",
                                 activeTabMapping === tab.id
                                   ? "bg-white border-slate-200 text-primary shadow-[0_4px_0_0_#ffffff] translate-y-[1px] relative z-10"
                                   : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                               )}
                             >
                               {tab.label}
                             </button>
                           ))}
                         </div>

                         <div className="p-8 bg-slate-50/50">
                           {activeTabMapping === 'caracterizacao' && (
                              <div className="space-y-6">
                                 <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Caracterização</h3>
                                 <TopicEditorList
                                   topics={caseStudySynthesis.currentContext}
                                   onChange={(newTopics) => handleTopicChange(prev => ({ ...prev, currentContext: newTopics }))}
                                   placeholder="Descreva o contexto acadêmico, social, cognitivo..."
                                   categories={CONTEXT_CATEGORIES}
                                 />
                              </div>
                           )}

                           {activeTabMapping === 'estilos' && (
                              <div className="space-y-6">
                                 <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Estilos de Aprendizagem Identificados</h3>
                                 <TopicEditorList
                                   topics={caseStudySynthesis.learningStyle}
                                   onChange={(newTopics) => handleTopicChange(prev => ({ ...prev, learningStyle: newTopics }))}
                                   placeholder="Adicionar característica de estilo..."
                                 />
                              </div>
                           )}

                           {activeTabMapping === 'potencialidades' && (
                              <div className="space-y-6">
                                 <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Potencialidades e Interesses</h3>
                                 <TopicEditorList
                                   topics={caseStudySynthesis.potentialsInterests}
                                   onChange={(newTopics) => handleTopicChange(prev => ({ ...prev, potentialsInterests: newTopics }))}
                                   placeholder="Adicionar talento ou interesse..."
                                 />
                              </div>
                           )}

                           {activeTabMapping === 'demandas' && (
                              <div className="space-y-6">
                                 <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Demandas e Barreiras Mapeadas (LBI)</h3>
                                 <TopicEditorList
                                   topics={caseStudySynthesis.demandsBarriers}
                                   onChange={(newTopics) => handleTopicChange(prev => ({ ...prev, demandsBarriers: newTopics }))}
                                   placeholder="Adicionar barreira ou demanda..."
                                 />
                              </div>
                           )}
                         </div>
                      </div>
                    )}

                    {activeSegmentMapping === 'estrategias' && (
                      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden atmospheric-shadow p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                         <div className="space-y-6">
                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-xl flex items-start gap-3 mb-6">
                               <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
                               <p className="text-sm font-medium text-amber-800 leading-relaxed">
                                 Presume-se que as adaptações propostas e validadas por este componente sejam as mesmas necessárias para a progressão do estudante e deverão ser formalizadas pela escola. Recomenda-se catalogar aqui para cruzamento no PEI.
                               </p>
                            </div>
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Acessibilidade: Estratégias</h3>
                            <TopicEditorList
                              topics={caseStudySynthesis.accessibilityStrategies}
                              onChange={(newTopics) => handleTopicChange(prev => ({ ...prev, accessibilityStrategies: newTopics }))}
                              placeholder="Descreva a estratégia ou recurso de apoio..."
                              categories={ACCESSIBILITY_CATEGORIES}
                            />
                         </div>
                      </div>
                    )}

                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="pt-6">
                      <button 
                         onClick={handleApproveAndProceed}
                         className="w-full bg-[#1DB954] text-white py-7 rounded-[32px] font-black text-base uppercase tracking-widest shadow-xl shadow-green-500/20 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                      >
                         <span>Aprovar Estudo de Caso e Avançar para o PEI</span>
                         <ArrowRight size={24} />
                      </button>
                      <p className="text-center text-xs font-bold text-slate-400 mt-6 uppercase tracking-widest flex items-center justify-center gap-2">
                        <ShieldCheck size={14} /> Os itens analisados alimentarão automaticamente a 'Seção II' do construtor de PEI.
                      </p>
                   </motion.div>
                </motion.div>
             )}
          </AnimatePresence>
        </div>
      </div>
      </main>

      {/* Modal de Leitura (Side Panel ou Overlay Central) */}
      <AnimatePresence>
        {readingSource && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setReadingSource(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                 <div className="flex items-center gap-3">
                   <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", readingSource.bgColorClass, readingSource.colorClass)}>
                      <readingSource.icon size={18} />
                   </div>
                   <div>
                     <h3 className="font-black text-xl text-slate-800">{readingSource.title}</h3>
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                       {readingSource.versions.length > 1
                         ? `${readingSource.versions.length} versões disponíveis`
                         : 'Leitura de Relato Bruto'}
                     </p>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReadingSource(null)}
                      className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                    >
                      <X size={24} />
                    </button>
                 </div>
              </div>

              {/* Seletor de Versão + Visão Agregada (apenas IP-SAHS) */}
              {(() => {
                const ipSahsIndividuals = readingSource.id === 'ip-sahs'
                  ? readingSource.versions.filter(v => !v.isConsolidated && v.rawAnswers)
                  : [];
                const showAggregatedToggle = ipSahsIndividuals.length >= 2;
                if (readingSource.versions.length <= 1 && !showAggregatedToggle) return null;
                return (
                  <div className="px-6 py-3 border-b border-slate-100 bg-white shrink-0 flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Modo de leitura:</span>
                    <div className="flex flex-wrap gap-2">
                      {showAggregatedToggle && (
                        <button
                          onClick={() => setReadingMode('aggregated')}
                          className={cn(
                            "px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5",
                            readingMode === 'aggregated'
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                              : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700"
                          )}
                          title="Consolidação estatística de todos os respondentes (sem IA, determinística)."
                        >
                          <Activity size={12} /> Visão Agregada
                        </button>
                      )}
                      {readingSource.versions.map((v, idx) => (
                        <button
                          key={v.id}
                          onClick={() => { setReadingMode('version'); setSelectedVersionIdx(idx); }}
                          className={cn(
                            "px-3 py-1.5 text-xs font-bold rounded-lg border transition-all",
                            readingMode === 'version' && selectedVersionIdx === idx
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-slate-50 text-slate-500 border-slate-200 hover:border-primary/40 hover:text-primary"
                          )}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Fichamento Toolbar — disponível também na Visão Agregada (rastreia respondente via DOM) */}
              <div className="px-6 py-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 shrink-0">
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest shrink-0">Grifar Texto (Fichamento):</span>
                 <div className="flex flex-wrap items-center gap-2">
                   <button 
                     onClick={() => handleHighlight('demandas')}
                     title="Identifique entraves, frustrações e barreiras arquitetônicas, comunicacionais ou atitudinais (LBI)."
                     className="px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95"
                   >
                     <Highlighter size={14} /> Demanda/Barreira <Info size={14} />
                   </button>
                   <button 
                     onClick={() => handleHighlight('contexto')}
                     title="Identifique características do ambiente escolar, métodos utilizados e dinâmica da turma."
                     className="px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95"
                   >
                     <Highlighter size={14} /> Contexto <Info size={14} />
                   </button>
                   <button 
                     onClick={() => handleHighlight('potencialidades')}
                     title="Identifique interesses profundos, talentos, facilidades e o que motiva o estudante."
                     className="px-4 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95"
                   >
                     <Highlighter size={14} /> Potencialidades/Interesses <Info size={14} />
                   </button>
                   <button 
                     onClick={() => handleHighlight('duvida')}
                     title="Use para trechos ambíguos ou que precisem de consulta a outro especialista."
                     className="px-4 py-2.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95"
                   >
                     <Highlighter size={14} /> Dúvida / Em Análise <Info size={14} />
                   </button>
                 </div>
              </div>

              {/* Text Content */}
              <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-700 leading-relaxed text-sm selection:bg-yellow-200 selection:text-slate-900">
                 {(() => {
                    // Modo "Visão Agregada" — consolidação determinística do IP-SAHS
                    if (readingMode === 'aggregated' && readingSource.id === 'ip-sahs') {
                      const individuals = readingSource.versions.filter(v => !v.isConsolidated && v.rawAnswers);
                      if (individuals.length === 0) {
                        return <p className="text-slate-400 italic">Sem respondentes para agregar.</p>;
                      }
                      const aggregated = aggregateIPSahs(individuals.map(v => ({
                        id: v.id,
                        sourceTable: (v.sourceTable === 'ip_sahs_responses' ? 'ip_sahs_responses' : 'instrument_records') as 'instrument_records' | 'ip_sahs_responses',
                        name: v.respondentName || 'Sem identificação',
                        role: v.respondentRole || '',
                        dateISO: v.dateISO,
                        rawAnswers: v.rawAnswers as Record<string, any>
                      })));
                      // Snippets que pertencem a algum respondente desta visão agregada
                      const aggSnippets = snippets.filter(
                        s => individuals.some(v => (s as any).source_record_id === v.id)
                      );
                      return <IPSahsAggregatedView data={aggregated} fichable snippets={aggSnippets} />;
                    }

                    const version = readingSource.versions[selectedVersionIdx];
                    if (!version) {
                       return <p className="text-slate-400 italic">Nenhuma versão disponível.</p>;
                    }
                    // Renderer estruturado para IP-SAHS individual (não consolidado)
                    const isIPSahsIndividual =
                      readingSource.id === 'ip-sahs' && !version.isConsolidated && version.rawAnswers;
                    if (isIPSahsIndividual) {
                      const versionSnippets = snippets.filter(
                        s => (s as any).source_record_id === version.id
                      );
                      return (
                        <IPSahsReader
                          rawAnswers={version.rawAnswers as Record<string, any>}
                          respondentName={version.respondentName}
                          respondentRole={version.respondentRole}
                          completedAt={version.dateISO}
                          snippets={versionSnippets}
                        />
                      );
                    }
                    if (!version.content.trim()) {
                       return <p className="text-slate-400 italic">Este preenchimento não possui conteúdo textual a exibir.</p>;
                    }
                    return renderHighlightedText(version.content, version.id);
                 })()}
                 <div className="mt-8 pt-8 border-t border-slate-100">
                    <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                       <CheckCircle2 size={16} />
                       {readingMode === 'aggregated'
                         ? 'Dica: selecione o trecho dentro de um único bloco de respondente para preservar a rastreabilidade.'
                         : 'Dica: selecione o texto com o cursor e depois clique em um dos botões coloridos acima.'}
                    </p>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Gerenciador de Snippets */}
      <AnimatePresence>
        {isSnippetsExpanded && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsSnippetsExpanded(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex flex-col gap-4 bg-white shrink-0">
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="font-black text-2xl text-slate-800">Gerenciador de Marcadores</h3>
                     <p className="text-xs font-bold uppercase text-slate-400 tracking-widest mt-1">Revise as categorias antes de enviar para a IA</p>
                   </div>
                   <button 
                     onClick={() => setIsSnippetsExpanded(false)} 
                     className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                   >
                     <X size={24} />
                   </button>
                 </div>
                 
                 {/* Filtros e Ordenação */}
                 <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex bg-slate-200/50 p-1 rounded-lg self-start">
                       <button onClick={() => setFilterStatus('ativo')} className={cn("px-6 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all", filterStatus === 'ativo' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}>Ativos</button>
                       <button onClick={() => setFilterStatus('armazenado')} className={cn("px-6 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all", filterStatus === 'armazenado' ? "bg-white text-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Armazenados</button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Categoria:</span>
                       <select 
                         value={filterCategory} 
                         onChange={e => setFilterCategory(e.target.value)}
                         className="bg-white border border-slate-200 text-xs font-bold text-slate-600 py-1.5 px-2 rounded-lg outline-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                       >
                         <option value="all">Todas</option>
                         <option value="demandas">Demandas</option>
                         <option value="contexto">Contexto</option>
                         <option value="potencialidades">Potencialidades/Interess.</option>
                         <option value="duvida">Dúvidas</option>
                       </select>
                    </div>

                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Instrumento:</span>
                       <select 
                         value={filterSource} 
                         onChange={e => setFilterSource(e.target.value)}
                         className="bg-white border border-slate-200 text-xs font-bold text-slate-600 py-1.5 px-2 rounded-lg outline-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                       >
                         <option value="all">Todos</option>
                         {availableSources.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                       <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Ordenar:</span>
                       <select 
                         value={sortBy} 
                         onChange={e => setSortBy(e.target.value as any)}
                         className="bg-white border border-slate-200 text-xs font-bold text-slate-600 py-1.5 px-2 rounded-lg outline-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                       >
                         <option value="recent">Mais recentes</option>
                         <option value="category">Categoria</option>
                         <option value="source">Instrumento</option>
                       </select>
                    </div>
                 </div>
              </div>
            </div>

              {/* Tabela/Cards (Visão Horizontal Compacta) */}
              <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-2">
                 {filteredAndSortedSnippets.length === 0 && (
                    <p className="text-center text-slate-400 font-bold py-8">Nenhum marcador encontrado.</p>
                 )}
                 {filteredAndSortedSnippets.map(snippet => (
                   <div key={snippet.id} className={cn("rounded-xl p-4 border flex items-center justify-between gap-4 transition-all", filterStatus === 'armazenado' ? "bg-slate-50 border-slate-200 opacity-80 mix-blend-multiply" : "bg-white border-slate-200 shadow-sm hover:border-slate-300")}>
                      
                      {/* Lado Esquerdo 80% */}
                      <div className="flex-1 min-w-0 pr-4 border-r border-slate-100">
                         <div className="flex items-center gap-2 mb-1">
                           <div className={cn(
                             "w-2.5 h-2.5 rounded-full shrink-0",
                             snippet.category === 'demandas' ? 'bg-red-500' :
                             snippet.category === 'contexto' ? 'bg-blue-500' :
                             snippet.category === 'potencialidades' ? 'bg-green-500' :
                             'bg-yellow-500'
                           )} />
                           <p className="text-sm font-medium text-slate-800 line-clamp-2 truncate whitespace-normal leading-snug">"{snippet.text}"</p>
                         </div>
                         <p className="text-[10px] font-bold text-slate-400 pl-4 uppercase tracking-widest">Origem: {snippet.instrument_source}</p>
                      </div>
                      
                      {/* Lado Direito (Ações Compactas) */}
                      <div className="flex items-center gap-3 shrink-0">
                         {filterStatus === 'ativo' ? (
                           <>
                             <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                               {(['demandas', 'contexto', 'potencialidades', 'duvida'] as const).map(cat => (
                                  <button
                                    key={cat}
                                    onClick={() => handleChangeCategory(snippet.id, cat)}
                                    title={`Mudar para ${cat}`}
                                    className={cn(
                                       "w-6 h-6 rounded-md flex items-center justify-center transition-all",
                                       snippet.category === cat ? (
                                          cat === 'demandas' ? 'bg-red-100' :
                                          cat === 'contexto' ? 'bg-blue-100' :
                                          cat === 'potencialidades' ? 'bg-green-100' : 'bg-yellow-100'
                                       ) : "hover:bg-slate-200"
                                    )}
                                  >
                                    <div className={cn(
                                      "w-3 h-3 rounded-full",
                                      cat === 'demandas' ? 'bg-red-500' :
                                      cat === 'contexto' ? 'bg-blue-500' :
                                      cat === 'potencialidades' ? 'bg-green-500' : 'bg-yellow-500'
                                    )} />
                                  </button>
                               ))}
                             </div>
                             
                             <button
                               onClick={() => handleUpdateSnippetStatus(snippet.id, 'armazenado')}
                               className="w-8 h-8 shrink-0 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg flex items-center justify-center transition-all"
                               title="Arquivar marcador no cofre"
                             >
                                <Archive size={16} />
                             </button>
                           </>
                         ) : (
                           <>
                             <button
                               onClick={() => handleUpdateSnippetStatus(snippet.id, 'ativo')}
                               className="px-3 py-1.5 shrink-0 bg-white border border-slate-200 text-slate-500 hover:bg-primary hover:text-white hover:border-primary rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm"
                               title="Restaurar para a lista principal"
                             >
                                <RefreshCcw size={14} /> Restaurar
                             </button>
                             <button
                               onClick={() => handleDeleteSnippet(snippet.id)}
                               className="w-8 h-8 shrink-0 bg-white text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500 border border-slate-200 shadow-sm rounded-lg flex items-center justify-center transition-all"
                               title="Excluir Definitivamente"
                             >
                                <Trash2 size={14} />
                             </button>
                           </>
                         )}
                      </div>
                   </div>
                 ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
