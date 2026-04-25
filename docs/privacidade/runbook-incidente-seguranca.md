# Runbook — Resposta a Incidente de Segurança

**Base legal:** LGPD Art. 48 · **Versão:** 1.0

---

## O que é um incidente

Qualquer evento **acidental** ou **ilícito** que resulte em:
- Acesso não autorizado a dados;
- Perda de dados (parcial ou total);
- Alteração não autorizada;
- Destruição não intencional;
- Comunicação/difusão indevida.

## Classificação de severidade

| Nível | Definição | Prazo interno de contenção | Comunicação ANPD/titulares |
|---|---|---|---|
| **P0 — Crítico** | Vazamento confirmado afetando dados sensíveis de menores; comprometimento de credenciais admin | 1 h | Imediato (≤ 24 h) |
| **P1 — Alto** | Acesso indevido suspeito; perda de dispositivo com sessão ativa | 4 h | ≤ 48 h |
| **P2 — Médio** | Exposição interna além da finalidade sem vazamento externo | 24 h | Avaliação caso a caso |
| **P3 — Baixo** | Incidente mitigado automaticamente (tentativa bloqueada) | 72 h | Apenas registro |

## Fluxo de resposta

### 1. Detecção
Fontes:
- Alertas do Supabase (auth anômala, rate limiting);
- Reporte de usuário (e-mail para `giovani.silva@castanhal.ufpa.br`);
- Reporte interno da equipe;
- Descoberta em auditoria.

### 2. Contenção imediata (≤ 1 h para P0)
- [ ] Revogar credencial comprometida (Supabase Auth → reset);
- [ ] Desabilitar rota/função afetada (feature flag ou deploy de bloqueio);
- [ ] Rotacionar chaves de API (Gemini, service role);
- [ ] Preservar evidências (logs, snapshots do Supabase).

### 3. Análise (paralela à contenção)
Responder:
1. **O que** vazou/foi afetado?
2. **Quantos titulares** estão envolvidos? Quem são?
3. **Quando** ocorreu? Janela temporal?
4. **Como** ocorreu? Causa raiz?
5. **Dados sensíveis** foram afetados? Dados de menor?
6. **Terceiros** (Supabase, Google) foram envolvidos?

### 4. Comunicação

#### 4.1 À ANPD (LGPD Art. 48 §1º)
Prazo: "razoável" — seguir orientação da ANPD de **2 dias úteis** para riscos relevantes.

Canal: formulário em `https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis`

Conteúdo mínimo:
- Descrição da natureza dos dados afetados;
- Informações sobre os titulares envolvidos (quantos, perfil);
- Medidas técnicas e de segurança utilizadas;
- Riscos relacionados;
- Motivos de eventual demora;
- Medidas adotadas para mitigar.

#### 4.2 Aos titulares afetados
Canal: e-mail cadastrado + mensagem no sistema ao próximo login.

Template: `docs/privacidade/templates/incidente-comunicado-titular.md` (a criar conforme necessidade).

Conteúdo:
- O que aconteceu, em linguagem simples;
- Quais dados seus foram afetados;
- O que fizemos para mitigar;
- O que você pode fazer (ex.: trocar senha, ficar atento a phishing);
- Canal para dúvidas.

Para dados de menores: comunicação ao **responsável legal**, com cópia às escolas envolvidas.

### 5. Erradicação e recuperação
- Aplicar correção definitiva (patch, revisão de código, revisão de permissão);
- Validar que o vetor original está fechado (testes);
- Restaurar dados a partir de backup, se aplicável;
- Reemitir credenciais/tokens afetados.

### 6. Post-mortem
Prazo: até **15 dias** após contenção.

Produzir documento `docs/privacidade/incidentes/AAAA-MM-DD-<id>.md` com:
- Linha do tempo completa;
- Causa raiz;
- Impacto real;
- O que funcionou na resposta;
- O que falhou;
- Ações preventivas (com responsável e prazo).

Atualizar este runbook e o RIPD se a análise indicar novos riscos.

## Contatos de escalada

| Papel | Nome | Contato |
|---|---|---|
| Controlador / DPO | Giovani Vasconcelos | giovani.silva@castanhal.ufpa.br |
| Orientador acadêmico | *(a preencher)* | — |
| Comitê de Ética (CEP) | *(a preencher)* | — |
| Suporte Supabase | — | dashboard → Support |
| Suporte Google Cloud | — | dashboard → Support |
| ANPD | — | www.gov.br/anpd |

## Checklist rápido P0

```
☐ Credencial revogada
☐ Rota/função desabilitada
☐ Chaves rotacionadas
☐ Evidências preservadas (screenshots, logs exportados)
☐ Análise inicial (o quê / quantos / quando / como)
☐ ANPD comunicada (≤ 24h)
☐ Titulares comunicados (≤ 24h)
☐ Correção definitiva aplicada
☐ Post-mortem agendado
```
