export type StudentStatus = 'coleta_pendente' | 'coleta_concluida' | 'pei_em_andamento' | 'pei_ativo';

export interface Student {
  id: string;
  teacher_id: string;
  full_name: string;
  date_of_birth: string; // formato YYYY-MM-DD
  school: string;
  grade: string;
  specialty?: string; // Opcional
  avatar_url?: string; // Opcional
  status: StudentStatus;
  created_at: string;
  updated_at: string;
}

// Interface auxiliar para quando formos CADASTRAR um novo aluno (sem o ID ainda)
export type StudentInsert = Omit<Student, 'id' | 'created_at' | 'updated_at' | 'teacher_id'>;
