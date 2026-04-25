-- =============================================================
-- 002_convergence_and_snippets.sql
-- Cria tabelas para Fichamentos (highlight_snippets) e
-- Consolidação IA do IP-SAHS (ip_sahs_consolidations);
-- estende convergence_records com a nova síntese do Estudo de Caso.
-- =============================================================

-- --------------------------------------------------
-- 1. highlight_snippets (Fichamento Prévio)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS highlight_snippets (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id        uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  instrument_source text NOT NULL,                -- rótulo exibido (ex.: "IP-SAHS (Prof. João)")
  source_record_id  uuid,                         -- opcional: id do registro original
  source_table      text,                         -- opcional: 'instrument_records' | 'n_ils_responses' | 'ip_sahs_consolidations'
  text              text NOT NULL,
  category          text NOT NULL
                    CHECK (category IN ('demandas','contexto','potencialidades','duvida')),
  status            text NOT NULL DEFAULT 'ativo'
                    CHECK (status IN ('ativo','armazenado')),
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_snippets_student_id
  ON highlight_snippets (student_id);
CREATE INDEX IF NOT EXISTS idx_snippets_status
  ON highlight_snippets (status);

ALTER TABLE highlight_snippets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "snippets_owner" ON highlight_snippets;
CREATE POLICY "snippets_owner" ON highlight_snippets
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = highlight_snippets.student_id
        AND s.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = highlight_snippets.student_id
        AND s.teacher_id = auth.uid()
    )
  );

-- --------------------------------------------------
-- 2. ip_sahs_consolidations (Consolidação IA IP-SAHS)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS ip_sahs_consolidations (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id        uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  -- IDs de instrument_records agregados nesta consolidação
  source_record_ids uuid[] NOT NULL DEFAULT '{}',
  -- JSON com a síntese unificada produzida pela IA
  consolidated_data jsonb NOT NULL,
  -- Prompt enviado e modelo usado (auditoria)
  ai_prompt         text,
  ai_model          text,
  ai_response_raw   text,
  status            text NOT NULL DEFAULT 'ativo'
                    CHECK (status IN ('ativo','obsoleto')),
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ip_sahs_consolid_student_id
  ON ip_sahs_consolidations (student_id);
CREATE INDEX IF NOT EXISTS idx_ip_sahs_consolid_status
  ON ip_sahs_consolidations (status);

ALTER TABLE ip_sahs_consolidations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ip_sahs_consolid_owner" ON ip_sahs_consolidations;
CREATE POLICY "ip_sahs_consolid_owner" ON ip_sahs_consolidations
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = ip_sahs_consolidations.student_id
        AND s.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = ip_sahs_consolidations.student_id
        AND s.teacher_id = auth.uid()
    )
  );

-- --------------------------------------------------
-- 3. convergence_records: nova síntese do Estudo de Caso
-- --------------------------------------------------
-- Esta coluna armazena o objeto CaseStudySynthesis:
--   { currentContext, learningStyle, potentialsInterests,
--     demandsBarriers, accessibilityStrategies }
-- axis_data (legado I/II/III/IV) permanece intocado.
ALTER TABLE convergence_records
  ADD COLUMN IF NOT EXISTS synthesis_data jsonb;
ALTER TABLE convergence_records
  ADD COLUMN IF NOT EXISTS ai_prompt      text;
ALTER TABLE convergence_records
  ADD COLUMN IF NOT EXISTS ai_model       text;

-- Garante RLS habilitado também em convergence_records (idempotente)
ALTER TABLE convergence_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "convergence_owner" ON convergence_records;
CREATE POLICY "convergence_owner" ON convergence_records
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = convergence_records.student_id
        AND s.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = convergence_records.student_id
        AND s.teacher_id = auth.uid()
    )
  );
