# FRONTEND_GUIDE.md — Design System MinhaData

Especificação visual oficial do front-end. Este documento define **como as coisas devem parecer e se comportar**, não como implementá-las — nenhum componente novo deve ser criado só por causa deste guia. Serve de referência para toda nova UI, tanto para o que já existe (Header, EspacoCard, Vitrine) quanto para o que ainda será construído (Modal, Toast, Calendário, Sidebar, etc.).

---

## 1. Identidade visual

- **Personalidade da marca:** confiável, direta, acolhedora — o produto substitui agenda de papel e mensagens perdidas, então a interface deve transmitir organização e simplicidade, não sofisticação corporativa.
- **Tom de voz:** português claro, sem jargão técnico. Textos de interface curtos e objetivos ("Fazer reserva", "Encontre o espaço ideal para o seu evento").
- **Logo:** ícone de calendário (`IconeCalendario`, traço 2px, `stroke="currentColor"`) + wordmark "MinhaData" em `font-bold`. Já estabelecido em `Header.jsx` — é a referência oficial, não deve ser redesenhado sem decisão explícita do time.
- **Cor de marca:** verde-esmeralda (emerald) — remete a confirmação, disponibilidade e "sinal verde" para reservar. É a única cor de destaque; o resto da UI é neutro.

## 2. Paleta de cores

Usar exclusivamente a escala padrão do Tailwind (sem cores customizadas/hex soltos no código).

### Primária — Emerald (ações, marca, estados positivos)
| Token | Uso |
|---|---|
| `emerald-50` / `emerald-100` | fundo de badges/estados positivos (`bg-emerald-100`) |
| `emerald-600` | ícones de marca, hover leve |
| `emerald-700` | botão primário padrão (`bg-emerald-700`) |
| `emerald-800` | hover do botão primário |

### Neutra — Gray (texto, bordas, fundo)
| Token | Uso |
|---|---|
| `gray-50` | fundo de página (`bg-gray-50`, já usado em `Vitrine`) |
| `gray-100` | bordas sutis, divisores (`border-gray-100`) |
| `gray-300` | estado disabled |
| `gray-400` | texto de apoio / placeholder |
| `gray-500` | texto secundário |
| `gray-600` | links de navegação, texto de corpo |
| `gray-800` / `gray-900` | títulos, texto de alta ênfase |

### Semânticas
| Cor | Uso |
|---|---|
| `emerald-*` | sucesso, disponível, confirmado |
| `red-100` / `red-500` / `red-700` | erro, indisponível, recusado |
| `amber-100` / `amber-700` | atenção, pendente (ex.: reserva aguardando aprovação — estado ainda não usado no código, mas reservado para isso) |

Regra: nunca introduzir uma nova cor de destaque além de emerald sem atualizar este guia primeiro.

## 3. Tipografia

- **Família:** fonte padrão do sistema (stack `sans` do Tailwind) — nenhuma fonte customizada carregada até o momento. Se uma fonte de marca for adotada futuramente, ela entra aqui antes de ser usada em qualquer componente.
- **Escala e uso:**

| Classe | Uso |
|---|---|
| `text-2xl font-bold` | título de página (`Vitrine`: "Encontre o espaço ideal...") |
| `text-xl font-bold` | wordmark do logo |
| `text-lg font-bold` | título de card (`EspacoCard`: nome do espaço) |
| `text-sm font-medium` | links de navegação, labels de botão |
| `text-sm` | texto de corpo padrão |
| `text-xs uppercase tracking-wide font-medium` | rótulo de categoria/eyebrow (`EspacoCard`: tipo do espaço) |
| `text-gray-500` | subtítulo / texto de apoio |
| `text-gray-400` | texto terciário (placeholder, unidade de preço) |

- Hierarquia: nunca mais de um `text-2xl` por tela — um título principal por página.

## 4. Espaçamentos

Escala padrão do Tailwind (base 4px), sem valores arbitrários.

- **Gaps de layout consolidados no código:** `gap-2` (ícone + texto), `gap-4` (itens de menu mobile), `gap-6` (grid de cards, padding de container), `gap-7` (nav desktop).
- **Padding de container de página:** `px-6 py-8` (conteúdo), `px-6 py-4` (navbar).
- **Espaçamento vertical entre seções de página:** `mb-8` entre bloco de título e conteúdo.
- **Padding interno de card:** `p-4`.
- Regra geral: usar múltiplos de `4` (1, 2, 3, 4, 6, 7, 8) — evitar `5`, `9`, valores ímpares fora do padrão já em uso.

## 5. Grid

- **Container padrão:** `max-w-6xl mx-auto px-6` — usado em `Header` e `Vitrine`, é o container oficial de toda página.
- **Grid de listagem (cards):** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` (padrão já em `Vitrine.jsx`).
- **Breakpoints (padrão Tailwind, sem customização):**
  - `sm` — 640px
  - `md` — 768px (ponto de virada mobile → desktop no `Header`, ex.: `hidden md:flex`)
  - `lg` — 1024px (terceira coluna de grid)
- Nova tela com listagem deve reaproveitar exatamente essa progressão de colunas, salvo justificativa específica.

## 6. Botões

Referência: botão "Fazer reserva" do `Header` e botão "Reservar" do `EspacoCard`.

| Variante | Especificação |
|---|---|
| Primário | `bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors` |
| Primário desabilitado | `disabled:bg-gray-300 disabled:cursor-not-allowed` |
| Com ícone | ícone `h-4 w-4` à esquerda do texto, `inline-flex items-center gap-2` |
| Secundário/ghost (a definir na implementação) | texto `text-gray-600 hover:text-emerald-600`, sem fundo — mesmo padrão dos links de navegação |

Regras:
- Botão primário sempre `rounded-lg`, nunca `rounded-full` ou `rounded-none`.
- Um único botão primário visualmente dominante por tela/seção — demais ações usam variante secundária.
- Todo botão interativo tem `transition-colors`.

## 7. Inputs

Ainda não implementados no código — especificação a seguir para quando forem criados (formulário de reserva, filtros, painel de gestão):

- Borda: `border border-gray-200 rounded-lg`.
- Padding: `px-4 py-2`, consistente com botões.
- Texto: `text-sm text-gray-800`, placeholder em `text-gray-400`.
- Foco: anel emerald (`focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600`), nunca depender só de mudança de cor de borda (acessibilidade).
- Erro de validação: borda `border-red-500` + mensagem `text-xs text-red-500` abaixo do campo.
- Label sempre visível acima do campo (`text-sm font-medium text-gray-700`) — não usar placeholder como único label.

## 8. Cards

Referência oficial: `EspacoCard.jsx`.

- Estrutura: `bg-white rounded-2xl shadow-md overflow-hidden flex flex-col`.
- Hover: `hover:shadow-xl transition-shadow duration-300`.
- Imagem de capa: `w-full h-48 object-cover` no topo.
- Badge de status sobre a imagem: `absolute top-3 right-3`, cápsula (`rounded-full px-3 py-1 text-xs font-semibold`) com cor semântica (emerald/red).
- Corpo: `p-4 flex flex-col gap-2 flex-1`, com ação principal sempre ancorada no rodapé do card (`mt-auto`).
- Todo novo tipo de card (ex.: card de reserva no painel) deve seguir essa mesma anatomia — raio de borda, sombra e posição de badge consistentes.

## 9. Modais

Ainda não implementados — especificação para o fluxo de reserva e ações do painel:

- Overlay: `fixed inset-0 bg-black/50` cobrindo a tela toda, fecha o modal ao clicar fora.
- Painel: `bg-white rounded-2xl shadow-xl` (mesmo raio dos cards), centralizado, `max-w-md` para formulários simples.
- Cabeçalho do modal com título (`text-lg font-bold`) e botão de fechar (reutilizar `IconeFechar` já existente no `Header`).
- Ação primária do modal sempre no rodapé, alinhada à direita, seguindo a especificação de Botões (seção 6).
- Modal deve ser dispensável via tecla `Esc` e via clique no overlay (acessibilidade/UX).

## 10. Toasts

Ainda não implementados — especificação para feedback de ações (reserva enviada, erro de rede, status atualizado no painel):

- Posição: canto inferior direito (desktop) / base da tela (mobile), empilháveis.
- Estrutura: `rounded-lg shadow-md px-4 py-3 text-sm font-medium`, ícone à esquerda.
- Cores por tipo: sucesso (`bg-emerald-100 text-emerald-700`), erro (`bg-red-100 text-red-700`), aviso (`bg-amber-100 text-amber-700`) — mesma lógica de cores semânticas do badge de disponibilidade do card.
- Duração padrão: some automaticamente após alguns segundos, mas sempre com botão de fechar manual — nunca depender só do timeout para acessibilidade.

## 11. Calendário

Componente central do fluxo de agendamento (Fase 3 do roadmap) — ainda não implementado:

- Grade mensal, navegação entre meses com setas simples (reaproveitar estilo de ícone SVG stroke já usado no projeto).
- Dias disponíveis: texto `text-gray-800`, hover `hover:bg-emerald-100`.
- Dia selecionado: `bg-emerald-700 text-white rounded-lg`.
- Dias indisponíveis/passados: `text-gray-300 cursor-not-allowed`, sem hover.
- Dia atual (hoje): indicado com um ponto ou contorno sutil, sem competir visualmente com o dia selecionado.
- Se o espaço cobra por hora (`unidadePreco: "hora"`), a seleção de horário aparece como lista de slots abaixo do calendário, mesmo padrão visual de "pill" usado no badge de disponibilidade.

## 12. Sidebar

Para o Painel de Gestão do proprietário (Fase 4 do roadmap) — ainda não implementada:

- Largura fixa em desktop (`w-64`), colapsável/off-canvas em mobile (mesmo padrão de toggle do menu mobile do `Header`, com `IconeMenu`/`IconeFechar`).
- Fundo `bg-white`, borda direita `border-gray-100` — consistente com a borda inferior do `Header`.
- Item de navegação ativo: `bg-emerald-50 text-emerald-700 font-medium`; inativo: `text-gray-600 hover:text-emerald-600` (mesma transição de cor dos links do `Header`).
- Logo/wordmark no topo da sidebar, idêntico ao do `Header`.

## 13. Navbar

Referência oficial: `Header.jsx` — já implementado e é o padrão a seguir.

- `sticky top-0 z-50 bg-white border-b border-gray-100`.
- Logo à esquerda, navegação central (desktop), CTA primário à direita, tudo dentro do container `max-w-6xl mx-auto px-6 py-4`.
- Menu mobile: colapsa para ícone hambúrguer (`IconeMenu`/`IconeFechar`), painel expansível abaixo da barra (`flex flex-col gap-4 border-t border-gray-100 px-6 py-4`).
- Nenhuma alteração estrutural na navbar sem atualizar este guia, já que é o componente mais visível da marca.

## 14. Footer

Ainda não implementado (`Footer.jsx` está vazio) — especificação:

- Fundo neutro, contraste com o `bg-gray-50` do corpo da página (ex.: `bg-white` ou `bg-gray-900` se for footer escuro — decisão a confirmar na implementação).
- Mesmo container `max-w-6xl mx-auto px-6`.
- Conteúdo: logo/wordmark reduzido, links institucionais (Sobre, Contato, Como funciona — mesmos labels já usados no `Header`), copyright.
- Links seguem o mesmo estilo de hover dos links da navbar (`text-gray-600 hover:text-emerald-600`).

## 15. Ícones

- Estratégia oficial: **SVG inline como componentes React locais** (padrão `IconeCalendario`, `IconeMenu`, `IconeFechar` em `Header.jsx`) — não introduzir biblioteca de ícones externa nem depender do sprite `public/icons.svg` sem decisão explícita do time.
- Especificação técnica: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth="2"`, `strokeLinecap="round"`, `strokeLinejoin="round"` — todo novo ícone deve seguir exatamente esses atributos para manter consistência visual de traço.
- Tamanhos padrão: `h-4 w-4` (dentro de botões/texto), `h-6 w-6` (navbar, destaques).
- Cor herdada via `currentColor` — nunca cor fixa dentro do SVG.

## 16. Responsividade

- **Mobile-first sempre:** classes base = mobile; breakpoints (`sm:`, `md:`, `lg:`) adicionam/alteram comportamento para telas maiores — nunca o inverso.
- Ponto de virada principal entre navegação mobile (menu hambúrguer) e desktop (nav horizontal): `md` (768px), já estabelecido no `Header`.
- Grids de listagem escalam 1 → 2 → 3 colunas nos breakpoints `base → sm → lg` (seção 5).
- Áreas de toque em mobile: botões e links com no mínimo `py-2` (altura confortável para toque).

## 17. Acessibilidade

- Todo elemento interativo sem texto visível precisa de `aria-label` (padrão já usado no botão de menu do `Header`).
- Estados expansíveis (menu mobile, dropdowns, sidebar) usam `aria-expanded`.
- Toda imagem tem `alt` descritivo (nome do espaço, não "imagem" genérico) — padrão já usado no `EspacoCard`.
- Contraste mínimo AA: texto sobre `bg-emerald-700` deve ser branco (já é o padrão); nunca texto `gray-400` sobre fundo branco para conteúdo essencial (apenas para texto terciário/decorativo).
- Foco de teclado sempre visível — nunca `outline-none` sem um substituto visual equivalente (ex.: `focus:ring-2 focus:ring-emerald-600`).
- Modais e menus dispensáveis via teclado (`Esc`) e com foco preso dentro do componente aberto (focus trap) quando implementados.

## 18. Animações

- Transições sutis e funcionais, nunca decorativas: `transition-colors` (links, botões), `transition-shadow duration-300` (hover de card) — padrão já em uso, manter a mesma duração (`300ms`) como base para qualquer nova transição de hover.
- Entrada/saída de modais e toasts: fade + leve translação (ex.: `opacity` + `translate-y-1`), duração curta (150–200ms) — nunca animações longas que atrasem a percepção de resposta do sistema.
- Nenhuma animação contínua/looping (spinners são exceção controlada, ver seção 19) — o produto deve parecer estável e confiável, não "cheio de movimento".
- Respeitar `prefers-reduced-motion` quando animações forem implementadas.

## 19. Estados (loading, erro, vazio)

Referência oficial: `Vitrine.jsx`, único fluxo assíncrono já implementado.

- **Loading:** mensagem textual centralizada, tom neutro — `text-center text-gray-400` (ex.: "Carregando espaços..."). Para listas, considerar futuramente *skeleton* nos cards em vez de texto, mas o padrão mínimo aceitável hoje é o texto de loading.
- **Erro:** mensagem centralizada em `text-center text-red-500`, texto humano e acionável (ex.: "Não foi possível carregar os espaços."), nunca mensagem técnica/stack trace exposta ao usuário.
- **Vazio (ainda não implementado em nenhuma tela):** quando uma listagem/filtro não retorna resultados, exibir mensagem central amigável + sugestão de ação (ex.: "Nenhum espaço encontrado com esses filtros — tente ajustar sua busca."), mesmo estilo tipográfico do estado de loading (`text-center text-gray-400`), nunca deixar a área simplesmente em branco.
- Todo fluxo assíncrono novo (reservas, painel) deve implementar os três estados (loading/erro/vazio) antes de ser considerado concluído — é regra também do `CLAUDE.md`.

---

Este guia deve ser atualizado sempre que uma decisão visual nova for tomada durante a implementação — ele documenta o que existe e o que foi decidido, não aspiração desconectada do código.
