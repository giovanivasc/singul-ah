// Edge Function: parental-verify-send
// ----------------------------------------------------------------------------
// Gera um token público de verificação para um `parental_links`, armazena o
// hash, e dispara e-mail ao responsável com link de confirmação.
//
// Base legal: LGPD Art. 14 §5º (esforços razoáveis para verificar
// consentimento parental); ECA Digital Art. 14 (verificação ativa).
//
// Request (POST JSON):
//   { "parentalLinkId": "<uuid>" }
//
// Response 200: { ok: true, maskedRecipient: "j***@gmail.com" }
// Response 4xx: { ok: false, error: "..." }
// ----------------------------------------------------------------------------

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { preflight, jsonResponse } from '../_shared/cors.ts';
import { sha256Hex } from '../_shared/hash.ts';
import { maskEmail, generateUrlSafeToken } from '../_shared/net.ts';

const TOKEN_TTL_DAYS = 7;
const RESEND_COOLDOWN_SECONDS = 60;

async function sendEmail(to: string, link: string, studentName: string): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('OTP_FROM_EMAIL') ?? 'Singul-AH <no-reply@singul-ah.app>';
  if (!apiKey) {
    console.log(`[parental-verify-send DEV] to=${to} link=${link}`);
    return;
  }
  const body = {
    from,
    to: [to],
    subject: 'Singul-AH — Confirmação de vínculo parental',
    text:
      `Olá!\n\n` +
      `Você foi indicado(a) como responsável legal de ${studentName} no sistema Singul-AH, ` +
      `plataforma de apoio à elaboração de Plano Educacional Individualizado (PEI) usada por uma escola pública.\n\n` +
      `Para confirmar o vínculo e habilitar a supervisão parental dos dados de ${studentName} no sistema, ` +
      `acesse o link abaixo (validade: ${TOKEN_TTL_DAYS} dias):\n\n` +
      `${link}\n\n` +
      `Se você não reconhece esta solicitação, ignore este e-mail. ` +
      `Nenhum dado pessoal será compartilhado sem sua confirmação expressa.\n\n` +
      `Em caso de dúvida, entre em contato com o encarregado pelo tratamento de dados:\n` +
      `Prof. Giovani Vasconcelos da Silva e Silva — giovani.silva@castanhal.ufpa.br\n\n` +
      `— Singul-AH (LGPD Art. 14 §5º; ECA Digital Art. 14)`,
  };
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    throw new Error(`Falha ao enviar e-mail: ${resp.status} ${await resp.text()}`);
  }
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return jsonResponse({ ok: false, error: 'Método não permitido' }, 405);

  try {
    const { parentalLinkId } = await req.json();
    if (!parentalLinkId || typeof parentalLinkId !== 'string') {
      return jsonResponse({ ok: false, error: 'parentalLinkId ausente' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const publicAppUrl =
      Deno.env.get('PUBLIC_APP_URL') ?? 'http://localhost:5173';

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: pl, error: selErr } = await admin
      .from('parental_links')
      .select(
        'id, student_id, responsavel_email, responsavel_nome, verificado, revoked_at, verification_sent_at',
      )
      .eq('id', parentalLinkId)
      .maybeSingle();

    if (selErr) throw selErr;
    if (!pl) return jsonResponse({ ok: false, error: 'Vínculo não encontrado' }, 404);
    if (pl.revoked_at) return jsonResponse({ ok: false, error: 'Vínculo revogado' }, 410);
    if (pl.verificado) return jsonResponse({ ok: false, error: 'Vínculo já verificado' }, 409);
    if (!pl.responsavel_email)
      return jsonResponse({ ok: false, error: 'Vínculo sem e-mail cadastrado' }, 422);

    if (pl.verification_sent_at) {
      const diffSec = (Date.now() - new Date(pl.verification_sent_at).getTime()) / 1000;
      if (diffSec < RESEND_COOLDOWN_SECONDS) {
        return jsonResponse(
          {
            ok: false,
            error: `Aguarde ${Math.ceil(RESEND_COOLDOWN_SECONDS - diffSec)}s para reenviar.`,
          },
          429,
        );
      }
    }

    // Busca nome do estudante (apenas para o corpo do e-mail)
    const { data: student } = await admin
      .from('students')
      .select('full_name')
      .eq('id', pl.student_id)
      .maybeSingle();
    const studentName = student?.full_name ?? 'um(a) estudante';

    const token = generateUrlSafeToken(32);
    const tokenHash = await sha256Hex(token);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 86_400_000).toISOString();

    const { error: upErr } = await admin
      .from('parental_links')
      .update({
        verification_token_hash: tokenHash,
        verification_sent_at: new Date().toISOString(),
        verification_expires_at: expiresAt,
      })
      .eq('id', pl.id);
    if (upErr) throw upErr;

    const link = `${publicAppUrl.replace(/\/$/, '')}/responsavel/confirmar/${token}`;
    await sendEmail(pl.responsavel_email, link, studentName);

    return jsonResponse({ ok: true, maskedRecipient: maskEmail(pl.responsavel_email) });
  } catch (err: any) {
    console.error('[parental-verify-send] erro:', err?.message ?? err);
    return jsonResponse({ ok: false, error: 'Erro interno' }, 500);
  }
});
