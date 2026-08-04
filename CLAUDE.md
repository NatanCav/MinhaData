# CLAUDE.md — MinhaData (Front-end)

Contexto permanente para qualquer sessão de desenvolvimento neste repositório. Leia antes de propor ou implementar mudanças no front-end.

## Objetivo do projeto

MinhaData é uma plataforma web que conecta um **único proprietário de espaços de lazer** (chácaras, salões de festas, quiosques, quadras) a **vários clientes** que realizam reservas. Substitui agenda de papel e mensagens perdidas por um painel centralizado e lembretes automáticos via WhatsApp.

Escopo v1.0:
1. **Catálogo** — vitrine digital com detalhes, fotos e preços dos espaços.
2. **Agendamento** — seleção de data/hora e solicitação de reserva pelo cliente.
3. **Painel de Gestão** — dashboard do proprietário para aprovar/recusar reservas e cadastrar espaços.
4. **Mensageria automática** — confirmação e lembrete via WhatsApp (back-end).

Este documento cobre apenas o **front-end** (`frontend/`).

## Stack

- **React 19** + **Vite 8** (dev server e build)
- **Tailwind CSS v4** via `@tailwindcss/vite` (sem `tailwind.config.js` — configuração no próprio CSS/plugin)
- **JavaScript puro (.jsx)** — sem TypeScript
- **ESLint** (`eslint.config.js`) com `eslint-plugin-react-hooks` e `eslint-plugin-react-refresh`
- Sem gerenciador de estado externo (Context/Redux) até que a complexidade justifique — usar `useState`/`useEffect` locais
- Roteamento: adotar `react-router-dom` quando implementado (ver roadmap) — não existe ainda
- Dados: por enquanto 100% mockados via `services/` + `mocks/`, simulando a futura API REST do back-end (Node/Express/Prisma/PostgreSQL)

## Organização de pastas

```
frontend/src/
├── assets/          → imagens, ícones estáticos importados via JS
├── components/
│   ├── layout/      → estrutura de página (Header, Footer) — usados em toda a aplicação
│   ├── home/         → seções específicas da página inicial (Hero, Beneficios, VitrineEspacos)
│   └── ui/           → átomos/moléculas reutilizáveis entre páginas (Card, Badge, Botão, Formulário)
├── pages/
│   └── NomeDaPagina/NomeDaPagina.jsx → uma pasta por página/rota
├── services/        → funções assíncronas que buscam/mutam dados (hoje mockadas, futuramente `fetch` real)
├── mocks/           → dados fake que representam o contrato combinado com o back-end
├── hooks/           → hooks customizados reutilizáveis (`useAlgumaCoisa.js`)
└── App.jsx / main.jsx
```

Regras de organização:
- Novo componente reutilizável entre páginas → `components/ui/`.
- Novo componente exclusivo de uma seção da Home → `components/home/`.
- Novo componente de estrutura global (aparece em toda página) → `components/layout/`.
- Nova página/rota → nova pasta em `pages/NomePagina/NomePagina.jsx`.
- Novo domínio de dados (ex.: reservas) → par `services/xService.js` + `mocks/x.js`, seguindo o padrão já usado em `espacosService.js`/`espacos.js`.
- Não deixar arquivos vazios ou de teste soltos no repositório (ex.: arquivos sem extensão coerente com a pasta).

## Regras para componentes

- Componentes de página (`pages/`) orquestram estado e chamam `services/` — não têm estilo de "apresentação pura".
- Componentes de `components/ui/` devem ser **puros e sem side-effects**: recebem props, renderizam, no máximo têm estado de UI local (ex.: menu aberto/fechado).
- Preferir `export default function NomeComponente(props) { ... }` (padrão já usado em `Header`, `EspacoCard`).
- Extrair um trecho de JSX repetido em 2+ lugares para `components/ui/` antes de duplicar — mas não criar abstração para um uso único.
- Ícones SVG inline como pequenos componentes locais (padrão já usado no `Header` com `IconeCalendario`, `IconeMenu`, `IconeFechar`) — manter esse padrão em vez de introduzir uma segunda estratégia de ícones (ex. sprite) sem necessidade.
- Estados de carregamento/erro/sucesso em chamadas assíncronas seguem o padrão já usado em `Vitrine.jsx` (`carregando`, `erro`, dado carregado).
- Não acessar diretamente os arquivos de `mocks/` a partir de componentes ou páginas — sempre passar pela camada `services/`.

## Regras de Tailwind

- Usar exclusivamente classes utilitárias Tailwind — evitar CSS customizado em arquivos `.css` salvo casos que o Tailwind não cubra.
- Paleta de cor primária do produto: **emerald** (`emerald-600`/`emerald-700`/`emerald-800` para ações, `emerald-100`/`emerald-700` para estados positivos). Manter consistência com o que já existe em `Header` e `EspacoCard`.
- Cinzas neutros (`gray-*`) para texto e bordas; `red-*` reservado para erros/indisponibilidade.
- Mobile-first: escrever a classe base para mobile e usar prefixos (`md:`, `lg:`) para telas maiores, como em `Header.jsx` (`hidden md:flex`).
- Container padrão de página: `max-w-6xl mx-auto px-6`.
- Cantos arredondados: `rounded-lg` para botões/inputs, `rounded-2xl` para cards.
- Não usar valores mágicos arbitrários (`w-[123px]`) a menos que estritamente necessário — preferir a escala padrão do Tailwind.
- Transições sutis em elementos interativos (`transition-colors`, `transition-shadow duration-300`), como já usado no `EspacoCard`.

## Padrão de nomenclatura

- **Domínio do produto em português** (Vitrine, DetalheEspaco, EspacoCard, espacosMock, buscarEspacoPorSlug) — manter o idioma português para nomes de negócio; termos técnicos genéricos podem ficar em inglês (`props`, `children`, `handleClick` se necessário).
- Componentes: `PascalCase`, arquivo com o mesmo nome do componente (`EspacoCard.jsx` exporta `EspacoCard`).
- Funções e variáveis: `camelCase` (`getEspacos`, `buscarEspacoPorSlug`, `carregando`).
- Constantes fixas: `UPPER_SNAKE_CASE` quando for uma lista/configuração estática no topo do arquivo (ex.: `LINKS` no `Header`).
- Pastas de página: mesmo nome do componente principal (`pages/Vitrine/Vitrine.jsx`).
- Campos de dados (mock/API): sempre em português, coerentes com `mocks/espacos.js` (`nome`, `tipo`, `preco`, `unidadePreco`, `capacidade`, `disponivel`, `avaliacao`, `comodidades`, `informacoes`, `galeria`) — qualquer componente que consome esses dados deve usar exatamente esses nomes de campo, nunca inventar variantes (ex.: não usar `precoPorHora` se o contrato é `preco` + `unidadePreco`).

## Fluxo de desenvolvimento

1. Antes de codar, verificar se já existe componente reutilizável em `components/ui/` que resolva a necessidade.
2. Toda nova tela consome dados via `services/`, nunca direto de `mocks/`.
3. Ao adicionar um campo novo no mock, atualizar todos os componentes que dependem daquele objeto de dados no mesmo commit/PR.
4. Rodar `npm run lint` antes de considerar uma etapa concluída.
5. Testar manualmente os estados de loading/erro/vazio de qualquer tela que busque dados assíncronos.
6. Entregas pequenas e incrementais (ver roadmap do projeto) — uma etapa por PR sempre que possível.
7. Não deixar arquivos vazios criados como placeholder sem pelo menos um comentário indicando o que falta, se o componente ainda não for implementado na mesma entrega.

## Regras de Git

- Trabalho feito em branches de feature, nunca direto em `main`.
- Nome de branch descritivo (o padrão observado no repositório usa o nome do desenvolvedor ou da feature, ex.: `rubem-dev`, `Napeida`).
- Commits pequenos e descritivos, em português, descrevendo a intenção (ex.: "corrige campo de preço no EspacoCard"), não apenas "update".
- Nunca commitar arquivos de teste/rascunho soltos (ver regra de organização de pastas).
- Merge para `main` via Pull Request, com revisão de outro integrante quando possível.
- Não usar `git push --force`, `git reset --hard` ou `git clean -f` sem alinhamento explícito com o time, pois o repositório é compartilhado entre múltiplos desenvolvedores.

## Princípios de UX/UI

- **Clareza sobre densidade**: priorizar espaçamento generoso e hierarquia tipográfica clara (título forte, texto de apoio em `gray-500`), como já estabelecido em `Vitrine.jsx`.
- **Feedback de estado sempre visível**: toda ação assíncrona (carregar espaços, enviar reserva) precisa de estado de loading e de erro tratado na UI — nunca uma tela "travada" sem feedback.
- **Disponibilidade é informação crítica**: sempre sinalizar visualmente se um espaço/horário está disponível ou não (badge verde/vermelho, botão desabilitado), como no `EspacoCard`.
- **Mobile-first de verdade**: toda tela nova deve ser desenhada primeiro para mobile (público final provavelmente reserva pelo celular), depois adaptada para desktop.
- **Consistência de ação primária**: botão de ação principal (reservar, confirmar, salvar) sempre na cor emerald, com estado `disabled` visualmente distinto (`gray-300` + `cursor-not-allowed`).
- **Acessibilidade básica**: `aria-label`/`aria-expanded` em elementos interativos sem texto visível (padrão já usado no botão de menu do `Header`), texto alternativo (`alt`) em todas as imagens.
- **Simplicidade acima de tudo**: o público-alvo (proprietário único + clientes diversos) não é técnico — evitar jargão, preferir linguagem direta em português nos textos de interface.
