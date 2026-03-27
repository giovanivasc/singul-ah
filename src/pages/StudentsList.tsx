import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Student, StudentInsert } from '../types/database';

export default function StudentsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    school: '',
    grade: ''
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar estudantes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error: insertError } = await supabase
        .from('students')
        .insert([{
          ...formData,
          teacher_id: user.id,
          status: 'coleta_pendente'
        }])
        .select();

      if (insertError) throw insertError;

      setIsModalOpen(false);
      setFormData({ full_name: '', date_of_birth: '', school: '', grade: '' });
      fetchStudents();
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar estudante');
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0">
      <TopBar title="Singul-AH">
        <div className="flex-1 max-w-md mx-8 hidden lg:block">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline/40" size={18} />
              <input 
                type="text" 
                placeholder="Buscar estudantes..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-high/40 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
              />
           </div>
        </div>
      </TopBar>
      
      <div className="max-w-7xl mx-auto px-6 pt-8 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-black text-on-surface tracking-tight">Gerenciamento de Alunos</h2>
            <p className="text-on-surface-variant text-sm font-medium opacity-60">Visualize e gerencie o acompanhamento educacional de seus alunos.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-4 rounded-2xl font-bold atmospheric-shadow hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
            <span>Cadastrar Estudante</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary/40" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {students.length > 0 ? (
              students.map((student, index) => (
                <StudentCard 
                  key={student.id} 
                  student={student} 
                  index={index} 
                  age={calculateAge(student.date_of_birth)}
                  onClick={() => navigate(`/students/${student.id}`)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-surface-container-low/30 rounded-[32px] border-2 border-dashed border-outline-variant/10">
                <p className="text-on-surface-variant font-medium opacity-40">Nenhum estudante cadastrado ainda.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden atmospheric-shadow"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-on-surface tracking-tight">Novo Estudante</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                    <X size={24} className="text-on-surface-variant" />
                  </button>
                </div>

                <form onSubmit={handleCreateStudent} className="space-y-6">
                  {error && (
                    <div className="bg-error-container/20 text-error text-xs p-4 rounded-xl border border-error/10 text-center font-bold">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-black text-on-surface-variant/60 uppercase ml-2">Nome Completo</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Nome do aluno"
                      className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-on-surface-variant/60 uppercase ml-2">Data de Nascimento</label>
                      <input 
                        required
                        type="date" 
                        className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={formData.date_of_birth}
                        onChange={e => setFormData({...formData, date_of_birth: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-on-surface-variant/60 uppercase ml-2">Ano / Série</label>
                      <select 
                        required
                        className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                        value={formData.grade}
                        onChange={e => setFormData({...formData, grade: e.target.value})}
                      >
                        <option value="">Selecionar...</option>
                        <option value="Educação Infantil">Educação Infantil</option>
                        <option value="1º Ano">1º Ano</option>
                        <option value="2º Ano">2º Ano</option>
                        <option value="3º Ano">3º Ano</option>
                        <option value="4º Ano">4º Ano</option>
                        <option value="5º Ano">5º Ano</option>
                        <option value="6º Ano">6º Ano</option>
                        <option value="7º Ano">7º Ano</option>
                        <option value="8º Ano">8º Ano</option>
                        <option value="9º Ano">9º Ano</option>
                        <option value="Ensino Médio">Ensino Médio</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-on-surface-variant/60 uppercase ml-2">Escola</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Nome da instituição"
                      className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={formData.school}
                      onChange={e => setFormData({...formData, school: e.target.value})}
                    />
                  </div>

                  <button 
                    disabled={submitting}
                    type="submit" 
                    className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest atmospheric-shadow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={24} /> : 'Concluir Cadastro'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface StudentCardProps {
  student: Student;
  index: number;
  age: number;
  onClick: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, index, age, onClick }) => {
  const statusLabels: Record<string, string> = {
    coleta_pendente: 'Coleta Pendente',
    coleta_concluida: 'Coleta Concluída',
    pei_em_andamento: 'PEI em Elaboração',
    pei_ativo: 'PEI Ativo'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-white rounded-[24px] overflow-hidden atmospheric-shadow border border-outline-variant/5 cursor-pointer group"
    >
      <div className="relative h-40 overflow-hidden bg-primary/5 flex items-center justify-center">
        {student.avatar_url ? (
          <img 
            src={student.avatar_url} 
            alt={student.full_name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-primary/30 group-hover:text-primary/50 transition-colors">
             <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Plus size={32} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest">Sem Foto</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical size={16} className="text-on-surface" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-6">
          <span className="text-[10px] font-black text-white/90 uppercase tracking-widest bg-primary px-2 py-0.5 rounded-md shadow-lg">
            {statusLabels[student.status] || student.status}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors truncate">{student.full_name}</h3>
        <div className="space-y-1">
          <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-tighter">
            {age} anos • {student.grade}
          </p>
          <p className="text-xs text-on-surface-variant/50 font-medium truncate italic">
            {student.school}
          </p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-outline-variant/10 flex justify-between items-center">
          <div className="flex -space-x-2">
            {[1, 2].map(i => (
              <div key={i} className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-white" />
            ))}
          </div>
          <span className="text-[10px] font-bold text-primary group-hover:underline">Acessar Perfil →</span>
        </div>
      </div>
    </motion.div>
  );
};
