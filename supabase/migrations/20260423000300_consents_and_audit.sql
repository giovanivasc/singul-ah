-- =============================================================================
-- Migração 003 — Consentimento, Auditoria e Conformidade LGPD/ECA Digital
-- =============================================================================
-- Referências legais:
--   LGPD Art. 8º (consentimento), Art. 9º (transparência), Art. 14 (crianças),
--        Art. 18 (direitos do titular), Art. 37 (registro de operações),
--        Art. 38 (RIPD), Art. 46 (segurança).
--   ECA Digital Arts. 7º, 8º, 17, 18, 22, 24, 26, 28.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. consents — Registro de consentimentos (TCLE, assentimento, termo docente)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consents (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id     uuid REFERENCES students(id) ON DELETE CASCADE,
  titular_id     uuid,                            -- auth.users.id quando disponível
  responsavel_id uuid,                            -- auth.users.id do responsável legal (quando ≤16)
  tipo           text NOT NULL
                 CHECK (tipo IN (
                   'tcle_responsavel',            -- Termo de Consentimento (pai/responsável)
                   'assentimento_menor',          -- Assentimento (estudante menor)
                   'tcle_maior',                  -- TCLE direto (estudante ≥18)
                   'termo_docente',               -- Termo de sigilo docente
                   'termo_pesquisa'               -- Participação em pesquisa anonimizada
                 )),
  versao_termo   text NOT NULL,                   -- ex.: "v1.0.0"
  hash_termo     text NOT NULL,                   -- sha-256 do texto aceito (imutabilidade)
  aceito_em      timestamptz NOT NULL DEFAULT now(),
  ip             inet,
  user_agent     text,
  canal          text NOT NULL DEFAULT 'web'
                 CHECK (canal IN ('web', 'presencial', 'impresso_digitalizado')),
  escopo         jsonb DEFAULT '{}'::jsonb,       -- flags específicas (ex.: audio, pesquisa)
  revogado_em    timestamptz,
  motivo_revogacao text,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consents_student    ON consents (student_id);
CREATE INDEX IF NOT EXISTS idx_consents_titular    ON consents (titular_id);
CREATE INDEX IF NOT EXISTS idx_consents_tipo_ativo ON consents (tipo)
  WHERE revogado_em IS NULL;

ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

-- Professor responsável pelo aluno vê consents do aluno
CREATE POLICY "consents_teacher_read" ON consents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = consents.student_id
        AND s.teacher_id = auth.uid()
    )
  );

-- Titular vê os próprios consents
CREATE POLICY "consents_titular_read" ON consents
  FOR SELECT USING (titular_id = auth.uid() OR responsavel_id = auth.uid());

-- Inserção: qualquer usuário autenticado pode registrar o próprio aceite
CREATE POLICY "consents_insert_self" ON consents
  FOR INSERT WITH CHECK (
    titular_id = auth.uid()
    OR responsavel_id = auth.uid()
    OR EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.teacher_id = auth.uid())
  );

-- Revogação: somente o titular/responsável pode revogar
CREATE POLICY "consents_revoke" ON consents
  FOR UPDATE USING (titular_id = auth.uid() OR responsavel_id = auth.uid())
  WITH CHECK (titular_id = auth.uid() OR responsavel_id = auth.uid());


-- ---------------------------------------------------------------------------
-- 2. access_logs — Trilha de auditoria (quem acessou o quê)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS access_logs (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid,                                -- auth.users.id
  student_id uuid REFERENCES students(id) ON DELETE SET NULL,
  action     text NOT NULL
             CHECK (action IN (
               'view', 'create', 'update', 'delete',
               'export', 'share', 'login', 'logout',
               'consent_accept', 'consent_revoke',
               'erasure_request', 'portability_request'
             )),
  resource   text,                                -- ex.: "students/:id/case-study"
  route      text,
  ip         inet,
  user_agent text,
  meta       jsonb DEFAULT '{}'::jsonb,
  at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_user    ON access_logs (user_id, at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_student ON access_logs (student_id, at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_action  ON access_logs (action, at DESC);

ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Usuário pode inserir o próprio log
CREATE POLICY "access_logs_insert_self" ON access_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Usuário lê apenas os próprios logs; professor lê logs de alunos seus
CREATE POLICY "access_logs_read_self" ON access_logs
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = access_logs.student_id
        AND s.teacher_id = auth.uid()
    )
  );


-- ---------------------------------------------------------------------------
-- 3. ai_call_logs — Registro de chamadas à IA (Art. 20 LGPD, Art. 22 ECA Dig.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_call_logs (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id    uuid REFERENCES students(id) ON DELETE CASCADE,
  user_id       uuid,                              -- quem disparou
  feature       text NOT NULL,                     -- ex.: 'convergence', 'pei_suggestions'
  provider      text NOT NULL DEFAULT 'google_gemini',
  model         text NOT NULL,                     -- ex.: 'gemini-1.5-pro'
  input_hash    text NOT NULL,                     -- sha-256 do prompt pseudonimizado
  output_hash   text,                              -- sha-256 da resposta
  input_tokens  integer,
  output_tokens integer,
  latency_ms    integer,
  pseudonymized boolean NOT NULL DEFAULT true,
  human_review  boolean NOT NULL DEFAULT false,    -- true após professor confirmar/editar
  reviewed_by   uuid,
  reviewed_at   timestamptz,
  error         text,
  at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_student ON ai_call_logs (student_id, at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_feature ON ai_call_logs (feature, at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_review  ON ai_call_logs (human_review)
  WHERE human_review = false;

ALTER TABLE ai_call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_logs_owner" ON ai_call_logs
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = ai_call_logs.student_id
        AND s.teacher_id = auth.uid()
    )
  );


-- ---------------------------------------------------------------------------
-- 4. data_erasure_log — Registro de eliminações (Arts. 16 e 18 V LGPD)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_erasure_log (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titular_id_hash   text NOT NULL,                 -- sha-256 (não guardar id em claro após eliminar)
  student_id_hash   text,
  tipo              text NOT NULL
                    CHECK (tipo IN ('eliminacao', 'anonimizacao', 'revogacao_consent')),
  categorias        text[] NOT NULL DEFAULT '{}',  -- ex.: {"ip-sahs","if-sahs","audio"}
  base_legal        text,                          -- Art. 18 V, 15 III, 16 ...
  iniciado_em       timestamptz NOT NULL DEFAULT now(),
  concluido_em      timestamptz,
  operador_id       uuid,                          -- quem executou
  canal_solicitacao text,                          -- 'web', 'email', 'presencial'
  observacao        text,
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_erasure_tipo      ON data_erasure_log (tipo, iniciado_em DESC);
CREATE INDEX IF NOT EXISTS idx_erasure_pendente  ON data_erasure_log (iniciado_em)
  WHERE concluido_em IS NULL;

ALTER TABLE data_erasure_log ENABLE ROW LEVEL SECURITY;

-- Apenas o operador registrador (e admins, via service role) leem
CREATE POLICY "erasure_log_operator" ON data_erasure_log
  FOR SELECT USING (operador_id = auth.uid());

CREATE POLICY "erasure_log_insert" ON data_erasure_log
  FOR INSERT WITH CHECK (operador_id = auth.uid());


-- ---------------------------------------------------------------------------
-- 5. Comentários de documentação
-- ---------------------------------------------------------------------------
COMMENT ON TABLE consents         IS 'Registro de consentimentos (LGPD Art. 8º, 9º, 14).';
COMMENT ON TABLE access_logs      IS 'Trilha de auditoria de acessos (LGPD Art. 37, 46).';
COMMENT ON TABLE ai_call_logs     IS 'Log de chamadas à IA, com revisão humana obrigatória (LGPD Art. 20; ECA Digital Art. 22).';
COMMENT ON TABLE data_erasure_log IS 'Registro de eliminações/anonimizações (LGPD Arts. 15, 16, 18 V).';
