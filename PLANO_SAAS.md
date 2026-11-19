# PLANO_SAAS.md — Evolução do MinhaData para SaaS comercial multi-tenant

**Branch de desenvolvimento:** `feature/saas-multi-tenant` (idêntica a `master`/`main` no momento da criação — zero risco para a produção em uso pelo Império Lazer).
**Banco de desenvolvimento:** branch Neon `dev-multi-tenant`, clonada de `production`, totalmente isolada.
**Status:** Etapa 0 (esta auditoria) concluída em 2026-11-18. Nenhuma linha de código ou dado de produção foi alterada.

---

## 1. Diagnóstico da arquitetura atual

### Modelo de dados (Prisma)
- `User`: autenticação, `role` (`CLIENTE` | `PROPRIETARIO`), 2FA, `contatosWhatsapp` (JSON). **Não existe nenhum conceito de organização/empresa.**
- `Espaco`: sem nenhuma referência a dono (`sem ownerId/organizationId`). `slug` é `@unique` **globalmente** na tabela inteira.
- `Reserva`: referencia `Espaco` e opcionalmente `User` (cliente, desde que a reserva passou a não exigir login). Nunca referencia o proprietário.
- Dados reais hoje: 5 usuários, 1 proprietário, 1 espaço, 28 reservas — volume pequeno, baixo risco para qualquer migração.

### Autenticação e autorização
- JWT em cookies `httpOnly` (access + refresh), 2FA obrigatório para conta PJ, recuperação de senha por e-mail (Resend, ainda em modo sandbox — só entrega pro seu próprio e-mail).
- `exigirProprietario` (middleware) checa só `role === PROPRIETARIO` — **não existe "proprietário de quê"**. Hoje, ter esse papel dá acesso a absolutamente tudo no sistema.
- **Esse é o ponto mais crítico de toda a auditoria:** nenhuma consulta administrativa filtra por dono — `listarEspacos`, `listarTodasReservas`, `atualizarEspaco`, `excluirEspaco`, `atualizarStatusReserva`, `atualizarObservacoesProprietario` operam sobre a tabela inteira.

### Reservas e disponibilidade
- Sistema completo e maduro: múltiplas datas por reserva, conflito de horário verificado por espaço, disponibilidade pública real (não mock), reserva sem necessidade de login, cadastro manual pelo proprietário. **Toda essa lógica é por espaço, não por "sistema inteiro"** — ótima notícia, significa que praticamente não muda quando virar multi-tenant, só ganha um filtro de organização nas listagens administrativas.

### Painel administrativo
- Um painel único e compartilhado (`/gestao`), sem nenhuma noção de "qual organização". Já tem: espaços (CRUD), reservas (aprovar/recusar/cancelar/observações), calendário visual, cadastro manual de reserva.

### Frontend e roteamento
- `Home` e `Vitrine` são, na prática, a mesma vitrine pública que lista **todos** os espaços de `GET /api/espacos` sem filtro — hoje já se comporta como um mini-marketplace (só não parece, porque existe 1 espaço só). Isso precisa virar duas coisas distintas: página institucional do MinhaData vs. página pública de cada espaço.
- `/espacos/:slug` é a página pública de um espaço — já é, estruturalmente, o que vira a "página própria de cada proprietário" (só falta o isolamento e, futuramente, o domínio personalizado).

### Upload, WhatsApp, e-mail
- Cloudinary (upload de imagens), WhatsApp via link click-to-chat com múltiplos contatos (hoje preso a `User.contatosWhatsapp` — precisa migrar para a organização), e-mail via Resend (sandbox).

### Testes automatizados
- 4 arquivos / 30 testes (CPF, geração de slug, conflito de horário, transição de status). Nenhum testa isolamento entre contas — porque esse conceito não existe ainda.

### Onboarding
- Promoção a `PROPRIETARIO` é 100% manual, via SQL direto no banco — decisão de design documentada no código, consciente, pro estágio single-owner.

### Hospedagem e custo atual
- Vercel (frontend, Hobby/free), Render (backend, free), Neon (banco, free), Cloudinary (free), Resend (free, sandbox). Custo atual: **R$ 0**.

---

## 2. Avaliação da proposta de arquitetura

A direção é tecnicamente sólida e aproveita quase tudo que já existe — a lógica de reserva, autenticação, painel e notificações praticamente não mudam de comportamento, só ganham um filtro de "a quem pertence isso".

**Ponto que merece decisão consciente, não só nota técnica:** a proposta de URL (`minhadata.com.br/imperio-lazer`, sem prefixo do proprietário) faz o **nome do espaço ser um recurso único compartilhado entre todos os clientes pagantes**. Se dois proprietários cadastrarem "Salão de Festas", um ganha automaticamente um sufixo (`salao-de-festas-2`) — o gerador de slug já existente resolve isso tecnicamente, mas é uma experiência ruim para quem paga e descobre que "seu" nome já está em uso por outra empresa. Como agora também existe a camada de **domínio personalizado**, esse problema fica mitigado na prática (o cliente final, vindo do Instagram, acessa o domínio próprio, não o path do MinhaData) — mas o path genérico continua compartilhado como "endereço de reserva" gratuito. Registro isso como um detalhe a monitorar, não como motivo para mudar o plano.

---

## 3. Arquitetura recomendada

```
Organization (nova)
  id, nome, criadoEm
  status            "ativa" | "pendente" | "suspensa" | "cancelada"   (gestão de assinatura, etapa 8)
  owner             User  @relation   (1 User administra 1 Organization nesta primeira versão)

Espaco (ajustado)
  + organizationId  Int   (FK → Organization)
  slug              continua @unique GLOBAL (mantém a proposta de URL sem prefixo)
  + dominioPersonalizado   String?  @unique   (etapa 6)
  + dominioVerificado      Boolean  @default(false)

Reserva: sem mudança de schema — o dono vem transitivamente via espaco.organizationId
```

**Autorização:** um middleware que carrega `req.organizacaoId` a partir do `User` autenticado; toda query administrativa passa a filtrar por esse id — mesmo padrão que `usuarioId` já usa hoje em `listarReservasDoUsuario`.

**Identificação por domínio personalizado (visão geral técnica, detalhada na Etapa 6):**
- Vercel permite anexar múltiplos domínios personalizados ao mesmo projeto, com SSL automático — todos continuam servindo o **mesmo** bundle React e o **mesmo** `vercel.json` (proxy `/api/*` → Render), então tecnicamente não precisa de infraestrutura nova por cliente.
- O que muda é só a lógica de **qual espaço mostrar**: no carregamento do app, ler `window.location.hostname` e, se não for o domínio principal do MinhaData, chamar um endpoint novo (`GET /api/espacos/por-dominio/:dominio`) que resolve o domínio para o espaço correspondente — em vez de depender do slug na URL.
- Verificação de propriedade do domínio: pedir ao proprietário um registro DNS TXT com um token único antes de ativar (`dominioVerificado = true`) — evita alguém reivindicar um domínio que não é seu.

**Sobre Row Level Security (RLS):** ainda não recomendo — mesma avaliação da semana passada. Isolamento na camada de aplicação, com testes automatizados específicos, é suficiente e mais simples de manter sozinho neste estágio. Reavaliar se o produto crescer para dezenas de tenants e mais de um desenvolvedor.

---

## 4. Modelo de negócio — o que precisa existir na arquitetura

R$ 500 de implantação + R$ 59,90/mês não exige nenhuma integração de pagamento agora (conforme pedido), mas exige que a arquitetura já preveja, sem precisar reconstruir depois:

- `Organization.status` (ativa/pendente/suspensa/cancelada) — campo simples, já incluído no modelo acima.
- Um jeito de **suspender acesso** sem apagar dados: o middleware de autorização já checa a organização em toda rota administrativa — basta adicionar "e `status === 'ativa'`" nessa mesma checagem. Nenhuma estrutura nova além do campo.
- Registro manual de pagamento (por enquanto: você marca "pago esse mês" manualmente, sem gateway) — uma tabela simples `Pagamento` (organizationId, valor, dataPagamento, referente a qual mês) é suficiente agora; substituível por integração de gateway depois sem quebrar o que já existe.
- Painel administrativo da plataforma (Etapa 7) é o lugar natural para você ver/gerenciar esse status manualmente até ter gateway de pagamento.

---

## 5. Funcionalidades futuras — priorização

| Funcionalidade | Prioridade | Complexidade | Depende de |
|---|---|---|---|
| Cadastro/histórico de clientes | Média | Baixa | Etapa 2 |
| Controle de sinal/pagamento da reserva | Média | Média | Etapa 2 |
| Relatórios de reservas/faturamento | Baixa | Média | Etapa 2, dados acumulados |
| Lembretes automáticos | Baixa | Média | Mecanismo de agendamento (não existe hoje — ver observação) |
| Cupons/promoções | Baixa | Média | Etapa 2 |
| Avaliações dos espaços | Baixa | Baixa | Etapa 2 |
| Personalização visual da página | Média | Média-alta | Etapa 4 |
| Múltiplos espaços por proprietário | **Alta** | Baixa (modelo já suporta) | Etapa 1 |

**Observação importante:** lembretes automáticos (ex.: 24h antes da reserva) exigem um mecanismo de tarefa agendada — o Render free tier não executa nada em background sozinho, precisaria de um cron externo gratuito (GitHub Actions, cron-job.org) batendo numa rota protegida. Isso já foi identificado e conscientemente adiado numa fase anterior do projeto; continua valendo a mesma decisão aqui.

---

## 6. Segurança, privacidade e LGPD

- **Isolamento entre organizações é o risco técnico central de todo o projeto** — um filtro esquecido em qualquer rota administrativa é um vazamento de dado de cliente pagante, não um bug cosmético. Por isso a Etapa 2 inclui testes automatizados específicos de isolamento como critério de conclusão, não como "nice to have".
- Autorização sempre no backend (já é o padrão hoje — o frontend nunca decide sozinho o que mostrar sem o backend validar).
- Dados pessoais de clientes (nome, CPF, telefone) já ficam só na tabela `Reserva`, nunca expostos entre organizações diferentes depois da Etapa 2.
- Backups: já existe uma branch Neon permanente (`backup-2026-11-10`) como cópia de segurança manual. Recomendo repetir esse processo periodicamente (ver próximo ponto de atenção conforme o número de organizações crescer).
- Domínio personalizado mal verificado é uma superfície de ataque real (alguém apontando um domínio que não é dele) — por isso a verificação DNS por token é tratada como obrigatória na Etapa 6, não opcional.

---

## 7. Infraestrutura e custos — limites reais para uso comercial

| Serviço | Limite do free tier | Vira problema quando |
|---|---|---|
| **Vercel Hobby** | Uso **não comercial** pelos termos de serviço | No primeiro cliente pagante — upgrade pra Pro (US$20/mês) é necessário para operar comercialmente de forma correta, não é opcional |
| **Render free** | "Dorme" após 15 min de inatividade (~1 min de cold start) | Vários proprietários ativos ao mesmo tempo tornam o cold start mais perceptível e frequentemente notado |
| **Neon free** | 1 GB de armazenamento, compute pausa após 5 min | Dado atual é pequeno; cada organização nova consome pouco, mas branches de desenvolvimento/backup somam ao mesmo limite |
| **Cloudinary free** | Cota de armazenamento/transformação de imagem | Cresce proporcional ao número de espaços com fotos — monitorar ao passar de poucas dezenas de espaços |
| **Resend free (sandbox)** | Só entrega pro seu próprio e-mail | **Bloqueador real a partir do segundo proprietário** — precisa verificar domínio próprio antes de vender para alguém fora da família |
| **Domínios personalizados** | Pago pelo proprietário, fora do seu custo | — |

**Conclusão honesta:** os planos gratuitos **não sustentam uma operação comercial real** a partir do primeiro cliente pagante externo — pelo menos Vercel Pro e Resend com domínio verificado precisam ser resolvidos antes de cobrar de alguém que não seja você mesmo. Render e Neon aguentam bem mais tempo em free tier antes de precisar de upgrade.

---

## 8. Etapas de desenvolvimento

Status: `[x]` concluída · `[ ]` pendente

### Etapa 0 — Preparação e auditoria
**Status:** [x] Concluída em 2026-11-18 (este documento)
- **Objetivo:** garantir segurança da branch principal e produzir diagnóstico completo antes de qualquer código.
- **Resultado:** git e banco de produção confirmados intactos; branch `feature/saas-multi-tenant` e banco `dev-multi-tenant` prontos e isolados.

---

### Etapa 1 — Modelagem multi-tenant
- **Objetivo:** criar a entidade `Organization` e ligar `Espaco` a ela.
- **Problema que resolve:** hoje não existe nenhuma forma de saber "a quem pertence este espaço" — pré-requisito de tudo que vem depois.
- **Funcionalidades envolvidas:** nenhuma funcionalidade de usuário muda ainda; é só fundação de dados.
- **Arquivos/módulos afetados:** `backend/prisma/schema.prisma`, nova migration.
- **Alterações no banco:** `CREATE TABLE "Organization"`; `ALTER TABLE "Espaco" ADD COLUMN "organizationId"` (nullable → popular o registro real do Império Lazer → `NOT NULL`). Migration aditiva, sem risco de perda de dado (1 espaço real a migrar).
- **Dependências:** nenhuma.
- **Riscos técnicos:** baixo — dado real é mínimo; maior cuidado é rodar a migration na branch `dev-multi-tenant`, nunca em produção, até validar.
- **Testes necessários:** `npx prisma validate`; confirmar que o espaço real (migrado manualmente pra `dev-multi-tenant`) aparece corretamente vinculado após popular `organizationId`.
- **Critério de conclusão:** schema válido, migration aplicada só no banco de dev, espaço de teste com `organizationId` preenchido corretamente.
- **Commit sugerido:** `feat: adiciona modelo Organization e vincula Espaco a ela`

---

### Etapa 2 — Isolamento de dados e autorização
- **Objetivo:** garantir que um proprietário só veja/altere dados da própria organização.
- **Problema que resolve:** o ponto mais crítico da auditoria — hoje `PROPRIETARIO` enxerga e administra o sistema inteiro.
- **Funcionalidades envolvidas:** listagem e gestão de espaços, listagem e gestão de reservas, calendário, cadastro manual, observações do proprietário.
- **Arquivos/módulos afetados:** `middlewares/autenticacao.js` (novo middleware de organização), `services/espacosService.js`, `services/reservasService.js`, `controllers` correspondentes.
- **Alterações no banco:** nenhuma nova — usa o `organizationId` da Etapa 1.
- **Dependências:** Etapa 1.
- **Riscos técnicos:** **o maior risco técnico de todo o plano** — esquecer um filtro em qualquer rota administrativa é vazamento de dado entre organizações.
- **Testes necessários:** criar 2 organizações de teste na branch `dev-multi-tenant`, cada uma com espaço e reserva próprios, e confirmar programaticamente que uma nunca aparece pra outra, em cada rota administrativa.
- **Critério de conclusão:** todos os testes de isolamento passando; nenhuma rota administrativa sem filtro de organização.
- **Commit sugerido:** `feat: isola dados e autorizacao por organizacao` + `test: adiciona testes de isolamento entre organizacoes`

---

### Etapa 3 — Suporte a múltiplos espaços por organização
- **Objetivo:** permitir que uma organização administre mais de um espaço no mesmo painel.
- **Problema que resolve:** hoje o painel assume implicitamente "um espaço só" em vários pontos de UI (ex.: seletor de espaço só aparece "se houver mais de um", mas nunca foi testado com mais de um de verdade).
- **Funcionalidades envolvidas:** painel de espaços, painel de reservas, calendário, cadastro manual.
- **Arquivos/módulos afetados:** páginas do painel no frontend (`PainelEspacos`, `PainelReservas`, `PainelCalendario`, `PainelReservaManual`).
- **Alterações no banco:** nenhuma — `Espaco.organizationId` já suporta N espaços por organização desde a Etapa 1.
- **Dependências:** Etapas 1 e 2.
- **Riscos técnicos:** baixo-médio — principalmente testar a experiência de uso real com 2+ espaços, não lógica nova complexa.
- **Testes necessários:** teste manual com uma organização de 2 espaços na branch de dev.
- **Critério de conclusão:** proprietário com 2+ espaços consegue alternar e gerenciar cada um sem ver dados cruzados.
- **Commit sugerido:** `feat: valida e ajusta painel para multiplos espacos por organizacao`

---

### Etapa 4 — Páginas públicas independentes por espaço
- **Objetivo:** separar a página institucional do MinhaData da página pública de cada espaço.
- **Problema que resolve:** hoje `Home`/`Vitrine` listam todos os espaços sem filtro — não serve mais quando existem vários proprietários não relacionados.
- **Funcionalidades envolvidas:** roteamento do frontend, página de detalhe do espaço.
- **Arquivos/módulos afetados:** `App.jsx` (rotas), `pages/Home`, `pages/Vitrine` (aposentada ou repaginada como página institucional), `pages/DetalheEspaco`.
- **Alterações no banco:** nenhuma.
- **Dependências:** Etapa 1 (para saber a quem cada espaço pertence, mesmo que a página pública não exija login).
- **Riscos técnicos:** baixo — é reorganização de rotas já existentes, não lógica nova.
- **Testes necessários:** navegação manual confirmando que `/slug-do-espaco` mostra só aquele espaço e a home institucional não lista espaços de proprietários não relacionados.
- **Critério de conclusão:** página institucional e página de espaço são rotas e componentes distintos, sem vazamento visual de outros espaços.
- **Commit sugerido:** `feat: separa pagina institucional da pagina publica de cada espaco`

---

### Etapa 5 — Onboarding de proprietários (self-service)
- **Objetivo:** permitir que um novo proprietário crie conta, organização e primeiro espaço sem intervenção manual via SQL.
- **Problema que resolve:** hoje a promoção a `PROPRIETARIO` é manual — não escala além de poucos clientes administrados à mão.
- **Funcionalidades envolvidas:** cadastro, criação de organização, cadastro do primeiro espaço.
- **Arquivos/módulos afetados:** `authController`/`authService` (cadastro), novo fluxo de criação de organização, `PainelEspacoForm` reaproveitado para o primeiro espaço.
- **Alterações no banco:** nenhuma nova além da Etapa 1.
- **Dependências:** Etapas 1 e 2.
- **Riscos técnicos:** médio — é a porta de entrada pública do sistema; precisa de validação cuidadosa para não permitir abuso (ex.: alguém criando dezenas de organizações vazias).
- **Testes necessários:** fluxo completo de ponta a ponta (cadastro → organização → espaço) testado manualmente na branch de dev.
- **Critério de conclusão:** um novo proprietário consegue, sozinho, sair do zero até ter um espaço publicável.
- **Commit sugerido:** `feat: implementa onboarding self-service de proprietarios`
- **Observação:** recomendo manter uma aprovação manual leve (`Organization.status = "pendente"` até você revisar) nesta primeira versão comercial, para evitar abuso sem precisar de moderação automática sofisticada.

---

### Etapa 6 — Domínios personalizados
- **Objetivo:** permitir que cada espaço use um domínio próprio, além do endereço padrão do MinhaData.
- **Problema que resolve:** proprietário divulgando `imperiollazer.com.br` em vez de `minhadata.com.br/imperio-lazer`.
- **Funcionalidades envolvidas:** resolução de espaço por domínio, verificação de propriedade.
- **Arquivos/módulos afetados:** schema (`Espaco.dominioPersonalizado`, `dominioVerificado`), novo endpoint `GET /api/espacos/por-dominio/:dominio`, lógica de bootstrap do frontend (ler `window.location.hostname`), configuração de domínios na Vercel.
- **Alterações no banco:** `ALTER TABLE "Espaco" ADD COLUMN "dominioPersonalizado"` (único, opcional), `"dominioVerificado"` (boolean).
- **Dependências:** Etapas 1, 2 e 4.
- **Riscos técnicos:** médio-alto — verificação de propriedade de domínio mal feita é uma brecha de segurança real; também depende de configuração manual na Vercel por cliente (adicionar o domínio no painel), não é 100% automatizável no free tier.
- **Testes necessários:** verificação de domínio de teste (registro TXT), confirmação de que um domínio não verificado nunca resolve pra nenhum espaço.
- **Critério de conclusão:** um domínio de teste, após verificado, carrega corretamente a página do espaço correspondente e nenhum outro.
- **Commit sugerido:** `feat: adiciona suporte a dominio personalizado por espaco`

---

### Etapa 7 — Painel administrativo da plataforma
- **Objetivo:** uma visão exclusiva sua (administrador do MinhaData) sobre todas as organizações.
- **Problema que resolve:** hoje não existe nenhuma forma de ver/gerenciar organizações de fora de cada painel individual.
- **Funcionalidades envolvidas:** listagem de organizações, status de assinatura, suspensão/reativação manual.
- **Arquivos/módulos afetados:** novo papel `ADMIN` (ou flag separada) no `User`, novas rotas e telas administrativas.
- **Alterações no banco:** possível novo valor no enum `Role`, ou campo separado `isAdminPlataforma`.
- **Dependências:** Etapas 1, 2 e 4 (uso do campo `Organization.status` da seção 4).
- **Riscos técnicos:** baixo-médio — é essencialmente um CRUD administrativo sobre dados já existentes.
- **Testes necessários:** confirmar que só o admin da plataforma acessa essas rotas, nunca um proprietário comum.
- **Critério de conclusão:** você consegue ver todas as organizações, seu status, e suspender/reativar manualmente.
- **Commit sugerido:** `feat: adiciona painel administrativo da plataforma`

---

### Etapa 8 — Gestão de assinaturas e planos
- **Objetivo:** registrar e controlar o ciclo de vida comercial de cada organização, sem gateway de pagamento ainda.
- **Problema que resolve:** sustentar o modelo R$500 + R$59,90/mês de forma rastreável.
- **Funcionalidades envolvidas:** status de assinatura, registro manual de pagamento.
- **Arquivos/módulos afetados:** schema (`Organization.status`, nova tabela `Pagamento`), painel administrativo (Etapa 7).
- **Alterações no banco:** campo de status (já previsto na Etapa 1) + tabela `Pagamento` (organizationId, valor, data, referência).
- **Dependências:** Etapas 1, 2 e 7.
- **Riscos técnicos:** baixo — é registro de dado, não lógica de cobrança real ainda.
- **Testes necessários:** confirmar que suspender uma organização bloqueia o acesso administrativo dela sem apagar nenhum dado.
- **Critério de conclusão:** você consegue marcar manualmente uma organização como paga/pendente/suspensa e isso reflete no acesso dela.
- **Commit sugerido:** `feat: adiciona controle manual de status de assinatura`

---

### Etapa 9 — Funcionalidades adicionais (conforme priorização da seção 5)
- **Objetivo:** evoluir o produto além do essencial multi-tenant, pela ordem de prioridade já definida.
- **Dependências:** Etapa 2 no mínimo; cada funcionalidade entra como sub-etapa própria quando chegar a vez.
- **Observação:** não detalhar os 10 campos agora para cada uma — fica para quando as etapas 1-8 estiverem concluídas e a prioridade real do negócio estiver mais clara (pode mudar depois de ter clientes reais).

---

### Etapa 10 — Segurança, testes finais e preparação comercial
- **Objetivo:** revisão final antes de vender para o primeiro cliente fora da família.
- **Funcionalidades envolvidas:** tudo.
- **Riscos técnicos/comerciais:** resolver Vercel Pro (uso comercial) e Resend com domínio verificado — ambos **bloqueadores reais**, não detalhes.
- **Critério de conclusão:** checklist de segurança revisado, planos pagos de Vercel/Resend resolvidos, testes de isolamento rodando no CI (se houver) ou pelo menos documentados como rotina antes de cada deploy.
- **Commit sugerido:** `chore: checklist final de seguranca antes do lancamento comercial`

---

## 9. Priorização resumida

- **Essencial para o primeiro cliente externo:** Etapas 1, 2, 4, 5.
- **Importante antes de cobrar de verdade:** Etapas 7, 8, e resolver Vercel Pro + Resend (seção 7).
- **Pode esperar:** Etapa 6 (domínio personalizado — valioso, mas o path `/slug` já funciona como endereço público enquanto isso), Etapa 9 em boa parte, Etapa 10 como checklist final.

## 10. Recomendação de por onde começar

**Etapa 1**, seguida imediatamente da **Etapa 2** — são a fundação e o maior risco técnico do projeto inteiro, respectivamente. Nenhuma outra etapa tem valor real sem essas duas primeiro: onboarding sem isolamento, domínio personalizado sem isolamento, ou painel administrativo sem isolamento seriam construir sobre uma base insegura.

Sugiro tratar a Etapa 1 e a Etapa 2 como um único ciclo de trabalho (modelo de dados + autorização + testes de isolamento), já que uma sem a outra não entrega valor sozinha, e só então parar para validação sua antes de seguir para a Etapa 3.

---

Aguardando sua autorização para iniciar a Etapa 1.
