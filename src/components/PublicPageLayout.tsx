import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SingulAhLogo, { SingulAhMark, SingulAhWordmark } from './SingulAhLogo';
import { cn } from '../lib/utils';

export interface PublicPageLayoutProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: React.ReactNode;
  /** Mostra link "voltar ao início" no topo. Default: true */
  showBack?: boolean;
  /** largura do conteúdo (tailwind) — default: max-w-3xl */
  contentMaxWidth?: string;
}

/**
 * Layout reutilizado pelas páginas públicas legais/institucionais:
 * Política de Privacidade, Termo de Consentimento, Assentimento, Encarregado, etc.
 */
export default function PublicPageLayout({
  title,
  subtitle,
  eyebrow,
  children,
  showBack = true,
  contentMaxWidth = 'max-w-3xl'
}: PublicPageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition">
            <SingulAhMark size={32} />
            <SingulAhWordmark className="text-lg" />
          </Link>
          <nav className="flex items-center gap-6 text-xs font-bold text-on-surface-variant">
            <Link to="/privacidade" className="hover:text-primary transition">Privacidade</Link>
            <Link to="/encarregado" className="hover:text-primary transition">Encarregado</Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:brightness-105 transition"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="w-full bg-white border-b border-slate-100">
        <div className={cn('mx-auto px-6 pt-10 pb-12', contentMaxWidth)}>
          {showBack && (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant/70 hover:text-primary transition mb-8"
            >
              <ArrowLeft size={14} />
              Voltar ao início
            </Link>
          )}
          {eyebrow && (
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">
              {eyebrow}
            </p>
          )}
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-on-surface-variant font-medium leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Conteúdo */}
      <main className={cn('flex-1 w-full mx-auto px-6 py-12', contentMaxWidth)}>
        {children}
      </main>

      {/* Footer institucional */}
      <footer className="w-full bg-white border-t border-slate-100 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <SingulAhLogo variant="compact" />
              <p className="mt-3 text-xs text-on-surface-variant/70 leading-relaxed max-w-[280px]">
                Sistema piloto de pesquisa do PPGEAA — UFPA para apoio à elaboração de PEI de estudantes com Altas Habilidades / Superdotação.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                Privacidade
              </h4>
              <ul className="space-y-2 text-sm font-medium">
                <li><Link to="/privacidade" className="text-on-surface-variant hover:text-primary">Política de Privacidade</Link></li>
                <li><Link to="/termo-consentimento" className="text-on-surface-variant hover:text-primary">Termo de Consentimento</Link></li>
                <li><Link to="/assentimento" className="text-on-surface-variant hover:text-primary">Assentimento do Estudante</Link></li>
                <li><Link to="/encarregado" className="text-on-surface-variant hover:text-primary">Encarregado (DPO)</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                Controlador
              </h4>
              <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                Giovani Vasconcelos da Silva e Silva<br />
                PPGEAA — UFPA / Castanhal<br />
                <a
                  href="mailto:giovani.silva@castanhal.ufpa.br"
                  className="text-primary hover:underline break-all"
                >
                  giovani.silva@castanhal.ufpa.br
                </a>
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 text-[11px] text-on-surface-variant/60 font-medium flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <span>© 2026 Singul-AH · PPGEAA/UFPA. Conforme LGPD (Lei 13.709/2018) e ECA Digital (Lei 15.211/2025).</span>
            <span>Versão de documentos: v1.0 · 23/04/2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
