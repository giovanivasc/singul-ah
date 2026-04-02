import React, { useState, useEffect } from 'react';
import { 
  Brain, Sparkles, Database, Loader2, ArrowRight, Activity,
  Users, ShieldCheck, Plus, Highlighter, X, CheckCircle2, Info,
  Maximize2, Trash2, Archive, RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from '../components/Navigation';
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

type AxisItem = { id: string; text: string; selected: boolean; isManual: boolean; isNew?: boolean; };
type HighlightSnippet = { id: string; text: string; category: 'demandas' | 'contexto' | 'potencialidades' | 'duvida'; source: string; status?: 'ativo' | 'armazenado' };
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

const mockIaResponse: Record<string, AxisItem[]> = {
  I: [
    { id: '1', text: 'Forte resistência em tarefas repetitivas e necessidade de previsibilidade.', selected: true, isManual: false },
    { id: '2', text: 'Sobrecarga sensorial em ambientes muito ruidosos da escola convencional.', selected: true, isManual: false }
  ],
  II: [
    { id: '3', text: 'Especificidade no ambiente de sala de aula regular em contraste com o AEE.', selected: true, isManual: false },
    { id: '4', text: 'Barreiras Atitudinais: expectativas rígidas quanto ao método de estudo.', selected: true, isManual: false },
    { id: '5', text: 'Barreiras de Comunicação/Informação: instruções longas que causam fadiga atencional.', selected: true, isManual: false }
  ],
  III: [
    { id: '6', text: 'Vocabulário avançado para idade, raciocínio espacial muito acima da média.', selected: true, isManual: false },
    { id: '7', text: 'Estilos N-ILS: Visual, Global.', selected: true, isManual: false },
    { id: '8', text: 'Hiperfoco em Astronomia.', selected: true, isManual: false }
  ],
  IV: [
    { id: '9', text: 'Fragmentação de tarefas com marcadores visuais (Combate à barreira de comunicação).', selected: true, isManual: false },
    { id: '10', text: 'Liberação pontual para uso de fones abafadores (Combate à barreira sensorial).', selected: true, isManual: false },
    { id: '11', text: 'Inserção de escolhas múltiplas de resolução em exames.', selected: true, isManual: false }
  ]
};

export default function ConvergenceEditor() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  
  // Left Column States
  const [readingSource, setReadingSource] = useState<DataSource | null>(null);
  const [snippets, setSnippets] = useState<HighlightSnippet[]>([]);
  const [isSnippetsExpanded, setIsSnippetsExpanded] = useState(false);
  
  // Generation & Right Column States
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<'I' | 'II' | 'III' | 'IV'>('I');
  const [manualInput, setManualInput] = useState('');
  const [axisData, setAxisData] = useState<Record<string, AxisItem[]>>({
    I: [], II: [], III: [], IV: []
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
        if (parsed.axisData) {
          setAxisData(parsed.axisData);
          if (Object.keys(parsed.axisData).some(k => parsed.axisData[k].length > 0)) {
            setHasGenerated(true);
          }
        }
        if (parsed.lastConsolidation) setLastConsolidation(parsed.lastConsolidation);
      } catch (e) {
        console.error("Erro ao carregar mapeamento local", e);
      }
    }

    // Carregador específico para marcadores (Snippet Array Raw)
    const savedSnippets = localStorage.getItem('snippets_student_' + studentId);
    if (savedSnippets) {
      try {
        setSnippets(JSON.parse(savedSnippets));
      } catch (e) {
        console.error("Erro ao carregar snippets", e);
      }
    } else if (savedMap) {
       // Fallback se não existir novo localStorage tenta resgatar do antigo (retrocompatibilidade)
       try {
         const parsed = JSON.parse(savedMap);
         if (parsed.snippets) setSnippets(parsed.snippets);
       } catch (e) {}
    }
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

  const availableSources = Array.from(new Set(snippets.map(s => s.source)));

  const filteredAndSortedSnippets = snippets
    .filter(s => (s.status || 'ativo') === filterStatus)
    .filter(s => filterCategory === 'all' || s.category === filterCategory)
    .filter(s => filterSource === 'all' || s.source === filterSource)
    .sort((a, b) => {
       if (sortBy === 'category') return a.category.localeCompare(b.category);
       if (sortBy === 'source') return a.source.localeCompare(b.source);
       return Number(b.id) - Number(a.id);
    });

  const handleHighlight = (category: 'demandas' | 'contexto' | 'potencialidades' | 'duvida') => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && readingSource) {
      setSnippets(prev => [...prev, {
        id: Date.now().toString(),
        text: selection,
        category,
        source: readingSource.title,
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
      
      setAxisData(prev => {
        const newData = { ...prev };
        for (const axis of ['I', 'II', 'III', 'IV']) {
          const existingItems = newData[axis] ? newData[axis].map(i => ({ ...i, isNew: false })) : [];
          const newItems = (mockIaResponse[axis] || [])
            .filter(newItem => !existingItems.some(existing => existing.text.toLowerCase().trim() === newItem.text.toLowerCase().trim()))
            .map(i => ({ ...i, id: Date.now().toString() + Math.random().toString().slice(2, 6), isNew: true, selected: true }));
          newData[axis] = [...existingItems, ...newItems];
        }
        
        if (studentId) {
          const saved = localStorage.getItem(`mapeamento_data_${studentId}`);
          const parsed = saved ? JSON.parse(saved) : {};
          parsed.axisData = newData;
          parsed.lastConsolidation = now;
          parsed.snippets = snippets;
          localStorage.setItem(`mapeamento_data_${studentId}`, JSON.stringify(parsed));
        }
        return newData;
      });

      setHasGenerated(true);
      setIsGenerating(false);
      setLastConsolidation(now);
    }, 3000);
  };

  const handleAddManualItem = () => {
    if (manualInput.trim()) {
      const newItem: AxisItem = {
        id: Date.now().toString(),
        text: manualInput.trim(),
        selected: true,
        isManual: true
      };
      setAxisData(prev => {
        const newData = { ...prev, [activeTab]: [...(prev[activeTab] || []), newItem] };
        
        // Auto-save manual item
        if (studentId) {
          const saved = localStorage.getItem(`mapeamento_data_${studentId}`);
          const parsed = saved ? JSON.parse(saved) : {};
          parsed.axisData = newData;
          localStorage.setItem(`mapeamento_data_${studentId}`, JSON.stringify(parsed));
        }
        
        return newData;
      });
      setManualInput('');
    }
  };

  const handleApproveAndProceed = () => {
    setShowToast(true);
    setTimeout(() => {
       navigate(`/students/${studentId}`);
    }, 1500);
  };

  const renderHighlightedText = (text: string, sourceTitle: string) => {
    if (!text) return null;
    let renderedContent = text;
    const validSnippets = snippets.filter(s => s.source === sourceTitle);
    const sortedSnippets = [...validSnippets].sort((a,b) => b.text.length - a.text.length);
    const placeholders: {placeholder: string, jsx: React.ReactNode}[] = [];
    
    sortedSnippets.forEach((snippet, idx) => {
      const placeholder = `__SNIP_${idx}__`;
      const bgColor = snippet.category === 'demandas' ? 'bg-red-200' :
                      snippet.category === 'contexto' ? 'bg-blue-200' :
                      snippet.category === 'potencialidades' ? 'bg-green-200' :
                      'bg-yellow-200';
                      
      const opacityClass = snippet.status === 'armazenado' ? 'opacity-50 grayscale' : 'opacity-80 text-slate-800';

      placeholders.push({
        placeholder, 
        jsx: <mark key={snippet.id} className={`${bgColor} ${opacityClass} px-1 rounded`}>{snippet.text}</mark>
      });
      renderedContent = renderedContent.split(snippet.text).join(placeholder);
    });

    const parts = renderedContent.split(/(__SNIP_\d+__)/g);
    return parts.map((part, i) => {
      const ph = placeholders.find(p => p.placeholder === part);
      if (ph) return ph.jsx;
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col relative">
      <TopBar title="Consolidação do Estudo de Caso" />
      
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
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* COLUNA ESQUERDA: Fontes de Dados e Snippets */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
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
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
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
                   {/* Tabs / Abas */}
                   <div className="flex items-center justify-center gap-4 my-8 pb-2 border-b border-transparent">
                     {[
                       { id: 'I', label: 'I. Demandas' },
                       { id: 'II', label: 'II. Contexto' },
                       { id: 'III', label: 'III. Potencialidades/Interesses' },
                       { id: 'IV', label: 'IV. Ponte PEI' },
                     ].map(tab => (
                       <button
                         key={tab.id}
                         onClick={() => setActiveTab(tab.id as 'I' | 'II' | 'III' | 'IV')}
                         className={cn(
                           "px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap border",
                           activeTab === tab.id 
                             ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                             : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                         )}
                       >
                         {tab.label}
                       </button>
                     ))}
                   </div>

                   {/* Conteúdo da Aba Ativa */}
                   <div className="bg-white p-8 rounded-[32px] border border-slate-100 atmospheric-shadow animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100">
                         <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0">{activeTab}</div>
                         <div>
                           <h3 className="text-lg font-black text-on-surface uppercase tracking-tight">
                             {activeTab === 'I' && 'Demandas Biopsicossociais e Barreiras'}
                             {activeTab === 'II' && 'Análise do Contexto Escolar (LBI)'}
                             {activeTab === 'III' && 'Potencialidades, Interesses e Apoio'}
                             {activeTab === 'IV' && 'Pontes para o PEI'}
                           </h3>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                             {activeTab === 'I' && 'Identificação Inicial (Decreto 12.686/2025)'}
                             {activeTab === 'II' && 'Tipificação legal das barreiras'}
                             {activeTab === 'III' && 'Mapeamento como via de acesso pedagógico'}
                             {activeTab === 'IV' && 'Recursos de minimização de barreiras (Acessibilidade)'}
                           </p>
                         </div>
                      </div>

                      <div className="space-y-3 mb-8">
                        {axisData[activeTab]?.map(item => (
                          <div 
                            key={item.id}
                            onClick={() => {
                              setAxisData(prev => {
                                const newData = {
                                  ...prev,
                                  [activeTab]: prev[activeTab].map(i => 
                                    i.id === item.id ? { ...i, selected: !i.selected } : i
                                  )
                                };
                                if (studentId) {
                                  const saved = localStorage.getItem(`mapeamento_data_${studentId}`);
                                  const parsed = saved ? JSON.parse(saved) : {};
                                  parsed.axisData = newData;
                                  localStorage.setItem(`mapeamento_data_${studentId}`, JSON.stringify(parsed));
                                }
                                return newData;
                              });
                            }}
                            className={cn(
                              "flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group relative",
                              item.isNew && "bg-blue-50 border-blue-200",
                              !item.isNew && item.selected && "border-primary bg-primary/5",
                              !item.isNew && !item.selected && "border-slate-100 bg-white hover:border-slate-300"
                            )}
                          >
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors mt-0.5",
                              item.selected ? "bg-primary text-white" : "border-2 border-slate-300 group-hover:border-slate-400"
                            )}>
                              {item.selected && <CheckCircle2 size={14} />}
                            </div>
                            <span className={cn(
                              "text-sm font-semibold leading-relaxed flex-1",
                              item.selected ? "text-slate-900" : "text-slate-500 line-through opacity-60"
                            )}>
                              {item.text}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                               {item.isNew && (
                                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-100 px-2 py-1 rounded-md shadow-sm">
                                    Novo
                                  </span>
                               )}
                               {item.isManual && (
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                                    Manual
                                  </span>
                               )}
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setAxisData(prev => {
                                      const newData = {
                                        ...prev,
                                        [activeTab]: prev[activeTab].filter(i => i.id !== item.id)
                                      };
                                      if (studentId) {
                                        const saved = localStorage.getItem(`mapeamento_data_${studentId}`);
                                        const parsed = saved ? JSON.parse(saved) : {};
                                        parsed.axisData = newData;
                                        localStorage.setItem(`mapeamento_data_${studentId}`, JSON.stringify(parsed));
                                      }
                                      return newData;
                                   });
                                 }}
                                 className="text-slate-300 hover:text-red-500 hover:bg-red-50 w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                                 title="Excluir Definitivamente"
                               >
                                  <X size={16} />
                               </button>
                            </div>
                          </div>
                        ))}
                        {(!axisData[activeTab] || axisData[activeTab].length === 0) && (
                          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                             <p className="text-sm font-bold text-slate-400">Nenhum item mapeado nesta área.</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={manualInput}
                          onChange={(e) => setManualInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddManualItem()}
                          placeholder="Adicionar item manualmente à lista..."
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-slate-400 text-slate-700"
                        />
                        <button
                          onClick={handleAddManualItem}
                          className="bg-slate-900 text-white px-6 py-4 rounded-xl font-bold text-sm tracking-wide hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
                        >
                          <Plus size={18} />
                          <span>Adicionar</span>
                        </button>
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
                        <ShieldCheck size={14} /> Os itens selecionados de todas as abas gerarão a planta base do PEI
                      </p>
                   </motion.div>
                </motion.div>
             )}
          </AnimatePresence>
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
                 <p className="whitespace-pre-wrap">{renderHighlightedText(readingSource.content, readingSource.title)}</p>
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
                         <p className="text-[10px] font-bold text-slate-400 pl-4 uppercase tracking-widest">Origem: {snippet.source}</p>
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
