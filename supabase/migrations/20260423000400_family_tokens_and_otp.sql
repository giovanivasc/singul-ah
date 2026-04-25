-- =============================================================================
-- Migração 004 — Tokens de coleta externa (família) + OTP
-- =============================================================================
-- Objetivo: permitir coleta do IF-SAHS por responsável sem conta autenticada,
-- com verificação forte do destinatário (e-mail/telefone) via OTP.
--
-- Base legal: LGPD Art. 14 §5º (esforços razoáveis para verificar que o
-- consentimento é dado pelo responsável legal); ECA Digital Art. 17 (ferramentas
-- de supervisão parental); Art. 18 (comunicação clara).
-- =============================================================================

CREATE TABLE IF NOT EXISTS family_tokens (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id      uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  token           text NOT NULL UNIQUE,              -- parte pública da URL
  token_hash      text NOT NULL,                     -- sha-256 do token (guardado com hash)
  instrument      text NOT NULL DEFAULT 'if_sahs'
                  CHECK (instrument IN ('if_sahs','entrevista_familiar')),
  recipient_email text,
  recipient_phone text,
  -- OTP
  otp_hash        text,                              -- sha-256 de OTP de 6 dígitos
  otp_expires_at  timestamptz,
  otp_sent_at     timestamptz,
  otp_attempts    integer NOT NULL DEFAULT 0,
  otp_verified_at timestamptz,
  -- lifecycle
  created_by      uuid,                              -- teacher
  created_at      timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL,              -- hard-expiry do link
  used_at         timestamptz,                       -- respondido
  revoked_at      timestamptz,
  last_ip         inet,
  last_user_agent text
);

CREATE INDEX IF NOT EXISTS idx_family_tokens_student ON family_tokens (student_id);
CREATE INDEX IF NOT EXISTS idx_family_tokens_active  ON family_tokens (expires_at)
  WHERE used_at IS NULL AND revoked_at IS NULL;

ALTER TABLE family_tokens ENABLE ROW LEVEL SECURITY;

-- Professor vê tokens do próprio aluno
CREATE POLICY "family_tokens_teacher" ON family_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = family_tokens.student_id
        AND s.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = family_tokens.student_id
        AND s.teacher_id = auth.uid()
    )
  );

-- NOTA: verificação pública do OTP é feita via Edge Function (service role),
-- nunca por cliente anônimo direto sobre esta tabela.

COMMENT ON TABLE family_tokens IS
  'Tokens de coleta externa por responsável, com OTP (LGPD Art. 14 §5º; ECA Dig. Art. 17).';
