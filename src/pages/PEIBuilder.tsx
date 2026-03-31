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
              {/* ART. 11: Síntese do Estudo de Caso */}
              <EditorSection 
                title="1. Síntese do Estudo de Caso (Art. 11, § 1º)"
                content={
                  <div className="space-y-4">
                    <div><strong className="text-primary">I. Demandas Individuais e Barreiras:</strong> Desmotivação com o currículo regular de exatas; barreira atitudinal relacionada à repetição de conteúdos já dominados.</div>
                    <div><strong className="text-primary">II. Contexto Escolar:</strong> Turma de 6º ano numerosa, dificultando o atendimento individualizado contínuo pelo professor regente.</div>
                    <div><strong className="text-primary">III. Potencialidades e Apoio:</strong> Alto desempenho lógico-matemático (Estilo Visual/Ativo N-ILS). Necessita de apoio para tolerância à frustração em trabalhos em grupo.</div>
                    <div><strong className="text-primary">IV. Estratégias de Acessibilidade:</strong> Acesso a dispositivos digitais portáteis (Art. 12, § 4º) para desenvolvimento de projetos autônomos de programação.</div>
                  </div>
                }
              />

              {/* Metas Pedagógicas */}
              <EditorSection 
                title="2. Metas de Desenvolvimento (Acadêmicas e Socioemocionais)"
                content={
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Meta Acadêmica:</strong> Desenvolver um projeto de jogo educativo ao longo do semestre, aplicando conceitos da BNCC Computação.</li>
                    <li><strong>Meta Socioemocional:</strong> Exercer liderança colaborativa e escuta ativa durante as atividades em grupo na sala regular.</li>
                  </ul>
                }
              />

              {/* ART. 12: Organização do Atendimento */}
              <div className="relative group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">3. Organização do Atendimento (Art. 12, § 2º)</h3>
                  <AICopilotButton studentId="lucas-almeida" />
                </div>
                
                <div className="space-y-4">
                  <div className="p-5 bg-surface-container-low rounded-xl border border-slate-200">
                    <h4 className="text-sm font-bold text-primary uppercase mb-2">I. Trabalho na Sala de Aula Comum</h4>
                    <div className="prose prose-sm text-slate-600 outline-none" contentEditable="true">
                      <strong>Compactação Curricular:</strong> Substituição de exercícios repetitivos de matemática por tempo de estudo independente no Portal do Estudante, mediante validação formativa (acertos {'>'}90%).
                    </div>
                  </div>

                  <div className="p-5 bg-surface-container-low rounded-xl border border-slate-200">
                    <h4 className="text-sm font-bold text-primary uppercase mb-2">II. Trabalho no AEE (Suplementação)</h4>
                    <div className="prose prose-sm text-slate-600 outline-none" contentEditable="true">
                      <strong>Tríade de Renzulli:</strong> 2h semanais na Sala de Recursos. Foco no treinamento metodológico (Tipo II) para estruturação lógica e acompanhamento do projeto principal de software (Tipo III).
                    </div>
                  </div>

                  <div className="p-5 bg-surface-container-low rounded-xl border border-slate-200">
                    <h4 className="text-sm font-bold text-primary uppercase mb-2">III. Atividades Colaborativas</h4>
                    <div className="prose prose-sm text-slate-600 outline-none" contentEditable="true">
                      Atuação do estudante como "monitor tutor" nas aulas de introdução à tecnologia para os colegas, fomentando a interação social e a validação de seus conhecimentos.
                    </div>
                  </div>

                  <div className="p-5 bg-surface-container-low rounded-xl border border-slate-200">
                    <h4 className="text-sm font-bold text-primary uppercase mb-2">IV. Articulação Intersetorial</h4>
                    <div className="prose prose-sm text-slate-600 outline-none" contentEditable="true">
                      Parceria com o projeto de extensão universitária de tecnologia para avaliação externa do código do aplicativo desenvolvido pelo estudante.
                    </div>
                  </div>
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
