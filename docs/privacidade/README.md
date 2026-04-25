# Privacidade & Proteção de Dados — Singul-AH

Documentação consolidada de conformidade com a **Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD)** e com o **Estatuto Digital da Criança e do Adolescente (Lei nº 15.211/2025 — ECA Digital)**.

## Índice

| Documento | Base legal | Público |
|---|---|---|
| [politica-privacidade-v1.md](./politica-privacidade-v1.md) | LGPD Art. 9º; ECA Digital Art. 16 | Público externo |
| [termo-consentimento-responsavel-v1.md](./termo-consentimento-responsavel-v1.md) | LGPD Art. 8º + Art. 14 §1º | Responsáveis legais |
| [termo-assentimento-menor-v1.md](./termo-assentimento-menor-v1.md) | ECA Digital Art. 4º V; Res. CNS 466/12 e 510/16 | Estudante participante |
| [termo-uso-docente-v1.md](./termo-uso-docente-v1.md) | LGPD Art. 47 (sigilo) | Professores e AEE |
| [ripd-singul-ah-v1.md](./ripd-singul-ah-v1.md) | LGPD Art. 38 | Interno / ANPD sob demanda |
| [registro-tratamento.md](./registro-tratamento.md) | LGPD Art. 37 | Interno / auditoria |
| [runbook-incidente-seguranca.md](./runbook-incidente-seguranca.md) | LGPD Art. 48 | Equipe técnica |
| [supervisao-parental.md](./supervisao-parental.md) | ECA Digital Cap. V | Interno + responsáveis |
| [retencao-eliminacao.md](./retencao-eliminacao.md) | LGPD Arts. 15–16 | Interno |
| [transferencia-internacional.md](./transferencia-internacional.md) | LGPD Arts. 33–36 | Interno |
| [excecoes-retencao.md](./excecoes-retencao.md) | LGPD Art. 16 | Interno |
| [incidentes/README.md](./incidentes/README.md) | LGPD Art. 48 | Interno |

## Implementação técnica

| Área | Arquivo |
|---|---|
| Tabela de consentimentos, audit, IA, eliminação | `supabase/migrations/003_consents_and_audit.sql` |
| Tokens de coleta família com OTP | `supabase/migrations/004_family_tokens_and_otp.sql` |
| Vínculos parentais + função `retention_cleanup()` | `supabase/migrations/005_parental_links_and_retention.sql` |
| Helpers de consent (hash, registro, revogação) | `src/lib/consent.ts` |
| Pseudonimização antes de IA | `src/lib/ai/pseudonymize.ts` |
| Middleware de consent | `src/components/ConsentGate.tsx` |
| Banner de decisão apoiada por IA (Art. 20) | `src/components/IABanner.tsx` |
| Verificação OTP (família — Art. 14 §5º) | `src/components/OTPVerify.tsx` |
| Controles de supervisão parental | `src/components/ParentalControl.tsx` |
| Portal "Meus Dados" (Art. 18) | `src/pages/MeusDados.tsx` — rota `/meus-dados` |
| Painel de supervisão parental | `src/pages/SupervisaoParental.tsx` — rota `/supervisao-parental` |
| Páginas públicas de transparência | `src/pages/{Privacidade,TermoConsentimento,Assentimento,Encarregado}.tsx` |

## Controlador

**Giovani Vasconcelos da Silva e Silva**
Pesquisador — Programa de Pós-Graduação em Estudos Antrópicos na Amazônia (PPGEAA)
Universidade Federal do Pará — Campus Universitário de Castanhal
E-mail: `giovani.silva@castanhal.ufpa.br`

## Encarregado pelo Tratamento de Dados (DPO)

Até a designação formal pela UFPA, exerce a função de Encarregado o próprio controlador:

**Giovani Vasconcelos da Silva e Silva**
E-mail: `giovani.silva@castanhal.ufpa.br`
(Art. 41 §3º LGPD permite acumulação em organizações de pequeno porte.)

## Versionamento

Toda alteração nestes documentos deve gerar nova versão (v2, v3, …), preservando o histórico. Alterações relevantes exigem nova coleta de consentimento (LGPD Art. 8º §6º).

| Versão | Data | Autor | Resumo |
|---|---|---|---|
| v1 | 2026-04-23 | G. Vasconcelos | Emissão inicial |
