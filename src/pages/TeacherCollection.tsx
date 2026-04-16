import React, { useState } from 'react';
import { 
  ClipboardList, User, GraduationCap, 
  Star, Target, AlertCircle, Plus, 
  Trash2, Send, CheckCircle2, ChevronRight, ChevronLeft,
  Sparkles, Brain, Trophy, Heart, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/Navigation';
import { MultimodalInput } from '../components/MultimodalInput';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface Suggestion {
  id: string;
  component: string;
  content: string;
  methodology: string;
}

export default function TeacherCollection() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States
  const [respondentName, setRespondentName] = useState('');
  const [role, setRole] = useState<'Professor' | 'Professor do AEE' | 'PAE - Mediador' | ''>('');
  const [discipline, setDiscipline] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [scaleValues, setScaleValues] = useState<Record<number, number>>({});
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [otherInterests, setOtherInterests] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    { id: '1', component: '', content: '', methodology: '' }
  ]);
  const [hasStrategy, setHasStrategy] = useState<'sim' | 'nao' | ''>('');

  const scaleItems = [
    "Tem facilidade para aprender",
    "Demonstra vocabulário avançado para a idade/série",
    "Tem facilidade em fazer conexões entre disciplinas",
    "Mantém foco prolongado em temas específicos",
    "Mostra grande curiosidade e questiona frequentemente",
    "Resolve problemas de forma criativa, fora do convencional",
    "Propõe ideias ou soluções inusitadas em atividades",
    "Gosta de reinventar tarefas ou desafios propostos",
    "Expressa-se através de humor, sarcasmo, analogias ou metáforas",
    "Cria histórias, desenhos ou jogos únicos",
    "Mostra paixão por tópicos específicos",
    "Busca ativamente materiais ou atividades além do currículo",
    "Fica frustrado com tarefas repetitivas ou pouco desafiadoras",
    "Se entedia facilmente com conteúdos apresentados em sala",
    "Se distrai facilmente quando não está desafiado",
    "Sensível a injustiças ou questões éticas (ex.: defende colegas)",
    "Prefere trabalhar sozinho ou com alunos de mesma habilidade",
    "Questiona regras ou autoridades quando não vê lógica nelas",
    "Coopera bem em grupos",
    "Tem grande atenção aos detalhes"
  ];

  const handleInterestToggle = (area: string) => {
    setSelectedInterests(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const addSuggestion = () => {
    setSuggestions([...suggestions, { id: Date.now().toString(), component: '', content: '', methodology: '' }]);
  };

  const removeSuggestion = (id: string) => {
    setSuggestions(suggestions.filter(s => s.id !== id));
  };

  const updateSuggestion = (id: string, field: keyof Suggestion, value: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from('ip_sahs_responses')
        .insert([{
          student_id: studentId,
          respondent_name: respondentName,
          role: role,
          discipline: discipline,
          behavioral_profile: scaleValues,
          other_behaviors: answers['other_behaviors'] || '',
          social_interaction_option: answers['social_interaction_option'] || '',
          social_interaction_example: answers['social_interaction_example'] || '',
          desafios_reacao_option: answers['desafios_reacao_option'] || '',
          desafios_reacao_example: answers['desafios_reacao_example'] || '',
          areas_of_interest: selectedInterests,
          other_interests: otherInterests,
          potentialities_response: answers['comp2'] || '',
          pedagogical_difficulties_response: answers['diff1'] || '',
          demotivation_signs_response: answers['diff2'] || '',
          needs_pedagogical: answers['ped'] || '',
          needs_behavioral: answers['comp'] || '',
          needs_emotional: answers['emo'] || '',
          adopted_strategy: hasStrategy === 'sim',
          strategy_experience_response: answers['strategy'] || '',
          suggestions: suggestions,
          is_completed: true,
          completed_at: new Date().toISOString()
        }]);

      if (dbError) throw dbError;
      setSuccess(true);
      setTimeout(() => navigate(`/students/${studentId}/case-study`), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-[#1DB954] rounded-full flex items-center justify-center text-white mb-8 shadow-xl shadow-green-500/20"
        >
          <CheckCircle2 size={48} strokeWidth={3} />
        </motion.div>
        <h2 className="text-4xl font-black text-on-surface mb-4 tracking-tight">Inventário Enviado!</h2>
        <p className="text-on-surface-variant max-w-md opacity-70 mb-10 leading-relaxed font-medium">Os dados foram registrados com sucesso e já estão disponíveis para análise.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <TopBar />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header de Apresentação */}
        <div className="mb-12 flex flex-col items-center">
           <div className="flex w-full justify-start mb-8">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-all"
              >
                 <ChevronLeft size={16} /> Voltar ao Estudo
              </button>
           </div>
           
           <motion.div 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-6"
           >
              <ClipboardList size={14} />
              Módulo IP-SAHS
           </motion.div>
           <h1 className="text-5xl font-black text-on-surface tracking-tight mb-4 text-center">Inventário Pedagógico</h1>
           <p className="text-on-surface-variant font-medium opacity-60 max-w-2xl mx-auto text-lg text-center">
             Este instrumento coleta a percepção técnica do professor sobre o perfil cognitivo, comportamental e as necessidades de suplementação do estudante.
           </p>
        </div>

        <div className="space-y-12">
           {/* Identificação do Profissional */}
           <section className="bg-white rounded-[40px] p-10 atmospheric-shadow border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0" />
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                       <User size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-on-surface">Identificação do Profissional</h2>
                 </div>

                 <div className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo do Respondente</label>
                       <input 
                         type="text" 
                         value={respondentName}
                         onChange={(e) => setRespondentName(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                         placeholder="Digite seu nome..."
                       />
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo / Função</label>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { id: 'Professor', label: 'Professor', icon: GraduationCap },
                            { id: 'Professor do AEE', label: 'Professor do AEE', icon: Brain },
                            { id: 'PAE - Mediador', label: 'PAE - Mediador', icon: User }
                          ].map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setRole(item.id as any)}
                              className={cn(
                                "flex items-center gap-3 p-5 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest text-left",
                                role === item.id 
                                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                  : "bg-white text-slate-400 border-slate-100 hover:border-primary/30"
                              )}
                            >
                               <item.icon size={18} className="shrink-0" />
                               {item.label}
                            </button>
                          ))}
                       </div>
                    </div>

                    <AnimatePresence>
                       {role === 'Professor' && (
                         <motion.div 
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           exit={{ opacity: 0, height: 0 }}
                           className="space-y-3 overflow-hidden"
                         >
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Disciplina(s) que leciona</label>
                            <input 
                              type="text" 
                              value={discipline}
                              onChange={(e) => setDiscipline(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                              placeholder="Ex: Matemática, Física..."
                            />
                         </motion.div>
                       )}
                    </AnimatePresence>
                 </div>
              </div>
           </section>

           {/* Bloco I - Perfil do Aluno */}
           <section className="bg-white rounded-[40px] p-10 atmospheric-shadow border border-slate-100">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
                    <Star size={24} />
                 </div>
                 <h2 className="text-2xl font-black text-on-surface">Bloco I - Perfil do Aluno</h2>
              </div>
              <p className="text-sm font-medium text-on-surface mb-8">O aluno apresenta os seguintes comportamentos:</p>

              <div className="space-y-1">
                 <div className="hidden md:grid grid-cols-[30px_1fr_auto] gap-4 px-6 py-4 bg-slate-50 rounded-2xl mb-2 border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nº</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição do Comportamento</span>
                    <div className="w-[240px] flex flex-col items-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Frequência</span>
                       <span className="text-[10px] font-black text-slate-400 tracking-widest mt-1 opacity-60">← Pouco – Muito →</span>
                    </div>
                 </div>

                  {scaleItems.map((text, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-[24px_1fr_auto] items-center gap-4 py-1 px-3 md:px-6 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/20 transition-all group">
                       <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center font-black text-[9px] text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                          {idx + 1}
                       </div>

                       <p className="font-bold text-on-surface text-sm whitespace-nowrap overflow-hidden text-ellipsis pr-4">{text}</p>

                       <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-100 shadow-sm w-fit md:w-[240px] justify-between">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                               key={num}
                               onClick={() => setScaleValues({ ...scaleValues, [idx]: num })}
                               className={cn(
                                 "w-7 h-7 rounded-md font-black text-[10px] transition-all active:scale-90",
                                 scaleValues[idx] === num 
                                   ? "bg-primary text-white shadow-md shadow-primary/20 scale-105" 
                                   : "text-slate-300 hover:bg-slate-50 hover:text-primary"
                               )}
                             >
                                {num}
                             </button>
                          ))}
                       </div>
                    </div>
                  ))}

                  <div className="pt-4 pb-2 space-y-4">
                     <label className="text-xs font-black text-on-surface uppercase tracking-tight">Outros comportamentos observados e não listados:</label>
                     <MultimodalInput value={answers['other_behaviors'] || ''} onChange={(val) => setAnswers({...answers, other_behaviors: val})} placeholder="Descreva aqui..." />
                  </div>

                  <div className="pt-8 space-y-12">
                     <div className="space-y-6">
                        <label className="text-lg font-black text-on-surface tracking-tight leading-tight">Como é a interação do aluno com colegas e professores?</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {[
                             "Extrovertido e comunicativo",
                             "Reservado, mas socializa bem",
                             "Prefere interações com adultos ou alunos mais velhos",
                             "Tem dificuldades para se entrosar socialmente"
                           ].map(opt => (
                             <label key={opt} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-primary/30 transition-all group">
                                <input 
                                  type="radio" name="social_inter" value={opt} 
                                  checked={answers['social_interaction_option'] === opt}
                                  onChange={() => setAnswers({...answers, social_interaction_option: opt})}
                                  className="w-4 h-4 text-primary focus:ring-primary" 
                                />
                                <span className={cn("text-xs font-bold transition-colors", answers['social_interaction_option'] === opt ? "text-primary" : "text-slate-500 group-hover:text-on-surface")}>{opt}</span>
                             </label>
                           ))}
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relate exemplo(s):</p>
                           <MultimodalInput value={answers['social_interaction_example'] || ''} onChange={(val) => setAnswers({...answers, social_interaction_example: val})} placeholder="Relate aqui..." />
                        </div>
                     </div>

                     <div className="space-y-6">
                        <label className="text-lg font-black text-on-surface tracking-tight leading-tight">Como o aluno reage a desafios e frustrações?</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {[
                             "Enfrenta desafios com entusiasmo",
                             "Fica ansioso e evita desafios difíceis",
                             "Tem medo de errar e demonstra perfeccionismo",
                             "Desiste rapidamente quando encontra dificuldades"
                           ].map(opt => (
                             <label key={opt} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-primary/30 transition-all group">
                                <input 
                                  type="radio" name="challenge_react" value={opt} 
                                  checked={answers['desafios_reacao_option'] === opt}
                                  onChange={() => setAnswers({...answers, desafios_reacao_option: opt})}
                                  className="w-4 h-4 text-primary focus:ring-primary" 
                                />
                                <span className={cn("text-xs font-bold transition-colors", answers['desafios_reacao_option'] === opt ? "text-primary" : "text-slate-500 group-hover:text-on-surface")}>{opt}</span>
                             </label>
                           ))}
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relate exemplo(s):</p>
                           <MultimodalInput value={answers['desafios_reacao_example'] || ''} onChange={(val) => setAnswers({...answers, desafios_reacao_example: val})} placeholder="Relate aqui..." />
                        </div>
                     </div>
                  </div>
              </div>
           </section>

           {/* Bloco II - Áreas de Interesse */}
           <section className="bg-white rounded-[40px] p-10 atmospheric-shadow border border-slate-100">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                    <Trophy size={24} />
                 </div>
                 <h2 className="text-2xl font-black text-on-surface">Bloco II - Áreas de Interesse</h2>
              </div>

              <div className="space-y-12">
                 <div className="space-y-4">
                    <label className="text-sm font-black text-on-surface tracking-tight leading-tight">Quais áreas do conhecimento ou tipos de atividades você percebe que o estudante tem maior habilidade, interesse ou engajamento? (Marque todas as que se aplicam)</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       {['Linguagens', 'Matemática', 'Ciências', 'Artes Visuais', 'Música', 'Dança', 'Teatro', 'Esportes', 'Tecnologia'].map(area => (
                         <label key={area} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:border-green-300 transition-all group">
                            <input 
                              type="checkbox" 
                              checked={selectedInterests.includes(area)}
                              onChange={() => handleInterestToggle(area)}
                              className="w-5 h-5 rounded-md border-slate-300 text-green-600 focus:ring-green-500" 
                            />
                            <span className="font-bold text-slate-600 text-sm group-hover:text-on-surface transition-colors">{area}</span>
                         </label>
                       ))}
                       <div className="col-span-full mt-2">
                          <input 
                            type="text" 
                            value={otherInterests}
                            onChange={(e) => setOtherInterests(e.target.value)}
                            placeholder="Outros..." 
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-on-surface focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-lg font-black text-on-surface tracking-tight leading-tight">Quais as potencialidades apresentadas pelo aluno?</label>
                    <MultimodalInput value={answers['comp2'] || ''} onChange={(val) => setAnswers({...answers, comp2: val})} placeholder="Grave ou digite as virtudes observadas..." />
                 </div>
              </div>
           </section>

           {/* Bloco III - Desafios e Necessidades */}
           <section className="bg-white rounded-[40px] p-10 atmospheric-shadow border border-slate-100">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <AlertCircle size={24} />
                 </div>
                 <h2 className="text-2xl font-black text-on-surface">Bloco III - Desafios e Necessidades educacionais</h2>
              </div>

              <div className="space-y-12">
                 <div className="space-y-4">
                    <p className="text-lg font-black text-on-surface tracking-tight leading-tight">O aluno apresenta dificuldades pedagógicas em alguma disciplina ou assunto?</p>
                    <MultimodalInput value={answers['diff1'] || ''} onChange={(val) => setAnswers({...answers, diff1: val})} placeholder="Descreva aqui..." />
                 </div>

                 <div className="space-y-4">
                    <p className="text-lg font-black text-on-surface tracking-tight leading-tight">O aluno demonstra sinais de desmotivação na escola? Como isso se manifesta?</p>
                    <MultimodalInput value={answers['diff2'] || ''} onChange={(val) => setAnswers({...answers, diff2: val})} placeholder="Ex: falta de participação, tédio..." />
                 </div>

                 <div className="pt-8 border-t border-slate-50 space-y-10">
                    <h3 className="text-sm font-black text-primary uppercase tracking-tight">Quais são, na sua opinião, as maiores necessidades desse aluno?</h3>
                    
                    {[
                      { id: 'ped', title: 'Necessidades Pedagógicas', icon: GraduationCap, color: 'text-blue-500' },
                      { id: 'comp', title: 'Necessidades Comportamentais', icon: Activity, color: 'text-purple-500' },
                      { id: 'emo', title: 'Necessidades Emocionais', icon: Heart, color: 'text-red-500' },
                    ].map(n => (
                      <div key={n.id} className="space-y-4 p-8 bg-slate-50/50 rounded-[32px] border border-slate-100">
                         <div className="flex items-center gap-3">
                            <n.icon className={n.color} size={20} />
                            <p className="font-black text-on-surface uppercase tracking-widest text-[10px]">{n.title}</p>
                         </div>
                         <MultimodalInput value={answers[n.id] || ''} onChange={(val) => setAnswers({...answers, [n.id]: val})} placeholder="Detalhamento analítico..." />
                      </div>
                    ))}
                 </div>
              </div>
           </section>

           {/* Bloco IV - Suplementação */}
           <section className="bg-white rounded-[40px] p-10 atmospheric-shadow border border-slate-100">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Target size={24} />
                 </div>
                 <h2 className="text-2xl font-black text-on-surface">Bloco IV - Sugestões para Suplementação</h2>
              </div>

              <div className="space-y-12">
                 <div className="space-y-6">
                    <p className="text-lg font-black text-on-surface tracking-tight">Você já adotou alguma estratégia pedagógica com esse aluno que foi eficaz?</p>
                    <div className="flex gap-4">
                       {['Sim', 'Não'].map(opt => (
                         <button
                           key={opt}
                           onClick={() => setHasStrategy(opt.toLowerCase() as any)}
                           className={cn(
                             "flex-1 py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all",
                             hasStrategy === opt.toLowerCase() 
                               ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                               : "bg-white text-slate-400 border-slate-100 hover:border-primary/30"
                           )}
                         >
                            {opt}
                         </button>
                       ))}
                    </div>
                    <AnimatePresence>
                       {hasStrategy === 'sim' && (
                         <motion.div 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: 10 }}
                           className="space-y-4 pt-4"
                         >
                            <label className="text-sm font-bold text-on-surface-variant">Se sim, qual(is) e como foi a experiência?</label>
                            <MultimodalInput value={answers['strategy'] || ''} onChange={(val) => setAnswers({...answers, strategy: val})} />
                         </motion.div>
                       )}
                    </AnimatePresence>
                 </div>

                 <div className="space-y-6 pt-8 border-t border-slate-50">
                    <div className="flex items-center justify-between">
                       <h3 className="text-lg font-black text-on-surface tracking-tight">Você teria sugestões para o plano de suplementação?</h3>
                       <button 
                         onClick={addSuggestion}
                         className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
                       >
                          <Plus size={14} /> Adicionar
                       </button>
                    </div>

                    <div className="space-y-6">
                       {suggestions.map((s, idx) => (
                         <div key={s.id} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 relative group animate-in slide-in-from-bottom-2">
                            {suggestions.length > 1 && (
                              <button 
                                onClick={() => removeSuggestion(s.id)}
                                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                 <Trash2 size={18} />
                              </button>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Componente Curricular</label>
                                  <input 
                                    type="text" 
                                    value={s.component}
                                    onChange={(e) => updateSuggestion(s.id, 'component', e.target.value)}
                                    className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-primary" 
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Conteúdo</label>
                                  <input 
                                    type="text" 
                                    value={s.content}
                                    onChange={(e) => updateSuggestion(s.id, 'content', e.target.value)}
                                    className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-primary" 
                                  />
                               </div>
                               <div className="col-span-full space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Metodologia</label>
                                  <input 
                                    type="text" 
                                    value={s.methodology}
                                    onChange={(e) => updateSuggestion(s.id, 'methodology', e.target.value)}
                                    className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-primary" 
                                  />
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </section>

           {/* Ação Final */}
           <div className="pt-12">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-[#1DB954] text-white py-8 rounded-[32px] font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-4"
              >
                 {loading ? (
                   <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                 ) : (
                   <>
                     <Send size={24} />
                     Finalizar e Enviar Inventário Pedagógico
                   </>
                 )}
              </button>
              {error && (
                <p className="mt-4 text-red-500 font-bold text-sm text-center bg-red-50 p-4 rounded-2xl border border-red-100">
                  {error}
                </p>
              )}
           </div>
        </div>
      </main>
    </div>
  );
}
