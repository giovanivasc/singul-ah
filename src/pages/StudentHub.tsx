import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ClipboardList, Brain, PencilRuler, 
  TrendingUp, ArrowRight, User, GraduationCap, MapPin, 
  Sparkles, Loader2, AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { TopBar } from '../components/Navigation';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Student } from '../types/database';

export default function StudentHub() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

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

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const blocks = [
    {
      title: 'Estudo de Caso',
      subtitle: 'Diagnóstico e Coleta',
      icon: ClipboardList,
      description: 'Preenchimento dos 4 instrumentos principais (IF-SAHS, IP-SAHS, Entrevista, N-ILS).',
      progress: 65,
      color: 'bg-primary',
      path: 'case-study'
    },
    {
      title: 'Plano (PEI)',
      subtitle: 'Processamento e Estratégia',
      icon: Brain,
      secondIcon: PencilRuler,
      description: 'Mapeamento de Convergência assistido por IA e construção do plano final.',
      progress: 30,
      color: 'bg-secondary-container',
      path: 'builder'
    },
    {
      title: 'Avaliação do Plano',
      subtitle: 'Acompanhamento do Ciclo',
      icon: TrendingUp,
      description: 'Mapeamento de progresso das metas e alimentação do próximo ciclo PEI.',
      progress: 10,
      color: 'bg-tertiary-container',
      path: 'evaluation'
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <TopBar title="Painel do Estudante" showBack />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary/40" size={48} />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <TopBar title="Painel do Estudante" showBack />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
             <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-on-surface mb-2">Estudante não encontrado</h2>
          <p className="text-on-surface-variant max-w-md mb-8">Não conseguimos localizar o registro deste aluno. Ele pode ter sido removido ou você não tem permissão para acessá-lo.</p>
          <button onClick={() => navigate('/students')} className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20">Voltar para a Lista</button>
        </div>
      </div>
    );
  }

  const age = calculateAge(student.date_of_birth);

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 bg-surface">
      <TopBar title="Painel do Estudante" showBack />
      
      <main className="max-w-7xl mx-auto px-6 pt-8 w-full">
        {/* Profile Card Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12"
        >
          <div className="bg-white/70 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-white/50 flex flex-col items-center text-center overflow-hidden">
             {/* Decorative element */}
             <div className="absolute top-0 right-0 p-8 text-primary opacity-5">
                <Sparkles size={120} />
             </div>
             
             <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-primary/5 flex items-center justify-center">
                  {student.avatar_url ? (
                    <img 
                      src={student.avatar_url} 
                      alt={student.full_name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={64} className="text-primary/20" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 border-4 border-white rounded-full" />
             </div>
             
             <h2 className="text-4xl font-black text-on-surface tracking-tight mb-2">{student.full_name}</h2>
             
             <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest">
                <span className="flex items-center gap-2 px-6 py-2.5 bg-surface-container rounded-full"><User size={16} className="text-primary"/> {age} Anos</span>
                <span className="flex items-center gap-2 px-6 py-2.5 bg-surface-container rounded-full"><GraduationCap size={16} className="text-secondary-container-on" /> {student.grade}</span>
                <span className="flex items-center gap-2 px-6 py-2.5 bg-surface-container rounded-full italic"><MapPin size={16} className="text-tertiary" /> {student.school}</span>
             </div>
          </div>
        </motion.div>

        {/* Functional Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {blocks.map((block, index) => (
            <motion.div
              key={block.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => navigate(`/students/${studentId}/${block.path}`)}
              className="bg-white rounded-[32px] p-8 shadow-[0px_4px_30px_rgba(0,0,0,0.04)] border border-outline-variant/10 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className={cn("inline-flex items-center justify-center p-4 rounded-3xl mb-8 group-hover:scale-110 transition-transform relative", block.color)}>
                  <block.icon className="text-white" size={32} strokeWidth={2.5} />
                  {block.secondIcon && (
                    <div className="absolute -top-4 -right-4 bg-tertiary-container text-white p-2 rounded-xl border-4 border-white group-hover:-rotate-12 transition-transform">
                      <block.secondIcon size={18} strokeWidth={2.5} />
                    </div>
                  )}
                </div>
                
                <p className="text-[10px] font-black uppercase text-outline/40 tracking-[0.2em] mb-2">{block.subtitle}</p>
                <h3 className="text-2xl font-black text-on-surface mb-4 group-hover:text-primary transition-colors tracking-tight leading-tight">{block.title}</h3>
                <p className="text-sm font-medium text-outline/60 leading-relaxed opacity-80 mb-8">{block.description}</p>
              </div>

              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[10px] font-black uppercase text-primary">Progresso do Ciclo</span>
                  <span className="text-[10px] font-black">{block.progress}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mb-8">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", block.color)} 
                    style={{ width: `${block.progress}%` }} 
                  />
                </div>
                
                <button className="w-full flex items-center justify-between text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                   <span>Acessar Módulo</span>
                   <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <ArrowRight size={16} />
                   </div>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
