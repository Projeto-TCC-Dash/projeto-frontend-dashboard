---

description: "Task list for feature implementation: 012-full-app-responsiveness"
---

# Tasks: Responsividade Completa da Aplicação

**Input**: Design documents from `/specs/012-full-app-responsiveness/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/responsive-ui-contracts.md`, `quickstart.md`)

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/responsive-ui-contracts.md`

**Organization**: Tarefas organizadas por fase e por História de Usuário (P1 → P2) para entrega incremental, testável e sem quebra de funcionalidades ou contratos de API.

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup (Global Overflow Protection & Layout Spacing)

**Purpose**: Proteger a base global contra rolagem horizontal acidental (preservando `sticky`) e garantir respiro inferior seguro nas áreas autenticadas e de entrada.

- [X] T001 Adicionar proteção global `overflow-x-clip` em `html` e `body` sem quebrar `position: sticky` em `app/globals.css`
- [X] T002 [P] Ajustar espaçamento inferior seguro (`pb-24 sm:pb-8`) no container `<main>` contra sobreposição do botão flutuante em `app/(dashboard)/layout.tsx`
- [X] T003 [P] Revisar e assegurar paddings responsivos e proteção `min-w-0` no shell de autenticação em `app/(auth)/layout.tsx`

---

## Phase 2: Foundational (Hook de Media Query & Contenção Base de Diálogos)

**Purpose**: Utilitário compartilhado SSR-safe para alternância limpa de visualização (sem duplicar nós ambíguos no DOM de testes) e contenção de altura máxima em modais.

**⚠️ CRITICAL**: As histórias de listagem responsiva de transações e modais dependem desta fase.

- [X] T004 Criar hook SSR-safe `useMediaQuery` tipado estritamente (retorna `false` antes da hidratação e sincroniza via `window.matchMedia`) em `hooks/use-media-query.ts`
- [X] T005 [P] Criar testes unitários para o hook `useMediaQuery` cobrindo SSR fallback, listener `change` e remoção no unmount em `hooks/use-media-query.test.tsx`
- [X] T006 [P] Padronizar contenção `max-h-[90dvh] overflow-y-auto`, padding `p-4 sm:p-6` e empilhamento de rodapé (`flex-col-reverse gap-2 sm:flex-row sm:justify-end`) em `components/ui/dialog.tsx`
- [X] T007 [P] Atualizar e validar testes do componente base de diálogo cobrindo restrição de altura e fechamento acessível em `components/ui/dialog.test.tsx`

**Checkpoint**: Base global, hook de viewport e diálogo padrão prontos — início do trabalho por história de usuário.

---

## Phase 3: User Story 1 - Navegação Principal e Estrutura Global sem Estouro Horizontal (Priority: P1) 🎯 MVP

**Goal**: Eliminar overflow/esmagamento no cabeçalho em smartphones (`320px–375px`) e tablets (`768px–1023px`), elevando a barra horizontal completa para `lg:` (`>=1024px`) e tornando o menu móvel resiliente.

**Independent Test**: Renderizar `Navbar` e rotas principais em `320px`, `376px`, `768px`, `1024px` e `1440px`, testando abertura/fechamento do menu móvel por clique, seleção de rota, tecla `Escape` e clique fora, com zero overflow horizontal no documento.

### Tests for User Story 1

- [X] T008 [P] [US1] Criar testes unitários e de acessibilidade para `Navbar` cobrindo toggle do menu móvel (`aria-expanded`, `aria-controls`), fechamento via `Escape`/mudança de rota/clique fora e classes responsivas `lg:` em `components/layout/navbar.test.tsx`
- [X] T009 [P] [US1] Atualizar testes de `UserNav` para validar exibição compacta do avatar em telas estreitas sem quebra de acessibilidade em `components/layout/user-nav.test.tsx`

### Implementation for User Story 1

- [X] T010 [US1] Refatorar `Navbar` movendo a barra horizontal de `md:flex` para `lg:flex`, ajustando menu móvel até `<1024px` (`lg:hidden`) com fechamento por rota/`Escape`/clique fora e área tátil `size-10` no botão hambúrguer em `components/layout/navbar.tsx`
- [X] T011 [P] [US1] Compactar `UserNav` ocultando texto de nome/e-mail abaixo de `sm:` (`hidden sm:flex`) com preservação de `title`/`aria-label` e áreas de clique confortáveis em `components/layout/user-nav.tsx`
- [X] T012 [P] [US1] Ajustar espaçamento/compactação de `AiKeyStatusBadge` e alvo tátil de `ThemeToggle` em `320px–480px` nos arquivos `components/ai-key/ai-key-status-badge.tsx` e `components/layout/theme-toggle.tsx`
- [X] T013 [P] [US1] Garantir contenção `min-w-0` e rolagem horizontal isolada das abas de configurações sem expandir o layout em `components/settings/settings-nav.tsx`

**Checkpoint**: US1 funcional — cabeçalho e navegação adaptam-se perfeitamente de `320px` a `1440px+`.

---

## Phase 4: User Story 2 - Painel Financeiro Principal e Visualizações Adaptativas (Priority: P1) 🎯 MVP

**Goal**: Garantir leitura clara e interação por toque no cabeçalho do painel, seletor de mês, 5 cartões de KPI, gráfico de rosca de categorias e diagnóstico IA em todas as resoluções.

**Independent Test**: Renderizar `/` em `320px`, `480px`, `768px`, `1024px` e `1440px`, verificando empilhamento do seletor de mês, legibilidade dos valores monetários dos KPIs, ajuste proporcional do SVG do donut sem corte em `320px` e navegação por toque na legenda/fatia.

### Tests for User Story 2

- [X] T014 [P] [US2] Validar e expandir testes de `DashboardHeader` e `MonthSelector` garantindo acessibilidade e layout flexível em `components/dashboard/dashboard-header.test.tsx` e `components/dashboard/month-selector.test.tsx`
- [X] T015 [P] [US2] Validar e expandir testes de `CategoryDonutChart` e `MetricCardsGrid` preservando interação tátil e renderização completa em `components/dashboard/category-donut-chart.test.tsx` e `components/dashboard/metric-cards-grid.test.tsx`

### Implementation for User Story 2

- [X] T016 [P] [US2] Ajustar `DashboardHeader` e `MonthSelector` (`min-w-0 flex-1 sm:min-w-[170px] sm:flex-none`, CTA `w-full sm:w-auto`, botões com área confortável no mobile) em `components/dashboard/dashboard-header.tsx` e `components/dashboard/month-selector.tsx`
- [X] T017 [P] [US2] Refinar grid progressivo (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5`) e tipografia tabular/fluida sem truncar valores BRL em `components/dashboard/metric-cards-grid.tsx` e `components/dashboard/metric-card.tsx`
- [X] T018 [P] [US2] Tornar o SVG de `CategoryDonutChart` fluido (`w-full max-w-[220px] sm:max-w-[260px] h-auto`) e ajustar legenda/quebras em `components/dashboard/category-donut-chart.tsx` e `components/dashboard/category-chart-legend.tsx`
- [X] T019 [P] [US2] Ajustar quebras de linha, cabeçalhos e alinhamento de botões no mobile para `components/dashboard/ai-diagnosis-card.tsx` e `components/profile/profile-onboarding-banner.tsx`

**Checkpoint**: US2 funcional — todo o painel principal (`/`) opera sem cortes ou compressões em smartphones, tablets, notebooks e desktops.

---

## Phase 5: User Story 3 - Gestão de Transações, Filtros, Upload e Exportação em Telas Menores (Priority: P1) 🎯 MVP

**Goal**: Adaptar filtros, tabela de transações (cards empilhados no mobile `<768px` e tabela em `>=768px`), banners e campos de intervalo customizado na Central de Exportação.

**Independent Test**: Navegar em `/transactions` e `/settings/export` nas larguras `320px`, `480px`, `768px` e `1440px`; filtrar lançamentos com nomes longos de conta, visualizar todas as 7 informações do lançamento e botões de ação no mobile, e operar seletores de data customizados na exportação sem compressão.

### Tests for User Story 3

- [X] T020 [P] [US3] Expandir `components/transactions/transaction-table.test.tsx` adicionando cenários com mock de `useMediaQuery` (`true` -> cards mobile com todos os 7 atributos e ações; `false` -> tabela desktop intacta)
- [X] T021 [P] [US3] Validar testes de filtros e exportação (`components/transactions/transaction-filters.test.tsx` e `components/transactions/transaction-export-card.test.tsx`) garantindo preservação de seletores e callbacks após ajustes responsivos

### Implementation for User Story 3

- [X] T022 [P] [US3] Adaptar `TransactionFilters` para coluna única em `<640px` (`grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-end`) com `<select>` `w-full min-w-0` e `input[type="month"]` flexível em `components/transactions/transaction-filters.tsx`
- [X] T023 [US3] Implementar visualização adaptativa em cards no mobile (`<768px` via `useMediaQuery("(max-width: 767px)")`) mantendo alvos `size-10` e preservar tabela `overflow-x-auto` no desktop em `components/transactions/transaction-table.tsx`
- [X] T024 [P] [US3] Ajustar empilhamento de cabeçalho/banners pós-categorização e área de upload em `app/(dashboard)/transactions/page.tsx`, `components/transactions/upload-summary-banner.tsx` e `components/transactions/transaction-dropzone.tsx`
- [X] T025 [P] [US3] Alterar o seletor de intervalo customizado de datas de `grid-cols-2` para `grid-cols-1 sm:grid-cols-2` evitando corte em `320px` em `components/transactions/transaction-export-card.tsx`

**Checkpoint**: US3 funcional — gestão de transações e exportação completas em smartphones e desktops.

---

## Phase 6: User Story 4 - Contas, Configurações, Formulários e Modais Confortáveis ao Toque (Priority: P2)

**Goal**: Garantir que todos os diálogos portados possuam contenção `max-h-[90dvh] overflow-y-auto`, que formulários de perfil/metas/contas/auth expandam ações adequadamente no mobile e que ícones críticos respeitem área tátil confortável.

**Independent Test**: Abrir todos os modais em viewport `320x568` confirmando acesso ao título e botões de confirmar; operar `/accounts`, `/login`, `/register`, `/onboarding`, `/settings/profile`, `/settings/security` e `/settings/metas` em smartphones e tablets sem botões sobrepostos ou campos cortados.

### Tests for User Story 4

- [X] T026 [P] [US4] Verificar e expandir cobertura de testes dos diálogos de conta e transação (`components/accounts/account-form-dialog.test.tsx`, `components/accounts/account-delete-dialog.test.tsx`, `components/transactions/transaction-delete-dialog.test.tsx`, `components/transactions/transaction-edit-dialog.test.tsx`)

### Implementation for User Story 4

- [X] T027 [P] [US4] Padronizar `max-h-[90dvh] overflow-y-auto`, paddings `p-4 sm:p-6` e rodapé empilhável nos modais customizados `components/accounts/account-form-dialog.tsx`, `components/accounts/account-delete-dialog.tsx` e `components/transactions/transaction-delete-dialog.tsx`
- [X] T028 [P] [US4] Ajustar truncamento de descrição longa e rodapé responsivo em `components/transactions/transaction-edit-dialog.tsx` e `components/ai-key/ai-key-modal.tsx`
- [X] T029 [P] [US4] Ajustar tipografia fluida de patrimônio líquido (`break-words`), CTA `w-full sm:w-auto` e alvos táteis (`size-10 sm:size-8`) em `app/(dashboard)/accounts/page.tsx` e `components/accounts/account-card.tsx`
- [X] T030 [P] [US4] Refinar botões `w-full sm:w-auto`, `flex-wrap` no bloco de avatar e grids em `components/profile/user-profile-identity-form.tsx`, `components/profile/financial-profile-form.tsx` e `components/security/connected-accounts-section.tsx`
- [X] T031 [P] [US4] Revisar espaçamentos, alinhamento do divisor Google e proteção contra overflow em `components/auth/login-form.tsx`, `components/auth/register-form.tsx` e `app/(dashboard)/onboarding/page.tsx`

**Checkpoint**: US4 funcional — todos os modais e formulários são confortáveis e seguros em telas baixas e dispositivos touch.

---

## Phase 7: User Story 5 - Consultor Financeiro Virtual e Botão Flutuante Sem Obstrução (Priority: P2)

**Goal**: Garantir altura útil dinâmica (`dvh`) no chat em tela cheia e gaveta lateral, quebra segura de strings/URLs/códigos nas bolhas Markdown e posicionamento equilibrado do botão flutuante em telas pequenas.

**Independent Test**: Abrir `/chat` e a gaveta lateral em `320px–480px`, enviar resposta com URL contínua longa e bloco de código, confirmar ausência de overflow horizontal e visibilidade contínua do campo de digitação.

### Tests for User Story 5

- [X] T032 [P] [US5] Validar e expandir testes em `components/chat/chat-drawer.test.tsx` e `lib/markdown-renderer.test.tsx` cobrindo contenção de URLs/blocos longos e renderização responsiva da gaveta

### Implementation for User Story 5

- [X] T033 [P] [US5] Atualizar container do chat para altura dinâmica (`h-[calc(100dvh-6.5rem)] min-h-[420px]`) em `app/(dashboard)/chat/page.tsx` e `h-dvh w-full sm:max-w-md md:max-w-lg` em `components/chat/chat-drawer.tsx`
- [X] T034 [P] [US5] Aplicar `min-w-0 break-words [overflow-wrap:anywhere]` em bolhas de mensagem e contêiner `overflow-x-auto` para blocos extensos em `components/chat/chat-message-item.tsx` e `lib/markdown-renderer.tsx`
- [X] T035 [P] [US5] Ajustar posicionamento e alvo tátil de `ChatFloatingButton` (`right-4 bottom-4 sm:right-6 sm:bottom-6`) e layout de cabeçalho/chips em `components/chat/chat-floating-button.tsx` e `components/chat/chat-panel.tsx`

**Checkpoint**: US5 funcional — experiência conversacional fluida e sem cortes em viewports móveis dinâmicas.

---

## Phase 8: Polish & Cross-Cutting Verification

**Purpose**: Garantir 100% de integridade da aplicação em testes automatizados, tipagem estrita, lint, formatação nos arquivos alterados, build de produção e cenários do `quickstart.md`.

- [X] T036 [P] Executar formatação Prettier apenas nos arquivos modificados desta feature (`app/`, `components/`, `hooks/`, `lib/`) respeitando o padrão do projeto sem gerar ruído em arquivos não relacionados
- [X] T037 Executar suíte completa de testes automatizados (`pnpm test`) garantindo 100% de aprovação em todos os arquivos de teste
- [X] T038 [P] Executar checagem estrita de tipos (`pnpm typecheck`) e ESLint (`pnpm lint`) garantindo zero erros
- [X] T039 Executar build de produção (`pnpm build`) confirmando compilação limpa de todas as rotas estáticas/App Router
- [ ] T040 Validar manualmente os cenários das 6 faixas de resolução conforme `specs/012-full-app-responsiveness/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** & **Foundational (Phase 2)**: Devem ser concluídas primeiro — `T004` (`useMediaQuery`) bloqueia `T020` e `T023` (cards mobile da tabela), e `T006` (`Dialog` base) estabelece o padrão dos demais modais.
- **User Stories (Phases 3 a 7)**:
  - **US1 (P1 - Navegação/Shell)**, **US2 (P1 - Dashboard)** e **US3 (P1 - Transações/Export)** formam o bloco prioritário MVP e podem avançar em paralelo após Phase 2.
  - **US4 (P2 - Contas/Configurações/Modais)** e **US5 (P2 - Chat/FAB)** dependem apenas do alinhamento base da Phase 1–2 e integram-se sem conflitos de arquivos.
- **Polish (Phase 8)**: Depende da conclusão de todas as fases de implementação.

### Parallel Opportunities

- Dentro da **Phase 1**: `T002` e `T003` em paralelo após/junto com `T001`.
- Dentro da **Phase 2**: `T005`, `T006` e `T007` em paralelo após `T004`.
- Dentro da **US1**: `T008` e `T009` em paralelo (testes); `T011`, `T012` e `T013` em paralelo por arquivo isolado.
- Dentro da **US2**: `T014` e `T015` (testes); `T016`, `T017`, `T018` e `T019` em paralelo.
- Dentro da **US3**: `T020` e `T021` (testes); `T022`, `T024` e `T025` em paralelo (`T023` após `T004`).
- Dentro da **US4**: `T027`, `T028`, `T029`, `T030` e `T031` todas em arquivos distintos, podendo rodar em paralelo.
- Dentro da **US5**: `T033`, `T034` e `T035` em paralelo.

---

## Parallel Example: MVP P1 (US1 + US2 + US3)

```bash
# Após concluir Phase 1 e Phase 2, executar em paralelo por arquivos isolados:
Task: "T010 [US1] Refatorar Navbar para lg:flex e menu móvel robusto em components/layout/navbar.tsx"
Task: "T016 [US2] Ajustar DashboardHeader e MonthSelector em components/dashboard/"
Task: "T018 [US2] Tornar SVG de CategoryDonutChart fluido em components/dashboard/category-donut-chart.tsx"
Task: "T022 [US3] Adaptar TransactionFilters para mobile em components/transactions/transaction-filters.tsx"
Task: "T023 [US3] Implementar cards mobile (<768px) em components/transactions/transaction-table.tsx"
Task: "T025 [US3] Corrigir grid de datas em components/transactions/transaction-export-card.tsx"
```

---

## Implementation Strategy

### MVP First (Histórias P1: US1 → US2 → US3)

1. Concluir Phase 1 (Global/Layout) e Phase 2 (`useMediaQuery` + `Dialog` base).
2. Entregar **US1** (Navegação sem overflow em `320px` e tablets) → validar testes `navbar.test.tsx` e `user-nav.test.tsx`.
3. Entregar **US2** (Dashboard Principal e Donut adaptativos) → validar testes de dashboard.
4. Entregar **US3** (Transações em cards mobile, filtros empilhados e datas na exportação) → validar `transaction-table.test.tsx` e `transaction-export-card.test.tsx`.
5. Concluir **US4** (Modais com rolagem, Contas, Configurações, Auth) e **US5** (`100dvh` no Chat e posicionamento do FAB).
6. Executar bateria final (`T036`–`T040`): `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` e validação visual nas 6 faixas de resolução.
