// Edge Function: retention-cleanup
// ----------------------------------------------------------------------------
// Invoca a função SQL `public.retention_cleanup()` (criada em 005) que:
//   - expurga access_logs > 90 dias
//   - expurga ai_call_logs > 30 dias
//   - zera payload base64 de áudios transcritos/revisados > 7 dias
//
// Para ser invocada por pg_cron (ou cron-job externo via HTTP) com o header
// Authorization: Bearer <CRON_SHARED_SECRET>.
//
// Base legal: LGPD Arts. 15 (término) e 16 (eliminação).
// ----------------------------------------------------------------------------

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsonResponse, preflight } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  try {
    const shared = Deno.env.get('CRON_SHARED_SECRET');
    const auth = req.headers.get('authorization') ?? '';
    if (!shared || auth !== `Bearer ${shared}`) {
      return jsonResponse({ ok: false, error: 'Não autorizado' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await admin.rpc('retention_cleanup');
    if (error) throw error;

    return jsonResponse({
      ok: true,
      at: new Date().toISOString(),
      result: data,
    });
  } catch (err: any) {
    console.error('[retention-cleanup] erro:', err?.message ?? err);
    return jsonResponse({ ok: false, error: err?.message ?? 'Erro interno' }, 500);
  }
});
