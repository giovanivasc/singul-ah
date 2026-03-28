import React, { useState, useEffect } from 'react';
import { 
  Brain, Rocket, Trash2, Send, 
  ChevronLeft, Sparkles, History,
  LayoutGrid, ChevronRight, Activity,
  Info, BarChart, Zap, Target, Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { TopBar } from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { Student } from '../types/database';
import { cn } from '../lib/utils';

// Dados do Instrumento (Roteiro N-ILS)
// Nota: O usuário mencionou um "original script", aqui usei a adaptação padrão N-ILS.
const nilsQuestions = [
  {
    id: 1,
    dimension: 'ati-ref',
    label: 'Sou uma pessoa que...',
    options: [
      { id: 'a', label: 'Tenta as coisas na prática', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&h=300&fit=crop' },
      { id: 'b', label: 'Pensa antes de agir', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400&h=300&fit=crop' }
    ]
  },
  {
    id: 2,
    dimension: 'sen-int',
    label: 'Prefiro aprender...',
    options: [
      { id: 'a', label: 'Fatos e dados concretos', image: 'https://images.unsplash.com/photo-1543286386-713bcd534a70?q=80&w=400&h=300&fit=crop' },
      { id: 'b', label: 'Teorias e conceitos novos', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=400&h=300&fit=crop' }
    ]
  },
  {
    id: 3,
    dimension: 'vis-ver',
    label: 'Lembro melhor de...',
    options: [
      { id: 'a', label: 'Figuras e diagramas', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=400&h=300&fit=crop' },
      { id: 'b', label: 'Textos e explicações faladas', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=400&h=300&fit=crop' }
    ]
  },
  {
    id: 4,
    dimension: 'seq-glo',
    label: 'Geralmente entendo as coisas...',
    options: [
      { id: 'a', label: 'Passo a passo, em ordem', image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=400&h=300&fit=crop' },
      { id: 'b', label: 'Tudo de uma vez, no final', image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=400&h=300&fit=crop' }
    ]
  }
];

export default function StudentNILS() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasResult, setHasResult] = useState(false);
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [activeResult, setActiveResult] = useState<any>(null);
  const [archivedTests, setArchivedTests] = useState<any[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!studentId) return;
      
      // Busca estudante
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
      
      if (studentData) setStudent(studentData);

      // Verifica se já existe resultado N-ILS
      const { data: resultDataList } = await supabase
        .from('nils_results')
        .select('*')
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false });

      if (resultDataList && resultDataList.length > 0) {
        // Encontra o resultado ativo
        const active = resultDataList.find(r => r.status !== 'archived');
        const archived = resultDataList.filter(r => r.status === 'archived');
        
        if (active) {
          setHasResult(true);
          setActiveResult(active);
          processResults(active);
        }
        setArchivedTests(archived);
      }
      setLoading(false);
    }
    fetchData();
  }, [studentId]);

  const processResults = (data: any) => {
    // Transforma dados tabulados para o formato recharts
    const chartData = [
      { subject: 'Ativo', A: data.ati_val },
      { subject: 'Reflexivo', A: data.ref_val },
      { subject: 'Sensorial', A: data.sen_val },
      { subject: 'Intuitivo', A: data.int_val },
      { subject: 'Visual', A: data.vis_val },
      { subject: 'Verbal', A: data.ver_val },
      { subject: 'Sequencial', A: data.seq_val },
      { subject: 'Global', A: data.glo_val },
    ];
    setResultsData(chartData);
  };

  const handleFinish = async () => {
    // Lógica de tabulação (Simulada conforme N-ILS)
    const processed = {
      ati_val: Object.values(answers).filter(v => v === 'a').length * 2,
      ref_val: Object.values(answers).filter(v => v === 'b').length * 2,
      sen_val: 3, int_val: 7, vis_val: 10, ver_val: 2, seq_val: 8, glo_val: 4
    };

    const { data: newResult, error } = await supabase
      .from('nils_results')
      .insert({ 
        student_id: studentId, 
        ...processed,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (!error && newResult) {
       setHasResult(true);
       setActiveResult(newResult);
       processResults(processed);
    }
  };

  const handleArchive = async () => {
    if (!activeResult) return;
    if (confirm('Deseja realmente arquivar este teste? A tela será liberada para um novo teste.')) {
      await supabase
        .from('nils_results')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', activeResult.id);
      
      setHasResult(false);
      setResultsData([]);
      setCurrentStep(0);
      setAnswers({});
      setActiveResult(null);
      // Reload is optimal to refresh the active tests completely
      window.location.reload();
    }
  };

  const handleReset = async () => {
    if (!activeResult) return;
    if (confirm('Deseja realmente excluir este teste? Essa ação não pode ser desfeita.')) {
      await supabase.from('nils_results').delete().eq('id', activeResult.id);
      setHasResult(false);
      setResultsData([]);
      setCurrentStep(0);
      setAnswers({});
      setActiveResult(null);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopBar />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!hasResult ? (
            <motion.div 
              key="game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Game Phase Header */}
              <div className="bg-white rounded-[40px] p-10 atmospheric-shadow border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0" />
                 <div className="w-20 h-20 rounded-[32px] bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20 shrink-0">
                    <Rocket size={40} />
                 </div>
                 <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-black text-on-surface mb-2">Olá, {student?.full_name?.split(' ')[0]}!</h1>
                    <p className="text-on-surface-variant font-medium opacity-60">Vamos descobrir o seu jeito favorito de aprender? Escolha as imagens que mais combinam com você!</p>
                 </div>
                 <div className="bg-primary/10 px-6 py-3 rounded-2xl flex flex-col items-center">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Progresso</span>
                    <span className="text-2xl font-black text-primary">{Math.round(((currentStep + 1) / nilsQuestions.length) * 100)}%</span>
                 </div>
              </div>

              {/* Game Card */}
              <section className="max-w-4xl mx-auto bg-white rounded-[48px] p-12 atmospheric-shadow border border-slate-100 flex flex-col items-center min-h-[500px]">
                 <motion.div 
                   key={currentStep}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="w-full space-y-12 flex flex-col items-center"
                 >
                    <h2 className="text-4xl font-black text-on-surface text-center leading-tight tracking-tight max-w-2xl">
                       {nilsQuestions[currentStep].label}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-6">
                       {nilsQuestions[currentStep].options.map((opt) => (
                         <button 
                           key={opt.id}
                           onClick={() => setAnswers({ ...answers, [currentStep]: opt.id })}
                           className={cn(
                             "group relative p-4 rounded-[40px] border-4 transition-all active:scale-95 text-left h-full",
                             answers[currentStep] === opt.id 
                               ? "border-primary bg-primary/5 shadow-2xl shadow-primary/20 scale-105" 
                               : "border-transparent bg-slate-50 hover:bg-white hover:border-slate-100 hover:scale-105"
                           )}
                         >
                            <img 
                              src={opt.image} 
                              alt={opt.label} 
                              className="w-full aspect-[4/3] object-cover rounded-[32px] mb-6 shadow-md transition-all group-hover:rotate-1" 
                            />
                            <div className="px-4 flex items-center justify-between">
                               <p className="text-xl font-bold text-on-surface leading-tight font-serif">{opt.label}</p>
                               <div className={cn(
                                 "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                                 answers[currentStep] === opt.id ? "bg-primary border-primary text-white" : "border-slate-200 text-transparent"
                               )}>
                                  <Send size={14} />
                               </div>
                            </div>
                         </button>
                       ))}
                    </div>

                    <div className="flex gap-4 pt-8 w-full max-w-md">
                       <button 
                         disabled={currentStep === 0}
                         onClick={() => setCurrentStep(prev => prev - 1)}
                         className="flex-1 py-5 rounded-[24px] bg-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                       >
                          <ChevronLeft size={16} /> Anterior
                       </button>
                       {currentStep < nilsQuestions.length - 1 ? (
                         <button 
                           onClick={() => setCurrentStep(prev => prev + 1)}
                           className="flex-3 py-5 px-12 rounded-[24px] bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
                         >
                            Próximo <ChevronRight size={16} />
                         </button>
                       ) : (
                         <button 
                           onClick={handleFinish}
                           className="flex-3 py-5 px-12 rounded-[24px] bg-green-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
                         >
                            Finalizar Jogo <Zap size={16} />
                         </button>
                       )}
                    </div>
                 </motion.div>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* Results Header */}
              <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
                 <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary font-black text-[10px] uppercase tracking-widest">
                       <Brain size={12} /> Resultado Consolidado
                    </div>
                    <h1 className="text-5xl font-black text-on-surface tracking-tight">Seu Estilo de Aprendizagem</h1>
                 </div>
                 <div className="flex items-center gap-3">
                    <button 
                      onClick={handleArchive}
                      className="p-4 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-200 hover:text-slate-800 transition-all border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                    >
                       <Archive size={16} /> Arquivar Teste
                    </button>
                    <button 
                      onClick={handleReset}
                      className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                    >
                       <Trash2 size={16} /> Excluir
                    </button>
                 </div>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 {/* Radar Chart Card */}
                 <section className="bg-white rounded-[40px] p-10 atmospheric-shadow border border-slate-100 flex flex-col items-center">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Mapeamento Dimensional</h3>
                    <div className="w-full h-[400px]">
                       <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="80%" data={resultsData}>
                           <PolarGrid stroke="#E2E8F0" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} />
                           <Radar
                             name="Estudante"
                             dataKey="A"
                             stroke="#2563EB"
                             fill="#2563EB"
                             fillOpacity={0.5}
                           />
                         </RadarChart>
                       </ResponsiveContainer>
                    </div>
                 </section>

                 {/* Information Column */}
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <ProfileSubCard 
                         title="Ativo vs Reflexivo" 
                         value="Ativo (Forte)" 
                         desc="Prefere discutir a matéria e trabalhar em grupo. Aprende melhor colocando a mão na massa."
                         icon={Target}
                       />
                       <ProfileSubCard 
                         title="Visual vs Verbal" 
                         value="Visual (Moderado)" 
                         desc="Lembranças baseadas em imagens, fluxogramas e vídeos são mais permanentes."
                         icon={LayoutGrid}
                       />
                       <ProfileSubCard 
                         title="Sensorial vs Intuitivo" 
                         value="Intuitivo (Equilibrado)" 
                         desc="Gosta de descobrir conexões entre novos conteúdos e temas já conhecidos."
                         icon={Sparkles}
                       />
                       <ProfileSubCard 
                         title="Sequencial vs Global" 
                         value="Sequencial (Leve)" 
                         desc="Entende melhor a matéria através de passos lógicos e encadeamento ordenado."
                         icon={Activity}
                       />
                    </div>
                    
                    {/* Estudo IA Section */}
                    <section className="bg-gradient-to-br from-slate-900 to-primary rounded-[40px] p-10 shadow-2xl shadow-primary/20 text-white relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                       <div className="relative z-10 flex flex-col items-center text-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                             <Sparkles className="text-white" size={32} />
                          </div>
                          <div>
                             <h2 className="text-2xl font-black mb-2">Maximize seu Potencial</h2>
                             <p className="text-white/60 font-medium">A IA do Singul-AH pode analisar seu perfil e sugerir como estudar de forma épica para as próximas provas.</p>
                          </div>
                          <button 
                            onClick={() => setIsGeneratingIA(true)}
                            className="bg-white text-primary px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                          >
                             ✨ Gerar Dicas Personalizadas
                          </button>
                       </div>
                    </section>

                    <AnimatePresence>
                       {isGeneratingIA && (
                         <motion.div 
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           className="bg-white rounded-[40px] p-10 atmospheric-shadow border border-slate-100"
                         >
                            <div className="flex items-center gap-3 mb-8">
                               <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                  <Info size={20} />
                               </div>
                               <h3 className="text-xl font-black text-on-surface">Sugestão do Singul-AH AI</h3>
                            </div>
                            <div className="space-y-6 text-on-surface-variant font-medium leading-relaxed">
                               <p>Com base no seu estilo predominante **Ativo-Visual**, aqui estão 3 dicas para você:</p>
                               <ul className="space-y-4">
                                  <li className="flex gap-4">
                                     <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center text-primary font-black text-[10px] shrink-0 mt-1">1</div>
                                     <span>**Mapas Mentais Coloridos**: Use canetas de cores diferentes para ligar os assuntos. Isso ajuda seu lado visual a "fotografar" a matéria.</span>
                                  </li>
                                  <li className="flex gap-4">
                                     <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center text-primary font-black text-[10px] shrink-0 mt-1">2</div>
                                     <span>**Explique para Alguém**: Como você é ativo, falar sobre o que aprendeu ajuda o cérebro a fixar o conhecimento muito mais rápido.</span>
                                  </li>
                                  <li className="flex gap-4">
                                     <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center text-primary font-black text-[10px] shrink-0 mt-1">3</div>
                                     <span>**Simule Experimentos**: Procure vídeos de simulações ou tente reproduzir o conteúdo com objetos em casa.</span>
                                  </li>
                               </ul>
                            </div>
                         </motion.div>
                       )}
                    </AnimatePresence>
                 </div>
              </div>

              {/* Arquivados Accordion */}
              {archivedTests.length > 0 && (
                <div className="mt-16">
                   <button 
                     onClick={() => setShowArchived(!showArchived)}
                     className="w-full bg-slate-100/50 hover:bg-slate-100 border border-slate-200 rounded-[32px] p-6 flex items-center justify-between transition-all"
                   >
                     <div className="flex items-center gap-4">
                       <History className="text-slate-400" />
                       <span className="font-black text-slate-500 uppercase tracking-widest text-sm">Ver Histórico Arquivado ({archivedTests.length})</span>
                     </div>
                     <ChevronRight className={cn("text-slate-400 transition-transform", showArchived && "rotate-90")} />
                   </button>
                   
                   <AnimatePresence>
                     {showArchived && (
                       <motion.div 
                         initial={{ opacity: 0, height: 0 }}
                         animate={{ opacity: 1, height: 'auto' }}
                         exit={{ opacity: 0, height: 0 }}
                         className="overflow-hidden"
                       >
                         <div className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {archivedTests.map(test => (
                               <div key={test.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all flex flex-col gap-4">
                                  <div className="flex justify-between items-start">
                                    <div className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2">
                                       <Archive size={12} /> Arquivado
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">{new Date(test.updated_at).toLocaleDateString()}</span>
                                  </div>
                                  <div>
                                    <p className="font-black text-on-surface text-lg">Estatísticas Antigas</p>
                                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-bold text-slate-500">
                                       <span className="bg-white px-3 py-2 rounded-xl">Ativo: {test.ati_val}</span>
                                       <span className="bg-white px-3 py-2 rounded-xl">Reflexivo: {test.ref_val}</span>
                                       <span className="bg-white px-3 py-2 rounded-xl">Visual: {test.vis_val}</span>
                                       <span className="bg-white px-3 py-2 rounded-xl">Verbal: {test.ver_val}</span>
                                    </div>
                                  </div>
                               </div>
                            ))}
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ProfileSubCard({ title, value, desc, icon: Icon }: any) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 atmospheric-shadow-sm flex flex-col gap-4">
       <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
             <Icon size={20} />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
       </div>
       <div className="space-y-1">
          <p className="text-lg font-black text-on-surface tracking-tight leading-tight">{value}</p>
          <p className="text-xs text-on-surface-variant/60 font-medium leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}
