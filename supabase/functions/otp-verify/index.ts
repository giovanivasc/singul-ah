// Edge Function: otp-verify
// ----------------------------------------------------------------------------
// Verifica um OTP previamente gerado por `otp-send`. Em caso de sucesso,
// marca `otp_verified_at` e retorna um JWT efêmero assinado (HS256) que o
// cliente usa para autorizar o envio das respostas da coleta familiar.
//
// Request (POST JSON):
//   { "token": "<token_publico>", "code": "123456" }
//
// Response 200: { ok: true, sessionJwt: "...", studentId: "...", instrument: "if_sahs" }
// Response 4xx: { ok: false, error: "..." }
// ----------------------------------------------------------------------------

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { preflight, jsonResponse } from '../_shared/cors.ts';
import { sha256Hex, constantTimeEquals } from '../_shared/hash.ts';
import { firstForwardedIp } from '../_shared/net.ts';

const MAX_VERIFY_ATTEMPTS = 5;
const SESSION_TTL_MINUTES = 45;

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

async function signJwt(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const enc = new TextEncoder();
  const h = base64url(enc.encode(JSON.stringify(header)));
  const p = base64url(enc.encode(JSON.stringify(payload)));
  const data = `${h}.${p}`;
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
  return `${data}.${base64url(sig)}`;
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return jsonResponse({ ok: false, error: 'Método não permitido' }, 405);

  try {
    const { token, code } = await req.json();
    if (!token || !code || !/^\d{6}$/.test(code)) {
      return jsonResponse({ ok: false, error: 'Parâmetros inválidos' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const otpSecret = Deno.env.get('OTP_SESSION_SECRET');
    if (!otpSecret) throw new Error('OTP_SESSION_SECRET ausente');

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const tokenHash = await sha256Hex(token);
    const { data: ft, error: selErr } = await admin
      .from('family_tokens')
      .select(
        'id, student_id, instrument, otp_hash, otp_expires_at, otp_attempts, otp_verified_at, used_at, revoked_at',
      )
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (selErr) throw selErr;
    if (!ft) return jsonResponse({ ok: false, error: 'Token inválido' }, 404);
    if (ft.revoked_at || ft.used_at)
      return jsonResponse({ ok: false, error: 'Token indisponível' }, 410);
    if (!ft.otp_hash || !ft.otp_expires_at)
      return jsonResponse({ ok: false, error: 'Nenhum código ativo. Solicite um novo envio.' }, 409);
    if (new Date(ft.otp_expires_at).getTime() < Date.now())
      return jsonResponse({ ok: false, error: 'Código expirado.' }, 410);
    if ((ft.otp_attempts ?? 0) >= MAX_VERIFY_ATTEMPTS)
      return jsonResponse({ ok: false, error: 'Número máximo de tentativas atingido.' }, 429);

    const candidateHash = await sha256Hex(code);
    const match = constantTimeEquals(candidateHash, ft.otp_hash);

    if (!match) {
      await admin
        .from('family_tokens')
        .update({ otp_attempts: (ft.otp_attempts ?? 0) + 1 })
        .eq('id', ft.id);
      return jsonResponse({ ok: false, error: 'Código incorreto.' }, 401);
    }

    // Sucesso — invalida o OTP usado.
    const now = new Date().toISOString();
    const firstIp = firstForwardedIp(req.headers.get('x-forwarded-for'));
    const { error: upErr } = await admin
      .from('family_tokens')
      .update({
        otp_verified_at: now,
        otp_hash: null,
        otp_expires_at: null,
        last_ip: firstIp,
        last_user_agent: req.headers.get('user-agent'),
      })
      .eq('id', ft.id);
    if (upErr) throw upErr;

    // JWT de sessão efêmero para o cliente público
    const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_MINUTES * 60;
    const sessionJwt = await signJwt(
      {
        sub: ft.id,
        student_id: ft.student_id,
        instrument: ft.instrument,
        purpose: 'family_collection',
        iat: Math.floor(Date.now() / 1000),
        exp,
      },
      otpSecret,
    );

    return jsonResponse({
      ok: true,
      sessionJwt,
      studentId: ft.student_id,
      instrument: ft.instrument,
    });
  } catch (err: any) {
    console.error('[otp-verify] erro:', err?.message ?? err);
    return jsonResponse({ ok: false, error: 'Erro interno' }, 500);
  }
});
