import React, { useState } from 'react';
import { 
  ChevronRight, ChevronLeft, Save, ShieldCheck, 
  Target, LayoutGrid, Sparkles, 
  Plus, CheckCircle2, Lightbulb, 
  PencilRuler, BookOpen, Trash2, X, User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from '../components/Navigation';
import { cn } from '../lib/utils';
import { useNavigate, useParams } from 'react-router-dom';

type DisciplineProfile = { 
  name: string; 
  status: 'suplementar' | 'padrao' | 'complementar'; 
  justification: string; 
};

export default function PEIBuilder() {
  const navigate = useNavigate();
  const { studentId } = useParams();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const steps = [
    { id: 1, title: 'Identificação e Caso', icon: ShieldCheck },
    { id: 2, title: 'Perfil Assíncrono', icon: LayoutGrid },
    { id: 3, title: 'Planejamento e SDI', icon: BookOpen },
    { id: 4, title: 'Enriquecimento (Renzulli)', icon: Sparkles },
    { id: 5, title: 'Metas e Apoio', icon: Target },
  ];

  // Etapa 2 state
  const [disciplines, setDisciplines] = useState<DisciplineProfile[]>([
    { name: 'Língua Portuguesa', status: 'padrao', justification: '' },
    { name: 'Matemática', status: 'padrao', justification: '' },
    { name: 'Ciências', status: 'padrao', justification: '' },
    { name: 'História', status: 'padrao', justification: '' },
    { name: 'Geografia', status: 'padrao', justification: '' },
    { name: 'Artes', status: 'padrao', justification: '' },
    { name: 'Educação Física', status: 'padrao', justification: '' },
  ]);

  // Etapa 3 state
  const [planningContent, setPlanningContent] = useState('');
  const [bnccCode, setBnccCode] = useState('');
  const [bnccItems, setBnccItems] = useState<string[]>([]);
  const hasSuplementar = disciplines.some(d => d.status === 'suplementar');
  const [compactationTarget, setCompactationTarget] = useState('');
  const [evaluationMethod, setEvaluationMethod] = useState('');

  // Etapa 4 state
  const [renzulliTypeI, setRenzulliTypeI] = useState('');
  const [renzulliTypeII, setRenzulliTypeII] = useState('');
  const [renzulliTypeIII, setRenzulliTypeIII] = useState('');

  // Etapa 5 state
  const [smartGoals, setSmartGoals] = useState<string[]>(['']);
  const [accessibilityResources, setAccessibilityResources] = useState<string[]>([
    'Liberação pontual para uso de abafadores de ruído',
    'Fragmentação de instruções longas'
  ]); // Mocked from Eixo IV
  const [newResource, setNewResource] = useState('');

  const nextStep = () => setActiveStep(prev => prev < 5 ? (prev + 1) as any : prev);
  const prevStep = () => setActiveStep(prev => prev > 1 ? (prev - 1) as any : prev);

  const handleUpdateDiscipline = (index: number, updates: Partial<DisciplineProfile>) => {
    setDisciplines(prev => prev.map((d, i) => i === index ? { ...d, ...updates } : d));
  };

  const handleCreatePei = () => {
    alert("PEI Salvo e ativado com sucesso!");
    navigate(`/students/${studentId || ''}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopBar title="Construtor de PEI" />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header & Stepper */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-on-surface mb-8 tracking-tight">Construtor de PEI - AH/SD</h1>
          
          <div className="flex items-center justify-between relative">
             <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full" />
             <div 
               className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500" 
               style={{ width: `${((activeStep - 1) / 4) * 100}%` }}
             />
             
             {steps.map(step => {
               const isActive = activeStep === step.id;
               const isPast = activeStep > step.id;
               
               return (
                 <div key={step.id} className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setActiveStep(step.id as any)}>
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-300 shadow-sm",
                     isActive ? "bg-primary text-white scale-110 shadow-primary/30" : 
                     isPast ? "bg-primary/20 text-primary border-2 border-primary" : 
                     "bg-white border-2 border-slate-200 text-slate-400 group-hover:border-primary/50"
                   )}>
                     {isPast ? <CheckCircle2 size={24} /> : <step.icon size={20} />}
                   </div>
                   <span className={cn(
                     "text-[10px] font-black uppercase tracking-widest text-center mt-1 hidden sm:block",
                     isActive ? "text-primary" : "text-slate-400"
                   )}>{step.title}</span>
                 </div>
               );
             })}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 atmospheric-shadow min-h-[500px]">
          <AnimatePresence mode="wait">
            {/* ETAPA 1 */}
            {activeStep === 1 && (
              <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <h2 className="text-2xl font-black text-on-surface flex items-center gap-3">
                   <ShieldCheck className="text-primary" /> Identificação e Caso
                </h2>
                
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                       <UserIcon className="text-primary" size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">João Silva Soares</h3>
                      <p className="text-sm font-medium text-slate-500">10 anos • 5º Ano do Ensino Fundamental</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1">Equipe Responsável</p>
                    <p className="text-sm font-bold text-slate-700">Prof. Maria (Regente) • Prof. Carlos (AEE)</p>
                  </div>
                </div>

                <div className="bg-slate-100 border border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4">
                   <LayoutGrid size={48} className="text-slate-300" />
                   <div>
                     <p className="text-lg font-bold text-slate-500 mb-1">Resumo do Mapeamento (Eixos I, II, III e IV) será carregado aqui</p>
                     <p className="text-sm text-slate-400">Os dados estruturados serão injetados automaticamente a partir do último Mapeamento Consolidado.</p>
                   </div>
                </div>
              </motion.div>
            )}

            {/* ETAPA 2 */}
            {activeStep === 2 && (
              <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-on-surface flex items-center gap-3">
                       <LayoutGrid className="text-primary" /> Perfil Curricular Assíncrono
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-2">
                       Ajuste o status de necessidade do aluno para cada componente curricular.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {disciplines.map((disc, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col xl:flex-row gap-6 items-start xl:items-center shadow-sm hover:border-primary/30 transition-all">
                      <div className="w-full xl:w-48 font-black text-slate-800 text-sm uppercase tracking-wide">
                        {disc.name}
                      </div>
                      
                      <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
                        {(['suplementar', 'padrao', 'complementar'] as const).map(status => (
                          <button
                            key={status}
                            onClick={() => handleUpdateDiscipline(idx, { status })}
                            className={cn(
                              "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all tracking-widest",
                              disc.status === status 
                                ? status === 'suplementar' ? "bg-green-100 text-green-700 shadow-sm" : 
                                  status === 'padrao' ? "bg-slate-200 text-slate-700 shadow-sm" : 
                                  "bg-red-100 text-red-700 shadow-sm"
                                : "text-slate-500 hover:bg-slate-200/50"
                            )}
                          >
                            {status === 'suplementar' && '🟢 Suplementar'}
                            {status === 'padrao' && '⚪ Padrão'}
                            {status === 'complementar' && '🔴 Complementar'}
                          </button>
                        ))}
                      </div>

                      <input 
                        type="text"
                        placeholder="Justificativa ou observação..."
                        value={disc.justification}
                        onChange={e => handleUpdateDiscipline(idx, { justification: e.target.value })}
                        className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ETAPA 3 */}
            {activeStep === 3 && (
              <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-on-surface flex items-center gap-3">
                     <BookOpen className="text-primary" /> Planejamento Curricular e SDI
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-2">
                     Organize as estratégias e conteúdos base da Base Nacional (BNCC).
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 pl-2">Unidade Temática / Conteúdo do Bimestre</label>
                  <textarea 
                    rows={4}
                    value={planningContent}
                    onChange={e => setPlanningContent(e.target.value)}
                    placeholder="Cole aqui o seu planejamento..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 pl-2">Integração BNCC</label>
                  <div className="flex gap-3">
                    <input 
                      type="text"
                      value={bnccCode}
                      onChange={e => setBnccCode(e.target.value)}
                      placeholder="Digite o código da habilidade (ex: EF05MA04)"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase"
                    />
                    <button 
                      onClick={() => { if(bnccCode) { setBnccItems([...bnccItems, bnccCode.toUpperCase()]); setBnccCode(''); } }}
                      className="px-6 bg-slate-900 text-white rounded-xl font-bold text-sm tracking-wide hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Plus size={18} /> Adicionar
                    </button>
                  </div>
                  {bnccItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {bnccItems.map((code, idx) => (
                        <div key={idx} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-black tracking-widest flex items-center gap-2 shadow-sm">
                          {code}
                          <button onClick={() => setBnccItems(bnccItems.filter((_, i) => i !== idx))}><X size={14} className="hover:text-red-500" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {hasSuplementar && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <Sparkles className="text-green-600" size={24} />
                      <h3 className="text-lg font-black text-green-800 uppercase tracking-tight">Compactação Curricular</h3>
                    </div>
                    <p className="text-sm font-bold text-green-700/80 -mt-3">Atenção: Disciplinas suplementares exigem estratégias de compactação para evitar tédio e promover o avanço.</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-green-700/60 pl-2">O que será compactado?</label>
                        <textarea 
                          rows={3} 
                          value={compactationTarget}
                          onChange={e => setCompactationTarget(e.target.value)}
                          className="w-full bg-white border border-green-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-green-700/60 pl-2">Como o domínio prévio foi avaliado?</label>
                        <textarea 
                          rows={3} 
                          value={evaluationMethod}
                          onChange={e => setEvaluationMethod(e.target.value)}
                          className="w-full bg-white border border-green-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400/50"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ETAPA 4 */}
            {activeStep === 4 && (
              <motion.div key="step-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-on-surface flex items-center gap-3">
                     <Sparkles className="text-primary" /> Tríade de Renzulli (Enriquecimento)
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-2">
                     Planeje projetos enriquecedores focaos em aprofundar interesses.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Tipo 1 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-all flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
                      <Lightbulb size={20} />
                    </div>
                    <h3 className="font-black text-lg text-slate-800">Tipo I: Exploratório</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Atividades para despertar novos interesses.
                    </p>
                    <textarea 
                      rows={4}
                      value={renzulliTypeI}
                      onChange={e => setRenzulliTypeI(e.target.value)}
                      placeholder="Ex: Trazer um palestrante sobre astronomia..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 mt-auto"
                    />
                  </div>

                  {/* Tipo 2 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-all flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                      <PencilRuler size={20} />
                    </div>
                    <h3 className="font-black text-lg text-slate-800">Tipo II: Treinamento</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Desenvolvimento de habilidades metodológicas ou socioemocionais.
                    </p>
                    <textarea 
                      rows={4}
                      value={renzulliTypeII}
                      onChange={e => setRenzulliTypeII(e.target.value)}
                      placeholder="Ex: Treinar uso de biblioteca e bases de dados..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 mt-auto"
                    />
                  </div>

                  {/* Tipo 3 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-all flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-2">
                      <Target size={20} />
                    </div>
                    <h3 className="font-black text-lg text-slate-800">Tipo III: Investigação</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Projetos práticos e resolução de problemas reais.
                    </p>
                    <textarea 
                      rows={4}
                      value={renzulliTypeIII}
                      onChange={e => setRenzulliTypeIII(e.target.value)}
                      placeholder="Ex: Criar um minidocumentário sobre poluição local..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 mt-auto"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ETAPA 5 */}
            {activeStep === 5 && (
              <motion.div key="step-5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-on-surface flex items-center gap-3">
                     <Target className="text-primary" /> Metas SMART e Apoio
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-2">
                     Defina os objetivos globais finais e inspecione os recursos de acessibilidade.
                  </p>
                </div>

                <div className="space-y-6 bg-slate-50 border border-slate-100 rounded-3xl p-8">
                   <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">Metas SMART (Específicas, Mensuráveis, Alcançáveis, Relevantes e Temporais)</h3>
                   <div className="space-y-3">
                     {smartGoals.map((goal, idx) => (
                       <div key={idx} className="flex gap-3">
                         <input 
                           type="text"
                           value={goal}
                           onChange={e => {
                             const newGoals = [...smartGoals];
                             newGoals[idx] = e.target.value;
                             setSmartGoals(newGoals);
                           }}
                           placeholder="Ex: O aluno deverá dominar frações complexas com 90% de precisão até o fim do bimestre..."
                           className="flex-1 bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                         />
                         <button 
                           onClick={() => setSmartGoals(smartGoals.filter((_, i) => i !== idx))} 
                           className="w-14 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all shadow-sm"
                           title="Remover Meta"
                         >
                           <Trash2 size={20} />
                         </button>
                       </div>
                     ))}
                   </div>
                   <button 
                     onClick={() => setSmartGoals([...smartGoals, ''])}
                     className="px-6 py-4 bg-white border border-dashed border-slate-300 text-slate-500 rounded-xl font-bold text-sm tracking-wide hover:border-slate-400 hover:text-slate-700 transition-all flex items-center gap-2 shadow-sm w-full justify-center"
                   >
                     <Plus size={18} /> Adicionar Nova Meta
                   </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-[24px] p-8 space-y-6">
                   <div className="flex items-center gap-3">
                     <ShieldCheck className="text-blue-600" size={28} />
                     <h3 className="font-black text-xl text-blue-900 uppercase tracking-tight">Recursos de Acessibilidade (LBI)</h3>
                   </div>
                   <p className="text-sm text-blue-800/80 font-medium bg-white/50 p-3 rounded-lg border border-blue-100/50">
                     O sistema extrai bases de acessibilidade do <strong>Mapeamento Consolidado (Eixo IV)</strong>. Abaixo você pode rever ou adicionar manualmente se julgar necessário.
                   </p>
                   
                   <ul className="space-y-3">
                     {accessibilityResources.map((res, idx) => (
                       <li key={idx} className="flex items-start gap-4 bg-white p-4 rounded-xl border border-blue-100 shadow-sm transition-all hover:shadow-md">
                         <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                           <CheckCircle2 size={14} />
                         </div>
                         <span className="text-sm font-bold text-slate-700 flex-1 pt-0.5">{res}</span>
                         <button 
                           onClick={() => setAccessibilityResources(accessibilityResources.filter((_, i) => i !== idx))} 
                           className="text-slate-300 hover:text-red-500 transition-colors p-1"
                         >
                           <X size={18} />
                         </button>
                       </li>
                     ))}
                   </ul>

                   <div className="flex gap-3 mt-4 pt-4 border-t border-blue-200/50">
                      <input 
                        type="text" 
                        value={newResource}
                        onChange={e => setNewResource(e.target.value)}
                        placeholder="Novo recurso (Ex: Mesa adaptada)..."
                        className="flex-1 bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
                      />
                      <button 
                        onClick={() => { if(newResource) { setAccessibilityResources([...accessibilityResources, newResource]); setNewResource(''); } }}
                        className="px-6 bg-blue-600 text-white rounded-xl font-bold text-sm tracking-wide hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Plus size={18} /> Adicionar
                      </button>
                   </div>
                </div>

                <div className="pt-10 flex justify-end">
                   <button 
                     onClick={handleCreatePei}
                     className="w-full md:w-auto bg-[#1DB954] text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                     <Save size={20} /> Salvar e Ativar PEI
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer / Stepper Navigation */}
        <div className="mt-8 flex items-center justify-between">
           <button 
             onClick={prevStep}
             disabled={activeStep === 1}
             className={cn(
               "px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all duration-300",
               activeStep === 1 
                 ? "opacity-0 translate-y-2 pointer-events-none" 
                 : "bg-white text-slate-500 hover:text-primary shadow-sm border border-slate-100 hover:border-primary/30 opacity-100"
             )}
           >
             <ChevronLeft size={16} /> Passo Anterior
           </button>
           
           {activeStep < 5 && (
             <button 
               onClick={nextStep}
               className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all duration-300"
             >
               Próximo Passo <ChevronRight size={16} />
             </button>
           )}
        </div>
      </main>
    </div>
  );
}
