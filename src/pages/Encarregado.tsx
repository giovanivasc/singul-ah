import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ClipboardCheck, MessageSquare } from 'lucide-react';
import PublicPageLayout from '../components/PublicPageLayout';

export default function Encarregado() {
  return (
    <PublicPageLayout
      eyebrow="LGPD Art. 41"
      title="Encarregado pelo Tratamento de Dados"
      subtitle="Ponto de contato oficial para qualquer assunto relacionado à privacidade e proteção dos seus dados pessoais no Singul-AH."
      contentMaxWidth="max-w-3xl"
    >
      {/* Cartão principal */}
      <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 atmospheric-shadow">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ClipboardCheck size={32} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
              Encarregado / DPO
            </p>
            <h2 className="text-2xl font-black text-on-surface mt-1 tracking-tight">
              Giovani Vasconcelos da Silva e Silva
            </h2>
            <p className="text-on-surface-variant font-semibold mt-2">
              Controlador e Encarregado (acumulação nos termos do Art. 41 §3º LGPD, por tratar-se de organização de pequeno porte em fase de pesquisa piloto).
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-8">
          <a
            href="mailto:giovani.silva@castanhal.ufpa.br"
            className="flex items-center gap-4 p-5 rounded-2xl border border-outline-variant/10 hover:border-primary/30 hover:bg-primary/5 transition"
          >
            <Mail className="text-primary shrink-0" size={22} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">E-mail</p>
              <p className="font-bold text-on-surface break-all">giovani.silva@castanhal.ufpa.br</p>
            </div>
          </a>
          <div className="flex items-center gap-4 p-5 rounded-2xl border border-outline-variant/10">
            <MapPin className="text-primary shrink-0" size={22} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Instituição</p>
              <p className="font-bold text-on-surface">PPGEAA — UFPA</p>
              <p className="text-xs text-on-surface-variant">Campus de Castanhal, Pará</p>
            </div>
          </div>
        </div>
      </div>

      {/* Atribuições do Encarregado */}
      <section className="mt-12">
        <h3 className="text-xl font-black text-on-surface mb-6 tracking-tight">
          Atribuições do Encarregado (Art. 41 §2º)
        </h3>
        <ul className="space-y-3">
          {[
            'Aceitar reclamações e comunicações dos titulares, prestar esclarecimentos e adotar providências;',
            'Receber comunicações da Autoridade Nacional (ANPD) e adotar providências;',
            'Orientar funcionários e contratados quanto às práticas de proteção de dados;',
            'Supervisionar o cumprimento da LGPD e do ECA Digital no âmbito do Singul-AH;',
            'Manter registros de operações de tratamento (Art. 37) e o Relatório de Impacto (Art. 38).'
          ].map((item, i) => (
            <li key={i} className="flex gap-3 bg-white rounded-2xl p-4 border border-outline-variant/10">
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-sm text-on-surface-variant font-medium leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Como contatar */}
      <section className="mt-12">
        <h3 className="text-xl font-black text-on-surface mb-6 tracking-tight">
          Como entrar em contato
        </h3>
        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
          <div className="flex gap-4">
            <MessageSquare className="text-primary shrink-0 mt-1" size={22} />
            <div className="text-sm text-on-surface-variant font-medium leading-relaxed space-y-2">
              <p>
                <strong className="text-on-surface">Por e-mail:</strong>{' '}
                <a href="mailto:giovani.silva@castanhal.ufpa.br" className="text-primary font-bold">
                  giovani.silva@castanhal.ufpa.br
                </a>
              </p>
              <p>
                <strong className="text-on-surface">Assuntos sugeridos no título:</strong> "LGPD — [acesso / correção / eliminação / portabilidade / revogação / dúvida]" ou "ECA Digital — [tipo]".
              </p>
              <p>
                <strong className="text-on-surface">Prazo de resposta:</strong> até <strong>15 dias</strong> (Art. 19 II). Solicitações simples de confirmação são respondidas imediatamente.
              </p>
              <p>
                <strong className="text-on-surface">Custo:</strong> gratuito (Art. 18 §5º).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Escalada */}
      <section className="mt-12">
        <h3 className="text-xl font-black text-on-surface mb-6 tracking-tight">
          Se a resposta não for satisfatória
        </h3>
        <div className="bg-white rounded-3xl p-6 border border-outline-variant/10">
          <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
            Você pode peticionar diretamente à <strong className="text-on-surface">Agência Nacional de Proteção de Dados (ANPD)</strong>, nos termos do Art. 18 §1º da LGPD:
          </p>
          <a
            href="https://www.gov.br/anpd"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-primary font-black hover:underline"
          >
            www.gov.br/anpd →
          </a>
          <p className="text-xs text-on-surface-variant/70 mt-3 italic">
            A ANPD é o órgão federal responsável por zelar, implementar e fiscalizar o cumprimento da LGPD em todo o território nacional.
          </p>
        </div>
      </section>

      {/* Links */}
      <div className="mt-14 flex flex-wrap gap-3">
        <Link
          to="/privacidade"
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full text-sm font-black hover:brightness-105 transition"
        >
          Política de Privacidade
        </Link>
        <Link
          to="/termo-consentimento"
          className="inline-flex items-center gap-2 bg-white border border-outline-variant/20 text-on-surface px-5 py-3 rounded-full text-sm font-black hover:border-primary/30 transition"
        >
          Termo de Consentimento
        </Link>
        <Link
          to="/assentimento"
          className="inline-flex items-center gap-2 bg-white border border-outline-variant/20 text-on-surface px-5 py-3 rounded-full text-sm font-black hover:border-primary/30 transition"
        >
          Assentimento do Estudante
        </Link>
      </div>
    </PublicPageLayout>
  );
}
