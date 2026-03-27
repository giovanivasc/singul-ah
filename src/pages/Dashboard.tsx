import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { TopBar } from '../components/Navigation';

const students = [
  {
    id: 1,
    name: 'Lucas Oliveira',
    grade: '4º Ano',
    specialty: 'Educação Especial',
    status: 'Ativo',
    progress: 85,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwBDm0so1Fi5aUI7jFKz4Y7kHre0YKcy0rNd93VT30EMCKx32mslJpzyHlOlhdSWBR-htXOD2uFXZ8zYDXNLYfui8NTOtgeI1kWyDNEufaLutaHtcwUUSKnTjgXpq0ARzV3oenSWLB5--FpksfgNcXlh_P5T-ukohvMMSGJ79_7dlHPNVX2wPmB2qaeLJ8W8Xd1Gv2YWn6CAu-5hh7N5_c5qvcghVTn0scAhEp0dIGk3DGs7B1oMGDDo4NLk5nN_H6UFk2CiJKr8zb'
  },
  {
    id: 2,
    name: 'Beatriz Santos',
    grade: '2º Ano',
    specialty: 'Suporte de Alfabetização',
    status: 'Pendente',
    progress: 42,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGfev_dq6QNsq8G_hNEShfwp_8aHSiAb3Gp3bKDNiGv_0sBz65qoTB9WxhgOykdUMAlrlplUq6P9dCko2J8VlzdHarD2YKDhre6bbRRoFePXDhOu16CSBZCvjMcPvxXpqwnRIrJ_IVDvDuqCMJgtq1Ew3o3a9QTeFKJR6b9YrA4lMA2-oNdpDeyetwO5O_Z9Su_Ro0rviVF5Qu68O9oj9I4TVxbDXiyaLoYBFkLW2cq4icct1pS8M3uoFbyYnRQloea9Sn3bahWeeQ'
  },
  {
    id: 3,
    name: 'Gabriel Lima',
    grade: '6º Ano',
    specialty: 'Plano Comportamental',
    status: 'Ativo',
    progress: 95,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4kbXa_ktpOKaBb0sRvkAcumXmsuwBJ2WWzbd-cAFtPJO5TF9Bb4tnW_KoCd1j-TE1ZuE685QL_3zzI1vZWs806hLGSgvnF7cw7kGAUWGtXk0IdgHYC8GRPQdifpXCAhs41ZhLCkRKo3WWZMjQWAApD8HwwKbnWlinetP_C6p1cGuFeMQyHgGgxCWqrSZzgg95fLGQ42f0AnHfAM87ZRIKwzIOT5qAgkzvCyGOOjxONM6nTBEHBewIUdH7Md_AIueXd0W-dDK9JNqS'
  },
  {
    id: 4,
    name: 'Mariana Costa',
    grade: 'Educação Infantil',
    specialty: 'Desenvolvimento Precoce',
    status: 'Crítico',
    progress: 15,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0lHZ5nrG4rTztmXx1MaiWUFHvuuBLDNZ61pr_ayQuj-Rhebw2VAj8_idkUVbflt9t639LGOt68Pl93P6hBNTJS9jgPXBYqmr0ty0SYRTUBj0xvyserJNxRV5ZLwJPr3MjbGbaC4Ifv4rv0uNLwUMrNQQeQ_u0T7ZFEW4Hwa1f-wDDq5hbLdJ3l_xB-8Jnjfv_ULzdg_vaJBRjDksVb9Yny8eeE-HDevN1HfNJz3c9tAAkjZdVAvtbiEohHLsG3Q9I7M-08BowxDh_'
  }
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Singul-AH" />
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-12 w-full">
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">Visão Geral do Painel</h2>
          <p className="text-slate-500 mt-1">Monitorando o progresso da educação individualizada</p>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <KPICard 
            title="Total de Alunos" 
            value="128" 
            trend="+12 este mês" 
            icon={<TrendingUp size={16} />} 
            color="primary"
          />
          <KPICard 
            title="PEIs Concluídos" 
            value="94" 
            trend="73.4% conformidade" 
            icon={<CheckCircle size={16} />} 
            color="tertiary"
          />
          <KPICard 
            title="PEIs Pendentes" 
            value="34" 
            trend="Requer atenção" 
            icon={<Clock size={16} />} 
            color="error"
          />
        </div>

        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-bold tracking-tight">Alunos Ativos</h3>
          <button className="text-primary font-bold text-sm hover:underline">Ver todos os registros</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {students.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface-container-lowest rounded-lg p-6 atmospheric-shadow flex gap-6 items-center"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  src={student.image} 
                  alt={student.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="text-lg font-bold text-on-surface">{student.name}</h4>
                    <span className="text-sm text-slate-500">{student.grade} • {student.specialty}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    student.status === 'Ativo' ? 'bg-secondary-container/30 text-on-secondary-container' :
                    student.status === 'Pendente' ? 'bg-tertiary-container/20 text-tertiary' :
                    'bg-error-container/30 text-error'
                  }`}>
                    {student.status}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase mb-1.5">
                    <span>Status de Progresso</span>
                    <span>{student.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        student.progress > 80 ? 'bg-primary' :
                        student.progress > 40 ? 'bg-tertiary-container' :
                        'bg-error'
                      }`} 
                      style={{ width: `${student.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 ml-2">
                <button 
                  onClick={() => navigate(`/students/${student.id}`)}
                  className="bg-primary text-white px-5 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-opacity atmospheric-shadow"
                >
                  Preencher/Ver
                </button>
              </div>
            </motion.div>
          ))}
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
