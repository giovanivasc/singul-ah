import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── IP-SAHS: Agregação Multi-respondente para IA ────────────────────────────

export type IPSahsRecord = {
  respondentName: string;
  respondentRole: string;
  answers: Record<string, any>;
};

export type AggregatedIPSahsData = {
  [question: string]: Array<{
    respondente: string;
    cargo: string;
    resposta: string | Record<string, number>;
  }>;
};

/**
 * Agrega múltiplos preenchimentos do IP-SAHS (de diferentes professores)
 * em um único objeto estruturado para análise da IA.
 *
 * - Respostas de texto: agrupadas por respondente.
 * - Respostas de array (checklist): somadas como ocorrências { item: count }.
 * - Respostas de objeto (ex: behavioral_profile): serializado como JSON.
 */
export function aggregateIPSahsData(records: IPSahsRecord[]): AggregatedIPSahsData {
  const result: AggregatedIPSahsData = {};

  for (const record of records) {
    const { respondentName, respondentRole, answers } = record;

    for (const [key, value] of Object.entries(answers)) {
      if (value === null || value === undefined || value === '') continue;

      if (!result[key]) result[key] = [];

      if (Array.isArray(value)) {
        // Checklist: conta ocorrências
        const existing = result[key].find(
          (r) => typeof r.resposta === 'object' && !Array.isArray(r.resposta) && r.respondente === '__aggregate__'
        );
        const counts: Record<string, number> = (existing?.resposta as Record<string, number>) ?? {};
        for (const item of value) {
          counts[item] = (counts[item] ?? 0) + 1;
        }
        if (existing) {
          existing.resposta = counts;
        } else {
          result[key].push({ respondente: '__aggregate__', cargo: 'Contagem Total', resposta: counts });
        }
      } else if (typeof value === 'object') {
        // Objeto (ex: behavioral_profile): serializar como string legível
        result[key].push({
          respondente: respondentName,
          cargo: respondentRole,
          resposta: JSON.stringify(value, null, 2)
        });
      } else {
        // Texto simples
        result[key].push({
          respondente: respondentName,
          cargo: respondentRole,
          resposta: String(value)
        });
      }
    }
  }

  return result;
}

/**
 * Gera o prompt final para a IA com base nos dados agregados do IP-SAHS.
 */
export function buildIPSahsAIPrompt(studentName: string, aggregated: AggregatedIPSahsData): string {
  return `Você é um especialista em educação inclusiva e altas habilidades/superdotação.
Analise os dados abaixo coletados de múltiplos professores sobre o aluno "${studentName}" através do Inventário Pedagógico IP-SAHS.

DADOS AGREGADOS (JSON estruturado por questão):
${JSON.stringify(aggregated, null, 2)}

Com base nesses dados, gere uma síntese pedagógica estruturada com:
1. **Convergências**: pontos em que os professores concordam sobre o perfil do aluno.
2. **Divergências**: visões distintas entre professores sobre comportamento ou necessidades.
3. **Padrões de Destaque**: comportamentos ou habilidades citados com maior frequência.
4. **Recomendações Pedagógicas**: sugestões de suplementação baseadas nas necessidades identificadas.

Responda em português do Brasil, com linguagem técnica e acessível para educadores.`;
}
