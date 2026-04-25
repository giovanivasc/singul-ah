# Registro de Incidentes de Segurança

Diretório destinado ao arquivamento de **post-mortems** e comunicações oficiais relacionados a incidentes de segurança envolvendo dados pessoais tratados no Singul-AH.

## Convenção de arquivos

```
YYYY-MM-DD-<slug>.md         # post-mortem
YYYY-MM-DD-<slug>-anpd.pdf   # cópia da comunicação enviada à ANPD (se aplicável)
YYYY-MM-DD-<slug>-titulares.md  # template da comunicação a titulares
```

## Estrutura do post-mortem

1. **Resumo executivo** (≤ 5 linhas)
2. **Linha do tempo** (detecção → contenção → erradicação → recuperação)
3. **Impacto** — quantidade de titulares, categorias de dados, sensibilidade
4. **Causa-raiz** — técnica e processual
5. **Ações corretivas** — curto, médio e longo prazo
6. **Comunicações** — ANPD, titulares, autoridades de pesquisa
7. **Lições aprendidas**

## Prazos legais (referência rápida)

| Público                  | Prazo máximo                    | Base legal          |
| ------------------------ | ------------------------------- | ------------------- |
| ANPD                     | 2 dias úteis a partir da ciência | LGPD Art. 48        |
| Titulares afetados       | Sem prazo fixo — "prazo razoável" | LGPD Art. 48        |
| Comitê de Ética (CEP)    | 10 dias úteis                    | Res. CNS 510/2016   |

Detalhamento operacional: veja [`../runbook-incidente-seguranca.md`](../runbook-incidente-seguranca.md).

---

*Mantenha este diretório privado. Nunca commite dados pessoais identificados em claro — use sempre identificadores hasheados e categorias agregadas.*
