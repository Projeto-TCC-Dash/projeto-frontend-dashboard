# Tasks: Evolução Visual de Gráficos e Histórico Financeiro Consolidado Multi-Mês

**Input**: Design documents from `/specs/014-multi-month-charts-evolution/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Format: `- [ ] [ID] [P?] [Story?] Description with exact file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definição de contratos e tipos compartilhados

- [X] T001 [P] Declarar tipagens canônicas de gráficos multi-mês (`MultiMonthHorizon`, `MultiMonthEvolutionPoint`, `PeriodCashflowViewMode`, `TrendMetric`, `AccountAllocationSegment`) em `src/types/charts.ts`

---

## Phase 2: Foundational (Funções Puras de Séries e Regras de Negócio)

**Purpose**: Utilitários de transformação e cálculo para alimentar os gráficos sem acoplamento

**⚠️ CRITICAL**: Pré-requisito para as User Stories do dashboard e tela de contas

- [X] T002 [P] Implementar testes unitários cobrindo agregação multi-mês, gap-filling e cálculo de tendência MoM em `lib/dashboard-charts.test.ts`
- [X] T003 Implementar funções puras `buildMultiMonthEvolutionSeries`, `calculateMoMTrend` e `buildAccountAllocationSegments` em `lib/dashboard-charts.ts`

**Checkpoint**: Camada de cálculo pura testada e validada. As User Stories podem ser implementadas.

---

## Phase 3: User Story 1 - Gráfico de Evolução Financeira Consolidada Multi-Mês (Priority: P1) 🎯 MVP

**Goal**: Exibir gráfico combinado com barras de receitas/despesas e curva de subida acumulada com seletores 6M/12M/Tudo

**Independent Test**: Renderizar o dashboard com histórico e verificar a curva de área contínua ascendente, o recálculo via chips de horizonte e o tooltip detalhado

### Testes para User Story 1

- [X] T004 [P] [US1] Criar testes unitários e de acessibilidade para `MultiMonthEvolutionChart` em `components/dashboard/multi-month-evolution-chart.test.tsx`

### Implementação para User Story 1

- [X] T005 [US1] Implementar componente `MultiMonthEvolutionChart` com `ComposedChart` (barras, área com gradiente, `ReferenceLine y=0` e linha de meta) em `components/dashboard/multi-month-evolution-chart.tsx`
- [X] T006 [US1] Integrar `MultiMonthEvolutionChart` no dashboard principal em `app/(dashboard)/page.tsx` e atualizar testes de integração em `app/(dashboard)/page.test.tsx`

**Checkpoint**: MVP do histórico multi-mês funcional e testável de forma independente.

---

## Phase 4: User Story 2 - Incremento Visual e Interatividade nos Gráficos Existentes (Priority: P1) 🎯 MVP

**Goal**: Polimento visual do `DonutChart` (cantos curvos, destaque radial) e `PeriodCashflowCard` (toggle Diário vs Acumulado, gradiente e `maxBarSize`)

**Independent Test**: Interagir com o gráfico de rosca verificando bordas curvas e alternar o card de fluxo para visão acumulada observando a curva contínua do mês

### Testes para User Story 2

- [X] T007 [P] [US2] Atualizar testes de `DonutChart` e `PeriodCashflowCard` com o novo modo de visualização em `components/dashboard/period-cashflow-card.test.tsx` e `components/dashboard/category-donut-chart.test.tsx`

### Implementação para User Story 2

- [X] T008 [US2] Refinar `DonutChart` aplicando `cornerRadius={6}` e expansão radial no hover/foco em `components/ui/tremor/donut-chart.tsx`
- [X] T009 [US2] Aprimorar `PeriodCashflowCard` adicionando alternador Diário/Acumulado, gradiente vertical nas barras, `maxBarSize={28}` e saldo líquido no tooltip em `components/dashboard/period-cashflow-card.tsx`

**Checkpoint**: Ambos os cards analíticos existentes com acabamento visual superior e modo acumulado.

---

## Phase 5: User Story 3 - Indicadores de Tendência e Mini Sparklines nos Cartões de Métricas (Priority: P2)

**Goal**: Exibir selos percentuais de variação MoM e mini curvas de tendência diretamente nos cartões de KPI

**Independent Test**: Verificar se os cartões de métricas exibem selos com cores semânticas corretas (alta de despesas como alerta) e mini gráficos de linha sem eixos

### Testes para User Story 3

- [X] T010 [P] [US3] Criar testes unitários para variação MoM e sparklines em `components/dashboard/metric-card.test.tsx` e `components/dashboard/metric-cards-grid.test.tsx`

### Implementação para User Story 3

- [X] T011 [US3] Atualizar `MetricCard` com suporte a `trend?: TrendMetric` e `sparklineData?: number[]` em `components/dashboard/metric-card.tsx`
- [X] T012 [US3] Atualizar `MetricCardsGrid` para calcular e repassar tendências MoM e séries de sparkline aos cartões em `components/dashboard/metric-cards-grid.tsx`

**Checkpoint**: Cartões de KPI com leitura executiva imediata de tendência e curvas de curto prazo.

---

## Phase 6: User Story 4 - Alocação Patrimonial e Séries Temporais em Contas (Priority: P3)

**Goal**: Exibir barra horizontal proporcional de patrimônio por tipo de conta e ativar gráfico financeiro temporal em `/accounts`

**Independent Test**: Acessar `/accounts` e constatar a barra segmentada de alocação de ativos e o gráfico de séries temporais financeiras ativo

### Testes para User Story 4

- [X] T013 [P] [US4] Criar testes unitários para a barra de alocação patrimonial em `components/accounts/account-allocation-bar.test.tsx`

### Implementação para User Story 4

- [X] T014 [US4] Implementar componente `AccountAllocationBar` com segmentos proporcionais coloridos em `components/accounts/account-allocation-bar.tsx`
- [X] T015 [US4] Integrar `AccountAllocationBar` e ativar `InvestmentTimeSeriesChart` na página de contas em `app/(dashboard)/accounts/page.tsx` com atualização de testes em `app/(dashboard)/accounts/page.test.tsx`

**Checkpoint**: Gestão de contas enriquecida com proporção de ativos e gráfico temporal.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de qualidade estática, suíte completa de testes e validação cruzada

- [X] T016 [P] Executar checagem estática de tipagem estrita com TypeScript (`pnpm typecheck`)
- [X] T017 Executar suíte completa de testes automatizados (`pnpm test`) garantindo 100% dos testes verdes
- [X] T018 Executar validação de quickstart conforme `specs/014-multi-month-charts-evolution/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — execução imediata.
- **Foundational (Phase 2)**: Depende do Setup (Phase 1) — BLOQUEIA as User Stories.
- **User Story 1 (Phase 3)**: Depende de Foundational (Phase 2).
- **User Story 2 (Phase 4)**: Depende de Foundational (Phase 2) — pode ser paralela a US1.
- **User Story 3 (Phase 5)**: Depende de Foundational (Phase 2).
- **User Story 4 (Phase 6)**: Depende de Foundational (Phase 2).
- **Polish (Phase 7)**: Depende de todas as User Stories concluídas.

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Concluir Phase 1 (Tipagens canônicas)
2. Concluir Phase 2 (Cálculo puro de séries e testes)
3. Concluir Phase 3 (Gráfico Multi-Mês com ComposedChart)
4. Concluir Phase 4 (Polimento no Donut e Fluxo Acumulado)
5. **VALIDAR MVP**: Testar no navegador a visualização do histórico e os gráficos polidos
6. Concluir Phase 5 (Sparklines e MoM nos KPIs)
7. Concluir Phase 6 (Alocação de patrimônio em `/accounts`)
8. Concluir Phase 7 (Validação geral `typecheck` + `test`)
