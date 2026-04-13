import React, { useState, useEffect } from 'react';
import { 
  Brain, Sparkles, Database, Loader2, ArrowRight, Activity,
  Users, ShieldCheck, Plus, Highlighter, X, CheckCircle2, Info,
  Maximize2, Trash2, Archive, RefreshCcw, ChevronLeft, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from '../components/Navigation';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';

export const SYSTEM_PROMPT_ESTUDO_CASO = `Você é um especialista em Educação Especial, Altas Habilidades/Superdotação (AH/SD) e Legislação Brasileira de Inclusão. Sua tarefa é analisar relatos brutos de diferentes fontes (Família, Prof. Regente, Prof. AEE, Estudante) e gerar a síntese do Estudo de Caso. 
REGRAS VITAIS:
1. Não force convergência se os relatos divergirem por causa do ambiente (ex: comportamento na sala regular vs. AEE). Trate isso como 'especificidade ambiental'.
2. Classifique as barreiras ESTRITAMENTE segundo a LBI: Urbanísticas, Arquitetônicas, Transportes, Comunicações/Informação, Atitudinais e Tecnológicas.
3. Retorne APENAS um objeto JSON válido. Em vez de textos corridos, retorne ARRAYS de strings curtas e objetivas:
{
  "eixo_I": ["Desmotivação nas aulas expositivas.", "Barreira atitudinal por parte dos colegas."],
  "eixo_II": ["Barreira de Comunicação: instruções longas.", "Barreira Atitudinal: rigidez de método."],
  "eixo_III": ["Vocabulário avançado para idade.", "Hiperfoco em Astronomia."],
  "eixo_IV": ["Uso de fones abafadores de ruído.", "Fragmentação de tarefas."]
}`;

import { AxisItem, HighlightSnippet } from '../types/database';
type DataSource = { id: string; title: string; subtitle: string; content: string; icon: any; colorClass: string; bgColorClass: string; };

const MOCK_SOURCES: DataSource[] = [
  {
    id: 'if-sahs',
    title: 'IF-SAHS (Família)',
    subtitle: 'Atualizado há 2 dias',
    content: 'O aluno começou a se interessar por astronomia aos 4 anos. Consegue citar todos os planetas e suas órbitas. No entanto, notamos que ele sente muita irritação em festas infantis e ambientes muito barulhentos da escola. Em casa é calmo, mas chora quando contrariado na rotina. Gosta de dinossauros também.',
    icon: Users,
    colorClass: 'text-blue-600',
    bgColorClass: 'bg-blue-100',
  },
  {
    id: 'ip-sahs',
    title: 'IP-SAHS (Matemática)',
    subtitle: 'Atualizado hoje',
    content: 'O estudante resolve problemas complexos muito rápido, mas se recusa a escrever o passo a passo (cálculos) no papel. Sente tédio com explicações longas, o que leva à desatenção e conversas paralelas. Demonstra um vocabulário extremamente rico para sua idade.',
    icon: Activity,
    colorClass: 'text-orange-600',
    bgColorClass: 'bg-orange-100',
  },
  {
    id: 'n-ils',
    title: 'N-ILS (Estilos)',
    subtitle: 'Mapeado pelo sistema',
    content: 'O aluno possui estilo de aprendizagem predominantemente Visual e Global. Precisa de uma visão do todo antes das partes e prefere mapas mentais ao invés de textos corridos e lineares. Desempenha muito bem atividades que envolvem raciocínio espacial.',
    icon: Brain,
    colorClass: 'text-purple-600',
    bgColorClass: 'bg-purple-100',
  }
];

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

const parseString = (str: string, category?: string): TopicItem[] => str.split(/(?:\. |\n)/).filter(Boolean).map(s => ({ id: crypto.randomUUID(), text: s.trim() + (s.trim().endsWith('.') ? '' : '.'), selected: true, category }));

const mockIaResponse: CaseStudySynthesis = {
  currentContext: [
    ...parseString('Desempenha bem em matérias exatas, porém apresenta lentidão em tarefas de leitura e escrita. Demonstra desmotivação nas aulas expositivas.', 'acadêmico'),
    ...parseString('Capacidade de raciocínio lógico-espacial avançada. Atenção flutuante em tarefas longas.', 'cognitivo'),
    ...parseString('Vocabulário rico para a idade, porém dificuldade em organizar narrativas escritas.', 'linguístico'),
    ...parseString('Interação restrita. Prefere brincar sozinho ou conversar com adultos sobre tópicos de interesse específico.', 'social'),
    ...parseString('Baixa tolerância à frustração. Demonstra ansiedade ao ser corrigido publicamente.', 'emocional'),
    ...parseString('Sinais de rigidez cognitiva (necessidade de previsibilidade nas rotinas).', 'psicológico'),
    ...parseString('Sensibilidade auditiva em ambientes ruidosos. Uso de fones abafadores recomendado.', 'físico')
  ],
  learningStyle: parseString('Predominantemente Visual e Ativo (Perfil N-ILS). Beneficia-se de mapas mentais e informações concretas.'),
  potentialsInterests: parseString('Alto interesse/hiperfoco em Astronomia e sistemas mecânicos. Memória prodigiosa para fatos de seu interesse.'),
  demandsBarriers: parseString('Barreira Atitudinal: rigidez de alguns professores quanto a métodos convencionais. \nBarreira de Comunicação: instruções muito longas ou apenas orais tendem a ser ignoradas.'),
  accessibilityStrategies: [
    ...parseString('Fragmentação de tarefas com listas de verificação visuais; permissão para usar mapas mentais em vez de anotações convencionais.', 'instrucional'),
    ...parseString('Uso de fones abafadores de ruído; sentar-se na frente ou extremidade da sala.', 'ambiental'),
    ...parseString('Tempo estendido para provas; possibilidade de consulta ao esquema visual autorregulado.', 'avaliação')
  ]
};

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
             <textarea aria-label="Texto" placeholder="Texto..." className={cn("resize-none overflow-hidden h-auto w-full bg-transparent text-sm focus:outline-none transition-all leading-relaxed", !t.selected && "line-through text-slate-400")} onInput={(e) => { e.currentTarget.style.height = 'auto'; e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; }} value={t.text} onChange={e => onChange(safeTopics.map(p => p.id === t.id ? {...p, text: e.target.value} : p))} rows={1}/>
           </div>
           <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 ml-8 sm:ml-0 mt-2 sm:mt-0">
             {categories && (
                <select value={t.category || ''} onChange={(e) => onChange(safeTopics.map(p => p.id === t.id ? {...p, category: e.target.value} : p))} className={cn("text-[10px] uppercase tracking-widest font-bold rounded-lg px-2 py-1.5 outline-none cursor-pointer appearance-none text-center", cat ? cat.colorClass : "bg-slate-100 text-slate-600")}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
             )}
             <button aria-label="Remover" onClick={() => onChange(safeTopics.filter(p => p.id !== t.id))} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg shrink-0"><Trash2 size={16}/></button>
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
  const [readingSource, setReadingSource] = useState<DataSource | null>(null);
  const [snippets, setSnippets] = useState<HighlightSnippet[]>(() => {
    const saved = localStorage.getItem(`snippets_student_${studentId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isSnippetsExpanded, setIsSnippetsExpanded] = useState(false);
  
  // Generation & Right Column States
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  const [activeTabMapping, setActiveTabMapping] = useState<'contexto' | 'estilos' | 'potencialidades' | 'demandas' | 'adaptacoes'>('contexto');

  const [caseStudySynthesis, setCaseStudySynthesis] = useState<CaseStudySynthesis>({
    currentContext: [],
    learningStyle: [],
    potentialsInterests: [],
    demandsBarriers: [],
    accessibilityStrategies: []
  });
  const [lastConsolidation, setLastConsolidation] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Carregar do LocalStorage
  useEffect(() => {
    if (!studentId) return;
    
    // Carregar mapeamento via chave antiga
    const savedMap = localStorage.getItem(`mapeamento_data_${studentId}`);
    if (savedMap) {
      try {
        const parsed = JSON.parse(savedMap);
        if (parsed.caseStudySynthesis) {
          setCaseStudySynthesis(parsed.caseStudySynthesis);
          setHasGenerated(true);
        }
        if (parsed.lastConsolidation) setLastConsolidation(parsed.lastConsolidation);
      } catch (e) {
        console.error("Erro ao carregar mapeamento local", e);
      }
    }

    // A inicialização dos marcadores agora é feita de forma "Eager" (tardia) direto no useState,
    // então removemos a lógica com useEffect para evitar sobrescritas ou Race Conditions.
  }, [studentId]);

  // Auto-save exclusivo dos snippets (marcadores)
  useEffect(() => {
    if (!studentId) return;
    localStorage.setItem('snippets_student_' + studentId, JSON.stringify(snippets));
  }, [snippets, studentId]);

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

  const handleHighlight = (category: 'demandas' | 'contexto' | 'potencialidades' | 'duvida') => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && readingSource) {
      setSnippets(prev => [...prev, {
        id: crypto.randomUUID(),
        student_id: studentId || '',
        text: selection,
        category,
        instrument_source: readingSource.title,
        status: 'ativo'
      }]);
      window.getSelection()?.removeAllRanges();
    } else {
      alert("Por favor, selecione um trecho do texto antes de clicar no botão.");
    }
  };

  const handleChangeCategory = (id: string, newCategory: 'demandas' | 'contexto' | 'potencialidades' | 'duvida') => {
    setSnippets(prev => prev.map(s => s.id === id ? { ...s, category: newCategory } : s));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    
    let promptAddition = '';
    if (snippets.length > 0) {
      promptAddition = `\nATENÇÃO: O professor já fez uma pré-análise e destacou os seguintes pontos importantes. Certifique-se de validar e incluir estes pontos na sua análise final, convertendo-os para itens de lista curtos:\n${snippets.map(s => `- [${s.category.toUpperCase()}] ${s.text}`).join('\n')}`;
    }
    
    console.log("Enviando para IA:", SYSTEM_PROMPT_ESTUDO_CASO + promptAddition);

    // Simulating API Call to LLM
    setTimeout(() => {
      const now = new Date().toLocaleString('pt-BR');
      
      setCaseStudySynthesis(mockIaResponse);
      
      if (studentId) {
        const saved = localStorage.getItem(`mapeamento_data_${studentId}`);
        const parsed = saved ? JSON.parse(saved) : {};
        parsed.caseStudySynthesis = mockIaResponse;
        parsed.lastConsolidation = now;
        parsed.snippets = snippets;
        localStorage.setItem(`mapeamento_data_${studentId}`, JSON.stringify(parsed));
      }

      setHasGenerated(true);
      setIsGenerating(false);
      setLastConsolidation(now);
    }, 3000);
  };

  const handleTopicChange = (updater: (prev: CaseStudySynthesis) => CaseStudySynthesis) => {
    setCaseStudySynthesis(prev => {
      const updated = updater(prev);
      if (studentId) {
        const saved = localStorage.getItem(`mapeamento_data_${studentId}`);
        const parsed = saved ? JSON.parse(saved) : {};
        parsed.caseStudySynthesis = updated;
        localStorage.setItem(`mapeamento_data_${studentId}`, JSON.stringify(parsed));
      }
      return updated;
    });
  };



  const handleApproveAndProceed = () => {
    setShowToast(true);
    setTimeout(() => {
       navigate(`/students/${studentId}`);
    }, 1500);
  };

  const renderHighlightedText = (text: string, source: string) => {
    const sourceSnippets = snippets.filter(s => s.instrument_source === source && s.status !== 'armazenado');
    if (sourceSnippets.length === 0) return <div dangerouslySetInnerHTML={{ __html: text }} className="leading-relaxed whitespace-pre-wrap" />;

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

    return <div dangerouslySetInnerHTML={{ __html: resultText }} className="leading-relaxed whitespace-pre-wrap" />;
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
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
        <StudentPageHeader title="Mapeamento Assistido" studentId={studentId} />
        
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
               {MOCK_SOURCES.map(source => {
                 const Icon = source.icon;
                 return (
                   <button 
                     key={source.id}
                     onClick={() => {
                        if (source.id !== 'n-ils') setReadingSource(source);
                     }}
                     className={cn(
                       "w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors text-left",
                       source.id === 'n-ils' ? "opacity-75 cursor-default" : "group hover:border-primary/30 cursor-pointer"
                     )}
                   >
                     <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", source.bgColorClass, source.colorClass)}>
                           <Icon size={18} />
                        </div>
                        <div>
                           <p className="font-bold text-sm text-slate-700">{source.title}</p>
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                             {source.id === 'n-ils' ? '(Análise automática de Perfil)' : source.subtitle}
                           </p>
                        </div>
                     </div>
                     {source.id !== 'n-ils' && <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />}
                   </button>
                 );
               })}
            </div>

            <button 
               disabled={isGenerating}
               onClick={handleGenerate}
               className={cn(
                 "mt-auto w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95",
                 isGenerating ? "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed" : "bg-primary text-white shadow-primary/20 hover:brightness-110"
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
                    <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden atmospheric-shadow animate-in fade-in slide-in-from-bottom-4 duration-300">
                       
                       {/* Tabs Menu - Estilo Fichário */}
                       <div className="flex border-b border-slate-200 bg-slate-100 overflow-x-auto pt-2 px-2 gap-1">
                         {[
                           { id: 'contexto', label: 'Contexto Atual' },
                           { id: 'estilos', label: 'Estilos de Aprendizagem' },
                           { id: 'potencialidades', label: 'Potencialidades e Interesses' },
                           { id: 'demandas', label: 'Demandas e Barreiras' },
                           { id: 'adaptacoes', label: 'Acessibilidade' }
                         ].map(tab => (
                           <button
                             key={tab.id}
                             onClick={() => setActiveTabMapping(tab.id as typeof activeTabMapping)}
                             className={cn(
                               "px-5 py-3 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap rounded-t-xl border-t border-x",
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
                         {activeTabMapping === 'contexto' && (
                            <div className="space-y-6">
                               <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Contexto Biopsicossocial e Educacional</h3>
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
                               <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Potencialidades, Interesses e Indicadores AH/SD</h3>
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

                         {activeTabMapping === 'adaptacoes' && (
                            <div className="space-y-6">
                               <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-xl flex items-start gap-3 mb-6">
                                  <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                  <p className="text-sm font-medium text-amber-800 leading-relaxed">
                                    Presume-se que as adaptações propostas e validadas por este componente sejam as mesmas necessárias para a progressão do estudante e deverão ser formalizadas pela escola. Recomenda-se catalogar aqui para cruzamento no PEI.
                                  </p>
                               </div>
                               <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Propostas de Acessibilidade (Seção III do PEI)</h3>
                               <TopicEditorList
                                 topics={caseStudySynthesis.accessibilityStrategies}
                                 onChange={(newTopics) => handleTopicChange(prev => ({ ...prev, accessibilityStrategies: newTopics }))}
                                 placeholder="Descreva a estratégia ou recurso de apoio..."
                                 categories={ACCESSIBILITY_CATEGORIES}
                               />
                            </div>
                         )}
                       </div>
                    </div>

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
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Leitura de Relato Bruto</p>
                   </div>
                 </div>
                 <button 
                   onClick={() => setReadingSource(null)} 
                   className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                 >
                   <X size={24} />
                 </button>
              </div>

              {/* Fichamento Toolbar */}
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
                 {renderHighlightedText(readingSource.content, readingSource.title)}
                 <div className="mt-8 pt-8 border-t border-slate-100">
                    <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                       <CheckCircle2 size={16} />
                       Dica: Selecione o texto com o cursor e depois clique em um dos botões coloridos acima.
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
                               onClick={() => setSnippets(prev => prev.map(s => s.id === snippet.id ? { ...s, status: 'armazenado' } : s))}
                               className="w-8 h-8 shrink-0 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg flex items-center justify-center transition-all"
                               title="Arquivar marcador no cofre"
                             >
                                <Archive size={16} />
                             </button>
                           </>
                         ) : (
                           <>
                             <button 
                               onClick={() => setSnippets(prev => prev.map(s => s.id === snippet.id ? { ...s, status: 'ativo' } : s))}
                               className="px-3 py-1.5 shrink-0 bg-white border border-slate-200 text-slate-500 hover:bg-primary hover:text-white hover:border-primary rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm"
                               title="Restaurar para a lista principal"
                             >
                                <RefreshCcw size={14} /> Restaurar
                             </button>
                             <button 
                               onClick={() => { if(confirm("Deseja realmente apagar este registro em definitivo?")) setSnippets(prev => prev.filter(s => s.id !== snippet.id)); }}
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
