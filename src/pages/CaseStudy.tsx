import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ClipboardList, Brain, PencilRuler, 
  ChevronLeft, CheckCircle2, Send, 
  Clock, User as UserIcon, Plus, 
  Sparkles, ShieldCheck, LayoutGrid,
  FileText, Activity, Users, Info,
  MessageSquare, History, Wand2, TrendingUp,
  Percent, Eye, Trash2, Archive, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from '../components/Navigation';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { supabase } from '../lib/supabase';
import type { InstrumentAudioFile } from '../types/database';
import { Student, InstrumentStatus as DBInstrumentStatus } from '../types/database';
import { MultimodalInput } from '../components/MultimodalInput';
import { cn } from '../lib/utils';
import { instruments, InstrumentStatus } from '../data/instruments';

type ViewState = 'hub' | 'details' | 'filling' | 'consolidation' | 'versions';

type InstrumentRecord = {
  id: string;
  instrumentType: 'IF-SAHS' | 'ENTREVISTA' | 'IP-SAHS' | 'N-ILS';
  type: 'versao_inicial' | 'atualizacao';
  status: DBInstrumentStatus;
  date: string;
  person: string;
  respondentName: string;
  respondentRole: string;
  respondentRelation?: string;
  answers: Record<string, any>; // Mudado para any para suportar objetos complexos do IP-SAHS
  updates?: { date: string; person: string; text: string; }[];
  pendingQuestions?: string[];
  audioStorage?: Record<string, string>;
  transcriptStorage?: Record<string, string>;
  updateDraft?: { text: string; audio?: string; transcript?: string; pending: boolean };
};

// Mapeamento local removido para src/data/instruments.ts

const IF_SAHS_QUESTIONS = [
  {
    section: 'I - PERFIL DO ESTUDANTE',
    questions: [
      { id: 'q1', text: 'O que o(a) estudante gosta de fazer ou apresenta facilidade para realizar? ex.: matemática, ciências, artes, música, tecnologia, linguagem, jogos, esportes' },
      { id: 'q2', text: 'Como é a interação do seu filho com outras pessoas? Relate exemplo(s).' },
      { id: 'q3', text: 'Como seu filho reage a desafios e frustrações? Relate exemplo(s).' }
    ]
  },
  {
    section: 'II - CONTEXTO FAMILIAR E APOIO EXTERNO',
    questions: [
      { id: 'q4', text: 'O estudante participa de atividades extracurriculares fora da escola? Se sim, quais?' },
      { id: 'q5', text: 'A família já comunicou à escola a existência de desafios pedagógicos, emocionais ou comportamentais relacionados ao estudante? Se sim, quais?' }
    ]
  },
  {
    section: 'III - DESAFIOS E NECESSIDADES EDUCACIONAIS',
    questions: [
      { id: 'q6', text: 'O aluno demonstra sinais de desmotivação na escola? Quais comportamentos, atitudes ou situações evidenciam essa desmotivação?' },
      { id: 'q7', text: 'Na sua opinião, quais são atualmente, as maiores necessidades pedagógicas do seu filho na escola?' },
      { id: 'q8', text: 'Que expectativas você tem em relação ao desenvolvimento escolar do(a) seu(sua) filho(a)?' },
      { id: 'q9', text: 'Gostaria de sugerir algo que considere importante para que possamos planejar um atendimento mais adequado ao seu(sua) filho(a)?' }
    ]
  }
];

const INTERVIEW_QUESTIONS = [
  {
    section: 'I – SOU CURIOSO PARA...',
    questions: [
      { id: 'q1', text: 'Quando você não está na escola o que gosta de fazer?' },
      { id: 'q2', text: 'Há algo que você aprendeu sozinho(a), pesquisando, vendo vídeos ou só por curiosidade?' },
      { id: 'q3', text: 'Há algo que você gostaria muito de aprender, mas ainda não teve a oportunidade? O que é?' },
      { id: 'q4', text: 'Quando você tenta fazer algo e não consegue como você se sente?' }
    ]
  },
  {
    section: 'II – A ESCOLA PARA MIM É...',
    questions: [
      { id: 'q5a', text: 'O que você mais gosta nela?' },
      { id: 'q5b', text: 'O que você não gosta nela?' },
      { id: 'q6', text: 'Se você pudesse mudar alguma coisa na escola o que seria?' },
      { id: 'q7a', text: 'Sobre as matérias/disciplinas: Qual(is) você mais gosta?' },
      { id: 'q7b', text: 'Sobre as matérias/disciplinas: Qual(is) você não gosta muito?' },
      { id: 'q8a', text: 'Sobre as aulas/atividades: O que faz uma atividade/aula muito legal?' },
      { id: 'q8b', text: 'Sobre as aulas/atividades: O que faz uma atividade/aula ser chata ou sem graça?' },
      { id: 'q9', text: 'Você tem amigos na escola?' }
    ]
  },
  {
    section: 'III – EU USO A TECNOLOGIA PARA...',
    questions: [
      { id: 'q10', text: 'Você gosta mais de aprender com tecnologia ou sem ela? Por quê?' },
      { id: 'q11', text: 'Quais tecnologias você utiliza em casa? Como e para quê?' },
      { id: 'q12', text: 'Se você pudesse usar mais tecnologia nas aulas, para que seria?' }
    ]
  }
];

const IP_SAHS_QUESTIONS = [
  {
    section: 'Bloco I - Perfil do Aluno',
    questions: [
      { id: 'behavioral_profile', text: 'Perfil Comportamental (Frequência 1-5)' },
      { id: 'other_behaviors', text: 'Outros comportamentos observados' },
      { id: 'social_interaction_option', text: 'Interação Social (Opção Selecionada)' },
      { id: 'social_interaction_example', text: 'Exemplos de Interação Social' },
      { id: 'desafios_reacao_option', text: 'Reação a Desafios (Opção Selecionada)' },
      { id: 'desafios_reacao_example', text: 'Exemplos de Reação a Desafios' }
    ]
  },
  {
    section: 'Bloco II - Interesses e Habilidades',
    questions: [
       { id: 'areas_of_interest', text: 'Áreas de Interesse' },
       { id: 'other_interests', text: 'Outros Interesses' },
       { id: 'potentialities_response', text: 'Potencialidades e facilidades' }
    ]
  },
  {
    section: 'Bloco III - Desafios e Necessidades',
    questions: [
       { id: 'pedagogical_difficulties_response', text: 'Maiores dificuldades pedagógicas' },
       { id: 'demotivation_signs_response', text: 'Sinais de desmotivação' },
       { id: 'needs_pedagogical', text: 'Necessidades Pedagógicas' },
       { id: 'needs_behavioral', text: 'Necessidades Comportamentais' },
       { id: 'needs_emotional', text: 'Necessidades Emocionais' }
    ]
  },
  {
    section: 'Bloco IV - Suplementação e Estratégias',
    questions: [
       { id: 'strategy_experience_response', text: 'Estratégias já adotadas e eficácia' },
       { id: 'suggestions', text: 'Sugestões Geradas' }
    ]
  },
  {
    section: 'Observações / Informações Adicionais',
    questions: [
       { id: 'additional_notes', text: 'Observações e informações adicionais' }
    ]
  }
];

// ─── Renderizador de Resposta Dinâmico ─────────────────────────────────────
const BADGE_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

function AnswerRenderer({ value }: { value: any }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-slate-400 italic text-sm">Preenchimento vazio neste campo.</span>;
  }

  // Booleano → Sim / Não
  if (typeof value === 'boolean') {
    return (
      <span className={cn('px-3 py-1 rounded-full text-xs font-bold', value ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')}>
        {value ? 'Sim' : 'Não'}
      </span>
    );
  }

  // Array → verificar se é de strings ou de objetos
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-slate-400 italic text-sm">Nenhum item selecionado.</span>;
    }
    // Array de objetos (ex: suggestions) → tabela compacta
    if (typeof value[0] === 'object' && value[0] !== null) {
      return (
        <div className="space-y-3">
          {value.map((item: any, i: number) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs font-medium text-slate-600 space-y-1">
              {Object.entries(item)
                .filter(([k]) => k !== 'id')
                .map(([k, v]) =>
                  v ? (
                    <div key={k}>
                      <span className="font-black text-slate-400 uppercase tracking-wider">{k}: </span>
                      <span>{String(v)}</span>
                    </div>
                  ) : null
                )}
            </div>
          ))}
        </div>
      );
    }
    // Array de primitivos → Badges coloridos
    return (
      <div className="flex flex-wrap gap-2">
        {value.map((item: any, i: number) => (
          <span key={i} className={cn('px-3 py-1 rounded-full text-xs font-bold', BADGE_COLORS[i % BADGE_COLORS.length])}>
            {String(item)}
          </span>
        ))}
      </div>
    );
  }

  // Objeto → verificar se é behavioral_profile (chaves numéricas com valores numéricos)
  if (typeof value === 'object') {
    if (value === null) return <span className="text-slate-400 italic text-sm">Sem dados.</span>;
    const entries = Object.entries(value as Record<string, any>);
    if (entries.length === 0) {
      return <span className="text-slate-400 italic text-sm">Sem dados.</span>;
    }
    const isNumericProfile = entries.every(([, v]) => typeof v === 'number');
    if (isNumericProfile) {
      return (
        <div className="space-y-1">
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 w-6 text-right">{+k + 1}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(Number(v) / 5) * 100}%` }} />
              </div>
              <span className="text-xs font-black text-primary w-6">{v}/5</span>
            </div>
          ))}
        </div>
      );
    }
    // Objeto genérico → JSON formatado
    return <pre className="text-slate-600 text-xs whitespace-pre-wrap font-mono bg-slate-50 p-3 rounded-lg">{JSON.stringify(value, null, 2)}</pre>;
  }

  // Texto simples
  return <p className="text-slate-600 font-medium whitespace-pre-wrap text-sm leading-relaxed">{String(value)}</p>;
}


export default function CaseStudy() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>('hub');
  const [activeInstrumentId, setActiveInstrumentId] = useState<string | null>(null);
  
  const [instrumentsData, setInstrumentsData] = useState<InstrumentStatus[]>(instruments);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');

  const [instrumentRecords, setInstrumentRecords] = useState<InstrumentRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<InstrumentRecord | null>(null);
  const [fillingType, setFillingType] = useState<'nova_versao' | 'atualizacao' | 'edit'>('nova_versao');

  // Controle de Áudio Global e Rascunhos
  const [currentPendingQuestions, setCurrentPendingQuestions] = useState<string[]>([]);
  const [currentAudioStorage, setCurrentAudioStorage] = useState<Record<string, string>>({});
  const [pendingTranscripts, setPendingTranscripts] = useState<Record<string, string>>({});

  // Evolução Inline 
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [updateText, setUpdateText] = useState('');
  const [updateDraft, setUpdateDraft] = useState<{ text: string; audio?: string; transcript?: string; pending: boolean } | null>(null);

  // Formulário do IF-SAHS
  const [respondentName, setRespondentName] = useState('');
  const [respondentRole, setRespondentRole] = useState('');
  const [respondentRelation, setRespondentRelation] = useState('');
  const [ifSahsAnswers, setIfSahsAnswers] = useState<Record<string, string>>({});

  const handleIfSahsChange = (id: string, value: string) => {
    setIfSahsAnswers(prev => ({ ...prev, [id]: value }));
  };

  useEffect(() => {
    async function fetchStudentAndRecords() {
      if (!studentId) return;
      
      // Carregar Estudante
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
      
      if (studentError) {
        console.error('[CaseStudy] Erro ao buscar estudante:', studentError.message);
        setLoading(false);
        return;
      }
      
      if (studentData) setStudent(studentData);

      // Carregar Registros de Instrumentos (Múltiplas Tabelas para Legado e Novo Padrão)
      const { data: recordsData, error: recordsError } = await supabase
        .from('instrument_records')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      // Buscar áudios pendentes (não excluídos/mesclados) de todos os registros
      const recordIds = (recordsData || []).map(r => r.id);
      let audioFilesMap: Record<string, Record<string, InstrumentAudioFile>> = {};
      if (recordIds.length > 0) {
        const { data: audioData } = await supabase
          .from('instrument_audio_files')
          .select('*')
          .in('record_id', recordIds)
          .not('status', 'in', '("merged","deleted")');
        (audioData || []).forEach((af: InstrumentAudioFile) => {
          if (!audioFilesMap[af.record_id]) audioFilesMap[af.record_id] = {};
          audioFilesMap[af.record_id][af.field_key] = af;
        });
      }

      const { data: ipSahsLegacyData } = await supabase
        .from('ip_sahs_responses')
        .select('*')
        .eq('student_id', studentId)
        .order('completed_at', { ascending: false });

      const { data: nilsData } = await supabase
        .from('n_ils_responses')
        .select('*')
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false });

      if (recordsError) {
        console.error('[CaseStudy] Erro ao buscar registros:', recordsError.message);
      } else {
        const combinedRaw = (recordsData || []);
        
        // 1. Mapear dados para as versões dos instrumentos (IF-SAHS, ENTREVISTA e LEGACY IP-SAHS)
        const mappedRecords: InstrumentRecord[] = [
          ...combinedRaw
            .filter(r => r.type.startsWith('if_sahs') || r.type.startsWith('interview') || r.type === 'ip_sahs')
            .map(r => ({
              id: r.id,
              instrumentType: (r.type.startsWith('if_sahs') ? 'IF-SAHS' : (r.type === 'ip_sahs' ? 'IP-SAHS' : 'ENTREVISTA')) as any,
              type: ((r.type.includes('inicial') || r.type === 'interview' || r.type === 'ip_sahs') ? 'versao_inicial' : 'atualizacao') as any,
              status: r.status as DBInstrumentStatus,
              date: new Date(r.created_at).toLocaleDateString('pt-BR'),
              person: r.respondent_role || 'Visitante',
              respondentName: r.respondent_name || '',
              respondentRole: r.respondent_role || '',
              respondentRelation: (r.answers as any)?.respondentRelation || '',
               answers: (() => {
                 const raw = r.answers as any;
                 // Para IF-SAHS as respostas ficam em raw.responses; para IP-SAHS ficam direto em raw
                 if (r.type === 'ip_sahs') return raw || {};
                 const inner = raw?.responses || raw || {};
                 return typeof inner === 'string' ? JSON.parse(inner) : inner;
               })(),
              updates: r.updates as any[] || [],
              pendingQuestions: (r.answers as any)?.pendingQuestions || [],
              audioStorage: Object.fromEntries(
                Object.entries(audioFilesMap[r.id] || {})
                  .filter(([, af]) => af.audio_data)
                  .map(([key, af]) => [key, af.audio_data as string])
              ),
              transcriptStorage: Object.fromEntries(
                Object.entries(audioFilesMap[r.id] || {})
                  .filter(([, af]) => af.transcription)
                  .map(([key, af]) => [key, af.transcription as string])
              )
            })),
          ...(ipSahsLegacyData || []).map(r => ({
            id: r.id,
            instrumentType: 'IP-SAHS' as const,
            type: 'versao_inicial' as const,
            status: 'ativo' as const,
            date: new Date(r.completed_at || r.created_at).toLocaleDateString('pt-BR'),
            person: r.role || 'Professor',
            respondentName: r.respondent_name || '',
            respondentRole: r.role || '',
            respondentRelation: '',
            answers: r,
            updates: [],
            pendingQuestions: [],
            audioStorage: {},
            transcriptStorage: {}
          })),
          ...(nilsData || []).map(r => ({
            id: r.id,
            instrumentType: 'N-ILS' as const,
            type: 'versao_inicial' as const,
            status: (r.status === 'archived' ? 'arquivado' : 'ativo') as DBInstrumentStatus,
            date: new Date(r.updated_at || r.created_at).toLocaleDateString('pt-BR'),
            person: 'Estudante',
            respondentName: '',
            respondentRole: 'Estudante',
            respondentRelation: '',
            answers: r,
            updates: [],
            pendingQuestions: [],
            audioStorage: {},
            transcriptStorage: {}
          }))
        ];

        setInstrumentRecords(mappedRecords);

        // 2. Sincronizar o estado dos instrumentos no Hub principal
        setInstrumentsData(prevInstruments => 
          prevInstruments.map(inst => {
            const relevantFromUnified = combinedRaw.filter(r => {
              if (inst.id === 'IF-SAHS') return r.type.startsWith('if_sahs');
              if (inst.id === 'ENTREVISTA') return r.type.startsWith('interview');
              if (inst.id === 'IP-SAHS') return r.type === 'ip_sahs';
              return r.type.toLowerCase() === inst.id.toLowerCase();
            });

            const relevantFromLegacy = inst.id === 'IP-SAHS' ? (ipSahsLegacyData || []) : [];
            const relevantFromNils = inst.id === 'N-ILS' ? (nilsData || []) : [];
            const allRelevantCount = relevantFromUnified.length + relevantFromLegacy.length + relevantFromNils.length;

            if (allRelevantCount === 0) return inst;

            // Determinar o mais recente e o status
            const latestUnified = relevantFromUnified[0];
            const latestLegacy = relevantFromLegacy[0];
            const latestNils = relevantFromNils[0];

            const dateUnified = latestUnified ? new Date(latestUnified.created_at).getTime() : 0;
            const dateLegacy = latestLegacy ? new Date(latestLegacy.completed_at || latestLegacy.created_at).getTime() : 0;
            const dateNils = latestNils ? new Date(latestNils.updated_at || latestNils.created_at).getTime() : 0;

            let latestPerson: string;
            let latestDateStr: string;
            if (dateNils >= dateUnified && dateNils >= dateLegacy) {
              latestPerson = 'Estudante';
              latestDateStr = new Date(latestNils.updated_at || latestNils.created_at).toLocaleDateString('pt-BR');
            } else if (dateUnified >= dateLegacy) {
              latestPerson = latestUnified?.respondent_name || 'Sistema';
              latestDateStr = new Date(latestUnified?.updated_at || latestUnified?.created_at).toLocaleDateString('pt-BR');
            } else {
              latestPerson = latestLegacy?.respondent_name || 'Professor';
              latestDateStr = new Date(latestLegacy?.completed_at || latestLegacy?.created_at).toLocaleDateString('pt-BR');
            }

            return {
               ...inst,
               versions: allRelevantCount,
               status: 'completed',
               completionPercentage: 100,
               lastUpdate: latestDateStr,
               lastPerson: latestPerson
            };
          })
        );
      }

      setLoading(false);
    }
    fetchStudentAndRecords();
  }, [studentId]);

  const activeInstrument = instrumentsData.find(i => i.id === activeInstrumentId);

  const handleInstrumentAction = (action: 'fill' | 'view') => {
    if (!activeInstrument) return;
    
    // Rotas externas
    if (activeInstrument.id === 'IP-SAHS' && action === 'fill') {
      navigate(`/students/${studentId}/ip-sahs`);
      return;
    }
    
    // IP-SAHS também será gerenciado pela visualização interna no Hub
    if (activeInstrument.id === 'IP-SAHS' || activeInstrument.id === 'ENTREVISTA' || activeInstrument.id === 'IF-SAHS') {
      setView('details');
      return;
    }
    if (activeInstrument.id === 'N-ILS') {
      navigate(`/students/${studentId}/n-ils`);
      return;
    }

    if (action === 'fill') setView('filling');
    if (action === 'view') setView('versions');
  };

  // Persiste áudios pendentes na tabela dedicada (upsert por record_id + field_key)
  const upsertAudioFiles = async (recordId: string, audioStorage: Record<string, string>, transcripts: Record<string, string>) => {
    const allKeys = new Set([...Object.keys(audioStorage), ...Object.keys(transcripts)]);
    if (allKeys.size === 0) return;

    const rows = Array.from(allKeys).map(fieldKey => ({
      record_id: recordId,
      field_key: fieldKey,
      audio_data: audioStorage[fieldKey] || null,
      transcription: transcripts[fieldKey] || null,
      status: audioStorage[fieldKey] ? 'pending' : 'transcribed',
    }));

    await supabase
      .from('instrument_audio_files')
      .upsert(rows, { onConflict: 'record_id,field_key' });

    // Marcar como 'deleted' os áudios que foram aprovados (sem audio_data e sem transcrição pendente)
    const removedKeys = Object.keys(currentAudioStorage).filter(k => !audioStorage[k]);
    if (removedKeys.length > 0) {
      await supabase
        .from('instrument_audio_files')
        .update({ status: 'merged', audio_data: null, reviewed_at: new Date().toISOString() })
        .eq('record_id', recordId)
        .in('field_key', removedKeys);
    }
  };

  const handleSave = async (status: DBInstrumentStatus = 'ativo') => {
    if (!activeInstrumentId || !studentId) return;

    if (activeInstrumentId === 'IF-SAHS') {
      const answersPayload = {
        responses: ifSahsAnswers,
        respondentRelation: respondentRelation,
        pendingQuestions: currentPendingQuestions,
      };

      try {
        if (fillingType === 'edit' && selectedRecord) {
          const { error } = await supabase
            .from('instrument_records')
            .update({
              status,
              respondent_name: respondentName,
              respondent_role: respondentRole,
              answers: answersPayload,
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedRecord.id);

          if (error) throw error;

          await upsertAudioFiles(selectedRecord.id, currentAudioStorage, pendingTranscripts);

          setInstrumentRecords(prev => prev.map(r => r.id === selectedRecord.id ? {
            ...r,
            status,
            respondentName,
            respondentRole,
            respondentRelation,
            answers: ifSahsAnswers,
            pendingQuestions: currentPendingQuestions,
            audioStorage: currentAudioStorage,
            transcriptStorage: pendingTranscripts
          } : r));

          alert(status === 'rascunho' ? 'Rascunho atualizado no banco!' : 'IF-SAHS atualizado com sucesso!');
          setView('versions');
          return;
        }

        const { data, error } = await supabase
          .from('instrument_records')
          .insert({
            student_id: studentId,
            type: fillingType === 'atualizacao' ? 'if_sahs_atualizacao' : 'if_sahs_inicial',
            status,
            respondent_name: respondentName,
            respondent_role: respondentRole,
            answers: answersPayload,
            updates: []
          })
          .select()
          .single();

        if (error) throw error;

        await upsertAudioFiles(data.id, currentAudioStorage, pendingTranscripts);

        const newRecord: InstrumentRecord = {
           id: data.id,
           instrumentType: 'IF-SAHS',
           type: fillingType === 'atualizacao' ? 'atualizacao' : 'versao_inicial',
           status,
           date: new Date().toLocaleDateString('pt-BR'),
           person: respondentRole || 'Professor',
           respondentName,
           respondentRole,
           respondentRelation,
           answers: ifSahsAnswers,
           updates: [],
           pendingQuestions: currentPendingQuestions,
           audioStorage: currentAudioStorage,
           transcriptStorage: pendingTranscripts
        };

        setInstrumentRecords(prev => [newRecord, ...prev]);
        alert('IF-SAHS salvo com sucesso no banco de dados!');
        setRespondentName('');
        setRespondentRole('');
        setRespondentRelation('');
        setIfSahsAnswers({});
        setView('details');
      } catch (err: any) {
        console.error('Erro ao salvar no Supabase:', err);
        alert(`Erro ao salvar: ${err.message}`);
      }
      return;
    }
    
    // Fallback para outros instrumentos mockados por enquanto
    alert('Funcionalidade de salvamento real disponível apenas para IF-SAHS nesta versão.');
    setView('details');
  };

  const handleArchive = async () => {
    if (!activeInstrument || !activeInstrumentId) return;
    if (!confirm('Tem certeza que deseja arquivar? O instrumento sairá da visão principal.')) return;
    
    try {
      const { error } = await supabase
        .from('instruments')
        .update({ status: 'archived' })
        .eq('student_id', studentId)
        .eq('type', activeInstrumentId);

      if (error) throw error;

      alert('Instrumento arquivado com sucesso.');
      setView('hub');
    } catch (err: any) {
      console.error('Erro ao arquivar:', err);
      alert('Erro ao arquivar instrument: ' + err.message);
    }
  };

  const handleDeleteInstrument = async () => {
    if (!activeInstrument || !activeInstrumentId) return;
    if (!confirm('CUIDADO: Isso excluirá permanentemente os registros deste instrumento. Prosseguir?')) return;
    
    try {
      const { error } = await supabase
        .from('instrument_records')
        .delete()
        .eq('student_id', studentId)
        .eq('type', activeInstrumentId.startsWith('IF') ? 'if_sahs_inicial' : activeInstrumentId); 
        // Nota: para exclusão total, precisaríamos deletar todos os tipos relacionados.
        // Simplificando para o caso principal ou deletando ambos.
      
      const { error: error2 } = await supabase
        .from('instruments')
        .delete()
        .eq('student_id', studentId)
        .eq('type', activeInstrumentId);

      if (error || error2) throw (error || error2);

      alert('Dados excluídos com sucesso.');
      setView('hub');
    } catch (err: any) {
      console.error('Erro ao excluir:', err);
      alert('Erro ao excluir: ' + err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <TopBar title="Hub de Instrumentos" showBack />

      {/* Main Content Area */}      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-12">
           <StudentPageHeader 
             title={
               view === 'hub' ? 'Estudo de Caso' : 
               view === 'consolidation' ? 'Consolidação Técnica' : 
               (activeInstrument?.name || 'Estudo de Caso')
             } 
             studentId={studentId} 
             onBack={() => {
               if (view === 'hub') navigate(`/students/${studentId}`);
               else if (view === 'details') setView('hub');
               else setView('details');
             }} 
           />
        </div>

        <AnimatePresence mode="wait">
          {view === 'hub' && (
            <motion.div 
              key="hub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
               {instrumentsData.map((inst) => (
                 <motion.div 
                   key={inst.id}
                   onClick={() => { setActiveInstrumentId(inst.id); setView('details'); }}
                   whileHover={{ y: -4 }}
                   className="bg-white rounded-3xl p-5 atmospheric-shadow border border-slate-100 flex flex-col relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-all"
                 >
                    <div className="flex items-start justify-between mb-5">
                       <div className="w-12 h-12 rounded-[20px] bg-primary/5 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
                          <inst.icon size={20} strokeWidth={2} />
                       </div>
                       
                       {(() => {
                          let badgeStyle = "bg-slate-100 text-slate-400";
                          let badgeText = "Pendente";

                          // Lógica dinâmica baseada nos registros reais
                          const relevantRecords = instrumentRecords.filter(r => r.instrumentType === inst.id);
                          const hasDraft = relevantRecords.some(r => r.status === 'rascunho');
                          const isCompleted = relevantRecords.some(r => r.status === 'ativo');

                          if (hasDraft) {
                            badgeStyle = "bg-red-50 border border-red-200 text-red-600";
                            badgeText = "Rascunho Pendente";
                          } else if (isCompleted) {
                            badgeStyle = "bg-green-100 text-green-600";
                            badgeText = "Concluído";
                          }

                          return (
                            <div className={cn("px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-center", badgeStyle)}>
                              {badgeText}
                            </div>
                          );
                       })()}
                    </div>

                    <h3 className="text-lg font-black text-on-surface mb-2 leading-tight pr-4">{inst.name}</h3>
                    <p className="text-[13px] font-medium text-slate-400 mb-6 flex-1">{inst.description}</p>

                    {inst.versions > 0 && (
                       <div className="flex items-center gap-2 mb-4 text-[11px] font-bold text-slate-500">
                          <Clock size={12} className="text-primary" />
                          Última mod: {inst.lastUpdate}
                       </div>
                    )}

                    {inst.allowExternalLink && (
                      <div className="mt-auto pt-4 border-t border-slate-50">
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            const link = `${window.location.origin}/students/${studentId}/instruments/${inst.id}`;
                            await navigator.clipboard.writeText(link);
                            alert('Link copiado para a área de transferência!');
                          }}
                          className="w-full py-3 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-2"
                        >
                          <Send size={14} /> Enviar Link Externo
                        </button>
                      </div>
                    )}
                 </motion.div>
               ))}
            </motion.div>
          )}

          {view === 'details' && activeInstrument && (
            <motion.div 
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto space-y-8"
            >
               <div className="bg-white rounded-[32px] p-10 atmospheric-shadow border border-slate-100">
                  <div className="flex items-center gap-4 mb-8">
                     <History className="text-primary" size={28} />
                     <h2 className="text-2xl font-black text-on-surface">Histórico de Preenchimento</h2>
                  </div>

                  {activeInstrumentId === 'IF-SAHS' || activeInstrumentId === 'ENTREVISTA' || activeInstrumentId === 'IP-SAHS' ? (
                     (() => {
                        const records = instrumentRecords.filter(r => r.instrumentType === activeInstrumentId);
                        return records.length > 0 ? (
                       <div className="space-y-4">
                          {records.map((record) => (
                             <div key={record.id} className={cn("flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl border transition-all", record.status === 'arquivado' ? "bg-slate-50 opacity-75 grayscale border-slate-200" : "bg-slate-50/50 hover:bg-white hover:border-primary/30 border-slate-200")}>
                                <div className="flex items-center gap-6">
                                   <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex flex-col items-center justify-center font-black shadow-sm">
                                      <span className="text-xs">{record.type === 'versao_inicial' ? 'V.I.' : 'ATUAL.'}</span>
                                   </div>
                                   <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-black text-on-surface text-lg leading-none">Registrado em {record.date}</p>
                                        {record.status === 'arquivado' && <span className="bg-slate-200 text-slate-500 text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest">Arquivado</span>}
                                        {record.status === 'rascunho' && <span className="bg-orange-100 text-orange-600 text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest">Rascunho Pendente</span>}
                                        {record.type === 'atualizacao' && <span className="bg-blue-100 text-blue-600 text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest">Atualização</span>}
                                      </div>
                                      <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                                         Respondente: {record.respondentName} ({record.respondentRole}{record.answers.discipline ? ` - ${record.answers.discipline}` : ''})
                                      </p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-3">
                                   <button onClick={() => { setSelectedRecord(record); setView('versions'); }} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-2 shadow-sm">
                                      <Eye size={14} /> Visualizar
                                   </button>
                                   {record.status === 'ativo' && (
                                     <button 
                                       onClick={() => { 
                                         setSelectedRecord(record); 
                                         setUpdateText(record.updateDraft?.text || '');
                                         setUpdateDraft(record.updateDraft || null);
                                         setIsAddingUpdate(true); 
                                         setView('versions'); 
                                       }} 
                                       className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-all flex items-center gap-2 shadow-sm"
                                     >
                                        <Plus size={14} /> Atualizar
                                     </button>
                                   )}
                                   {(record.status === 'ativo' || record.status === 'rascunho') && (
                                     <button onClick={() => setInstrumentRecords(prev => prev.map(r => r.id === record.id ? { ...r, status: 'arquivado' } : r))} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all shadow-sm">
                                        Arquivar
                                     </button>
                                   )}
                                   <button onClick={async () => {
                                     if (!confirm('Excluir este registro permanentemente? Esta ação não pode ser desfeita.')) return;
                                     try {
                                       // Tenta excluir na tabela unificada primeiro
                                       const { error: e1 } = await supabase.from('instrument_records').delete().eq('id', record.id);
                                       if (e1) {
                                         // Se falhar, tenta a tabela legada do IP-SAHS
                                         const { error: e2 } = await supabase.from('ip_sahs_responses').delete().eq('id', record.id);
                                         if (e2) throw e2;
                                       }
                                       setInstrumentRecords(prev => prev.filter(r => r.id !== record.id));
                                     } catch (err: any) {
                                       alert('Erro ao excluir: ' + err.message);
                                     }
                                   }} className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                      Excluir
                                   </button>
                                </div>
                             </div>
                          ))}
                       </div>
                     ) : (
                       <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                          <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                          {activeInstrumentId === 'ENTREVISTA' && (
                            <button
                               onClick={() => navigate(`/students/${studentId}/interview`)}
                               className="px-6 py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest mt-4 shadow-lg shadow-primary/20"
                             >
                               Cadastrar Primeira Versão
                             </button>
                          )}
                          <p className="text-slate-500 font-bold text-sm mt-4">Nenhum preenchimento registrado ainda.</p>
                       </div>
                         );
                      })()
                   ) : activeInstrument.versions > 0 ? (
                    <div className="space-y-4">
                       {[...Array(activeInstrument.versions)].map((_, idx) => (
                         <div key={idx} className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-6">
                               <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl">
                                  v{activeInstrument.versions - idx}
                               </div>
                               <div>
                                  <p className="font-black text-on-surface text-lg">Registrado em {activeInstrument.lastUpdate}</p>
                                  <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Por: {activeInstrument.lastPerson}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-6">
                               <div className="text-right">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conclusão</p>
                                  <div className="flex items-center gap-2">
                                     <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${activeInstrument.completionPercentage}%` }}></div>
                                     </div>
                                     <span className="text-sm font-black text-slate-700">{activeInstrument.completionPercentage}%</span>
                                  </div>
                               </div>
                               <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
                               <button 
                                 onClick={() => handleInstrumentAction('view')}
                                 className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-primary hover:border-primary hover:bg-primary/5 transition-all tracking-widest flex items-center gap-2 shadow-sm"
                               >
                                  <Eye size={14} /> Visualizar
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                       <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                       <p className="text-slate-500 font-bold text-sm">Nenhum preenchimento registrado ainda.</p>
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeInstrumentId === 'IF-SAHS' || activeInstrumentId === 'ENTREVISTA' ? (() => {
                     const records = instrumentRecords.filter(r => r.instrumentType === activeInstrumentId);
                     const activeVersion = records.find(r => r.status === 'ativo');
                     const draftVersion = records.find(r => r.status === 'rascunho');

                     if (draftVersion) {
                        return (
                           <button 
                              onClick={() => { 
                                setSelectedRecord(draftVersion);
                                if (activeInstrumentId === 'IF-SAHS') {
                                  setRespondentName(draftVersion.respondentName);
                                  setRespondentRole(draftVersion.respondentRole);
                                  setRespondentRelation(draftVersion.respondentRelation || '');
                                  setIfSahsAnswers(draftVersion.answers);
                                  setCurrentPendingQuestions(draftVersion.pendingQuestions || []);
                                  setCurrentAudioStorage(draftVersion.audioStorage || {});
                                  setPendingTranscripts(draftVersion.transcriptStorage || {});
                                  setFillingType('edit');
                                  setView('filling'); 
                                } else {
                                  navigate(`/students/${studentId}/interview`);
                                }
                              }}
                              className="col-span-1 p-6 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all border-2 bg-orange-50 border-orange-200 text-orange-600 shadow-xl shadow-orange-500/10 hover:scale-[1.02] active:scale-95"
                           >
                              <PencilRuler size={28} />
                              <span className="font-black text-xs uppercase tracking-widest">Continuar Rascunho</span>
                              <span className="text-[9px] font-bold text-orange-500">Existem áudios pendentes</span>
                           </button>
                        );
                     }

                     return (
                        <button 
                           disabled={!!activeVersion}
                           onClick={() => { 
                             if (activeInstrumentId === 'IF-SAHS') {
                               setFillingType('nova_versao'); setRespondentName(''); setRespondentRole(''); setRespondentRelation(''); setIfSahsAnswers({}); setCurrentPendingQuestions([]); setCurrentAudioStorage({}); setPendingTranscripts({}); setView('filling'); 
                             } else {
                               navigate(`/students/${studentId}/interview`);
                             }
                           }}
                           className={cn("col-span-1 p-6 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all border-2", activeVersion ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed" : "bg-primary text-white border-transparent shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95")}
                           title={activeVersion ? "Arquive ou exclua a versão atual para iniciar uma nova" : "Criar uma nova versão a partir do zero"}
                        >
                           <Plus size={28} />
                           {activeVersion ? (
                             <>
                               <span className="font-black text-xs uppercase tracking-widest">Nova Versão</span>
                               <span className="text-[9px] font-bold text-slate-400">Arquive a atual para liberar</span>
                             </>
                           ) : (
                             <span className="font-black text-xs uppercase tracking-widest">Nova Versão</span>
                           )}
                        </button>
                     );
                  })() : (
                    <button 
                       onClick={() => handleInstrumentAction('fill')}
                       className="col-span-1 p-6 bg-primary text-white rounded-3xl flex flex-col items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                       <Plus size={28} />
                       <span className="font-black text-xs uppercase tracking-widest">
                         {activeInstrument.versions > 0 ? 'Nova Atualização / Versão' : 'Preencher Agora'}
                       </span>
                    </button>
                  )}

                  {(() => {
                    // IP-SAHS: consolidação foi movida para a Análise de Convergência.
                    if (activeInstrumentId === 'IF-SAHS' || activeInstrumentId === 'ENTREVISTA' || activeInstrumentId === 'IP-SAHS') return null;
                    const hasDrafts = instrumentRecords.some(r => r.status === 'rascunho');
                    const isConsolidationDisabled = (activeInstrument.versions === 0 && instrumentRecords.length === 0) || hasDrafts;
                    return (
                        <button 
                           onClick={() => setView('consolidation')}
                           disabled={isConsolidationDisabled}
                           className={cn(
                             "p-6 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all border-2",
                             !isConsolidationDisabled
                               ? "bg-white border-primary/20 text-primary hover:bg-primary/5 cursor-pointer" 
                               : "bg-slate-50 border-transparent text-slate-300 cursor-not-allowed"
                           )}
                        >
                           <Sparkles size={28} />
                           <span className="font-black text-xs uppercase tracking-widest">Consolidar Dados (IA)</span>
                           {hasDrafts && <span className="text-[9px] font-bold text-red-400 text-center px-4">Bloqueado: Há transcrições pendentes.</span>}
                        </button>
                    )
                  })()}

                  {activeInstrumentId !== 'IF-SAHS' && activeInstrumentId !== 'ENTREVISTA' && activeInstrumentId !== 'IP-SAHS' && (
                  <div className="flex gap-4">
                     <button
                        disabled={activeInstrument.versions === 0 && activeInstrument.status === 'pending'}
                        onClick={handleArchive}
                        className={cn(
                          "flex-1 p-6 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all",
                          (activeInstrument.versions > 0 || activeInstrument.status !== 'pending') ? "bg-white border border-slate-200 text-slate-500 hover:border-slate-400" : "bg-slate-50 text-slate-300 cursor-not-allowed"
                        )}
                     >
                        <Archive size={24} />
                        <span className="font-black text-[10px] uppercase tracking-widest">Arquivar</span>
                     </button>
                     <button 
                        disabled={activeInstrument.versions === 0 && activeInstrument.status === 'pending'}
                        onClick={handleDeleteInstrument}
                        className={cn(
                          "flex-1 p-6 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all",
                          (activeInstrument.versions > 0 || activeInstrument.status !== 'pending') ? "bg-red-50 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white" : "bg-slate-50 text-slate-300 cursor-not-allowed"
                        )}
                     >
                        <Trash2 size={24} />
                        <span className="font-black text-[10px] uppercase tracking-widest">Excluir</span>
                     </button>
                  </div>
                  )}
               </div>
            </motion.div>
          )}

          {view === 'filling' && (
            <motion.div 
               key="filling"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               className="max-w-4xl mx-auto"
             >
                <div className="bg-white rounded-[48px] p-12 atmospheric-shadow border border-slate-100">
                   <div className="flex items-center justify-between mb-12">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <FileText size={24} />
                         </div>
                         <div>
                            <h2 className="text-2xl font-black text-on-surface">Novo Preenchimento: {activeInstrument?.name}</h2>
                            <p className="text-sm font-medium text-slate-400">Esta será salva como a versão mais recente.</p>
                         </div>
                      </div>
                      <button onClick={() => setView('details')} className="text-slate-400 font-black text-[10px] uppercase hover:text-red-500 transition-all">Cancelar</button>
                   </div>
                   
                   <div className="space-y-12">
                      {activeInstrumentId === 'IF-SAHS' ? (
                        <div className="space-y-12">
                           <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10 flex items-start gap-4">
                              <TrendingUp className="text-primary mt-1" size={24} />
                              <div className="space-y-1">
                                 <p className="font-black text-on-surface uppercase tracking-tight">{fillingType === 'edit' ? 'Edição de Inventário Familiar' : fillingType === 'nova_versao' ? 'Questionário de Avaliação Familiar' : 'Atualização de Entrevista'}</p>
                                 <p className="text-sm font-medium text-slate-500">Preencha as informações detalhadas durante a entrevista com a família.</p>
                              </div>
                           </div>

                           <div className="bg-white p-8 rounded-[32px] border border-slate-100 atmospheric-shadow space-y-6">
                             <h3 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-4">
                                <UserIcon className="text-primary" /> Identificação do Respondente
                             </h3>
                             <div className="grid md:grid-cols-2 gap-6 pl-4 border-l-2 border-slate-100 py-2 ml-2">
                                <div className="space-y-4">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do responsável</label>
                                   <input value={respondentName} onChange={e => setRespondentName(e.target.value)} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-primary" placeholder="Digite o nome completo..." />
                                </div>
                                <div className="space-y-4">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vínculo</label>
                                   <div className="flex gap-2">
                                      {['Mãe', 'Pai', 'Responsável legal'].map(role => (
                                         <button key={role} onClick={() => setRespondentRole(role)} className={cn("flex-1 py-3 rounded-xl border font-bold text-xs transition-all tracking-wide", respondentRole === role ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "bg-white text-slate-500 border-slate-200 hover:border-primary/30")}>{role}</button>
                                      ))}
                                   </div>
                                </div>
                                {respondentRole === 'Responsável legal' && (
                                   <div className="space-y-4 col-span-full">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grau de parentesco (Ex: Avó, Tio...)</label>
                                      <input value={respondentRelation} onChange={e => setRespondentRelation(e.target.value)} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-primary" placeholder="Especifique o parentesco" />
                                   </div>
                                )}
                             </div>
                           </div>
                           
                           <div className="space-y-8">
                             {(selectedRecord?.instrumentType === 'IF-SAHS' ? IF_SAHS_QUESTIONS : (selectedRecord?.instrumentType === 'IP-SAHS' ? IP_SAHS_QUESTIONS : INTERVIEW_QUESTIONS)).map((section, sidx) => (
                               <div key={sidx} className="bg-white p-8 rounded-[32px] border border-slate-100 atmospheric-shadow space-y-6">
                                 <h3 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm shadow-sm shrink-0">
                                     {sidx + 1}
                                   </div>
                                   {section.section}
                                 </h3>
                                 <div className="space-y-8 pl-4 border-l-2 border-slate-100 ml-4 py-2">
                                   {section.questions.map(q => (
                                     <div key={q.id} className="space-y-4">
                                       <label className="text-[15px] font-bold text-on-surface-variant flex items-start gap-3 opacity-90">
                                         <span className="text-primary mt-1 select-none">•</span> 
                                         {q.text}
                                       </label>
                                        <MultimodalInput 
                                          value={ifSahsAnswers[q.id] || ''} 
                                          onChange={(val) => handleIfSahsChange(q.id, val)}
                                          placeholder="Descreva aqui ou utilize o áudio para transcrever a resposta..." 
                                          initialReviewPending={currentPendingQuestions.includes(q.id)}
                                          initialAudio={currentAudioStorage[q.id]}
                                          initialLiveTranscript={pendingTranscripts[q.id] || ''}
                                          onLiveTranscriptUpdate={(text) => setPendingTranscripts(prev => ({ ...prev, [q.id]: text }))}
                                          onAudioCaptured={(base64) => {
                                            if (base64) {
                                              setCurrentAudioStorage(prev => ({...prev, [q.id]: base64}));
                                            } else {
                                              setCurrentAudioStorage(prev => { const n = {...prev}; delete n[q.id]; return n; });
                                            }
                                          }}
                                          onReviewPending={(isPending) => {
                                             if (isPending) setCurrentPendingQuestions(prev => Array.from(new Set([...prev, q.id])));
                                             else setCurrentPendingQuestions(prev => prev.filter(id => id !== q.id));
                                          }}
                                       />
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             ))}
                           </div>

                           <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 italic text-sm text-slate-400 flex items-center gap-4 shadow-sm">
                              <Sparkles size={18} className="text-primary opacity-40 shrink-0" />
                              "Ao salvar, a IA consolidará estas informações no perfil psicopedagógico do estudante."
                           </div>
                        </div>
                      ) : activeInstrumentId === 'DOC-ANALISE' ? (
                         <div className="space-y-12">
                            <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10 flex items-start gap-4">
                               <FileText className="text-primary mt-1" size={24} />
                               <div className="space-y-1">
                                  <p className="font-black text-on-surface uppercase tracking-tight">Análise Automática de Documentos</p>
                                  <p className="text-sm font-medium text-slate-500">Faça o upload de laudos médicos ou relatórios. O sistema extrairá informações relevantes.</p>
                               </div>
                            </div>
                            <div className="space-y-4">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome do Documento</label>
                               <input 
                                 type="text" 
                                 value={docName}
                                 onChange={e => setDocName(e.target.value)}
                                 placeholder="Ex: Laudo Neurológico - Dr. João" 
                                 className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm text-slate-700" 
                               />
                               
                               <label className="mt-4 w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 hover:scale-[1.01] transition-all group">
                                  <input type="file" className="hidden" onChange={e => e.target.files && setSelectedFile(e.target.files[0])} />
                                  <Plus size={36} className="text-slate-300 group-hover:text-primary transition-colors mb-4" />
                                  <p className="text-base font-bold text-slate-500 group-hover:text-primary mb-1 text-center px-4">
                                     {selectedFile ? selectedFile.name : 'Clique aqui para enviar seus arquivos ou arraste-os para cá'}
                                  </p>
                                  <p className="text-xs font-medium text-slate-400/60 uppercase tracking-widest">Suporta .PDF, .DOCX, .JPG, .PNG</p>
                               </label>
                            </div>
                         </div>
                       ) : (
                        <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                           <Plus className="mx-auto text-slate-200 mb-4" size={48} />
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Módulo de preenchimento para {activeInstrument?.name}</p>
                        </div>
                      )}
                      
                      <div className="pt-10 border-t border-slate-100 flex flex-col gap-4">
                         {currentPendingQuestions.length > 0 && (
                            <div className="p-4 bg-orange-50 text-orange-600 border border-orange-200 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                               <AlertTriangle size={18} className="shrink-0" /> 
                               Você possui transcrições de áudio pendentes. Confirme-as e exclua as gravações originais para liberar o salvamento definitivo.
                            </div>
                         )}
                         {activeInstrumentId === 'DOC-ANALISE' ? (
                            <button onClick={() => handleSave('ativo')} className="w-full bg-primary text-white py-6 rounded-3xl font-black text-base uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all">
                               <Sparkles size={20} /> Salvar e Analisar
                            </button>
                         ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <button 
                                  onClick={() => handleSave('rascunho')} 
                                  className="w-full py-6 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all bg-orange-50 text-orange-600 border border-orange-200 shadow-sm hover:brightness-95 active:scale-95"
                               >
                                  Salvar Provisoriamente (Rascunho)
                               </button>
                               <button 
                                  onClick={() => handleSave('ativo')} 
                                  disabled={currentPendingQuestions.length > 0}
                                  className={cn(
                                    "w-full py-6 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                                    currentPendingQuestions.length > 0 ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-primary text-white shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95"
                                  )}
                               >
                                  {fillingType === 'edit' ? 'Salvar Edição Final' : 'Salvar Documento Ativo'}
                               </button>
                            </div>
                         )}
                      </div>
                   </div>
                </div>
             </motion.div>
          )}

          {view === 'consolidation' && (
             <motion.div 
               key="consolidation"
               initial={{ opacity: 0, x: 50 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -50 }}
               className="space-y-8"
             >
                <div className="bg-white rounded-[48px] atmospheric-shadow border border-slate-100 overflow-hidden">
                   <div className="bg-primary/5 p-10 flex items-center justify-between border-b border-primary/10">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-[28px] bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20">
                            <Sparkles size={32} />
                         </div>
                         <div>
                            <h2 className="text-3xl font-black text-on-surface tracking-tight">Consolidação: {activeInstrumentId}</h2>
                            <p className="text-on-surface-variant font-medium">Análise conjunta baseada na Política de Ed. Inclusiva.</p>
                         </div>
                      </div>
                      <button onClick={() => setView('details')} className="p-4 rounded-full hover:bg-black/5 text-slate-400">
                         <LayoutGrid size={24} />
                      </button>
                   </div>
                      
                   <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-8">
                         <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <History size={14} /> Seleção de Versões para Convergência
                         </h3>
                         <div className="space-y-4">
                            {[
                              { id: 'v1', date: '25/03/24', by: 'Prof. Maria', meta: 'Manual' },
                              { id: 'v2', date: 'Ontem', by: 'Família (Externo)', meta: 'Via Link' },
                            ].map(v => (
                              <div key={v.id} className="flex items-center gap-4 p-6 rounded-3xl border-2 border-primary/20 bg-primary/5 hover:border-primary transition-all cursor-pointer">
                                 <div className="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center shadow-md">
                                    <CheckCircle2 size={16} />
                                 </div>
                                 <div className="flex-1">
                                    <p className="font-black text-on-surface tracking-tight">Versão em {v.date}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter opacity-70">{v.by} • {v.meta}</p>
                                 </div>
                                 <FileText className="text-primary opacity-40" />
                              </div>
                            ))}
                         </div>
                         <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-200 border-dashed relative">
                            <div className="absolute -top-3 left-8 bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase">Sugestão IA</div>
                            <div className="flex items-start gap-4">
                               <Brain className="text-primary shrink-0" />
                               <div className="space-y-2">
                                  <p className="text-sm font-semibold text-on-surface-variant leading-relaxed opacity-70">
                                    "As fontes apresentam convergência em 85%. Destaque para barreiras."
                                  </p>
                               </div>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-8">
                         <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck size={14} /> Eixos de Análise Técnica
                         </h3>
                         <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                            {[
                              { id: 'I', label: 'Eixo I: Diferenciação de demandas e barreiras', desc: 'Identificação inicial das barreiras individuais.' },
                              { id: 'II', label: 'Eixo II: Análise do Contexto Escolar', desc: 'Barreiras e facilitadores.' },
                            ].map((eixo) => (
                              <div key={eixo.id} className="p-8 pb-12 bg-white rounded-3xl border border-slate-100 atmospheric-shadow relative">
                                 <div className="flex items-center gap-4 mb-4">
                                    <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg">{eixo.id}</span>
                                    <p className="font-black text-on-surface text-lg leading-tight">{eixo.label}</p>
                                 </div>
                                 <MultimodalInput 
                                    value={inputText}
                                    onChange={setInputText}
                                    placeholder={`A IA pré-análisou este campo... ${eixo.desc}`}
                                 />
                                 <div className="absolute bottom-4 right-8 flex items-center gap-3">
                                    <ShieldCheck size={14} className="text-green-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validado</span>
                                 </div>
                              </div>
                            ))}
                         </div>
                         <div className="pt-6">
                            <button onClick={() => setView('details')} className="w-full bg-[#1DB954] text-white py-7 rounded-[28px] font-black text-base uppercase tracking-[0.2em] shadow-xl shadow-green-500/20 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                               <span>Finalizar Consolidação</span>
                               <CheckCircle2 size={24} />
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>
          )}

          {view === 'versions' && (
             <motion.div 
               key="versions"
               className="max-w-4xl mx-auto space-y-8"
             >
                <div className="flex items-center justify-between bg-white p-8 rounded-[32px] atmospheric-shadow border border-slate-100">
                   <div className="flex items-center gap-4">
                      <History className="text-primary" />

                   </div>
                   <button onClick={() => setView('details')} className="text-primary font-black text-xs uppercase underline">Voltar</button>
                </div>
                
                {(activeInstrumentId === 'IF-SAHS' || activeInstrumentId === 'ENTREVISTA' || activeInstrumentId === 'IP-SAHS') && selectedRecord ? (
                   <div className="space-y-6">
                      {selectedRecord.updateDraft && selectedRecord.updateDraft.pending && (
                         <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-3xl text-[13px] font-black flex items-center gap-4 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-in fade-in slide-in-from-top-4">
                           <AlertTriangle size={24} className="shrink-0" />
                           Atenção: Este documento possui uma atualização em rascunho com revisão de áudio pendente.
                         </div>
                      )}
                      <div className="bg-white p-8 rounded-[32px] border border-slate-100 atmospheric-shadow flex justify-between items-center flex-wrap gap-4">
                          <div className="flex-1 min-w-[300px]">
                             <p className="font-black text-on-surface text-xl leading-tight">
                               Respondente: {selectedRecord.respondentName || 'Estudante'}
                             </p>
                             <p className="text-slate-500 font-bold text-sm mt-1">
                               {selectedRecord.respondentRole || 'Entrevista Direta'} {selectedRecord.respondentRelation ? `- ${selectedRecord.respondentRelation}` : ''}
                             </p>
                             <div className="flex items-center gap-4 mt-3">
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                 <Clock size={12} /> {selectedRecord.type === 'versao_inicial' ? 'Versão Inicial' : 'Atualização'} registrada em: {selectedRecord.date}
                               </p>
                               {selectedRecord.status === 'arquivado' && (
                                 <span className="bg-slate-200 text-slate-500 text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest">Arquivado</span>
                               )}
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                             {selectedRecord.status === 'ativo' && (
                               <button 
                                 onClick={() => { setIsAddingUpdate(!isAddingUpdate); if (selectedRecord.updateDraft) { setUpdateDraft(selectedRecord.updateDraft); setUpdateText(selectedRecord.updateDraft.text); } }}
                                 className={cn(
                                   "px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center gap-2",
                                   isAddingUpdate ? "bg-red-50 text-red-500 border border-red-200" : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white"
                                 )}
                               >
                                  {isAddingUpdate ? 'Cancelar' : <><Plus size={14} /> Atualizar Fatos</>}
                               </button>
                             )}

                             {selectedRecord.instrumentType === 'IF-SAHS' && (
                               <button onClick={() => { 
                                  setRespondentName(selectedRecord.respondentName);
                                  setRespondentRole(selectedRecord.respondentRole);
                                  setRespondentRelation(selectedRecord.respondentRelation || '');
                                  setIfSahsAnswers(selectedRecord.answers);
                                  setFillingType('edit');
                                  setView('filling');
                               }} className="px-4 py-3 border border-slate-200 bg-slate-50 text-slate-500 font-black text-[10px] uppercase rounded-xl tracking-widest hover:border-primary hover:text-primary hover:bg-white transition-all flex items-center gap-2">
                                  <PencilRuler size={14} /> Editar
                               </button>
                             )}

                             {selectedRecord.status === 'arquivado' && (
                                <button onClick={() => { setInstrumentRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, status: 'ativo' } : r)); alert('Registro reativado!'); setView('details'); }} className="px-6 py-3 bg-primary text-white font-black text-[10px] uppercase rounded-xl tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">Reativar</button>
                             )}
                             
                             <button onClick={async () => {
                                 if (!confirm('Excluir este registro permanentemente? Esta ação não pode ser desfeita.')) return;
                                 try {
                                   const { error: e1 } = await supabase.from('instrument_records').delete().eq('id', selectedRecord.id);
                                   if (e1) {
                                     const { error: e2 } = await supabase.from('ip_sahs_responses').delete().eq('id', selectedRecord.id);
                                     if (e2) throw e2;
                                   }
                                   setInstrumentRecords(prev => prev.filter(r => r.id !== selectedRecord.id));
                                   setView('details');
                                 } catch (err: any) {
                                   alert('Erro ao excluir: ' + err.message);
                                 }
                              }} className="p-3 text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 size={18} />
                             </button>
                          </div>
                       </div>
                      
                      {((selectedRecord.instrumentType === 'IF-SAHS' ? IF_SAHS_QUESTIONS : (selectedRecord.instrumentType === 'IP-SAHS' ? IP_SAHS_QUESTIONS : INTERVIEW_QUESTIONS))).map(sec => (
                         <div key={sec.section} className="bg-white p-10 rounded-[32px] border border-slate-100 atmospheric-shadow space-y-8">
                            <h4 className="font-black text-primary uppercase tracking-tight">{sec.section}</h4>
                            <div className="space-y-6 pl-2 border-l-2 border-slate-100 ml-2">
                               {sec.questions.map(q => (
                                  <div key={q.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                     <p className="font-bold text-slate-700 text-sm mb-4 leading-relaxed">{q.text}</p>
                                     <div className="bg-white p-4 rounded-xl border border-slate-100">
                                         <AnswerRenderer value={(selectedRecord.answers as any)[q.id]} />
                                      </div>
                                  </div>
                               ))}
                            </div>
                         </div>
                      ))}

                      {selectedRecord.updates && selectedRecord.updates.length > 0 && (
                         <>
                            <hr className="my-8 border-slate-200" />
                            <div className="space-y-6">
                               <h4 className="font-black text-on-surface text-lg flex items-center gap-2"><History className="text-primary" /> Evolução do Caso</h4>
                               <div className="space-y-4">
                                  {selectedRecord.updates.map((upd, i) => (
                                     <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 w-full space-y-4 atmospheric-shadow">
                                        <div className="flex items-center justify-between">
                                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><UserIcon size={12}/>{upd.person}</span>
                                           <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={12}/>{upd.date}</span>
                                        </div>
                                        <p className="text-slate-700 font-medium whitespace-pre-wrap">{upd.text}</p>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         </>
                      )}

                      {selectedRecord.status === 'ativo' && (
                         <div className="pt-8">
                            {isAddingUpdate ? (
                               <div className="bg-white p-6 rounded-[32px] border border-slate-200 atmospheric-shadow space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                  <h4 className="font-black text-slate-700 text-sm tracking-widest uppercase flex items-center gap-2 ml-2">
                                     <TrendingUp size={16} className="text-primary" /> Nova Evolução
                                  </h4>
                                  <MultimodalInput 
                                     value={updateText}
                                     onChange={(val) => {
                                        setUpdateText(val);
                                        setUpdateDraft(prev => prev ? { ...prev, text: val } : { text: val, pending: false });
                                     }}
                                     placeholder="Descreva aqui o novo episódio, observação ou alteração no contexto familiar..."
                                     initialAudio={updateDraft?.audio}
                                     initialLiveTranscript={updateDraft?.transcript}
                                     initialReviewPending={updateDraft?.pending}
                                     onReviewPending={(isPending) => setUpdateDraft(prev => prev ? { ...prev, pending: isPending } : { text: updateText, pending: isPending })}
                                     onLiveTranscriptUpdate={(text) => setUpdateDraft(prev => prev ? { ...prev, transcript: text } : { text: updateText, transcript: text, pending: false })}
                                     onAudioCaptured={(base64) => setUpdateDraft(prev => prev ? { ...prev, audio: base64 || undefined } : { text: updateText, audio: base64 || undefined, pending: false })}
                                  />
                                  <div className="flex items-center gap-3 justify-end pt-2 flex-wrap">
                                     <button onClick={() => { setIsAddingUpdate(false); setUpdateText(''); setUpdateDraft(null); }} className="px-5 py-2.5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-all">Cancelar</button>
                                     <button 
                                        onClick={() => {
                                           const draft = { text: updateText, audio: updateDraft?.audio, transcript: updateDraft?.transcript, pending: updateDraft?.pending || false };
                                           setInstrumentRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, updateDraft: draft } : r));
                                           setSelectedRecord(prev => prev ? { ...prev, updateDraft: draft } : null);
                                           setIsAddingUpdate(false);
                                        }} 
                                        className="px-6 py-3 bg-orange-50 text-orange-600 border border-orange-200 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-sm hover:brightness-95"
                                     >
                                        Salvar Rascunho
                                     </button>
                                     <button 
                                        onClick={() => {
                                         if (!updateText.trim()) return;
                                         const novaEvo = { date: new Date().toLocaleDateString('pt-BR'), person: 'Especialista', text: updateText };
                                         setInstrumentRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, updates: [...(r.updates || []), novaEvo], updateDraft: undefined } : r));
                                         setSelectedRecord(prev => prev ? { ...prev, updates: [...(prev.updates || []), novaEvo], updateDraft: undefined } : null);
                                         
                                         console.log('[AI Gateway] Enviando nova evolução para análise automática...', novaEvo);
                                         alert('Atualização salva e enviada para análise da IA!');
                                         
                                         setUpdateText('');
                                         setUpdateDraft(null);
                                         setIsAddingUpdate(false);
                                      }} className={cn("px-6 py-3 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md", updateDraft?.pending ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" : "bg-primary text-white shadow-primary/20 hover:bg-primary/90")}>Finalizar Atualização</button>
                                  </div>
                               </div>
                            ) : (
                               <button 
                                 onClick={() => { setIsAddingUpdate(true); if (selectedRecord.updateDraft) { setUpdateDraft(selectedRecord.updateDraft); setUpdateText(selectedRecord.updateDraft.text); } }} 
                                 className="w-full bg-slate-50 text-slate-500 py-6 rounded-3xl font-black text-xs uppercase tracking-widest border-2 border-slate-200 border-dashed hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-3"
                               >
                                  <Plus size={20} /> {selectedRecord.updateDraft ? 'Continuar Rascunho de Atualização' : 'Adicionar Atualização aos Fatos'}
                               </button>
                            )}
                         </div>
                      )}
                   </div>
                ) : (
                  <div className="grid gap-4">
                    {[1, 2].map(v => (
                      <div key={v} className="bg-white p-8 rounded-[32px] border border-slate-100 atmospheric-shadow flex items-center justify-between group hover:border-primary transition-all">
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-xl">
                               {v}
                            </div>
                            <div>
                               <p className="font-black text-on-surface text-lg">Versão salva em {v === 1 ? '25/03/2024' : 'Ontem'}</p>
                               <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Responsável: Professor Maria Silva</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => alert(`Conteúdo: ${inputText || 'Sem dados textuais'}`)}
                           className="px-6 py-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:bg-primary/10 hover:text-primary transition-all tracking-widest"
                         >
                            Visualizar Dados
                         </button>
                      </div>
                    ))}
                  </div>
                )}
             </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
