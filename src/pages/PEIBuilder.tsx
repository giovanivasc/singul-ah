import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, ChevronLeft, Save, ShieldCheck, 
  Target, LayoutGrid, Sparkles, 
  Plus, CheckCircle2, Lightbulb, 
  PencilRuler, BookOpen, Trash2, X, User as UserIcon,
  Search, Clock, AlertTriangle, Check, Brain, Book, Calendar, Layers, Download, FileText
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
  id: string;
  name: string; 
  status: 'padrao' | 'adaptacao' | 'modificacao'; 
  justification: string; 
};

type CurriculumPlanRow = {
  id: string;
  objectives: BnccSkill[];
  customObjectives: string;
  indicators: string;
  timeline: string;
  strategies: string;
  evaluation: string;
}

type CurriculumPlan = {
  disciplineId: string;
  annualGoal: string;
  rows: CurriculumPlanRow[];
}

import { useRef } from 'react';
function AutoResizeTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [props.value]);
  return (
    <textarea
      {...props}
      ref={ref}
      onInput={(e) => {
        e.currentTarget.style.height = 'auto';
        e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
        if (props.onInput) props.onInput(e);
      }}
    />
  );
}

type TeamMember = { id: string; name: string; role: string; origin: string; };
type AssessmentData = { id: string; source: string; date: string; summary: string; origin: string; };
type TopicItem = { id: string; text: string; selected: boolean; category?: string };

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

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);

  const steps = [
    { id: 1, title: 'Identificação', icon: ShieldCheck },
    { id: 2, title: 'Estudo de Caso', icon: Brain },
    { id: 3, title: 'Programa Curricular', icon: LayoutGrid },
    { id: 4, title: 'Serviços e Enriquecimento', icon: BookOpen },
    { id: 5, title: 'Tecnologia e Assistiva', icon: Sparkles },
    { id: 6, title: 'Plano de Transição', icon: Target },
    { id: 7, title: 'Registro e Assinaturas', icon: PencilRuler },
  ];

  // Etapa 1 state
  const [documentType, setDocumentType] = useState<'completo' | 'simplificado'>('completo');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 'm1', name: 'Maria Silva (Família)', role: 'Responsável', origin: 'auto-importado' },
    { id: 'm2', name: 'Estudante', role: 'Estudante', origin: 'auto-importado' }
  ]);
  const [assessments, setAssessments] = useState<AssessmentData[]>([
    { id: 'a1', source: 'IF-SAHS (Família)', date: '2026-03-25', summary: 'Inventário familiar apontou forte interesse por artes visuais e necessidades de mediação social.', origin: 'auto-importado' },
    { id: 'a2', source: 'N-ILS (Estudante)', date: '2026-03-28', summary: 'Perfil predominante Visual/Sensitivo, prefere informações concretas e gráficos.', origin: 'auto-importado' }
  ]);
  
  const [academicYear, setAcademicYear] = useState('');
  const [alignmentMeetingDate, setAlignmentMeetingDate] = useState('');
  const [applicationStartDate, setApplicationStartDate] = useState('');
  const [evaluationFormat, setEvaluationFormat] = useState('Notas');
  const [validityType, setValidityType] = useState('Bimestral');
  const [validityPeriod, setValidityPeriod] = useState('1º');
  
  // Export state
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'word'>('pdf');
  const [exportType, setExportType] = useState<'completo' | 'simplificado'>('completo');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedSimplifiedSections, setSelectedSimplifiedSections] = useState<string[]>([
    'student_data', 'pei_parameters', 'context', 'accessibility', 
    'curriculum_construction', 'specialized_services', 'enrichment', 'tech_resources'
  ]);

  const EXPORT_SECTIONS = [
    { id: 'student_data', label: 'Dados do estudante' },
    { id: 'pei_parameters', label: 'Parâmetros do PEI' },
    { id: 'team', label: 'Equipe de Elaboração' },
    { id: 'assessments', label: 'Avaliações e Laudos relevantes' },
    { id: 'context', label: 'Contexto Biopsicossocial e Educacional' },
    { id: 'accessibility', label: 'Estratégias e Recursos de Acessibilidade' },
    { id: 'curricular_profile', label: 'Perfil Curricular' },
    { id: 'curriculum_construction', label: 'Construção do Currículo' },
    { id: 'specialized_services', label: 'Serviços Especializados' },
    { id: 'enrichment', label: 'Enriquecimento Extracurricular' },
    { id: 'tech_resources', label: 'Recursos Tecnológicos e T.A' },
    { id: 'transition_plan', label: 'Plano de transição e aconselhamento' },
    { id: 'history', label: 'Histórico de acompanhamento' },
    { id: 'signatories', label: 'Signatários do PEI' }
  ];
  
  // Inline forms state
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '' });
  const [isAddingAssessment, setIsAddingAssessment] = useState(false);
  const [newAssessment, setNewAssessment] = useState({ source: '', date: '', summary: '' });

  // Etapa 2 state (Estudo de Caso - Refactored to read-only CaseStudySynthesis)
  const [activeSegmentStep2, setActiveSegmentStep2] = useState<'contexto' | 'estrategias'>('contexto');
  const [activeTabStep2, setActiveTabStep2] = useState<'caracterizacao' | 'estilos' | 'potencialidades' | 'demandas'>('caracterizacao');
  
  type CaseStudySynthesis = {
    currentContext: TopicItem[];
    learningStyle: TopicItem[];
    potentialsInterests: TopicItem[];
    demandsBarriers: TopicItem[];
    accessibilityStrategies: TopicItem[];
  };
  
  const CONTEXT_CATEGORIES = [
    { id: 'acadêmico', label: 'Acadêmico', colorClass: 'bg-blue-100 text-blue-800' },
    { id: 'cognitivo', label: 'Cognitivo', colorClass: 'bg-purple-100 text-purple-800' },
    { id: 'linguístico', label: 'Linguístico', colorClass: 'bg-pink-100 text-pink-800' },
    { id: 'social', label: 'Social', colorClass: 'bg-emerald-100 text-emerald-800' },
    { id: 'emocional', label: 'Emocional', colorClass: 'bg-orange-100 text-orange-800' },
    { id: 'psicológico', label: 'Psicológico', colorClass: 'bg-yellow-100 text-yellow-800' },
    { id: 'físico', label: 'Físico/Sensorial', colorClass: 'bg-cyan-100 text-cyan-800' }
  ];

  const ACCESSIBILITY_CATEGORIES = [
    { id: 'instrucional', label: 'Instrucional', colorClass: 'bg-indigo-100 text-indigo-800' },
    { id: 'ambiental', label: 'Ambiental', colorClass: 'bg-teal-100 text-teal-800' },
    { id: 'avaliação', label: 'Avaliação', colorClass: 'bg-rose-100 text-rose-800' }
  ];
  
  const [caseStudySynthesis, setCaseStudySynthesis] = useState<CaseStudySynthesis | null>(null);

  // Etapa 3 state
  const [activeTabStep3, setActiveTabStep3] = useState<'perfil' | 'construcao'>('perfil');
  const [activePickerRowId, setActivePickerRowId] = useState<string | null>(null);
  const [curriculumPlans, setCurriculumPlans] = useState<CurriculumPlan[]>([]);
  const [selectedPlanDisciplineId, setSelectedPlanDisciplineId] = useState<string>('');
  const [isAddingDiscipline, setIsAddingDiscipline] = useState(false);
  const [newDisciplineName, setNewDisciplineName] = useState('');

  const [disciplines, setDisciplines] = useState<DisciplineProfile[]>([
    { id: 'portugues', name: 'Língua Portuguesa', status: 'padrao', justification: '' },
    { id: 'matematica', name: 'Matemática', status: 'padrao', justification: '' },
    { id: 'ciencias', name: 'Ciências', status: 'padrao', justification: '' },
    { id: 'historia', name: 'História', status: 'padrao', justification: '' },
    { id: 'geografia', name: 'Geografia', status: 'padrao', justification: '' },
    { id: 'arte', name: 'Arte', status: 'padrao', justification: '' },
    { id: 'edfisica', name: 'Ed. Física', status: 'padrao', justification: '' },
    { id: 'ingles', name: 'Língua Inglesa', status: 'padrao', justification: '' },
    { id: 'computacao', name: 'Computação', status: 'padrao', justification: '' },
  ]);

  // Etapa 4 state
  const [activeTabStep4, setActiveTabStep4] = useState<'servicos' | 'enriquecimento'>('servicos');
  const [specializedServices, setSpecializedServices] = useState<{id: string, name: string, frequency: string, duration: string, location: string}[]>([]);
  const [enrichmentServices, setEnrichmentServices] = useState<{id: string, name: string, frequency: string, duration: string, location: string}[]>([]);

  // Etapa 5 state
  const [techResources, setTechResources] = useState<{id: string, tool: string, objective: string, frequency: string, location: string}[]>([]);

  // Etapa 6 state
  const [enableTransitionPlan, setEnableTransitionPlan] = useState<boolean>(false);

  // Etapa 7 state (Registro e Assinaturas)
  const [enableHistory, setEnableHistory] = useState<boolean>(false);
  const [historyLog, setHistoryLog] = useState<{id: string, date: string, description: string, result: string}[]>([]);
  const [signatories, setSignatories] = useState<{id: string, name: string, role: string}[]>([]);

  // BNCC Search State
  const [planningContent, setPlanningContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'habilidade' | 'competencia'>('habilidade');
  const [filterStage, setFilterStage] = useState<string | null>(null);
  const [filterDiscipline, setFilterDiscipline] = useState<string | null>(null);
  const [filterGrade, setFilterGrade] = useState<string | null>(null);
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

  // Supabase Persistence Sync
  useEffect(() => {
    if (!studentId) return;

    async function loadData() {
      // Load Mapeamento (Axis) / Estudo De Caso from LocalStorage (Fallback logic)
      const savedMap = localStorage.getItem(`mapeamento_data_${studentId}`);
      if (savedMap) {
        try {
          const parsed = JSON.parse(savedMap);
          if (parsed.caseStudySynthesis) {
             setCaseStudySynthesis(parsed.caseStudySynthesis);
          }
        } catch(e) { console.error('Erro ao ler mapeamento:', e); }
      }

      // Load PEI Progress from Supabase
      try {
        const { data: peiRow, error } = await supabase
          .from('pei_data')
          .select('data')
          .eq('student_id', studentId)
          .maybeSingle();

        if (error) throw error;

        if (peiRow && peiRow.data) {
          const parsed: any = peiRow.data;
          if (parsed.documentType) setDocumentType(parsed.documentType);
          if (parsed.teamMembers && parsed.teamMembers.length > 0) setTeamMembers(parsed.teamMembers);
          if (parsed.assessments && parsed.assessments.length > 0) setAssessments(parsed.assessments);
          if (parsed.academicYear) setAcademicYear(parsed.academicYear);
          if (parsed.alignmentMeetingDate) setAlignmentMeetingDate(parsed.alignmentMeetingDate);
          if (parsed.applicationStartDate) setApplicationStartDate(parsed.applicationStartDate);
          if (parsed.evaluationFormat) setEvaluationFormat(parsed.evaluationFormat);
          if (parsed.validityType) setValidityType(parsed.validityType);
          if (parsed.validityPeriod) setValidityPeriod(parsed.validityPeriod);

          if (parsed.disciplines) setDisciplines(parsed.disciplines);
          if (parsed.curriculumPlans) setCurriculumPlans(parsed.curriculumPlans);
          
          if (parsed.specializedServices) setSpecializedServices(parsed.specializedServices);
          if (parsed.enrichmentServices) setEnrichmentServices(parsed.enrichmentServices);
          if (parsed.techResources) setTechResources(parsed.techResources);
          if (parsed.enableTransitionPlan !== undefined) setEnableTransitionPlan(parsed.enableTransitionPlan);
          if (parsed.enableHistory !== undefined) setEnableHistory(parsed.enableHistory);
          if (parsed.historyLog) setHistoryLog(parsed.historyLog);
          if (parsed.signatories) setSignatories(parsed.signatories);

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
        }
      } catch (err) {
        console.error('Erro ao carregar PEI do Supabase:', err);
      }
    }

    loadData();
  }, [studentId]);

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
        // Se houver um ano filtrado, usa ele, senão usa o do aluno
        const activeGrade = filterGrade || studentInfo?.grade || '';
        const searchLower = String(searchTerm).toLowerCase();

        // 1. Extrair número do ano (ex: "5")
        const gradeMatch = activeGrade?.match(/\d+/);
        const gradeNum = gradeMatch ? gradeMatch[0] : null;
        
        // 2. Obter códigos permitidos para o ciclo
        const allowedCodes = gradeNum ? getAllowedBnccCodes(gradeNum) : [];

        setSearchResults(
          unifiedBnccData.filter(item => {
            if (!item) return false;

            // Filtro por tipo
            if (item.tipo !== searchType) return false;

            // Filtro por Etapa de Ensino (SEMPRE APLICADO se selecionado)
            if (filterStage) {
               const itemEtapa = item.etapa ? String(item.etapa).toLowerCase() : '';
               if (!itemEtapa.includes(filterStage.toLowerCase())) return false;
            }

            // Filtro por termo (código ou descrição)
            const cod = item.codigo ? String(item.codigo).toLowerCase().trim() : '';
            const desc = item.descricao ? String(item.descricao).toLowerCase() : '';
            const matchesTerm = cod.includes(searchLower) || desc.includes(searchLower);
            
            if (!matchesTerm) return false;

            // Filtro por Disciplina (se selecionado)
            if (filterDiscipline && !cod.includes(filterDiscipline.toLowerCase())) {
              return false;
            }

            // Se for competência, ignora as travas de código do EF (a menos que haja filtro de disciplina)
            if (item.tipo === 'competencia') return true;

            // Filtro Ano/Ciclo (Sempre ativo agora, baseado no activeGrade ou filterGrade)
            if (!activeGrade) return true;

            // Filtro ESTRITO por Código BNCC (Ensino Fundamental)
            if (cod.startsWith('ef')) {
              const codeGrade = cod.substring(2, 4);
              if (allowedCodes.length > 0 && !allowedCodes.includes(codeGrade)) {
                return false;
              }
            }

            // Fallback para itens sem código padrão EF
            const itemAno = item.ano ? String(item.ano).toLowerCase() : '';
            
            const studentYearNum = gradeNum || '';
            const matchesYearNum = studentYearNum && itemAno.includes(studentYearNum);
            
            const isCycleGeneral = itemAno.includes('fundamental') || 
                                   itemAno.includes('ao 9') || 
                                   itemAno.includes('médio') || 
                                   itemAno.includes('1, 2, 3');

            return matchesYearNum || isCycleGeneral;
          })
        );
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Erro crítico na busca BNCC:", error);
      setSearchResults([]);
    }
  }, [searchTerm, searchType, studentInfo, filterDiscipline, filterGrade, filterStage]);

  const handleUpdateDiscipline = (index: number, updates: Partial<DisciplineProfile>) => {
    setDisciplines(prev => prev.map((d, i) => i === index ? { ...d, ...updates } : d));
  };

  const handleSaveData = async () => {
    if (!studentId) return;

    const dataToSave = {
      documentType,
      teamMembers,
      assessments,
      academicYear,
      alignmentMeetingDate,
      applicationStartDate,
      evaluationFormat,
      validityType,
      validityPeriod,
      disciplines,
      curriculumPlans,
      specializedServices,
      enrichmentServices,
      techResources,
      enableTransitionPlan,
      enableHistory,
      historyLog,
      signatories,
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

    try {
      const { error } = await supabase
        .from('pei_data')
        .upsert({
          student_id: studentId,
          data: dataToSave,
          updated_at: new Date().toISOString()
        }, { onConflict: 'student_id' });

      if (error) throw error;

      setLastSaved(dataToSave.lastSaved);
      // alert("PEI salvo com sucesso no banco!");
    } catch (err: any) {
      console.error('Erro ao salvar PEI no Supabase:', err);
      alert(`Erro ao salvar no banco: ${err.message}`);
    }
  };

  const handleCreatePei = () => {
    handleSaveData();
    alert("PEI Salvo e ativado com sucesso!");
    navigate(`/students/${studentId || ''}`);
  };

  const nextStep = () => setActiveStep(prev => prev < 5 ? (prev + 1) as any : prev);
  const prevStep = () => setActiveStep(prev => prev > 1 ? (prev - 1) as any : prev);

  const calculateAge = (dob: string | undefined) => {
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
  const renderReadOnlyList = (topics?: TopicItem[] | string, categories?: {id: string, label: string, colorClass: string}[]) => {
    if (!topics) return <p className="text-sm text-slate-400 italic">Sem registros catalogados.</p>;
    if (!Array.isArray(topics)) return <p className="text-sm text-slate-400 italic text-wrap w-full">{String(topics)}</p>;
    if (topics.length === 0) return <p className="text-sm text-slate-400 italic">Sem registros catalogados.</p>;
    const selected = topics.filter(t => t.selected);
    if (selected.length === 0) return <p className="text-sm text-slate-400 italic">Nenhum item selecionado para o PEI.</p>;
    
    return (
      <ul className="space-y-3">
        {selected.map(t => {
           const cat = categories && t.category ? categories.find(c => c.id === t.category) : null;
           return (
           <li key={t.id} className="flex items-start gap-3 bg-white border border-slate-100 p-4 rounded-xl shadow-sm text-sm text-slate-700 leading-relaxed">
             <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
             <span className="whitespace-normal break-words flex-1 leading-relaxed">{t.text}</span>
             {cat && (
                <span className={cn("text-[10px] capitalize font-bold tracking-wider px-1.5 py-0 rounded-full whitespace-nowrap shrink-0 mt-0.5", cat.colorClass)}>
                  {cat.label}
                </span>
             )}
           </li>
        )})}
      </ul>
    );
  };


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
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { handleSaveData(); alert("Progresso salvo no navegador!"); }}
                className="bg-white border border-slate-200 text-slate-500 hover:border-primary/30 hover:text-primary transition-all px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm"
              >
                <Save size={16} /> Salvar Rascunho
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="bg-slate-900 text-white hover:bg-slate-800 transition-all px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-200"
                >
                  <Download size={16} /> Exportar
                </button>

                <AnimatePresence>
                  {showExportMenu && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowExportMenu(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-30 origin-top-right"
                      >
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 tracking-widest mb-3">Modelo do documento</p>
                            <div className="grid grid-cols-2 gap-2">
                              {(['completo', 'simplificado'] as const).map(type => (
                                <button
                                  key={type}
                                  onClick={() => setExportType(type)}
                                  className={cn(
                                    "px-3 py-2 rounded-xl text-[10px] font-bold tracking-tight transition-all border capitalize",
                                    exportType === type ? "bg-primary/10 border-primary text-primary" : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                                  )}
                                >{type}</button>
                              ))}
                            </div>
                          </div>

                          {exportType === 'simplificado' && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="bg-slate-50 rounded-xl p-3 border border-slate-100 overflow-hidden"
                            >
                              <p className="text-[9px] font-black text-slate-400 tracking-widest mb-2">Seções a incluir</p>
                              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {EXPORT_SECTIONS.map(section => (
                                  <label key={section.id} className="flex items-center gap-2 cursor-pointer group">
                                    <div 
                                      onClick={() => {
                                        if (selectedSimplifiedSections.includes(section.id)) {
                                          setSelectedSimplifiedSections(selectedSimplifiedSections.filter(id => id !== section.id));
                                        } else {
                                          setSelectedSimplifiedSections([...selectedSimplifiedSections, section.id]);
                                        }
                                      }}
                                      className={cn(
                                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                        selectedSimplifiedSections.includes(section.id) 
                                          ? "bg-primary border-primary text-white" 
                                          : "bg-white border-slate-200 group-hover:border-primary/50"
                                      )}
                                    >
                                      {selectedSimplifiedSections.includes(section.id) && <Check size={10} strokeWidth={4} />}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600 tracking-tight leading-none">{section.label}</span>
                                  </label>
                                ))}
                              </div>
                            </motion.div>
                          )}

                          <div>
                            <p className="text-[10px] font-black text-slate-400 tracking-widest mb-3">Formato de saída</p>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setExportFormat('pdf')}
                                className={cn(
                                  "px-3 py-2 rounded-xl text-[10px] font-bold tracking-tight transition-all border flex items-center justify-center gap-2",
                                  exportFormat === 'pdf' ? "bg-red-50 border-red-200 text-red-600" : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                                )}
                              >
                                <FileText size={12} /> PDF
                              </button>
                              <button
                                onClick={() => setExportFormat('word')}
                                className={cn(
                                  "px-3 py-2 rounded-xl text-[10px] font-bold tracking-tight transition-all border flex items-center justify-center gap-2",
                                  exportFormat === 'word' ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                                )}
                              >
                                <BookOpen size={12} /> Word
                              </button>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100">
                            <button 
                              onClick={() => {
                                setIsExporting(true);
                                
                                if (exportFormat === 'pdf') {
                                  setShowExportMenu(false);
                                  setTimeout(() => {
                                    window.print();
                                    setIsExporting(false);
                                  }, 500);
                                  return;
                                }

                                setTimeout(() => {
                                  // Fallback para Word (Text format por enquanto)
                                  const content = `PLANO EDUCACIONAL INDIVIDUALIZADO (PEI)\nModelo: ${exportType.toUpperCase()}\n\nEstudante: ${studentInfo?.full_name || 'N/D'}\nAno Letivo: ${academicYear}\n\nEste formato (.docx) requer uma biblioteca de conversão binária. Para um PDF oficial, use a opção PDF no menu de exportação.`;
                                  const blob = new Blob([content], { type: 'text/plain' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `PEI_Estudante_${exportType}_${new Date().toISOString().split('T')[0]}.doc`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);

                                  setIsExporting(false);
                                  setShowExportMenu(false);
                                  alert(`Documento em formato WORD baixado com sucesso!`);
                                }, 1500);
                              }}
                              disabled={isExporting}
                              className="w-full bg-primary text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isExporting ? (
                                <>Gerando arquivo...</>
                              ) : (
                                <>Confirmar Download</>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between relative">
             <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full" />
             <div 
               className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500" 
               style={{ width: `${((activeStep - 1) / 5) * 100}%` }}
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
                   <ShieldCheck className="text-primary" /> Identificação
                </h2>

                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Card 1: Dados do Estudante */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-6">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center justify-between">
                      Dados do Estudante
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest hidden sm:inline-block">Somente Leitura</span>
                    </h3>
                    <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                         {studentInfo?.avatar_url ? (
                            <img src={studentInfo.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                         ) : (
                            <UserIcon className="text-primary" size={32} />
                         )}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-800">{studentInfo?.full_name || 'Carregando...'}</h4>
                        <p className="text-sm font-medium text-slate-500">{calculateAge(studentInfo?.date_of_birth)} anos • {studentInfo?.gender || 'Sexo não informado'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1">Escola / Etapa</p>
                        <p className="text-sm font-bold text-slate-700">{studentInfo?.school || 'Sem escola'}<br/>{studentInfo?.grade || 'Sem etapa'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1">Turno</p>
                        <p className="text-sm font-bold text-slate-700">{studentInfo?.shift || 'N/D'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1">Data de Nasc.</p>
                        <p className="text-sm font-bold text-slate-700">{studentInfo?.date_of_birth ? new Date(studentInfo.date_of_birth).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/D'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1">Equipe</p>
                        <p className="text-sm font-bold text-slate-700 truncate">Reg: {studentInfo?.regent_teacher || 'N/D'}<br/>AEE: {studentInfo?.aee_teacher || 'N/D'}</p>
                      </div>
                    </div>

                    {studentInfo?.exceptionalities && studentInfo.exceptionalities.length > 0 && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-2">Excepcionalidades</p>
                        <div className="flex flex-wrap gap-2">
                          {studentInfo.exceptionalities.map((exc: string) => (
                            <span key={exc} className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
                              {exc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card 2: Parâmetros de Execução do PEI */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Parâmetros do PEI</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Ano Letivo</label>
                        <input type="text" value={academicYear} onChange={e => setAcademicYear(e.target.value)} placeholder="Ex: 2026" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Reunião Alinhamento</label>
                        <input type="date" value={alignmentMeetingDate} onChange={e => setAlignmentMeetingDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Início da Aplicação do PEI</label>
                        <input type="date" value={applicationStartDate} onChange={e => setApplicationStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Formato de Avaliação</label>
                        <div className="flex gap-4">
                          {['Notas', 'Relatório'].map(format => (
                            <label key={format} className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="evalFormat" value={format} checked={evaluationFormat === format} onChange={e => setEvaluationFormat(e.target.value)} className="text-primary focus:ring-primary/20" />
                              <span className="text-sm font-medium text-slate-700">{format}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Vigência</label>
                          <div className="flex flex-col gap-2">
                            {['Semestral', 'Bimestral'].map(type => (
                              <label key={type} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="valType" value={type} checked={validityType === type} onChange={e => {
                                  setValidityType(e.target.value);
                                  setValidityPeriod(e.target.value === 'Semestral' ? '1º Semestre' : '1º Bimestre');
                                }} className="text-primary focus:ring-primary/20" />
                                <span className="text-sm font-medium text-slate-700">{type}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Período de Execução</label>
                          <select aria-label="Período de Execução" value={validityPeriod} onChange={e => setValidityPeriod(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                            {validityType === 'Semestral' ? (
                              <>
                                <option value="1º Semestre">1º Semestre</option>
                                <option value="2º Semestre">2º Semestre</option>
                              </>
                            ) : (
                              <>
                                <option value="1º Bimestre">1º Bimestre</option>
                                <option value="2º Bimestre">2º Bimestre</option>
                                <option value="3º Bimestre">3º Bimestre</option>
                                <option value="4º Bimestre">4º Bimestre</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 pt-4">
                    {/* Tabela de Equipe */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div>
                          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Equipe de Elaboração</h3>
                          <p className="text-xs font-medium text-slate-500">Profissionais e familiares envolvidos no PEI.</p>
                        </div>
                        <button onClick={() => setIsAddingMember(!isAddingMember)} className="text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
                          {isAddingMember ? 'Cancelar' : '+ Adicionar Membro'}
                        </button>
                      </div>
                      
                      {isAddingMember && (
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-4 items-end">
                          <div className="flex-1 space-y-1">
                             <label className="text-[10px] font-black uppercase text-slate-400">Nome Mebro</label>
                             <input type="text" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Ex: Dr. João Paulo"/>
                          </div>
                          <div className="flex-1 space-y-1">
                             <label className="text-[10px] font-black uppercase text-slate-400">Função/Papel</label>
                             <input type="text" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Ex: Psicólogo Escolar"/>
                          </div>
                          <button 
                             onClick={() => {
                               if(newMember.name && newMember.role) {
                                  setTeamMembers([...teamMembers, { id: Date.now().toString(), origin: 'manual', ...newMember }]);
                                  setNewMember({ name: '', role: '' });
                                  setIsAddingMember(false);
                               }
                             }}
                             className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
                          >
                            Salvar
                          </button>
                        </div>
                      )}
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-black text-slate-500 tracking-widest">
                             <tr>
                               <th className="px-6 py-3">Nome</th>
                               <th className="px-6 py-3">Função</th>
                               <th className="px-6 py-3">Origem</th>
                               <th className="px-6 py-3 text-right">Ação</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                                        {teamMembers.map((member, mIdx) => (
                                           <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                             <td className="px-6 py-4 font-medium text-slate-800">{member.name}</td>
                                             <td className="px-6 py-4 text-slate-600">{member.role}</td>
                                             <td className="px-6 py-4 text-slate-600">{member.origin}</td>
                                             <td className="px-6 py-4 text-right">
                                               <button onClick={() => setTeamMembers(teamMembers.filter(m => m.id !== member.id))} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                             </td>
                                           </tr>
                                        ))}
                                     </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Tabela de Avaliações */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div>
                          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Avaliações e Laudos Relevantes</h3>
                          <p className="text-xs font-medium text-slate-500">Documentos e análises que embasam o PEI.</p>
                        </div>
                        <button onClick={() => setIsAddingAssessment(!isAddingAssessment)} className="text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
                          {isAddingAssessment ? 'Cancelar' : '+ Adicionar Avaliação'}
                        </button>
                      </div>

                      {isAddingAssessment && (
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-4">
                          <div className="flex gap-4">
                            <div className="flex-1 space-y-1">
                               <label className="text-[10px] font-black uppercase text-slate-400">Fonte (Ex: Laudo Médico)</label>
                               <input type="text" value={newAssessment.source} onChange={e => setNewAssessment({...newAssessment, source: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                            </div>
                            <div className="w-48 space-y-1">
                               <label className="text-[10px] font-black uppercase text-slate-400">Data</label>
                               <input type="date" value={newAssessment.date} onChange={e => setNewAssessment({...newAssessment, date: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                            </div>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase text-slate-400">Resumo dos Resultados</label>
                             <textarea rows={2} value={newAssessment.summary} onChange={e => setNewAssessment({...newAssessment, summary: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                          </div>
                          <div className="flex justify-end">
                            <button 
                               onClick={() => {
                                 if(newAssessment.source && newAssessment.summary) {
                                    setAssessments([...assessments, { id: Date.now().toString(), origin: 'manual', ...newAssessment }]);
                                    setNewAssessment({ source: '', date: '', summary: '' });
                                    setIsAddingAssessment(false);
                                 }
                               }}
                               className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-sm"
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="p-6 grid grid-cols-1 gap-4">
                        {assessments.map(ass => (
                           <div key={ass.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 relative group">
                             {ass.origin === 'manual' && (
                               <button onClick={() => setAssessments(assessments.filter(a => a.id !== ass.id))} title="Remover Avaliação" className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                             )}
                             <div className="flex items-center gap-3 mb-2">
                               <h4 className="font-bold text-slate-800">{ass.source}</h4>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ass.date}</span>
                               <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest", ass.origin === 'auto-importado' ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600")}>
                                 {ass.origin}
                               </span>
                             </div>
                             <p className="text-sm text-slate-600 leading-relaxed">{ass.summary}</p>
                           </div>
                        ))}
                        {assessments.length === 0 && <p className="text-center text-slate-400 py-4 text-sm">Nenhuma avaliação listada.</p>}
                      </div>
                    </div>
                  </div>
              </motion.div>
            )}

            {/* ETAPA 2: Estudo de Caso */}
            {activeStep === 2 && (
              <motion.div key="step-case" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div>
                   <h2 className="text-2xl font-black text-on-surface flex items-center gap-3">
                     <Brain className="text-primary" /> Estudo de Caso
                   </h2>
                   <p className="text-sm font-medium text-slate-500 mt-2">
                     Informações selecionadas a partir do Mapeamento Biopsicossocial.
                   </p>
                </div>

                <div className="bg-slate-50/50 p-2 rounded-2xl border border-slate-100 flex flex-wrap justify-center gap-2 w-fit mx-auto mb-2">
                    <button 
                      onClick={() => setActiveSegmentStep2('contexto')}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                        activeSegmentStep2 === 'contexto' 
                          ? "bg-white text-primary shadow-sm border border-slate-200/60" 
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      Contexto Biopsicossocial e Educacional
                    </button>
                    <button 
                      onClick={() => setActiveSegmentStep2('estrategias')}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                        activeSegmentStep2 === 'estrategias' 
                          ? "bg-white text-primary shadow-sm border border-slate-200/60" 
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      Estratégias e Recursos de Acessibilidade
                    </button>
                 </div>

                {activeSegmentStep2 === 'contexto' && (
                  <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden atmospheric-shadow">
                     {/* Tabs Menu - Estilo Fichário */}
                     <div className="flex border-b border-slate-200 bg-slate-100 overflow-x-auto pt-2 px-2 gap-1">
                       {[
                         { id: 'caracterizacao', label: 'Caracterização' },
                         { id: 'estilos', label: 'Estilos de aprendizagem' },
                         { id: 'potencialidades', label: 'Potencialidades e Interesses' },
                         { id: 'demandas', label: 'Demandas e barreiras' }
                       ].map(tab => (
                         <button
                           key={tab.id}
                           onClick={() => setActiveTabStep2(tab.id as typeof activeTabStep2)}
                           className={cn(
                             "px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap rounded-t-xl border-t border-x",
                             activeTabStep2 === tab.id
                               ? "bg-white border-slate-200 text-primary shadow-[0_4px_0_0_#ffffff] translate-y-[1px] relative z-10"
                               : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                           )}
                         >
                           {tab.label}
                         </button>
                       ))}
                     </div>
                     
                     {/* Tab Content */}
                     <div className="p-8 bg-slate-50/50">
                       {activeTabStep2 === 'caracterizacao' && (
                          <div className="space-y-6">
                             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4">Caracterização</h3>
                             {renderReadOnlyList(caseStudySynthesis?.currentContext, CONTEXT_CATEGORIES)}
                          </div>
                       )}
                       
                       {activeTabStep2 === 'estilos' && (
                          <div className="space-y-6">
                             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4">Estilos de Aprendizagem Identificados</h3>
                             {renderReadOnlyList(caseStudySynthesis?.learningStyle)}
                          </div>
                       )}

                       {activeTabStep2 === 'potencialidades' && (
                          <div className="space-y-6">
                             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4">Potencialidades e Interesses</h3>
                             {renderReadOnlyList(caseStudySynthesis?.potentialsInterests)}
                          </div>
                       )}

                       {activeTabStep2 === 'demandas' && (
                          <div className="space-y-6">
                             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4">Demandas e Barreiras Mapeadas</h3>
                             {renderReadOnlyList(caseStudySynthesis?.demandsBarriers)}
                          </div>
                       )}
                     </div>
                  </div>
                )}

                {activeSegmentStep2 === 'estrategias' && (
                  <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden atmospheric-shadow p-8">
                      <div className="space-y-8">
                         <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-xl flex items-start gap-3">
                            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-amber-800 leading-relaxed">
                              Presume-se que as estratégias e recursos de acessibilidade sejam as mesmas para todas as áreas do programa, a menos que seja indicado o contrário na construção do currículo.
                            </p>
                         </div>

                         <div className="space-y-4">
                           <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4">Acessibilidade: Estratégias</h3>
                           {renderReadOnlyList(caseStudySynthesis?.accessibilityStrategies, ACCESSIBILITY_CATEGORIES)}
                         </div>
                      </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ETAPA 3: Programa Curricular */}
            {activeStep === 3 && (
              <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-on-surface flex items-center gap-3">
                     <LayoutGrid className="text-primary" /> Programa Curricular
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-2">
                     Defina o perfil de cada disciplina e planeje o currículo para as áreas com modificação.
                  </p>
                </div>

                <div className="bg-slate-50/50 p-2 rounded-2xl border border-slate-100 flex flex-wrap justify-center gap-2 w-fit mx-auto mb-6">
                    <button 
                      onClick={() => setActiveTabStep3('perfil')}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                        activeTabStep3 === 'perfil' 
                          ? "bg-white text-primary shadow-sm border border-slate-200/60" 
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      Perfil Curricular
                    </button>
                    <button 
                      onClick={() => setActiveTabStep3('construcao')}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                        activeTabStep3 === 'construcao' 
                          ? "bg-white text-primary shadow-sm border border-slate-200/60" 
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      Construção do Currículo
                    </button>
                 </div>

                 <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden atmospheric-shadow p-8">
                     {activeTabStep3 === 'perfil' && (
                       <div className="space-y-6">
                         <div className="flex justify-between items-center mb-6">
                           <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Status dos Componentes Curriculares</h3>
                           <button onClick={() => setIsAddingDiscipline(!isAddingDiscipline)} className="text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
                             {isAddingDiscipline ? 'Cancelar' : '+ Adicionar Disciplina'}
                           </button>
                         </div>

                         {isAddingDiscipline && (
                           <div className="p-4 bg-white border border-slate-200 rounded-xl flex gap-4 items-end mb-6">
                             <div className="flex-1 space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Nome da Disciplina</label>
                                <input type="text" value={newDisciplineName} onChange={e => setNewDisciplineName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Ex: Projeto de Vida"/>
                             </div>
                             <button 
                                onClick={() => {
                                  if(newDisciplineName.trim()) {
                                     setDisciplines([...disciplines, { id: crypto.randomUUID(), name: newDisciplineName, status: 'padrao', justification: '' }]);
                                     setNewDisciplineName('');
                                     setIsAddingDiscipline(false);
                                  }
                                }}
                                className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
                             >Adicionar</button>
                           </div>
                         )}

                         <div className="space-y-4">
                           {disciplines.map((disc, idx) => (
                             <div key={disc.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col xl:flex-row gap-6 items-start xl:items-center shadow-sm relative group">
                               <button onClick={() => setDisciplines(disciplines.filter(d => d.id !== disc.id))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                               <div className="w-full xl:w-48 font-black text-slate-800 text-sm uppercase tracking-wide pr-6">
                                 {disc.name}
                               </div>
                               
                               <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
                                 {(['padrao', 'adaptacao', 'modificacao'] as const).map(status => (
                                   <button
                                     key={status}
                                     onClick={() => handleUpdateDiscipline(idx, { status })}
                                     className={cn(
                                       "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all tracking-widest",
                                       disc.status === status 
                                         ? status === 'padrao' ? "bg-slate-200 text-slate-700 shadow-sm" : 
                                           status === 'adaptacao' ? "bg-blue-100 text-blue-700 shadow-sm" : 
                                           "bg-orange-100 text-orange-700 shadow-sm"
                                         : "text-slate-500 hover:bg-slate-200/50"
                                     )}
                                   >
                                     {status === 'padrao' && '⚪ Padrão'}
                                     {status === 'adaptacao' && '🔵 Adaptação'}
                                     {status === 'modificacao' && '🟠 Modificação'}
                                   </button>
                                 ))}
                               </div>

                               <input 
                                 type="text"
                                 placeholder="Justificativa..."
                                 value={disc.justification}
                                 onChange={e => handleUpdateDiscipline(idx, { justification: e.target.value })}
                                 className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                               />
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     {activeTabStep3 === 'construcao' && (() => {
                        const modifiedDisciplines = disciplines.filter(d => d.status === 'modificacao');
                        if (modifiedDisciplines.length === 0) {
                           return (
                             <div className="text-center py-12">
                               <CheckCircle2 size={48} className="mx-auto text-slate-300 mb-4" />
                               <h3 className="text-lg font-black text-slate-700">Nenhuma adaptação curricular profunda necessária</h3>
                               <p className="text-slate-500 mt-2">O aluno seguirá o currículo padrão em todas as disciplinas selecionadas sem necessidade de planejamento alternativo (Modificação).</p>
                             </div>
                           );
                        }

                        // Inicializar plano se não existir
                        if (selectedPlanDisciplineId && !curriculumPlans.find(p => p.disciplineId === selectedPlanDisciplineId)) {
                           setCurriculumPlans([...curriculumPlans, {
                             disciplineId: selectedPlanDisciplineId,
                             annualGoal: '',
                             rows: [{ id: crypto.randomUUID(), objectives: [], customObjectives: '', indicators: '', timeline: '', strategies: '', evaluation: '' }]
                           }]);
                        }
                        
                        // Atual disciplin ID
                        const currentDiscId = selectedPlanDisciplineId || modifiedDisciplines[0].id;
                        if (!selectedPlanDisciplineId) setSelectedPlanDisciplineId(currentDiscId);
                        
                        const currentPlan = curriculumPlans.find(p => p.disciplineId === currentDiscId) || {
                             disciplineId: currentDiscId,
                             annualGoal: '',
                             rows: [{ id: crypto.randomUUID(), objectives: [], customObjectives: '', indicators: '', timeline: '', strategies: '', evaluation: '' }]
                        };
                        const handlePlanChange = (updates: Partial<CurriculumPlan>) => {
                           setCurriculumPlans(prev => prev.find(p => p.disciplineId === currentDiscId) 
                             ? prev.map(p => p.disciplineId === currentDiscId ? { ...p, ...updates } : p)
                             : [...prev, { ...currentPlan, ...updates } as CurriculumPlan]
                           );
                        }

                        return (
                          <div className="space-y-8">
                             <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                               <label className="text-sm font-black text-slate-700 uppercase tracking-widest shrink-0">Disciplina:</label>
                               <select 
                                 value={currentDiscId} 
                                 onChange={e => setSelectedPlanDisciplineId(e.target.value)}
                                 className="bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 flex-1 outline-none focus:ring-2 focus:ring-primary/20"
                               >
                                 {modifiedDisciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                               </select>
                             </div>

                             <div className="space-y-2">
                               <label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Meta Anual para {modifiedDisciplines.find(d => d.id === currentDiscId)?.name}</label>
                               <AutoResizeTextarea
                                 rows={2}
                                 value={currentPlan.annualGoal}
                                 onChange={e => handlePlanChange({ annualGoal: e.target.value })}
                                 placeholder="Ex: O aluno será capaz de compreender operações matemáticas básicas aplicadas..."
                                 className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                               />
                               <div className="flex justify-end items-center">
                                  <button onClick={() => handlePlanChange({ rows: [...currentPlan.rows, { id: crypto.randomUUID(), objectives: [], customObjectives: '', indicators: '', timeline: '', strategies: '', evaluation: '' }]})} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                                     <Plus size={14}/> Nova Linha
                                  </button>
                               </div>

                               <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                                  <table className="w-full text-left text-sm min-w-[900px]">
                                     <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-black text-slate-500 tracking-widest leading-relaxed">
                                        <tr>
                                          <th className="p-4 min-w-[250px] text-center">Objetivos de aprendizagem</th>
                                          <th className="p-4 w-48 text-center">Indicadores/Metas</th>
                                          <th className="p-4 w-48 text-center">Cronograma e Monitoramento</th>
                                          <th className="p-4 w-48 text-center">Estratégias de Ensino</th>
                                          <th className="p-4 w-48 text-center">Métodos de avaliação</th>
                                          <th className="p-4 w-10"></th>
                                        </tr>
                                     </thead>
                                     <tbody className="divide-y divide-slate-100">
                                        {currentPlan.rows.map((row, rIdx) => (
                                           <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                             <td className="p-4 border-r border-slate-100 align-top">
                                                <div className="space-y-3">
                                                   <div className="flex flex-wrap gap-2">
                                                      {row.objectives && row.objectives.length > 0 && row.objectives.map((skill, sIdx) => (
                                                         <div key={skill.codigo + sIdx} className="bg-primary/5 border border-primary/10 rounded-lg p-2 group relative max-w-[280px]">
                                                            <div className="flex justify-between items-start gap-2">
                                                               <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{skill.codigo}</span>
                                                               <button 
                                                                  onClick={() => {
                                                                     const newRows = [...currentPlan.rows];
                                                                     newRows[rIdx] = {...row, objectives: row.objectives.filter((_, i) => i !== sIdx)};
                                                                     handlePlanChange({ rows: newRows });
                                                                  }}
                                                                  className="text-slate-300 hover:text-red-500 transition-colors"
                                                               >
                                                                  <X size={12}/>
                                                               </button>
                                                            </div>
                                                            <p className="text-[10px] text-slate-600 leading-tight mt-1 line-clamp-3 group-hover:line-clamp-none transition-all">{skill.descricao}</p>
                                                         </div>
                                                      ))}
                                                   </div>
                                                   <button 
                                                      onClick={() => {
                                                         setActivePickerRowId(row.id);
                                                         setSearchTerm('');
                                                      }}
                                                      className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2"
                                                   >
                                                      <Plus size={14}/> Vincular BNCC
                                                   </button>
                                                   <div className="h-px bg-slate-100 my-2"></div>
                                                   <AutoResizeTextarea 
                                                      value={row.customObjectives || ''} 
                                                      onChange={e => {
                                                         const newRows = [...currentPlan.rows];
                                                         newRows[rIdx] = {...row, customObjectives: e.target.value};
                                                         handlePlanChange({ rows: newRows });
                                                      }} 
                                                      className="w-full bg-transparent resize-none text-[11px] font-medium p-2 outline-none focus:bg-white focus:ring-1 focus:ring-primary/20 rounded-lg min-h-[40px]" 
                                                      placeholder="Objetivos complementares..." 
                                                   />
                                                </div>
                                             </td>
                                             <td className="p-2 border-r border-slate-100 align-top">
                                                <AutoResizeTextarea value={row.indicators} onChange={e => {
                                                   const newRows = [...currentPlan.rows];
                                                   newRows[rIdx] = {...row, indicators: e.target.value};
                                                   handlePlanChange({ rows: newRows });
                                                }} className="w-full bg-transparent resize-none text-xs p-2 outline-none focus:bg-white focus:ring-1 focus:ring-primary/20 rounded-lg min-h-[60px]" placeholder="Indicadores..." />
                                             </td>
                                             <td className="p-2 border-r border-slate-100 align-top">
                                                <AutoResizeTextarea value={row.timeline} onChange={e => {
                                                   const newRows = [...currentPlan.rows];
                                                   newRows[rIdx] = {...row, timeline: e.target.value};
                                                   handlePlanChange({ rows: newRows });
                                                }} className="w-full bg-transparent resize-none text-xs p-2 outline-none focus:bg-white focus:ring-1 focus:ring-primary/20 rounded-lg min-h-[60px]" placeholder="Cronograma..." />
                                             </td>
                                             <td className="p-2 border-r border-slate-100 align-top">
                                                <AutoResizeTextarea value={row.strategies} onChange={e => {
                                                   const newRows = [...currentPlan.rows];
                                                   newRows[rIdx] = {...row, strategies: e.target.value};
                                                   handlePlanChange({ rows: newRows });
                                                }} className="w-full bg-transparent resize-none text-xs p-2 outline-none focus:bg-white focus:ring-1 focus:ring-primary/20 rounded-lg min-h-[60px]" placeholder="Estratégias..." />
                                             </td>
                                             <td className="p-2 border-r border-slate-100 align-top">
                                                <AutoResizeTextarea value={row.evaluation} onChange={e => {
                                                   const newRows = [...currentPlan.rows];
                                                   newRows[rIdx] = {...row, evaluation: e.target.value};
                                                   handlePlanChange({ rows: newRows });
                                                }} className="w-full bg-transparent resize-none text-xs p-2 outline-none focus:bg-white focus:ring-1 focus:ring-primary/20 rounded-lg min-h-[60px]" placeholder="Avaliação..." />
                                             </td>
                                             <td className="p-2 text-center align-middle">
                                               <button onClick={() => {
                                                  handlePlanChange({ rows: currentPlan.rows.filter(r => r.id !== row.id) })
                                               }} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                             </td>
                                           </tr>
                                        ))}
                                     </tbody>
                                  </table>
                               </div>
                             </div>
                          </div>
                        );
                     })()}
                   </div>
              </motion.div>
            )}

            {activeStep === 4 && (
              <motion.div key="step-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-on-surface flex items-center gap-3">
                     <BookOpen className="text-primary" /> Serviços Especializados e Enriquecimento
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-2">
                     Especifique os apoios e atividades extracurriculares oferecidos ao estudante.
                  </p>
                </div>

                <div className="bg-slate-50/50 p-2 rounded-2xl border border-slate-100 flex flex-wrap justify-center gap-2 w-fit mx-auto mb-6">
                    <button 
                      onClick={() => setActiveTabStep4('servicos')}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                        activeTabStep4 === 'servicos' 
                          ? "bg-white text-primary shadow-sm border border-slate-200/60" 
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      Serviços Especializados
                    </button>
                    <button 
                      onClick={() => setActiveTabStep4('enriquecimento')}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                        activeTabStep4 === 'enriquecimento' 
                          ? "bg-white text-primary shadow-sm border border-slate-200/60" 
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      Enriquecimento Extracurricular
                    </button>
                 </div>

                 {activeTabStep4 === 'servicos' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Tabela de Serviços Especializados</label>
                        <button onClick={() => setSpecializedServices([...specializedServices, { id: crypto.randomUUID(), name: '', frequency: '', duration: '', location: '' }])} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                           <Plus size={14}/> Adicionar Serviço
                        </button>
                      </div>
                      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                        <table className="w-full text-left text-sm min-w-[700px]">
                            <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-black text-slate-500 tracking-widest leading-relaxed">
                              <tr>
                                <th className="p-4 min-w-[200px] text-center">Serviço especializado</th>
                                <th className="p-4 w-40 text-center">Frequência</th>
                                <th className="p-4 w-40 text-center">Duração</th>
                                <th className="p-4 w-48 text-center">Local</th>
                                <th className="p-4 w-10"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {specializedServices.length === 0 && (
                                  <tr><td colSpan={5} className="p-6 text-center text-slate-400 font-medium pb-8 border-none"><ShieldCheck className="mx-auto mb-2 opacity-50" size={32}/>Nenhum serviço cadastrado.</td></tr>
                                )}
                                {specializedServices.map((svc, sIdx) => (
                                  <tr key={svc.id} className="hover:bg-slate-50/50 transition-colors align-top">
                                    <td className="p-2 border-r border-slate-50">
                                       <AutoResizeTextarea value={svc.name} onChange={e => { const n = [...specializedServices]; n[sIdx].name = e.target.value; setSpecializedServices(n); }} className="w-full bg-transparent resize-none overflow-hidden outline-none text-xs p-2 min-h-[40px]" placeholder="Ex: Fonoaudiologia..." />
                                    </td>
                                    <td className="p-2 border-r border-slate-50">
                                       <AutoResizeTextarea value={svc.frequency} onChange={e => { const n = [...specializedServices]; n[sIdx].frequency = e.target.value; setSpecializedServices(n); }} className="w-full bg-transparent resize-none overflow-hidden outline-none text-xs p-2 min-h-[40px]" placeholder="Ex: 2x por semana..." />
                                    </td>
                                    <td className="p-2 border-r border-slate-50">
                                       <AutoResizeTextarea value={svc.duration} onChange={e => { const n = [...specializedServices]; n[sIdx].duration = e.target.value; setSpecializedServices(n); }} className="w-full bg-transparent resize-none overflow-hidden outline-none text-xs p-2 min-h-[40px]" placeholder="Ex: 50 minutos..." />
                                    </td>
                                    <td className="p-2">
                                       <AutoResizeTextarea value={svc.location} onChange={e => { const n = [...specializedServices]; n[sIdx].location = e.target.value; setSpecializedServices(n); }} className="w-full bg-transparent resize-none overflow-hidden outline-none text-xs p-2 min-h-[40px]" placeholder="Ex: Clínica X..." />
                                    </td>
                                    <td className="p-2 align-middle">
                                       <button onClick={() => setSpecializedServices(specializedServices.filter(s => s.id !== svc.id))} className="text-slate-300 hover:text-red-500 rounded p-1"><Trash2 size={16}/></button>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                    </div>
                 )}

                 {activeTabStep4 === 'enriquecimento' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Tabela de Enriquecimento Extracurricular</label>
                        <button onClick={() => setEnrichmentServices([...enrichmentServices, { id: crypto.randomUUID(), name: '', frequency: '', duration: '', location: '' }])} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                           <Plus size={14}/> Adicionar Enriquecimento
                        </button>
                      </div>
                      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                        <table className="w-full text-left text-sm min-w-[700px]">
                            <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-black text-slate-500 tracking-widest leading-relaxed">
                              <tr>
                                <th className="p-4 min-w-[200px] text-center">Enriquecimento extracurricular</th>
                                <th className="p-4 w-40 text-center">Frequência</th>
                                <th className="p-4 w-40 text-center">Duração</th>
                                <th className="p-4 w-48 text-center">Local</th>
                                <th className="p-4 w-10"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {enrichmentServices.length === 0 && (
                                  <tr><td colSpan={5} className="p-6 text-center text-slate-400 font-medium pb-8 border-none"><Sparkles className="mx-auto mb-2 opacity-50" size={32}/>Nenhuma atividade cadastrada.</td></tr>
                                )}
                                {enrichmentServices.map((svc, sIdx) => (
                                  <tr key={svc.id} className="hover:bg-slate-50/50 transition-colors align-top">
                                    <td className="p-2 border-r border-slate-50">
                                       <AutoResizeTextarea value={svc.name} onChange={e => { const n = [...enrichmentServices]; n[sIdx].name = e.target.value; setEnrichmentServices(n); }} className="w-full bg-transparent resize-none overflow-hidden outline-none text-xs p-2 min-h-[40px]" placeholder="Ex: Robótica..." />
                                    </td>
                                    <td className="p-2 border-r border-slate-50">
                                       <AutoResizeTextarea value={svc.frequency} onChange={e => { const n = [...enrichmentServices]; n[sIdx].frequency = e.target.value; setEnrichmentServices(n); }} className="w-full bg-transparent resize-none overflow-hidden outline-none text-xs p-2 min-h-[40px]" placeholder="Ex: 1x na semana..." />
                                    </td>
                                    <td className="p-2 border-r border-slate-50">
                                       <AutoResizeTextarea value={svc.duration} onChange={e => { const n = [...enrichmentServices]; n[sIdx].duration = e.target.value; setEnrichmentServices(n); }} className="w-full bg-transparent resize-none overflow-hidden outline-none text-xs p-2 min-h-[40px]" placeholder="Ex: 2 horas..." />
                                    </td>
                                    <td className="p-2">
                                       <AutoResizeTextarea value={svc.location} onChange={e => { const n = [...enrichmentServices]; n[sIdx].location = e.target.value; setEnrichmentServices(n); }} className="w-full bg-transparent resize-none overflow-hidden outline-none text-xs p-2 min-h-[40px]" placeholder="Ex: Laboratório..." />
                                    </td>
                                    <td className="p-2 align-middle text-center">
                                       <button onClick={() => setEnrichmentServices(enrichmentServices.filter(s => s.id !== svc.id))} className="text-slate-300 hover:text-red-500 rounded p-1"><Trash2 size={16}/></button>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                    </div>
                 )}
              </motion.div>
            )}

            {/* ETAPA 5 */}
            {activeStep === 5 && (
              <motion.div key="step-5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-on-surface flex items-center gap-3">
                     <Sparkles className="text-primary" /> Recursos Tecnológicos e T.A.
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-2">
                     Planeje os recursos tecnológicos e de Tecnologia Assistiva (T.A.) que o estudante necessita.
                  </p>
                </div>

                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Aplicação de Recursos e Tecnologia Assistiva</label>
                    <button onClick={() => setTechResources([...techResources, { id: crypto.randomUUID(), tool: '', objective: '', frequency: '', location: '' }])} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                       <Plus size={14}/> Adicionar Recurso
                    </button>
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                    <table className="w-full text-left text-sm min-w-[700px]">
                        <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-black text-slate-500 tracking-widest leading-relaxed">
                          <tr>
                            <th className="p-4 min-w-[200px] text-center">Ferramenta</th>
                            <th className="p-4 w-64 text-center">Objetivo</th>
                            <th className="p-4 w-40 text-center">Frequência</th>
                            <th className="p-4 w-40 text-center">Local</th>
                            <th className="p-4 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {techResources.length === 0 && (
                              <tr><td colSpan={5} className="p-6 text-center text-slate-400 font-medium pb-8 border-none"><Sparkles className="mx-auto mb-2 opacity-50" size={32}/>Nenhum recurso cadastrado.</td></tr>
                            )}
                            {techResources.map((svc, sIdx) => (
                              <tr key={svc.id} className="hover:bg-slate-50/50 transition-colors align-top">
                                <td className="p-2 border-r border-slate-50">
                                   <AutoResizeTextarea value={svc.tool} onChange={e => { const n = [...techResources]; n[sIdx].tool = e.target.value; setTechResources(n); }} className="w-full bg-transparent resize-none overflow-hidden outline-none text-xs p-2 min-h-[40px]" placeholder="Ex: Prancha de C.A..." />
                                </td>
                                <td className="p-2 border-r border-slate-50">
                                   <AutoResizeTextarea value={svc.objective} onChange={e => { const n = [...techResources]; n[sIdx].objective = e.target.value; setTechResources(n); }} className="w-full bg-transparent resize-none overflow-hidden outline-none text-xs p-2 min-h-[40px]" placeholder="Ex: Apoio visual..." />
                                </td>
                                <td className="p-2 border-r border-slate-50">
                                   <AutoResizeTextarea value={svc.frequency} onChange={e => { const n = [...techResources]; n[sIdx].frequency = e.target.value; setTechResources(n); }} className="w-full bg-transparent resize-none overflow-hidden outline-none text-xs p-2 min-h-[40px]" placeholder="Ex: Contínua..." />
                                </td>
                                <td className="p-2">
                                   <AutoResizeTextarea value={svc.location} onChange={e => { const n = [...techResources]; n[sIdx].location = e.target.value; setTechResources(n); }} className="w-full bg-transparent resize-none overflow-hidden outline-none text-xs p-2 min-h-[40px]" placeholder="Ex: Sala de Aula..." />
                                </td>
                                <td className="p-2 align-middle">
                                   <button onClick={() => setTechResources(techResources.filter(s => s.id !== svc.id))} className="text-slate-300 hover:text-red-500 rounded p-1"><Trash2 size={16}/></button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
            {/* ETAPA 6 */}
            {activeStep === 6 && (
              <motion.div key="step-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-on-surface flex items-center gap-3">
                     <Target className="text-primary" /> Plano de Transição e Aconselhamento
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-2">
                     Avalie a necessidade e estabeleça objetivos para a transição dos anos escolares ou preparação profissional.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
                   <div className="flex items-center justify-between">
                     <div>
                       <h3 className="font-black text-lg text-slate-800 tracking-tight">Ativar Plano de Transição?</h3>
                       <p className="text-xs font-medium text-slate-500">Selecione se haverá um plano de transição formal para este estudante.</p>
                     </div>
                     <button 
                       onClick={() => setEnableTransitionPlan(!enableTransitionPlan)}
                       className={cn(
                         "relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none",
                         enableTransitionPlan ? "bg-primary" : "bg-slate-200"
                       )}
                     >
                       <span className={cn(
                         "inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm",
                         enableTransitionPlan ? "translate-x-7" : "translate-x-1"
                       )} />
                     </button>
                   </div>

                   {!enableTransitionPlan ? (
                     <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex items-center gap-4 animate-in fade-in">
                       <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                         <ShieldCheck className="text-slate-400" size={20} />
                       </div>
                       <p className="text-sm text-slate-500 font-medium leading-relaxed">
                         O plano de transição está desativado para este documento. Geralmente é ativado apenas para séries avançadas (Ensino Médio), mudanças drásticas de ciclo ou aconselhamento profissional iminente.
                       </p>
                     </div>
                   ) : (
                     <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                       <p className="text-sm font-bold text-primary">Plano Ativado: A estrutura base será gerada na exportação.</p>
                       <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-3">
                         <Target className="text-slate-300 mx-auto" size={40} />
                         <div>
                           <p className="text-sm font-bold text-slate-600">Espaço Reservado para Estruturação</p>
                           <p className="text-xs text-slate-400 mt-1 max-w-md">Os eixos de transição (Curricular, Profissionalizante e Autonomia) serão preenchidos em uma atualização futura do sistema.</p>
                         </div>
                       </div>
                     </div>
                   )}
                </div>


              </motion.div>
            )}

            {/* ETAPA 7 */}
            {activeStep === 7 && (
              <motion.div key="step-7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-on-surface flex items-center gap-3">
                     <PencilRuler className="text-primary" /> Registro e Assinaturas
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-2">
                     Acompanhamentos metodológicos e anuência de responsabilidades.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
                   <div className="flex items-center justify-between">
                     <div>
                       <h3 className="font-black text-lg text-slate-800 tracking-tight">Histórico de Acompanhamento</h3>
                       <p className="text-xs font-medium text-slate-500">Mantenha ou desative a tabela de registros para acompanhamentos contínuos.</p>
                     </div>
                     <button 
                       onClick={() => setEnableHistory(!enableHistory)}
                       className={cn(
                         "relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none",
                         enableHistory ? "bg-primary" : "bg-slate-200"
                       )}
                     >
                       <span className={cn(
                         "inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm",
                         enableHistory ? "translate-x-7" : "translate-x-1"
                       )} />
                     </button>
                   </div>
                   
                   {enableHistory && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-top-2 pt-4">
                        <div className="flex justify-end">
                           <button onClick={() => setHistoryLog([...historyLog, { id: crypto.randomUUID(), date: '', description: '', result: '' }])} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                              <Plus size={14}/> Adicionar Registro
                           </button>
                        </div>
                        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                          <table className="w-full text-left text-sm min-w-[700px]">
                              <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-black text-slate-500 tracking-widest leading-relaxed">
                                <tr>
                                  <th className="p-4 w-40 text-center">Data</th>
                                  <th className="p-4 min-w-[300px] text-center">Descrição ou Ação</th>
                                  <th className="p-4 w-60 text-center">Resultado</th>
                                  <th className="p-4 w-10"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {historyLog.length === 0 && (
                                    <tr><td colSpan={4} className="p-6 text-center text-slate-400 font-medium pb-8 border-none"><Clock className="mx-auto mb-2 opacity-50" size={32}/>Nenhum evento registrado.</td></tr>
                                  )}
                                  {historyLog.map((log, lIdx) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors align-top">
                                      <td className="p-2 border-r border-slate-50">
                                         <input type="date" value={log.date} onChange={e => { const n = [...historyLog]; n[lIdx].date = e.target.value; setHistoryLog(n); }} className="w-full bg-transparent outline-none text-xs p-2 text-slate-700 font-medium" />
                                      </td>
                                      <td className="p-2 border-r border-slate-50">
                                         <AutoResizeTextarea value={log.description} onChange={e => { const n = [...historyLog]; n[lIdx].description = e.target.value; setHistoryLog(n); }} className="w-full bg-transparent resize-none overflow-hidden outline-none text-xs p-2 min-h-[40px]" placeholder="Ex: Reunião de alinhamento..." />
                                      </td>
                                      <td className="p-2 border-r border-slate-50">
                                         <AutoResizeTextarea value={log.result} onChange={e => { const n = [...historyLog]; n[lIdx].result = e.target.value; setHistoryLog(n); }} className="w-full bg-transparent resize-none overflow-hidden outline-none text-xs p-2 min-h-[40px]" placeholder="Ex: Metas ajustadas..." />
                                      </td>
                                      <td className="p-2 align-middle">
                                         <button onClick={() => setHistoryLog(historyLog.filter(l => l.id !== log.id))} className="text-slate-300 hover:text-red-500 rounded p-1"><Trash2 size={16}/></button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                          </table>
                        </div>
                     </div>
                   )}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
                   <div className="flex items-center justify-between">
                     <div>
                       <h3 className="font-black text-lg text-slate-800 tracking-tight">Signatários do PEI</h3>
                       <p className="text-xs font-medium text-slate-500">Adicione os responsáveis que validarão a ativação e execução deste documento.</p>
                     </div>
                     <button onClick={() => setSignatories([...signatories, { id: crypto.randomUUID(), name: '', role: '' }])} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                        <Plus size={14}/> Adicionar Signatário
                     </button>
                   </div>
                   
                   <div className="space-y-3 pt-2">
                      {signatories.length === 0 && (
                        <div className="text-center text-slate-400 font-medium py-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                          <UserIcon className="mx-auto mb-2 opacity-50" size={32}/>
                          Ainda não há assinaturas requeridas.
                        </div>
                      )}
                      {signatories.map((sig, sIdx) => (
                         <div key={sig.id} className="flex gap-4 items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                               <PencilRuler className="text-slate-400" size={16} />
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <input 
                                  type="text" 
                                  value={sig.name} 
                                  onChange={e => { const n = [...signatories]; n[sIdx].name = e.target.value; setSignatories(n); }}
                                  placeholder="Nome Completo..."
                                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                               />
                               <select 
                                  value={sig.role}
                                  onChange={e => { const n = [...signatories]; n[sIdx].role = e.target.value; setSignatories(n); }}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-600"
                                  title="Função"
                               >
                                  <option value="">Selecione a Relação...</option>
                                  <option value="Professor AEE">Professor AEE</option>
                                  <option value="Professor Regente">Professor Regente</option>
                                  <option value="Coordenador">Coordenador Pedagógico</option>
                                  <option value="Responsável Legal">Responsável Legal</option>
                                  <option value="Estudante">Estudante</option>
                                  <option value="Gestor Escolar">Gestor Escolar</option>
                                  <option value="Outro">Outro</option>
                               </select>
                            </div>
                            <button onClick={() => setSignatories(signatories.filter(s => s.id !== sig.id))} className="text-slate-300 hover:text-red-500 rounded-xl hover:bg-red-50 p-2.5 transition-colors">
                               <Trash2 size={18}/>
                            </button>
                         </div>
                      ))}
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

        {/* BNCC PICKER MODAL */}
        <AnimatePresence>
          {activePickerRowId && (
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            >
               <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
               >
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                     <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                           <Brain className="text-primary" size={24}/> Buscar na BNCC
                        </h3>
                        <p className="text-xs font-medium text-slate-500">Selecione habilidades ou competências para o objetivo proposto.</p>
                     </div>
                     <button onClick={() => setActivePickerRowId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X size={24}/>
                     </button>
                  </div>

                  <div className="p-6 space-y-4 flex-1 overflow-y-auto min-h-0 bg-slate-50/30">
                     {/* Área de Filtros Congelada no Topo */}
                     <div className="space-y-4 bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        {/* Grid de Seletores - Ordem: Etapa, Série, Disciplina, Tipo */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                 <Layers className="text-primary" size={12}/> Etapa
                              </label>
                              <select
                                 value={filterStage || ''}
                                 onChange={e => {
                                    setFilterStage(e.target.value || null);
                                    setFilterGrade(null);
                                 }}
                                 className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer appearance-none shadow-sm"
                              >
                                 <option value="">Todas as Etapas</option>
                                 <option value="Infantil">Infantil</option>
                                 <option value="Fundamental">Fundamental</option>
                                 <option value="Médio">Médio</option>
                              </select>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                 <Calendar className="text-primary" size={12}/> Série / Ano
                              </label>
                              <select
                                 value={filterGrade || ''}
                                 onChange={e => setFilterGrade(e.target.value || null)}
                                 className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer appearance-none shadow-sm"
                              >
                                 <option value="">{filterStage === 'Médio' ? 'Todos (Médio)' : filterStage === 'Infantil' ? 'Todos (Infantil)' : `Aluno (${studentInfo?.grade || 'PEI'})`}</option>
                                 {filterStage === 'Infantil' ? (
                                    ['3 anos', '4 anos', '5 anos'].map(g => <option key={g} value={g}>{g}</option>)
                                 ) : filterStage === 'Médio' ? (
                                    ['1º Ano', '2º Ano', '3º Ano'].map(g => <option key={g} value={g}>{g}</option>)
                                 ) : (
                                    ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano'].map(g => (
                                       <option key={g} value={g}>{g}</option>
                                    ))
                                 )}
                              </select>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                 <Book className="text-primary" size={12}/> Disciplina
                              </label>
                              <select
                                 value={filterDiscipline || ''}
                                 onChange={e => setFilterDiscipline(e.target.value || null)}
                                 className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer appearance-none shadow-sm"
                              >
                                 <option value="">Todas</option>
                                 <option value="LP">Português</option>
                                 <option value="MA">Matemática</option>
                                 <option value="CI">Ciências</option>
                                 <option value="HI">História</option>
                                 <option value="GE">Geografia</option>
                                 <option value="AR">Artes</option>
                                 <option value="EF">Ed. Física</option>
                                 <option value="LI">Inglês</option>
                                 <option value="ER">Ensino Religioso</option>
                              </select>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                 <Target className="text-primary" size={12}/> Tipo
                              </label>
                              <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                                 <button 
                                    onClick={() => setSearchType('habilidade')}
                                    className={cn(
                                       "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all",
                                       searchType === 'habilidade' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-600"
                                    )}
                                 >Habilidades</button>
                                 <button 
                                    onClick={() => setSearchType('competencia')}
                                    className={cn(
                                       "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all",
                                       searchType === 'competencia' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-600"
                                    )}
                                 >Competências</button>
                              </div>
                           </div>
                        </div>

                        {/* Barra de Busca (Termo) */}
                        <div className="relative">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                           <input 
                              type="text"
                              placeholder="Pesquisar por código (ex: EF05LP01) ou palavras-chave..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[20px] text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                           />
                        </div>

                        {/* Botão Limpar */}
                        {(filterDiscipline || filterGrade || filterStage || searchTerm) && (
                           <div className="flex justify-end">
                              <button 
                                 onClick={() => {
                                    setFilterDiscipline(null);
                                    setFilterGrade(null);
                                    setFilterStage(null);
                                    setSearchTerm('');
                                 }}
                                 className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                              >
                                 Limpar Todos os Filtros e Busca
                              </button>
                           </div>
                        )}
                     </div>

                     <div className="space-y-3">
                        {searchResults.length === 0 ? (
                           <div className="text-center py-12 flex flex-col items-center">
                              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                 <Search className="text-slate-300" size={24}/>
                              </div>
                              <p className="text-sm font-medium text-slate-400 max-w-xs uppercase tracking-widest leading-loose">
                                 {searchTerm.length < 3 ? "Digite pelo menos 3 caracteres para buscar..." : "Nenhum resultado encontrado para os filtros atuais."}
                              </p>
                           </div>
                        ) : (
                           searchResults.map((item, idx) => (
                              <button 
                                 key={`${item.codigo}-${idx}`}
                                 onClick={() => {
                                    const plano = curriculumPlans.map(cp => {
                                       const rExists = cp.rows.find(r => r.id === activePickerRowId);
                                       if (rExists) {
                                          return {
                                             ...cp,
                                             rows: cp.rows.map(r => r.id === activePickerRowId ? { ...r, objectives: [...(r.objectives || []), item] } : r)
                                          };
                                       }
                                       return cp;
                                    });
                                    setCurriculumPlans(plano);
                                    setActivePickerRowId(null);
                                    setSearchTerm('');
                                 }}
                                 className="w-full text-left bg-white border border-slate-200 rounded-2xl p-4 hover:border-primary hover:bg-primary/5 transition-all group flex gap-4 items-start"
                              >
                                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 font-black text-[10px] text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors uppercase tracking-tighter">
                                    {item.codigo === 'S/C' ? 'BNCC' : item.codigo}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.disciplina}</span>
                                       <span className="text-[10px] font-bold text-slate-300">•</span>
                                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.ano}</span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed group-hover:text-slate-900">{item.descricao}</p>
                                 </div>
                                 <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus size={20}/>
                                 </div>
                              </button>
                           ))
                        )}
                     </div>
                  </div>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
           
           {activeStep < 7 && (
             <button 
               onClick={nextStep}
               className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all duration-300"
             >
               Próximo Passo <ChevronRight size={16} />
             </button>
           )}
        </div>
       </main>

      {/* ESTILOS DE IMPRESSÃO */}
      <style>{`
        @media print {
          /* Esconder tudo que não é o formulário */
          nav, aside, .TopBar, .TopBar *, button, .SaveProgress, header, footer,
          .Stepper, .save-draft-btn, .export-btn, .no-print {
            display: none !important;
          }

          body, html {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .min-h-screen {
            background: white !important;
          }

          main {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }

          .bg-white {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }

          /* Garantir que as tabelas sejam impressas corretamente */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #e2e8f0 !important;
          }
          
          /* Esconder botões de ação nas tabelas */
          td button {
            display: none !important;
          }

          .atmospheric-shadow {
            box-shadow: none !important;
          }

          /* Forçar quebra de página se necessário */
          .step-section {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}
