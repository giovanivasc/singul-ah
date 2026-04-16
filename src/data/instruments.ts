import { 
  Users, Activity, MessageSquare, Brain, FileText, LucideIcon 
} from 'lucide-react';

export interface InstrumentStatus {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  versions: number;
  lastUpdate?: string;
  lastPerson?: string;
  completionPercentage?: number;
  status: 'pending' | 'completed' | 'ongoing' | 'draft' | 'archived';
  allowExternalLink?: boolean;
}

export const instruments: InstrumentStatus[] = [
  { 
    id: 'IF-SAHS', 
    name: 'Inventário Familiar para Suplementação (IF-SAHS)', 
    description: 'Coleta de dados biopsicossociais com a família.', 
    icon: Users,
    versions: 1,
    lastUpdate: '25/03/2024',
    lastPerson: 'Prof. Maria Silva',
    completionPercentage: 100,
    status: 'completed',
    allowExternalLink: true
  },
  { 
    id: 'IP-SAHS', 
    name: 'Inventário Pedagógico (IP-SAHS)', 
    description: 'Observação pedagógica e funcional do professor.', 
    icon: Activity,
    versions: 0,
    completionPercentage: 0,
    status: 'pending',
    allowExternalLink: false
  },
  { 
    id: 'ENTREVISTA', 
    name: 'Entrevista com Estudante', 
    description: 'Escuta especializada das demandas do estudante.', 
    icon: MessageSquare,
    versions: 0,
    completionPercentage: 0,
    status: 'pending',
    allowExternalLink: false
  },
  { 
    id: 'N-ILS', 
    name: 'N-ILS (Estilos de Aprendizagem)', 
    description: 'Mapeamento de estilos e habilidades de aprendizagem.', 
    icon: Brain,
    versions: 2,
    lastUpdate: 'Ontem',
    lastPerson: 'Sistema (IA)',
    completionPercentage: 100,
    status: 'completed',
    allowExternalLink: true
  },
  {
    id: 'DOC-ANALISE',
    name: 'Análise de Pareceres (IA)',
    description: 'Envie laudos e relatórios para processamento da inteligência artificial.',
    icon: FileText,
    versions: 0,
    completionPercentage: 0,
    status: 'pending',
    allowExternalLink: false
  }
];
