import React, { useEffect, useState } from 'react';
import {
  Eye, Edit3, Download, Trash2, XCircle, ShieldCheck, Info, Loader2,
  FileText, HelpCircle, AlertTriangle, Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { listConsents, revokeConsent, type ConsentRecord } from '../lib/consent';

/**
 * Portal de direitos do titular (LGPD Art. 18; ECA Digital Art. 18).
 *
 * Ofertas:
 *  - Ver consentimentos ativos e histórico
 *  - Revogar consentimento
 *  - Solicitar eliminação (Art. 18 V) — gera pedido em data_erasure_log
 *  - Solicitar portabilidade (Art. 18 V) — export JSON
 *  - Solicitar correção (Art. 18 III)
 */

type RequestKind = 'eliminacao' | 'portabilidade' | 'correcao';

export default function MeusDados() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const rows = await listConsents({ titularId: user.id });
        setConsents(rows);
      } catch (err: any) {
        setError(err.message ?? 'Falha ao carregar consentimentos');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleRevoke = async (id: string) => {
    if (!confirm('Revogar este consentimento? Você pode concedê-lo novamente depois.')) return;
    setBusy(true);
    try {
      await revokeConsent(id, 'Revogação via Portal Meus Dados');
      setConsents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, revogado_em: new Date().toISOString() } : c))
      );
      setNotice('Consentimento revogado.');
    } catch (err: any) {
      setError(err.message ?? 'Falha ao revogar');
    } finally {
      setBusy(false);
    }
  };

  const handleRequest = async (tipo: RequestKind) => {
    if (!user) return;
    const motivo = prompt(
      tipo === 'eliminacao'
        ? 'Deseja informar o motivo da eliminação? (opcional)'
        : tipo === 'portabilidade'
        ? 'Algum detalhe sobre a portabilidade? (opcional)'
        : 'Descreva o dado a corrigir:'
    );
    if (tipo === 'correcao' && !motivo) return;

    setBusy(true);
    try {
      // Hash do user.id para armazenar em data_erasure_log sem id em claro pós-eliminação
      const buf = new TextEncoder().encode(user.id);
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', buf)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const { error: insErr } = await supabase.from('data_erasure_log').insert({
        titular_id_hash: hash,
        tipo: tipo === 'portabilidade' ? 'anonimizacao' : tipo === 'correcao' ? 'revogacao_consent' : 'eliminacao',
        base_legal:
          tipo === 'eliminacao'
            ? 'LGPD Art. 18 VI'
            : tipo === 'portabilidade'
            ? 'LGPD Art. 18 V'
            : 'LGPD Art. 18 III',
        canal_solicitacao: 'web',
        observacao: motivo ?? null,
        operador_id: user.id,
      });
      if (insErr) throw insErr;
      setNotice(
        tipo === 'eliminacao'
          ? 'Pedido de eliminação registrado. Prazo de resposta: até 15 dias (Art. 19 II).'
          : tipo === 'portabilidade'
          ? 'Pedido de portabilidade registrado. Enviaremos o arquivo JSON ao seu e-mail.'
          : 'Pedido de correção registrado.'
      );
    } catch (err: any) {
      setError(err.message ?? 'Falha ao registrar pedido');
    } finally {
      setBusy(false);
    }
  };

  const actions = [
    {
      icon: Eye,
      title: 'Acessar meus dados',
      desc: 'Ver tudo o que o sistema guarda sobre você ou seu dependente.',
      action: () => handleRequest('portabilidade'),
      cta: 'Exportar JSON',
      base: 'Art. 18 II + V',
    },
    {
      icon: Edit3,
      title: 'Corrigir',
      desc: 'Solicite correção de informação incompleta, inexata ou desatualizada.',
      action: () => handleRequest('correcao'),
      cta: 'Pedir correção',
      base: 'Art. 18 III',
    },
    {
      icon: Download,
      title: 'Portabilidade',
      desc: 'Receba seus dados em formato estruturado (JSON), para levar a outro serviço.',
      action: () => handleRequest('portabilidade'),
      cta: 'Solicitar portabilidade',
      base: 'Art. 18 V',
    },
    {
      icon: Trash2,
      title: 'Eliminar',
      desc: 'Apague dados tratados com base em consentimento. Registros de pesquisa anonimizados podem ser mantidos.',
      action: () => handleRequest('eliminacao'),
      cta: 'Solicitar eliminação',
      base: 'Art. 18 VI',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Cabeçalho */}
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
          LGPD Art. 18 · ECA Digital Art. 18
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-on-surface mt-2 tracking-tight">
          Meus Dados
        </h1>
        <p className="text-on-surface-variant font-medium mt-3 leading-relaxed max-w-2xl">
          Exercite aqui seus direitos de titular de dados. As solicitações são respondidas em até{' '}
          <strong>15 dias</strong> pelo encarregado Giovani Vasconcelos.
        </p>
      </div>

      {notice && (
        <div className="mb-6 flex items-start gap-2 bg-green-50 border border-green-200 text-green-800 rounded-2xl p-4">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" />
          <span className="text-sm font-semibold">{notice}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-2 bg-error-container/20 border border-error/20 text-error rounded-2xl p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Ações de direitos */}
      <section className="grid md:grid-cols-2 gap-4 mb-12">
        {actions.map(({ icon: Icon, title, desc, action, cta, base }) => (
          <div
            key={title}
            className="bg-white rounded-3xl p-6 border border-outline-variant/10 flex flex-col"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon size={20} />
              </div>
              <div>
                <p className="font-black text-on-surface">{title}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {base}
                </p>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant font-medium leading-relaxed flex-1">
              {desc}
            </p>
            <button
              onClick={action}
              disabled={busy}
              className="mt-4 inline-flex items-center justify-center gap-2 bg-primary text-white font-black text-xs px-4 py-3 rounded-full hover:brightness-105 active:scale-[0.98] transition disabled:opacity-50"
            >
              {busy ? <Loader2 className="animate-spin" size={14} /> : cta}
            </button>
          </div>
        ))}
      </section>

      {/* Consentimentos */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-on-surface tracking-tight">
            Meus consentimentos
          </h2>
          <Link
            to="/termo-consentimento"
            className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
          >
            <FileText size={12} /> Ler termo
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : consents.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 text-center">
            <Info className="mx-auto text-on-surface-variant/40 mb-2" size={24} />
            <p className="text-sm text-on-surface-variant font-semibold">
              Nenhum consentimento registrado ainda.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {consents.map((c) => {
              const active = !c.revogado_em;
              return (
                <li
                  key={c.id}
                  className="bg-white rounded-2xl p-5 border border-outline-variant/10 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-on-surface text-sm">{consentLabel(c.tipo)}</p>
                      <span
                        className={
                          'text-[10px] font-black uppercase tracking-widest rounded-full px-2 py-0.5 ' +
                          (active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-500')
                        }
                      >
                        {active ? 'Ativo' : 'Revogado'}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Versão {c.versao_termo} · aceito em{' '}
                      {new Date(c.aceito_em).toLocaleDateString('pt-BR')}
                      {c.revogado_em && (
                        <>
                          {' · '}revogado em {new Date(c.revogado_em).toLocaleDateString('pt-BR')}
                        </>
                      )}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 truncate mt-1">
                      hash: {c.hash_termo.slice(0, 16)}…
                    </p>
                  </div>
                  {active && (
                    <button
                      onClick={() => handleRevoke(c.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-2 text-xs font-black text-error border border-error/30 rounded-full px-4 py-2 hover:bg-error/5 transition disabled:opacity-50"
                    >
                      <XCircle size={14} /> Revogar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Contato DPO */}
      <section className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
        <div className="flex gap-4">
          <HelpCircle className="text-primary shrink-0 mt-1" size={22} />
          <div className="text-sm text-on-surface-variant font-medium leading-relaxed space-y-2">
            <p className="font-bold text-on-surface">
              Precisa de ajuda ou quer escalar a solicitação?
            </p>
            <p>
              Fale diretamente com o encarregado (DPO) por e-mail:{' '}
              <a
                href="mailto:giovani.silva@castanhal.ufpa.br"
                className="text-primary font-bold inline-flex items-center gap-1"
              >
                <Mail size={12} /> giovani.silva@castanhal.ufpa.br
              </a>
            </p>
            <p className="text-xs">
              Se a resposta não for satisfatória, você pode peticionar à ANPD em{' '}
              <a
                href="https://www.gov.br/anpd"
                target="_blank"
                rel="noreferrer"
                className="text-primary font-bold hover:underline"
              >
                www.gov.br/anpd
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function consentLabel(tipo: ConsentRecord['tipo']): string {
  switch (tipo) {
    case 'tcle_responsavel':
      return 'Consentimento do responsável (TCLE)';
    case 'assentimento_menor':
      return 'Assentimento do estudante';
    case 'tcle_maior':
      return 'Consentimento direto (maior de idade)';
    case 'termo_docente':
      return 'Termo de uso docente';
    case 'termo_pesquisa':
      return 'Participação em pesquisa (anonimizada)';
  }
}
