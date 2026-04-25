/**
 * Pseudonimização de dados antes do envio à IA (LGPD Art. 13 §4º; ECA Digital Art. 22).
 *
 * Princípio: nenhum identificador direto (nome, e-mail, matrícula, telefone, escola,
 * cidade) deve sair do nosso perímetro em direção a serviços de IA terceirizados.
 * O professor edita o resultado que volta, e o mapping fica somente em memória.
 */

export interface PseudonymizeContext {
  studentName?: string | null;
  studentNickname?: string | null;
  teacherName?: string | null;
  familyMembers?: string[];
  schoolName?: string | null;
  city?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface PseudonymizeResult {
  /** Texto com substitutos aplicados — seguro para envio à IA. */
  text: string;
  /** Mapa reverso: token → valor original. Fica apenas em memória no cliente. */
  mapping: Record<string, string>;
}

/** Escapa metacaracteres para uso em RegExp. */
function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function safeReplace(text: string, needle: string, token: string): string {
  if (!needle || needle.length < 2) return text;
  return text.replace(new RegExp(escapeRegex(needle), 'gi'), token);
}

/**
 * Substitui identificadores diretos por tokens estáveis dentro do payload.
 */
export function pseudonymize(text: string, ctx: PseudonymizeContext): PseudonymizeResult {
  let out = text;
  const mapping: Record<string, string> = {};

  const register = (original: string | null | undefined, token: string) => {
    if (!original) return;
    out = safeReplace(out, original, token);
    mapping[token] = original;
  };

  register(ctx.studentName, '[ESTUDANTE]');
  register(ctx.studentNickname, '[ESTUDANTE]');
  register(ctx.teacherName, '[DOCENTE]');
  register(ctx.schoolName, '[ESCOLA]');
  register(ctx.city, '[CIDADE]');
  register(ctx.email, '[EMAIL]');
  register(ctx.phone, '[TELEFONE]');

  (ctx.familyMembers ?? []).forEach((name, i) => {
    register(name, `[FAMILIAR_${i + 1}]`);
  });

  // Padrões genéricos (e-mails, telefones, CPF) como segunda linha de defesa.
  out = out.replace(/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[EMAIL]');
  out = out.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF]');
  out = out.replace(/\(?\b\d{2}\)?\s?9?\d{4}-?\d{4}\b/g, '[TELEFONE]');

  return { text: out, mapping };
}

/**
 * Re-aplica o mapping na resposta da IA (opcional — só quando o texto volta
 * para exibição ao professor).
 */
export function repersonalize(text: string, mapping: Record<string, string>): string {
  let out = text;
  for (const [token, original] of Object.entries(mapping)) {
    out = out.replace(new RegExp(escapeRegex(token), 'g'), original);
  }
  return out;
}
