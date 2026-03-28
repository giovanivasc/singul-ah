import React, { useState } from 'react';
import { 
  ClipboardList, User, GraduationCap, 
  Star, Target, AlertCircle, Plus, 
  Trash2, Send, CheckCircle2, ChevronRight, ChevronLeft,
  Sparkles, Brain, Trophy, Heart, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from '../components/Navigation';
import { MultimodalInput } from '../components/MultimodalInput';
import { cn } from '../lib/utils';

interface Suggestion {
  id: string;
  component: string;
  content: string;
  methodology: string;
}

export default function TeacherCollection() {
  const [role, setRole] = useState<'professor' | 'aee' | 'pae' | ''>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    { id: '1', component: '', content: '', methodology: '' }
  ]);
  const [hasStrategy, setHasStrategy] = useState<'sim' | 'nao' | ''>('');
  const [scaleValues, setScaleValues] = useState<Record<number, number>>({});

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
    "Mostra paixão por tópicos específicos"
  ];

  const addSuggestion = () => {
    setSuggestions([...suggestions, { id: Date.now().toString(), component: '', content: '', methodology: '' }]);
  };

  const removeSuggestion = (id: string) => {
    setSuggestions(suggestions.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <TopBar />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header de Apresentação */}
        <div className="mb-12 flex flex-col items-center">
           <div className="flex w-full justify-start mb-8">
              <button 
                onClick={() => window.history.back()}
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
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                         placeholder="Digite seu nome..."
                       />
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo / Função</label>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { id: 'professor', label: 'Professor', icon: GraduationCap },
                            { id: 'aee', label: 'Professor do AEE', icon: Brain },
                            { id: 'pae', label: 'PAE - Mediador', icon: User }
                          ].map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setRole(item.id as any)}
                              className={cn(
                                "flex items-center gap-3 p-5 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest",
                                role === item.id 
                                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                  : "bg-white text-slate-400 border-slate-100 hover:border-primary/30"
                              )}
                            >
                               <item.icon size={18} />
                               {item.label}
                            </button>
                          ))}
                       </div>
                    </div>

                    <AnimatePresence>
                       {role === 'professor' && (
                         <motion.div 
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           exit={{ opacity: 0, height: 0 }}
                           className="space-y-3 overflow-hidden"
                         >
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Disciplina(s) que leciona</label>
                            <input 
                              type="text" 
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
              <p className="text-sm font-medium text-slate-400 mb-10">Avalie a frequência dos comportamentos abaixo (1: Pouco - 5: Muito).</p>

              <div className="space-y-10">
                 {scaleItems.map((text, idx) => (
                   <div key={idx} className="space-y-4">
                      <p className="font-bold text-on-surface leading-tight">{text}</p>
                      <div className="flex gap-2">
                         {[1, 2, 3, 4, 5].map((num) => (
                           <button
                             key={num}
                             onClick={() => setScaleValues({ ...scaleValues, [idx]: num })}
                             className={cn(
                               "w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black transition-all active:scale-90",
                               scaleValues[idx] === num 
                                 ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                 : "bg-white text-slate-400 border-slate-100 hover:border-primary/30"
                             )}
                           >
                              {num}
                           </button>
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
           </section>

           {/* Bloco II - Habilidades e Talentos */}
           <section className="bg-white rounded-[40px] p-10 atmospheric-shadow border border-slate-100">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                    <Trophy size={24} />
                 </div>
                 <h2 className="text-2xl font-black text-on-surface">Bloco II - Áreas de Interesse e Talentos</h2>
              </div>

              <div className="space-y-12">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quais áreas o estudante tem maior habilidade?</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       {['Linguagens', 'Matemática', 'Ciências', 'Artes Visuais', 'Música', 'Dança', 'Teatro', 'Esportes', 'Tecnologia'].map(area => (
                         <label key={area} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:border-green-300 transition-all group">
                            <input type="checkbox" className="w-5 h-5 rounded-md border-slate-300 text-green-600 focus:ring-green-500" />
                            <span className="font-bold text-slate-600 text-sm group-hover:text-on-surface transition-colors">{area}</span>
                         </label>
                       ))}
                       <div className="col-span-full mt-2">
                          <input 
                            type="text" 
                            placeholder="Outros..." 
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-on-surface focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-lg font-black text-on-surface tracking-tight leading-tight">Quais as potencialidades apresentadas pelo aluno?</label>
                    <MultimodalInput value="" onChange={() => {}} placeholder="Grave ou digite as virtudes observadas..." />
                 </div>
              </div>
           </section>

           {/* Bloco III - Desafios */}
           <section className="bg-white rounded-[40px] p-10 atmospheric-shadow border border-slate-100">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <AlertCircle size={24} />
                 </div>
                 <h2 className="text-2xl font-black text-on-surface">Bloco III - Desafios e Necessidades</h2>
              </div>

              <div className="space-y-12">
                 <div className="space-y-4">
                    <p className="text-lg font-black text-on-surface tracking-tight leading-tight">O aluno apresenta dificuldades pedagógicas em alguma disciplina ou assunto?</p>
                    <MultimodalInput value="" onChange={() => {}} placeholder="Descreva aqui..." />
                 </div>

                 <div className="space-y-4">
                    <p className="text-lg font-black text-on-surface tracking-tight leading-tight">O aluno demonstra sinais de desmotivação na escola? Como isso se manifesta?</p>
                    <MultimodalInput value="" onChange={() => {}} placeholder="Ex: falta de participação, tédio..." />
                 </div>

                 <div className="pt-8 border-t border-slate-50 space-y-10">
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Matriz de Necessidades</h3>
                    
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
                         <MultimodalInput value="" onChange={() => {}} placeholder="Detalhamento analítico..." />
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
                            <MultimodalInput value="" onChange={() => {}} />
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
                                  <input type="text" className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-primary" />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Conteúdo</label>
                                  <input type="text" className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-primary" />
                               </div>
                               <div className="col-span-full space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Metodologia</label>
                                  <input type="text" className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-primary" />
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
              <button className="w-full bg-[#1DB954] text-white py-8 rounded-[32px] font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                 <Send size={24} />
                 Finalizar e Enviar Inventário Pedagógico
              </button>
           </div>
        </div>
      </main>
    </div>
  );
}
