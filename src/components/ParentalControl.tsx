import React, { useState } from 'react';
import { Bell, Eye, Sparkles, Mic, Microscope, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

/**
 * Card de controles de supervisão parental (ECA Digital Art. 17).
 * Recebe o vínculo parental e permite alternar flags em `controles`.
 */

export interface ParentalControlsShape {
  recebe_notificacoes: boolean;
  acessa_dados: boolean;
  autoriza_ia: boolean;
  autoriza_audio: boolean;
  autoriza_pesquisa: boolean;
}

interface ParentalControlProps {
  linkId: string;
  controles: ParentalControlsShape;
  onChange?: (next: ParentalControlsShape) => void;
  /** Somente leitura (quando o visualizador é o professor). */
  readOnly?: boolean;
}

const CONTROLS: Array<{
  key: keyof ParentalControlsShape;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  hint: string;
  defaultOn: boolean;
}> = [
  {
    key: 'recebe_notificacoes',
    icon: Bell,
    label: 'Receber notificações',
    hint: 'Avisos sobre coletas, alterações e incidentes.',
    defaultOn: true,
  },
  {
    key: 'acessa_dados',
    icon: Eye,
    label: 'Acessar dados do(a) estudante',
    hint: 'Visualizar relatórios e dados consolidados.',
    defaultOn: true,
  },
  {
    key: 'autoriza_ia',
    icon: Sparkles,
    label: 'Permitir apoio por IA',
    hint: 'Processamento auxiliar por modelo de linguagem (sempre revisado por humano).',
    defaultOn: true,
  },
  {
    key: 'autoriza_audio',
    icon: Mic,
    label: 'Permitir gravação de áudio',
    hint: 'Respostas por microfone nos instrumentos.',
    defaultOn: false,
  },
  {
    key: 'autoriza_pesquisa',
    icon: Microscope,
    label: 'Participar da pesquisa anonimizada',
    hint: 'Inclusão em análises agregadas, sem identificação pessoal.',
    defaultOn: false,
  },
];

export default function ParentalControl({
  linkId,
  controles,
  onChange,
  readOnly = false,
}: ParentalControlProps) {
  const [state, setState] = useState<ParentalControlsShape>(controles);
  const [saving, setSaving] = useState<keyof ParentalControlsShape | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = async (key: keyof ParentalControlsShape) => {
    if (readOnly) return;
    const next = { ...state, [key]: !state[key] };
    setState(next);
    setSaving(key);
    setError(null);
    try {
      const { error: updErr } = await supabase
        .from('parental_links')
        .update({ controles: next })
        .eq('id', linkId);
      if (updErr) throw updErr;
      onChange?.(next);
    } catch (err: any) {
      setState(state); // rollback
      setError(err.message ?? 'Falha ao salvar');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-3">
      {CONTROLS.map(({ key, icon: Icon, label, hint }) => {
        const on = state[key];
        return (
          <div
            key={key}
            className="bg-white rounded-2xl p-4 border border-outline-variant/10 flex items-center gap-4"
          >
            <div
              className={
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ' +
                (on ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400')
              }
            >
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-on-surface text-sm">{label}</p>
              <p className="text-xs text-on-surface-variant font-medium">{hint}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              disabled={readOnly || saving === key}
              aria-pressed={on}
              className={
                'relative w-12 h-7 rounded-full transition-colors shrink-0 ' +
                (on ? 'bg-primary' : 'bg-slate-300') +
                (readOnly ? ' opacity-50 cursor-not-allowed' : '')
              }
            >
              <span
                className={
                  'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ' +
                  (on ? 'translate-x-5' : 'translate-x-0.5')
                }
              />
              {saving === key && (
                <Loader2
                  size={12}
                  className="absolute inset-0 m-auto animate-spin text-white"
                />
              )}
            </button>
          </div>
        );
      })}
      {error && <p className="text-xs text-error font-semibold">{error}</p>}
    </div>
  );
}
