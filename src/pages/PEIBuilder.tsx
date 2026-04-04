import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, ChevronLeft, Save, ShieldCheck, 
  Target, LayoutGrid, Sparkles, 
  Plus, CheckCircle2, Lightbulb, 
  PencilRuler, BookOpen, Trash2, X, User as UserIcon,
  Search, Clock, AlertTriangle, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from '../components/Navigation';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { cn } from '../lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { AxisItem } from '../types/database';
import { BnccSkill, unifiedBnccData } from '../data/bnccData';
import { supabase } from '../lib/supabase';

type DisciplineProfile = { 
  name: string; 
  status: 'suplementar' | 'padrao' | 'complementar'; 
  justification: string; 
};

const getAllowedBnccCodes = (gradeNum: string): string[] => {
  const map: Record<string, string[]> = {
    '1': ['01', '15', '00'], // Incluímos '00' caso haja algo genérico
    '2': ['02', '15'],
    '3': ['03', '15', '35'],
    '4': ['04', '15', '35'],
    '5': ['05', '15', '35'],
    '6': ['06', '67', '69'],
    '7': ['07', '67', '69'],
    '8': ['08', '89', '69'],
    '9': ['09', '89', '69'],
  };
  return map[gradeNum] || [];
};

export default function PEIBuilder() {
  const navigate = useNavigate();
  const { studentId } = useParams();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [mappedAxisData, setMappedAxisData] = useState<Record<'I' | 'II' | 'III' | 'IV', AxisItem[]>>({
    I: [], II: [], III: [], IV: []
  });

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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'habilidade' | 'competencia'>('habilidade');
  const [allowAdvancedYears, setAllowAdvancedYears] = useState(false);
  const [searchResults, setSearchResults] = useState<BnccSkill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<BnccSkill[]>([]);
  const suplementarDisciplines = disciplines.filter(d => d.status === 'suplementar');
  const hasSuplementar = suplementarDisciplines.length > 0;
  const [compactationTarget, setCompactationTarget] = useState('');
  const [evaluationMethod, setEvaluationMethod] = useState('');

  // Etapa 4 state
  const [renzulliTypeI, setRenzulliTypeI] = useState('');
  const [renzulliTypeII, setRenzulliTypeII] = useState('');
  const [renzulliTypeIII, setRenzulliTypeIII] = useState('');

  // Etapa 5 state
  const [smartGoals, setSmartGoals] = useState<string[]>(['']);
  const [accessibilityResources, setAccessibilityResources] = useState<string[]>([]);
  const [newResource, setNewResource] = useState('');

  // LocalStorage Sync
  useEffect(() => {
    if (!studentId) return;

    // Load Mapeamento (Axis)
    const savedMap = localStorage.getItem(`mapeamento_data_${studentId}`);
    if (savedMap) {
      try {
        const parsed = JSON.parse(savedMap);
        if (parsed.axisData) {
          setMappedAxisData(parsed.axisData);
          // Auto-preencher recursos de acessibilidade do eixo IV se ainda não tiver nada salvo no PEI
          const eixoIVResources = parsed.axisData['IV']
            ?.filter((i: AxisItem) => i.selected)
            .map((i: AxisItem) => i.text) || [];
          setAccessibilityResources(eixoIVResources);
        }
      } catch(e) { console.error('Erro ao ler mapeamento:', e); }
    }

    // Load PEI Progress
    const savedPEI = localStorage.getItem(`pei_data_${studentId}`);
    if (savedPEI) {
      try {
         const parsed = JSON.parse(savedPEI);
         if (parsed.disciplines) setDisciplines(parsed.disciplines);
         if (parsed.planningContent) setPlanningContent(parsed.planningContent);
         if (parsed.selectedSkills) setSelectedSkills(parsed.selectedSkills);
         if (parsed.compactationTarget) setCompactationTarget(parsed.compactationTarget);
         if (parsed.evaluationMethod) setEvaluationMethod(parsed.evaluationMethod);
         if (parsed.renzulliTypeI !== undefined) setRenzulliTypeI(parsed.renzulliTypeI);
         if (parsed.renzulliTypeII !== undefined) setRenzulliTypeII(parsed.renzulliTypeII);
         if (parsed.renzulliTypeIII !== undefined) setRenzulliTypeIII(parsed.renzulliTypeIII);
         if (parsed.smartGoals) setSmartGoals(parsed.smartGoals);
         if (parsed.accessibilityResources && parsed.accessibilityResources.length > 0) {
           setAccessibilityResources(parsed.accessibilityResources);
         }
         if (parsed.lastSaved) setLastSaved(parsed.lastSaved);
      } catch(e) {}
    }

    // Load Student Profile
    const loadStudentProfile = async () => {
      try {
        const { data, error } = await supabase.from('students').select('*').eq('id', studentId).single();
        if (!error && data) {
           let fetchedInfo = data;
           const localData = localStorage.getItem(`student_extras_${studentId}`);
           if (localData) {
              fetchedInfo = { ...fetchedInfo, ...JSON.parse(localData) };
           }
           setStudentInfo(fetchedInfo);
        }
      } catch(e) { console.error("Erro ao buscar dados do estudante", e); }
    };
    loadStudentProfile();
  }, [studentId]);

  // Busca BNCC
  useEffect(() => {
    try {
      if (searchTerm && searchTerm.length >= 3) {
        const studentGrade = studentInfo?.grade || '';
        const searchLower = String(searchTerm).toLowerCase();

        // 1. Extrair número do ano do aluno (ex: "5")
        const gradeMatch = studentGrade?.match(/\d+/);
        const gradeNum = gradeMatch ? gradeMatch[0] : null;
        
        // 2. Obter códigos permitidos para o ciclo
        const allowedCodes = gradeNum ? getAllowedBnccCodes(gradeNum) : [];

        setSearchResults(
          unifiedBnccData.filter(item => {
            if (!item) return false;

            // Filtro por tipo
            if (item.tipo !== searchType) return false;

            // Filtro por termo (código ou descrição) - Defensivo GERAL
            const cod = item.codigo ? String(item.codigo).toLowerCase().trim() : '';
            const desc = item.descricao ? String(item.descricao).toLowerCase() : '';
            const matchesTerm = cod.includes(searchLower) || desc.includes(searchLower);
            
            if (!matchesTerm) return false;

            // Se for competência, ignora as travas de código do EF
            if (item.tipo === 'competencia') return true;

            // Se aceleração estiver ativa, não filtra por ano/ciclo
            if (allowAdvancedYears) return true;

            // Filtro ESTRITO por Código BNCC (Ensino Fundamental)
            // Códigos EF: EFxx... onde xx (posições 2 e 3) é o ano
            if (cod.startsWith('ef')) {
              const codeGrade = cod.substring(2, 4);
              // Só permite se o código da habilidade estiver no ciclo do aluno
              if (allowedCodes.length > 0 && !allowedCodes.includes(codeGrade)) {
                return false;
              }
            }

            // Fallback para itens sem código padrão EF (Infantil, Médio, etc.)
            // Competências gerais e itens de "Todas" aparecem sempre
            const itemAno = item.ano ? String(item.ano).toLowerCase() : '';
            const itemEtapa = item.etapa ? String(item.etapa).toLowerCase() : '';
            
            if (itemAno.includes('todas') || itemEtapa.includes('todas')) return true;

            // Se não tiver info do aluno, não bloqueia a busca
            if (!studentGrade) return true;

            // Filtro de ano residual (para Infantil/Médio onde não usamos o código numérico)
            const safeStudentGrade = String(studentGrade).toLowerCase();
            const studentYearNum = gradeNum || '';
            
            // Regras de correspondência:
            // 1. Número da série está presente na descrição do ano do item
            const matchesYearNum = studentYearNum && itemAno.includes(studentYearNum);
            
            // 2. O item é de um ciclo integral (Fundamental ou Médio)
            const isCycleGeneral = itemAno.includes('fundamental') || 
                                   itemAno.includes('ao 9') || 
                                   itemAno.includes('médio') || 
                                   itemAno.includes('1, 2, 3') ||
                                   itemEtapa.includes('ensino fundamental') ||
                                   itemEtapa.includes('ensino médio');

            // 3. Casos especiais para Infantil
            const isInfantilMatch = itemEtapa.includes('infantil') && safeStudentGrade.includes('infantil');

            return matchesYearNum || isCycleGeneral || isInfantilMatch;
          })
        );
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Erro crítico na busca BNCC:", error);
      setSearchResults([]);
    }
  }, [searchTerm, searchType, allowAdvancedYears, studentInfo]);

  const handleUpdateDiscipline = (index: number, updates: Partial<DisciplineProfile>) => {
    setDisciplines(prev => prev.map((d, i) => i === index ? { ...d, ...updates } : d));
  };

  const handleSaveData = () => {
    const dataToSave = {
      disciplines,
      planningContent,
      selectedSkills,
      compactationTarget,
      evaluationMethod,
      renzulliTypeI,
      renzulliTypeII,
      renzulliTypeIII,
      smartGoals,
      accessibilityResources,
      lastSaved: new Date().toLocaleString('pt-BR')
    };
    localStorage.setItem(`pei_data_${studentId}`, JSON.stringify(dataToSave));
    setLastSaved(dataToSave.lastSaved);
  };

  const handleCreatePei = () => {
    handleSaveData();
    alert("PEI Salvo e ativado com sucesso!");
    navigate(`/students/${studentId || ''}`);
  };

  const nextStep = () => setActiveStep(prev => prev < 5 ? (prev + 1) as any : prev);
  const prevStep = () => setActiveStep(prev => prev > 1 ? (prev - 1) as any : prev);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopBar title="Construtor de PEI" showBack />
      
      {lastSaved && (
        <div className="bg-yellow-50 border-b border-yellow-100 flex justify-center items-center gap-2 py-2 text-xs font-bold text-yellow-700">
           <Clock size={14} /> Progresso rascunho salvo em: {lastSaved}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header & Stepper */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
            <StudentPageHeader title="Construtor de PEI - AH/SD" studentId={studentId} showBack={false} />
            <button 
              onClick={() => { handleSaveData(); alert("Progresso salvo no navegador!"); }}
              className="bg-white border border-slate-200 text-slate-500 hover:border-primary/30 hover:text-primary transition-all px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm"
            >
              <Save size={16} /> Salvar Rascunho
            </button>
          </div>
          
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
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                       {studentInfo?.avatar_url ? (
                          <img src={studentInfo.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                          <UserIcon className="text-primary" size={32} />
                       )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">{studentInfo?.full_name || 'Carregando...'}</h3>
                      <p className="text-sm font-medium text-slate-500">{studentInfo?.school || 'Sem escola'} • {studentInfo?.grade || 'Sem etapa'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1">Equipe Responsável</p>
                    <p className="text-sm font-bold text-slate-700">
                      Regente: <span className="font-medium text-slate-500">{studentInfo?.regent_teacher || 'N/D'}</span><br className="md:hidden" />
                      <span className="hidden md:inline"> • </span>
                      AEE: <span className="font-medium text-slate-500">{studentInfo?.aee_teacher || 'N/D'}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                   <div className="flex items-center gap-2">
                     <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Síntese do Mapeamento (Consultivo)</h3>
                     <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Somente Leitura</span>
                   </div>
                   
                   <div className="grid md:grid-cols-2 gap-6">
                     {[
                       { id: 'I', title: 'I. Demandas Biopsic.', data: mappedAxisData.I },
                       { id: 'II', title: 'II. Contexto (Barreiras)', data: mappedAxisData.II },
                       { id: 'III', title: 'III. Potencialidades', data: mappedAxisData.III },
                       { id: 'IV', title: 'IV. Ponte PEI', data: mappedAxisData.IV }
                     ].map(eixo => (
                        <div key={eixo.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm">
                           <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black mb-4">{eixo.id}</div>
                           <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wider mb-3">{eixo.title}</h4>
                           <ul className="space-y-2">
                             {eixo.data.filter((i: AxisItem) => i.selected).map((item: AxisItem) => (
                               <li key={item.id} className="text-sm text-slate-600 font-medium flex items-start gap-2">
                                 <span className="text-primary">•</span>{item.text}
                               </li>
                             ))}
                             {eixo.data.filter((i: AxisItem) => i.selected).length === 0 && (
                               <li className="text-xs text-slate-400 italic">Nenhum item mapeado nesta área.</li>
                             )}
                           </ul>
                        </div>
                     ))}
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

                <div className="space-y-6">
                  <div className="flex flex-col gap-4">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 pl-2">Integração BNCC</label>
                    
                    {/* Seletor de Tipo de Busca */}
                    <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
                      <button 
                        onClick={() => setSearchType('habilidade')}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-black transition-all",
                          searchType === 'habilidade' 
                            ? "bg-white text-primary shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        HABILIDADES
                      </button>
                      <button 
                        onClick={() => setSearchType('competencia')}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-black transition-all",
                          searchType === 'competencia' 
                            ? "bg-white text-primary shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        COMPETÊNCIAS
                      </button>
                    </div>

                    {/* Toggle Aceleração (Só habilitado se houver suplementar) */}
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                          hasSuplementar ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-400"
                        )}>
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Busca Avançada (Aceleração)</p>
                          <p className="text-[10px] text-slate-500 font-medium">Permitir seleção de anos letivos superiores</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={allowAdvancedYears}
                          disabled={!hasSuplementar}
                          onChange={(e) => setAllowAdvancedYears(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary disabled:opacity-50"></div>
                      </label>
                    </div>

                    <div className="relative">
                       <div className="flex gap-3">
                         <div className="relative flex-1">
                            <Search className="absolute left-4 top-3 text-slate-400" size={18} />
                            <input 
                              type="text"
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                              placeholder="Busque código ou texto (ex: Frações, EF05MA...)"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                         </div>
                       </div>
                       
                       {/* BNCC Autocomplete Dropdown */}
                       {searchResults.length > 0 && (
                          <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                             {searchResults.map(item => (
                               <button
                                 key={item.codigo}
                                 onClick={() => {
                                   if (!selectedSkills.find(i => i.codigo === item.codigo)) {
                                      setSelectedSkills([...selectedSkills, item]);
                                   }
                                   setSearchTerm('');
                                   setSearchResults([]);
                                 }}
                                 className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-slate-50 last:border-0 flex flex-col gap-1"
                               >
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    {item.tipo === 'competencia' ? (
                                      <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase tracking-tighter">Competência</span>
                                    ) : (
                                      <>
                                        <span className="font-black text-primary text-xs uppercase tracking-widest">{item.codigo}</span>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{item.etapa}</span>
                                        <span className={cn(
                                          "text-xs px-2 py-1 rounded-full font-bold",
                                          allowAdvancedYears && studentInfo?.grade && !item.ano.toLowerCase().includes(studentInfo.grade.toLowerCase().split(' ')[0])
                                            ? "bg-red-100 text-red-700 border border-red-200 animate-pulse" 
                                            : "bg-gray-100 text-gray-700"
                                        )}>
                                          {item.ano}
                                        </span>
                                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{item.disciplina}</span>
                                      </>
                                    )}
                                  </div>
                                  <span className={cn(
                                    "text-sm font-medium",
                                    item.tipo === 'competencia' ? "text-slate-800 leading-relaxed" : "text-slate-600"
                                  )}>
                                    {item.descricao}
                                  </span>
                               </button>
                             ))}
                          </div>
                       )}
                    </div>

                    {selectedSkills.length > 0 && (
                      <div className="space-y-6 mt-4">
                        {/* Habilidades Selecionadas */}
                        {selectedSkills.some(s => s.tipo === 'habilidade') && (
                          <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Habilidades Selecionadas</p>
                            {selectedSkills.filter(s => s.tipo === 'habilidade').map((item) => (
                              <div key={item.codigo} className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-4 shadow-sm group">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="font-black text-primary text-xs mr-2">{item.codigo}</span>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{item.etapa}</span>
                                    <span className={cn(
                                      "text-xs px-2 py-1 rounded-full font-bold",
                                      studentInfo?.grade && !item.ano.toLowerCase().includes(studentInfo.grade.toLowerCase().split(' ')[0])
                                        ? "bg-red-100 text-red-700 border border-red-200" 
                                        : "bg-gray-100 text-gray-700"
                                    )}>
                                      {item.ano}
                                    </span>
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{item.disciplina}</span>
                                  </div>
                                  <p className="text-sm text-slate-600 font-medium line-clamp-2 transition-all group-hover:line-clamp-none">{item.descricao}</p>
                                </div>
                                <button onClick={() => setSelectedSkills(selectedSkills.filter(i => i.codigo !== item.codigo))} className="text-slate-300 hover:text-red-500 rounded-md p-1 transition-all group-hover:bg-red-50 shrink-0"><X size={18} /></button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Competências Selecionadas */}
                        {selectedSkills.some(s => s.tipo === 'competencia') && (
                          <div className="flex flex-col gap-2 bg-amber-50/30 p-4 rounded-2xl border border-amber-100">
                            <p className="text-[10px] font-black uppercase text-amber-500/70 tracking-widest mb-1">Competências Gerais / Específicas</p>
                            {selectedSkills.filter(s => s.tipo === 'competencia').map((item) => (
                              <div key={item.codigo} className="bg-white border border-amber-100 p-3 rounded-xl flex items-center justify-between gap-4 shadow-sm group">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase">{item.etapa}</span>
                                    <span className="text-[9px] font-black text-amber-600/50 uppercase tracking-widest">{item.disciplina}</span>
                                  </div>
                                  <p className="text-sm text-slate-800 font-bold leading-relaxed line-clamp-2 transition-all group-hover:line-clamp-none">{item.descricao}</p>
                                </div>
                                <button onClick={() => setSelectedSkills(selectedSkills.filter(i => i.codigo !== item.codigo))} className="text-slate-300 hover:text-red-500 rounded-md p-1 transition-all group-hover:bg-red-50 shrink-0"><X size={18} /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reactividade: Mostrar disciplinas suplementares conectadas à Compactação */}
                {hasSuplementar && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-8 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Sparkles className="text-green-600" size={24} />
                        <h3 className="text-lg font-black text-green-800 uppercase tracking-tight">Compactação Curricular</h3>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                         {suplementarDisciplines.map(d => (
                            <span key={d.name} className="bg-white border border-green-200 text-green-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                               Foco: {d.name}
                            </span>
                         ))}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-green-700/80 -mt-2">Disciplinas suplementares marcadadas anteriormente exigem estratégias de compactação para evitar tédio e promover o avanço.</p>
                    
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
                     Planeje projetos enriquecedores focados em aprofundar interesses.
                  </p>
                </div>
                
                {hasSuplementar && (
                  <div className="flex flex-wrap gap-2 pt-2 border-b border-slate-100 pb-6 mb-6">
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center">Disciplinas Alvo:</span>
                     {suplementarDisciplines.map(d => (
                        <span key={d.name} className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
                           {d.name}
                        </span>
                     ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Tipo 1 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-all flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
                      <Lightbulb size={20} />
                    </div>
                    <h3 className="font-black text-lg text-slate-800">Tipo I: Exploratório</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed flex-1">
                      Atividades para despertar novos interesses.
                    </p>
                    <textarea 
                      rows={5}
                      value={renzulliTypeI}
                      onChange={e => setRenzulliTypeI(e.target.value)}
                      placeholder="Ex: Trazer um palestrante sobre astronomia..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </div>

                  {/* Tipo 2 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-all flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                      <PencilRuler size={20} />
                    </div>
                    <h3 className="font-black text-lg text-slate-800">Tipo II: Treinamento</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed flex-1">
                      Desenvolvimento de habilidades metodológicas ou socioemocionais.
                    </p>
                    <textarea 
                      rows={5}
                      value={renzulliTypeII}
                      onChange={e => setRenzulliTypeII(e.target.value)}
                      placeholder="Ex: Treinar uso de biblioteca e bases de dados..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  {/* Tipo 3 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-all flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-2">
                      <Target size={20} />
                    </div>
                    <h3 className="font-black text-lg text-slate-800">Tipo III: Investigação</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed flex-1">
                      Projetos práticos e resolução de problemas reais.
                    </p>
                    <textarea 
                      rows={5}
                      value={renzulliTypeIII}
                      onChange={e => setRenzulliTypeIII(e.target.value)}
                      placeholder="Ex: Criar um minidocumentário sobre poluição local..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
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
                     O sistema inseriu bases do <strong>Mapeamento Consolidado (Eixo IV)</strong>. Abaixo você pode rever ou adicionar manualmente se julgar necessário.
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

                <div className="pt-10 flex flex-col sm:flex-row justify-end gap-4">
                   <button 
                     onClick={() => { handleSaveData(); alert("Progresso salvo no navegador!"); }}
                     className="bg-white border-2 border-slate-200 text-slate-500 px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-slate-300 hover:text-slate-700 transition-all text-center"
                   >
                     Salvar Rascunho
                   </button>
                   <button 
                     onClick={handleCreatePei}
                     className="bg-[#1DB954] text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
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
