-- =============================================================================
-- Migração 007 — Reagenda retention-cleanup usando Supabase Vault
-- =============================================================================
-- Motivo: em projetos gerenciados do Supabase, `ALTER DATABASE ... SET` exige
-- privilégio de superuser, que não é concedido ao dono do projeto. A URL do
-- projeto é pública (pode ficar hardcoded na função agendada) e o segredo
-- compartilhado fica no `vault.decrypted_secrets`, que só é legível por roles
-- com permissão explícita (por padrão, o `postgres` role do projeto tem).
--
-- Pré-requisito: criar o segredo no Vault antes deste push ou logo após:
--   SELECT vault.create_secret('<CRON_SHARED_SECRET>', 'cron_shared_secret');
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
      url := 'https://qnlrocbdjmwccigslnci.supabase.co/functions/v1/retention-cleanup',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization',
          'Bearer ' ||
          (SELECT decrypted_secret
             FROM vault.decrypted_secrets
            WHERE name = 'cron_shared_secret'
            LIMIT 1)
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 30000
    );
  $cmd$
);
