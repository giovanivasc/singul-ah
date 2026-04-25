# Relatório de Impacto à Proteção de Dados Pessoais (RIPD)

**Sistema:** Singul-AH — Portal de PEI para estudantes com AH/SD
**Versão:** 1.0 · **Data:** 23/04/2026
**Base legal:** LGPD Art. 38

---

## 1. Identificação

| Campo | Valor |
|---|---|
| Controlador | Giovani Vasconcelos da Silva e Silva |
| Instituição | PPGEAA — UFPA / Campus de Castanhal |
| Encarregado (DPO) | O próprio controlador (acumulação — Art. 41 §3º) |
| Contato | giovani.silva@castanhal.ufpa.br |
| Natureza | Sistema piloto de pesquisa de mestrado |
| Finalidade | Apoiar a elaboração de Planos Educacionais Individualizados (PEI) para estudantes com indicativos de AH/SD |

## 2. Contexto e escopo

O Singul-AH integra dados coletados junto a **três informantes** (professor regente, AEE, família) e ao **próprio estudante**, produzindo uma **visão agregada** que subsidia a equipe pedagógica na construção do PEI. Parte do processamento é auxiliado por IA (Google Gemini).

### 2.1 População afetada

- Estudantes (crianças e adolescentes) da rede pública com indicativos de AH/SD;
- Responsáveis legais;
- Profissionais da educação envolvidos.

### 2.2 Volume estimado (piloto)

- 1 estudante (piloto inicial);
- 3 a 5 informantes associados ao estudante;
- Expansão prevista para ≤ 30 estudantes ao longo da dissertação.

## 3. Fluxo de dados

```
[Responsável]  →  IF-SAHS (via link com token)  ┐
[Prof. regente] → IP-SAHS (via sistema)         ├→ Supabase (RLS) ┬→ Visão agregada
[Prof. AEE]     → IP-SAHS (via sistema)         │                  ├→ Fichamento
[Estudante]     → NILS / entrevista             ┘                  └→ Convergência IA
                                                                         ↓
                                                                   Revisão humana
                                                                         ↓
                                                                    PEI final (PDF)
```

## 4. Categorias de dados

| # | Categoria | Tipo LGPD | Origem | Destino |
|---|---|---|---|---|
| 1 | Identificação do estudante | Pessoal comum | Cadastro escolar | Supabase |
| 2 | Nome e vínculo do responsável | Pessoal comum | Autodeclarado | Supabase |
| 3 | Respostas IF-SAHS | Sensível (biopsicossocial) | Responsável | Supabase + Gemini (pseudon.) |
| 4 | Respostas IP-SAHS | Sensível | Docentes | Supabase + Gemini (pseudon.) |
| 5 | Respostas N-ILS | Sensível | Estudante | Supabase |
| 6 | Transcrições de áudio | Sensível | Informantes | Supabase (texto) |
| 7 | Convergências e sugestões IA | Derivado / sensível | Gemini | Supabase |
| 8 | Fichamentos pedagógicos | Derivado | Equipe escolar | Supabase |
| 9 | PEI consolidado | Derivado / sensível | Equipe escolar | Supabase + PDF |
| 10 | Logs de acesso | Pessoal comum | Sistema | Supabase (90d) |
| 11 | Registros de consentimento | Pessoal comum | Usuário | Supabase (permanente) |

## 5. Base legal aplicada

- **Art. 7º III** (política pública educacional — LDB Art. 59, Dec. 7.611/2011);
- **Art. 7º IV** (pesquisa por órgão de pesquisa — PPGEAA/UFPA);
- **Art. 11 II, "b" e "c"** (dados sensíveis);
- **Art. 14 §1º** (consentimento específico e destacado do responsável);
- **Resoluções CNS 466/12 e 510/16** (ética em pesquisa — pendente aprovação CEP).

## 6. Ciclo de vida dos dados

| Fase | Duração | Medida |
|---|---|---|
| Coleta | Ativa durante o PEI | Consentimento + termo; RLS por papel |
| Uso operacional | Durante vínculo escolar | Criptografia; logs |
| Uso de pesquisa | Até 5 anos após dissertação (CNS 466/12) | Pseudonimização (Art. 13) |
| Retenção pós-uso | 5 anos após desligamento | Bloqueio (Art. 16 I) |
| Eliminação | Após retenção | Anonimização irreversível ou purga |

## 7. Identificação de riscos

Metodologia: combinação de **LINDDUN** (privacy threat modeling) + **ISO/IEC 29134** (diretriz DPIA).

### 7.1 Matriz de riscos

| # | Ameaça | Probabilidade | Impacto | Risco bruto | Risco residual (pós-mitigação) |
|---|---|---|---|---|---|
| R1 | Acesso não autorizado ao Supabase (credencial vazada) | Baixa | Alto | Médio | Baixo |
| R2 | Link de IF-SAHS interceptado / encaminhado | Média | Alto | Alto | **Médio → Baixo** com OTP |
| R3 | Vazamento via Gemini (prompt/contexto) | Baixa | Alto | Médio | Baixo (pseudonimização) |
| R4 | Uso de dados fora da finalidade (docente) | Baixa | Médio | Baixo | Muito baixo (termo + logs) |
| R5 | Reidentificação em publicação científica | Baixa | Alto | Médio | Muito baixo (pseudon. + agregação) |
| R6 | Perda/corrupção de dados | Baixa | Médio | Baixo | Muito baixo (backup Supabase) |
| R7 | Decisão pedagógica discriminatória influenciada por IA | Média | Alto | **Alto** | Médio (revisão humana obrigatória + disclaimer) |
| R8 | Revogação de consentimento não propagada | Baixa | Médio | Baixo | Muito baixo (cron de purge) |
| R9 | Dados retidos além do prazo | Média | Médio | Médio | Baixo (política + automação) |
| R10 | Acesso do menor a conteúdo inadequado no portal | Baixa | Médio | Baixo | Muito baixo (privacy-by-default ECA Digital) |
| R11 | Transferência internacional sem salvaguardas | Média | Alto | Alto | Baixo (cláusulas padrão Supabase/Google) |
| R12 | Incidente não comunicado a tempo | Baixa | Alto | Médio | Baixo (runbook definido) |

### 7.2 Detalhamento das principais ameaças

#### R2 — Link com token
- **Ataque:** responsável encaminha o link por WhatsApp; alguém não autorizado abre.
- **Mitigação:** token de uso único, expira em 7 dias, + OTP por e-mail antes de exibir formulário, + log de IP de acesso.

#### R3 — Gemini
- **Ataque:** prompt contendo identificadores vaza via incidente do operador.
- **Mitigação:** sistema remove nome/escola/CPF antes do envio; usa token pseudonimizado (`[estudante_001]`); política Google de não-treinamento em Vertex AI; cláusulas contratuais.

#### R7 — IA e discriminação
- **Ataque:** modelo inferir viés (ex.: menos expectativa para perfis sociais específicos).
- **Mitigação:** disclaimer "decisão é humana"; botão "solicitar revisão"; auditoria amostral de outputs.

## 8. Medidas técnicas e administrativas

### 8.1 Técnicas

- TLS 1.2+ em toda conexão;
- Criptografia em repouso (AES-256 no Supabase);
- Row-Level Security (RLS) com políticas por papel;
- Pseudonimização de identificadores antes de envio à IA;
- Logs de acesso versionados e imutáveis;
- OTP para acesso via link (IF-SAHS);
- Soft-delete + cron de purge com 90 dias de graça;
- Backups automáticos Supabase com retenção ≤ 30 dias.

### 8.2 Administrativas

- Política de Privacidade pública e versionada;
- Termos de consentimento, assentimento e uso docente;
- Registro de operações de tratamento (Art. 37);
- Runbook de incidente (Art. 48);
- Treinamento anual da equipe escolar;
- Revisão deste RIPD no mínimo anualmente ou a cada mudança material.

## 9. Transferência internacional

Identificada — Supabase (US/EU) e Google Gemini (US).

| Destinatário | País | Fundamento LGPD | Salvaguarda |
|---|---|---|---|
| Supabase Inc. | EUA | Art. 33 II-b | DPA com cláusulas padrão; SOC 2; GDPR-compliant |
| Google LLC | EUA | Art. 33 II-b + VIII | DPA Google Cloud; regime "no training" para APIs pagas |

Detalhes em [transferencia-internacional.md](./transferencia-internacional.md).

## 10. Conclusão

O tratamento é **proporcional** à finalidade, a base legal é **adequada**, as mitigações reduzem os riscos a nível **aceitável**, e o sistema oferece aos titulares **meios efetivos de exercer seus direitos**. Os riscos residuais são documentados e monitorados.

Este RIPD será **revisado**:
- Ao menos uma vez por ano;
- Sempre que houver mudança material no fluxo, operadores ou finalidade;
- Sempre que solicitado pela ANPD.

---

**Assinatura do Controlador:**

Giovani Vasconcelos da Silva e Silva
Data: 23/04/2026
