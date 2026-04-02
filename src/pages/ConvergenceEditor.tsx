import React, { useState } from 'react';
import { 
  Brain, Sparkles, FileText, CheckCircle2,
  Database, Loader2, ArrowRight, Activity,
  Users, Edit3, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from '../components/Navigation';
import { useNavigate, useParams } from 'react-router-dom';
import { MultimodalInput } from '../components/MultimodalInput';
import { cn } from '../lib/utils';

export const SYSTEM_PROMPT_ESTUDO_CASO = `Você é um especialista em Educação Especial, Altas Habilidades/Superdotação (AH/SD) e Legislação Brasileira de Inclusão. Sua tarefa é analisar relatos brutos de diferentes fontes (Família, Prof. Regente, Prof. AEE, Estudante) e gerar a síntese do Estudo de Caso. 
REGRAS VITAIS:
1. Não force convergência se os relatos divergirem por causa do ambiente (ex: comportamento na sala regular vs. AEE). Trate isso como 'especificidade ambiental'.
2. Classifique as barreiras ESTRITAMENTE segundo a LBI: Urbanísticas, Arquitetônicas, Transportes, Comunicações/Informação, Atitudinais e Tecnológicas.
3. Retorne APENAS um objeto JSON válido com as seguintes chaves (referentes ao Art. 11 do Dec. 12.686/2025):
{
  "eixo_I_demandas_e_barreiras": "Identificação inicial de demandas biopsicossociais e barreiras primárias relatadas.",
  "eixo_II_contexto_e_analise_lbi": "Análise do contexto escolar (pontos positivos e negativos) e tipificação das barreiras (LBI) encontradas nos diferentes ambientes.",
  "eixo_III_potencialidades_e_apoio": "Mapeamento das potencialidades, estilos de aprendizagem, interesses profundos e o que o estudante gosta. Liste como esses interesses podem ser usados como reforçadores positivos para tarefas com resistência.",
  "eixo_IV_estrategias_pre_pei": "Definição de estratégias e recursos de acessibilidade focados na eliminação das barreiras citadas, servindo como ponte para a construção do PEI."
}`;
interface ConvergenceAxes {
  eixo_I_demandas_e_barreiras: string;
  eixo_II_contexto_e_analise_lbi: string;
  eixo_III_potencialidades_e_apoio: string;
  eixo_IV_estrategias_pre_pei: string;
}

const mockIaResponse: ConvergenceAxes = {
  eixo_I_demandas_e_barreiras: "Identificação inicial aponta para forte resistência em tarefas repetitivas e necessidade de previsibilidade. As barreiras primárias relatadas pela família envolvem sobrecarga sensorial em ambientes muito ruidosos da escola convencional.",
  eixo_II_contexto_e_analise_lbi: "Análise ambiental indica especificidade no ambiente de sala de aula regular em contraste com o AEE (onde há regulação plena). Barreiras tipificadas pela LBI: 1) Barreiras Atitudinais (expectativas rígidas quanto ao método de estudo); 2) Barreiras de Comunicação/Informação (instruções longas que causam fadiga atencional).",
  eixo_III_potencialidades_e_apoio: "Aluno possui vocabulário avançado para idade, raciocínio espacial muito acima da média (Estilos N-ILS: Visual, Global) e hiperfoco em Astronomia. Sugere-se usar o interesse por Astronomia como referencial metafórico para organizar o pensamento matemático e engajamento em produção textual.",
  eixo_IV_estrategias_pre_pei: "Estratégias de base para o PEI: Fragmentação de tarefas com marcadores visuais (Combate à barreira de comunicação), liberação pontual para uso de fones abafadores (Combate à barreira sensorial), e inserção de escolhas múltiplas de resolução em exames."
};

export default function ConvergenceEditor() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  const [axesData, setAxesData] = useState<ConvergenceAxes>({
    eixo_I_demandas_e_barreiras: '',
    eixo_II_contexto_e_analise_lbi: '',
    eixo_III_potencialidades_e_apoio: '',
    eixo_IV_estrategias_pre_pei: ''
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulating API Call to LLM
    setTimeout(() => {
      setAxesData(mockIaResponse);
      setHasGenerated(true);
      setIsGenerating(false);
    }, 3000);
  };

  const handleApproveAndProceed = () => {
    // Navigate to PEI Builder or next step
    alert("Estudo de Caso aprovado com sucesso! Iniciando elaboração do PEI...");
    navigate(`/students/${studentId}/pei-builder`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <TopBar title="Consolidação do Estudo de Caso" />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Coluna Esquerda: Fontes de Dados e Controle IA */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 atmospheric-shadow flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
               <Database className="text-primary" size={24} />
               <h2 className="text-xl font-black text-on-surface tracking-tight">Base de Dados</h2>
            </div>
            
            <p className="text-sm text-slate-500 font-medium">Os seguintes instrumentos estão prontos para compilar o cenário do estudante:</p>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Users size={18} />
                     </div>
                     <div>
                        <p className="font-bold text-sm text-slate-700">IF-SAHS (Família)</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Atualizado há 2 dias</p>
                     </div>
                  </div>
                  <CheckCircle2 size={18} className="text-green-500" />
               </div>

               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <Activity size={18} />
                     </div>
                     <div>
                        <p className="font-bold text-sm text-slate-700">IP-SAHS (Matemática)</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Atualizado hoje</p>
                     </div>
                  </div>
                  <CheckCircle2 size={18} className="text-green-500" />
               </div>

               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <Brain size={18} />
                     </div>
                     <div>
                        <p className="font-bold text-sm text-slate-700">N-ILS (Estilos)</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Mapeado pelo sistema</p>
                     </div>
                  </div>
                  <CheckCircle2 size={18} className="text-green-500" />
               </div>
            </div>

            <button 
               disabled={isGenerating}
               onClick={handleGenerate}
               className={cn(
                 "mt-auto w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95",
                 isGenerating ? "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed" : "bg-primary text-white shadow-primary/20 hover:brightness-110"
               )}
            >
               {isGenerating ? (
                  <><Loader2 size={20} className="animate-spin" /> Processando IA...</>
               ) : (
                  <><Sparkles size={20} /> Gerar Mapeamento do Estudo de Caso (IA)</>
               )}
            </button>
            
            {hasGenerated && (
               <div className="flex items-center gap-2 justify-center text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 py-2 rounded-xl border border-green-200 mt-[-10px]">
                  <CheckCircle2 size={14} /> Mapeamento Concluído
               </div>
            )}
          </div>
          
        </div>

        {/* Coluna Direita: Resultado Legal Art. 11 */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 atmospheric-shadow flex flex-col items-center justify-center text-center">
             <ShieldCheck size={32} className="text-primary mb-3" />
             <h2 className="text-2xl font-black text-on-surface tracking-tight">Síntese do Estudo de Caso</h2>
             <p className="text-sm font-medium text-slate-500 mt-2 max-w-xl">
               Esta estrutura obedece ao <strong>Art. 11 do Decreto 12.686/2025</strong> e mapeias as barreiras em conformidade com a <strong>LBI (Lei Brasileira de Inclusão)</strong>.
             </p>
          </div>

          <AnimatePresence mode="wait">
             {!hasGenerated && !isGenerating && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-slate-50 border-2 border-dashed border-slate-200 flex-1 rounded-[32px] flex flex-col items-center justify-center p-12 text-center"
                >
                   <Brain size={48} className="text-slate-300 mb-6" />
                   <p className="text-slate-500 font-bold text-lg max-w-sm mb-2">Aguardando Análise da Inteligência Artificial</p>
                   <p className="text-slate-400 text-sm">Clique em "Gerar Mapeamento" na coluna ao lado para cruzar os dados dos instrumentos.</p>
                </motion.div>
             )}

             {isGenerating && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-primary/5 border border-primary/20 flex-1 rounded-[32px] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent animate-pulse rounded-[32px]" />
                   <Loader2 size={48} className="text-primary animate-spin mb-6 relative z-10" />
                   <p className="text-primary font-black text-lg max-w-sm mb-2 relative z-10">Lendo e Categorizando Fatos...</p>
                   <p className="text-slate-500 text-sm font-medium relative z-10">Adequando barreiras aos tipos previstos na LBI.</p>
                </motion.div>
             )}

             {hasGenerated && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                   {/* Card Eixo I */}
                   <div className="bg-white p-8 rounded-[32px] border border-slate-100 atmospheric-shadow">
                      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                         <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0">I</div>
                         <div>
                           <h3 className="text-lg font-black text-on-surface uppercase tracking-tight">Demandas Biopsicossociais e Barreiras</h3>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Identificação Inicial (Decreto 12.686/2025)</p>
                         </div>
                      </div>
                      <MultimodalInput 
                         value={axesData.eixo_I_demandas_e_barreiras}
                         onChange={(val) => setAxesData(prev => ({ ...prev, eixo_I_demandas_e_barreiras: val }))}
                         placeholder="Aguardando dados..."
                      />
                   </div>

                   {/* Card Eixo II */}
                   <div className="bg-white p-8 rounded-[32px] border border-slate-100 atmospheric-shadow">
                      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                         <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0">II</div>
                         <div>
                           <h3 className="text-lg font-black text-on-surface uppercase tracking-tight">Análise do Contexto Escolar (LBI)</h3>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tipificação legal das barreiras</p>
                         </div>
                      </div>
                      <MultimodalInput 
                         value={axesData.eixo_II_contexto_e_analise_lbi}
                         onChange={(val) => setAxesData(prev => ({ ...prev, eixo_II_contexto_e_analise_lbi: val }))}
                         placeholder="Aguardando dados..."
                      />
                   </div>

                   {/* Card Eixo III */}
                   <div className="bg-white p-8 rounded-[32px] border border-slate-100 atmospheric-shadow">
                      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                         <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0">III</div>
                         <div>
                           <h3 className="text-lg font-black text-on-surface uppercase tracking-tight">Potencialidades, Interesses e Apoio</h3>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Mapeamento como via de acesso pedagógico</p>
                         </div>
                      </div>
                      <MultimodalInput 
                         value={axesData.eixo_III_potencialidades_e_apoio}
                         onChange={(val) => setAxesData(prev => ({ ...prev, eixo_III_potencialidades_e_apoio: val }))}
                         placeholder="Aguardando dados..."
                      />
                   </div>

                   {/* Card Eixo IV */}
                   <div className="bg-white p-8 rounded-[32px] border border-slate-100 atmospheric-shadow">
                      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                         <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0">IV</div>
                         <div>
                           <h3 className="text-lg font-black text-on-surface uppercase tracking-tight">Pontes para o PEI</h3>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Recursos de minimização de barreiras (Acessibilidade)</p>
                         </div>
                      </div>
                      <MultimodalInput 
                         value={axesData.eixo_IV_estrategias_pre_pei}
                         onChange={(val) => setAxesData(prev => ({ ...prev, eixo_IV_estrategias_pre_pei: val }))}
                         placeholder="Aguardando dados..."
                      />
                   </div>

                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pt-6">
                      <button 
                         onClick={handleApproveAndProceed}
                         className="w-full bg-[#1DB954] text-white py-7 rounded-[32px] font-black text-base uppercase tracking-widest shadow-xl shadow-green-500/20 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                      >
                         <span>Aprovar Estudo de Caso e Avançar para o PEI</span>
                         <ArrowRight size={24} />
                      </button>
                      <p className="text-center text-xs font-bold text-slate-400 mt-6 uppercase tracking-widest flex items-center justify-center gap-2">
                        <ShieldCheck size={14} /> Os dados validados gerarão a planta base do PEI
                      </p>
                   </motion.div>
                </motion.div>
             )}
          </AnimatePresence>
        </div>
        
      </main>
    </div>
  );
}
