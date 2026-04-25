-- =============================================================================
-- Migração 008 — Verificação ativa do vínculo parental
-- =============================================================================
-- Acrescenta colunas a `parental_links` para o fluxo em que o responsável
-- recebe um e-mail com link público e confirma o vínculo, marcando
-- `verificado = true` e `verificado_em = now()`.
--
-- Base legal:
--   LGPD Art. 14 §5º — esforços razoáveis para verificar consentimento parental.
--   ECA Digital Art. 14 — verificação ativa do responsável.
-- =============================================================================

ALTER TABLE parental_links
  ADD COLUMN IF NOT EXISTS verification_token_hash text,
  ADD COLUMN IF NOT EXISTS verification_sent_at    timestamptz,
  ADD COLUMN IF NOT EXISTS verification_expires_at timestamptz;

-- Index para lookup rápido pelo hash do token público.
CREATE INDEX IF NOT EXISTS idx_parental_verification_hash
  ON parental_links (verification_token_hash)
  WHERE verification_token_hash IS NOT NULL;

COMMENT ON COLUMN parental_links.verification_token_hash IS
  'SHA-256 hex do token público enviado por e-mail. NULL após verificação.';
COMMENT ON COLUMN parental_links.verification_sent_at IS
  'Data/hora do envio do último e-mail de verificação.';
COMMENT ON COLUMN parental_links.verification_expires_at IS
  'Validade do token. Padrão: 7 dias após envio.';
