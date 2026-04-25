# Política de Retenção e Eliminação de Dados

**Base legal:** LGPD Arts. 15–16 · **Versão:** 1.0

---

## Princípios (LGPD Art. 6º III — necessidade)

O dado é mantido **apenas enquanto for necessário** à finalidade informada. Terminada a necessidade, é:

1. **Eliminado**, ou
2. **Anonimizado irreversivelmente**, quando houver interesse científico/estatístico remanescente (Art. 16 II).

## Matriz de retenção

| Categoria | Retenção ativa | Retenção pós-uso | Ação final | Responsável |
|---|---|---|---|---|
| Dados pessoais do estudante | Vigência do PEI | + 5 anos | Anonimização | Controlador |
| Respostas IF/IP-SAHS | Vigência do PEI | + 5 anos | Anonimização | Controlador |
| Fichamentos e convergências | Vigência do PEI | + 5 anos | Anonimização | Controlador |
| PEI em PDF exportado | Vigência + 5 anos | — | Eliminação | Escola + controlador |
| Dados vinculados à dissertação | Até publicação | + 5 anos (CNS 466/12) | Anonimização | Pesquisador |
| Logs de acesso | 90 dias | — | Eliminação automática | Sistema |
| Registros de consentimento | Enquanto houver tratamento | + 5 anos (ônus da prova) | Eliminação | Controlador |
| Chamadas à IA (input/output) | 30 dias | — | Eliminação | Sistema |
| Backup Supabase | 30 dias corridos | — | Sobrescrita automática | Supabase |
| Dados de autenticação | Enquanto houver conta ativa | 12 meses de inatividade | Eliminação | Supabase Auth |

## Gatilhos de eliminação

### Automáticos (cron diário)
- Logs de acesso com mais de 90 dias;
- Registros de IA com mais de 30 dias;
- Contas autenticadas sem login há mais de 12 meses (notificação 60 dias antes);
- Consentimentos expirados sem renovação (após comunicação);
- Tokens de IF-SAHS expirados (7 dias).

### Sob demanda (exercício de direito)
- Solicitação do titular (Art. 18 VI) — via `/meus-dados` ou e-mail;
- Revogação de consentimento (Art. 8º §5º);
- Determinação da ANPD.

### Planejados
- Desligamento do estudante da escola → move para "fase pós-uso";
- Conclusão da dissertação → avaliação de manutenção em base anonimizada para pesquisa secundária (se houver novo protocolo aprovado).

## Processo de anonimização

Dados marcados para anonimização passam por pipeline que:

1. Remove identificadores diretos (nome, CPF, e-mail, data de nascimento completa, endereço, escola);
2. Gera hash irreversível do ID original para manter vínculos estatísticos internos (sem possibilidade de reidentificação);
3. Generaliza atributos quase-identificadores (ex.: idade → faixa etária; bairro → município);
4. Verifica k-anonimato mínimo (k ≥ 5) antes de publicação;
5. Registra operação em log imutável.

Após o pipeline, o dado **não é mais considerado dado pessoal** para fins da LGPD (Art. 12), salvo se a anonimização puder ser revertida com esforço razoável.

## Processo de eliminação

1. **Soft-delete**: registro marcado (`deleted_at`), oculto de todas as queries da aplicação;
2. **Período de graça de 30 dias**: permite recuperação em caso de erro/contestação;
3. **Hard-delete**: purga cron remove fisicamente após o período;
4. **Backup**: registros são sobrescritos no ciclo natural de 30 dias do Supabase;
5. **Confirmação ao titular**: quando a eliminação decorre de pedido, o titular recebe e-mail de confirmação.

## Exceções à eliminação (Art. 16)

A retenção pode ser mantida se houver:

- **I** — Obrigação legal ou regulatória (ex.: documentos exigidos pelo MEC/SME);
- **II** — Estudo por órgão de pesquisa (com anonimização);
- **III** — Transferência a terceiro obedecendo a LGPD (não se aplica aqui);
- **IV** — Uso exclusivo do controlador, anonimizado.

Toda exceção é documentada em `docs/privacidade/excecoes-retencao.md` (a criar sob demanda).

## Registro de eliminações

Toda eliminação (automática ou sob demanda) gera entrada em tabela `data_erasure_log`:

```sql
create table data_erasure_log (
  id uuid primary key default gen_random_uuid(),
  titular_id uuid,           -- hash após eliminação
  tipo text not null,         -- 'automatic' | 'titular_request' | 'revocation' | 'anpd'
  categorias text[] not null,
  iniciado_em timestamptz not null,
  concluido_em timestamptz,
  operador text not null,     -- 'cron' | 'user:<id>' | 'admin:<id>'
  observacao text
);
```

Esse log é **permanente** e serve de evidência de cumprimento.
