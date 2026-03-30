import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ClipboardList, Brain, PencilRuler, 
  ChevronLeft, CheckCircle2, Send, 
  Clock, User as UserIcon, Plus, 
  Sparkles, ShieldCheck, LayoutGrid,
  FileText, Activity, Users, Info,
  MessageSquare, History, Wand2, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { Student } from '../types/database';
import { MultimodalInput } from '../components/MultimodalInput';
import { cn } from '../lib/utils';

type ViewState = 'hub' | 'filling' | 'consolidation' | 'versions';

interface InstrumentStatus {
  id: string;
  name: string;
  description: string;
  icon: any;
  versions: number;
  lastUpdate?: string;
  lastPerson?: string;
  status: 'pending' | 'completed' | 'ongoing';
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
      name: 'Inventário Familiar para Suplementação de Estudantes com AH/SD - IF-SAHS', 
      description: 'Coleta de dados biopsicossociais com a família.', 
      icon: Users,
      versions: 1,
      lastUpdate: '25/03/2024',
      lastPerson: 'Prof. Maria Silva',
      status: 'completed'
    },
    { 
      id: 'IP-SAHS', 
      name: 'Inventário Pedagógico para Suplementação em AH/SD - IP-SAHS', 
      description: 'Observação pedagógica e funcional do professor.', 
      icon: Activity,
      versions: 0,
      status: 'pending'
    },
    { 
      id: 'ENTREVISTA', 
      name: 'Entrevista com estudantes com AH/SD', 
      description: 'Escuta especializada das demandas do estudante.', 
      icon: MessageSquare,
      versions: 0,
      status: 'pending'
    },
    { 
      id: 'N-ILS', 
      name: 'N-ILS Adaptado para crianças e Adolescentes', 
      description: 'Mapeamento de estilos e habilidades de aprendizagem.', 
      icon: Brain,
      versions: 2,
      lastUpdate: 'Ontem',
      lastPerson: 'Sistema (IA)',
      status: 'completed'
    },
    {
      id: 'DOC-ANALISE',
      name: 'Análise de Documentos e Pareceres',
      description: 'Envie laudos, pareceres e relatórios (PDF, DOC, Imagem) para processamento da inteligência artificial.',
      icon: FileText,
      versions: 0,
      status: 'pending'
    }
  ];

  const activeInstrument = instruments.find(i => i.id === activeInstrumentId);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopBar />
      
      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Header Dinâmico */}
        <div className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => view === 'hub' ? navigate(`/students/${studentId}`) : setView('hub')}
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
                Relatório Geral Consolidado (IA)
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
               {instruments.map((inst) => (
                 <motion.div 
                   key={inst.id}
                   whileHover={{ y: -8 }}
                   className="bg-white rounded-[40px] p-8 atmospheric-shadow border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group"
                 >
                    {/* Status Badge */}
                    <div className={cn(
                      "absolute top-6 right-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      inst.status === 'completed' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                    )}>
                       {inst.status === 'completed' ? 'Concluído' : 'Pendente'}
                    </div>

                    <div className="w-20 h-20 rounded-[32px] bg-primary/5 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                       <inst.icon size={36} strokeWidth={1.5} />
                    </div>

                    <h3 className="text-xl font-black text-on-surface mb-2 leading-tight">{inst.name}</h3>
                    <p className="text-sm font-medium text-slate-400 mb-8 min-h-[40px]">{inst.description}</p>

                    {inst.versions > 0 ? (
                      <div className="w-full space-y-4">
                         <div className="flex flex-col items-center bg-slate-50 rounded-3xl p-4 border border-slate-100/50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                               <Clock size={12} /> {inst.lastUpdate}
                            </span>
                            <span className="text-xs font-bold text-on-surface-variant truncate w-full">Por: {inst.lastPerson}</span>
                            <div className="mt-2 text-[10px] font-black text-primary uppercase">
                               {inst.id === 'IF-SAHS' ? 'Pronto para Evolução' : inst.id === 'N-ILS' ? '1 Versão Ativa' : `${inst.versions} versões disponíveis`}
                            </div>
                         </div>
                         <div className="grid grid-cols-3 gap-2">
                            {inst.id === 'IF-SAHS' ? (
                              <>
                                <button 
                                  onClick={() => { 
                                    if (inst.id === 'IP-SAHS') {
                                      navigate(`/students/${studentId}/ip-sahs`);
                                    } else {
                                      setActiveInstrumentId(inst.id); 
                                      setView('filling'); 
                                    }
                                  }}
                                  className="py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1.5"
                                >
                                   <History size={11} /> Atualizar
                                </button>
                                <button 
                                  onClick={() => { 
                                    if(confirm('CUIDADO: Esta ação excluirá PERMANENTEMENTE os dados deste instrumento. Deseja prosseguir?')) {
                                      // Logic to delete
                                    }
                                  }}
                                  className="py-3 bg-red-50 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-red-600 hover:text-white transition-all border border-red-100"
                                >
                                   Excluir
                                </button>
                                <button 
                                  onClick={() => { 
                                    if(confirm('Tem certeza que deseja arquivar este instrumento? Os pais precisarão preencher um novo do zero.')) {
                                      // Logic to archive
                                    }
                                  }}
                                  className="py-3 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-slate-900 hover:text-white transition-all border border-slate-200"
                                >
                                   Arquivar
                                </button>
                              </>
                            ) : inst.id === 'N-ILS' ? (
                              <>
                                <button 
                                  onClick={() => navigate(`/students/${studentId}/n-ils`)}
                                  className="col-span-2 py-3 bg-primary text-white border border-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20 transition-all"
                                >
                                   Ver Resultado
                                </button>
                                <button 
                                  onClick={async () => { 
                                    if(confirm('Tem certeza que deseja arquivar o teste atual? Isso permitirá uma nova coleta.')) {
                                      try {
                                        await supabase
                                          .from('n_ils_responses')
                                          .update({ status: 'archived', updated_at: new Date().toISOString() })
                                          .eq('student_id', studentId)
                                          .neq('status', 'archived');
                                        window.location.reload();
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }
                                  }}
                                  className="col-span-1 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-slate-400 hover:text-slate-600 transition-all"
                                >
                                   Arquivar
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => { setActiveInstrumentId(inst.id); setView('versions'); }}
                                  className="py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
                                >
                                   Histórico
                                </button>
                                <button 
                                  onClick={() => { setActiveInstrumentId(inst.id); setView('consolidation'); }}
                                  className="col-span-2 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                                >
                                   <Sparkles size={12} /> Consolidar
                                </button>
                              </>
                            )}
                         </div>
                      </div>
                    ) : (
                      <div className="w-full space-y-4 pt-4">
                         <button 
                           onClick={() => { 
                             if (inst.id === 'IP-SAHS') {
                               navigate(`/students/${studentId}/ip-sahs`);
                             } else if (inst.id === 'ENTREVISTA') {
                               navigate(`/students/${studentId}/interview`);
                             } else if (inst.id === 'N-ILS') {
                               navigate(`/students/${studentId}/n-ils`);
                             } else {
                               setActiveInstrumentId(inst.id); 
                               setView('filling'); 
                             }
                           }}
                           className="w-full py-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-3"
                         >
                            <Plus size={16} /> Preencher agora
                         </button>
                         <button className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center gap-3">
                            <Send size={16} /> Enviar link
                         </button>
                      </div>
                    )}
                 </motion.div>
               ))}
            </motion.div>
          )}

          {view === 'consolidation' && (
            <motion.div 
              key="consolidation"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
               <div className="bg-white rounded-[48px] atmospheric-shadow border border-slate-100 overflow-hidden">
                  <div className="bg-primary/5 p-10 flex items-center justify-between border-b border-primary/10">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[28px] bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20">
                           <Sparkles size={32} />
                        </div>
                        <div>
                           <h2 className="text-3xl font-black text-on-surface tracking-tight">Consolidação: {activeInstrumentId}</h2>
                           <p className="text-on-surface-variant font-medium">Análise conjunta baseada na Política de Ed. Inclusiva.</p>
                        </div>
                     </div>
                     <button onClick={() => setView('hub')} className="p-4 rounded-full hover:bg-black/5 text-slate-400">
                        <LayoutGrid size={24} />
                     </button>
                  </div>

                  <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                     {/* Coluna de Fontes */}
                     <div className="space-y-8">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <History size={14} /> Seleção de Versões para Convergência
                        </h3>
                        <div className="space-y-4">
                           {[
                             { id: 'v1', date: '25/03/24', by: 'Prof. Maria', meta: 'Manual' },
                             { id: 'v2', date: 'Ontem', by: 'Família (Externo)', meta: 'Via Link' },
                           ].map(v => (
                             <div key={v.id} className="flex items-center gap-4 p-6 rounded-3xl border-2 border-primary/20 bg-primary/5 hover:border-primary transition-all cursor-pointer">
                                <div className="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center shadow-md">
                                   <CheckCircle2 size={16} />
                                </div>
                                <div className="flex-1">
                                   <p className="font-black text-on-surface tracking-tight">Versão em {v.date}</p>
                                   <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter opacity-70">{v.by} • {v.meta}</p>
                                </div>
                                <FileText className="text-primary opacity-40" />
                             </div>
                           ))}
                        </div>

                        <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-200 border-dashed relative">
                           <div className="absolute -top-3 left-8 bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase">Sugestão IA</div>
                           <div className="flex items-start gap-4">
                              <Brain className="text-primary shrink-0" />
                              <div className="space-y-2">
                                 <p className="text-sm font-semibold text-on-surface-variant leading-relaxed opacity-70">
                                   "As fontes apresentam convergência em 85%. Destaque para barreiras arquitetônicas e alta motivação intrínseca."
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Coluna de Eixos */}
                     <div className="space-y-8">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <ShieldCheck size={14} /> Eixos de Análise Técnica
                        </h3>
                        
                        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                           {[
                             { id: 'I', label: 'Eixo I: Diferenciação de demandas e barreiras', desc: 'Identificação inicial das barreiras individuais.' },
                             { id: 'II', label: 'Eixo II: Análise do Contexto Escolar', desc: 'Barreiras e facilitadores no ambiente físico/social.' },
                             { id: 'III', label: 'Eixo III: Potencialidades e Apoios', desc: 'Identificação de talentos e demandas de apoio.' },
                             { id: 'IV', label: 'Eixo IV: Definição de Estratégias', desc: 'Recursos de acessibilidade e suplementação.' },
                           ].map((eixo) => (
                             <div key={eixo.id} className="p-8 pb-12 bg-white rounded-3xl border border-slate-100 atmospheric-shadow relative">
                                <div className="flex items-center gap-4 mb-4">
                                   <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg">{eixo.id}</span>
                                   <p className="font-black text-on-surface text-lg leading-tight">{eixo.label}</p>
                                </div>
                                <MultimodalInput 
                                   value=""
                                   onChange={() => {}}
                                   placeholder={`A IA pré-análisou este campo... ${eixo.desc}`}
                                />
                                <div className="absolute bottom-4 right-8 flex items-center gap-3">
                                   <ShieldCheck size={14} className="text-green-500" />
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validado</span>
                                </div>
                             </div>
                           ))}
                        </div>

                        <div className="pt-6">
                           <button className="w-full bg-[#1DB954] text-white py-7 rounded-[28px] font-black text-base uppercase tracking-[0.2em] shadow-xl shadow-green-500/20 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                              <span>Finalizar Consolidação</span>
                              <CheckCircle2 size={24} />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {view === 'filling' && (
            <motion.div 
              key="filling"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-4xl mx-auto"
            >
               <div className="bg-white rounded-[48px] p-12 atmospheric-shadow border border-slate-100">
                  <div className="flex items-center justify-between mb-12">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                           <FileText size={24} />
                        </div>
                        <div>
                           <h2 className="text-2xl font-black text-on-surface">Novo Preenchimento: {activeInstrumentId}</h2>
                           <p className="text-sm font-medium text-slate-400">Esta será salva como a versão mais recente.</p>
                        </div>
                     </div>
                     <button onClick={() => setView('hub')} className="text-slate-400 font-black text-[10px] uppercase hover:text-red-500 transition-all">Cancelar</button>
                  </div>

                  <div className="space-y-12">
                     {activeInstrumentId === 'IF-SAHS' ? (
                       <div className="space-y-12">
                          <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10 flex items-start gap-4">
                             <TrendingUp className="text-primary mt-1" size={24} />
                             <div className="space-y-1">
                                <p className="font-black text-on-surface uppercase tracking-tight">Evolução de Caso</p>
                                <p className="text-sm font-medium text-slate-500">Insira as novas informações ou observações recentes. O sistema consolidará estes dados ao documento mestre.</p>
                             </div>
                          </div>
                          
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Campo de Atualização</label>
                             <MultimodalInput 
                                value="" 
                                onChange={() => {}} 
                                placeholder="Descreva aqui as mudanças ou novas informações coletadas..." 
                             />
                          </div>

                          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 italic text-sm text-slate-400 flex items-center gap-4">
                             <Sparkles size={18} className="text-primary opacity-40" />
                             "Ao salvar, a IA atualizará automaticamente os eixos de análise do Estudo de Caso."
                          </div>
                       </div>
                     ) : activeInstrumentId === 'DOC-ANALISE' ? (
                        <div className="space-y-12">
                           <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10 flex items-start gap-4">
                              <FileText className="text-primary mt-1" size={24} />
                              <div className="space-y-1">
                                 <p className="font-black text-on-surface uppercase tracking-tight">Análise Automática de Documentos</p>
                                 <p className="text-sm font-medium text-slate-500">Faça o upload de laudos médicos, avaliações multi-profissionais ou relatórios escolares.  O sistema lerá os arquivos e extrairá as informações relevantes para a construção do PEI do estudante de forma automatizada.</p>
                              </div>
                           </div>
                           
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Anexar Aquivos (Laudos, PDF, Imagens)</label>
                              <div className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 hover:scale-[1.01] transition-all group">
                                 <Plus size={36} className="text-slate-300 group-hover:text-primary transition-colors mb-4" />
                                 <p className="text-base font-bold text-slate-500 group-hover:text-primary mb-1 text-center px-4">Clique aqui para enviar seus arquivos ou arraste-os para cá</p>
                                 <p className="text-xs font-medium text-slate-400/60 uppercase tracking-widest">Suporta .PDF, .DOCX, .JPG, .PNG</p>
                              </div>
                           </div>
                        </div>
                      ) : (
                       <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                          <Plus className="mx-auto text-slate-200 mb-4" size={48} />
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Módulo de preenchimento para {activeInstrumentId}</p>
                       </div>
                     )}

                     <div className="pt-10 border-t border-slate-100 flex gap-4">
                        <button className="flex-1 bg-primary text-white py-6 rounded-3xl font-black text-base uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all">
                           {activeInstrumentId === 'DOC-ANALISE' ? <><Sparkles size={20} /> Analisar Documentos e Salvar</> : 'Salvar como Nova Versão'}
                        </button>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {view === 'versions' && (
            <motion.div 
               key="versions"
               className="max-w-4xl mx-auto space-y-8"
            >
               <div className="flex items-center justify-between bg-white p-8 rounded-[32px] atmospheric-shadow border border-slate-100">
                  <div className="flex items-center gap-4">
                     <History className="text-primary" />
                     <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">Relatórios de Versões</h3>
                  </div>
                  <button onClick={() => setView('hub')} className="text-primary font-black text-xs uppercase underline">Voltar</button>
               </div>
               
               <div className="grid gap-4">
                 {[1, 2].map(v => (
                   <div key={v} className="bg-white p-8 rounded-[32px] border border-slate-100 atmospheric-shadow flex items-center justify-between group hover:border-primary transition-all">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-xl">
                            {v}
                         </div>
                         <div>
                            <p className="font-black text-on-surface text-lg">Versão salva em 25/03/2024</p>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Responsável: Professor Maria Silva</p>
                         </div>
                      </div>
                      <button className="px-6 py-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:bg-primary/10 hover:text-primary transition-all tracking-widest">
                         Visualizar Dados
                      </button>
                   </div>
                 ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
