import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Compass, CheckCircle2, 
  Users, MessageSquare, Heart, 
  Star, GraduationCap, Info
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
    setTimeout(() => setLoading(false), 800);
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Compass className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-8 shadow-xl shadow-green-500/20"
        >
          <CheckCircle2 size={48} strokeWidth={3} />
        </motion.div>
        <h2 className="text-4xl font-black text-on-surface mb-4 tracking-tight">Enviado com Sucesso!</h2>
        <p className="text-on-surface-variant max-w-md opacity-70 mb-10 leading-relaxed font-medium">As respostas de <strong>{formData.parent_name}</strong> para o estudante <strong>{studentName}</strong> foram registradas.</p>
        <div className="p-8 bg-white rounded-[32px] atmospheric-shadow max-w-sm w-full border border-outline-variant/5">
           <Compass className="text-primary w-12 h-12 mb-4 mx-auto" />
           <p className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant">Singul-AH</p>
        </div>
      </div>
    );
  }

  const blocks = [
    {
      title: 'Bloco I - PERFIL DO ESTUDANTE',
      icon: Star,
      questions: [
        { id: 'q1', label: 'Q1: O que o(a) estudante gosta de fazer ou apresenta facilidade para realizar? (ex.: matemática, ciências, artes, música, tecnologia, linguagem, jogos, esportes)' },
        { id: 'q2', label: 'Q2: Como é a interação do seu filho com outras pessoas? Relate exemplo(s).' },
        { id: 'q3', label: 'Q3: Como seu filho reage a desafios e frustrações? Relate exemplo(s).' },
      ]
    },
    {
      title: 'Bloco II - CONTEXTO FAMILIAR E APOIO EXTERNO',
      icon: Heart,
      questions: [
        { id: 'q4', label: 'Q4: O estudante participa de atividades extracurriculares fora da escola? Se sim, quais?' },
        { id: 'q5', label: 'Q5: A família já comunicou à escola a existência de desafios pedagógicos, emocionais ou comportamentais relacionados ao estudante? Se sim, quais?' },
      ]
    },
    {
      title: 'Bloco III - DESAFIOS E NECESSIDADES EDUCACIONAIS',
      icon: GraduationCap,
      questions: [
        { id: 'q6', label: 'Q6: O aluno demonstra sinais de desmotivação na escola? Quais comportamentos, atitudes ou situações evidenciam essa desmotivação?' },
        { id: 'q7', label: 'Q7: Na sua opinião, quais são atualmente as maiores necessidades pedagógicas do seu filho na escola?' },
        { id: 'q8', label: 'Q8: Que expectativas você tem em relação ao desenvolvimento escolar do(a) seu(sua) filho(a)?' },
        { id: 'q9', label: 'Q9: Gostaria de sugerir algo que considere importante para que possamos planejar um atendimento mais adequado ao seu(sua) filho(a)?' },
      ]
    }
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
      
      <main className="w-full max-w-2xl px-6 py-10 pb-32">
        {/* Intro Card */}
        <section className="bg-white rounded-[32px] p-8 atmospheric-shadow border border-outline-variant/10 relative overflow-hidden mb-12">
           <div className="absolute top-0 right-0 p-8 text-primary opacity-5 -mr-8 -mt-8">
              <Compass size={140} />
           </div>
           <div className="flex gap-4 items-start relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                 <Info size={24} />
              </div>
              <p className="text-on-surface-variant font-semibold leading-relaxed text-sm">
                Este questionário nos ajudará a conhecer o perfil biopsicossocial e educacional do estudante para fins de elaboração do plano de suplementação pedagógica. Você pode digitar ou usar o microfone para gravar sua resposta.
              </p>
           </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-16">
           {/* Identification */}
           <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-1 h-6 bg-primary rounded-full transition-all" />
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Identificação</h3>
              </div>
              
              <div className="grid gap-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome do Responsável</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Seu nome completo..."
                      className="w-full px-7 py-5 bg-white rounded-3xl border border-slate-200 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-on-surface-variant shadow-sm shadow-slate-200/50"
                      value={formData.parent_name}
                      onChange={e => setFormData({...formData, parent_name: e.target.value})}
                    />
                 </div>
                 
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Vínculo com o Estudante</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                       {['Mãe', 'Pai', 'Responsável legal'].map(r => (
                         <button
                           key={r}
                           type="button"
                           onClick={() => setFormData({...formData, relationship: r})}
                           className={cn(
                             "py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border outline-none",
                             formData.relationship === r 
                               ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]" 
                               : "bg-white text-slate-400 border-slate-200 hover:border-primary/30"
                           )}
                         >
                           {r}
                         </button>
                       ))}
                    </div>
                 </div>

                 <AnimatePresence>
                   {formData.relationship === 'Responsável legal' && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="space-y-3"
                     >
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Especifique o Vínculo</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Ex: Avó, Tutor, etc..."
                          className="w-full px-7 py-5 bg-white rounded-3xl border border-primary/20 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-on-surface-variant shadow-sm"
                          value={formData.other_relationship}
                          onChange={e => setFormData({...formData, other_relationship: e.target.value})}
                        />
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
           </div>

           {/* Blocks and Questions */}
           {blocks.map((block, bIdx) => (
             <div key={bIdx} className="space-y-10">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                   <div className="w-10 h-10 rounded-2xl bg-white atmospheric-shadow flex items-center justify-center text-primary border border-outline-variant/5">
                      <block.icon size={20} />
                   </div>
                   <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{block.title}</h3>
                </div>

                <div className="space-y-12">
                   {block.questions.map((q) => (
                     <motion.div 
                       key={q.id}
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true, margin: "-50px" }}
                       className="space-y-6"
                     >
                        <p className="text-lg font-black text-on-surface leading-tight tracking-tight">
                           {q.label}
                        </p>
                        <MultimodalInput 
                           id={q.id}
                           value={formData.answers[q.id as keyof typeof formData.answers]}
                           onChange={(val) => handleInputChange(q.id, val)}
                           placeholder="Para falar sua resposta, toque no microfone..."
                        />
                     </motion.div>
                   ))}
                </div>
             </div>
           ))}

           {/* Final Action */}
           <div className="pt-12">
              <button 
                type="submit"
                className="w-full bg-[#1DB954] text-white py-7 rounded-[32px] font-black text-base uppercase tracking-[0.3em] atmospheric-shadow shadow-green-500/20 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-4"
              >
                 <span>Finalizar e Enviar Respostas</span>
                 <CheckCircle2 size={24} strokeWidth={3} />
              </button>
              <div className="flex flex-col items-center mt-10 space-y-2 opacity-30">
                 <Compass size={24} className="text-slate-400" />
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                    Singul-AH • Bússola Educacional
                 </p>
              </div>
           </div>
        </form>
      </main>
    </div>
  );
}
