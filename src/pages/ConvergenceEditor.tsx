import React from 'react';
import { Brain, Sparkles, History, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { TopBar } from '../components/Navigation';

export default function ConvergenceEditor() {
  return (
    <div className="flex flex-col flex-grow h-screen">
      <TopBar title="Editor de Convergência">
        <div className="hidden md:flex items-center bg-surface-container rounded-full px-4 py-2 gap-2 text-on-surface-variant ml-4">
          <Search size={16} />
          <input className="bg-transparent border-none focus:ring-0 text-sm w-48" placeholder="Procurar registros..." type="text"/>
        </div>
      </TopBar>
      <div className="flex flex-col flex-grow overflow-hidden pb-4 px-6 h-[calc(100vh-100px)]">
        <div className="flex flex-col mb-6 pt-4">
          <p className="text-sm text-slate-500">Ponte de Validação IA + Professor</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden">
          {/* Column 1: IA Insights */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-2/5 flex flex-col gap-6 overflow-y-auto pr-2 no-scrollbar"
        >
          <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col gap-6 h-full">
            <div className="flex items-center gap-2">
              <Brain className="text-primary" size={24} />
              <h3 className="font-bold text-slate-900 tracking-tight">Motor de Insights IA</h3>
            </div>
            
            {/* N-ILS Visualization Panel */}
            <div className="relative bg-surface-container-low rounded-lg p-6 flex flex-col items-center justify-center min-h-[280px]">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Análise de Dimensões N-ILS</h4>
              
              <div className="relative w-48 h-48 border-2 border-dashed border-primary/20 rounded-full flex items-center justify-center">
                <div className="absolute w-32 h-32 bg-primary/10 rounded-full animate-pulse"></div>
                <div className="w-24 h-24 bg-primary/30 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-4xl">blur_on</span>
                </div>
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/40"></div>
                <div className="absolute bottom-4 right-4 w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/40"></div>
                <div className="absolute bottom-10 left-0 w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/40"></div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-primary"></div> Aprendizagem Ativa
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div> Lógica Visual
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clusters Cognitivos</span>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-bold text-primary">Raciocínio-Espacial</span>
                <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-bold text-slate-600">Hiperfoco</span>
                <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-bold text-primary">Lógica-Abstrata</span>
                <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-bold text-slate-600">Reconhecimento-Padrões</span>
              </div>
            </div>

            <div className="mt-auto space-y-4 pt-4 border-t border-slate-50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gerando Previsão...</span>
              <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden relative">
                <motion.div 
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                />
              </div>
              <div className="h-4 w-3/4 bg-surface-container rounded-full overflow-hidden relative">
                <motion.div 
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear', delay: 0.2 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Column 2: Professor Screening Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-3/5 flex flex-col gap-4 overflow-y-auto pr-2 no-scrollbar"
        >
          <div className="bg-white rounded-xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border-l-4 border-primary">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Sugestão de Rascunho #204</span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">Objetivo de Aprendizagem Individualizado</h3>
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                <History size={20} />
              </button>
            </div>

            <div className="space-y-8">
              <EditorBlock 
                label="Suporte Ambiental" 
                content="Garantir um espaço de trabalho com baixo estímulo e iluminação direcional focada na superfície da tarefa primária para minimizar distrações periféricas."
              />
              <EditorBlock 
                label="Estratégia de Comunicação" 
                content="Implementar cronograma visual com marcadores de transição codificados por cores. Instruções verbais devem ter menos de 10 palavras para alinhar com picos de processamento."
                checked
              />
            </div>
          </div>

          <div className="mt-4 bg-white/60 backdrop-blur-md p-4 rounded-xl flex items-center justify-between shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4 text-slate-500">
              <span className="text-xs font-bold">2/12 BLOCOS VALIDADOS</span>
              <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="w-1/6 h-full bg-primary"></div>
              </div>
            </div>
            <button className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all active:scale-95">
              <Sparkles size={20} />
              Validar e Gerar Rascunho
            </button>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
}

function EditorBlock({ label, content, checked = false }: { label: string, content: string, checked?: boolean }) {
  return (
    <div className="group relative bg-surface p-6 rounded-lg border-2 border-transparent hover:border-primary/20 transition-all">
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold text-primary uppercase">{label}</label>
        <p className="text-slate-700 leading-relaxed">{content}</p>
        <div className="mt-4 flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200/50">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input defaultChecked={checked} className="w-5 h-5 rounded-full border-slate-300 text-primary focus:ring-primary" type="checkbox"/>
            <span className="text-sm font-semibold text-slate-600 group-hover:text-primary transition-colors">Confirmar</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input className="w-5 h-5 rounded-full border-slate-300 text-primary focus:ring-primary" type="checkbox"/>
            <span className="text-sm font-semibold text-slate-600 group-hover:text-primary transition-colors">Descartar</span>
          </label>
          <div className="flex-grow">
            <input className="w-full bg-white border-slate-200 rounded-md text-sm py-1.5 px-3 focus:border-primary focus:ring-0" placeholder="Editar Nota..." type="text"/>
          </div>
        </div>
      </div>
    </div>
  );
}
