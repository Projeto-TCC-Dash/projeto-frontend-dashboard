# Tasks: Dashboard Financeiro com Métricas Consolidadas, Gráfico de Categorias e Parecer por IA

**Branch**: `003-dashboard-metrics-analysis` | **Date**: 2026-10-19 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Este documento estabelece o plano detalhado e sequencial de tarefas atômicas para implementação do Dashboard Financeiro, organizado estritamente por fases e histórias de usuário (User Stories).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização de utilitários de formatação, sanitização de Markdown e estrutura de diretórios do dashboard

- [ ] T001 Criar estrutura de diretórios para a feature de dashboard em `components/dashboard/`
- [ ] T002 Implementar e expandir utilitários de formatação em `lib/formatters.ts` (`formatCurrencyBRL`, `formatPercentage`, `formatMonthYear`, e `calculateSavingsRate` com tratamento de receitas zeradas e fixação em 0.0% com flag de déficit quando despesas > receitas)
- [ ] T003 [P] Criar testes unitários para os formatadores e cálculo de taxa de poupança/déficit em `lib/formatters.test.ts`
- [ ] T004 [P] Implementar renderizador seguro e sanitizado de Markdown para o parecer analítico em `lib/markdown-renderer.tsx` suportando títulos, listas e ênfases

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Hook de dados reativo com TanStack Query para consulta e recálculo da análise mensal que bloqueia as User Stories

**⚠️ CRITICAL**: Nenhuma User Story pode ser iniciada antes da conclusão e validação desta fase foundational.

- [ ] T005 Implementar hook customizado `useFinancialAnalysis` em `hooks/use-financial-analysis.ts` utilizando TanStack Query com chave `['analysis', month]`, consumindo `GET /api/analysis/:month`, e disponibilizando função `refreshAnalysis()` com chamada a `GET /api/analysis/:month?forceRefresh=true` e invalidação de cache
- [ ] T006 [P] Criar testes automatizados para `useFinancialAnalysis` em `hooks/use-financial-analysis.test.tsx` com cenários de carregamento, sucesso com cache, recálculo via `forceRefresh=true` e tratamento de erros 403 e 503

**Checkpoint**: Base foundational pronta — a implementação das User Stories pode iniciar sequencialmente ou em paralelo.

---

## Phase 3: User Story 1 - Visualização de Métricas Financeiras Consolidadas (Priority: P1) 🎯 MVP

**Goal**: Permitir ao usuário autenticado visualizar imediatamente os 4 cartões de indicadores financeiros consolidados do mês (Receitas Totais, Despesas Totais, Saldo Líquido e Taxa de Poupança) com formatação BRL, coloração semântica e indicação de déficit quando aplicável.

**Independent Test**: Acessar `/dashboard` e verificar a renderização dos 4 cartões de KPIs com valores monetários em Real e taxa de poupança com badge `"Sem poupança / Déficit orçamentário"` se despesas superarem receitas.

### Tests for User Story 1 ⚠️

- [ ] T007 [P] [US1] Criar testes de componente para o cartão de métricas em `components/dashboard/metric-card.test.tsx` cobrindo superávit, déficit, badge de alerta e estado de esqueleto (skeleton)

### Implementation for User Story 1

- [ ] T008 [P] [US1] Implementar componente de cartão de métrica individual `MetricCard` em `components/dashboard/metric-card.tsx` com suporte a variantes semânticas (verde positivo, vermelho/alerta negativo, neutro), ícone, indicador de tendência e skeleton
- [ ] T009 [US1] Implementar componente de grid responsivo `MetricCardsGrid` em `components/dashboard/metric-cards-grid.tsx` renderizando os cartões de Receitas Totais, Despesas Totais, Saldo Líquido e Taxa de Poupança com regras de déficit
- [ ] T010 [US1] Integrar os cards de métricas na página principal do dashboard em `app/(dashboard)/page.tsx` conectando o hook `useFinancialAnalysis` para o mês corrente

**Checkpoint**: User Story 1 (MVP) completamente funcional e testável de forma autônoma.

---

## Phase 4: User Story 2 - Gráfico Interativo de Distribuição de Categorias (Priority: P2)

**Goal**: Exibir gráfico interativo de rosca (Donut Chart) em SVG nativo apresentando todas as categorias canônicas com despesas ativas (> R$ 0), com tooltips detalhados, legenda com valores e percentuais, e navegação drill-down para `/transactions?month=YYYY-MM&category=<Nome>`.

**Independent Test**: Passar o cursor sobre as fatias do gráfico no dashboard para validar os tooltips (valor BRL e percentual), clicar em uma categoria e comprovar o redirecionamento com filtros aplicados para a tela de transações.

### Tests for User Story 2 ⚠️

- [ ] T011 [P] [US2] Criar testes de componente para o gráfico de categorias em `components/dashboard/category-donut-chart.test.tsx` cobrindo cálculo proporcional de arcos SVG, exibição de tooltips, interação de clique drill-down e empty state

### Implementation for User Story 2

- [ ] T012 [P] [US2] Implementar componente de legenda descritiva de categorias `CategoryChartLegend` em `components/dashboard/category-chart-legend.tsx` exibindo indicadores coloridos, nomes das categorias, montantes em BRL e percentuais
- [ ] T013 [US2] Implementar componente de gráfico de rosca nativo SVG `CategoryDonutChart` em `components/dashboard/category-donut-chart.tsx` com cálculo vetorial de fatias, eventos de hover para tooltip, redirecionamento via `router.push('/transactions?month=...&category=...')` e empty state ilustrado
- [ ] T014 [US2] Conectar o gráfico de distribuição de categorias `CategoryDonutChart` no layout responsivo da página em `app/(dashboard)/page.tsx`

**Checkpoint**: User Stories 1 e 2 totalmente funcionais e integradas de forma independente.

---

## Phase 5: User Story 3 - Parecer Analítico Mensal por IA em Markdown com Resiliência BYOK (Priority: P3)

**Goal**: Apresentar o parecer analítico mensal (`diagnosis`) em Markdown devidamente sanitizado, lista destacada de recomendações práticas (`recommendations`), indicador de cache (`cached: true/false`), botão de recálculo manual com `forceRefresh=true`, e UX resiliente que exibe convite amigável para cadastrar chave no modal BYOK quando `hasAiKey === false`.

**Independent Test**: Acessar o dashboard com conta com chave de IA ativa e validar a renderização do parecer e botão de recálculo; acessar com conta sem chave e confirmar a apresentação do card educativo com abertura do modal de chave BYOK.

### Tests for User Story 3 ⚠️

- [ ] T015 [P] [US3] Criar testes de componente para o diagnóstico de IA em `components/dashboard/ai-diagnosis-card.test.tsx` cobrindo renderização de Markdown, lista de recomendações, botão de recálculo, fallback BYOK e tratamento de erros 429/503

### Implementation for User Story 3

- [ ] T016 [P] [US3] Implementar componente de diagnóstico com IA `AiDiagnosisCard` em `components/dashboard/ai-diagnosis-card.tsx` com renderização rica em Markdown do parecer, badge de cache 24h, bloco de recomendações acionáveis e botão "Recalcular Diagnóstico" com spinner
- [ ] T017 [US3] Integrar o tratamento de resiliência BYOK no `AiDiagnosisCard` exibindo banner educativo e gatilho para o modal `AiKeyModal` quando `user.hasAiKey === false`, além de tratamento para erros 429 e 503 com opção de retentativa
- [ ] T018 [US3] Conectar o card de diagnóstico `AiDiagnosisCard` na página principal do dashboard em `app/(dashboard)/page.tsx`

**Checkpoint**: User Stories 1, 2 e 3 funcionando harmoniosamente e com resiliência BYOK.

---

## Phase 6: User Story 4 - Navegação por Competência Mensal e Sincronização Reativa (Priority: P4)

**Goal**: Fornecer seletor de competência mensal no topo do dashboard com navegação mês anterior / próximo mês, permitindo auditar meses passados e sincronizar reativamente todos os componentes da tela sem recarregamento.

**Independent Test**: Alternar o mês de competência no topo do dashboard e comprovar a atualização simultânea dos cards de KPIs, do gráfico de categorias e do parecer analítico de IA para a nova competência.

### Tests for User Story 4 ⚠️

- [ ] T019 [P] [US4] Criar testes de componente para o seletor de mês em `components/dashboard/month-selector.test.tsx` cobrindo avanço, recuo de mês e formatação amigável da competência

### Implementation for User Story 4

- [ ] T020 [P] [US4] Implementar componente de seleção de mês `MonthSelector` em `components/dashboard/month-selector.tsx` com botões anterior/próximo e label de mês por extenso
- [ ] T021 [US4] Implementar cabeçalho do painel `DashboardHeader` em `components/dashboard/dashboard-header.tsx` integrando o `MonthSelector`, badge visual de IA ativa e botão de acesso rápido para importar extratos
- [ ] T022 [US4] Integrar a sincronização de competência mensal na página orquestradora em `app/(dashboard)/page.tsx`, alimentando reativamente os componentes filhos com o mês ativo

**Checkpoint**: Todas as 4 User Stories integradas, testadas e completamente funcionais.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validação de qualidade, acessibilidade e conformidade mandatória com a Constituição do Projeto

- [ ] T023 [P] Validar atributos de acessibilidade ARIA nos cartões de métricas, gráfico vetorial SVG e parecer analítico
- [ ] T024 [P] Executar suíte completa de testes automatizados via `pnpm test` e validação estática de tipos via `pnpm typecheck`
- [ ] T025 Executar o roteiro de validação interativa manual documentado em `quickstart.md` para homologação final da entrega

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — inicia imediatamente.
- **Foundational (Phase 2)**: Depende do Setup — **BLOQUEIA** todas as User Stories.
- **User Stories (Phases 3 a 6)**: Todas dependem da conclusão da fase Foundational.
  - Podem ser executadas sequencialmente em ordem de prioridade (P1 → P2 → P3 → P4) ou em paralelo.
- **Polish (Phase 7)**: Depende da conclusão das User Stories desejadas.

### User Story Dependencies

- **User Story 1 (P1)**: Depende de Foundational (Phase 2). Não depende de outras histórias.
- **User Story 2 (P2)**: Depende de Foundational (Phase 2). Interage com US1 no layout da página, mas é testável isoladamente.
- **User Story 3 (P3)**: Depende de Foundational (Phase 2). Utiliza estado `hasAiKey` do usuário e opera isoladamente.
- **User Story 4 (P4)**: Depende de Foundational (Phase 2). Conecta o seletor aos componentes criados em US1, US2 e US3.

### Parallel Opportunities

```bash
# Executar tarefas paralelas da Fase 1 (Setup):
T003: "Criar testes unitários para os formatadores em lib/formatters.test.ts"
T004: "Implementar renderizador seguro de Markdown em lib/markdown-renderer.tsx"

# Executar tarefas paralelas da Fase 2 (Foundational):
T006: "Criar testes automatizados para useFinancialAnalysis em hooks/use-financial-analysis.test.tsx"

# Executar testes das User Stories em paralelo antes da implementação:
T007 [US1]: "Testes de MetricCard em components/dashboard/metric-card.test.tsx"
T011 [US2]: "Testes de CategoryDonutChart em components/dashboard/category-donut-chart.test.tsx"
T015 [US3]: "Testes de AiDiagnosisCard em components/dashboard/ai-diagnosis-card.test.tsx"
T019 [US4]: "Testes de MonthSelector em components/dashboard/month-selector.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Phase 1: Setup (`formatters.ts`, `markdown-renderer.tsx`)
2. Concluir Phase 2: Foundational (`useFinancialAnalysis` com TanStack Query)
3. Concluir Phase 3: User Story 1 (Cards de KPIs consolidados)
4. **Validar MVP**: Os 4 indicadores fundamentais estarão visíveis, calculados e formatados na rota `/dashboard`.

### Incremental Delivery

1. Setup + Foundational → Fundação reativa pronta.
2. Adicionar User Story 1 → Cards de Métricas consolidados (MVP entregue).
3. Adicionar User Story 2 → Gráfico interativo de rosca com drill-down para `/transactions`.
4. Adicionar User Story 3 → Parecer inteligente com IA, recomendações e resiliência BYOK.
5. Adicionar User Story 4 → Seletor de mês com sincronização reativa total.
6. Polish → Validação final de acessibilidade, `pnpm test` e `pnpm typecheck`.
