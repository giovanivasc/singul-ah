# Política de Privacidade — Singul-AH

**Versão:** 1.0
**Vigência:** a partir de 23/04/2026
**Próxima revisão:** 23/04/2027 (ou antes, mediante alteração relevante)

---

## 1. Quem somos

O **Singul-AH** é um sistema piloto de apoio à elaboração de Planos Educacionais Individualizados (PEI) para estudantes com indicativos de **Altas Habilidades / Superdotação (AH/SD)**, desenvolvido no contexto de pesquisa de mestrado do **Programa de Pós-Graduação em Estudos Antrópicos na Amazônia (PPGEAA)**, da **Universidade Federal do Pará — Campus de Castanhal**.

### Controlador dos dados (LGPD Art. 5º VI)

**Giovani Vasconcelos da Silva e Silva**
Pesquisador responsável — PPGEAA/UFPA
E-mail: `giovani.silva@castanhal.ufpa.br`

### Encarregado pelo Tratamento de Dados (DPO — LGPD Art. 41)

Giovani Vasconcelos da Silva e Silva
Canal exclusivo para assuntos de privacidade: `giovani.silva@castanhal.ufpa.br`

---

## 2. A quem esta política se aplica

- **Estudantes** (crianças e adolescentes) identificados com indicativos de AH/SD pelas suas escolas;
- **Responsáveis legais** (pais, mães, tutores) desses estudantes;
- **Professores regentes, professores do Atendimento Educacional Especializado (AEE)** e equipe pedagógica da escola que utilizam o sistema;
- **Pesquisadores** envolvidos no estudo.

O sistema **não se destina** a uso comercial, não realiza publicidade comportamental e não comercializa dados.

---

## 3. Dados que tratamos e finalidades

### 3.1 Dados pessoais comuns (LGPD Art. 5º I)

| Categoria | Exemplos | Finalidade |
|---|---|---|
| Identificação do estudante | Nome, data de nascimento, escola, turma, série | Individualização do PEI |
| Identificação de informantes | Nome do responsável, vínculo, contato; nome do professor/AEE | Rastreabilidade multi-informante |
| Dados de acesso | E-mail institucional, credenciais Supabase Auth | Autenticação segura |

### 3.2 Dados pessoais sensíveis (LGPD Art. 5º II + Art. 11)

| Categoria | Exemplos | Finalidade | Base legal |
|---|---|---|---|
| Perfil biopsicossocial | Traços cognitivos, criativos, socioemocionais, motivacionais | Elaboração pedagógica do PEI | Art. 11 II-c (pesquisa) + consentimento do responsável (Art. 14 §1º) |
| Comportamento observado | Respostas IP-SAHS, IF-SAHS, N-ILS, entrevistas | Convergência entre informantes | Idem |
| Contexto familiar | Relatos da família sobre o menor | Compreensão ecológica | Idem |

### 3.3 Dados derivados

Outputs de inteligência artificial (convergência, sugestões de plano) são gerados a partir dos dados acima. **Nenhuma decisão pedagógica é tomada exclusivamente por IA** — toda sugestão é submetida à revisão humana pela equipe escolar (LGPD Art. 20).

### 3.4 O que **não** coletamos

- Dados biométricos, genéticos ou de saúde não declarados;
- Geolocalização do estudante;
- Dados de redes sociais;
- Cookies de terceiros ou trackers publicitários;
- Informações sobre convicção religiosa, filiação política ou origem racial/étnica — salvo menção voluntária em resposta livre, caso em que serão tratadas como dado sensível comum sob a mesma base legal.

---

## 4. Bases legais do tratamento

O tratamento se apoia cumulativamente nas seguintes hipóteses da LGPD:

| Operação | Base legal |
|---|---|
| Coleta para o PEI | **Art. 7º III** (execução de política pública educacional) + **Art. 11 II-b** |
| Coleta da família | **Art. 14 §1º** (consentimento específico e destacado do responsável legal) |
| Uso para pesquisa acadêmica | **Art. 7º IV** + **Art. 11 II-c**, com pseudonimização conforme Art. 13 §4º |
| Compartilhamento com a escola do estudante | **Art. 7º III** + finalidade originária |

**Não usamos a base de "legítimo interesse"** para crianças e adolescentes — apenas bases mais protetivas.

---

## 5. Com quem compartilhamos

| Destinatário | Finalidade | Salvaguarda |
|---|---|---|
| Escola do estudante | Elaboração e execução do PEI | Acesso restrito à equipe pedagógica do estudante |
| Supabase Inc. (operador técnico) | Hospedagem de banco de dados e autenticação | Cláusulas contratuais padrão; transferência internacional conforme Art. 33 II-b |
| Google LLC (Gemini API) | Processamento de IA para sugestões | Requisição sem armazenamento persistente por parte do operador; dados pseudonimizados quando aplicável |
| Orientador acadêmico e banca | Validação científica | Dados pseudonimizados (Art. 13) |
| ANPD / autoridades | Cumprimento de requisição legal | Apenas mediante obrigação legal |

**Não vendemos, não alugamos e não cedemos** dados para fins comerciais.

---

## 6. Transferência internacional (LGPD Art. 33)

Os dados são armazenados em infraestrutura Supabase, que opera servidores fora do território nacional. Esta transferência se fundamenta em **cláusulas-padrão contratuais** (Art. 33 II-b) e no fato de que as finalidades recaem nas hipóteses dos incisos V e VI do Art. 7º. Detalhes técnicos em [transferencia-internacional.md](./transferencia-internacional.md).

---

## 7. Retenção e eliminação (LGPD Arts. 15–16)

| Categoria de dado | Retenção | Ação ao término |
|---|---|---|
| Dados pessoais do estudante | Durante a vigência do PEI + 5 anos após conclusão do ensino | Anonimização irreversível |
| Dados de pesquisa (base científica) | 5 anos após publicação da dissertação (Res. CNS 466/12) | Anonimização ou descarte |
| Logs de acesso | 6 meses | Eliminação automática |
| Registros de consentimento | Enquanto houver tratamento + 5 anos (ônus da prova — Art. 8º §2º) | Eliminação |
| Backup | Até 90 dias após exclusão do dado primário | Sobrescrita |

Detalhes em [retencao-eliminacao.md](./retencao-eliminacao.md).

---

## 8. Direitos do titular (LGPD Art. 18)

A qualquer momento, o titular (ou seu responsável legal, quando menor) pode solicitar:

1. **Confirmação** da existência do tratamento;
2. **Acesso** aos dados tratados;
3. **Correção** de dados incompletos ou incorretos;
4. **Anonimização, bloqueio ou eliminação** de dados desnecessários ou excessivos;
5. **Portabilidade** em formato estruturado (JSON);
6. **Eliminação** de dados tratados com consentimento;
7. **Informação** sobre com quem compartilhamos;
8. **Informação** sobre a possibilidade de não consentir e consequências;
9. **Revogação do consentimento**.

### Como exercer

- **Pelo sistema:** usuários autenticados acessam `/meus-dados`.
- **Por e-mail:** `giovani.silva@castanhal.ufpa.br` — assunto "LGPD — [tipo de solicitação]".
- **Prazo de resposta:** até **15 dias** (Art. 19 II); pedidos simples de confirmação são atendidos imediatamente.
- **Custo:** gratuito (Art. 18 §5º).

Se a resposta for negativa, você pode peticionar diretamente à **Agência Nacional de Proteção de Dados (ANPD)** em `www.gov.br/anpd`.

---

## 9. Segurança da informação (LGPD Art. 46)

Adotamos medidas técnicas e administrativas proporcionais aos riscos, incluindo:

- **Criptografia em trânsito** (HTTPS/TLS 1.2+) e em repouso (Supabase AES-256);
- **Row-Level Security (RLS)** no banco de dados, com políticas por papel (professor, AEE, família, estudante, pesquisador);
- **Autenticação por e-mail institucional** + OAuth Google quando aplicável;
- **Autenticação adicional por OTP** para acesso via links enviados por e-mail à família;
- **Logs de auditoria** de acesso a fichas de estudantes;
- **Pseudonimização** de identificadores para fins de pesquisa;
- **Revisão humana obrigatória** de qualquer output gerado por IA.

---

## 10. Incidentes de segurança (LGPD Art. 48)

Na hipótese de incidente que possa acarretar risco relevante aos titulares, comunicaremos:

1. A **ANPD** em prazo não superior a 2 dias úteis;
2. Os **titulares afetados** (ou seus responsáveis) imediatamente, com descrição do incidente, dados afetados, medidas de mitigação e recomendações.

Runbook detalhado em [runbook-incidente-seguranca.md](./runbook-incidente-seguranca.md).

---

## 11. Tratamento de dados de crianças e adolescentes (LGPD Art. 14 + ECA Digital)

- Coletamos dados de menores **somente com consentimento específico e destacado de pelo menos um dos pais ou responsável legal** (Art. 14 §1º), salvo nas hipóteses legais de dispensa.
- Adotamos **privacidade por padrão** (ECA Digital Art. 7º): configurações mais protetivas ativas por default; o estudante só pode alterar com ciência do responsável.
- **Não realizamos perfilamento comportamental para publicidade** (ECA Digital Art. 26) — o sistema não possui publicidade.
- O portal do estudante oferece **ferramentas de supervisão parental** descritas em [supervisao-parental.md](./supervisao-parental.md).
- Informações ao menor são apresentadas em **linguagem acessível à sua faixa etária** (Art. 14 §6º; ECA Digital Art. 18 §1º), inclusive por meio de recursos audiovisuais quando adequado.

---

## 12. Uso de Inteligência Artificial e decisões automatizadas (LGPD Art. 20)

O Singul-AH usa IA para:

- Sugerir convergências entre respostas dos múltiplos informantes;
- Propor esboços de ações pedagógicas para o PEI.

**Nenhuma decisão que afete o estudante é tomada exclusivamente por IA.** Todo output é:

1. Exibido com sinalização clara de que foi gerado por IA;
2. Submetido a **revisão humana obrigatória** pelo(a) professor(a) ou AEE antes de ser usado;
3. Passível de **solicitação de revisão** pelo titular (responsável) a qualquer momento — o pedido será respondido com os critérios utilizados pela IA, observados segredos comerciais.

---

## 13. Relatório de Impacto à Proteção de Dados (RIPD)

Elaboramos RIPD específico (LGPD Art. 38) descrevendo o fluxo, ameaças identificadas e medidas de mitigação. Disponível para autoridades sob requisição: [ripd-singul-ah-v1.md](./ripd-singul-ah-v1.md).

---

## 14. Alterações desta política

Alterações relevantes (mudança de finalidade, de controlador, de operadores essenciais) serão comunicadas por e-mail com pelo menos **30 dias de antecedência** e poderão exigir novo consentimento (Art. 8º §6º). O histórico de versões fica registrado em [README.md](./README.md).

---

## 15. Dúvidas

Fale conosco pelo e-mail `giovani.silva@castanhal.ufpa.br`. Toda comunicação é tratada em até 15 dias.

---

*Documento elaborado em 23 de abril de 2026, em conformidade com a Lei nº 13.709/2018 (LGPD) e com a Lei nº 15.211/2025 (ECA Digital), cuja vigência inicia-se em 17 de março de 2026.*
