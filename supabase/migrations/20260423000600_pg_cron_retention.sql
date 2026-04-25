-- =============================================================================
-- Migração 006 — Agendamento diário da rotina de retenção via pg_cron
-- =============================================================================
-- Chama a Edge Function `retention-cleanup` todos os dias às 03:15 UTC
-- (≈ 00:15 horário de Brasília) usando pg_net para HTTP POST.
--
-- Pré-requisitos no projeto Supabase:
--   - extensão pg_cron habilitada (Dashboard → Database → Extensions)
--   - extensão pg_net habilitada
--   - settings:
--       app.settings.supabase_url           = 'https://<ref>.supabase.co'
--       app.settings.cron_shared_secret     = '<segredo gerado>'
--   Configurados via:
--     ALTER DATABASE postgres SET app.settings.supabase_url TO '...';
--     ALTER DATABASE postgres SET app.settings.cron_shared_secret TO '...';
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove agendamento anterior (idempotente)
DO $$
BEGIN
  PERFORM cron.unschedule('retention-cleanup-daily');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'retention-cleanup-daily',
  '15 3 * * *',  -- 03:15 UTC diariamente
  $cmd$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/retention-cleanup',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.cron_shared_secret')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 30000
    );
  $cmd$
);

COMMENT ON EXTENSION pg_cron IS 'Agendador nativo para expurgos periódicos (LGPD Arts. 15, 16).';
