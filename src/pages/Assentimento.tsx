import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Eye, Edit3, Trash2, Download, XCircle, HelpCircle } from 'lucide-react';
import PublicPageLayout from '../components/PublicPageLayout';

interface RightCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}

function RightCard({ icon: Icon, title, children }: RightCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-outline-variant/10 flex gap-4">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
        <Icon size={20} />
      </div>
      <div>
        <p className="font-black text-on-surface mb-1">{title}</p>
        <p className="text-sm text-on-surface-variant font-medium leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

export default function Assentimento() {
  return (
    <PublicPageLayout
      eyebrow="Para você, estudante"
      title="Termo de Assentimento"
      subtitle="Este documento é feito especialmente para você entender. Peça ajuda a um adulto de confiança (pai, mãe, professor) para ler junto se quiser."
      contentMaxWidth="max-w-2xl"
    >
      <div className="bg-gradient-to-br from-orange-50 via-white to-indigo-50 rounded-3xl p-8 border border-outline-variant/10 atmospheric-shadow">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="text-primary" size={28} />
          <p className="text-2xl font-black text-on-surface">Oi! 👋</p>
        </div>
        <p className="text-on-surface-variant font-semibold leading-relaxed">
          Você foi convidado(a) a participar de uma coisa legal chamada <strong className="text-on-surface">Singul-AH</strong>.
          Antes de começar, a gente quer te explicar o que é, do jeito mais claro possível.
          Se tiver qualquer dúvida, <strong className="text-primary">pergunte!</strong> Pergunta não é errado.
        </p>
      </div>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-black tracking-tight text-on-surface">O que é o Singul-AH?</h2>
        <p className="text-on-surface-variant font-medium leading-relaxed">
          É um sistema de computador que ajuda a sua escola a entender <strong>como você aprende melhor</strong>, do que você gosta, no que você é bom(boa) e no que você precisa de mais apoio. Com isso, seus professores podem montar um <strong>plano especial</strong> de atividades, feito para você — chamado <strong>PEI</strong> (Plano Educacional Individualizado).
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-black tracking-tight text-on-surface">O que vai acontecer?</h2>
        <ul className="space-y-3 text-on-surface-variant font-medium leading-relaxed list-disc pl-6 marker:text-primary">
          <li>Você vai <strong>responder algumas perguntas</strong> sobre você, seus interesses, como você se sente na escola. Pode responder escrevendo ou falando (tem um botão de microfone 🎤).</li>
          <li>Seus <strong>professores</strong> também vão responder perguntas sobre você.</li>
          <li>Seus <strong>pais ou responsáveis</strong> também vão responder.</li>
          <li>Um programa de computador (IA — <strong>inteligência artificial</strong>) vai juntar tudo e dar <strong>sugestões</strong> para os professores. Mas quem decide o que fazer é <strong>sempre uma pessoa adulta</strong>, não o computador.</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-black tracking-tight text-on-surface">Quem vai ver suas respostas?</h2>
        <ul className="space-y-2 text-on-surface-variant font-medium leading-relaxed list-disc pl-6 marker:text-primary">
          <li>Seus pais ou responsáveis (eles autorizaram antes);</li>
          <li>Seu(sua) professor(a) regente e o(a) professor(a) do AEE;</li>
          <li>O pesquisador Giovani, que cuida do sistema;</li>
          <li>Às vezes, outros pesquisadores da Universidade — mas só com seu nome trocado por um código.</li>
        </ul>
        <p className="bg-primary/5 rounded-2xl p-4 border border-primary/10 text-sm font-semibold text-on-surface">
          <strong>Ninguém mais vai ver.</strong> Não sai na internet, não vai para redes sociais, não vira propaganda, não é vendido.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-black tracking-tight text-on-surface">E se eu não quiser?</h2>
        <ul className="space-y-2 text-on-surface-variant font-medium leading-relaxed list-disc pl-6 marker:text-primary">
          <li><strong>Você pode não responder.</strong> Sem problema. Ninguém vai ficar bravo.</li>
          <li><strong>Você pode parar no meio.</strong></li>
          <li><strong>Você pode pedir para apagar</strong> o que já respondeu.</li>
          <li><strong>Não vai afetar suas notas</strong>, seu atendimento na escola, nem como as pessoas te tratam.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black tracking-tight text-on-surface mb-4">Seus direitos</h2>
        <p className="text-on-surface-variant font-medium leading-relaxed mb-5">
          Tem uma lei no Brasil chamada <strong>LGPD</strong> que protege seus dados. Por causa dela, você pode:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <RightCard icon={Eye} title="Ver">Tudo o que tem guardado sobre você.</RightCard>
          <RightCard icon={Edit3} title="Corrigir">Se tiver algo errado.</RightCard>
          <RightCard icon={Trash2} title="Apagar">O que você quiser.</RightCard>
          <RightCard icon={Download} title="Baixar">Seus dados em um arquivo.</RightCard>
          <RightCard icon={XCircle} title="Cancelar">A participação a qualquer momento.</RightCard>
          <RightCard icon={HelpCircle} title="Perguntar">Qualquer coisa, qualquer hora.</RightCard>
        </div>
        <p className="mt-5 text-sm text-on-surface-variant font-medium">
          É só falar com um adulto de confiança ou escrever para:{' '}
          <a href="mailto:giovani.silva@castanhal.ufpa.br" className="text-primary font-bold">
            giovani.silva@castanhal.ufpa.br
          </a>
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-black tracking-tight text-on-surface">Seus dados vão ficar seguros?</h2>
        <p className="text-on-surface-variant font-medium leading-relaxed">
          Sim! Tudo fica guardado com <strong>senha e criptografia</strong> (tipo um cofre digital 🔒). Se alguma coisa der errado, a gente avisa você e seus pais rapidinho.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-black tracking-tight text-on-surface">E se eu mudar de ideia depois?</h2>
        <p className="text-on-surface-variant font-medium leading-relaxed">
          Pode mudar. A qualquer hora. Sem explicação. Sem problema. É só avisar. 💛
        </p>
      </section>

      {/* Aceite */}
      <section className="mt-14 bg-gradient-to-br from-primary/10 via-white to-primary/5 rounded-3xl p-8 border border-primary/20 atmospheric-shadow text-center">
        <p className="text-lg font-semibold text-on-surface-variant mb-2">Você topa?</p>
        <p className="text-sm text-on-surface-variant/80 font-medium max-w-md mx-auto leading-relaxed">
          Se você leu (ou leu com alguém), entendeu, perguntou o que quis e está tranquilo(a) para participar, o aceite é feito dentro do sistema, junto com quem cuida de você.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 bg-primary text-white px-6 py-3 rounded-full font-black text-sm hover:brightness-105 transition"
        >
          Voltar ao início
        </Link>
      </section>

      <div className="mt-10 text-xs text-on-surface-variant/70 italic text-center">
        Este assentimento segue as recomendações da Resolução CNS 510/2016 e do Art. 18 §1º da Lei 15.211/2025 (ECA Digital). Versão em áudio e versão ilustrada disponíveis mediante solicitação.
      </div>
    </PublicPageLayout>
  );
}
