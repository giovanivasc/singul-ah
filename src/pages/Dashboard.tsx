import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, CheckCircle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { TopBar } from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    completedPEIs: 0,
    pendingEvaluations: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        const { count, error } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', user.id);

        if (error) throw error;

        setStats(prev => ({
          ...prev,
          totalStudents: count || 0,
          loading: false
        }));
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0">
      <TopBar title="Singul-AH" />
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-12 w-full">
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <TrendingUp size={22} />
             </div>
             <h2 className="text-3xl font-black tracking-tight text-on-surface">Visão Geral</h2>
          </div>
          <p className="text-on-surface-variant text-sm font-medium opacity-60">Monitoramento centralizado de indicadores e progresso educacional.</p>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <KPICard 
            title="Alunos em Acompanhamento" 
            value={stats.loading ? '...' : stats.totalStudents.toString()} 
            trend={stats.totalStudents > 0 ? "+1 este mês" : "Comece agora"} 
            icon={<TrendingUp size={16} />} 
            color="primary"
          />
          <KPICard 
            title="PEIs Documentados" 
            value="0" 
            trend="0% concluídos" 
            icon={<CheckCircle size={16} />} 
            color="tertiary"
          />
          <KPICard 
            title="Avaliações Pendentes" 
            value="0" 
            trend="Próximo ciclo" 
            icon={<Clock size={16} />} 
            color="error"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-on-surface tracking-tight">Atividades Recentes</h3>
                  <button onClick={() => navigate('/students')} className="text-primary font-bold text-xs hover:underline flex items-center gap-1">Ver todos os alunos <ArrowRight size={14} /></button>
               </div>
               <div className="bg-white rounded-[32px] p-6 atmospheric-shadow border border-outline-variant/5">
                  <div className="space-y-6">
                     {stats.totalStudents > 0 ? (
                       <div className="text-center py-6 opacity-40 italic text-sm font-medium">
                          Funcionalidade de atividades em breve...
                       </div>
                     ) : (
                       <div className="text-center py-10">
                          <p className="text-on-surface-variant text-sm font-medium opacity-40 mb-4">Nenhuma atividade registrada.</p>
                          <button 
                            onClick={() => navigate('/students')}
                            className="bg-primary/10 text-primary px-6 py-2 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all"
                          >
                            Cadastre seu primeiro aluno
                          </button>
                       </div>
                     )}
                  </div>
               </div>
            </section>
          </div>

          <div className="space-y-8">
             <section>
                <h3 className="text-xl font-black text-on-surface tracking-tight mb-6">Distribuição por Status</h3>
                <div className="bg-white rounded-[32px] p-8 atmospheric-shadow border border-outline-variant/5">
                   <div className="flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full border-[12px] border-surface-container-high relative flex items-center justify-center mb-6">
                         <div className="absolute inset-[-12px] rounded-full border-[12px] border-primary" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 0%, 0% 0%, 0% 0%)' }} />
                         <span className="text-2xl font-black text-on-surface tracking-tighter">0%</span>
                      </div>
                      <div className="w-full space-y-3">
                         <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant">
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Concluído</span>
                            <span>0</span>
                         </div>
                         <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant">
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-tertiary-container" /> Em Processo</span>
                            <span>0</span>
                         </div>
                         <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant">
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-error" /> Crítico</span>
                            <span>0</span>
                         </div>
                      </div>
                   </div>
                </div>
             </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, icon, color }: { title: string, value: string, trend: string, icon: React.ReactNode, color: 'primary' | 'tertiary' | 'error' }) {
  const colorClasses = {
    primary: 'text-primary bg-primary/5',
    tertiary: 'text-tertiary-container bg-tertiary-container/10',
    error: 'text-error bg-error-container/20'
  };

  return (
    <div className="bg-surface-container-lowest p-8 rounded-xl atmospheric-shadow flex flex-col justify-between relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500 ${colorClasses[color].split(' ')[1]}`}></div>
      <div>
        <span className={`text-sm font-bold uppercase tracking-wider ${colorClasses[color].split(' ')[0]}`}>{title}</span>
        <div className="text-5xl font-extrabold mt-4 text-on-surface">{value}</div>
      </div>
      <div className={`mt-6 flex items-center text-xs font-bold ${
        color === 'primary' ? 'text-secondary' :
        color === 'tertiary' ? 'text-green-600' :
        'text-error'
      }`}>
        <span className="mr-1">{icon}</span>
        <span>{trend}</span>
      </div>
    </div>
  );
}
