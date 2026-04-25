# Supervisão Parental

**Base legal:** Lei 15.211/2025 (ECA Digital) — Capítulo V · **Versão:** 1.0

---

## Princípios

1. **Privacidade por padrão** (Art. 7º): configurações mais protetivas ativas no primeiro acesso; o estudante só pode afrouxar mediante aviso visível.
2. **Melhor interesse da criança e do adolescente** (Art. 4º II): toda decisão de design prioriza proteção sobre engajamento.
3. **Autonomia progressiva** (Art. 4º V): ferramentas adaptam-se à idade; adolescentes têm mais controle do que crianças, mas sempre com ciência do responsável.
4. **Transparência ao menor e ao responsável** (Art. 18 §1º): ambos sabem o que está ativado, podem ver e podem mudar.

## Vinculação conta de estudante × responsável (Art. 24)

- **Estudantes com ≤ 16 anos**: conta **obrigatoriamente vinculada** à conta de pelo menos um responsável legal. Sem vínculo ativo, o portal do estudante não abre.
- **Estudantes com 17 anos**: vínculo recomendado; o estudante pode operar com assentimento próprio + notificação ao responsável.
- **Término do vínculo**: ao completar 18 anos, o estudante passa a titularidade integral; o responsável perde acesso automaticamente.

### Modelo de dados (resumo)

```sql
-- Migration supabase/migrations/XXXX_parental_link.sql (ver Sprint 4)
create table parental_links (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  guardian_user_id uuid references auth.users(id),
  relationship text not null,  -- 'mae' | 'pai' | 'tutor' | 'outro'
  verified_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz default now()
);
```

## Controles disponíveis ao responsável (Art. 17 §4º e Art. 18)

| Controle | Default | Pode desativar? | Obs. |
|---|---|---|---|
| Privacidade máxima do perfil do estudante | ✅ ON | Sim (com aviso) | |
| Bloquear comunicação com usuários não-escolares | ✅ ON | Não | Segurança inegociável |
| Auto-play de mídia | ❌ OFF | Sim | |
| Notificações push fora do horário escolar | ❌ OFF | Sim | |
| Geolocalização | ❌ OFF | — | Não coletamos |
| Sistemas de recomendação personalizados | ❌ OFF | Sim | Não existe hoje |
| Limite de tempo de uso diário | 30 min (padrão) | Configurável | Apenas para portal do estudante |
| Relatório semanal de uso (para o responsável) | ✅ ON | Sim | E-mail automático |
| Bloqueio a partir de horário | Configurável | — | Ex.: após 20h |

## Visibilidade para o responsável (dashboard `/supervisao`)

- Visualizar e configurar as opções acima;
- Ver histórico consolidado de uso (tempo total por dia);
- Ver última atividade do estudante;
- Suspender temporariamente o acesso;
- Revogar o vínculo (com confirmação);
- Acessar a ficha do estudante em modo "família" (apenas leitura).

## Visibilidade para o estudante

- **Aviso claro e visível** quando configurações de supervisão estão ativas (Art. 17 III);
- Informação sobre quem é o(s) responsável(is) vinculado(s);
- Canal para falar com o responsável ou com adulto de confiança na escola;
- **Não** pode alterar configurações-padrão protetivas sem ciência do responsável.

## Vedações (Art. 18 §2º)

- **Proibido** projetar interfaces ("dark patterns") que comprometam o controle do responsável;
- **Proibido** usar técnicas de engajamento compulsivo (streaks, recompensas por tempo, notificações insistentes);
- **Proibido** publicidade comportamental (não há publicidade no sistema);
- **Proibido** perfilamento do menor para qualquer fim que não seja estritamente pedagógico.

## Canal de denúncia (Art. 28)

Qualquer usuário (responsável, estudante, escola) pode reportar:
- Violação de direitos do(a) estudante;
- Conteúdo inadequado observado;
- Uso indevido do sistema.

Canal: `giovani.silva@castanhal.ufpa.br` (assunto: "ECA Digital — Denúncia") ou botão "Reportar" no portal.

## Revisão

Este documento é revisado a cada nova funcionalidade do portal do estudante e, obrigatoriamente, a cada 12 meses.
