# Edge Functions — Singul-AH

Funções *server-side* responsáveis por fluxos que exigem chave `service_role`
ou segredo não exponível ao cliente.

| Função                      | Propósito                                                  | Invocação                                   |
| --------------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| `otp-send`                  | Gera OTP de 6 dígitos e envia por e-mail (Resend).         | Cliente público (coleta familiar).          |
| `otp-verify`                | Verifica OTP e emite JWT efêmero de sessão.                | Cliente público (coleta familiar).          |
| `retention-cleanup`         | Executa `public.retention_cleanup()` (LGPD 15/16).         | `pg_cron` diário (via `pg_net`).            |
| `parental-verify-send`      | Envia link de verificação ativa ao responsável (LGPD 14§5º).| Cliente autenticado (cadastro de aluno ≤16).|
| `parental-verify-confirm`   | Marca `parental_links.verificado = true` e audita.         | Cliente público (link no e-mail).           |

## Segredos necessários

Configure no Dashboard → **Project Settings → Edge Functions → Secrets**:

```
SUPABASE_URL                 # auto-injetado em runtime
SUPABASE_SERVICE_ROLE_KEY    # auto-injetado em runtime
RESEND_API_KEY               # chave do Resend para envio de e-mail
OTP_FROM_EMAIL               # ex.: "Singul-AH <no-reply@singul-ah.app>"
OTP_SESSION_SECRET           # HMAC secret (>= 32 bytes aleatórios) usado pelo JWT
CRON_SHARED_SECRET           # segredo compartilhado entre pg_cron e retention-cleanup
```

Gere segredos robustos com:
```bash
openssl rand -base64 48   # OTP_SESSION_SECRET / CRON_SHARED_SECRET
```

## Deploy

Use o script `scripts/deploy-supabase.sh` (raiz do repositório) ou execute:

```bash
export SUPABASE_PROJECT_REF=xxxxxxxxxxxx
npx supabase login
npx supabase link --project-ref "$SUPABASE_PROJECT_REF"
npx supabase db push
npx supabase functions deploy otp-send
npx supabase functions deploy otp-verify
npx supabase functions deploy retention-cleanup --no-verify-jwt
```

A flag `--no-verify-jwt` em `retention-cleanup` é intencional: a função valida
seu próprio `CRON_SHARED_SECRET` e não depende do Auth do Supabase.

## Configurar pg_cron

A migração `006_pg_cron_retention.sql` tenta agendar automaticamente, mas exige
que as settings estejam populadas previamente. Execute no **SQL Editor**:

```sql
ALTER DATABASE postgres
  SET app.settings.supabase_url TO 'https://<PROJECT_REF>.supabase.co';

ALTER DATABASE postgres
  SET app.settings.cron_shared_secret TO '<mesmo valor do CRON_SHARED_SECRET>';
```

Depois, verifique o agendamento:

```sql
SELECT jobid, schedule, command, active
FROM cron.job
WHERE jobname = 'retention-cleanup-daily';
```

## Testes locais

### Testes unitários (Deno)

Os utilitários compartilhados em `_shared/` têm testes unitários. Para rodar é
preciso ter o Deno instalado (`brew install deno` no macOS, ou
`curl -fsSL https://deno.land/install.sh | sh`).

```bash
deno test supabase/functions/_shared/
```

Cobre:
- `hash.test.ts` — `sha256Hex`, `generateOtp`, `constantTimeEquals`.
- `net.test.ts` — `firstForwardedIp`, `maskEmail`, `generateUrlSafeToken`.

São testes determinísticos e rápidos (< 1s no total), executados sem
dependência externa de banco ou rede.

### Teste integrado contra a stack local

```bash
# Sobe o stack local (Docker)
npx supabase start

# Serve funções em http://localhost:54321/functions/v1/<nome>
npx supabase functions serve otp-send --env-file supabase/.env.local

# Teste:
curl -X POST http://localhost:54321/functions/v1/otp-send \
  -H "Content-Type: application/json" \
  -d '{"token":"<token_emitido_via_dashboard>"}'
```

## Referências legais

- **LGPD Art. 14 §5º** — esforços razoáveis de verificação → OTP.
- **LGPD Arts. 15 e 16** — término do tratamento e eliminação → retention-cleanup.
- **LGPD Art. 46** — segurança → hash do OTP, TTL curto, rate-limit.
- **ECA Digital Art. 17** — supervisão parental → verificação forte do destinatário.
