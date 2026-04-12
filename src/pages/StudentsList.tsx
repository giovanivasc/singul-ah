import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, X, Loader2, Camera, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Student } from '../types/database';
import { cn } from '../lib/utils';

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
    gender: '',
    guardian_name: '',
    phone: '',
    school: 'SEMED Castanhal',
    grade: '',
    class_name: '',
    shift: '',
    regent_teacher: '',
    aee_teacher: '',
    avatar_url: '',
    exceptionalities: [] as string[]
  });

  const exceptionalityGroups = {
    "Transtornos de Aprendizagem": ["Dislexia", "Discalculia", "Disgrafia", "Disortografia", "Outro Transtorno de Aprendizagem"],
    "Transtornos do Neurodesenvolvimento": ["TEA", "TDAH", "Deficiência Intelectual", "TOD", "Outro Transtorno Neurodesenvolvimento"],
    "Transtornos Emocionais": ["Ansiedade", "Depressão", "Baixa Regulação Emocional", "Outro Transtorno Emocional"],
    "Deficiências Sensoriais/Físicas": ["Deficiência Visual", "Deficiência Auditiva", "Baixa Visão", "Surdez", "Deficiência Física", "Mobilidade Reduzida"],
    "Altas Habilidades/Superdotação": ["Altas Habilidades / Superdotação", "Dupla Excepcionalidade"]
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Merge com localStorage
      const enrichedStudents = (data || []).map(stud => {
         const localData = localStorage.getItem(`student_extras_${stud.id}`);
         if (localData) {
            return { ...stud, ...JSON.parse(localData) };
         }
         return stud;
      });
      setStudents(enrichedStudents);
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

      const basicData = {
         full_name: formData.full_name,
         date_of_birth: formData.date_of_birth,
         school: formData.school,
         grade: formData.grade,
         gender: formData.gender,
         exceptionalities: formData.exceptionalities,
         teacher_id: user.id,
         status: 'coleta_pendente'
      };

      const { data, error: insertError } = await supabase
        .from('students')
        .insert([basicData])
        .select();

      if (insertError) throw insertError;
      
      if (data && data.length > 0) {
         const newId = data[0].id;
         localStorage.setItem(`student_extras_${newId}`, JSON.stringify(formData));
      }

      setIsModalOpen(false);
      setFormData({
        full_name: '', date_of_birth: '', gender: '', guardian_name: '', phone: '',
        school: 'SEMED Castanhal', grade: '', class_name: '', shift: '',
        regent_teacher: '', aee_teacher: '', avatar_url: '', exceptionalities: []
      });
      fetchStudents();
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar estudante');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
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
            className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm atmospheric-shadow hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            <Plus size={20} strokeWidth={3} />
            <span>Novo Aluno</span>
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

      {/* Modern Large Registration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[32px] overflow-hidden atmospheric-shadow my-auto z-10 border border-slate-100"
            >
              <div className="flex flex-col max-h-[90vh]">
                 <div className="p-6 md:px-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                      <h3 className="text-2xl font-black text-on-surface tracking-tight uppercase">Novo Estudante</h3>
                      <p className="text-sm font-medium text-slate-500">Cadastre os dados de identificação e escolarização.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white hover:bg-slate-200 rounded-full transition-colors shadow-sm">
                      <X size={24} className="text-slate-500" />
                    </button>
                 </div>

                 <form onSubmit={handleCreateStudent} className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1">
                    {error && (
                      <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-100 font-bold text-center">
                        {error}
                      </div>
                    )}

                    {/* FOTO UPLOAD MOCK */}
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                       <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm border border-slate-200 relative mb-4">
                          <User size={40} />
                          <button type="button" className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all">
                             <Camera size={14} />
                          </button>
                       </div>
                       <p className="text-sm font-bold text-slate-500">Foto de Perfil (Opcional)</p>
                    </div>

                    {/* IDENTIFICAÇÃO SECTION */}
                    <div className="space-y-4">
                       <h4 className="text-sm font-black uppercase text-primary tracking-widest flex items-center gap-2">
                         <span className="bg-primary/20 w-6 h-6 rounded flex items-center justify-center text-[10px]">1</span> Identificação Básica
                       </h4>
                       <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nome Completo</label>
                            <input 
                              required type="text" placeholder="Nome completo do aluno"
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 font-medium"
                              value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Data de Nascimento</label>
                            <input 
                              required type="date"
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 font-medium"
                              value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Sexo</label>
                            <select 
                              aria-label="Sexo"
                              required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 font-medium appearance-none"
                              value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}
                            >
                              <option value="">Selecionar...</option>
                              <option value="Masculino">Masculino</option>
                              <option value="Feminino">Feminino</option>
                              <option value="Outro">Outro</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nome do Responsável</label>
                            <input 
                              type="text" placeholder="Pai, mãe ou tutor legal"
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 font-medium"
                              value={formData.guardian_name} onChange={e => setFormData({...formData, guardian_name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Telefone de Contato</label>
                            <input 
                              type="text" placeholder="(DD) 90000-0000"
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 font-medium"
                              value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                          </div>
                       </div>
                    </div>

                    {/* ESCOLARIZAÇÃO SECTION */}
                    <div className="space-y-4">
                       <h4 className="text-sm font-black uppercase text-primary tracking-widest flex items-center gap-2">
                         <span className="bg-primary/20 w-6 h-6 rounded flex items-center justify-center text-[10px]">2</span> Escolarização
                       </h4>
                       <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Escola / Instituição</label>
                            <input 
                              required type="text"
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 font-medium"
                              value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Ano / Etapa</label>
                            <select 
                              required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 font-medium appearance-none"
                              value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}
                            >
                              <option value="">Selecionar etapa...</option>
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
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Turma</label>
                            <input 
                              type="text" placeholder="Ex: Turma A"
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 font-medium"
                              value={formData.class_name} onChange={e => setFormData({...formData, class_name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Turno</label>
                            <select 
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 font-medium appearance-none"
                              value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})}
                            >
                              <option value="">Selecionar turno...</option>
                              <option value="Manhã">Manhã</option>
                              <option value="Tarde">Tarde</option>
                              <option value="Integral">Integral</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Professor(a) Regente</label>
                            <input 
                              type="text" placeholder="Nome do regente"
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 font-medium"
                              value={formData.regent_teacher} onChange={e => setFormData({...formData, regent_teacher: e.target.value})}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Professor(a) do AEE</label>
                            <input 
                              type="text" placeholder="Nome do especialista"
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 font-medium"
                              value={formData.aee_teacher} onChange={e => setFormData({...formData, aee_teacher: e.target.value})}
                            />
                          </div>
                       </div>
                    </div>

                    {/* EXCEPCIONALIDADES SECTION */}
                    <div className="space-y-4">
                       <h4 className="text-sm font-black uppercase text-primary tracking-widest flex items-center gap-2">
                         <span className="bg-primary/20 w-6 h-6 rounded flex items-center justify-center text-[10px]">3</span> Excepcionalidades (Condições e Transtornos)
                       </h4>
                       <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
                          {Object.entries(exceptionalityGroups).map(([group, options]) => (
                            <div key={group} className="space-y-3">
                              <h5 className="text-xs font-black text-slate-700 uppercase tracking-widest border-b border-slate-200 pb-2">{group}</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {options.map(option => (
                                  <label key={option} className="flex items-start gap-2 cursor-pointer group/label">
                                    <div className="relative flex items-start mt-0.5">
                                      <input 
                                        type="checkbox" 
                                        className="peer sr-only"
                                        checked={formData.exceptionalities.includes(option)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setFormData(prev => ({...prev, exceptionalities: [...prev.exceptionalities, option]}));
                                          } else {
                                            setFormData(prev => ({...prev, exceptionalities: prev.exceptionalities.filter(o => o !== option)}));
                                          }
                                        }}
                                      />
                                      <div className="w-5 h-5 rounded border-2 border-slate-300 peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all">
                                        <svg className="w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                      </div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 group-hover/label:text-slate-800 flex-1 leading-snug pt-0.5">{option}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="pt-6">
                      <button 
                        disabled={submitting}
                        type="submit" 
                        className="w-full bg-[#1DB954] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                      >
                        {submitting ? <Loader2 className="animate-spin" size={24} /> : 'Concluir Cadastro e Iniciar Acompanhamento'}
                      </button>
                    </div>
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
          <div className="w-full h-full flex flex-col items-center justify-center text-primary/30 group-hover:text-primary/50 transition-colors bg-gradient-to-br from-slate-100 to-slate-200">
             <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center mb-2 shadow-sm">
                <User size={32} />
             </div>
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
        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors truncate">{student.full_name}</h3>
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
            {age} anos • {student.grade}
          </p>
          <p className="text-xs text-slate-400 font-medium truncate italic">
            {student.school}
          </p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
          <div className="flex -space-x-2">
            {[1, 2].map(i => (
              <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white" />
            ))}
          </div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest group-hover:underline">Acessar Perfil →</span>
        </div>
      </div>
    </motion.div>
  );
};
