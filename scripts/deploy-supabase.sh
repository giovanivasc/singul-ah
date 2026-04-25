#!/usr/bin/env bash
# =============================================================================
# Deploy completo do backend Supabase (Singul-AH)
# -----------------------------------------------------------------------------
# Ordem:
#   1. login + link ao projeto
#   2. db push (aplica 001..006)
#   3. deploy das Edge Functions (otp-send, otp-verify, retention-cleanup)
#   4. lembrete das settings de pg_cron
#
# Pré-requisitos:
#   - SUPABASE_PROJECT_REF exportado (ou passado como primeiro argumento)
#   - `npx supabase login` realizado previamente (ou $SUPABASE_ACCESS_TOKEN)
# =============================================================================
set -euo pipefail

PROJECT_REF="${1:-${SUPABASE_PROJECT_REF:-}}"
if [[ -z "$PROJECT_REF" ]]; then
  echo "Uso: $0 <project-ref> (ou export SUPABASE_PROJECT_REF)"
  exit 1
fi

echo "▶ Linkando ao projeto $PROJECT_REF"
npx supabase link --project-ref "$PROJECT_REF"

echo "▶ Aplicando migrações (db push)"
npx supabase db push

echo "▶ Publicando Edge Functions"
npx supabase functions deploy otp-send
npx supabase functions deploy otp-verify
npx supabase functions deploy retention-cleanup --no-verify-jwt

cat <<EOF

✓ Deploy concluído.

⚠ AÇÕES MANUAIS (uma vez por projeto):

1. Configure os secrets das Edge Functions no Dashboard:
     RESEND_API_KEY, OTP_FROM_EMAIL, OTP_SESSION_SECRET, CRON_SHARED_SECRET

2. Popule as settings para pg_cron (SQL Editor):
     ALTER DATABASE postgres
       SET app.settings.supabase_url TO 'https://$PROJECT_REF.supabase.co';
     ALTER DATABASE postgres
       SET app.settings.cron_shared_secret TO '<CRON_SHARED_SECRET>';

3. Verifique o agendamento:
     SELECT jobid, schedule, active FROM cron.job
     WHERE jobname = 'retention-cleanup-daily';

EOF
