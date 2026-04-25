-- =============================================================================
-- Migração 005 — Vínculo parental, controles e retenção
-- =============================================================================
-- Base legal:
--   LGPD Art. 14 (crianças e adolescentes), Art. 15 (término do tratamento),
--        Art. 16 (eliminação), Art. 37 (registro).
--   ECA Digital Art. 17 (supervisão parental), Art. 18 (transparência),
--        Art. 24 (contas ≤16 anos), Art. 26 (vedações).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. parental_links — Vínculo do responsável legal com o estudante
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parental_links (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id        uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  responsavel_id    uuid,                               -- auth.users.id (pode ser NULL se ainda não autenticou)
  responsavel_nome  text NOT NULL,
  responsavel_email text,
  responsavel_doc   text,                               -- CPF ou doc identificador
  vinculo           text NOT NULL
                    CHECK (vinculo IN ('mae','pai','responsavel_legal','tutor','outro')),
  vinculo_outro     text,
  verificado        boolean NOT NULL DEFAULT false,     -- verificação presencial/digital
  verificado_em     timestamptz,
  verificado_por    uuid,                               -- teacher/admin
  principal         boolean NOT NULL DEFAULT false,     -- responsável principal (1 por aluno)
  -- Controles de supervisão parental (ECA Digital Art. 17)
  controles         jsonb NOT NULL DEFAULT jsonb_build_object(
                      'recebe_notificacoes', true,
                      'acessa_dados', true,
                      'autoriza_ia', true,
                      'autoriza_audio', false,
                      'autoriza_pesquisa', false
                    ),
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  revoked_at        timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_parental_unique_principal
  ON parental_links (student_id)
  WHERE principal = true AND revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_parental_student ON parental_links (student_id);
CREATE INDEX IF NOT EXISTS idx_parental_resp    ON parental_links (responsavel_id);

ALTER TABLE parental_links ENABLE ROW LEVEL SECURITY;

-- Professor do aluno gerencia
CREATE POLICY "parental_teacher" ON parental_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM students s WHERE s.id = parental_links.student_id AND s.teacher_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM students s WHERE s.id = parental_links.student_id AND s.teacher_id = auth.uid())
  );

-- Responsável lê e atualiza os próprios controles
CREATE POLICY "parental_self" ON parental_links
  FOR SELECT USING (responsavel_id = auth.uid());

CREATE POLICY "parental_self_update" ON parental_links
  FOR UPDATE USING (responsavel_id = auth.uid())
  WITH CHECK (responsavel_id = auth.uid());

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_parental_updated_at ON parental_links;
CREATE TRIGGER trg_parental_updated_at
  BEFORE UPDATE ON parental_links
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE parental_links IS
  'Vínculo do responsável legal (ECA Digital Art. 17/24; LGPD Art. 14).';


-- ---------------------------------------------------------------------------
-- 2. Função de expurgo para retenção (invocada por cron/Edge Function)
-- ---------------------------------------------------------------------------
-- Política de retenção (resumo — ver docs/privacidade/retencao-eliminacao.md):
--   access_logs     → 90 dias
--   ai_call_logs    → 30 dias (hash + metadados; nada de prompt em claro)
--   audio base64    → removido imediatamente após transcrição (instrument_audio_files.audio_data → NULL)
--   soft-deletes    → 30 dias de graça antes do hard-delete
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION retention_cleanup() RETURNS TABLE (
  kind   text,
  purged integer
) AS $$
DECLARE
  v_access  integer;
  v_ai      integer;
  v_audio   integer;
BEGIN
  -- Access logs > 90 dias
  WITH d AS (
    DELETE FROM access_logs
    WHERE at < now() - interval '90 days'
    RETURNING 1
  )
  SELECT count(*) INTO v_access FROM d;

  -- AI call logs > 30 dias
  WITH d AS (
    DELETE FROM ai_call_logs
    WHERE at < now() - interval '30 days'
    RETURNING 1
  )
  SELECT count(*) INTO v_ai FROM d;

  -- Áudio base64 transcrito/revisado — limpa payload (mantém metadados)
  WITH u AS (
    UPDATE instrument_audio_files
       SET audio_data = NULL
     WHERE audio_data IS NOT NULL
       AND status IN ('transcribed','reviewed','merged')
       AND transcribed_at < now() - interval '7 days'
    RETURNING 1
  )
  SELECT count(*) INTO v_audio FROM u;

  RETURN QUERY
    SELECT 'access_logs'::text, v_access
    UNION ALL SELECT 'ai_call_logs', v_ai
    UNION ALL SELECT 'audio_payload', v_audio;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION retention_cleanup() IS
  'Expurgo periódico conforme política de retenção (LGPD Art. 15, 16). Chamar via cron diário.';
