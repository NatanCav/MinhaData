# Guia de Deploy — MinhaData

Este guia documenta como publicar o MinhaData usando apenas serviços com plano gratuito, reaproveitando o código existente sem reescrevê-lo.

## 1. Arquitetura escolhida e por quê

O projeto é um monorepo com dois pacotes independentes:

- **Backend** (`backend/`): Node.js + Express + Prisma ORM, autenticação via JWT em cookies `httpOnly` e 2FA (TOTP). Não é Java/Spring Boot.
- **Frontend** (`frontend/`): React 19 + Vite 8 + Tailwind CSS v4 (SPA, consome a API em `/api/...` via `fetch`).
- **Banco de dados**: PostgreSQL, modelado e migrado via Prisma (`backend/prisma/schema.prisma` + `backend/prisma/migrations/`).

Arquitetura recomendada:

| Camada | Serviço | Motivo |
|---|---|---|
| Frontend (estático) | **Vercel** (Hobby/free) | SPA React/Vite é exatamente o caso de uso principal do plano gratuito. |
| Backend (API Node) | **Render** (Free Web Service) | Suporta Node nativamente (sem Docker necessário), builda com `npm install`, roda com `npm run start`. |
| Banco de dados | **Neon** (free tier Postgres) | Ver justificativa abaixo — **não usar o Postgres gratuito do próprio Render**. |

### Por que Neon e não o PostgreSQL gratuito do Render

O Postgres free do Render **expira 30 dias após a criação** e é **apagado** após um período de carência de 14 dias (sem nenhum backup). Isso violaria diretamente a exigência de não perder dados reais. O Neon free tier não tem expiração por tempo, oferece 1 GB de armazenamento por projeto e é compatível nativamente com Prisma. Alternativa equivalente: **Supabase** (free tier também sem expiração, 500 MB) — qualquer um dos dois funciona; este guia usa Neon como padrão.

### Por que o frontend não chama o backend diretamente por URL absoluta

A sessão é mantida via cookies `httpOnly` (`accessToken`/`refreshToken`), não por token em header. Chamar a API do Render diretamente a partir do domínio da Vercel caracterizaria uma requisição **cross-site**, exigindo `SameSite=None; Secure` nos cookies e sujeita a bloqueios de cookies de terceiros em navegadores modernos (Safari ITP, etc.).

Em vez disso, o `frontend/vercel.json` configura a Vercel para **atuar como proxy reverso**: toda requisição para `/api/*` feita pelo navegador ao domínio da Vercel é redirecionada, no servidor, para o backend no Render. Do ponto de vista do navegador, tudo é same-origin — os cookies funcionam sem nenhuma mudança no código do frontend (`fetch("/api/...")` continua exatamente como está em `authService.js`, `espacosService.js`, etc.).

### Alternativas consideradas

- **Supabase** no lugar do Neon: equivalente, troque apenas a `DATABASE_URL`/`DIRECT_URL`.
- **Railway** no lugar do Render: também suporta Node nativamente, mas seu plano gratuito mudou para um crédito mensal limitado (não é mais "free" sem cartão em todos os casos) — Render tem o modelo gratuito mais previsível hoje para este caso.
- **Vercel Serverless Functions** para o backend: exigiria reescrever o Express (rotas, middlewares de cookie, Prisma) no formato de função serverless e lidar com conexões de banco por invocação — descartado por violar a diretriz de reaproveitar o código existente sem necessidade.

## 2. Serviços gratuitos utilizados

- GitHub (o repositório já existe em `https://github.com/NatanCav/MinhaData`, branch `master`/`main` já sincronizada com `origin`).
- Vercel (frontend).
- Render (backend).
- Neon (PostgreSQL).

## 3. Publicar o repositório no GitHub

Não é necessário: o repositório já está no GitHub e a branch local está sincronizada com `origin/main`. Você só precisa dar `git push` depois de revisar e commitar as alterações feitas nesta auditoria (veja a lista de arquivos no relatório final).

## 4. Criar e configurar o banco de dados (Neon) — **etapa sua**

1. Crie uma conta em https://neon.tech (sem cartão de crédito).
2. Crie um novo projeto (ex.: `minhadata`), região mais próxima do seu backend (Render usa `oregon` por padrão no `render.yaml` incluído — escolha uma região Neon na AWS US ou a mais próxima disponível).
3. No painel do projeto, copie duas connection strings:
   - **Pooled connection** (com `-pooler` no host) → use como `DATABASE_URL`.
   - **Direct connection** (sem `-pooler`) → use como `DIRECT_URL`.
4. Ambas devem conter `?sslmode=require` (o Neon já inclui isso por padrão na string copiada).

> O schema (`backend/prisma/schema.prisma`) já foi ajustado para usar `url = env("DATABASE_URL")` (conexão normal da aplicação) e `directUrl = env("DIRECT_URL")` (usada apenas pelo Prisma para rodar migrations sem passar pelo pooler, que não suporta alguns comandos administrativos). Em desenvolvimento local, as duas variáveis apontam para o mesmo Postgres do `docker-compose.yml` — nada muda no seu fluxo local.

## 5. Variáveis de ambiente por plataforma

Referência completa em `backend/.env.example` (local) — em produção, as mesmas chaves são configuradas na interface de cada plataforma, nunca em arquivo versionado.

### Render (backend) — variáveis de ambiente do serviço

| Variável | Valor |
|---|---|
| `NODE_ENV` | `production` (já definido no `render.yaml`) |
| `DATABASE_URL` | connection string **pooled** do Neon |
| `DIRECT_URL` | connection string **direct** do Neon |
| `CORS_ORIGIN` | URL de produção do frontend, ex. `https://minhadata.vercel.app` |
| `JWT_ACCESS_SECRET` | valor aleatório único — gere com `openssl rand -hex 48` |
| `JWT_REFRESH_SECRET` | outro valor aleatório único, diferente do anterior |
| `JWT_ACCESS_EXPIRES_IN` | `15m` (já definido no `render.yaml`) |
| `JWT_REFRESH_EXPIRES_IN` | `7d` (já definido no `render.yaml`) |

Essas variáveis já estão declaradas em `render.yaml` com `sync: false` para os segredos — ao importar o blueprint, o Render pedirá que você preencha cada valor manualmente (nada de segredo fica no repositório).

### Vercel (frontend)

Não é necessária nenhuma variável de ambiente — o `frontend/vercel.json` faz todo o roteamento. Você só precisa editar o próprio arquivo (veja passo 7).

## 6. Deploy do backend (Render)

1. Crie uma conta em https://render.com e conecte sua conta do GitHub.
2. No dashboard, escolha **New → Blueprint** e selecione o repositório `MinhaData`. O Render vai detectar o `render.yaml` na raiz do repositório automaticamente.
3. O blueprint já define:
   - `rootDir: backend`
   - `buildCommand: npm install && npx prisma generate && npx prisma migrate deploy`
   - `startCommand: npm run start`
   - `healthCheckPath: /api/espacos`
4. Preencha os valores pedidos (`DATABASE_URL`, `DIRECT_URL`, `CORS_ORIGIN`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) com os valores da etapa 4/5.
5. Confirme o deploy. O Render vai instalar dependências, gerar o Prisma Client e **aplicar as migrations existentes** (`prisma migrate deploy` só aplica migrations pendentes — não recria nem apaga tabelas existentes).
6. Anote a URL pública gerada (algo como `https://minhadata-backend.onrender.com`).

Caso prefira configurar manualmente (sem blueprint): New → Web Service → aponte para o repositório → Root Directory `backend` → Runtime `Node` → Build Command e Start Command iguais aos listados acima → Plan `Free`.

## 7. Deploy do frontend (Vercel)

1. Edite `frontend/vercel.json` e troque `SUBSTITUA-PELA-URL-DO-BACKEND.onrender.com` pela URL real do backend obtida no passo anterior (sem `https://` duplicado, o arquivo já inclui o protocolo).
2. Comite e dê push dessa alteração.
3. Crie uma conta em https://vercel.com e importe o repositório `MinhaData`.
4. Em "Root Directory", selecione `frontend`. A Vercel detecta automaticamente o preset Vite (`vite build`, saída em `dist`) — não é necessário configurar build/output manualmente.
5. Deploy. Anote a URL gerada (ex.: `https://minhadata.vercel.app`).
6. Volte ao Render e atualize a variável `CORS_ORIGIN` do backend para essa URL exata (sem barra no final), depois faça um redeploy manual do backend para a variável ter efeito.

## 7.1. Promover a conta de proprietário

O produto tem um **único proprietário** (ver `CLAUDE.md`). Por segurança, o cadastro público (`/cadastro`) sempre cria contas com papel `CLIENTE` — não existe nenhuma forma de "virar proprietário" pela própria interface, de propósito.

Para ativar a conta de proprietário:

1. Cadastre-se normalmente pelo site publicado, com o e-mail que você vai usar como dono do negócio.
2. No **Neon → SQL Editor**, rode (trocando o e-mail):
   ```sql
   UPDATE "User" SET role = 'PROPRIETARIO' WHERE email = 'seu-email@exemplo.com';
   ```
3. Faça logout e login novamente no site (o campo `role` vem no `/api/auth/login`/`/api/auth/me` — uma sessão já aberta não atualiza sozinha). Depois disso, `/gestao` fica acessível e os botões "Cadastrar espaço"/"Editar" em `/gestao/espacos` passam a gravar de verdade no banco (`POST`/`PUT /api/espacos`, protegidos por autenticação + papel de proprietário).

## 8. Configurar a URL da API e o CORS

- A "URL da API" em produção **não** é configurada no código do frontend — ela vive só em `frontend/vercel.json` (`destination` do rewrite de `/api/:path*`).
- O CORS no backend (`backend/src/server.js`) já lê `process.env.CORS_ORIGIN` — só precisa apontar para o domínio da Vercel, como descrito no passo 6 acima.
- Como o navegador sempre fala com o domínio da Vercel (que faz o proxy), o CORS na prática só protege contra chamadas diretas ao domínio `.onrender.com` feitas fora do navegador — mantenha configurado mesmo assim, por segurança.

## 9. Executar migrations com segurança

- O `buildCommand` do Render já roda `npx prisma migrate deploy` em todo deploy. Esse comando **só aplica migrations novas** que ainda não foram registradas na tabela `_prisma_migrations` do banco — ele nunca recria tabelas existentes nem apaga dados.
- Para rodar uma migration nova no futuro: crie-a localmente com `npx prisma migrate dev --name sua_mudanca` (contra o Postgres local do `docker-compose.yml`), comite a pasta gerada em `backend/prisma/migrations/`, e faça push — o próximo deploy no Render aplica automaticamente.
- Nunca rode `prisma migrate dev` ou `prisma db push` apontando para a `DIRECT_URL` de produção — esses comandos podem gerar prompts de reset de schema. Em produção, use sempre `prisma migrate deploy`.
- Para popular dados de exemplo (`backend/prisma/seed.js`), rode manualmente via Render Shell (`npx prisma db seed`) **apenas se quiser dados de demonstração** — não está automatizado no build para não inserir esses dados em todo deploy.

## 10. Como testar o site publicado

1. Acesse a URL da Vercel.
2. Confirme que a Vitrine carrega os espaços (requisição `GET /api/espacos` via proxy).
3. Teste cadastro (`/cadastro`) e login (`/login`) de um usuário novo — verifique no DevTools (aba Application → Cookies) que `accessToken` e `refreshToken` aparecem no domínio da própria Vercel, marcados como `Secure`.
4. Teste o fluxo de "Esqueci minha senha" — como `enviarEmail`/`enviarSms` (`backend/src/services/emailService.js` e `smsService.js`) hoje só fazem `console.log`, o e-mail/SMS real não é entregue; o conteúdo aparece nos logs do serviço no painel do Render ("Logs").
5. Teste criar uma reserva autenticado (`/espacos/:slug` → `/reserva`).

## 11. Erros de deploy mais prováveis e como corrigir

- **502/503 no primeiro acesso após inatividade**: esperado — o free tier do Render "dorme" após 15 minutos sem tráfego e leva até ~1 minuto para religar na próxima requisição. Não é um erro de configuração.
- **`CORS_ORIGIN` incorreta**: se o navegador mostrar erro de CORS no console, confira se `CORS_ORIGIN` no Render é *exatamente* a URL da Vercel (sem barra final, com `https://`).
- **Falha em `prisma migrate deploy` durante o build**: geralmente indica `DIRECT_URL` ausente ou apontando para a conexão pooled — confirme que `DIRECT_URL` usa o host **sem** `-pooler` do Neon.
- **Cookies não ficam salvos em produção**: confirme que `NODE_ENV=production` está definido no Render (isso ativa `secure: true` nos cookies em `backend/src/controllers/authController.js`) e que o acesso é sempre via `https://`.
- **Rotas do React (ex.: `/espacos/algum-slug`) retornam 404 ao atualizar a página**: confirme que a segunda regra de `rewrites` em `frontend/vercel.json` (fallback para `/index.html`) não foi removida.

## 12. Limitações do plano gratuito e custos futuros

- **Render free**: 750h de instância/mês, "dorme" após 15 min de inatividade (cold start de ~1 min na próxima requisição). Sem SLA.
- **Neon free**: 1 GB de armazenamento, cômputo pausa após 5 min de inatividade (retoma em menos de 1s na prática), sem cartão de crédito exigido.
- **Vercel Hobby**: 100 GB de transferência/mês, 1 milhão de invocações de função, **uso não-comercial** segundo os termos da Vercel — se o site passar a gerar receita direta (ex.: cobranças via gateway de pagamento), avalie o plano Pro.
- Nenhum dos três planos gratuitos tem backup automático garantido do banco — considere exportar o banco periodicamente (`pg_dump` contra a `DIRECT_URL` do Neon) se os dados forem importantes.
- Upgrade mais provável no futuro: Render Starter (US$ 7/mês) para eliminar o "sleep" do backend, caso o cold start se torne um problema para os usuários.
