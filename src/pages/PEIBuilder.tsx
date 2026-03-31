import React from 'react';
import { Save, FileText, ChevronRight, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, History, Wand2, CheckCircle, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';
import { TopBar } from '../components/Navigation';
import { AICopilotButton } from '../components/AICopilotButton';

export default function PEIBuilder() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar 
        title="Construtor de PEI"
        rightActions={
          <>
            <button className="hidden lg:flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-full transition-all text-sm font-medium">
              <Save size={18} />
              Salvar Rascunho
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm">
              <FileText size={18} />
              Finalizar e Exportar PDF
            </button>
          </>
        }
      >
        <nav className="flex items-center gap-2 ml-6">
          <span className="text-xs text-slate-400">Repositório</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-xs text-slate-400">Aluno: Lucas Almeida</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-xs font-bold text-primary">Documento Final</span>
        </nav>
      </TopBar>

      <div className="flex-1 flex flex-col p-4 md:p-8 space-y-6 overflow-hidden">
        <div className="flex-1 flex gap-8 overflow-hidden">
          {/* Editor Panel */}
          <section className="flex-1 flex flex-col bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-6 py-4 bg-surface-container-low/50 flex items-center gap-2 border-b border-surface-variant/20">
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm">
                <ToolbarButton icon={<Bold size={18} />} />
                <ToolbarButton icon={<Italic size={18} />} />
                <ToolbarButton icon={<Underline size={18} />} />
              </div>
              <div className="w-px h-6 bg-slate-200 mx-2"></div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm">
                <ToolbarButton icon={<List size={18} />} />
                <ToolbarButton icon={<ListOrdered size={18} />} />
              </div>
              <div className="w-px h-6 bg-slate-200 mx-2"></div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm">
                <ToolbarButton icon={<AlignLeft size={18} />} />
                <ToolbarButton icon={<AlignCenter size={18} />} />
              </div>
              <div className="ml-auto flex items-center gap-2 text-xs font-medium text-slate-400">
                <History size={14} />
                Última edição há 2 min
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
              <EditorSection 
                title="Caracterização e Potencialidades"
                content="O aluno apresenta um perfil cognitivo com destaque para o processamento visual e memória de longo prazo para temas de interesse específico (astronomia e mecânica). Manifesta autonomia em atividades de vida diária, porém requer mediação constante em contextos de interação social não estruturada. Demonstra excelente engajamento em tarefas que envolvem sistematização e lógica sequencial."
              />
              
              <EditorSection 
                title="Estratégias de Suplementação Sugeridas"
                content={
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Implementação de antecipadores visuais para transições de rotina acadêmica.</li>
                    <li>Uso de metodologias baseadas em projetos vinculados ao interesse por Astronomia para ensino de conceitos matemáticos.</li>
                    <li>Fragmentação de comandos complexos em etapas sequenciais curtas.</li>
                    <li>Utilização de reforçadores positivos intermitentes baseados em tempo de tela educativo.</li>
                  </ul>
                }
              />

              <div className="relative group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">Objetivos de Desenvolvimento</h3>
                  <AICopilotButton studentId="lucas-almeida" />
                </div>
                <div className="p-6 bg-surface-container-low/30 rounded-2xl border-2 border-dashed border-slate-200 transition-all hover:border-primary/20">
                  <p className="text-slate-400 italic text-center py-4">Clique para adicionar objetivos personalizados ou utilize a IA para gerar baseados nas potencialidades.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar Info */}
          <aside className="hidden xl:flex flex-col w-80 space-y-6">
            <div className="bg-primary p-8 rounded-xl text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle size={16} className="text-blue-200" />
                  <span className="text-xs font-bold tracking-widest uppercase opacity-80">Status do Documento</span>
                </div>
                <h4 className="text-3xl font-extrabold mb-1">85%</h4>
                <p className="text-sm text-blue-100">Concluído</p>
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-6">
                  <div className="bg-white h-full rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            <div className="bg-surface-container-high/50 p-6 rounded-xl border border-white/50">
              <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Lightbulb size={20} className="text-primary" />
                IA Insights
              </h5>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <p className="text-xs text-slate-500 mb-1 font-bold uppercase">Tom do Documento</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">Técnico & Acolhedor</span>
                    <span className="flex-1 h-1 bg-green-100 rounded-full overflow-hidden">
                      <span className="block h-full bg-green-500 w-full"></span>
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Sugestão de Revisão</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Detectamos repetição da palavra "mediação" no primeiro bloco. Deseja substituir por sinônimos?
                  </p>
                  <button className="mt-2 text-[11px] font-bold text-primary">Substituir agora</button>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white/40 rounded-xl border border-white/40 p-6 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-20 bg-white shadow-md rounded border border-slate-100 flex flex-col p-2">
                <div className="w-full h-1 bg-slate-200 rounded mb-1"></div>
                <div className="w-2/3 h-1 bg-slate-100 rounded mb-3"></div>
                <div className="space-y-1">
                  <div className="w-full h-0.5 bg-slate-50"></div>
                  <div className="w-full h-0.5 bg-slate-50"></div>
                  <div className="w-full h-0.5 bg-slate-50"></div>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-400 px-4">Pré-visualização em tempo real do PDF</p>
              <button className="text-xs font-bold text-primary hover:underline">Abrir em tela cheia</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="p-2 hover:bg-blue-50 text-slate-600 rounded-lg transition-colors">
      {icon}
    </button>
  );
}

function EditorSection({ title, content }: { title: string, content: React.ReactNode }) {
  return (
    <div className="relative group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-primary rounded-full text-xs font-bold hover:bg-blue-100 transition-colors">
          <Wand2 size={14} />
          Sugestão de IA
        </button>
      </div>
      <div className="p-6 bg-surface-container-low rounded-2xl transition-all border border-transparent focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5">
        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed outline-none" contentEditable="true">
          {content}
        </div>
      </div>
    </div>
  );
}
