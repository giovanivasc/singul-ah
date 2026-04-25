// Edge Function: parental-verify-confirm
// ----------------------------------------------------------------------------
// Confirma um token público de verificação parental. Em caso de sucesso,
// marca `verificado = true`, `verificado_em = now()` e invalida o token
// (verification_token_hash = NULL).
//
// Base legal: LGPD Art. 14 §5º; ECA Digital Art. 14.
//
// Request (POST JSON):
//   { "token": "<token_publico>" }
//
// Response 200: { ok: true, studentName: "...", responsavelNome: "..." }
// Response 4xx: { ok: false, error: "..." }
// ----------------------------------------------------------------------------

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { preflight, jsonResponse } from '../_shared/cors.ts';
import { sha256Hex } from '../_shared/hash.ts';
import { firstForwardedIp } from '../_shared/net.ts';

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

    const { data: pl, error: selErr } = await admin
      .from('parental_links')
      .select(
        'id, student_id, responsavel_nome, verificado, revoked_at, verification_expires_at',
      )
      .eq('verification_token_hash', tokenHash)
      .maybeSingle();

    if (selErr) throw selErr;
    if (!pl) return jsonResponse({ ok: false, error: 'Link inválido ou já utilizado' }, 404);
    if (pl.revoked_at) return jsonResponse({ ok: false, error: 'Vínculo revogado' }, 410);
    if (pl.verificado)
      return jsonResponse({ ok: false, error: 'Vínculo já confirmado anteriormente' }, 409);
    if (
      pl.verification_expires_at &&
      new Date(pl.verification_expires_at).getTime() < Date.now()
    ) {
      return jsonResponse(
        { ok: false, error: 'Link expirado. Solicite um novo envio à escola.' },
        410,
      );
    }

    const firstIp = firstForwardedIp(req.headers.get('x-forwarded-for'));

    const { error: upErr } = await admin
      .from('parental_links')
      .update({
        verificado: true,
        verificado_em: new Date().toISOString(),
        verification_token_hash: null,
        verification_expires_at: null,
      })
      .eq('id', pl.id);
    if (upErr) throw upErr;

    // Audita o evento (LGPD Art. 37)
    await admin.from('access_logs').insert({
      user_id: null,
      student_id: pl.student_id,
      action: 'update',
      resource: `parental_links/${pl.id}`,
      route: '/responsavel/confirmar',
      ip: firstIp,
      user_agent: req.headers.get('user-agent'),
      meta: { event: 'parental_verification_confirmed' },
    });

    // Busca nome do estudante para retorno na UI
    const { data: student } = await admin
      .from('students')
      .select('full_name')
      .eq('id', pl.student_id)
      .maybeSingle();

    return jsonResponse({
      ok: true,
      studentName: student?.full_name ?? null,
      responsavelNome: pl.responsavel_nome,
    });
  } catch (err: any) {
    console.error('[parental-verify-confirm] erro:', err?.message ?? err);
    return jsonResponse({ ok: false, error: 'Erro interno' }, 500);
  }
});
