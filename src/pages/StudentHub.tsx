import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ClipboardList, Brain, PencilRuler, 
  TrendingUp, ArrowRight, User, GraduationCap, MapPin, 
  Sparkles, Loader2, AlertCircle, Camera, Network
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
        
        let fetchedStudent = data;
        const localData = localStorage.getItem(`student_extras_${studentId}`);
        if (localData) {
           fetchedStudent = { ...fetchedStudent, ...JSON.parse(localData) };
        }
        
        setStudent(fetchedStudent);
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

  const [blocks, setBlocks] = useState([
    {
      title: 'Estudo de Caso',
      subtitle: 'Diagnóstico e Coleta',
      icon: ClipboardList,
      description: 'Preenchimento dos instrumentos: IF-SAHS, IP-SAHS, Entrevista, N-ILS.',
      progress: 0,
      color: 'bg-primary',
      path: 'case-study'
    },
    {
      title: 'Mapeamento',
      subtitle: 'Síntese e Cruzamento',
      icon: Network,
      description: 'Análise assistida por IA das barreiras e interesses conforme a LBI.',
      progress: 0,
      color: 'bg-indigo-500',
      path: 'convergence'
    },
    {
      title: 'Construtor PEI',
      subtitle: 'Processamento e Plano',
      icon: Brain,
      secondIcon: PencilRuler,
      description: 'Planejamento de objetivos, metas e suportes baseados no mapeamento.',
      progress: 0,
      color: 'bg-secondary-container',
      path: 'builder'
    },
    {
      title: 'Avaliação PEI',
      subtitle: 'Acompanhamento',
      icon: TrendingUp,
      description: 'Monitoramento do progresso das metas para o próximo ciclo.',
      progress: 0,
      color: 'bg-tertiary-container',
      path: 'evaluation'
    }
  ]);

  useEffect(() => {
    if (!studentId) return;

    const fetchProgress = async () => {
      try {
        // 1. Progress: Estudo de Caso (Instrumentos)
        const { count: recordsCount } = await supabase
          .from('instrument_records')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', studentId)
          .eq('status', 'ativo');

        // 2. Progress: Mapeamento (Convergências)
        const { count: convergenceCount } = await supabase
          .from('convergences')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', studentId);

        // 3. Progress: Construtor PEI
        const { count: peiCount } = await supabase
          .from('pei_data')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', studentId);

        setBlocks(prev => prev.map(block => {
          if (block.path === 'case-study') {
            const progress = Math.min(Math.round(((recordsCount || 0) / 4) * 100), 100);
            return { ...block, progress };
          }
          if (block.path === 'convergence') {
            return { ...block, progress: (convergenceCount || 0) > 0 ? 100 : 0 };
          }
          if (block.path === 'builder') {
            return { ...block, progress: (peiCount || 0) > 0 ? 100 : 0 };
          }
          return block;
        }));
      } catch (err) {
        console.error('Erro ao calcular progresso:', err);
      }
    };

    fetchProgress();
  }, [studentId]);

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
          <div className="bg-white/70 backdrop-blur-xl rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-white/50 flex flex-col overflow-hidden pb-8">
             {/* Banner */}
             <div className="w-full h-32 md:h-40 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 relative">
                <div className="absolute top-0 right-0 p-6 text-white opacity-20">
                   <Sparkles size={80} />
                </div>
             </div>
             
             {/* Profile Info */}
             <div className="px-8 flex flex-col md:flex-row items-center md:items-start md:gap-8 relative z-10">
                <div className="relative -mt-12 md:max-w-none md:ml-4 mb-4 md:mb-0 shrink-0">
                   <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center relative">
                     {student.avatar_url ? (
                       <img 
                         src={student.avatar_url} 
                         alt={student.full_name} 
                         className="w-full h-full object-cover"
                         referrerPolicy="no-referrer"
                       />
                     ) : (
                       <User size={40} className="text-primary/20" />
                     )}
                   </div>
                   <button className="absolute bottom-0 right-0 w-7 h-7 bg-white text-slate-500 hover:text-primary hover:bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center shadow-sm transition-colors" title="Editar foto">
                      <Camera size={12} />
                   </button>
                </div>
                
                <div className="flex-1 text-center md:text-left pt-2 md:pt-4">
                   <h2 className="text-3xl font-black text-on-surface tracking-tight mb-3">{student.full_name}</h2>
                   
                   <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest">
                      <span className="flex items-center gap-2 px-4 py-1.5 bg-surface-container rounded-full"><User size={14} className="text-primary"/> {age} Anos</span>
                      <span className="flex items-center gap-2 px-4 py-1.5 bg-surface-container rounded-full"><GraduationCap size={14} className="text-secondary-container-on" /> {student.grade}</span>
                      <span className="flex items-center gap-2 px-4 py-1.5 bg-surface-container rounded-full italic"><MapPin size={14} className="text-tertiary" /> {student.school}</span>
                   </div>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Functional Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
                <h3 className="text-xl lg:text-2xl font-black text-on-surface mb-3 group-hover:text-primary transition-colors tracking-tight leading-tight">{block.title}</h3>
                <p className="text-xs lg:text-sm font-medium text-outline/60 leading-relaxed opacity-80 mb-8">{block.description}</p>
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
