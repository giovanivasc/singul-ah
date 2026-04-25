import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Loader2, AlertTriangle, Mail, RefreshCcw } from 'lucide-react';

/**
 * Componente de verificação OTP (6 dígitos) para autenticar destinatário
 * de link público (família — LGPD Art. 14 §5º).
 *
 * Lógica de envio/verificação fica na Edge Function; o componente apenas
 * orquestra UI e chama os callbacks.
 */

interface OTPVerifyProps {
  /** E-mail mascarado a exibir (ex.: "j***@gmail.com"). */
  maskedRecipient: string;
  /** Callback para (re)enviar OTP. Retorna Promise que resolve ao sucesso. */
  onSendCode: () => Promise<void>;
  /** Callback de verificação. Retorna Promise com boolean. */
  onVerify: (code: string) => Promise<boolean>;
  /** Acionado após verificação bem-sucedida. */
  onSuccess: () => void;
  /** Intervalo mínimo entre reenvios (segundos). */
  resendCooldownSec?: number;
}

export default function OTPVerify({
  maskedRecipient,
  onSendCode,
  onVerify,
  onSuccess,
  resendCooldownSec = 60,
}: OTPVerifyProps) {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [stage, setStage] = useState<'idle' | 'sending' | 'waiting' | 'verifying' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleSend = async () => {
    setStage('sending');
    setError(null);
    try {
      await onSendCode();
      setStage('waiting');
      setCooldown(resendCooldownSec);
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } catch (err: any) {
      setError(err.message ?? 'Falha ao enviar código');
      setStage('error');
    }
  };

  const handleChange = (idx: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...code];
    next[idx] = value;
    setCode(next);
    if (value && idx < 5) inputsRef.current[idx + 1]?.focus();
    if (next.every((d) => d.length === 1)) {
      void handleVerify(next.join(''));
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async (fullCode: string) => {
    setStage('verifying');
    setError(null);
    try {
      const ok = await onVerify(fullCode);
      if (ok) {
        onSuccess();
      } else {
        setError('Código incorreto. Verifique e tente novamente.');
        setStage('waiting');
        setCode(['', '', '', '', '', '']);
        inputsRef.current[0]?.focus();
      }
    } catch (err: any) {
      setError(err.message ?? 'Falha ao verificar código');
      setStage('error');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 atmospheric-shadow max-w-md w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <ShieldCheck size={22} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Verificação em duas etapas
          </p>
          <h2 className="text-lg font-black text-on-surface">Confirme que é você</h2>
        </div>
      </div>

      <p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-6 flex items-center gap-2">
        <Mail size={14} className="text-primary shrink-0" />
        Enviaremos um código de 6 dígitos para <strong>{maskedRecipient}</strong>.
      </p>

      {stage === 'idle' && (
        <button
          onClick={handleSend}
          className="w-full bg-primary text-white font-black py-4 rounded-full atmospheric-shadow hover:brightness-105 transition"
        >
          Enviar código
        </button>
      )}

      {stage === 'sending' && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      )}

      {(stage === 'waiting' || stage === 'verifying') && (
        <>
          <div className="grid grid-cols-6 gap-2">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={stage === 'verifying'}
                className="w-full aspect-square text-center text-2xl font-black border border-outline-variant/30 rounded-2xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none bg-surface-container-low/50"
              />
            ))}
          </div>

          {stage === 'verifying' && (
            <div className="flex items-center justify-center mt-4 gap-2 text-sm text-on-surface-variant">
              <Loader2 className="animate-spin" size={16} />
              <span>Verificando…</span>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={cooldown > 0}
            className="mt-6 w-full text-xs font-bold text-primary hover:underline disabled:text-on-surface-variant/50 disabled:no-underline flex items-center justify-center gap-2"
          >
            <RefreshCcw size={12} />
            {cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar código'}
          </button>
        </>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 text-sm text-error bg-error-container/20 p-3 rounded-xl">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
