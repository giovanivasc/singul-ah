import React from 'react';
import {
  Users, Brain, Lightbulb, Target, Users2, Sparkles, AlertCircle,
  ClipboardCheck, MessageCircle, FileText, TriangleAlert, Info, CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import type {
  AggregatedIPSahs, LikertBlockAgg, TextEntry, FrequencyEntry, AggregatedAlert
} from '../lib/ipsahs/aggregator';
import type { HighlightSnippet } from '../types/database';
import { HighlightedText } from '../lib/highlightText';

interface Props {
  data: AggregatedIPSahs;
  /** Quando true, envolve cada bloco de texto com `data-source-id/table/respondent/role` para permitir fichamento com rastreabilidade. */
  fichable?: boolean;
  /** Marcadores já existentes. Cada bloco filtra pelos que correspondem ao seu sourceId. */
  snippets?: HighlightSnippet[];
}

const BLOCK_STYLE: Record<LikertBlockAgg['id'], { icon: React.ComponentType<any>; color: string; bg: string; bar: string }> = {
  cognitivo:      { icon: Brain,     color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-100',   bar: 'bg-purple-500' },
  criativo:       { icon: Lightbulb, color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-100',     bar: 'bg-amber-500' },
  motivacao:      { icon: Target,    color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100', bar: 'bg-emerald-500' },
  socioemocional: { icon: Users2,    color: 'text-rose-700',    bg: 'bg-rose-50 border-rose-100',       bar: 'bg-rose-500' }
};

const ALERT_STYLE: Record<AggregatedAlert['severity'], { icon: React.ComponentType<any>; classes: string }> = {
  info: { icon: Info,          classes: 'bg-blue-50 border-blue-200 text-blue-900' },
  warn: { icon: TriangleAlert, classes: 'bg-amber-50 border-amber-200 text-amber-900' },
  high: { icon: CheckCircle2,  classes: 'bg-emerald-50 border-emerald-200 text-emerald-900' }
};

function SectionShell({
  icon: Icon, title, subtitle, children, count
}: {
  icon: React.ComponentType<any>;
  title: string;
  subtitle?: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <header className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/70">
        <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-sm text-slate-800 tracking-tight">{title}</h3>
          {subtitle && <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {typeof count === 'number' && count > 0 && (
          <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-slate-400">{count} {count === 1 ? 'relato' : 'relatos'}</span>
        )}
      </header>
      <div className="px-5 py-4 text-sm text-slate-700 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function TextList({ entries, snippets }: { entries: TextEntry[]; snippets?: HighlightSnippet[] }) {
  if (entries.length === 0) return null;
  return (
    <ul className="space-y-3">
      {entries.map((e, i) => (
        <li
          key={`${e.sourceId}-${i}`}
          className="border-l-2 border-slate-200 pl-3"
          data-source-id={e.sourceId}
          data-source-table={e.sourceTable}
          data-respondent={e.respondent}
          data-role={e.role}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            {e.respondent}{e.role ? ` · ${e.role}` : ''}
          </p>
          <p className="whitespace-pre-wrap text-sm text-slate-700">
            <HighlightedText text={e.text} snippets={snippets} filterSourceId={e.sourceId} />
          </p>
        </li>
      ))}
    </ul>
  );
}

function FreqChips({ entries, chipClass = 'bg-indigo-100 text-indigo-900' }: { entries: FrequencyEntry[]; chipClass?: string }) {
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(e => (
        <span key={e.label} className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold', chipClass)}>
          {e.label}
          <span className="text-[10px] font-black uppercase tracking-widest opacity-70">×{e.count}</span>
        </span>
      ))}
    </div>
  );
}

export default function IPSahsAggregatedView({ data, fichable = false, snippets }: Props) {
  return (
    <div className="space-y-5">
      {/* Cabeçalho: respondentes */}
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visão Agregada</p>
            <p className="text-sm font-bold text-slate-800">
              {data.nRespondents} {data.nRespondents === 1 ? 'respondente consolidado' : 'respondentes consolidados'} · dados calculados estatisticamente
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.respondents.map(r => (
            <span key={r.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">{r.name}</span>
              {r.role && <span className="text-slate-400">· {r.role}</span>}
              {r.dateISO && <span className="text-slate-300">· {new Date(r.dateISO).toLocaleDateString('pt-BR')}</span>}
            </span>
          ))}
        </div>
        <div className="mt-3 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-[11px] font-medium text-blue-800 flex items-start gap-2">
          <Info size={14} className="shrink-0 mt-0.5" />
          {fichable ? (
            <span>
              Você pode <strong>fichar trechos</strong> também nesta visão — a seleção precisa ficar contida em um único bloco para preservar a rastreabilidade do respondente de origem.
            </span>
          ) : (
            <span>Esta visão é <strong>read-only</strong>. Para fichar trechos, abra uma versão individual no seletor acima.</span>
          )}
        </div>
      </section>

      {/* Alertas determinísticos */}
      {data.alerts.length > 0 && (
        <section className="space-y-2">
          <h3 className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Alertas automáticos · regras determinísticas</h3>
          {data.alerts.map((alert, i) => {
            const style = ALERT_STYLE[alert.severity];
            const Icon = style.icon;
            return (
              <div key={i} className={cn('rounded-xl border px-4 py-3 flex items-start gap-3', style.classes)}>
                <Icon size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">{alert.title}</p>
                  <p className="text-xs font-medium opacity-90 mt-0.5 leading-relaxed">{alert.details}</p>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* 1. Perfil Comportamental agregado */}
      <SectionShell icon={ClipboardCheck} title="1. Perfil Comportamental" subtitle="Média + desvio-padrão por item (SRBCSS-R)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.likertBlocks.map(b => {
            const style = BLOCK_STYLE[b.id];
            const Icon = style.icon;
            if (b.n === 0) return null;
            return (
              <div key={b.id} className={cn('rounded-xl border p-4 space-y-3', style.bg)}>
                <div className="flex items-start gap-2">
                  <Icon size={16} className={cn('mt-0.5 shrink-0', style.color)} />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-[11px] font-black uppercase tracking-wider', style.color)}>{b.title}</p>
                    <p className="text-[10px] text-slate-500 leading-snug">{b.subtitle}</p>
                  </div>
                  {b.blockMean !== null && (
                    <div className="shrink-0 text-right">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Média do bloco</p>
                      <p className={cn('text-lg font-black leading-none', style.color)}>{b.blockMean.toFixed(2)}</p>
                    </div>
                  )}
                </div>
                <ul className="space-y-2">
                  {b.items.map(it => (
                    <li key={it.idx} className={cn('text-[12px] leading-snug', it.divergent && 'ring-2 ring-amber-300/60 rounded-md p-1 -m-1')}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 w-6 shrink-0">{it.idx}.</span>
                        <span className="flex-1 text-slate-700">{it.label}</span>
                        <span className={cn('font-black text-xs tabular-nums shrink-0', it.mean !== null ? style.color : 'text-slate-300')}>
                          {it.mean !== null ? it.mean.toFixed(1) : '—'}
                        </span>
                      </div>
                      <div className="ml-8 h-1 rounded-full bg-white/80 overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', it.mean !== null ? style.bar : '')}
                          style={{ width: it.mean !== null ? `${(it.mean / 5) * 100}%` : '0%' }}
                        />
                      </div>
                      <div className="ml-8 mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
                        {it.values.map((v, i) => (
                          <span key={i}>
                            <span className="font-bold">{v.respondent}:</span> {v.value}/5
                          </span>
                        ))}
                        {it.stddev !== null && (
                          <span className={cn('font-bold', it.divergent ? 'text-amber-700' : 'text-slate-400')}>
                            σ={it.stddev.toFixed(2)}{it.divergent && ' ⚠'}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {data.otherBehaviors.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 mt-2">Outros comportamentos observados</p>
            <TextList entries={data.otherBehaviors} snippets={snippets} />
          </div>
        )}
      </SectionShell>

      {/* 2. Interação Social */}
      {(data.interactionSocial.length > 0 || data.socialInteractionExamples.length > 0) && (
        <SectionShell icon={Users2} title="2. Interação Social">
          {data.interactionSocial.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Distribuição de categorias</p>
              <FreqChips entries={data.interactionSocial} chipClass="bg-emerald-100 text-emerald-900" />
            </div>
          )}
          {data.socialInteractionExamples.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Exemplos relatados</p>
              <TextList entries={data.socialInteractionExamples} snippets={snippets} />
            </div>
          )}
        </SectionShell>
      )}

      {/* 3. Reação a Desafios */}
      {(data.desafiosReacao.length > 0 || data.desafiosReacaoExamples.length > 0) && (
        <SectionShell icon={AlertCircle} title="3. Reação a Desafios">
          {data.desafiosReacao.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Distribuição de categorias</p>
              <FreqChips entries={data.desafiosReacao} chipClass="bg-orange-100 text-orange-900" />
            </div>
          )}
          {data.desafiosReacaoExamples.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Exemplos relatados</p>
              <TextList entries={data.desafiosReacaoExamples} snippets={snippets} />
            </div>
          )}
        </SectionShell>
      )}

      {/* 4. Interesses */}
      {(data.interests.length > 0 || data.otherInterests.length > 0) && (
        <SectionShell icon={Sparkles} title="4. Áreas de Interesse">
          {data.interests.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Áreas citadas (frequência agregada)</p>
              <FreqChips entries={data.interests} />
            </div>
          )}
          {data.otherInterests.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Outros interesses citados</p>
              <TextList entries={data.otherInterests} snippets={snippets} />
            </div>
          )}
        </SectionShell>
      )}

      {/* 5. Potencialidades & Dificuldades */}
      {(data.potentialities.length > 0 || data.difficulties.length > 0 || data.demotivation.length > 0) && (
        <SectionShell icon={Lightbulb} title="5. Potencialidades e Dificuldades"
          count={data.potentialities.length + data.difficulties.length + data.demotivation.length}>
          {data.potentialities.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Potencialidades e facilidades</p>
              <TextList entries={data.potentialities} snippets={snippets} />
            </div>
          )}
          {data.difficulties.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Maiores dificuldades pedagógicas</p>
              <TextList entries={data.difficulties} snippets={snippets} />
            </div>
          )}
          {data.demotivation.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Sinais de desmotivação</p>
              <TextList entries={data.demotivation} snippets={snippets} />
            </div>
          )}
        </SectionShell>
      )}

      {/* 6. Necessidades */}
      {(data.needsPedagogical.length > 0 || data.needsBehavioral.length > 0 || data.needsEmotional.length > 0) && (
        <SectionShell icon={Target} title="6. Necessidades do Estudante"
          count={data.needsPedagogical.length + data.needsBehavioral.length + data.needsEmotional.length}>
          {data.needsPedagogical.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pedagógicas</p>
              <TextList entries={data.needsPedagogical} snippets={snippets} />
            </div>
          )}
          {data.needsBehavioral.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Comportamentais</p>
              <TextList entries={data.needsBehavioral} snippets={snippets} />
            </div>
          )}
          {data.needsEmotional.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Emocionais</p>
              <TextList entries={data.needsEmotional} snippets={snippets} />
            </div>
          )}
        </SectionShell>
      )}

      {/* 7. Estratégia adotada */}
      {(data.strategyAdopted.length > 0 || data.strategyExperience.length > 0) && (
        <SectionShell icon={ClipboardCheck} title="7. Estratégia Pedagógica Adotada">
          {data.strategyAdopted.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Distribuição</p>
              <FreqChips entries={data.strategyAdopted} chipClass="bg-slate-100 text-slate-900" />
            </div>
          )}
          {data.strategyExperience.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Experiência e eficácia</p>
              <TextList entries={data.strategyExperience} snippets={snippets} />
            </div>
          )}
        </SectionShell>
      )}

      {/* 8. Sugestões */}
      {data.suggestions.length > 0 && (
        <SectionShell icon={MessageCircle} title="8. Sugestões para o Plano de Suplementação" count={data.suggestions.length}>
          <div className="space-y-3">
            {data.suggestions.map((s, i) => (
              <div
                key={`${s.sourceId}-${i}`}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2"
                data-source-id={s.sourceId}
                data-source-table={s.sourceTable}
                data-respondent={s.respondent}
                data-role={s.role}
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {s.respondent}{s.role ? ` · ${s.role}` : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {s.component && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-primary/10 text-primary">{s.component}</span>}
                  {s.content && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-slate-200 text-slate-700">{s.content}</span>}
                </div>
                {s.methodology && (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    <HighlightedText text={s.methodology} snippets={snippets} filterSourceId={s.sourceId} />
                  </p>
                )}
              </div>
            ))}
          </div>
        </SectionShell>
      )}

      {/* 9. Observações adicionais */}
      {data.additionalNotes.length > 0 && (
        <SectionShell icon={FileText} title="9. Observações / Informações Adicionais" count={data.additionalNotes.length}>
          <TextList entries={data.additionalNotes} snippets={snippets} />
        </SectionShell>
      )}
    </div>
  );
}
