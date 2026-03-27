import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Compass, CheckCircle2, ChevronRight, 
  ArrowRight, Users, MessageSquare, Heart, 
  Activity, Star, Briefcase, HelpCircle, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MultimodalInput } from '../components/MultimodalInput';
import { cn } from '../lib/utils';

export default function FamilyCollection() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  
  // Mock data for student
  const studentName = "Lucas Oliveira";

  // Form State
  const [formData, setFormData] = useState({
    parent_name: '',
    relationship: '',
    other_relationship: '',
    answers: {
      q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: ''
    }
  });

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      answers: { ...prev.answers, [id]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    // Real submission would happen here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <Compass className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface-container-low flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-8 shadow-xl shadow-green-500/20"
        >
          <CheckCircle2 size={48} strokeWidth={3} />
        </motion.div>
        <h2 className="text-3xl font-black text-on-surface mb-4">Obrigado!</h2>
        <p className="text-on-surface-variant max-w-md opacity-70 mb-10 leading-relaxed font-medium">As respostas para o <strong>{studentName}</strong> foram enviadas com sucesso e agora serão processadas por nossa equipe. Sua contribuição é fundamental.</p>
        <div className="p-6 bg-white rounded-3xl atmospheric-shadow max-w-sm w-full border border-outline-variant/5">
           <Compass className="text-primary w-10 h-10 mb-4 mx-auto" />
           <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Singul-AH</p>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'q1', title: 'I - PERFIL DO ESTUDANTE', label: 'Como você descreveria a personalidade, preferências e o que o estudante mais gosta de fazer?', icon: Star },
    { id: 'q2', title: 'II - HISTÓRICO DE DESENVOLVIMENTO', label: 'Houve algum marco no desenvolvimento que chamou a atenção (fala, marcha, coordenação)?', icon: Activity },
    { id: 'q3', title: 'III - ROTINA FAMILIAR', label: 'Como é o dia a dia na casa? Quais são os momentos de maior interação com a família?', icon: Heart },
    { id: 'q4', title: 'IV - AUTONOMIA E INDEPENDÊNCIA', label: 'Descreva como o estudante lida com tarefas diárias (higiene, alimentação, organização).', icon: Briefcase },
    { id: 'q5', title: 'V - COMPORTAMENTO E REGULAÇÃO', label: 'Como o estudante reage a frustrações ou mudanças na rotina? Há comportamentos específicos?', icon: MessageSquare },
    { id: 'q6', title: 'VI - INTERAÇÃO SOCIAL', label: 'Como é a relação com colegas, vizinhos e outros membros da família fora do núcleo principal?', icon: Users },
    { id: 'q7', title: 'VII - HISTÓRICO ESCOLAR', label: 'Descreva a trajetória escolar até o momento. Como tem sido o engajamento com os estudos?', icon: GraduationCap },
    { id: 'q8', title: 'VIII - EXPECTATIVAS E OBJETIVOS', label: 'O que você, como responsável, espera que o(a) estudante alcance neste ciclo educacional?', icon: HelpCircle },
    { id: 'q9', title: 'IX - INFORMAÇÕES ADICIONAIS', label: 'Há algo que não foi perguntado e que você considera vital para o diagnóstico no PEI?', icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* External Header */}
      <header className="w-full bg-white flex flex-col items-center pt-8 pb-6 border-b border-slate-100 sticky top-0 z-50">
         <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white mb-2 shadow-lg shadow-primary/20">
            <Compass size={24} strokeWidth={2.5} />
         </div>
         <h1 className="text-sm font-black text-on-surface-variant uppercase tracking-[0.2em]">Inventário Familiar (IF-SAHS)</h1>
      </header>
      
      <main className="w-full max-w-2xl px-6 py-10 space-y-12 pb-32">
        {/* Intro Card */}
        <section className="bg-white/70 backdrop-blur-xl rounded-[32px] p-8 atmospheric-shadow border border-white/50 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 text-primary opacity-5 -mr-8 -mt-8">
              <Compass size={140} />
           </div>
           <p className="text-on-surface-variant font-medium leading-relaxed opacity-80 z-10 relative">
             Olá, responsável por <strong className="text-primary">{studentName}</strong>. Este questionário nos ajudará a entender melhor o perfil do estudante para criarmos um Plano Educacional adequado. Você pode digitar ou usar o microfone para responder clicando no botão azul.
           </p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-16">
           {/* Identification */}
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-1 h-6 bg-primary rounded-full" />
                 <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Identificação</h3>
              </div>
              
              <div className="grid gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-outline/50 ml-2">Nome do Responsável</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Identifique-se..."
                      className="w-full px-6 py-4 bg-white rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-on-surface-variant"
                      value={formData.parent_name}
                      onChange={e => setFormData({...formData, parent_name: e.target.value})}
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-outline/50 ml-2">Vínculo com o Estudante</label>
                    <div className="grid grid-cols-2 gap-3">
                       {['Mãe', 'Pai', 'Responsável'].map(r => (
                         <button
                           key={r}
                           type="button"
                           onClick={() => setFormData({...formData, relationship: r})}
                           className={cn(
                             "py-4 rounded-xl text-xs font-bold transition-all border outline-none",
                             formData.relationship === r 
                               ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                               : "bg-white text-on-surface-variant border-slate-200 hover:border-primary/40"
                           )}
                         >
                           {r}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           {/* Questions Blocks */}
           {sections.map((section, index) => (
             <motion.div 
               key={section.id}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               className="space-y-4"
             >
                <div className="flex items-center justify-between">
                   <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-60 flex items-center gap-2">
                      <section.icon size={14} className="text-primary" />
                      {section.title}
                   </h3>
                   <span className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">{index + 1} de 9</span>
                </div>
                <p className="text-lg font-black text-on-surface leading-tight tracking-tight mb-4">
                   {section.label}
                </p>
                <MultimodalInput 
                   id={section.id}
                   value={formData.answers[section.id as keyof typeof formData.answers]}
                   onChange={(val) => handleInputChange(section.id, val)}
                   placeholder="Toque no microfone para falar sua resposta..."
                />
             </motion.div>
           ))}

           {/* Submit Button */}
           <div className="pt-8">
              <button 
                type="submit"
                className="w-full bg-[#1DB954] text-white py-6 rounded-[28px] font-black text-base uppercase tracking-[0.2em] atmospheric-shadow hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-4"
              >
                 <span>Enviar Questionário</span>
                 <CheckCircle2 size={24} strokeWidth={3} />
              </button>
              <p className="text-center text-[10px] font-bold text-outline uppercase tracking-widest mt-6 opacity-40 italic">
                 Sistema Singul-AH • Educação Inclusiva em Foco
              </p>
           </div>
        </form>
      </main>
    </div>
  );
}
