export type StudentStatus = 'coleta_pendente' | 'coleta_concluida' | 'pei_em_andamento' | 'pei_ativo';

export interface Student {
  id: string;
  teacher_id: string;
  full_name: string;
  date_of_birth: string; // formato YYYY-MM-DD
  school: string;
  grade: string;
  gender?: string;
  exceptionalities?: string[];
  guardian_name?: string;
  phone?: string;
  class_name?: string;
  shift?: string;
  regent_teacher?: string;
  aee_teacher?: string;
  specialty?: string;
  avatar_url?: string;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
}

// Interface auxiliar para quando formos CADASTRAR um novo aluno (sem o ID ainda)
export type StudentInsert = Omit<Student, 'id' | 'created_at' | 'updated_at' | 'teacher_id'>;

// 1. Tipos Base e Enums
export type InstrumentStatus = 'ativo' | 'arquivado' | 'rascunho';
export type HighlightCategory = 'demandas' | 'contexto' | 'potencialidades' | 'duvida';
export type HighlightStatus = 'ativo' | 'armazenado';

// 2. Estrutura de Itens do Mapeamento
export interface AxisItem {
  id: string;
  text: string;
  selected: boolean;
  isManual: boolean;
  isNew?: boolean;
}

// 3. Tabela de Instrumentos (Coleta)
export interface InstrumentRecord {
  id: string;
  student_id: string;
  type: string; // ex: 'IF-SAHS', 'IP-SAHS'
  status: InstrumentStatus;
  respondent_name?: string;
  respondent_role?: string;
  answers: Record<string, string>; // JSONB
  updates: Array<{
    date: string;
    person: string;
    text: string;
    audio?: string;
  }>; // JSONB (Evolução do Caso)
  created_at?: string;
  updated_at?: string;
}

export type AudioFileStatus = 'pending' | 'transcribed' | 'reviewed' | 'merged' | 'deleted';

// 3b. Tabela de Áudios dos Instrumentos
export interface InstrumentAudioFile {
  id: string;
  record_id: string;
  field_key: string;
  audio_data: string | null;     // base64 (nulo após exclusão)
  transcription: string | null;
  status: AudioFileStatus;
  created_at?: string;
  transcribed_at?: string | null;
  reviewed_at?: string | null;
  deleted_at?: string | null;
}

// 4. Tabela de Fichamentos (Marcadores)
export interface HighlightSnippet {
  id: string;
  student_id: string;
  instrument_source: string; // Substitui o 'source' antigo
  text: string;
  category: HighlightCategory;
  status: HighlightStatus;
  created_at?: string;
}

// 5. Tabela de Mapeamento (Convergência IA)
export interface ConvergenceRecord {
  id: string;
  student_id: string;
  axis_data: Record<'I' | 'II' | 'III' | 'IV', AxisItem[]>; // JSONB
  last_updated?: string;
  created_at?: string;
}
