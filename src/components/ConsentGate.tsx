import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';
import { getActiveConsent, registerConsent, type ConsentType } from '../lib/consent';

/**
 * Middleware de consentimento. Bloqueia a renderização do conteúdo protegido
 * até que o consent do tipo indicado esteja registrado e não revogado.
 *
 * Usos:
 *  - <ConsentGate tipo="tcle_responsavel" studentId={s.id} ...>
 *      <FamilyCollection />
 *    </ConsentGate>
 *
 *  - <ConsentGate tipo="termo_docente" titularId={user.id} ...>
 *      <Layout />
 *    </ConsentGate>
 */

interface ConsentGateProps {
  tipo: ConsentType;
  studentId?: string;
  titularId?: string;
  responsavelId?: string;
  /** Texto integral do termo a ser aceito (para gerar hash). */
  termoTexto: string;
  versao: string;
  /** Título exibido no card de aceite. */
  titulo: string;
  /** Resumo curto (1 parágrafo) exibido acima do checkbox. */
  resumo: React.ReactNode;
  /** Rota para ler o termo completo. */
  linkTermo: string;
  children: React.ReactNode;
}

export default function ConsentGate({
  tipo,
  studentId,
  titularId,
  responsavelId,
  termoTexto,
  versao,
  titulo,
  resumo,
  linkTermo,
  children,
}: ConsentGateProps) {
  const [status, setStatus] = useState<'loading' | 'pending' | 'granted' | 'error'>('loading');
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const existing = await getActiveConsent({ tipo, studentId, titularId, responsavelId });
        if (cancelled) return;
        setStatus(existing ? 'granted' : 'pending');
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message ?? 'Falha ao verificar consentimento');
        setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tipo, studentId, titularId, responsavelId]);

  const handleAccept = async () => {
    if (!checked) return;
    setSaving(true);
    setError(null);
    try {
      await registerConsent({
        tipo,
        studentId,
        titularId,
        responsavelId,
        versao,
        textoAceito: termoTexto,
      });
      setStatus('granted');
    } catch (err: any) {
      setError(err.message ?? 'Falha ao registrar consentimento');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (status === 'granted') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl atmospheric-shadow border border-outline-variant/10 p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Consentimento necessário
            </p>
            <h2 className="text-xl font-black text-on-surface mt-1">{titulo}</h2>
          </div>
        </div>

        <div className="text-sm text-on-surface-variant font-medium leading-relaxed mb-6">
          {resumo}
        </div>

        <Link
          to={linkTermo}
          target="_blank"
          className="inline-flex items-center gap-1 text-primary font-bold text-sm hover:underline mb-6"
        >
          Ler o termo completo →
        </Link>

        <label className="flex items-start gap-3 bg-primary/5 rounded-2xl p-4 border border-primary/10 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 w-5 h-5 accent-primary shrink-0"
            disabled={saving}
          />
          <span className="text-sm text-on-surface font-semibold leading-relaxed">
            Li, entendi e concordo com o termo (versão {versao}). Registro este aceite de forma
            livre, informada e inequívoca, podendo revogar a qualquer momento.
          </span>
        </label>

        {error && (
          <div className="mt-4 flex items-start gap-2 text-sm text-error bg-error-container/20 p-3 rounded-xl">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={!checked || saving}
          className="mt-6 w-full bg-primary text-white font-black py-4 rounded-full atmospheric-shadow hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : 'Registrar consentimento'}
        </button>

        <p className="mt-4 text-[11px] text-on-surface-variant/70 text-center">
          Seu aceite fica registrado com data, hora, hash do termo e identificação. LGPD Art. 8º §6º.
        </p>
      </div>
    </div>
  );
}
