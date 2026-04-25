import React, { useState } from 'react';
import { Sparkles, ShieldAlert, CheckCircle2, MessageSquareWarning } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Aviso de uso de IA em decisão que afete o estudante (LGPD Art. 20; ECA Digital Art. 22).
 *
 * Papel:
 *  - Explicar que há sugestão automatizada
 *  - Indicar que a revisão humana é OBRIGATÓRIA (nenhuma decisão final é do modelo)
 *  - Oferecer botão "solicitar revisão" para contestar a saída (Art. 20 §1º)
 *
 * Uso típico:
 *  <IABanner
 *    feature="Convergência de instrumentos"
 *    onRequestReview={() => openReviewModal()}
 *  />
 */

interface IABannerProps {
  feature: string;
  /** Callback opcional — se fornecido, mostra o botão "Solicitar revisão humana". */
  onRequestReview?: () => void;
  /** Se o resultado já foi revisado e aprovado por um humano. */
  reviewed?: boolean;
  /** Variante visual: completa (default) ou compacta (em modais/cards). */
  variant?: 'default' | 'compact';
}

export default function IABanner({
  feature,
  onRequestReview,
  reviewed = false,
  variant = 'default',
}: IABannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-[11px] font-bold text-on-surface-variant bg-primary/5 border border-primary/10 rounded-full px-3 py-1.5">
        <Sparkles size={12} className="text-primary" />
        <span>
          Sugestão de IA — {reviewed ? 'revisada por humano' : 'aguarda revisão humana'}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-white to-primary/5 p-5">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          {reviewed ? <CheckCircle2 size={20} /> : <Sparkles size={20} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Decisão apoiada por IA
            </p>
            {reviewed ? (
              <span className="text-[10px] font-black uppercase tracking-[0.15em] bg-green-100 text-green-700 rounded-full px-2 py-0.5">
                Revisada
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-[0.15em] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
                Aguarda revisão humana
              </span>
            )}
          </div>

          <p className="text-sm font-bold text-on-surface mt-1">{feature}</p>

          <p className="text-sm text-on-surface-variant font-medium leading-relaxed mt-2">
            Esta sugestão foi gerada por um modelo de linguagem (Google Gemini) a partir dos
            instrumentos preenchidos. <strong>Nenhuma decisão educacional é tomada pelo modelo.</strong>
            Um profissional humano revisa, edita ou descarta cada saída antes de qualquer uso.
          </p>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-black text-primary mt-3 hover:underline"
          >
            {expanded ? 'Ocultar detalhes' : 'Saber mais sobre o uso de IA'}
          </button>

          {expanded && (
            <div className="mt-3 space-y-2 text-xs text-on-surface-variant font-medium leading-relaxed bg-white/60 rounded-xl p-3 border border-outline-variant/10">
              <p className="flex gap-2">
                <ShieldAlert size={14} className="text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Pseudonimização obrigatória:</strong> nome, escola, cidade, e-mail e
                  telefone são substituídos por tokens antes do envio. O modelo não recebe
                  identificadores diretos.
                </span>
              </p>
              <p className="flex gap-2">
                <ShieldAlert size={14} className="text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Sem treinamento:</strong> o provedor opera sob DPA com cláusula de não
                  uso dos dados para treinar modelos.
                </span>
              </p>
              <p className="flex gap-2">
                <ShieldAlert size={14} className="text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Transferência internacional:</strong> servidores nos EUA, amparo
                  contratual LGPD Art. 33 II-b. Detalhes em{' '}
                  <Link to="/privacidade" className="text-primary font-bold hover:underline">
                    Política de Privacidade
                  </Link>
                  .
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {onRequestReview && !reviewed && (
        <button
          onClick={onRequestReview}
          className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-primary/20 text-primary font-black text-xs px-4 py-2.5 rounded-full hover:bg-primary/5 transition"
        >
          <MessageSquareWarning size={14} />
          Solicitar revisão humana (LGPD Art. 20)
        </button>
      )}
    </div>
  );
}
