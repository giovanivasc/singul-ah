import React from 'react';
import { cn } from './utils';
import type { HighlightSnippet } from '../types/database';

export function snippetCategoryColor(cat: string): string {
  switch (cat) {
    case 'demandas':        return 'bg-red-100 text-red-900';
    case 'contexto':        return 'bg-blue-100 text-blue-900';
    case 'potencialidades': return 'bg-green-100 text-green-900';
    case 'duvida':          return 'bg-yellow-100 text-yellow-900';
    default:                return 'bg-slate-100 text-slate-900';
  }
}

/**
 * Renderiza um texto destacando todas as ocorrências dos trechos fichados
 * como <mark> com a cor da categoria. Usa nodes React (sem innerHTML).
 * Se `filterSourceId` for fornecido, filtra snippets por source_record_id.
 */
export function HighlightedText({
  text,
  snippets,
  filterSourceId
}: {
  text: string;
  snippets?: HighlightSnippet[];
  filterSourceId?: string;
}) {
  if (!text) return null;
  const active = (snippets || []).filter(s => {
    if ((s.status || 'ativo') !== 'ativo') return false;
    if (!s.text || !s.text.trim()) return false;
    if (filterSourceId && (s as any).source_record_id !== filterSourceId) return false;
    return true;
  });
  if (active.length === 0) return <>{text}</>;

  const ordered = [...active].sort((a, b) => b.text.length - a.text.length);
  type Seg = { start: number; end: number; snippet: HighlightSnippet };
  const segments: Seg[] = [];
  const lowered = text.toLowerCase();
  for (const s of ordered) {
    const needle = s.text.trim();
    if (!needle) continue;
    let from = 0;
    while (from <= text.length) {
      const idx = lowered.indexOf(needle.toLowerCase(), from);
      if (idx === -1) break;
      const end = idx + needle.length;
      const overlaps = segments.some(seg => !(end <= seg.start || idx >= seg.end));
      if (!overlaps) segments.push({ start: idx, end, snippet: s });
      from = end;
    }
  }
  if (segments.length === 0) return <>{text}</>;
  segments.sort((a, b) => a.start - b.start);

  const out: React.ReactNode[] = [];
  let cursor = 0;
  segments.forEach((seg, i) => {
    if (cursor < seg.start) out.push(<React.Fragment key={`t-${i}`}>{text.slice(cursor, seg.start)}</React.Fragment>);
    out.push(
      <mark key={`m-${i}`} className={cn('px-1 rounded', snippetCategoryColor(seg.snippet.category))}>
        {text.slice(seg.start, seg.end)}
      </mark>
    );
    cursor = seg.end;
  });
  if (cursor < text.length) out.push(<React.Fragment key="t-end">{text.slice(cursor)}</React.Fragment>);
  return <>{out}</>;
}
