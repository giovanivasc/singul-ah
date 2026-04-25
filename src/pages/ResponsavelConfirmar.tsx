import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SingulAhMark } from '../components/SingulAhLogo';

/**
 * Página pública de confirmação de vínculo parental.
 *
 * Acessada pelo link enviado por e-mail ao responsável legal cadastrado pelo
 * docente no momento do cadastro do estudante ≤16 anos.
 *
 * Base legal:
 *   LGPD Art. 14 §5º — esforços razoáveis para verificar o consentimento
 *                       efetivamente dado pelo responsável.
 *   ECA Digital Art. 14 — verificação ativa do responsável legal.
 */
export default function ResponsavelConfirmar() {
  const { token } = useParams();
  const [stage, setStage] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [responsavelNome, setResponsavelNome] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!token) {
        setErrorMsg('Link de confirmação inválido.');
        setStage('error');
        return;
      }
      try {
        const { data, error } = await supabase.functions.invoke('parental-verify-confirm', {
          body: { token },
        });
        if (cancelled) return;
        if (error || !data?.ok) {
          const msg =
            (data && typeof data.error === 'string' && data.error) ||
            (error && error.message) ||
            'Não foi possível confirmar o vínculo.';
          setErrorMsg(msg);
          setStage('error');
          return;
        }
        setStudentName(data.studentName ?? null);
        setResponsavelNome(data.responsavelNome ?? null);
        setStage('success');
      } catch (err: any) {
        if (cancelled) return;
        setErrorMsg(err?.message ?? 'Erro ao confirmar o vínculo.');
        setStage('error');
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <header className="w-full bg-white flex flex-col items-center pt-8 pb-6 border-b border-slate-100">
        <SingulAhMark size={40} className="mb-2" />
        <h1 className="text-sm font-black text-on-surface-variant uppercase tracking-[0.2em]">
          Confirmação de vínculo parental
        </h1>
      </header>

      <main className="flex-1 w-full max-w-md px-4 py-10 flex items-center justify-center">
        {stage === 'verifying' && (
          <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 atmospheric-shadow w-full text-center">
            <Loader2 className="animate-spin text-primary mx-auto mb-4" size={36} />
            <p className="text-base font-bold text-on-surface">Verificando seu link…</p>
            <p className="text-sm text-on-surface-variant mt-2">
              Confirmando que o pedido de verificação é válido.
            </p>
          </div>
        )}

        {stage === 'success' && (
          <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 atmospheric-shadow w-full">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
                <CheckCircle2 size={26} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-700">
                  Vínculo confirmado
                </p>
                <h2 className="text-lg font-black text-on-surface">Tudo certo!</h2>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
              {responsavelNome ? (
                <>
                  Olá, <strong>{responsavelNome}</strong>. Confirmamos seu vínculo como
                  responsável legal
                  {studentName ? (
                    <>
                      {' '}
                      de <strong>{studentName}</strong>
                    </>
                  ) : null}{' '}
                  no sistema Singul-AH.
                </>
              ) : (
                <>O vínculo parental foi confirmado com sucesso.</>
              )}
            </p>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-xs text-on-surface-variant leading-relaxed">
              <p className="font-bold text-primary mb-1 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Próximos passos
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  Você pode revisar e ajustar a qualquer momento os dados do(a) estudante e os
                  controles de supervisão parental no portal de acompanhamento.
                </li>
                <li>
                  Para revogar este consentimento ou solicitar a eliminação dos dados, entre em
                  contato com o encarregado:{' '}
                  <a
                    className="text-primary underline"
                    href="mailto:giovani.silva@castanhal.ufpa.br"
                  >
                    giovani.silva@castanhal.ufpa.br
                  </a>
                </li>
              </ul>
            </div>

            <p className="text-[11px] text-on-surface-variant/70 mt-5 text-center">
              LGPD Art. 14 §5º · ECA Digital Art. 14
            </p>
          </div>
        )}

        {stage === 'error' && (
          <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 atmospheric-shadow w-full">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-error-container/30 text-error flex items-center justify-center">
                <AlertTriangle size={26} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-error">
                  Não foi possível confirmar
                </p>
                <h2 className="text-lg font-black text-on-surface">Link inválido ou expirado</h2>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
              {errorMsg ?? 'O link pode ter expirado ou já ter sido utilizado.'}
            </p>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Se você é o responsável legal e ainda deseja confirmar o vínculo, peça à escola
              que reenvie o e-mail de verificação. Em caso de dúvida, contate o encarregado pelo
              tratamento de dados:{' '}
              <a className="text-primary underline" href="mailto:giovani.silva@castanhal.ufpa.br">
                giovani.silva@castanhal.ufpa.br
              </a>
              .
            </p>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-xs font-bold text-primary hover:underline"
              >
                Voltar à página inicial
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
