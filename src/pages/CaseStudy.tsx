import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart3, Brain, Info, ChevronLeft, 
  Loader2, AlertCircle, ClipboardList, 
  MessageSquare, User, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { Student } from '../types/database';
import { MultimodalInput } from '../components/MultimodalInput';
import { cn } from '../lib/utils';

export default function CaseStudy() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('N-ILS');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('id', studentId)
          .single();

        if (error) throw error;
        setStudent(data);
      } catch (err: any) {
        console.error('Erro ao buscar estudante:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <TopBar title="Estudo de Caso" showBack />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary/40" size={48} />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <TopBar title="Estudo de Caso" showBack />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
             <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-on-surface mb-2">Estudante não encontrado</h2>
          <button onClick={() => navigate('/students')} className="bg-primary text-white px-8 py-3 rounded-2xl font-bold mt-4 shadow-lg shadow-primary/20">Voltar para a Lista</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'INFO', label: 'INFO ALUNO', icon: User },
    { id: 'IF-SAHS', label: 'IF-SAHS', icon: ClipboardList },
    { id: 'IP-SAHS', label: 'IP-SAHS', icon: ClipboardList },
    { id: 'ENTREVISTA', label: 'ENTREVISTA', icon: MessageSquare },
    { id: 'N-ILS', label: 'N-ILS', icon: Brain },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 bg-surface">
      <TopBar title="Estudo de Caso" showBack />
      
      <main className="max-w-7xl mx-auto px-6 pt-8 pb-12 w-full">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Centro de Instrumentos</p>
            <h2 className="text-4xl font-black text-on-surface tracking-tight">Estudo de Caso: <span className="text-primary">{student.full_name}</span></h2>
          </motion.div>
          
          <div className="flex gap-4">
            <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl shadow-[0px_4px_30px_rgba(0,0,0,0.04)] border border-white/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                <BarChart3 className="text-on-secondary-container" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progresso</p>
                <p className="text-2xl font-black text-on-surface">81%</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar mb-8">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-3",
                activeTab === tab.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 -translate-y-1" 
                  : "bg-white text-slate-600 border border-outline-variant/5 hover:bg-surface-container-high"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'IF-SAHS' && (
            <motion.div 
              key="if-sahs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="bg-white rounded-[40px] p-10 shadow-[0px_4px_40px_rgba(0,0,0,0.03)] border-l-[12px] border-primary">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
                       <ClipboardList size={24} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-on-surface tracking-tight">Inventário Familiar (IF-SAHS)</h3>
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Preenchimento assistido pelo Professor</p>
                    </div>
                 </div>

                 <div className="space-y-16">
                    {/* Bloco I */}
                    <div className="space-y-8">
                       <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Bloco I - PERFIL DO ESTUDANTE</h4>
                       {[
                         { id: 'q1', label: '01. O que o(a) estudante gosta de fazer ou apresenta facilidade para realizar? (ex.: matemática, ciências, artes, música, tecnologia, linguagem, jogos, esportes)' },
                         { id: 'q2', label: '02. Como é a interação do seu filho com outras pessoas? Relate exemplo(s).' },
                         { id: 'q3', label: '03. Como seu filho reage a desafios e frustrações? Relate exemplo(s).' }
                       ].map(q => (
                         <div key={q.id} className="space-y-4">
                            <p className="text-lg font-black text-on-surface tracking-tight leading-tight">{q.label}</p>
                            <MultimodalInput 
                               value={""} 
                               onChange={() => {}} 
                               placeholder="Clique no microfone para transcrever..."
                            />
                         </div>
                       ))}
                    </div>

                    {/* Bloco II */}
                    <div className="space-y-8">
                       <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Bloco II - CONTEXTO FAMILIAR E APOIO EXTERNO</h4>
                       {[
                         { id: 'q4', label: '04. O estudante participa de atividades extracurriculares fora da escola? Se sim, quais?' },
                         { id: 'q5', label: '05. A família já comunicou à escola a existência de desafios pedagógicos, emocionais ou comportamentais relacionados ao estudante? Se sim, quais?' }
                       ].map(q => (
                         <div key={q.id} className="space-y-4">
                            <p className="text-lg font-black text-on-surface tracking-tight leading-tight">{q.label}</p>
                            <MultimodalInput 
                               value={""} 
                               onChange={() => {}} 
                               placeholder="Clique no microfone para transcrever..."
                            />
                         </div>
                       ))}
                    </div>

                    {/* Bloco III */}
                    <div className="space-y-8">
                       <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Bloco III - DESAFIOS E NECESSIDADES EDUCACIONAIS</h4>
                       {[
                         { id: 'q6', label: '06. O aluno demonstra sinais de desmotivação na escola? Quais comportamentos, atitudes ou situações evidenciam essa desmotivação?' },
                         { id: 'q7', label: '07. Na sua opinião, quais são atualmente, as maiores necessidades pedagógicas do seu filho na escola?' },
                         { id: 'q8', label: '08. Que expectativas você tem em relação ao desenvolvimento escolar do(a) seu(sua) filho(a)?' },
                         { id: 'q9', label: '09. Gostaria de sugerir algo que considere importante para que possamos planejar um atendimento mais adequado ao seu(sua) filho(a)?' }
                       ].map(q => (
                         <div key={q.id} className="space-y-4">
                            <p className="text-lg font-black text-on-surface tracking-tight leading-tight">{q.label}</p>
                            <MultimodalInput 
                               value={""} 
                               onChange={() => {}} 
                               placeholder="Clique no microfone para transcrever..."
                            />
                         </div>
                       ))}
                    </div>

                    <div className="pt-8 flex justify-end">
                       <button className="bg-primary text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                          Salvar Instrumento
                       </button>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'N-ILS' && (
            <motion.div 
              key="nils"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-[40px] p-10 shadow-[0px_4px_40px_rgba(0,0,0,0.03)] border border-outline-variant/5">
                  <div className="flex justify-between items-start mb-10">
                    <h3 className="text-xl font-black text-on-surface tracking-tight">Estilos de Aprendizagem N-ILS</h3>
                    <Info className="text-slate-300" size={24} />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-[200px] h-[100px] rounded-t-[100px] bg-slate-50 relative overflow-hidden">
                      <div 
                        className="absolute inset-0 bg-primary opacity-20" 
                      />
                      <div 
                        className="absolute inset-0 bg-primary" 
                        style={{ clipPath: 'polygon(0 100%, 0 0, 65% 0, 65% 100%)' }}
                      />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140px] h-[70px] bg-white rounded-t-[70px] flex items-end justify-center pb-2">
                        <span className="text-2xl font-black text-primary">Sensorial</span>
                      </div>
                    </div>
                    <div className="w-full flex justify-between text-[10px] font-black uppercase text-slate-400 mt-6 tracking-widest">
                      <span>Sensorial</span>
                      <span>Intuitivo</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-2 relative">
                      <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '65%' }}></div>
                    </div>
                    <p className="mt-8 text-sm font-medium text-slate-500 leading-relaxed text-center italic">
                      {student.full_name} demonstra uma preferência acentuada por conteúdos práticos e fatos concretos.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-[40px] p-10 shadow-[0px_4px_40px_rgba(0,0,0,0.03)] border border-outline-variant/5">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-black text-on-surface tracking-tight">Mapeamento Gardner</h3>
                  </div>
                  <div className="relative h-64 flex items-center justify-center">
                    <svg className="w-full h-full max-w-[240px]" viewBox="0 0 200 200">
                      <polygon fill="none" points="100,20 180,80 150,170 50,170 20,80" stroke="#f1f5f9" strokeWidth="2"></polygon>
                      <polygon fill="none" points="100,50 150,85 130,140 70,140 50,85" stroke="#f1f5f9" strokeWidth="1"></polygon>
                      <line stroke="#f1f5f9" strokeWidth="1" x1="100" x2="100" y1="100" y2="20"></line>
                      <line stroke="#f1f5f9" strokeWidth="1" x1="100" x2="180" y1="100" y2="80"></line>
                      <line stroke="#f1f5f9" strokeWidth="1" x1="100" x2="150" y1="100" y2="170"></line>
                      <line stroke="#f1f5f9" strokeWidth="1" x1="100" x2="50" y1="100" y2="170"></line>
                      <line stroke="#f1f5f9" strokeWidth="1" x1="100" x2="20" y1="100" y2="80"></line>
                      <polygon fill="rgba(0, 87, 193, 0.1)" points="100,40 160,80 130,130 90,160 40,90" stroke="#0057c1" strokeLinejoin="round" strokeWidth="3"></polygon>
                    </svg>
                    <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lógica</span>
                    <span className="absolute top-1/3 right-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Musical</span>
                    <span className="absolute bottom-4 right-1/4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Espacial</span>
                    <span className="absolute bottom-4 left-1/4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Intrapessoal</span>
                    <span className="absolute top-1/3 left-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Linguística</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[40px] p-12 shadow-[0px_4px_40px_rgba(0,0,0,0.03)] border-l-[12px] border-primary">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                  <div>
                    <h3 className="text-3xl font-black text-on-surface mb-2 tracking-tight">Questionário N-ILS</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Etapa 4 de 5: Preferências de Processamento</p>
                  </div>
                  <div className="flex-1 max-w-sm">
                    <div className="flex justify-between text-[10px] font-black text-primary uppercase tracking-widest mb-3">
                      <span>Progresso do Aluno</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="bg-slate-50 p-10 rounded-[32px] border border-slate-100">
                    <p className="text-2xl font-black text-on-surface mb-8 tracking-tight leading-tight">Questão 28: Ao estudar um novo conceito, você prefere:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="flex items-center gap-6 p-6 rounded-3xl bg-white border-2 border-primary text-left transition-all shadow-lg shadow-primary/5 group">
                        <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 font-black">A</div>
                        <span className="font-bold text-on-surface text-lg">Tentar aplicar o conceito imediatamente na prática</span>
                      </button>
                      <button className="flex items-center gap-6 p-6 rounded-3xl bg-white border-2 border-transparent hover:border-slate-200 text-left transition-all group">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 font-black">B</div>
                        <span className="font-bold text-slate-500 text-lg">Refletir calmamente sobre a teoria antes de qualquer ação</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-8">
                    <button className="flex items-center gap-3 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-primary transition-colors">
                      <ChevronLeft size={20} />
                      Anterior
                    </button>
                    <button className="bg-primary text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                      Próxima Questão
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab !== 'N-ILS' && (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[40px] p-20 text-center border border-dashed border-slate-200"
            >
               <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ClipboardList size={40} />
               </div>
               <h3 className="text-2xl font-black text-slate-400 mb-2">Instrumento {activeTab}</h3>
               <p className="text-slate-400 font-medium">Este módulo está sendo preparado para integração com dados reais.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
