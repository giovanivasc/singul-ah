import re

with open("src/pages/CaseStudy.tsx", "r") as f:
    text = f.read()

# Extract 'filling' view
filling_match = re.search(r"(\{view === 'filling' && \(.*?\)\})", text, re.DOTALL)
filling_code = filling_match.group(1) if filling_match else ""

# Extract 'consolidation' view
consolidation_match = re.search(r"(\{view === 'consolidation' && \(.*?\)\})", text, re.DOTALL)
consolidation_code = consolidation_match.group(1) if consolidation_match else ""

# Extract 'versions' view
versions_match = re.search(r"(\{view === 'versions' && \(.*?\)\})", text, re.DOTALL)
versions_code = versions_match.group(1) if versions_match else ""

new_content = """import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ClipboardList, Brain, PencilRuler, 
  ChevronLeft, CheckCircle2, Send, 
  Clock, User as UserIcon, Plus, 
  Sparkles, ShieldCheck, LayoutGrid,
  FileText, Activity, Users, Info,
  MessageSquare, History, Wand2, TrendingUp,
  Percent, Eye, Trash2, Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { Student } from '../types/database';
import { MultimodalInput } from '../components/MultimodalInput';
import { cn } from '../lib/utils';

type ViewState = 'hub' | 'details' | 'filling' | 'consolidation' | 'versions';

interface InstrumentStatus {
  id: string;
  name: string;
  description: string;
  icon: any;
  versions: number;
  lastUpdate?: string;
  lastPerson?: string;
  completionPercentage?: number;
  status: 'pending' | 'completed' | 'ongoing';
  allowExternalLink?: boolean;
}

export default function CaseStudy() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>('hub');
  const [activeInstrumentId, setActiveInstrumentId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudent() {
      if (!studentId) return;
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
      
      if (data) setStudent(data);
      setLoading(false);
    }
    fetchStudent();
  }, [studentId]);

  const instruments: InstrumentStatus[] = [
    { 
      id: 'IF-SAHS', 
      name: 'Inventário Familiar para Suplementação (IF-SAHS)', 
      description: 'Coleta de dados biopsicossociais com a família.', 
      icon: Users,
      versions: 1,
      lastUpdate: '25/03/2024',
      lastPerson: 'Prof. Maria Silva',
      completionPercentage: 100,
      status: 'completed',
      allowExternalLink: true
    },
    { 
      id: 'IP-SAHS', 
      name: 'Inventário Pedagógico (IP-SAHS)', 
      description: 'Observação pedagógica e funcional do professor.', 
      icon: Activity,
      versions: 0,
      completionPercentage: 0,
      status: 'pending',
      allowExternalLink: false
    },
    { 
      id: 'ENTREVISTA', 
      name: 'Entrevista com Estudante', 
      description: 'Escuta especializada das demandas do estudante.', 
      icon: MessageSquare,
      versions: 0,
      completionPercentage: 0,
      status: 'pending',
      allowExternalLink: false
    },
    { 
      id: 'N-ILS', 
      name: 'N-ILS (Estilos de Aprendizagem)', 
      description: 'Mapeamento de estilos e habilidades de aprendizagem.', 
      icon: Brain,
      versions: 2,
      lastUpdate: 'Ontem',
      lastPerson: 'Sistema (IA)',
      completionPercentage: 100,
      status: 'completed',
      allowExternalLink: true
    },
    {
      id: 'DOC-ANALISE',
      name: 'Análise de Pareceres (IA)',
      description: 'Envie laudos e relatórios para processamento da inteligência artificial.',
      icon: FileText,
      versions: 0,
      completionPercentage: 0,
      status: 'pending',
      allowExternalLink: false
    }
  ];

  const activeInstrument = instruments.find(i => i.id === activeInstrumentId);

  const handleInstrumentAction = (action: 'fill' | 'view') => {
    if (!activeInstrument) return;
    
    // Rotas externas
    if (activeInstrument.id === 'IP-SAHS') {
      navigate(`/students/${studentId}/ip-sahs`);
      return;
    }
    if (activeInstrument.id === 'ENTREVISTA') {
      navigate(`/students/${studentId}/interview`);
      return;
    }
    if (activeInstrument.id === 'N-ILS') {
      navigate(`/students/${studentId}/n-ils`);
      return;
    }

    // Rotas internas deste componente
    if (action === 'fill') setView('filling');
    if (action === 'view') setView('versions');
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopBar />
      
      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Header Dinâmico */}
        <div className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => {
                  if (view === 'hub') navigate(`/students/${studentId}`);
                  else if (view === 'details') setView('hub');
                  else setView('details'); // Volta para detalhes a partir das telas de ação
                }}
                className="w-12 h-12 rounded-2xl bg-white atmospheric-shadow flex items-center justify-center text-slate-400 hover:text-primary transition-all"
              >
                 <ChevronLeft size={24} />
              </button>
              <div>
                 <h1 className="text-4xl font-black text-on-surface tracking-tight">
                    {view === 'hub' ? 'Estudo de Caso' : 
                     view === 'consolidation' ? 'Consolidação Técnica' : 
                     activeInstrument?.name}
                 </h1>
                 <p className="text-on-surface-variant font-medium opacity-60">Aluno: <strong className="text-primary">{student?.full_name}</strong></p>
              </div>
           </div>

           {view === 'hub' && (
             <button className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-105 transition-all">
                <Wand2 size={18} />
                Gerar PEI (IA)
             </button>
           )}
        </div>

        <AnimatePresence mode="wait">
          {view === 'hub' && (
            <motion.div 
              key="hub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"
            >
               {instruments.map((inst) => (
                 <motion.div 
                   key={inst.id}
                   onClick={() => { setActiveInstrumentId(inst.id); setView('details'); }}
                   whileHover={{ y: -4 }}
                   className="bg-white rounded-[32px] p-8 atmospheric-shadow border border-slate-100 flex flex-col relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-all"
                 >
                    <div className="flex items-start justify-between mb-6">
                       <div className="w-16 h-16 rounded-[24px] bg-primary/5 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
                          <inst.icon size={28} strokeWidth={2} />
                       </div>
                       
                       <div className={cn(
                         "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                         inst.status === 'completed' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                       )}>
                          {inst.status === 'completed' ? 'Concluído' : 'Pendente'}
                       </div>
                    </div>

                    <h3 className="text-xl font-black text-on-surface mb-3 leading-tight pr-4">{inst.name}</h3>
                    <p className="text-sm font-medium text-slate-400 mb-8 flex-1">{inst.description}</p>

                    {/* Resumo visual do status */}
                    {inst.versions > 0 && (
                       <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500">
                          <Clock size={14} className="text-primary" />
                          Última mod: {inst.lastUpdate}
                       </div>
                    )}

                    {/* Botão Externo Isolado */}
                    {inst.allowExternalLink && (
                      <div className="mt-auto pt-4 border-t border-slate-50">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            alert('Link copiado para a área de transferência!');
                          }}
                          className="w-full py-3 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-2"
                        >
                          <Send size={14} /> Enviar Link Externo
                        </button>
                      </div>
                    )}
                 </motion.div>
               ))}
            </motion.div>
          )}

          {view === 'details' && activeInstrument && (
            <motion.div 
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto space-y-8"
            >
               {/* Painel de Histórico */}
               <div className="bg-white rounded-[32px] p-10 atmospheric-shadow border border-slate-100">
                  <div className="flex items-center gap-4 mb-8">
                     <History className="text-primary" size={28} />
                     <h2 className="text-2xl font-black text-on-surface">Histórico de Preenchimento</h2>
                  </div>

                  {activeInstrument.versions > 0 ? (
                    <div className="space-y-4">
                       {[...Array(activeInstrument.versions)].map((_, idx) => (
                         <div key={idx} className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-6">
                               <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl">
                                  v{activeInstrument.versions - idx}
                               </div>
                               <div>
                                  <p className="font-black text-on-surface text-lg">Registrado em {activeInstrument.lastUpdate}</p>
                                  <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Por: {activeInstrument.lastPerson}</p>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                               <div className="text-right">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conclusão</p>
                                  <div className="flex items-center gap-2">
                                     <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${activeInstrument.completionPercentage}%` }}></div>
                                     </div>
                                     <span className="text-sm font-black text-slate-700">{activeInstrument.completionPercentage}%</span>
                                  </div>
                               </div>

                               <div className="h-10 w-px bg-slate-200 hidden md:block"></div>

                               <button 
                                 onClick={() => handleInstrumentAction('view')}
                                 className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-primary hover:border-primary hover:bg-primary/5 transition-all tracking-widest flex items-center gap-2 shadow-sm"
                               >
                                  <Eye size={14} /> Visualizar
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                       <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                       <p className="text-slate-500 font-bold text-sm">Nenhum preenchimento registrado ainda.</p>
                    </div>
                  )}
               </div>

               {/* Ações do Instrumento */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                     onClick={() => handleInstrumentAction('fill')}
                     className="p-6 bg-primary text-white rounded-3xl flex flex-col items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                     <Plus size={28} />
                     <span className="font-black text-xs uppercase tracking-widest">
                       {activeInstrument.versions > 0 ? 'Nova Atualização / Versão' : 'Preencher Agora'}
                     </span>
                  </button>

                  <button 
                     onClick={() => setView('consolidation')}
                     disabled={activeInstrument.versions === 0}
                     className={cn(
                       "p-6 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all border-2",
                       activeInstrument.versions > 0 
                         ? "bg-white border-primary/20 text-primary hover:bg-primary/5 cursor-pointer" 
                         : "bg-slate-50 border-transparent text-slate-300 cursor-not-allowed"
                     )}
                  >
                     <Sparkles size={28} />
                     <span className="font-black text-xs uppercase tracking-widest">Consolidar Dados (IA)</span>
                  </button>

                  <div className="flex gap-4">
                     <button 
                        disabled={activeInstrument.versions === 0}
                        onClick={() => {
                          if(confirm('Tem certeza que deseja arquivar? O instrumento sairá da visão principal.')) { }
                        }}
                        className={cn(
                          "flex-1 p-6 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all",
                          activeInstrument.versions > 0 ? "bg-white border border-slate-200 text-slate-500 hover:border-slate-400" : "bg-slate-50 text-slate-300 cursor-not-allowed"
                        )}
                     >
                        <Archive size={24} />
                        <span className="font-black text-[10px] uppercase tracking-widest">Arquivar</span>
                     </button>
                     <button 
                        disabled={activeInstrument.versions === 0}
                        onClick={() => {
                          if(confirm('CUIDADO: Isso excluirá permanentemente os dados. Prosseguir?')) { }
                        }}
                        className={cn(
                          "flex-1 p-6 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all",
                          activeInstrument.versions > 0 ? "bg-red-50 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white" : "bg-slate-50 text-slate-300 cursor-not-allowed"
                        )}
                     >
                        <Trash2 size={24} />
                        <span className="font-black text-[10px] uppercase tracking-widest">Excluir</span>
                     </button>
                  </div>
               </div>
            </motion.div>
          )}

"""

new_content += consolidation_code + "\n"
new_content += filling_code + "\n"
new_content += versions_code + "\n"
new_content += """        </AnimatePresence>
      </main>
    </div>
  );
}
"""

with open("src/pages/CaseStudy.tsx", "w") as f:
    f.write(new_content)

print("Patch applied successfully.")
