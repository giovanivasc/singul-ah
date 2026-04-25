import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import PublicPageLayout from '../components/PublicPageLayout';

export default function TermoConsentimento() {
  return (
    <PublicPageLayout
      eyebrow="LGPD Art. 8º + Art. 14 §1º"
      title="Termo de Consentimento Livre e Esclarecido"
      subtitle="Destinado aos responsáveis legais de estudantes. Versão v1.0 — 23/04/2026."
    >
      {/* Aviso importante */}
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 mb-10 flex gap-4">
        <div className="shrink-0 w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
          <Info size={20} />
        </div>
        <div>
          <p className="font-black text-amber-900 mb-1">Esta página é meramente informativa.</p>
          <p className="text-sm text-amber-900/80 font-medium leading-relaxed">
            O aceite efetivo do consentimento é realizado <strong>dentro do sistema</strong>, no momento da primeira coleta (formulário IF-SAHS), com registro de identidade, timestamp, IP, user-agent e versão do documento aceita, nos termos do Art. 8º §2º LGPD (ônus da prova do controlador).
          </p>
        </div>
      </div>

      <article className="bg-white rounded-3xl p-8 border border-outline-variant/10 atmospheric-shadow space-y-8 text-on-surface-variant font-medium leading-relaxed [&_strong]:text-on-surface [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-on-surface [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:tracking-tight [&_h3]:text-base [&_h3]:font-black [&_h3]:text-on-surface [&_h3]:mt-5 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:marker:text-primary/50 [&_a]:text-primary [&_a:hover]:underline">
        <header>
          <h2 className="!mt-0">Identificação</h2>
          <ul>
            <li><strong>Controlador / Pesquisador responsável:</strong> Giovani Vasconcelos da Silva e Silva</li>
            <li><strong>Instituição:</strong> PPGEAA — Universidade Federal do Pará, Campus de Castanhal</li>
            <li><strong>Contato:</strong> <a href="mailto:giovani.silva@castanhal.ufpa.br">giovani.silva@castanhal.ufpa.br</a></li>
            <li><strong>Sistema:</strong> Singul-AH — Portal de apoio ao PEI para AH/SD</li>
          </ul>
        </header>

        <div>
          <h2>Eu, responsável legal, DECLARO que:</h2>

          <h3>1. Fui informado(a) com clareza sobre:</h3>

          <p><strong>a)</strong> O Singul-AH é um sistema piloto, em fase de pesquisa de mestrado, destinado a apoiar a equipe pedagógica na elaboração do PEI do(a) meu(minha) filho(a) / tutelado(a).</p>

          <p><strong>b)</strong> Participar é <strong>voluntário</strong> e <strong>gratuito</strong>. A negativa <strong>não implicará qualquer prejuízo</strong> ao atendimento educacional — a escola continua obrigada legalmente a prestar o AEE, com ou sem o sistema.</p>

          <p><strong>c)</strong> Os dados coletados incluem:</p>
          <ul>
            <li>Identificação do(a) estudante (nome, idade, escola, turma);</li>
            <li>Minha percepção sobre comportamento, interesses, habilidades e contexto familiar, via <strong>IF-SAHS</strong>;</li>
            <li>Eventualmente, áudios das respostas (se eu optar por gravar);</li>
            <li>Respostas do(a) próprio(a) estudante (N-ILS, entrevista) e observações de professores;</li>
            <li>Dados gerados por IA a partir das informações acima.</li>
          </ul>

          <p><strong>d)</strong> Esses dados são considerados <strong>pessoais sensíveis</strong> (LGPD Art. 5º II) e <strong>de criança/adolescente</strong>, exigindo proteção reforçada (Art. 14).</p>

          <h3>2. Autorizo o tratamento para as seguintes finalidades específicas:</h3>
          <ul>
            <li>Elaboração do PEI em conjunto com a escola;</li>
            <li>Pesquisa acadêmica vinculada à dissertação de mestrado, com <strong>pseudonimização</strong> antes de qualquer publicação;</li>
            <li>Aprimoramento técnico do sistema, com dados agregados e não-identificáveis.</li>
          </ul>

          <h3>3. Estou ciente de que:</h3>
          <ul>
            <li>Os dados serão armazenados com criptografia em trânsito e em repouso;</li>
            <li>Parte do processamento é feita por IA (Google Gemini), sempre com <strong>revisão humana obrigatória</strong> (Art. 20);</li>
            <li>Os dados serão armazenados por até <strong>5 anos após a conclusão do ensino</strong> na escola atual, e depois anonimizados irreversivelmente;</li>
            <li>Dados vinculados à dissertação seguem o prazo da Res. CNS 466/2012 (5 anos após publicação);</li>
            <li>Poderão acessar, sob sigilo: equipe pedagógica; pesquisador; orientador; banca (pseudonimizado);</li>
            <li>Os dados <strong>não serão vendidos, alugados ou cedidos</strong> comercialmente.</li>
          </ul>

          <h3>4. Meus direitos (LGPD Art. 18)</h3>
          <p>Posso, gratuitamente e sem justificar: confirmar o tratamento, acessar, corrigir, anonimizar, portar, eliminar, ser informado sobre compartilhamentos, e <strong>revogar este consentimento a qualquer momento</strong>.</p>
          <p>Canal: <Link to="/login">/meus-dados</Link> após login, ou <a href="mailto:giovani.silva@castanhal.ufpa.br">giovani.silva@castanhal.ufpa.br</a>. Resposta em até 15 dias.</p>

          <h3>5. Riscos e benefícios</h3>
          <p><strong>Riscos:</strong> risco mínimo de exposição em caso de incidente; serei comunicado(a) em até 2 dias úteis (Art. 48). Nenhum dado é usado para publicidade, perfilamento comercial ou discriminação.</p>
          <p><strong>Benefícios:</strong> apoio técnico à elaboração de um PEI fundamentado em múltiplos informantes (família, professor regente, AEE e o(a) próprio(a) estudante).</p>

          <h3>6. Base legal</h3>
          <ul>
            <li><strong>LGPD Art. 7º, III</strong> (política pública educacional — LDB e Diretrizes do AEE);</li>
            <li><strong>LGPD Art. 7º, IV</strong> (pesquisa por órgão de pesquisa — PPGEAA/UFPA);</li>
            <li><strong>LGPD Art. 11, II, "b"</strong> e <strong>"c"</strong>;</li>
            <li><strong>LGPD Art. 14, §1º</strong> (este consentimento específico e destacado);</li>
            <li><strong>Resoluções CNS 466/2012 e 510/2016</strong>;</li>
            <li><strong>Parecer do CEP</strong> (quando aplicável).</li>
          </ul>
        </div>

        <section className="bg-primary/5 rounded-2xl p-6 border border-primary/10 not-prose mt-10">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="text-primary" size={22} />
            <h3 className="!mt-0 !mb-0 text-primary text-lg">Consentimento digital no sistema</h3>
          </div>
          <p className="text-sm text-on-surface-variant font-medium">
            Ao aceitar este termo dentro do sistema, será registrado: seu nome e e-mail autenticado, versão do termo (v1.0), timestamp UTC, IP e user-agent, hash do documento. Uma via é enviada por e-mail para você.
          </p>
        </section>
      </article>

      {/* Rodapé CTA */}
      <div className="mt-10 bg-white rounded-3xl p-6 border border-outline-variant/10 atmospheric-shadow flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-primary shrink-0" size={24} />
          <p className="text-sm font-semibold text-on-surface-variant">
            Leu, entendeu e está pronto(a) para consentir? O aceite é feito ao iniciar o IF-SAHS.
          </p>
        </div>
        <Link
          to="/privacidade"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
        >
          <AlertCircle size={16} />
          Ler também a Política de Privacidade
        </Link>
      </div>
    </PublicPageLayout>
  );
}
