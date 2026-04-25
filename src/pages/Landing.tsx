import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight, Sparkles, Users, ClipboardCheck, Network, FileText, Brain,
  ShieldCheck, GraduationCap, CheckCircle2, Highlighter, LineChart, BookOpen
} from 'lucide-react';
import SingulAhLogo, { SingulAhMark, SingulAhWordmark } from '../components/SingulAhLogo';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Subcomponentes locais
// ---------------------------------------------------------------------------
function SectionHeader({
  eyebrow, title, subtitle
}: { eyebrow: string; title: React.ReactNode; subtitle?: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto text-center mb-16">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-3">{eyebrow}</p>
      <h2 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface leading-[1.1]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-lg text-on-surface-variant/80 leading-relaxed font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function FeatureCard({
  icon: Icon, title, description, accent = 'orange'
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  accent?: 'orange' | 'indigo' | 'amber' | 'emerald' | 'rose' | 'sky';
}) {
  const palette: Record<string, { bg: string; text: string }> = {
    orange: { bg: 'bg-orange-100', text: 'text-orange-700' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    amber:  { bg: 'bg-amber-100',  text: 'text-amber-700'  },
    emerald:{ bg: 'bg-emerald-100', text: 'text-emerald-700' },
    rose:   { bg: 'bg-rose-100',    text: 'text-rose-700'    },
    sky:    { bg: 'bg-sky-100',     text: 'text-sky-700'     }
  };
  const p = palette[accent];
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="bg-white rounded-[28px] p-7 border border-slate-100 hover:border-slate-200 atmospheric-shadow transition-colors"
    >
      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-5', p.bg, p.text)}>
        <Icon size={22} />
      </div>
      <h3 className="text-lg font-black text-on-surface mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-on-surface-variant/80 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StepCard({
  n, icon: Icon, title, description
}: {
  n: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="relative bg-white rounded-[28px] p-7 border border-slate-100 atmospheric-shadow">
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-lg shadow-primary/30">
        {n}
      </div>
      <Icon size={28} className="text-primary mb-4 mt-1" />
      <h3 className="text-lg font-black text-on-surface mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-on-surface-variant/80 leading-relaxed">{description}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------
export default function Landing() {
  const { user } = useAuth();
  const primaryCtaLabel = user ? 'Ir para o dashboard' : 'Entrar na plataforma';
  const primaryCtaTo = user ? '/dashboard' : '/login';

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-background to-background text-outline">
      {/* ===== Top navigation ===== */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <SingulAhMark size={32} />
            <SingulAhWordmark className="text-lg" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-on-surface-variant">
            <a href="#sobre" className="hover:text-primary transition-colors">Sobre</a>
            <a href="#funcionalidades" className="hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="hover:text-primary transition-colors">Como funciona</a>
            <a href="#pesquisa" className="hover:text-primary transition-colors">Pesquisa</a>
          </nav>
          <Link
            to={primaryCtaTo}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-105 active:scale-[0.98] transition-all"
          >
            {user ? 'Dashboard' : 'Entrar'}
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" aria-hidden />
        <div className="absolute top-40 -left-24 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl" aria-hidden />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 md:pt-28 pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-black uppercase tracking-[0.25em] mb-6">
              <Sparkles size={12} /> Altas Habilidades · Superdotação · Educação Inclusiva
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-on-surface leading-[1.02]">
              Ensine o singular.{' '}
              <span className="bg-gradient-to-r from-amber-400 via-primary to-indigo-600 bg-clip-text text-transparent">
                Reconheça cada brilho.
              </span>
            </h1>
            <p className="mt-7 text-lg md:text-xl text-on-surface-variant/80 leading-relaxed font-medium max-w-2xl mx-auto">
              <span className="font-bold text-on-surface">Singul-AH</span> é uma plataforma de apoio pedagógico
              que auxilia o professor a identificar, compreender e atender estudantes com{' '}
              <span className="font-bold text-on-surface">Altas Habilidades/Superdotação</span> na Educação Básica —
              integrando instrumentos validados, análise multi-informante e IA com rastreabilidade.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to={primaryCtaTo}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-white font-black text-base shadow-xl shadow-primary/25 hover:brightness-105 active:scale-[0.98] transition-all"
              >
                {primaryCtaLabel}
                <ArrowRight size={18} />
              </Link>
              <a
                href="#sobre"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-white border border-slate-200 text-on-surface font-bold text-base hover:border-primary/40 hover:text-primary transition-colors"
              >
                Conhecer o projeto
              </a>
            </div>
          </motion.div>

          {/* Hero visual — logo grande */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 md:mt-24 flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-amber-300/40 via-primary/30 to-indigo-500/30 rounded-full" aria-hidden />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-[48px] p-14 md:p-20 border border-white/60 shadow-2xl shadow-primary/10">
                <SingulAhMark size={200} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Sobre / Problema ===== */}
      <section id="sobre" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow="O desafio"
            title={<>Identificar superdotação exige <span className="text-primary">escuta plural</span>.</>}
            subtitle={<>Elaborar um Plano de Suplementação Pedagógica tradicional consome tempo, esforço metodológico e conhecimento técnico que nem sempre o professor dispõe — tornando a prática inviável na maioria das escolas brasileiras.</>}
          />

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-[28px] p-8 border border-slate-100 atmospheric-shadow">
              <div className="text-5xl font-black text-primary mb-3">~ 2 a 5%</div>
              <p className="text-sm text-on-surface-variant/80 leading-relaxed">
                da população estudantil apresenta indicadores de <strong>Altas Habilidades/Superdotação</strong>,
                mas a maioria segue invisível nas redes regulares de ensino.
              </p>
            </div>
            <div className="bg-white rounded-[28px] p-8 border border-slate-100 atmospheric-shadow">
              <div className="text-5xl font-black text-indigo-600 mb-3">3+</div>
              <p className="text-sm text-on-surface-variant/80 leading-relaxed">
                perspectivas são necessárias para um diagnóstico robusto: <strong>professor regente, AEE
                e família</strong> — cada uma observa o aluno em contextos diferentes.
              </p>
            </div>
            <div className="bg-white rounded-[28px] p-8 border border-slate-100 atmospheric-shadow">
              <div className="text-5xl font-black text-amber-600 mb-3">1 PEI</div>
              <p className="text-sm text-on-surface-variant/80 leading-relaxed">
                feito manualmente pode consumir <strong>semanas</strong> do professor entre coleta, análise,
                triangulação e redação — inviável sem apoio metodológico.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Funcionalidades ===== */}
      <section id="funcionalidades" className="py-24 md:py-32 bg-gradient-to-b from-background via-orange-50/30 to-background">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow="Funcionalidades"
            title={<>Uma caixa de ferramentas <span className="text-primary">metodologicamente fundamentada</span>.</>}
            subtitle="Cada tela do Singul-AH resolve uma etapa específica do processo de identificação e planejamento — com instrumentos validados e rastreabilidade total da origem dos dados."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={Users}
              accent="orange"
              title="Coleta multi-informante"
              description="Instrumentos IP-SAHS (professor), IF-SAHS (família) e N-ILS (estudante) aplicados em fluxos digitais — com links de acesso externos para famílias."
            />
            <FeatureCard
              icon={ClipboardCheck}
              accent="indigo"
              title="Perfil SRBCSS-R"
              description="Os 20 itens Likert do IP-SAHS são automaticamente organizados nos 4 blocos teóricos: cognitivo, criativo, motivacional e socioemocional."
            />
            <FeatureCard
              icon={LineChart}
              accent="amber"
              title="Visão Agregada"
              description="Consolidação estatística determinística (médias, desvios-padrão, divergências σ > 1.2) que cruza respondentes sem interpretação subjetiva."
            />
            <FeatureCard
              icon={Highlighter}
              accent="emerald"
              title="Fichamento categorizado"
              description="Destaque trechos relevantes das respostas em 4 categorias — demandas, contexto, potencialidades, dúvidas — com rastreabilidade até o respondente."
            />
            <FeatureCard
              icon={Network}
              accent="rose"
              title="Análise de Convergência com IA"
              description="A IA recebe dados estruturados + fichamentos e entrega um mapeamento nos 4 eixos do Plano — com edição fina e persistência automática."
            />
            <FeatureCard
              icon={FileText}
              accent="sky"
              title="Plano de Suplementação"
              description="Construção assistida do PEI com os eixos Características, Competências, Ensino e Avaliação — versionado e exportável."
            />
          </div>
        </div>
      </section>

      {/* ===== Como funciona ===== */}
      <section id="como-funciona" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow="Fluxo"
            title={<>Quatro passos, um caminho <span className="text-primary">claro</span>.</>}
            subtitle="Do primeiro indicador até o plano pronto para aplicação, o Singul-AH organiza cada etapa para que o professor possa focar no que realmente importa: a escuta do estudante."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            <StepCard
              n="01"
              icon={Users}
              title="Coleta"
              description="Instrumentos digitais preenchidos por professor, família e estudante em diferentes contextos."
            />
            <StepCard
              n="02"
              icon={Highlighter}
              title="Fichamento"
              description="Leitura estruturada e marcação de trechos por categoria pedagógica, preservando autoria."
            />
            <StepCard
              n="03"
              icon={Network}
              title="Convergência"
              description="Agregação estatística + síntese por IA nos 4 eixos do Plano, editável a qualquer tempo."
            />
            <StepCard
              n="04"
              icon={FileText}
              title="Plano"
              description="Plano de Suplementação Pedagógica construído, versionado e pronto para ser aplicado em sala."
            />
          </div>
        </div>
      </section>

      {/* ===== Pesquisa / Fundamento ===== */}
      <section id="pesquisa" className="py-24 md:py-32 bg-on-surface text-white relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl" aria-hidden />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl" aria-hidden />

        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-3">Fundamento acadêmico</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
              Pesquisa, metodologia, <span className="text-primary">transparência</span>.
            </h2>
            <p className="mt-6 text-lg text-white/70 max-w-3xl mx-auto leading-relaxed font-medium">
              O Singul-AH nasce de um estudo de mestrado voltado à sistematização de procedimentos metodológicos
              para aplicação de Tecnologias Digitais no ensino de alunos com AH/SD na Educação Básica.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-[28px] p-7 border border-white/10">
              <GraduationCap className="text-primary mb-4" size={28} />
              <h3 className="font-black text-lg mb-2">Instrumentos validados</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                IP-SAHS, IF-SAHS e N-ILS — todos referenciados na literatura brasileira e aplicados conforme protocolos da área.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-[28px] p-7 border border-white/10">
              <BookOpen className="text-primary mb-4" size={28} />
              <h3 className="font-black text-lg mb-2">SRBCSS-R</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                O perfil comportamental se apoia nas 4 dimensões clássicas de Renzulli, com agregação estatística rigorosa.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-[28px] p-7 border border-white/10">
              <ShieldCheck className="text-primary mb-4" size={28} />
              <h3 className="font-black text-lg mb-2">IA com rastreabilidade</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Cada inferência da IA é ancorada em dados de origem identificável — respondente, contexto e data — evitando hipóteses soltas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA final ===== */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <SingulAhLogo variant="stacked" markSize={72} />
          <h2 className="mt-8 text-4xl md:text-5xl font-black tracking-tight text-on-surface leading-[1.1]">
            Pronto para começar?
          </h2>
          <p className="mt-5 text-lg text-on-surface-variant/80 leading-relaxed font-medium max-w-2xl mx-auto">
            Entre com sua conta e transforme a maneira como sua escola enxerga — e atende — os estudantes
            com Altas Habilidades/Superdotação.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to={primaryCtaTo}
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-primary text-white font-black text-lg shadow-xl shadow-primary/25 hover:brightness-105 active:scale-[0.98] transition-all"
            >
              {primaryCtaLabel}
              <ArrowRight size={20} />
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> Sem custo para escolas públicas</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> Dados do estudante protegidos</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> Exportável em PDF</span>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10 text-sm">
            <div className="flex flex-col gap-3">
              <SingulAhLogo variant="compact" markSize={32} />
              <p className="text-on-surface-variant/60 font-medium max-w-sm">
                Portal de Educação Individualizada — apoio metodológico à identificação e ao atendimento de
                estudantes com AH/SD na Educação Básica.
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">
                Privacidade & Dados
              </h4>
              <ul className="space-y-2 font-medium">
                <li><Link to="/privacidade" className="text-on-surface-variant hover:text-primary">Política de Privacidade</Link></li>
                <li><Link to="/termo-consentimento" className="text-on-surface-variant hover:text-primary">Termo de Consentimento</Link></li>
                <li><Link to="/assentimento" className="text-on-surface-variant hover:text-primary">Assentimento do Estudante</Link></li>
                <li><Link to="/encarregado" className="text-on-surface-variant hover:text-primary">Encarregado (DPO)</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">
                Pesquisa
              </h4>
              <p className="text-on-surface-variant font-medium leading-relaxed">
                Giovani Vasconcelos da Silva e Silva<br />
                PPGEAA — UFPA / Castanhal<br />
                <a href="mailto:giovani.silva@castanhal.ufpa.br" className="text-primary hover:underline break-all text-xs">
                  giovani.silva@castanhal.ufpa.br
                </a>
              </p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-on-surface-variant/60 font-medium">
            <p className="flex items-center gap-2">
              <Brain size={14} /> Pesquisa em Educação Especial Inclusiva
            </p>
            <p>© {new Date().getFullYear()} Singul-AH · PPGEAA/UFPA · Conforme LGPD (13.709/2018) e ECA Digital (15.211/2025).</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
