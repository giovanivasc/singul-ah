# Setup do projeto Supabase `qnlrocbdjmwccigslnci`

Passo a passo para executar **uma única vez**. Já com o `PROJECT_REF` e URL preenchidos.

---

## 1. Link + push + deploy (no terminal local)

```bash
cd /Users/giovanivasconcelos/Downloads/mindspectrum-pei/.claude/worktrees/agitated-beaver-7de5c3
./scripts/deploy-supabase.sh qnlrocbdjmwccigslnci
```

- O `link` pedirá a **senha do banco** (usuário `postgres`). Se esqueceu: Dashboard → **Project Settings → Database → Reset database password**.
- O `db push` aplicará as migrações `001 → 006`.
- As Edge Functions serão publicadas (`otp-send`, `otp-verify`, `retention-cleanup`).

---

## 2. Secrets das Edge Functions

Gere segredos fortes localmente:

```bash
export OTP_SESSION_SECRET=$(openssl rand -base64 48 | tr -d '\n')
export CRON_SHARED_SECRET=$(openssl rand -base64 48 | tr -d '\n')
```

Configure no Supabase (via CLI, sem precisar abrir o Dashboard):

```bash
npx supabase secrets set \
  OTP_SESSION_SECRET="$OTP_SESSION_SECRET" \
  CRON_SHARED_SECRET="$CRON_SHARED_SECRET" \
  OTP_FROM_EMAIL="Singul-AH <no-reply@singul-ah.app>" \
  RESEND_API_KEY="<sua_chave_do_resend>" \
  --project-ref qnlrocbdjmwccigslnci
```

> **RESEND_API_KEY**: crie em <https://resend.com/api-keys>. Sem ela, em produção, o envio de OTP por e-mail falha. Em dev, a função loga o código no console (não é seguro em prod).

Guarde o `CRON_SHARED_SECRET` — você vai precisar dele no passo 3.

---

## 3. Configurar pg_cron (SQL Editor do Dashboard)

Abra <https://supabase.com/dashboard/project/qnlrocbdjmwccigslnci/sql/new> e cole (substituindo `<CRON_SHARED_SECRET>` pelo valor gerado no passo 2):

```sql
-- URL da API — usada pelo pg_cron para invocar a Edge Function
ALTER DATABASE postgres
  SET app.settings.supabase_url TO 'https://qnlrocbdjmwccigslnci.supabase.co';

-- Segredo compartilhado — o mesmo que foi setado em CRON_SHARED_SECRET
ALTER DATABASE postgres
  SET app.settings.cron_shared_secret TO '<CRON_SHARED_SECRET>';
```

Depois, confirme que o job está ativo:

```sql
SELECT jobid, schedule, active
FROM cron.job
WHERE jobname = 'retention-cleanup-daily';
```

Saída esperada: uma linha com `schedule = '15 3 * * *'` e `active = true`.

---

## 4. Smoke test

### 4.1 — Cadastre um estudante ≤ 16 pelo app

Acesse `/students`, clique em **Novo Aluno**, preencha com uma data de nascimento que resulte em ≤ 16 anos. O bloco de **Vínculo Parental** deve aparecer e ser obrigatório. Após salvar, inspecione:

```sql
-- No SQL Editor
SELECT s.full_name, pl.responsavel_nome, pl.vinculo, pl.verificado, pl.controles
FROM students s
JOIN parental_links pl ON pl.student_id = s.id
WHERE pl.principal AND pl.revoked_at IS NULL
ORDER BY pl.created_at DESC
LIMIT 5;
```

### 4.2 — Emita um family_token e teste o OTP

```sql
-- Emita um token curto (substitua <STUDENT_ID> e <EMAIL>)
INSERT INTO family_tokens (student_id, token, token_hash, instrument, recipient_email, created_by, expires_at)
SELECT
  '<STUDENT_ID>'::uuid,
  'tok_demo_123',
  encode(digest('tok_demo_123', 'sha256'), 'hex'),
  'if_sahs',
  '<EMAIL>',
  auth.uid(),
  now() + interval '7 days'
;
```

Acesse `/coleta/if-sahs/tok_demo_123` no navegador. O fluxo deve ser:

1. Aceite do TCLE
2. Pedido de envio de OTP (código vai pro e-mail real via Resend, ou aparece no log da function em dev)
3. Verificação do código
4. Formulário IF-SAHS liberado

### 4.3 — Teste retention-cleanup manualmente

```bash
curl -X POST "https://qnlrocbdjmwccigslnci.supabase.co/functions/v1/retention-cleanup" \
  -H "Authorization: Bearer $CRON_SHARED_SECRET"
```

Resposta esperada:

```json
{ "ok": true, "at": "...", "result": [
  {"kind":"access_logs","purged":0},
  {"kind":"ai_call_logs","purged":0},
  {"kind":"audio_payload","purged":0}
]}
```

---

## 5. Observabilidade

- **Logs das funções**: <https://supabase.com/dashboard/project/qnlrocbdjmwccigslnci/functions>
- **pg_cron execuções**:
  ```sql
  SELECT * FROM cron.job_run_details
  WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'retention-cleanup-daily')
  ORDER BY start_time DESC LIMIT 10;
  ```
- **Auditoria**: queries sobre `access_logs`, `ai_call_logs`, `data_erasure_log`.

---

## Troubleshooting comum

| Sintoma                                                   | Causa provável                                           | Fix                                                                 |
| --------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| `db push` falha com "relation `students` does not exist`" | Migrações 001/002 criam tabelas que dependem de `students` — verifique se ela foi criada antes por outra migração do projeto antigo | Conferir no SQL Editor: `\dt public.*`                              |
| `otp-send` retorna 422 "sem destinatário"                 | `family_tokens.recipient_email` null                     | Preencher no insert ou na emissão                                   |
| `retention-cleanup` retorna 401                           | `CRON_SHARED_SECRET` divergente entre secret da function e setting do DB | Re-setar o mesmo valor nos dois lugares                             |
| `cron.job` vazia                                          | Extensão `pg_cron` não habilitada                        | Dashboard → Database → Extensions → enable `pg_cron` e `pg_net`     |
