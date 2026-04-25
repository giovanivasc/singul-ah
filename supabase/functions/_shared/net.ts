// Utilidades de rede compartilhadas entre Edge Functions.

/**
 * Extrai o primeiro IP de um header `x-forwarded-for` (que pode conter
 * múltiplos endereços separados por vírgula quando a requisição passa por
 * proxies/CDNs). Retorna `null` quando o header está ausente ou inválido.
 *
 * Importante para inserção em colunas do tipo `inet` no Postgres, que não
 * aceitam listas.
 */
export function firstForwardedIp(xff: string | null | undefined): string | null {
  if (!xff || typeof xff !== 'string') return null;
  const first = xff.split(',')[0]?.trim();
  return first && first.length > 0 ? first : null;
}

/**
 * Mascara um endereço de e-mail mantendo apenas a primeira letra do local-part
 * e o domínio completo. Ex.: `joao.silva@exemplo.com` → `j**********@exemplo.com`.
 *
 * Usado para confirmar ao usuário que o e-mail certo recebeu um código sem
 * vazar o endereço completo a quem detém apenas o token público.
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return '***';
  const [local, domain] = email.split('@');
  if (!domain || !local) return '***';
  const visible = local.slice(0, 1);
  const stars = '*'.repeat(Math.max(1, local.length - 1));
  return `${visible}${stars}@${domain}`;
}

/**
 * Gera um token público URL-safe com `bytes` bytes de entropia.
 * Usado para tokens de verificação parental e similares.
 */
export function generateUrlSafeToken(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}
