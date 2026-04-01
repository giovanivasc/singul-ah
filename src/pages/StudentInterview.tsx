import React, { useState } from 'react';
import { 
  MessageSquare, User, School, Laptop, 
  Send, ChevronLeft, Sparkles, Heart,
  Brain, Rocket, Smile, Gamepad2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/Navigation';
import { MultimodalInput } from '../components/MultimodalInput';

export default function StudentInterview() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <TopBar />
      
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Botão Voltar */}
        <div className="mb-8 flex justify-start">
           <button 
             onClick={() => navigate(-1)}
             className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-all"
           >
              <ChevronLeft size={16} /> Voltar ao Estudo
           </button>
        </div>

        {/* Header e Card de Apresentação */}
        <div className="text-center mb-12">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 rounded-full text-primary font-black text-[12px] uppercase tracking-[0.2em] mb-8"
           >
              <MessageSquare size={16} />
              Roteiro de Entrevista
           </motion.div>
           <h1 className="text-5xl font-black text-on-surface tracking-tight mb-6">Entrevista com o Estudante</h1>
           
           <section className="bg-white rounded-[40px] p-10 atmospheric-shadow border border-slate-100 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                 <div className="w-20 h-20 rounded-[28px] bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20 shrink-0">
                    <User size={40} />
                 </div>
                 <p className="text-xl font-bold text-on-surface-variant leading-relaxed opacity-80">
                   Olá! Queremos conhecer mais sobre você, seus gostos e como você aprende. Fique à vontade para digitar ou usar o microfone para gravar as suas respostas!
                 </p>
              </div>
           </section>
        </div>

        <div className="space-y-20">
           {/* Bloco I */}
           <section className="space-y-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Rocket size={24} />
                 </div>
                 <h2 className="text-2xl font-black text-on-surface uppercase tracking-tight">Bloco I – SOU CURIOSO PARA...</h2>
              </div>

              <div className="space-y-12">
                 <div className="space-y-4 bg-white p-8 rounded-[36px] atmospheric-shadow border border-slate-50">
                    <p className="text-lg font-black text-on-surface leading-tight tracking-tight">1. Quando você não está na escola o que gosta de fazer?</p>
                    <MultimodalInput value={answers['q1'] || ''} onChange={(val) => setAnswers({...answers, q1: val})} placeholder="Grave ou digite aqui..." />
                 </div>

                 <div className="space-y-4 bg-white p-8 rounded-[36px] atmospheric-shadow border border-slate-50">
                    <p className="text-lg font-black text-on-surface leading-tight tracking-tight">2. Há algo que você aprendeu sozinho(a), pesquisando, vendo vídeos ou só por curiosidade?</p>
                    <MultimodalInput value={answers['q2'] || ''} onChange={(val) => setAnswers({...answers, q2: val})} placeholder="Conte para a gente..." />
                 </div>

                 <div className="space-y-4 bg-white p-8 rounded-[36px] atmospheric-shadow border border-slate-50">
                    <p className="text-lg font-black text-on-surface leading-tight tracking-tight">3. Há algo que você gostaria muito de aprender, mas ainda não teve a oportunidade? O que é?</p>
                    <MultimodalInput value={answers['q3'] || ''} onChange={(val) => setAnswers({...answers, q3: val})} placeholder="O que você sonha em aprender?" />
                 </div>

                 <div className="space-y-4 bg-white p-8 rounded-[36px] atmospheric-shadow border border-slate-50">
                    <p className="text-lg font-black text-on-surface leading-tight tracking-tight">4. Quando você tenta fazer algo e não consegue como você se sente? (Ex.: Tenta até conseguir, pede ajuda, desiste, fica nervoso, tenta entender o erro...)</p>
                    <MultimodalInput value={answers['q4'] || ''} onChange={(val) => setAnswers({...answers, q4: val})} placeholder="Como você reage?" />
                 </div>
              </div>
           </section>

           {/* Bloco II */}
           <section className="space-y-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <School size={24} />
                 </div>
                 <h2 className="text-2xl font-black text-on-surface uppercase tracking-tight">Bloco II – A ESCOLA PARA MIM É...</h2>
              </div>

              <div className="space-y-12">
                 <div className="bg-white p-10 rounded-[40px] atmospheric-shadow border border-slate-50 space-y-10">
                    <div className="flex items-center gap-3">
                       <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">5</span>
                       <p className="text-xl font-black text-on-surface tracking-tight">Sobre a escola:</p>
                    </div>
                    
                    <div className="grid gap-10 pl-11 border-l-2 border-slate-100 ml-4">
                       <div className="space-y-4">
                          <p className="font-bold text-on-surface-variant flex items-center gap-2 italic">
                             <Smile className="text-primary" size={18} /> O que você mais gosta nela?
                          </p>
                          <MultimodalInput value={answers['q5a'] || ''} onChange={(val) => setAnswers({...answers, q5a: val})} />
                       </div>
                       <div className="space-y-4">
                          <p className="font-bold text-on-surface-variant flex items-center gap-2 italic">
                             O que você não gosta nela?
                          </p>
                          <MultimodalInput value={answers['q5b'] || ''} onChange={(val) => setAnswers({...answers, q5b: val})} />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4 bg-white p-8 rounded-[36px] atmospheric-shadow border border-slate-50">
                    <p className="text-lg font-black text-on-surface leading-tight tracking-tight">6. Se você pudesse mudar alguma coisa na escola o que seria?</p>
                    <MultimodalInput value={answers['q6'] || ''} onChange={(val) => setAnswers({...answers, q6: val})} />
                 </div>

                 <div className="bg-white p-10 rounded-[40px] atmospheric-shadow border border-slate-50 space-y-10">
                    <div className="flex items-center gap-3">
                       <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">7</span>
                       <p className="text-xl font-black text-on-surface tracking-tight">Sobre as matérias/disciplinas:</p>
                    </div>
                    
                    <div className="grid gap-10 pl-11 border-l-2 border-slate-100 ml-4">
                       <div className="space-y-4">
                          <p className="font-bold text-on-surface-variant italic">Qual(is) você mais gosta?</p>
                          <MultimodalInput value={answers['q7a'] || ''} onChange={(val) => setAnswers({...answers, q7a: val})} />
                       </div>
                       <div className="space-y-4">
                          <p className="font-bold text-on-surface-variant italic">Qual(is) você não gosta muito?</p>
                          <MultimodalInput value={answers['q7b'] || ''} onChange={(val) => setAnswers({...answers, q7b: val})} />
                       </div>
                    </div>
                 </div>

                 <div className="bg-white p-10 rounded-[40px] atmospheric-shadow border border-slate-50 space-y-10">
                    <div className="flex items-center gap-3">
                       <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">8</span>
                       <p className="text-xl font-black text-on-surface tracking-tight">Sobre as aulas/atividades:</p>
                    </div>
                    
                    <div className="grid gap-10 pl-11 border-l-2 border-slate-100 ml-4">
                       <div className="space-y-4">
                          <p className="font-bold text-on-surface-variant flex items-center gap-2 italic">
                             O que faz uma atividade/aula muito legal?
                          </p>
                          <MultimodalInput value={answers['q8a'] || ''} onChange={(val) => setAnswers({...answers, q8a: val})} />
                       </div>
                       <div className="space-y-4">
                          <p className="font-bold text-on-surface-variant italic">O que faz uma atividade/aula ser chata ou sem graça?</p>
                          <MultimodalInput value={answers['q8b'] || ''} onChange={(val) => setAnswers({...answers, q8b: val})} />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4 bg-white p-8 rounded-[36px] atmospheric-shadow border border-slate-50">
                    <p className="text-lg font-black text-on-surface leading-tight tracking-tight">9. Você tem amigos na escola?</p>
                    <MultimodalInput value={answers['q9'] || ''} onChange={(val) => setAnswers({...answers, q9: val})} />
                 </div>
              </div>
           </section>

           {/* Bloco III */}
           <section className="space-y-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Laptop size={24} />
                 </div>
                 <h2 className="text-2xl font-black text-on-surface uppercase tracking-tight">Bloco III – EU USO A TECNOLOGIA PARA...</h2>
              </div>

              <div className="space-y-12">
                 <div className="space-y-4 bg-white p-8 rounded-[36px] atmospheric-shadow border border-slate-50">
                    <p className="text-lg font-black text-on-surface leading-tight tracking-tight">10. Você gosta mais de aprender com tecnologia (computador, celular, internet) ou sem ela (livros, cadernos, jogos físicos)? Por quê?</p>
                    <MultimodalInput value={answers['q10'] || ''} onChange={(val) => setAnswers({...answers, q10: val})} />
                 </div>

                 <div className="space-y-4 bg-white p-8 rounded-[36px] atmospheric-shadow border border-slate-50">
                    <p className="text-lg font-black text-on-surface leading-tight tracking-tight">11. Quais tecnologias você utiliza em casa? Como e para quê? (Ex.: vídeos no YouTube, jogos, aplicativos, sites, cursos online...)</p>
                    <MultimodalInput value={answers['q11'] || ''} onChange={(val) => setAnswers({...answers, q11: val})} />
                 </div>

                 <div className="space-y-4 bg-white p-8 rounded-[36px] atmospheric-shadow border border-slate-50">
                    <p className="text-lg font-black text-on-surface leading-tight tracking-tight">12. Se você pudesse usar mais tecnologia nas aulas, para que seria? (Ex.: aprender mais sobre..., fazer..., criar..., pesquisar...)</p>
                    <MultimodalInput value={answers['q12'] || ''} onChange={(val) => setAnswers({...answers, q12: val})} />
                 </div>
              </div>
           </section>

           {/* Ação Final */}
           <div className="pt-12">
              <button className="w-full bg-primary text-white py-8 rounded-[32px] font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                 <Send size={24} />
                 Finalizar e Enviar Entrevista
              </button>
           </div>
        </div>
      </main>
    </div>
  );
}
