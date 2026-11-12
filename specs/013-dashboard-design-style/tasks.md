---

description: "Task list for feature implementation: 013-dashboard-design-style"
---

# Tasks: Estilização Visual dos Dashboards, Visualizações Analíticas e Animações

**Input**: Design documents from `/specs/013-dashboard-design-style/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/design-visualization-contracts.md`, `quickstart.md`)

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/design-visualization-contracts.md`

**Tests**: Incluídos conforme Princípio VII da Constituição (Vitest + React Testing Library) e `SC-006` para preservar toda a suíte existente e validar os novos módulos visuais, agregadores puros, base temporal de investimentos e acessibilidade de movimento.

**Organization**: Tarefas organizadas por fase e por História de Usuário (P1 → P2) para entrega incremental e testável de forma independente.

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Pode executar em paralelo (arquivos distintos, sem dependência de tarefa incompleta)
- **[Story]**: História de usuário correspondente (`[US1]`, `[US2]`, `[US3]`, `[US4]`) — omitido nas fases Setup, Foundational e Polish

---

## Phase 1: Setup (Dependências, Tokens de Tema & Ambiente de Testes)

**Purpose**: Instalar bibliotecas aprovadas compatíveis com React 19 + Tailwind v4, atualizar tokens semânticos de gráficos preservando a identidade visual neutra e preparar polyfills de teste em `happy-dom`.

- [X] T001 Instalar `recharts`, `react-is`, `lightweight-charts`, `@number-flow/react`, `motion` e `@formkit/auto-animate` com override de `react-is` para React 19 em `package.json`
- [X] T002 [P] Atualizar tokens `--chart-1` a `--chart-5` para `:root` e `.dark` (mantendo paleta neutra `--background`, `--card`, `--primary` e `--radius`) e adicionar `@keyframes` de destaque de borda respeitando `@media (prefers-reduced-motion: reduce)` em `app/globals.css`
- [X] T003 [P] Adicionar polyfills determinísticos para `ResizeObserver`, `window.matchMedia` e fallback seguro de teste para `@number-flow/react` em `tests/setup.ts`

---

## Phase 2: Foundational (Tipos Estritos, Utilitários de Gráficos & Hooks de Acessibilidade)

**Purpose**: Infraestrutura compartilhada de tipagem estrita (`zero any`), paletas e agregação pura de dados financeiros, além de detecção segura de preferência de movimento reduzido.

**⚠️ CRITICAL**: Nenhuma história de usuário deve iniciar antes da conclusão desta fase.

- [X] T004 Criar tipagens estritas (`CategoryChartItem`, `PeriodFlowDatum`, `AnalyticsViewTab`, `InvestmentChartSeriesType`, `InvestmentTimeSeriesPoint`, `InvestmentOhlcPoint`, `InvestmentCrosshairReadout`, `InvestmentChartThemePalette`, `MetricValueFormatMode` e `AiDiagnosisVisualState`) em `src/types/charts.ts`
- [X] T005 [P] Criar utilitários de cores Tremor Raw alinhados às 11 categorias canônicas de `CATEGORY_COLORS` e função `getInvestmentChartPalette(resolvedTheme)` em `lib/chart-utils.ts`
- [X] T006 [P] Implementar funções puras `buildCategoryChartItems` (filtrar `amount <= 0` e ordenar decrescente sem agrupamento artificial) e `buildPeriodFlowSeries` (agregação semanal segregando `Pagamento de Fatura` e fallback consolidado quando não houver lista de transações) em `lib/dashboard-charts.ts`
- [X] T007 [P] Criar testes unitários para `buildCategoryChartItems`, `buildPeriodFlowSeries` e paletas claro/escuro cobrindo mês vazio e cenário exclusivo de faturas em `lib/dashboard-charts.test.ts`
- [X] T008 [P] Criar hook SSR-safe `usePrefersReducedMotion` em `hooks/use-reduced-motion.ts` e wrapper `useSafeAutoAnimate` (conectando `@formkit/auto-animate/react` com `enable(!prefersReducedMotion)`) em `hooks/use-safe-auto-animate.ts`
- [X] T009 [P] Criar testes unitários para `usePrefersReducedMotion` e `useSafeAutoAnimate` cobrindo fallback SSR, eventos `change` e supressão com movimento reduzido em `hooks/use-reduced-motion.test.tsx`

**Checkpoint**: Base tipada, agregadores testados e hooks de acessibilidade prontos — início das histórias de usuário.

---

## Phase 3: User Story 1 - Identidade Visual Preservada e Composição Refinada dos Dashboards (Priority: P1) 🎯 MVP

**Goal**: Manter integralmente a estética neutra atual nos modos claro e escuro, refinar o acabamento visual dos 5 cartões de métricas (recipientes tintados de ícones e `ProgressBar` na Taxa de Poupança) e estruturar o Bento Grid proporcional (`7/5`) em `xl:` no painel principal.

**Independent Test**: Renderizar `MetricCard`, `MetricCardsGrid` e `DashboardPage` nos modos claro e escuro verificando manutenção de tokens neutros, `data-testid="metric-value"`, variante semântica de cor, `ProgressBar` acessível e composição Bento Grid `xl:grid-cols-12` com empilhamento em 1 coluna abaixo de `1280px`.

### Tests for User Story 1

- [X] T010 [P] [US1] Atualizar e expandir testes validando recipiente de ícone tintado, `ProgressBar` (`role="progressbar"`), `data-testid="metric-value"` e preservação de cálculos contábeis em `components/dashboard/metric-card.test.tsx` e `components/dashboard/metric-cards-grid.test.tsx`
- [X] T011 [P] [US1] Atualizar testes de integração do painel principal incluindo mock padrão de `useTransactions` e validação da composição Bento Grid (`xl:grid-cols-12`) em `app/(dashboard)/page.test.tsx`

### Implementation for User Story 1

- [X] T012 [P] [US1] Criar componente `ProgressBar` no padrão Tremor Raw (`role="progressbar"`, `aria-valuenow`, `aria-valuemin={0}`, `aria-valuemax={100}`) em `components/ui/tremor/progress-bar.tsx`
- [X] T013 [US1] Refinar acabamento visual de `MetricCard` (recipiente tintado por variante e props opcionais `numericValue?: number`, `formatMode?: MetricValueFormatMode`, `progressValue?: number`) e passar `progressValue` da Taxa de Poupança em `components/dashboard/metric-card.tsx` e `components/dashboard/metric-cards-grid.tsx` (depende de T012)
- [X] T014 [US1] Reorganizar área inferior do painel principal em Bento Grid responsivo (`grid grid-cols-1 gap-6 xl:grid-cols-12 items-start`, colunas `xl:col-span-7` e `xl:col-span-5`) integrando `useTransactions({ month: selectedMonth })` em `app/(dashboard)/page.tsx`

**Checkpoint**: US1 funcional — estética preservada, cartões refinados e Bento Grid responsivo operacionais.

---

## Phase 4: User Story 2 - Visualizações Analíticas Interativas e Comparativas no Painel (Priority: P1) 🎯 MVP

**Goal**: Implementar componentes copy-paste Tremor Raw (`DonutChart`, `BarList`, `BarChart`), evoluir `CategoryDonutChart` com sincronia bidirecional gráfico ↔ ranking em barras preservando *drill-down* e entregar alternância limpa entre **Categorias** e **Fluxo do Período** via `DashboardAnalyticsCard`.

**Independent Test**: Renderizar `CategoryDonutChart` e `DashboardAnalyticsCard` com dados completos, categorias mínimas (`< 1%`) e estado vazio, validando tooltip em BRL, sincronia hover/toque entre `DonutChart` e `BarList`, cores das 11 categorias canônicas, *drill-down* `/transactions?month=YYYY-MM&category=...` e alternância de aba para **Fluxo do Período**.

### Tests for User Story 2

- [X] T015 [P] [US2] Atualizar testes de distribuição de categorias validando `DonutChart` + `BarList` Tremor Raw, preservação de `data-testid="category-donut-chart"` / `category-donut-chart-empty` / `donut-center-info`, sincronia hover/toque, 11 cores canônicas e *drill-down* em `components/dashboard/category-donut-chart.test.tsx`
- [X] T016 [P] [US2] Criar testes unitários para `DashboardAnalyticsCard` validando abas acessíveis (`role="tablist"` / `role="tab"`, `Categorias` vs `Fluxo do Período`), `BarChart` comparativo e estados vazio/loading em `components/dashboard/dashboard-analytics-card.test.tsx`

### Implementation for User Story 2

- [X] T017 [P] [US2] Implementar `DonutChart` Tremor Raw sobre Recharts (tooltip flutuante em `bg-popover`, centro configurável e callbacks de hover/seleção) em `components/ui/tremor/donut-chart.tsx`
- [X] T018 [P] [US2] Implementar `BarList` Tremor Raw em Tailwind puro (barras proporcionais ordenadas, cor semântica, sincronia hover/toque e área tátil `min-h-11 sm:min-h-9`) em `components/ui/tremor/bar-list.tsx`
- [X] T019 [P] [US2] Implementar `BarChart` Tremor Raw sobre Recharts (eixos em BRL compacto, `stroke-border/50`, tooltip `formatCurrencyBRL` e legenda interativa) em `components/ui/tremor/bar-chart.tsx`
- [X] T020 [US2] Atualizar `CategoryChartLegend` e `CategoryDonutChart` integrando `DonutChart` + `BarList` Tremor Raw com preservação de `data-testid` contratuais, cores canônicas e *drill-down* em `components/dashboard/category-chart-legend.tsx` e `components/dashboard/category-donut-chart.tsx` (depende de T017, T018)
- [X] T021 [US2] Criar `DashboardAnalyticsCard` com abas (`categories` | `cashflow`) integrando `CategoryDonutChart` e `BarChart` (`buildPeriodFlowSeries`) e conectar ao slot `xl:col-span-7` em `components/dashboard/dashboard-analytics-card.tsx` e `app/(dashboard)/page.tsx` (depende de T014, T019, T020)

**Checkpoint**: US1 e US2 funcionais — gráficos Tremor Raw interativos e alternância de visões integrados ao painel.

---

## Phase 5: User Story 3 - Micro-Interações e Animações Fluidas com Acessibilidade de Movimento (Priority: P2)

**Goal**: Aplicar transição numérica fluida em KPIs (`@number-flow/react`), coreografia de entrada e indicador deslizante na navegação (`motion/react`), destaque sutil condicionado no `AiDiagnosisCard` (`BorderBeam`) e animação automática de listas (`@formkit/auto-animate`), tudo subordinado a `prefers-reduced-motion`.

**Independent Test**: Testar troca rápida de meses nos KPIs (`tabular-nums`), troca de abas e links ativos na `Navbar`, estado de processamento vs erro/BYOK pendente no `AiDiagnosisCard`, filtragem de listas dinâmicas e supressão imediata de animações sob `prefers-reduced-motion: reduce`.

### Tests for User Story 3

- [X] T022 [P] [US3] Criar testes unitários para `AnimatedNumberValue` validando modos `currency`, `signed-currency` (prefixo `+` quando positivo) e `percentage`, `tabular-nums`, atualização rápida e desativação com movimento reduzido em `components/ui/animated-number-value.test.tsx`
- [X] T023 [P] [US3] Atualizar testes de `AiDiagnosisCard` validando ativação sutil do `BorderBeam` apenas em estados `processing`/`ready` e ausência em `!hasAiKey`, `error`, `!analysis` e `prefers-reduced-motion` em `components/dashboard/ai-diagnosis-card.test.tsx`
- [X] T024 [P] [US3] Atualizar testes de `Navbar` verificando indicador visual ativo na navegação desktop sem quebrar atributos de acessibilidade ou fechamento do menu móvel em `components/layout/navbar.test.tsx`

### Implementation for User Story 3

- [X] T025 [P] [US3] Envolver a árvore global com `<MotionConfig reducedMotion="user">` em `components/providers.tsx`
- [X] T026 [US3] Criar `AnimatedNumberValue` com `@number-flow/react` (`locales="pt-BR"`, `tabular-nums`, `animated={!prefersReducedMotion}`) e conectar `numericValue`/`formatMode` em `components/ui/animated-number-value.tsx`, `components/dashboard/metric-card.tsx` e `components/dashboard/metric-cards-grid.tsx` (depende de T013)
- [X] T027 [P] [US3] Criar `BorderBeam` em CSS puro (`aria-hidden="true"`, `pointer-events-none`, suprimido com `prefers-reduced-motion`) em `components/ui/border-beam.tsx` e integrar máquina de estados visuais (`processing`/`ready` vs `byok-pending`/`error`/`empty`) em `components/dashboard/ai-diagnosis-card.tsx`
- [X] T028 [US3] Adicionar entrada escalonada sutil com `motion/react` em `MetricCardsGrid` e blocos Bento de `DashboardPage`, `AnimatePresence` na troca de abas de `DashboardAnalyticsCard` e `layoutId="navbar-active-pill"` em `components/dashboard/metric-cards-grid.tsx`, `app/(dashboard)/page.tsx`, `components/dashboard/dashboard-analytics-card.tsx` e `components/layout/navbar.tsx` (depende de T021, T025, T026)
- [X] T029 [P] [US3] Aplicar `useSafeAutoAnimate` nos containers de itens filtráveis/ordenáveis em `components/ui/tremor/bar-list.tsx`, `components/dashboard/category-chart-legend.tsx`, `components/transactions/transaction-table.tsx` e `components/accounts/account-section.tsx`

**Checkpoint**: US3 funcional — todas as 4 frentes de animação operacionais e acessíveis sob `prefers-reduced-motion`.

---

## Phase 6: User Story 4 - Fundação Visual de Séries Temporais para Futuros Dashboards de Investimentos (Priority: P2)

**Goal**: Entregar o componente-base desacoplado `InvestmentTimeSeriesChart` usando `lightweight-charts` v5, pronto para futuros módulos de investimentos, com troca dinâmica de tema claro/escuro, crosshair em BRL, redimensionamento responsivo e estado vazio sem cotações fictícias.

**Independent Test**: Testar `InvestmentTimeSeriesChart` isoladamente validando inicialização com `createChart` e `chart.addSeries(AreaSeries | LineSeries | CandlestickSeries, ...)`, atualização `applyOptions` na mudança de `resolvedTheme`, formatação BRL no crosshair, `ResizeObserver`, `chart.remove()` no unmount e estado vazio `data-testid="investment-chart-empty"` para série vazia.

### Tests for User Story 4

- [X] T030 [P] [US4] Criar testes unitários de `InvestmentTimeSeriesChart` com mock estruturado de `lightweight-charts` v5 validando `addSeries`, sincronização `light` ↔ `dark`, crosshair em BRL, redimensionamento, cleanup no unmount e estado vazio real em `components/charts/investment-time-series-chart.test.tsx`

### Implementation for User Story 4

- [X] T031 [US4] Implementar componente `'use client'` `InvestmentTimeSeriesChart` usando `lightweight-charts` v5 (`AreaSeries`, `LineSeries`, `CandlestickSeries`), `useTheme()`, `ResizeObserver`, crosshair formatado via `formatCurrencyBRL`, `handleScroll` seguro e estado vazio `data-testid="investment-chart-empty"` sem dados fictícios em `components/charts/investment-time-series-chart.tsx`

**Checkpoint**: US4 funcional — fundação de séries temporais de investimentos pronta e testada de forma independente.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Garantir conformidade completa com lint, formatação, TypeScript estrito, build Next.js 16, suíte de testes completa e roteiro de verificação visual.

- [X] T032 [P] Executar formatação e lint (`pnpm format` e `pnpm lint`) garantindo zero avisos ou violações em todos os arquivos alterados
- [X] T033 [P] Executar verificação estrita de tipos (`pnpm typecheck`) e build de produção (`pnpm build`) confirmando ausência de erros SSR ou de React 19
- [X] T034 Executar suíte completa `pnpm test` e validar manualmente o roteiro completo em `specs/013-dashboard-design-style/quickstart.md` (temas claro/escuro, `320px` a `1440px+`, troca rápida de competência, *drill-down* e `prefers-reduced-motion`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Inicia imediatamente; `T001` desbloqueia imports das novas libs nos testes/implementações seguintes.
- **Foundational (Phase 2)**: Depende de `T001`–`T003` e **BLOQUEIA** todas as histórias de usuário (`US1`–`US4`).
- **User Story 1 (Phase 3 — P1 MVP)**: Depende da Phase 2 (`T004`–`T009`). Base visual para o Bento Grid e KPIs refinados.
- **User Story 2 (Phase 4 — P1 MVP)**: Depende da Phase 2 (`T004`–`T007`) e integra-se ao slot `xl:col-span-7` criado em `T014` (`US1`).
- **User Story 3 (Phase 5 — P2)**: Depende de `T008`–`T009` (Phase 2), integra `AnimatedNumberValue` sobre `MetricCard` (`T013`) e `AnimatePresence` sobre `DashboardAnalyticsCard` (`T021`).
- **User Story 4 (Phase 6 — P2)**: Depende apenas de `T001`–`T005` (Phase 1 & 2) — totalmente independente de `US1`, `US2` e `US3`.
- **Polish (Phase 7)**: Depende da conclusão de todas as histórias desejadas (`T001`–`T031`).

### User Story Dependencies

- **US1 (P1)**: Independente após Phase 2.
- **US2 (P1)**: Primitivos Tremor Raw (`T017`, `T018`, `T019`) são independentes após Phase 2; apenas a integração final no `DashboardPage` (`T021`) acopla após `T014`.
- **US3 (P2)**: `T025`, `T027` e `T029` podem rodar independentemente após Phase 2; `T026` depende de `T013` e `T028` depende de `T021` + `T026`.
- **US4 (P2)**: 100% independente das demais histórias após Phase 2.

---

## Parallel Opportunities & Examples

### Parallel Example: Phase 2 (Foundational)

```bash
Task: "Criar tipagens estritas em src/types/charts.ts" (T004)
# Em seguida, em paralelo:
Task: "Criar utilitários de cores em lib/chart-utils.ts" (T005)
Task: "Implementar agregadores puros em lib/dashboard-charts.ts" (T006)
Task: "Criar hooks de reduced-motion e auto-animate em hooks/use-reduced-motion.ts e hooks/use-safe-auto-animate.ts" (T008)
```

### Parallel Example: User Story 2 (Primitivos Tremor Raw)

```bash
Task: "Implementar DonutChart Tremor Raw em components/ui/tremor/donut-chart.tsx" (T017)
Task: "Implementar BarList Tremor Raw em components/ui/tremor/bar-list.tsx" (T018)
Task: "Implementar BarChart Tremor Raw em components/ui/tremor/bar-chart.tsx" (T019)
```

### Parallel Example: User Story 3 & User Story 4

```bash
Task: "Envolver árvore global com MotionConfig em components/providers.tsx" (T025)
Task: "Criar BorderBeam e integrar no AiDiagnosisCard" (T027)
Task: "Aplicar useSafeAutoAnimate em listas dinâmicas" (T029)
Task: "Criar testes e componente InvestmentTimeSeriesChart (lightweight-charts v5)" (T030, T031)
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Concluir Phase 1 (Setup) e Phase 2 (Foundational).
2. Entregar **Phase 3 (US1)** — preservação estética, refinamento de KPIs e Bento Grid.
3. Entregar **Phase 4 (US2)** — visualizações Tremor Raw (`DonutChart` + `BarList` + `BarChart` Fluxo do Período) e *drill-down* preservado.
4. **STOP and VALIDATE**: Rodar `pnpm test` e validar visualmente o MVP no navegador antes das animações e base de investimentos.

### Incremental Delivery

1. Setup + Foundational → Fundação pronta.
2. US1 + US2 → Novo visual analítico do dashboard pronto (MVP).
3. US3 → Camada completa de animações acessíveis (`NumberFlow`, `Motion`, `BorderBeam`, `AutoAnimate`).
4. US4 → Base `lightweight-charts` v5 pronta para futuros dashboards de investimentos.
5. Polish (`T032`–`T034`) → Verificação final (`typecheck`, `lint`, `build`, `test` e `quickstart.md`).

---

## Phase 8: Convergence

- [X] T035 Criar componente independente PeriodCashflowCard sem abas usando BarChart Tremor Raw e estados de carregamento/vazio em components/dashboard/period-cashflow-card.tsx per FR-006 (missing)
- [X] T036 Atualizar Bento Grid em app/(dashboard)/page.tsx removendo xl:items-start, empilhando CategoryDonutChart acima de PeriodCashflowCard em xl:col-span-7, aplicando xl:relative em xl:col-span-5 e passando matchedDesktopHeight ao AiDiagnosisCard per FR-002 (contradicts)
- [X] T037 Implementar prop matchedDesktopHeight em components/dashboard/ai-diagnosis-card.tsx aplicando xl:absolute xl:inset-0 xl:flex xl:flex-col xl:overflow-hidden nos cards de todos os estados visuais, xl:shrink-0 em todos os CardHeader e xl:flex-1 xl:min-h-0 xl:overflow-y-auto (data-testid="ai-diagnosis-body") nos CardContent per FR-002 (partial)
- [X] T038 Criar suíte de testes unitários para PeriodCashflowCard cobrindo barras de Receitas/Despesas/Faturas, loading e estado vazio em components/dashboard/period-cashflow-card.test.tsx per Constitution VII (missing)
- [X] T039 Atualizar testes em components/dashboard/ai-diagnosis-card.test.tsx e app/(dashboard)/page.test.tsx cobrindo visualização simultânea dos dois cards empilhados sem abas, alinhamento stretch com xl:relative, cabeçalho fixo/corpo rolável em todos os estados de matchedDesktopHeight e validar com pnpm typecheck, pnpm lint, pnpm test e pnpm build per SC-006 (partial)
- [X] T040 Remover artefatos obsoletos do layout em abas (components/dashboard/dashboard-analytics-card.tsx, components/dashboard/dashboard-analytics-card.test.tsx e tipo DashboardAnalyticsTab em src/types/charts.ts) e limpar prop legada embedded de components/dashboard/category-donut-chart.tsx se sem chamadores per Constitution II (unrequested)
