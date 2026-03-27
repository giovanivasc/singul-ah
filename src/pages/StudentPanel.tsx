import React from 'react';
import { BarChart3, Brain, Info, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { TopBar } from '../components/Navigation';

export default function StudentPanel() {
  return (
    <>
      <TopBar title="Centro de Instrumentos" showBack />
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-on-surface tracking-tight">Painel do Aluno: <span className="text-primary">Lucas Oliveira</span></h2>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                <BarChart3 className="text-on-secondary-container" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Coleta</p>
                <p className="text-2xl font-black text-on-surface">81%</p>
              </div>
            </div>
            <div className="bg-primary p-5 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Brain className="text-white" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/70 uppercase">Dominante</p>
                <p className="text-2xl font-black text-white">Visual/Ativo</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
          {['INFO ALUNO', 'IF-SAHS', 'IP-SAHS', 'ENTREVISTA'].map(tab => (
            <button key={tab} className="px-6 py-2.5 rounded-full text-sm font-bold bg-surface-container-highest text-slate-600 whitespace-nowrap">
              {tab}
            </button>
          ))}
          <button className="px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-white whitespace-nowrap shadow-md">N-ILS</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
          >
            <div className="flex justify-between items-start mb-10">
              <h3 className="text-lg font-bold text-on-surface">Estilos de Aprendizagem N-ILS</h3>
              <Info className="text-slate-400" size={20} />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-[200px] h-[100px] rounded-t-[100px] bg-surface-container relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-primary" 
                  style={{ clipPath: 'polygon(0 100%, 0 0, 65% 0, 65% 100%)' }}
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140px] h-[70px] bg-white rounded-t-[70px] flex items-end justify-center pb-2">
                  <span className="text-2xl font-black text-primary">Sensorial</span>
                </div>
              </div>
              <div className="w-full flex justify-between text-[10px] font-bold uppercase text-slate-400 mt-4 tracking-tighter">
                <span>Pólo: Sensorial</span>
                <span>Pólo: Intuitivo</span>
              </div>
              <div className="w-full bg-surface-container h-1 rounded-full mt-2 relative">
                <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
                <div className="absolute top-[-4px] left-[65%] w-3 h-3 bg-white border-2 border-primary rounded-full shadow-sm"></div>
              </div>
              <p className="mt-6 text-sm text-on-surface-variant leading-relaxed text-center">
                Lucas demonstra uma preferência acentuada por conteúdos práticos e fatos concretos, característica marcante do perfil sensorial.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold text-on-surface">Mapeamento de Habilidades Gardner</h3>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="w-2 h-2 rounded-full bg-secondary-container"></div>
              </div>
            </div>
            <div className="relative h-64 flex items-center justify-center">
              <svg className="w-full h-full max-w-[240px]" viewBox="0 0 200 200">
                <polygon fill="none" points="100,20 180,80 150,170 50,170 20,80" stroke="#e5eff8" strokeWidth="1"></polygon>
                <polygon fill="none" points="100,50 150,85 130,140 70,140 50,85" stroke="#e5eff8" strokeWidth="1"></polygon>
                <line stroke="#e5eff8" strokeWidth="1" x1="100" x2="100" y1="100" y2="20"></line>
                <line stroke="#e5eff8" strokeWidth="1" x1="100" x2="180" y1="100" y2="80"></line>
                <line stroke="#e5eff8" strokeWidth="1" x1="100" x2="150" y1="100" y2="170"></line>
                <line stroke="#e5eff8" strokeWidth="1" x1="100" x2="50" y1="100" y2="170"></line>
                <line stroke="#e5eff8" strokeWidth="1" x1="100" x2="20" y1="100" y2="80"></line>
                <polygon fill="rgba(0, 87, 193, 0.15)" points="100,40 160,80 130,130 90,160 40,90" stroke="#0057c1" strokeLinejoin="round" strokeWidth="2"></polygon>
              </svg>
              <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 uppercase">Lógica</span>
              <span className="absolute top-1/3 right-4 text-[10px] font-bold text-slate-500 uppercase">Musical</span>
              <span className="absolute bottom-4 right-1/4 text-[10px] font-bold text-slate-500 uppercase">Espacial</span>
              <span className="absolute bottom-4 left-1/4 text-[10px] font-bold text-slate-500 uppercase">Intrapessoal</span>
              <span className="absolute top-1/3 left-4 text-[10px] font-bold text-slate-500 uppercase">Linguística</span>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-xl p-10 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border-l-8 border-primary"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h3 className="text-2xl font-black text-on-surface mb-1">Questionário N-ILS</h3>
              <p className="text-on-surface-variant text-sm">Etapa 4 de 5: Preferências de Processamento</p>
            </div>
            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-xs font-bold text-primary mb-2">
                <span>Progresso do Aluno</span>
                <span>85%</span>
              </div>
              <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-surface p-8 rounded-2xl">
              <p className="text-lg font-bold text-on-surface mb-6">Questão 28: Ao estudar um novo conceito, você prefere:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center gap-4 p-5 rounded-xl bg-white border-2 border-primary text-left transition-all hover:bg-primary-container group">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold">A</div>
                  <span className="font-semibold text-on-surface group-hover:text-white">Tentar aplicar o conceito imediatamente na prática</span>
                </button>
                <button className="flex items-center gap-4 p-5 rounded-xl bg-white border-2 border-transparent hover:border-outline-variant text-left transition-all hover:bg-surface-container-low group">
                  <div className="w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center shrink-0 font-bold">B</div>
                  <span className="font-semibold text-on-surface-variant">Refletir calmamente sobre a teoria antes de qualquer ação</span>
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <button className="flex items-center gap-2 text-slate-500 font-bold hover:text-primary transition-colors">
                <ChevronLeft size={20} />
                Questão Anterior
              </button>
              <button className="bg-primary text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-primary/30 active:scale-95 transition-all">
                Próxima Questão
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
