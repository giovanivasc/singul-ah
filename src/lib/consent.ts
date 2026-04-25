/**
 * Helpers de consentimento (LGPD Art. 8º, 9º, 14; ECA Digital Art. 7º, 18).
 *
 * Centraliza checagem, registro e revogação de consents, usado por:
 *  - ConsentGate (middleware antes de exibir coleta)
 *  - páginas de aceite (TermoConsentimento, Assentimento, Encarregado)
 *  - Portal "Meus Dados" (revogação)
 */

import { supabase } from './supabase';

export type ConsentType =
  | 'tcle_responsavel'
  | 'assentimento_menor'
  | 'tcle_maior'
  | 'termo_docente'
  | 'termo_pesquisa';

export interface ConsentRecord {
  id: string;
  student_id: string | null;
  titular_id: string | null;
  responsavel_id: string | null;
  tipo: ConsentType;
  versao_termo: string;
  hash_termo: string;
  aceito_em: string;
  revogado_em: string | null;
  escopo: Record<string, unknown>;
}

export interface RegisterConsentInput {
  studentId?: string | null;
  titularId?: string | null;
  responsavelId?: string | null;
  tipo: ConsentType;
  versao: string;
  textoAceito: string;
  canal?: 'web' | 'presencial' | 'impresso_digitalizado';
  escopo?: Record<string, unknown>;
}

/**
 * Hash SHA-256 em hex (Web Crypto API — funciona no browser moderno).
 * Garante imutabilidade do texto aceito.
 */
export async function sha256(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Registra um novo consent. Retorna o registro inserido ou lança.
 */
export async function registerConsent(input: RegisterConsentInput): Promise<ConsentRecord> {
  const hash = await sha256(input.textoAceito);
  const { data, error } = await supabase
    .from('consents')
    .insert({
      student_id: input.studentId ?? null,
      titular_id: input.titularId ?? null,
      responsavel_id: input.responsavelId ?? null,
      tipo: input.tipo,
      versao_termo: input.versao,
      hash_termo: hash,
      canal: input.canal ?? 'web',
      escopo: input.escopo ?? {},
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ConsentRecord;
}

/**
 * Busca o consent ativo mais recente de um tipo. `null` = nunca aceito ou revogado.
 */
export async function getActiveConsent(params: {
  tipo: ConsentType;
  studentId?: string;
  titularId?: string;
  responsavelId?: string;
}): Promise<ConsentRecord | null> {
  let query = supabase
    .from('consents')
    .select('*')
    .eq('tipo', params.tipo)
    .is('revogado_em', null)
    .order('aceito_em', { ascending: false })
    .limit(1);

  if (params.studentId) query = query.eq('student_id', params.studentId);
  if (params.titularId) query = query.eq('titular_id', params.titularId);
  if (params.responsavelId) query = query.eq('responsavel_id', params.responsavelId);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return (data as ConsentRecord | null) ?? null;
}

/**
 * Revoga um consent existente. Registra motivo opcional (Art. 8º §5º LGPD).
 * A revogação NÃO apaga os dados já tratados sob o consent — isso é pedido
 * separadamente via eliminação (Art. 18 V).
 */
export async function revokeConsent(consentId: string, motivo?: string): Promise<void> {
  const { error } = await supabase
    .from('consents')
    .update({
      revogado_em: new Date().toISOString(),
      motivo_revogacao: motivo ?? null,
    })
    .eq('id', consentId);
  if (error) throw error;
}

/**
 * Lista todos os consents relacionados a um aluno/titular — usado pelo
 * Portal "Meus Dados" (Art. 18 II — direito de acesso).
 */
export async function listConsents(params: {
  studentId?: string;
  titularId?: string;
}): Promise<ConsentRecord[]> {
  let query = supabase.from('consents').select('*').order('aceito_em', { ascending: false });
  if (params.studentId) query = query.eq('student_id', params.studentId);
  if (params.titularId) query = query.eq('titular_id', params.titularId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ConsentRecord[];
}
