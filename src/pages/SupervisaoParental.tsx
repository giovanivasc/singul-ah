import React, { useEffect, useState } from 'react';
import { Users, Loader2, ShieldCheck, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ParentalControl, { type ParentalControlsShape } from '../components/ParentalControl';

/**
 * Página de supervisão parental (ECA Digital Art. 17 e 18).
 * Lista vínculos do usuário-responsável e expõe controles por estudante.
 */

interface ParentalLinkRow {
  id: string;
  student_id: string;
  responsavel_nome: string;
  vinculo: string;
  controles: ParentalControlsShape;
  verificado: boolean;
  students?: { id: string; name?: string } | null;
}

export default function SupervisaoParental() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<ParentalLinkRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data, error: selErr } = await supabase
          .from('parental_links')
          .select('id,student_id,responsavel_nome,vinculo,controles,verificado,students(id,name)')
          .eq('responsavel_id', user.id)
          .is('revoked_at', null);
        if (selErr) throw selErr;
        setLinks((data ?? []) as unknown as ParentalLinkRow[]);
      } catch (err: any) {
        setError(err.message ?? 'Falha ao carregar vínculos');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
          ECA Digital Art. 17
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-on-surface mt-2 tracking-tight">
          Supervisão Parental
        </h1>
        <p className="text-on-surface-variant font-medium mt-3 leading-relaxed max-w-2xl">
          Aqui você define como o sistema trata os dados do(a) estudante sob sua responsabilidade.
          As escolhas padrão priorizam privacidade (<em>privacy-by-default</em>) e podem ser ajustadas
          a qualquer momento.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-error-container/20 border border-error/20 text-error rounded-2xl p-4 text-sm font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : links.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-outline-variant/10 text-center">
          <Users className="mx-auto text-on-surface-variant/40 mb-3" size={32} />
          <p className="text-on-surface font-black mb-2">Nenhum vínculo ativo</p>
          <p className="text-sm text-on-surface-variant font-medium max-w-md mx-auto">
            Se você é responsável legal por um(a) estudante cadastrado(a), peça ao professor para
            registrar seu vínculo no sistema.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {links.map((link) => (
            <section
              key={link.id}
              className="bg-gradient-to-br from-white via-white to-primary/5 rounded-3xl p-6 border border-outline-variant/10 atmospheric-shadow"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Estudante
                  </p>
                  <p className="text-xl font-black text-on-surface">
                    {link.students?.name ?? `#${link.student_id.slice(0, 8)}`}
                  </p>
                  <p className="text-xs text-on-surface-variant font-semibold mt-1">
                    Vínculo: {link.vinculo} · {link.verificado ? 'verificado' : 'aguardando verificação'}
                  </p>
                </div>
              </div>

              <ParentalControl
                linkId={link.id}
                controles={link.controles}
                readOnly={!link.verificado}
              />

              {!link.verificado && (
                <div className="mt-4 flex gap-2 text-xs text-on-surface-variant bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Este vínculo ainda não foi verificado. Controles ficam travados até o professor
                    confirmar presencialmente ou por documento.
                  </span>
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <div className="mt-10 text-xs text-on-surface-variant/70 text-center">
        Consulte também os seus direitos como titular em{' '}
        <Link to="/meus-dados" className="text-primary font-bold hover:underline">
          Meus Dados
        </Link>
        .
      </div>
    </div>
  );
}
