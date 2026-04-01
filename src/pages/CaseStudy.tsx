import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ClipboardList, Brain, PencilRuler, 
  ChevronLeft, CheckCircle2, Send, 
  Clock, User as UserIcon, Plus, 
  Sparkles, ShieldCheck, LayoutGrid,
  FileText, Activity, Users, Info,
  MessageSquare, History, Wand2, TrendingUp,
  Percent, Eye, Trash2, Archive, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { Student } from '../types/database';
import { MultimodalInput } from '../components/MultimodalInput';
import { cn } from '../lib/utils';

type ViewState = 'hub' | 'details' | 'filling' | 'consolidation' | 'versions';

type IfSahsRecord = {
  id: string;
  type: 'versao_inicial' | 'atualizacao';
  status: 'ativo' | 'arquivado' | 'rascunho';
  date: string;
  person: string;
  respondentName: string;
  respondentRole: string;
  respondentRelation?: string;
  answers: Record<string, string>;
  updates?: { date: string; person: string; text: string; }[];
  pendingQuestions?: string[];
  audioStorage?: Record<string, string>;
};

interface InstrumentStatus {
  id: string;
  name: string;
  description: string;
  icon: any;
  versions: number;
  lastUpdate?: string;
  lastPerson?: string;
  completionPercentage?: number;
  status: 'pending' | 'completed' | 'ongoing' | 'draft';
  allowExternalLink?: boolean;
}

const IF_SAHS_QUESTIONS = [
  {
    section: 'I - PERFIL DO ESTUDANTE',
    questions: [
      { id: 'q1', text: 'O que o(a) estudante gosta de fazer ou apresenta facilidade para realizar? ex.: matemática, ciências, artes, música, tecnologia, linguagem, jogos, esportes' },
      { id: 'q2', text: 'Como é a interação do seu filho com outras pessoas? Relate exemplo(s).' },
      { id: 'q3', text: 'Como seu filho reage a desafios e frustrações? Relate exemplo(s).' }
    ]
  },
  {
    section: 'II - CONTEXTO FAMILIAR E APOIO EXTERNO',
    questions: [
      { id: 'q4', text: 'O estudante participa de atividades extracurriculares fora da escola? Se sim, quais?' },
      { id: 'q5', text: 'A família já comunicou à escola a existência de desafios pedagógicos, emocionais ou comportamentais relacionados ao estudante? Se sim, quais?' }
    ]
  },
  {
    section: 'III - DESAFIOS E NECESSIDADES EDUCACIONAIS',
    questions: [
      { id: 'q6', text: 'O aluno demonstra sinais de desmotivação na escola? Quais comportamentos, atitudes ou situações evidenciam essa desmotivação?' },
      { id: 'q7', text: 'Na sua opinião, quais são atualmente, as maiores necessidades pedagógicas do seu filho na escola?' },
      { id: 'q8', text: 'Que expectativas você tem em relação ao desenvolvimento escolar do(a) seu(sua) filho(a)?' },
      { id: 'q9', text: 'Gostaria de sugerir algo que considere importante para que possamos planejar um atendimento mais adequado ao seu(sua) filho(a)?' }
    ]
  }
];

const initialInstruments: InstrumentStatus[] = [
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
    versions: 1,
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

export default function CaseStudy() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>('hub');
  const [activeInstrumentId, setActiveInstrumentId] = useState<string | null>(null);
  
  const [instrumentsData, setInstrumentsData] = useState<InstrumentStatus[]>(initialInstruments);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');

  const [ifSahsRecords, setIfSahsRecords] = useState<IfSahsRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<IfSahsRecord | null>(null);
  const [fillingType, setFillingType] = useState<'nova_versao' | 'atualizacao' | 'edit'>('nova_versao');

  // Controle de Áudio Global e Rascunhos
  const [currentPendingQuestions, setCurrentPendingQuestions] = useState<string[]>([]);
  const [currentAudioStorage, setCurrentAudioStorage] = useState<Record<string, string>>({});

  // Evolução Inline 
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [updateText, setUpdateText] = useState('');

  // Formulário do IF-SAHS
  const [respondentName, setRespondentName] = useState('');
  const [respondentRole, setRespondentRole] = useState('');
  const [respondentRelation, setRespondentRelation] = useState('');
  const [ifSahsAnswers, setIfSahsAnswers] = useState<Record<string, string>>({});

  const handleIfSahsChange = (id: string, value: string) => {
    setIfSahsAnswers(prev => ({ ...prev, [id]: value }));
  };

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

  const activeInstrument = instrumentsData.find(i => i.id === activeInstrumentId);

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

    if (action === 'fill') setView('filling');
    if (action === 'view') setView('versions');
  };

  const handleSave = (status: 'ativo' | 'rascunho' = 'ativo') => {
    if (!activeInstrumentId) return;

    if (activeInstrumentId === 'IF-SAHS') {
      if (fillingType === 'edit' && selectedRecord) {
        setIfSahsRecords(prev => prev.map(r => r.id === selectedRecord.id ? {
          ...r,
          status,
          respondentName,
          respondentRole,
          respondentRelation,
          answers: ifSahsAnswers,
          pendingQuestions: currentPendingQuestions,
          audioStorage: currentAudioStorage
        } : r));
        
        setSelectedRecord(prev => prev ? {
          ...prev,
          status,
          respondentName,
          respondentRole,
          respondentRelation,
          answers: ifSahsAnswers,
          pendingQuestions: currentPendingQuestions,
          audioStorage: currentAudioStorage
        } : null);
        
        alert(status === 'rascunho' ? 'Rascunho atualizado!' : 'IF-SAHS editado com sucesso!');
        setView('versions');
        return;
      }

      const newRecord: IfSahsRecord = {
         id: Date.now().toString(),
         type: fillingType === 'atualizacao' ? 'atualizacao' : 'versao_inicial',
         status,
         date: new Date().toLocaleDateString('pt-BR'),
         person: 'Prof. Local',
         respondentName,
         respondentRole,
         respondentRelation,
         answers: ifSahsAnswers,
         updates: [],
         pendingQuestions: currentPendingQuestions,
         audioStorage: currentAudioStorage
      };
      setIfSahsRecords(prev => [newRecord, ...prev]);
      alert('IF-SAHS salvo com sucesso!');
      setRespondentName('');
      setRespondentRole('');
      setRespondentRelation('');
      setIfSahsAnswers({});
      setView('details');
      return;
    }
    
    setInstrumentsData(prev => 
      prev.map(inst => inst.id === activeInstrumentId ? {
        ...inst,
        versions: inst.versions + 1,
        lastUpdate: new Date().toLocaleDateString('pt-BR'),
        lastPerson: 'Você',
        status: 'completed',
        completionPercentage: 100
      } : inst)
    );
    alert('Dados salvos com sucesso!');
    setInputText('');
    setDocName('');
    setSelectedFile(null);
    setView('details');
  };

  const handleDelete = () => {
    if (!activeInstrumentId) return;
    if (!confirm('CUIDADO: Isso excluirá permanentemente os dados. Prosseguir?')) return;
    
    setInstrumentsData(prev => 
      prev.map(inst => inst.id === activeInstrumentId ? { ...inst, versions: 0, completionPercentage: 0, status: 'pending' } : inst)
    );
    alert('Dados excluídos com sucesso.');
    setView('details');
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopBar />
      
      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => {
                  if (view === 'hub') navigate(`/students/${studentId}`);
                  else if (view === 'details') setView('hub');
                  else setView('details');
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
               {instrumentsData.map((inst) => (
                 <motion.div 
                   key={inst.id}
                   onClick={() => { setActiveInstrumentId(inst.id); setView('details'); }}
                   whileHover={{ y: -4 }}
                   className="bg-white rounded-3xl p-5 atmospheric-shadow border border-slate-100 flex flex-col relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-all"
                 >
                    <div className="flex items-start justify-between mb-5">
                       <div className="w-12 h-12 rounded-[20px] bg-primary/5 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
                          <inst.icon size={20} strokeWidth={2} />
                       </div>
                       
                       {(() => {
                         let badgeStyle = "bg-slate-100 text-slate-400";
                         let badgeText = "Pendente";

                         // Lógica dinâmica baseada nos registros reais (IF-SAHS) ou no mock
                         const hasDraft = inst.id === 'IF-SAHS' ? ifSahsRecords.some(r => r.status === 'rascunho') : inst.status === 'draft';
                         const isCompleted = inst.id === 'IF-SAHS' ? ifSahsRecords.some(r => r.status === 'ativo') : inst.status === 'completed';

                         if (hasDraft) {
                           badgeStyle = "bg-red-50 border border-red-200 text-red-600";
                           badgeText = "Rascunho Pendente";
                         } else if (isCompleted) {
                           badgeStyle = "bg-green-100 text-green-600";
                           badgeText = "Concluído";
                         }

                         return (
                           <div className={cn("px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-center", badgeStyle)}>
                             {badgeText}
                           </div>
                         );
                       })()}
                    </div>

                    <h3 className="text-lg font-black text-on-surface mb-2 leading-tight pr-4">{inst.name}</h3>
                    <p className="text-[13px] font-medium text-slate-400 mb-6 flex-1">{inst.description}</p>

                    {inst.versions > 0 && (
                       <div className="flex items-center gap-2 mb-4 text-[11px] font-bold text-slate-500">
                          <Clock size={12} className="text-primary" />
                          Última mod: {inst.lastUpdate}
                       </div>
                    )}

                    {inst.allowExternalLink && (
                      <div className="mt-auto pt-4 border-t border-slate-50">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            alert('Link copiado para a área de transferência!');
                          }}
                          className="w-full py-2.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-2"
                        >
                          <Send size={14} /> Link Externo
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
               <div className="bg-white rounded-[32px] p-10 atmospheric-shadow border border-slate-100">
                  <div className="flex items-center gap-4 mb-8">
                     <History className="text-primary" size={28} />
                     <h2 className="text-2xl font-black text-on-surface">Histórico de Preenchimento</h2>
                  </div>

                  {activeInstrumentId === 'IF-SAHS' ? (
                     ifSahsRecords.length > 0 ? (
                       <div className="space-y-4">
                          {ifSahsRecords.map((record) => (
                             <div key={record.id} className={cn("flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl border transition-all", record.status === 'arquivado' ? "bg-slate-50 opacity-75 grayscale border-slate-200" : "bg-slate-50/50 hover:bg-white hover:border-primary/30 border-slate-200")}>
                                <div className="flex items-center gap-6">
                                   <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex flex-col items-center justify-center font-black shadow-sm">
                                      <span className="text-xs">{record.type === 'versao_inicial' ? 'V.I.' : 'ATUAL.'}</span>
                                   </div>
                                   <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-black text-on-surface text-lg leading-none">Registrado em {record.date}</p>
                                        {record.status === 'arquivado' && <span className="bg-slate-200 text-slate-500 text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest">Arquivado</span>}
                                        {record.status === 'rascunho' && <span className="bg-orange-100 text-orange-600 text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest">Rascunho Pendente</span>}
                                        {record.type === 'atualizacao' && <span className="bg-blue-100 text-blue-600 text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest">Atualização</span>}
                                      </div>
                                      <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Respondente: {record.respondentName} ({record.respondentRole})</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-3">
                                   <button onClick={() => { setSelectedRecord(record); setView('versions'); }} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-2 shadow-sm">
                                      <Eye size={14} /> Visualizar
                                   </button>
                                   {(record.status === 'ativo' || record.status === 'rascunho') && (
                                     <button onClick={() => setIfSahsRecords(prev => prev.map(r => r.id === record.id ? { ...r, status: 'arquivado' } : r))} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all shadow-sm">
                                        Arquivar
                                     </button>
                                   )}
                                   <button onClick={() => { if(confirm('Excluir este registro permanentemente?')) setIfSahsRecords(prev => prev.filter(r => r.id !== record.id)); }} className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                      Excluir
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
                     )
                  ) : activeInstrument.versions > 0 ? (
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

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeInstrumentId === 'IF-SAHS' ? (() => {
                     const activeVersion = ifSahsRecords.find(r => r.status === 'ativo');
                     const draftVersion = ifSahsRecords.find(r => r.status === 'rascunho');

                     if (draftVersion) {
                        return (
                           <button 
                              onClick={() => { 
                                setSelectedRecord(draftVersion);
                                setRespondentName(draftVersion.respondentName);
                                setRespondentRole(draftVersion.respondentRole);
                                setRespondentRelation(draftVersion.respondentRelation || '');
                                setIfSahsAnswers(draftVersion.answers);
                                setCurrentPendingQuestions(draftVersion.pendingQuestions || []);
                                setCurrentAudioStorage(draftVersion.audioStorage || {});
                                setFillingType('edit');
                                setView('filling'); 
                              }}
                              className="col-span-1 p-6 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all border-2 bg-orange-50 border-orange-200 text-orange-600 shadow-xl shadow-orange-500/10 hover:scale-[1.02] active:scale-95"
                           >
                              <PencilRuler size={28} />
                              <span className="font-black text-xs uppercase tracking-widest">Continuar Rascunho</span>
                              <span className="text-[9px] font-bold text-orange-500">Existem áudios pendentes</span>
                           </button>
                        );
                     }

                     return (
                        <button 
                           disabled={!!activeVersion}
                           onClick={() => { setFillingType('nova_versao'); setRespondentName(''); setRespondentRole(''); setRespondentRelation(''); setIfSahsAnswers({}); setCurrentPendingQuestions([]); setCurrentAudioStorage({}); setView('filling'); }}
                           className={cn("col-span-1 p-6 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all border-2", activeVersion ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed" : "bg-primary text-white border-transparent shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95")}
                           title={activeVersion ? "Arquive ou exclua a versão atual para iniciar uma nova" : "Criar uma nova versão a partir do zero"}
                        >
                           <Plus size={28} />
                           {activeVersion ? (
                             <>
                               <span className="font-black text-xs uppercase tracking-widest">Nova Versão</span>
                               <span className="text-[9px] font-bold text-slate-400">Arquive a atual para liberar</span>
                             </>
                           ) : (
                             <span className="font-black text-xs uppercase tracking-widest">Nova Versão</span>
                           )}
                        </button>
                     );
                  })() : (
                    <button 
                       onClick={() => handleInstrumentAction('fill')}
                       className="col-span-1 p-6 bg-primary text-white rounded-3xl flex flex-col items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                       <Plus size={28} />
                       <span className="font-black text-xs uppercase tracking-widest">
                         {activeInstrument.versions > 0 ? 'Nova Atualização / Versão' : 'Preencher Agora'}
                       </span>
                    </button>
                  )}

                  {(() => {
                    const hasDrafts = ifSahsRecords.some(r => r.status === 'rascunho');
                    const isConsolidationDisabled = (activeInstrument.versions === 0 && ifSahsRecords.length === 0) || hasDrafts;
                    return (
                        <button 
                           onClick={() => setView('consolidation')}
                           disabled={isConsolidationDisabled}
                           className={cn(
                             "p-6 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all border-2",
                             !isConsolidationDisabled
                               ? "bg-white border-primary/20 text-primary hover:bg-primary/5 cursor-pointer" 
                               : "bg-slate-50 border-transparent text-slate-300 cursor-not-allowed"
                           )}
                        >
                           <Sparkles size={28} />
                           <span className="font-black text-xs uppercase tracking-widest">Consolidar Dados (IA)</span>
                           {hasDrafts && <span className="text-[9px] font-bold text-red-400 text-center px-4">Bloqueado: Há transcrições pendentes.</span>}
                        </button>
                    )
                  })()}

                  {activeInstrumentId !== 'IF-SAHS' && (
                  <div className="flex gap-4">
                     <button 
                        disabled={activeInstrument.versions === 0}
                        onClick={() => {
                          if(confirm('Tem certeza que deseja arquivar? O instrumento sairá da visão principal.')) { 
                             alert('Arquivado com sucesso.');
                          }
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
                        onClick={handleDelete}
                        className={cn(
                          "flex-1 p-6 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all",
                          activeInstrument.versions > 0 ? "bg-red-50 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white" : "bg-slate-50 text-slate-300 cursor-not-allowed"
                        )}
                     >
                        <Trash2 size={24} />
                        <span className="font-black text-[10px] uppercase tracking-widest">Excluir</span>
                     </button>
                  </div>
                  )}
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
                            <h2 className="text-2xl font-black text-on-surface">Novo Preenchimento: {activeInstrument?.name}</h2>
                            <p className="text-sm font-medium text-slate-400">Esta será salva como a versão mais recente.</p>
                         </div>
                      </div>
                      <button onClick={() => setView('details')} className="text-slate-400 font-black text-[10px] uppercase hover:text-red-500 transition-all">Cancelar</button>
                   </div>
                   
                   <div className="space-y-12">
                      {activeInstrumentId === 'IF-SAHS' ? (
                        <div className="space-y-12">
                           <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10 flex items-start gap-4">
                              <TrendingUp className="text-primary mt-1" size={24} />
                              <div className="space-y-1">
                                 <p className="font-black text-on-surface uppercase tracking-tight">{fillingType === 'edit' ? 'Edição de Inventário Familiar' : fillingType === 'nova_versao' ? 'Questionário de Avaliação Familiar' : 'Atualização de Entrevista'}</p>
                                 <p className="text-sm font-medium text-slate-500">Preencha as informações detalhadas durante a entrevista com a família.</p>
                              </div>
                           </div>

                           <div className="bg-white p-8 rounded-[32px] border border-slate-100 atmospheric-shadow space-y-6">
                             <h3 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-4">
                                <UserIcon className="text-primary" /> Identificação do Respondente
                             </h3>
                             <div className="grid md:grid-cols-2 gap-6 pl-4 border-l-2 border-slate-100 py-2 ml-2">
                                <div className="space-y-4">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do responsável</label>
                                   <input value={respondentName} onChange={e => setRespondentName(e.target.value)} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-primary" placeholder="Digite o nome completo..." />
                                </div>
                                <div className="space-y-4">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vínculo</label>
                                   <div className="flex gap-2">
                                      {['Mãe', 'Pai', 'Responsável legal'].map(role => (
                                         <button key={role} onClick={() => setRespondentRole(role)} className={cn("flex-1 py-3 rounded-xl border font-bold text-xs transition-all tracking-wide", respondentRole === role ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "bg-white text-slate-500 border-slate-200 hover:border-primary/30")}>{role}</button>
                                      ))}
                                   </div>
                                </div>
                                {respondentRole === 'Responsável legal' && (
                                   <div className="space-y-4 col-span-full">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grau de parentesco (Ex: Avó, Tio...)</label>
                                      <input value={respondentRelation} onChange={e => setRespondentRelation(e.target.value)} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-primary" placeholder="Especifique o parentesco" />
                                   </div>
                                )}
                             </div>
                           </div>
                           
                           <div className="space-y-8">
                             {IF_SAHS_QUESTIONS.map((section, sidx) => (
                               <div key={sidx} className="bg-white p-8 rounded-[32px] border border-slate-100 atmospheric-shadow space-y-6">
                                 <h3 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm shadow-sm shrink-0">
                                     {sidx + 1}
                                   </div>
                                   {section.section}
                                 </h3>
                                 <div className="space-y-8 pl-4 border-l-2 border-slate-100 ml-4 py-2">
                                   {section.questions.map(q => (
                                     <div key={q.id} className="space-y-4">
                                       <label className="text-[15px] font-bold text-on-surface-variant flex items-start gap-3 opacity-90">
                                         <span className="text-primary mt-1 select-none">•</span> 
                                         {q.text}
                                       </label>
                                        <MultimodalInput 
                                          value={ifSahsAnswers[q.id] || ''} 
                                          onChange={(val) => handleIfSahsChange(q.id, val)}
                                          placeholder="Descreva aqui ou utilize o áudio para transcrever a resposta..." 
                                          initialReviewPending={currentPendingQuestions.includes(q.id)}
                                          initialAudio={currentAudioStorage[q.id]}
                                          onAudioCaptured={(base64) => {
                                            if (base64) {
                                              setCurrentAudioStorage(prev => ({...prev, [q.id]: base64}));
                                            } else {
                                              setCurrentAudioStorage(prev => { const n = {...prev}; delete n[q.id]; return n; });
                                            }
                                          }}
                                          onReviewPending={(isPending) => {
                                             if (isPending) setCurrentPendingQuestions(prev => Array.from(new Set([...prev, q.id])));
                                             else setCurrentPendingQuestions(prev => prev.filter(id => id !== q.id));
                                          }}
                                       />
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             ))}
                           </div>

                           <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 italic text-sm text-slate-400 flex items-center gap-4 shadow-sm">
                              <Sparkles size={18} className="text-primary opacity-40 shrink-0" />
                              "Ao salvar, a IA consolidará estas informações no perfil psicopedagógico do estudante."
                           </div>
                        </div>
                      ) : activeInstrumentId === 'DOC-ANALISE' ? (
                         <div className="space-y-12">
                            <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10 flex items-start gap-4">
                               <FileText className="text-primary mt-1" size={24} />
                               <div className="space-y-1">
                                  <p className="font-black text-on-surface uppercase tracking-tight">Análise Automática de Documentos</p>
                                  <p className="text-sm font-medium text-slate-500">Faça o upload de laudos médicos ou relatórios. O sistema extrairá informações relevantes.</p>
                               </div>
                            </div>
                            <div className="space-y-4">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome do Documento</label>
                               <input 
                                 type="text" 
                                 value={docName}
                                 onChange={e => setDocName(e.target.value)}
                                 placeholder="Ex: Laudo Neurológico - Dr. João" 
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm text-slate-700" 
                               />
                               
                               <label className="mt-4 w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 hover:scale-[1.01] transition-all group">
                                  <input type="file" className="hidden" onChange={e => e.target.files && setSelectedFile(e.target.files[0])} />
                                  <Plus size={36} className="text-slate-300 group-hover:text-primary transition-colors mb-4" />
                                  <p className="text-base font-bold text-slate-500 group-hover:text-primary mb-1 text-center px-4">
                                     {selectedFile ? selectedFile.name : 'Clique aqui para enviar seus arquivos ou arraste-os para cá'}
                                  </p>
                                  <p className="text-xs font-medium text-slate-400/60 uppercase tracking-widest">Suporta .PDF, .DOCX, .JPG, .PNG</p>
                               </label>
                            </div>
                         </div>
                       ) : (
                        <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                           <Plus className="mx-auto text-slate-200 mb-4" size={48} />
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Módulo de preenchimento para {activeInstrument?.name}</p>
                        </div>
                      )}
                      
                      <div className="pt-10 border-t border-slate-100 flex flex-col gap-4">
                         {currentPendingQuestions.length > 0 && (
                            <div className="p-4 bg-orange-50 text-orange-600 border border-orange-200 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                               <AlertTriangle size={18} className="shrink-0" /> 
                               Você possui transcrições de áudio pendentes. Confirme-as e exclua as gravações originais para liberar o salvamento definitivo.
                            </div>
                         )}
                         {activeInstrumentId === 'DOC-ANALISE' ? (
                            <button onClick={() => handleSave('ativo')} className="w-full bg-primary text-white py-6 rounded-3xl font-black text-base uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all">
                               <Sparkles size={20} /> Salvar e Analisar
                            </button>
                         ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <button 
                                  onClick={() => handleSave('rascunho')} 
                                  className="w-full py-6 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all bg-orange-50 text-orange-600 border border-orange-200 shadow-sm hover:brightness-95 active:scale-95"
                               >
                                  Salvar Provisoriamente (Rascunho)
                               </button>
                               <button 
                                  onClick={() => handleSave('ativo')} 
                                  disabled={currentPendingQuestions.length > 0}
                                  className={cn(
                                    "w-full py-6 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                                    currentPendingQuestions.length > 0 ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-primary text-white shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95"
                                  )}
                               >
                                  {fillingType === 'edit' ? 'Salvar Edição Final' : 'Salvar Documento Ativo'}
                               </button>
                            </div>
                         )}
                      </div>
                   </div>
                </div>
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
                      <button onClick={() => setView('details')} className="p-4 rounded-full hover:bg-black/5 text-slate-400">
                         <LayoutGrid size={24} />
                      </button>
                   </div>
                      
                   <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
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
                                    "As fontes apresentam convergência em 85%. Destaque para barreiras."
                                  </p>
                               </div>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-8">
                         <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck size={14} /> Eixos de Análise Técnica
                         </h3>
                         <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                            {[
                              { id: 'I', label: 'Eixo I: Diferenciação de demandas e barreiras', desc: 'Identificação inicial das barreiras individuais.' },
                              { id: 'II', label: 'Eixo II: Análise do Contexto Escolar', desc: 'Barreiras e facilitadores.' },
                            ].map((eixo) => (
                              <div key={eixo.id} className="p-8 pb-12 bg-white rounded-3xl border border-slate-100 atmospheric-shadow relative">
                                 <div className="flex items-center gap-4 mb-4">
                                    <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg">{eixo.id}</span>
                                    <p className="font-black text-on-surface text-lg leading-tight">{eixo.label}</p>
                                 </div>
                                 <MultimodalInput 
                                    value={inputText}
                                    onChange={setInputText}
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
                            <button onClick={() => setView('details')} className="w-full bg-[#1DB954] text-white py-7 rounded-[28px] font-black text-base uppercase tracking-[0.2em] shadow-xl shadow-green-500/20 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                               <span>Finalizar Consolidação</span>
                               <CheckCircle2 size={24} />
                            </button>
                         </div>
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
                      <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">{activeInstrumentId === 'IF-SAHS' ? 'Visualizador de Dados' : 'Relatórios de Versões'}</h3>
                   </div>
                   <button onClick={() => setView('details')} className="text-primary font-black text-xs uppercase underline">Voltar</button>
                </div>
                
                {activeInstrumentId === 'IF-SAHS' && selectedRecord ? (
                   <div className="space-y-6">
                      <div className="bg-white p-8 rounded-[32px] border border-slate-100 atmospheric-shadow flex justify-between items-center flex-wrap gap-4">
                         <div>
                            <p className="font-black text-on-surface text-xl leading-tight">Respondente: {selectedRecord.respondentName}</p>
                            <p className="text-slate-500 font-bold text-sm mt-1">{selectedRecord.respondentRole} {selectedRecord.respondentRelation ? `- ${selectedRecord.respondentRelation}` : ''}</p>
                            <p className="text-xs text-slate-400 font-bold mt-2 flex items-center gap-2"><Clock size={12} /> {selectedRecord.type === 'versao_inicial' ? 'Versão Inicial' : 'Atualização'} registrada em: {selectedRecord.date}</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <button onClick={() => { 
                               setRespondentName(selectedRecord.respondentName);
                               setRespondentRole(selectedRecord.respondentRole);
                               setRespondentRelation(selectedRecord.respondentRelation || '');
                               setIfSahsAnswers(selectedRecord.answers);
                               setFillingType('edit');
                               setView('filling');
                            }} className="px-4 py-3 border border-slate-200 bg-slate-50 text-slate-500 font-black text-[10px] uppercase rounded-xl tracking-widest hover:border-primary hover:text-primary hover:bg-white transition-all flex items-center gap-2">
                               <PencilRuler size={14} /> Editar
                            </button>
                            {selectedRecord.status === 'arquivado' && (
                               <button onClick={() => { setIfSahsRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, status: 'ativo' } : r)); alert('Voltou a ficar ativo!'); setView('details'); }} className="px-6 py-3 bg-primary text-white font-black text-[10px] uppercase rounded-xl tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">Desarquivar Registro</button>
                            )}
                         </div>
                      </div>
                      
                      {IF_SAHS_QUESTIONS.map(sec => (
                         <div key={sec.section} className="bg-white p-10 rounded-[32px] border border-slate-100 atmospheric-shadow space-y-8">
                            <h4 className="font-black text-primary uppercase tracking-tight">{sec.section}</h4>
                            <div className="space-y-6 pl-2 border-l-2 border-slate-100 ml-2">
                               {sec.questions.map(q => (
                                  <div key={q.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                     <p className="font-bold text-slate-700 text-sm mb-4 leading-relaxed">{q.text}</p>
                                     <div className="bg-white p-4 rounded-xl border border-slate-100">
                                        <p className="text-slate-600 font-medium whitespace-pre-wrap">{selectedRecord.answers[q.id] || <span className="text-slate-400 italic">Preenchimento vazio neste campo.</span>}</p>
                                     </div>
                                  </div>
                               ))}
                            </div>
                         </div>
                      ))}

                      {selectedRecord.updates && selectedRecord.updates.length > 0 && (
                         <>
                            <hr className="my-8 border-slate-200" />
                            <div className="space-y-6">
                               <h4 className="font-black text-on-surface text-lg flex items-center gap-2"><History className="text-primary" /> Evolução do Caso</h4>
                               <div className="space-y-4">
                                  {selectedRecord.updates.map((upd, i) => (
                                     <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 w-full space-y-4 atmospheric-shadow">
                                        <div className="flex items-center justify-between">
                                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><UserIcon size={12}/>{upd.person}</span>
                                           <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={12}/>{upd.date}</span>
                                        </div>
                                        <p className="text-slate-700 font-medium whitespace-pre-wrap">{upd.text}</p>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         </>
                      )}

                      {selectedRecord.status === 'ativo' && (
                         <div className="pt-8">
                            {isAddingUpdate ? (
                               <div className="bg-white p-6 rounded-[32px] border border-slate-200 atmospheric-shadow space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                  <h4 className="font-black text-slate-700 text-sm tracking-widest uppercase flex items-center gap-2 ml-2">
                                     <TrendingUp size={16} className="text-primary" /> Nova Evolução
                                  </h4>
                                  <MultimodalInput 
                                     value={updateText}
                                     onChange={(val) => setUpdateText(val)}
                                     placeholder="Descreva aqui o novo episódio, observação ou alteração no contexto familiar..."
                                     onReviewPending={(isPending) => {
                                        if (isPending) setCurrentPendingQuestions(prev => Array.from(new Set([...prev, 'evo_update'])));
                                        else setCurrentPendingQuestions(prev => prev.filter(id => id !== 'evo_update'));
                                     }}
                                  />
                                  <div className="flex items-center gap-3 justify-end pt-2">
                                     <button onClick={() => { setIsAddingUpdate(false); setUpdateText(''); setCurrentPendingQuestions([]); }} className="px-5 py-2.5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-all">Cancelar</button>
                                     <button 
                                        disabled={currentPendingQuestions.length > 0}
                                        onClick={() => {
                                        if (!updateText.trim()) return;
                                        const novaEvo = { date: new Date().toLocaleDateString('pt-BR'), person: 'Você', text: updateText };
                                        setIfSahsRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, updates: [...(r.updates || []), novaEvo] } : r));
                                        setSelectedRecord(prev => prev ? { ...prev, updates: [...(prev.updates || []), novaEvo] } : null);
                                        setUpdateText('');
                                        setIsAddingUpdate(false);
                                     }} className={cn("px-6 py-3 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md", currentPendingQuestions.length > 0 ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" : "bg-primary text-white shadow-primary/20 hover:bg-primary/90")}>Salvar Atualização</button>
                                  </div>
                               </div>
                            ) : (
                               <button 
                                 onClick={() => setIsAddingUpdate(true)} 
                                 className="w-full bg-slate-50 text-slate-500 py-6 rounded-3xl font-black text-xs uppercase tracking-widest border-2 border-slate-200 border-dashed hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-3"
                               >
                                  <Plus size={20} /> Adicionar Atualização aos Fatos
                               </button>
                            )}
                         </div>
                      )}
                   </div>
                ) : (
                  <div className="grid gap-4">
                    {[1, 2].map(v => (
                      <div key={v} className="bg-white p-8 rounded-[32px] border border-slate-100 atmospheric-shadow flex items-center justify-between group hover:border-primary transition-all">
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-xl">
                               {v}
                            </div>
                            <div>
                               <p className="font-black text-on-surface text-lg">Versão salva em {v === 1 ? '25/03/2024' : 'Ontem'}</p>
                               <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Responsável: Professor Maria Silva</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => alert(`Conteúdo: ${inputText || 'Sem dados textuais'}`)}
                           className="px-6 py-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:bg-primary/10 hover:text-primary transition-all tracking-widest"
                         >
                            Visualizar Dados
                         </button>
                      </div>
                    ))}
                  </div>
                )}
             </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
