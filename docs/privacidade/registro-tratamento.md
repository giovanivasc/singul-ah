# Registro de Operações de Tratamento

**Base legal:** LGPD Art. 37 · **Versão:** 1.0 · **Atualização:** 23/04/2026

---

## Operação 01 — Coleta IF-SAHS (Família)

| Campo | Valor |
|---|---|
| **Finalidade** | Obter a perspectiva familiar sobre o perfil biopsicossocial do(a) estudante |
| **Base legal** | LGPD Art. 14 §1º (consentimento destacado do responsável) + Art. 11 II-c (pesquisa) |
| **Titulares** | Responsável legal e, indiretamente, estudante |
| **Dados** | Nome do responsável, vínculo, respostas textuais (podendo conter menções à saúde, comportamento, contexto familiar) |
| **Origem** | Fornecido pelo titular via formulário web |
| **Meio** | Link único com token + OTP |
| **Retenção** | 5 anos após o desligamento do estudante |
| **Compartilhamento** | Equipe escolar do estudante; pesquisador; Gemini (pseudonimizado) |
| **Operador** | Supabase (banco), Google (IA) |

## Operação 02 — Coleta IP-SAHS (Professor Regente / AEE)

| Campo | Valor |
|---|---|
| **Finalidade** | Obter percepção pedagógica sobre o(a) estudante |
| **Base legal** | LGPD Art. 7º III (política pública educacional) + Art. 11 II-b |
| **Titulares** | Estudante (dados sensíveis sobre) + profissional (dados de autoria) |
| **Dados** | Respostas SRBCSS-R (4 blocos), observações textuais, transcrições |
| **Meio** | Sistema autenticado |
| **Retenção** | 5 anos após o desligamento |
| **Compartilhamento** | Equipe escolar; pesquisador; Gemini (pseudonimizado) |

## Operação 03 — Coleta N-ILS / Entrevista (Estudante)

| Campo | Valor |
|---|---|
| **Finalidade** | Obter autorrelato do(a) estudante sobre interesses e estilo de aprendizagem |
| **Base legal** | LGPD Art. 14 §1º (consentimento do responsável) + assentimento do menor |
| **Titulares** | Estudante |
| **Dados** | Respostas a questionário, eventuais áudios/transcrições |
| **Meio** | Sistema autenticado ou assistido por professor(a) |
| **Retenção** | 5 anos após o desligamento |

## Operação 04 — Convergência por IA

| Campo | Valor |
|---|---|
| **Finalidade** | Gerar sugestões de convergência entre informantes para apoiar o PEI |
| **Base legal** | Decorre da finalidade originária + LGPD Art. 20 (direito à revisão) |
| **Titulares** | Estudante |
| **Dados enviados** | Trechos pseudonimizados das respostas; identificador `[estudante_XXX]` |
| **Operador externo** | Google LLC — Gemini API (transferência internacional — Art. 33 II-b) |
| **Salvaguardas** | Pseudonimização; DPA com Google; disclaimer IA; revisão humana obrigatória |
| **Retenção das sugestões** | Junto ao PEI (mesma política) |
| **Log** | Cada chamada é logada com hash do input, modelo usado e timestamp |

## Operação 05 — Elaboração do PEI

| Campo | Valor |
|---|---|
| **Finalidade** | Produzir o documento do Plano Educacional Individualizado |
| **Base legal** | LGPD Art. 7º III (política pública — AEE) |
| **Dados** | Todo o dossiê convergido + ações pedagógicas definidas pela equipe |
| **Formato final** | Tela + PDF exportável |
| **Compartilhamento** | Família, equipe escolar, coordenação, eventualmente SME |
| **Retenção** | Até 5 anos pós-desligamento |

## Operação 06 — Autenticação e logs

| Campo | Valor |
|---|---|
| **Finalidade** | Segurança, auditoria e ônus da prova |
| **Base legal** | LGPD Art. 7º II (obrigação legal — dever de segurança do Art. 46) + legítimo interesse (Art. 7º IX, somente para logs técnicos) |
| **Dados** | E-mail, IP, user-agent, timestamps, rotas acessadas |
| **Retenção** | Logs de acesso: 90 dias · Consentimentos: permanente enquanto houver tratamento + 5 anos |

## Operação 07 — Pesquisa acadêmica (pseudonimização)

| Campo | Valor |
|---|---|
| **Finalidade** | Análise científica para dissertação de mestrado |
| **Base legal** | LGPD Art. 7º IV + Art. 11 II-c + CNS 510/16 |
| **Dados** | Somente versão pseudonimizada (Art. 13 §4º) |
| **Compartilhamento** | Orientador, banca (pseudonimizado) |
| **Retenção** | 5 anos após publicação |

---

## Medidas de segurança consolidadas

- Controle de acesso por papel (RLS Supabase)
- Criptografia TLS em trânsito e AES-256 em repouso
- Logs imutáveis de acesso
- OTP para coleta externa (família)
- Pseudonimização antes de envio a IA
- Backup automático com retenção ≤ 30 dias
- Revisão humana obrigatória de outputs de IA
