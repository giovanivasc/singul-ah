-- Tabela dedicada ao ciclo de vida dos áudios dos instrumentos
CREATE TABLE IF NOT EXISTS instrument_audio_files (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id     uuid NOT NULL REFERENCES instrument_records(id) ON DELETE CASCADE,
  field_key     text NOT NULL,
  audio_data    text,                         -- base64 do áudio (removido após revisão)
  transcription text,                         -- texto transcrito
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'transcribed', 'reviewed', 'merged', 'deleted')),
  created_at    timestamptz DEFAULT now(),
  transcribed_at timestamptz,
  reviewed_at   timestamptz,
  deleted_at    timestamptz,
  UNIQUE (record_id, field_key)               -- um áudio por campo por registro
);

-- Índice para buscar rapidamente todos os áudios de um registro
CREATE INDEX IF NOT EXISTS idx_audio_files_record_id
  ON instrument_audio_files (record_id);

-- Índice para buscar áudios pendentes de revisão
CREATE INDEX IF NOT EXISTS idx_audio_files_status
  ON instrument_audio_files (status)
  WHERE status IN ('pending', 'transcribed');

-- RLS: apenas o dono do aluno acessa
ALTER TABLE instrument_audio_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audio_files_owner" ON instrument_audio_files
  USING (
    EXISTS (
      SELECT 1 FROM instrument_records ir
      JOIN students s ON s.id = ir.student_id
      WHERE ir.id = instrument_audio_files.record_id
        AND s.teacher_id = auth.uid()
    )
  );
