# Transferência Internacional de Dados

**Base legal:** LGPD Arts. 33–36 · **Versão:** 1.0

---

## Quadro resumido

| Operador | País | Função | Dados | Fundamento |
|---|---|---|---|---|
| **Supabase Inc.** | EUA (AWS us-east-1) | Banco de dados, autenticação, storage | Todos os dados do sistema | Art. 33 II-b (cláusulas padrão) |
| **Google LLC** | EUA | Inferência de IA (Gemini API) | Trechos pseudonimizados de respostas | Art. 33 II-b + VIII |

*A UFPA, como controladora institucional final, não realiza transferência internacional direta dos dados — a transferência ocorre no vínculo com os operadores contratados pelo pesquisador/controlador.*

## 1. Supabase

### 1.1 Dados e finalidade
- Armazenamento de tabelas relacionais (estudantes, respostas, convergências, PEI);
- Autenticação (e-mail, Google OAuth);
- Eventualmente Storage (anexos de PEI).

### 1.2 Local de processamento
Região AWS escolhida no projeto. Recomendação: **us-east-1** por disponibilidade; avaliar migração para **sa-east-1 (São Paulo)** quando Supabase ofertar com estabilidade.

**Ação aberta:** verificar se o plano atual permite escolha de região sa-east-1 e, em caso afirmativo, **migrar** (registrar em post-mortem de infraestrutura).

### 1.3 Salvaguardas contratuais
- **Data Processing Agreement (DPA)** publicado por Supabase, compatível com GDPR (Art. 28) — serve como cláusulas padrão nos termos do LGPD Art. 33 II-b;
- **SOC 2 Type II** certification;
- **Criptografia em repouso** (AES-256) e em trânsito (TLS 1.2+);
- **Segregação lógica** por projeto;
- **Sub-operadores** listados no DPA (AWS, Cloudflare) — notificação prévia de mudanças.

### 1.4 Direitos exercíveis
- Exportação completa via API ou dashboard;
- Eliminação completa mediante exclusão do projeto + confirmação;
- Logs de acesso disponíveis no dashboard.

### 1.5 Como invocar
- Incidente: dashboard → Support (P0/P1);
- DPO do operador: `privacy@supabase.com`.

## 2. Google LLC (Gemini API)

### 2.1 Dados e finalidade
Envio de trechos **pseudonimizados** (sem nome, CPF, escola, data de nascimento precisa) de respostas de informantes, para obter sugestões de convergência. O modelo **não recebe identificadores diretos**.

### 2.2 Local de processamento
Data centers globais do Google; controlamos via parâmetro de região quando aplicável.

### 2.3 Salvaguardas contratuais
- **Google Cloud DPA** aplicável à Gemini API paga;
- **Regime de "no training"**: requisições via API paga **não são usadas** para treinar modelos futuros (política Google para Gemini via Vertex AI / API paga — a conferir para o plano contratado);
- **Criptografia em trânsito** (TLS);
- **Retenção curta** pelo Google (política atual: ≤ 55 dias para monitoramento de abuso).

### 2.4 Pseudonimização antes do envio

O middleware de IA aplica:

```
substitui:
  <nome_estudante>      → "[ESTUDANTE]"
  <nome_responsavel>    → "[RESPONSAVEL]"
  <escola>              → "[ESCOLA]"
  <cpf_pattern>         → "[DOC]"
  <email_pattern>       → "[EMAIL]"
  <data_nascimento>     → "[DATA]"
```

Implementação em `src/lib/ai/pseudonymize.ts` (a criar em Sprint 2/3).

### 2.5 Como invocar
- Incidente: console Google Cloud → Support;
- DPO Google: via mecanismo do Cloud Console.

## 3. Matriz de decisão — adicionar novo operador internacional

Antes de contratar qualquer novo operador que resulte em transferência internacional, verificar:

- [ ] País de destino possui adequação LGPD (Art. 33 I)? → se sim, basta registrar.
- [ ] Se não, o operador oferece **cláusulas padrão**, **BCR** ou **selos** (Art. 33 II)?
- [ ] Pseudonimização mitiga o risco?
- [ ] Atualizar este documento e o RIPD.
- [ ] Comunicar titulares se a mudança for material (Art. 8º §6º).

## 4. Revisão periódica

- Ao menos anualmente;
- Sempre que houver mudança no DPA dos operadores;
- Sempre que a ANPD publicar lista de países adequados (Art. 33 I).
