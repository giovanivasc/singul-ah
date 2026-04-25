import React, { useId } from 'react';
import { cn } from '../lib/utils';

/**
 * Marca Singul-AH (conceito 0 — sparkle singular + 3 brilhos orbitais).
 *
 * Uso:
 *   <SingulAhMark size={32} />
 *   <SingulAhWordmark />
 *   <SingulAhLogo variant="horizontal" tagline />
 *
 * Paleta:
 *   Laranja  #F97316   (acolhimento)
 *   Índigo   #4F46E5   (cognição)
 *   Âmbar    #FBBF24   (spark / descoberta)
 *
 * Design:
 *   4 pontas = 4 eixos do Plano · ponta inferior alongada = singularidade
 *   3 brilhos orbitais = multi-informante (professor regente · AEE · família)
 */

// ---------------------------------------------------------------------------
// Mark (só o símbolo)
// ---------------------------------------------------------------------------
export interface SingulAhMarkProps extends Omit<React.SVGProps<SVGSVGElement>, 'children'> {
  size?: number | string;
  /** Caixa arredondada de fundo (útil em avatares/cards). */
  rounded?: boolean;
  /** Versão em branco sobre cor sólida (para app icon laranja ou slate-900). */
  inverted?: boolean;
  /** Cor do fundo arredondado quando `rounded`. Default: laranja suave. */
  roundedBg?: string;
}
export function SingulAhMark({
  size = 32,
  rounded,
  inverted,
  roundedBg,
  className,
  style,
  ...rest
}: SingulAhMarkProps) {
  const uid = useId().replace(/:/g, '');
  const sparkGrad = `sparkGrad-${uid}`;
  const orbitGrad = `orbitGrad-${uid}`;

  return (
    <svg
      viewBox="-100 -100 200 200"
      width={size}
      height={size}
      className={cn('shrink-0', rounded && 'rounded-xl', className)}
      style={{
        background: rounded
          ? roundedBg ?? (inverted ? '#F97316' : 'rgba(249,115,22,0.08)')
          : undefined,
        padding: rounded ? '14%' : undefined,
        ...style
      }}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {!inverted && (
        <defs>
          <linearGradient id={sparkGrad} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="45%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id={orbitGrad} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
      )}
      <path
        fill={inverted ? '#FFFFFF' : `url(#${sparkGrad})`}
        d="M 0,-70 C 6,-22 22,-6 70,0 C 22,6 6,22 0,95 C -6,22 -22,6 -70,0 C -22,-6 -6,-22 0,-70 Z"
      />
      <g fill={inverted ? '#FFFFFF' : `url(#${orbitGrad})`}>
        <path d="M 62,-55 C 63,-46 68,-41 77,-40 C 68,-39 63,-34 62,-25 C 61,-34 56,-39 47,-40 C 56,-41 61,-46 62,-55 Z" />
        <path d="M 78, 42 C 79, 49 83, 53 90, 54 C 83, 55 79, 59 78, 66 C 77, 59 73, 55 66, 54 C 73, 53 77, 49 78, 42 Z" />
        <path d="M -78,-15 C -77,-8 -73,-4 -66,-3 C -73,-2 -77, 2 -78, 9 C -79, 2 -83,-2 -90,-3 C -83,-4 -79,-8 -78,-15 Z" />
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Wordmark (só o texto)
// ---------------------------------------------------------------------------
export interface SingulAhWordmarkProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  /** Classe extra para o separador "·". */
  dotClassName?: string;
}
export function SingulAhWordmark({ className, dotClassName, ...rest }: SingulAhWordmarkProps) {
  return (
    <span
      className={cn('font-black tracking-tight text-on-surface whitespace-nowrap', className)}
      {...rest}
    >
      Singul<span className={cn('text-primary mx-0.5', dotClassName)}>·</span>AH
    </span>
  );
}

// ---------------------------------------------------------------------------
// Logo (composição mark + wordmark)
// ---------------------------------------------------------------------------
export type SingulAhLogoVariant = 'horizontal' | 'stacked' | 'compact';

export interface SingulAhLogoProps {
  variant?: SingulAhLogoVariant;
  /** Tamanho do símbolo em px. */
  markSize?: number;
  /** Classe aplicada ao wordmark (para controlar tamanho do texto). */
  wordmarkClassName?: string;
  /** Mostra tagline abaixo do nome; `true` usa a default, string usa valor custom. */
  tagline?: string | boolean;
  className?: string;
}

const DEFAULT_TAGLINE = 'Plano Individualizado · Altas Habilidades';

export default function SingulAhLogo({
  variant = 'horizontal',
  markSize,
  wordmarkClassName,
  tagline,
  className
}: SingulAhLogoProps) {
  const resolvedTagline =
    tagline === true ? DEFAULT_TAGLINE : typeof tagline === 'string' ? tagline : null;

  if (variant === 'compact') {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        <SingulAhMark size={markSize ?? 24} />
        <SingulAhWordmark className={cn('text-base', wordmarkClassName)} />
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={cn('inline-flex flex-col items-center gap-3 text-center', className)}>
        <SingulAhMark size={markSize ?? 64} />
        <div>
          <SingulAhWordmark className={cn('text-2xl block', wordmarkClassName)} />
          {resolvedTagline && (
            <p className="mt-1 text-[10px] font-bold tracking-[0.25em] uppercase text-on-surface-variant opacity-70">
              {resolvedTagline}
            </p>
          )}
        </div>
      </div>
    );
  }

  // horizontal
  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <SingulAhMark size={markSize ?? 44} />
      <div className="flex flex-col leading-tight">
        <SingulAhWordmark className={cn('text-2xl', wordmarkClassName)} />
        {resolvedTagline && (
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant opacity-70 mt-0.5">
            {resolvedTagline}
          </span>
        )}
      </div>
    </div>
  );
}
