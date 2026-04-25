// Edge Function: otp-send
// ----------------------------------------------------------------------------
// Gera um OTP de 6 dígitos para um family_token, armazena apenas o hash
// na coluna `otp_hash`, registra `otp_expires_at` e `otp_sent_at`, e dispara
// o envio por e-mail (Resend / fallback para log no ambiente dev).
//
// Base legal: LGPD Art. 14 §5º (esforços razoáveis para verificar o
// consentimento do responsável); ECA Digital Art. 17 (supervisão parental).
//
// Request (POST JSON):
//   { "token": "<token_publico>" }
//
// Response 200: { ok: true, maskedRecipient: "j***@gmail.com" }
// Response 4xx: { ok: false, error: "..." }
// ----------------------------------------------------------------------------

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { preflight, jsonResponse } from '../_shared/cors.ts';
import { sha256Hex, generateOtp } from '../_shared/hash.ts';
import { maskEmail } from '../_shared/net.ts';

const OTP_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_SENDS_PER_TOKEN_PER_DAY = 5;

async function sendEmail(to: string, code: string): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('OTP_FROM_EMAIL') ?? 'Singul-AH <no-reply@singul-ah.app>';
  if (!apiKey) {
    // Em dev, apenas loga; em prod, a ausência de RESEND_API_KEY deve falhar alto.
    console.log(`[otp-send DEV] to=${to} code=${code}`);
    return;
  }
  const body = {
    from,
    to: [to],
    subject: 'Singul-AH — Código de verificação',
    text:
      `Olá!\n\nSeu código de verificação é: ${code}\n\n` +
      `Este código expira em ${OTP_TTL_MINUTES} minutos. Se você não solicitou, ignore este e-mail.\n\n` +
      `Singul-AH — Portal de Educação Individualizada`,
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
    const { token } = await req.json();
    if (!token || typeof token !== 'string') {
      return jsonResponse({ ok: false, error: 'Token ausente' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const tokenHash = await sha256Hex(token);
    const { data: ft, error: selErr } = await admin
      .from('family_tokens')
      .select('id, recipient_email, otp_sent_at, otp_attempts, expires_at, revoked_at, used_at')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (selErr) throw selErr;
    if (!ft) return jsonResponse({ ok: false, error: 'Token inválido' }, 404);
    if (ft.revoked_at) return jsonResponse({ ok: false, error: 'Token revogado' }, 410);
    if (ft.used_at) return jsonResponse({ ok: false, error: 'Token já utilizado' }, 410);
    if (new Date(ft.expires_at).getTime() < Date.now())
      return jsonResponse({ ok: false, error: 'Token expirado' }, 410);
    if (!ft.recipient_email)
      return jsonResponse({ ok: false, error: 'Token sem destinatário cadastrado' }, 422);

    // Cooldown de reenvio
    if (ft.otp_sent_at) {
      const diffSec = (Date.now() - new Date(ft.otp_sent_at).getTime()) / 1000;
      if (diffSec < RESEND_COOLDOWN_SECONDS) {
        return jsonResponse(
          { ok: false, error: `Aguarde ${Math.ceil(RESEND_COOLDOWN_SECONDS - diffSec)}s para reenviar.` },
          429,
        );
      }
    }

    // Rate-limit diário por token
    if ((ft.otp_attempts ?? 0) >= MAX_SENDS_PER_TOKEN_PER_DAY * 3) {
      return jsonResponse({ ok: false, error: 'Limite de tentativas excedido.' }, 429);
    }

    const code = generateOtp();
    const codeHash = await sha256Hex(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString();

    const { error: upErr } = await admin
      .from('family_tokens')
      .update({
        otp_hash: codeHash,
        otp_expires_at: expiresAt,
        otp_sent_at: new Date().toISOString(),
      })
      .eq('id', ft.id);
    if (upErr) throw upErr;

    await sendEmail(ft.recipient_email, code);

    return jsonResponse({ ok: true, maskedRecipient: maskEmail(ft.recipient_email) });
  } catch (err: any) {
    console.error('[otp-send] erro:', err?.message ?? err);
    return jsonResponse({ ok: false, error: 'Erro interno' }, 500);
  }
});
