import React from 'react';
import { User, Brain, Lightbulb, Target, Users2, Sparkles, AlertCircle, ClipboardCheck, MessageCircle, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import type { HighlightSnippet } from '../types/database';
import { HighlightedText } from '../lib/highlightText';

// -----------------------------------------------------------------------------
// Tipos
// -----------------------------------------------------------------------------
type AnswerMap = Record<string, any>;

export interface IPSahsReaderProps {
  rawAnswers: AnswerMap;
  respondentName?: string;
  respondentRole?: string;
  completedAt?: string; // ISO
  /** Fichamentos já feitos deste registro (filtrados por source_record_id). */
  snippets?: HighlightSnippet[];
}

// -----------------------------------------------------------------------------
// Categorização SRBCSS-R dos 20 itens Likert (fornecida pelo usuário)
// -----------------------------------------------------------------------------
const LIKERT_ITEMS: { idx: number; label: string }[] = [
  { idx: 1,  label: 'Tem facilidade para aprender' },
  { idx: 2,  label: 'Demonstra vocabulário avançado para a idade/série' },
  { idx: 3,  label: 'Tem facilidade em fazer conexões entre disciplinas' },
  { idx: 4,  label: 'Mantém foco prolongado em temas específicos' },
  { idx: 5,  label: 'Mostra grande curiosidade e questiona frequentemente' },
  { idx: 6,  label: 'Resolve problemas de forma criativa, fora do convencional' },
  { idx: 7,  label: 'Propõe ideias ou soluções inusitadas em atividades' },
  { idx: 8,  label: 'Gosta de reinventar tarefas ou desafios propostos' },
  { idx: 9,  label: 'Expressa-se através de humor, sarcasmo, analogias ou metáforas' },
  { idx: 10, label: 'Cria histórias, desenhos ou jogos únicos' },
  { idx: 11, label: 'Mostra paixão por tópicos específicos' },
  { idx: 12, label: 'Busca ativamente materiais ou atividades além do currículo' },
  { idx: 13, label: 'Fica frustrado com tarefas repetitivas ou pouco desafiadoras' },
  { idx: 14, label: 'Se entedia facilmente com conteúdos apresentados em sala' },
  { idx: 15, label: 'Se distrai facilmente quando não está desafiado' },
  { idx: 16, label: 'Sensível a injustiças ou questões éticas (ex.: defende colegas)' },
  { idx: 17, label: 'Prefere trabalhar sozinho ou com alunos de mesma habilidade' },
  { idx: 18, label: 'Questiona regras ou autoridades quando não vê lógica nelas' },
  { idx: 19, label: 'Coopera bem em grupos' },
  { idx: 20, label: 'Tem grande atenção aos detalhes' }
];

const LIKERT_BLOCKS: {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorClass: string;
  bgClass: string;
  barClass: string;
  items: number[];
}[] = [
  {
    id: 'cognitivo',
    title: 'Habilidades Cognitivas e Intelectuais',
    subtitle: 'Aquisição, retenção e processamento de informações',
    icon: Brain,
    colorClass: 'text-purple-700',
    bgClass: 'bg-purple-50 border-purple-100',
    barClass: 'bg-purple-500',
    items: [1, 2, 3, 5, 20]
  },
  {
    id: 'criativo',
    title: 'Pensamento Criativo e Produtivo',
    subtitle: 'Originalidade, flexibilidade e soluções divergentes',
    icon: Lightbulb,
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-50 border-amber-100',
    barClass: 'bg-amber-500',
    items: [6, 7, 8, 9, 10]
  },
  {
    id: 'motivacao',
    title: 'Motivação e Envolvimento com a Tarefa',
    subtitle: 'Persistência e direcionamento intrínseco a interesses',
    icon: Target,
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50 border-emerald-100',
    barClass: 'bg-emerald-500',
    items: [4, 11, 12]
  },
  {
    id: 'socioemocional',
    title: 'Aspectos Socioemocionais e Comportamentais',
    subtitle: 'Ajustamento, afetividade e relações interpessoais',
    icon: Users2,
    colorClass: 'text-rose-700',
    bgClass: 'bg-rose-50 border-rose-100',
    barClass: 'bg-rose-500',
    items: [13, 14, 15, 16, 17, 18, 19]
  }
];

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
const hasText = (v: any) => typeof v === 'string' && v.trim().length > 0;
const hasArray = (v: any) => Array.isArray(v) && v.length > 0;

// -----------------------------------------------------------------------------
// Blocos de UI internos
// -----------------------------------------------------------------------------
function SectionShell({
  icon: Icon,
  title,
  subtitle,
  children
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <header className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/70">
        <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="font-black text-sm text-slate-800 tracking-tight">{title}</h3>
          {subtitle && <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </header>
      <div className="px-5 py-4 space-y-3 text-sm text-slate-700 leading-relaxed">{children}</div>
    </section>
  );
}

function TextBlock({ label, value, snippets }: { label?: string; value: string; snippets?: HighlightSnippet[] }) {
  if (!hasText(value)) return null;
  return (
    <div>
      {label && <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>}
      <p className="whitespace-pre-wrap"><HighlightedText text={value} snippets={snippets} /></p>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-xs italic text-slate-400">{text}</p>;
}

// -----------------------------------------------------------------------------
// Componente principal
// -----------------------------------------------------------------------------
export default function IPSahsReader({
  rawAnswers,
  respondentName,
  respondentRole,
  completedAt,
  snippets
}: IPSahsReaderProps) {
  const a = rawAnswers || {};

  // ---- 1. Perfil Comportamental (Likert) ---------------------------------
  const profileRaw: any = a.behavioral_profile;
  // Pode vir como array [v1, v2, ...] OU como objeto {1: 5, 2: 4, ...}
  const getLikert = (idx: number): number | null => {
    if (Array.isArray(profileRaw)) {
      const v = Number(profileRaw[idx - 1]);
      return Number.isFinite(v) && v > 0 ? v : null;
    }
    if (profileRaw && typeof profileRaw === 'object') {
      const v = Number(profileRaw[idx] ?? profileRaw[String(idx)]);
      return Number.isFinite(v) && v > 0 ? v : null;
    }
    return null;
  };

  const blocksWithData = LIKERT_BLOCKS.map(block => {
    const items = block.items.map(i => ({ idx: i, label: LIKERT_ITEMS.find(x => x.idx === i)!.label, value: getLikert(i) }));
    const filled = items.filter(x => x.value !== null) as { idx: number; label: string; value: number }[];
    const mean = filled.length ? filled.reduce((s, x) => s + x.value, 0) / filled.length : null;
    return { ...block, items, filled, mean };
  });
  const hasAnyLikert = blocksWithData.some(b => b.filled.length > 0);

  // ---- 4. Áreas de Interesse (chips) -------------------------------------
  const interests: string[] = hasArray(a.areas_of_interest) ? a.areas_of_interest : [];

  // ---- 8. Sugestões ------------------------------------------------------
  const suggestionsList: Array<{ component?: string; content?: string; methodology?: string }> = hasArray(a.suggestions) ? a.suggestions : [];
  const validSuggestions = suggestionsList.filter(s => hasText(s?.component) || hasText(s?.content) || hasText(s?.methodology));

  return (
    <div className="space-y-5">
      {/* Identificação */}
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <User size={18} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Respondente</p>
            <p className="text-sm font-bold text-slate-800">
              {respondentName || 'Sem identificação'}
              {respondentRole && <span className="text-slate-400 font-medium"> · {respondentRole}</span>}
            </p>
          </div>
          {completedAt && (
            <div className="text-right">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Preenchido em</p>
              <p className="text-sm font-bold text-slate-700">{new Date(completedAt).toLocaleDateString('pt-BR')}</p>
            </div>
          )}
        </div>
      </section>

      {/* 1. Perfil Comportamental agrupado (SRBCSS-R) */}
      {hasAnyLikert && (
        <SectionShell icon={ClipboardCheck} title="1. Perfil Comportamental" subtitle="Categorização SRBCSS-R · escala 1–5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {blocksWithData.map(b => {
              if (b.filled.length === 0) return null;
              const Icon = b.icon;
              return (
                <div key={b.id} className={cn('rounded-xl border p-4 space-y-3', b.bgClass)}>
                  <div className="flex items-start gap-2">
                    <Icon size={16} className={cn('mt-0.5 shrink-0', b.colorClass)} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-[11px] font-black uppercase tracking-wider', b.colorClass)}>{b.title}</p>
                      <p className="text-[10px] text-slate-500 leading-snug">{b.subtitle}</p>
                    </div>
                    {b.mean !== null && (
                      <div className="shrink-0 text-right">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Média</p>
                        <p className={cn('text-lg font-black leading-none', b.colorClass)}>{b.mean.toFixed(1)}</p>
                      </div>
                    )}
                  </div>
                  <ul className="space-y-1.5">
                    {b.items.map(item => (
                      <li key={item.idx} className="text-[12px] leading-snug">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400 w-6 shrink-0">{item.idx}.</span>
                          <span className="flex-1 text-slate-700">{item.label}</span>
                          <span className={cn('font-black text-xs tabular-nums shrink-0', item.value ? b.colorClass : 'text-slate-300')}>
                            {item.value ?? '—'}
                          </span>
                        </div>
                        <div className="ml-8 h-1 rounded-full bg-white/80 overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', item.value ? b.barClass : '')}
                            style={{ width: item.value ? `${(item.value / 5) * 100}%` : '0%' }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <TextBlock label="Outros comportamentos observados" value={a.other_behaviors} snippets={snippets} />
        </SectionShell>
      )}

      {/* 2. Interação Social */}
      {(hasText(a.social_interaction_option) || hasText(a.social_interaction_example)) && (
        <SectionShell icon={Users2} title="2. Interação Social">
          {hasText(a.social_interaction_option) && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Categoria</p>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                {a.social_interaction_option}
              </span>
            </div>
          )}
          <TextBlock label="Exemplo relatado" value={a.social_interaction_example} snippets={snippets} />
        </SectionShell>
      )}

      {/* 3. Reação a Desafios */}
      {(hasText(a.desafios_reacao_option) || hasText(a.desafios_reacao_example)) && (
        <SectionShell icon={AlertCircle} title="3. Reação a Desafios">
          {hasText(a.desafios_reacao_option) && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Categoria</p>
              <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold">
                {a.desafios_reacao_option}
              </span>
            </div>
          )}
          <TextBlock label="Exemplo relatado" value={a.desafios_reacao_example} snippets={snippets} />
        </SectionShell>
      )}

      {/* 4. Áreas de Interesse */}
      {(interests.length > 0 || hasText(a.other_interests)) && (
        <SectionShell icon={Sparkles} title="4. Áreas de Interesse">
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {interests.map((tag, i) => (
                <span key={i} className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold">{tag}</span>
              ))}
            </div>
          )}
          <TextBlock label="Outros interesses citados" value={a.other_interests} snippets={snippets} />
        </SectionShell>
      )}

      {/* 5. Potencialidades e Dificuldades */}
      {(hasText(a.potentialities_response) || hasText(a.pedagogical_difficulties_response) || hasText(a.demotivation_signs_response)) && (
        <SectionShell icon={Lightbulb} title="5. Potencialidades e Dificuldades">
          <TextBlock label="Potencialidades e facilidades" value={a.potentialities_response} snippets={snippets} />
          <TextBlock label="Maiores dificuldades pedagógicas" value={a.pedagogical_difficulties_response} snippets={snippets} />
          <TextBlock label="Sinais de desmotivação" value={a.demotivation_signs_response} snippets={snippets} />
        </SectionShell>
      )}

      {/* 6. Necessidades */}
      {(hasText(a.needs_pedagogical) || hasText(a.needs_behavioral) || hasText(a.needs_emotional)) && (
        <SectionShell icon={Target} title="6. Necessidades do Estudante">
          <TextBlock label="Necessidades Pedagógicas" value={a.needs_pedagogical} snippets={snippets} />
          <TextBlock label="Necessidades Comportamentais" value={a.needs_behavioral} snippets={snippets} />
          <TextBlock label="Necessidades Emocionais" value={a.needs_emotional} snippets={snippets} />
        </SectionShell>
      )}

      {/* 7. Estratégia Adotada */}
      {(typeof a.adopted_strategy === 'boolean' || hasText(a.strategy_experience_response)) && (
        <SectionShell icon={ClipboardCheck} title="7. Estratégia Pedagógica Adotada">
          {typeof a.adopted_strategy === 'boolean' && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Já adotou estratégia?</p>
              <span className={cn(
                'inline-block px-3 py-1 rounded-full text-xs font-bold',
                a.adopted_strategy ? 'bg-green-100 text-green-900' : 'bg-slate-100 text-slate-700'
              )}>
                {a.adopted_strategy ? 'Sim' : 'Não'}
              </span>
            </div>
          )}
          <TextBlock label="Experiência e eficácia" value={a.strategy_experience_response} snippets={snippets} />
        </SectionShell>
      )}

      {/* 8. Sugestões */}
      {validSuggestions.length > 0 && (
        <SectionShell icon={MessageCircle} title="8. Sugestões para o Plano de Suplementação">
          <div className="space-y-3">
            {validSuggestions.map((s, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {hasText(s.component) && (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-primary/10 text-primary">
                      {s.component}
                    </span>
                  )}
                  {hasText(s.content) && (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-slate-200 text-slate-700">
                      {s.content}
                    </span>
                  )}
                </div>
                {hasText(s.methodology) && (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    <HighlightedText text={s.methodology!} snippets={snippets} />
                  </p>
                )}
              </div>
            ))}
          </div>
        </SectionShell>
      )}

      {/* 9. Observações / Informações Adicionais */}
      {hasText(a.additional_notes) && (
        <SectionShell icon={FileText} title="9. Observações / Informações Adicionais">
          <TextBlock value={a.additional_notes} snippets={snippets} />
        </SectionShell>
      )}

      {/* Fallback: se nada foi reconhecido, orienta usuário */}
      {!hasAnyLikert &&
        !hasText(a.social_interaction_option) && !hasText(a.social_interaction_example) &&
        !hasText(a.desafios_reacao_option) && !hasText(a.desafios_reacao_example) &&
        interests.length === 0 && !hasText(a.other_interests) &&
        !hasText(a.potentialities_response) && !hasText(a.pedagogical_difficulties_response) &&
        !hasText(a.demotivation_signs_response) &&
        !hasText(a.needs_pedagogical) && !hasText(a.needs_behavioral) && !hasText(a.needs_emotional) &&
        typeof a.adopted_strategy !== 'boolean' && !hasText(a.strategy_experience_response) &&
        validSuggestions.length === 0 && !hasText(a.additional_notes) && (
          <EmptyHint text="Este registro não contém campos estruturados reconhecíveis do IP-SAHS." />
        )}
    </div>
  );
}
