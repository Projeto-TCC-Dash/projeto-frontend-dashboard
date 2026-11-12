# UI & Visualization Contracts: Estilização Visual dos Dashboards

**Feature Branch**: `feature/013-dashboard-design-style` | **Date**: 2026-11-12

Este documento estabelece os contratos de interface, propriedades, acessibilidade, preservação de `data-testid` e comportamento visual dos componentes criados ou atualizados nesta feature.

---

## 1. Contrato de Preservação Estética e Layout (`DashboardPage` & `MetricCard`)

### 1.1 `DashboardPage` (`app/(dashboard)/page.tsx`)
- **Estrutura de Topo**: `DashboardHeader` → `ProfileOnboardingBanner` → `MetricCardsGrid` (inalterada em ordem e fluxo de dados).
- **Bento Grid Inferior (`data-testid="dashboard-bento-grid"`)**:
  - Container: `grid grid-cols-1 gap-6 xl:grid-cols-12` (alinhamento padrão `stretch` no grid desktop para igualar a altura das colunas sem travar em `items-start`).
  - Coluna Esquerda (`data-testid="bento-analytics-slot"`): `min-w-0 flex flex-col gap-6 xl:col-span-7`, empilhando dois cards independentes:
    1. `CategoryDonutChart` (**Distribuição por Categorias**) no topo;
    2. `PeriodCashflowCard` (**Fluxo do Período**) diretamente abaixo.
  - Coluna Direita (`data-testid="bento-diagnosis-slot"`): `min-w-0 xl:relative xl:col-span-5`, renderizando `<AiDiagnosisCard matchedDesktopHeight ... />` igualado exatamente à altura combinada da coluna esquerda no desktop (`>= 1280px`).
- **Responsividade**:
  - `320px–1279px`: empilhamento em 1 coluna (`grid-cols-1`) com altura natural contínua de todos os três cards no scroll da página e zero overflow horizontal.
  - `>=1280px` (`xl:`): disposição lado a lado `7/5`, mantendo linha de base alinhada entre o rodapé de **Fluxo do Período** e o rodapé de **Parecer do Consultor Financeiro** nos modos claro e escuro.

### 1.2 `MetricCard` (`components/dashboard/metric-card.tsx`) & `AnimatedNumberValue`
- **Compatibilidade Retroativa**:
  - Prop obrigatória existente `value: string` preservada sem alteração de assinatura para todos os chamadores atuais.
  - Novas props opcionais:
    - `numericValue?: number`
    - `formatMode?: "currency" | "signed-currency" | "percentage"`
    - `progressValue?: number` (0..100, opcional para micro-barra `ProgressBar` Tremor Raw no card de Taxa de Poupança)
- **Invariantes DOM & Testes**:
  - `data-testid="metric-value"` mantido no elemento principal de valor.
  - `data-testid="metric-card-skeleton"` mantido no estado `isLoading`.
  - Classes de cor por variante (`text-emerald-600`, `text-rose-600`, `text-amber-600`, `text-foreground`) preservadas no elemento `metric-value`.
  - `tabular-nums` obrigatório no container numérico para evitar oscilação horizontal durante animação com `@number-flow/react`.
  - Quando `numericValue` for fornecido, exibir valor formatado acessível no DOM (incluindo fallback seguro quando `prefersReducedMotion` estiver ativo ou em ambiente de teste sem Shadow DOM completo).

---

## 2. Contrato de Visualizações Analíticas Tremor Raw

### 2.1 Biblioteca Interna Tremor Raw (`components/ui/tremor/`)
Componentes copy-paste com TypeScript estrito (`zero any`) e tokens de `lib/chart-utils.ts`:
- `DonutChart` (`components/ui/tremor/donut-chart.tsx`): baseado em Recharts `PieChart`/`Pie` com centro informativo customizável, tooltip flutuante estético em card neutro (`bg-popover text-popover-foreground border-border shadow-md`) e callbacks `onValueChange` / hover por segmento.
- `BarList` (`components/ui/tremor/bar-list.tsx`): barras proporcionais em Tailwind puro ordenadas por valor, com suporte a cor customizada por item, foco/hover sincronizado e ação `onClick` por linha com alvo tátil mínimo `min-h-11 sm:min-h-9`.
- `BarChart` (`components/ui/tremor/bar-chart.tsx`): baseado em Recharts `BarChart` com eixos formatados em BRL compacto, grid discreto (`stroke-border/50`), tooltip formatado via `formatCurrencyBRL` e legenda interativa.
- `ProgressBar` (`components/ui/tremor/progress-bar.tsx`): barra de progresso compacta e acessível (`role="progressbar"`, `aria-valuenow`, `aria-valuemin={0}`, `aria-valuemax={100}`).

### 2.2 Cards Analíticos Empilhados (`CategoryDonutChart` & `PeriodCashflowCard` em `components/dashboard/`)
- **Card Superior — `CategoryDonutChart` (`components/dashboard/category-donut-chart.tsx`)**:
  - Cabeçalho próprio com título **"Distribuição por Categorias"** e orientação para *drill-down* no extrato filtrado.
  - Preserva `data-testid="category-donut-chart"`, `data-testid="category-donut-chart-loading"`, `data-testid="category-donut-chart-empty"` e `data-testid="donut-center-info"`.
  - Hover ou toque em fatia ou item do `BarList` / `CategoryChartLegend` sincroniza o destaque ativo (`activeCategory`).
  - Clique em qualquer categoria navega para `/transactions?month=${month}&category=${encodeURIComponent(category)}`.
  - Todas as 11 categorias canônicas usam exatamente as cores de `CATEGORY_COLORS`.
- **Card Inferior — `PeriodCashflowCard` (`components/dashboard/period-cashflow-card.tsx`)**:
  - Renderizado diretamente abaixo de `CategoryDonutChart` na mesma coluna esquerda (`flex flex-col gap-6`), sem alternância de abas.
  - Preserva `data-testid="period-cashflow-card"`, `data-testid="cashflow-chart-loading"` e `data-testid="cashflow-chart-empty"`.
  - Exibe cabeçalho **"Fluxo do Período"** e renderiza `BarChart` Tremor Raw comparando `Receitas` vs `Despesas` primárias (e `Faturas` quando houver quitação no período) derivado via `buildPeriodCashflowSeries(transactions, metrics, month)`.
  - Mantém estados independentes de carregamento proporcional (`isLoading || isTransactionsLoading`) e estado vazio instrutivo.

---

## 3. Contrato da Base de Investimentos (`InvestmentTimeSeriesChart`)

### 3.1 Arquivo & Assinatura (`components/charts/investment-time-series-chart.tsx`)
- **Diretiva**: `'use client'` obrigatório (canvas API de `lightweight-charts`).
- **Props principais**:
  - `data: InvestmentTimeSeriesPoint[] | InvestmentOhlcPoint[]`
  - `seriesType?: "area" | "line" | "candlestick"` (default `"area"`)
  - `title?: string`
  - `emptyTitle?: string` / `emptyDescription?: string`
  - `height?: number` (default `280`)
  - `currency?: string` (default `"BRL"`)
  - `onCrosshairChange?: (readout: InvestmentCrosshairReadout | null) => void`
  - `className?: string`
- **Comportamentos Obrigatórios**:
  1. **Zero Dados Fictícios**: Se `data.length === 0`, não instancia gráfico com valores simulados; renderiza estado vazio padronizado (`data-testid="investment-chart-empty"`).
  2. **API `lightweight-charts` v5**: Utiliza `createChart(...)` + `chart.addSeries(AreaSeries | LineSeries | CandlestickSeries, ...)`, `chart.timeScale().fitContent()`, `ResizeObserver` (ou `autoSize: true`) e `chart.remove()` no cleanup.
  3. **Sincronização de Tema**: Observa `resolvedTheme` (`next-themes`) e chama `chart.applyOptions(...)` atualizando instantaneamente cores de texto, bordas, grid e série sem recriar dados nem perder estado.
  4. **Crosshair & Localização**: Formata valores no eixo de preço e no readout de crosshair via `formatCurrencyBRL` (`pt-BR`) e datas em formato brasileiro.
  5. **Segurança de Scroll**: Configura interação para não bloquear rolagem vertical da página quando o usuário desliza a tela em smartphones/trackpads.

---

## 4. Contrato de Animações e Acessibilidade

### 4.1 Provider Global (`components/providers.tsx`)
- Envolver a árvore de UI com `<MotionConfig reducedMotion="user">`.

### 4.2 `BorderBeam` (`components/ui/border-beam.tsx`) & `AiDiagnosisCard`
- `BorderBeam` renderiza elemento decorativo com `aria-hidden="true"` e `pointer-events-none`.
- Em `AiDiagnosisCard`:
  - `isRefreshing === true` (com `hasAiKey === true`, sem erro e sem `prefersReducedMotion`): ativa `BorderBeam` em intensidade perceptível porém discreta.
  - Estado pronto (`analysis !== null && !isRefreshing`): borda sutil estática ou beam de baixa opacidade quando movimento completo habilitado.
  - Estados `!hasAiKey`, `error` ou `!analysis`: `BorderBeam` **desativado**.
- **Contrato de Altura Igualada e Rolagem no Desktop (`matchedDesktopHeight?: boolean`, padrão `false`)**:
  - Quando `matchedDesktopHeight={true}` (aplicado no `DashboardPage` dentro de wrapper `xl:relative xl:col-span-5`):
    - No breakpoint `>= 1280px` (`xl:`), o `<Card>` aplica `xl:absolute xl:inset-0 xl:flex xl:flex-col xl:overflow-hidden` em **todos os estados** (`!hasAiKey`, `error`, `isLoading`, `!analysis`, `analysis` pronto), igualando sua altura total exatamente à altura somada da coluna esquerda e alinhando a linha de base inferior.
    - Todos os `CardHeader` mantêm `xl:shrink-0`, fixando título, badge de status, metadados e ação primária (`Recalcular Diagnóstico` / `Gerar Análise` / `Configurar Chave de IA` / `Tentar novamente`) no topo durante a rolagem.
    - Todos os `CardContent` recebem `data-testid="ai-diagnosis-body"` (quando aplicável no corpo principal) com `xl:flex-1 xl:min-h-0 xl:overflow-y-auto`, exibindo o conteúdo sem barra de rolagem quando couber na altura disponível e permitindo rolagem com o mouse exclusivamente dentro do corpo quando exceder essa altura.
  - Abaixo de `1280px` (`320px–1279px`), as classes `xl:` não entram em vigor, preservando altura natural no fluxo vertical da página sem rolagem interna aprisionada.

### 4.3 `useSafeAutoAnimate` (`hooks/use-safe-auto-animate.ts`)
- Encapsula `@formkit/auto-animate/react` (`useAutoAnimate`) conectando `usePrefersReducedMotion()`.
- Garante que listas filtradas (`BarList`, `CategoryChartLegend`, `TransactionTable`, `AccountSection`) animem inserção/remoção/reordenação somente quando `!prefersReducedMotion`.

### 4.4 `Navbar` (`components/layout/navbar.tsx`)
- Links ativos no desktop (`lg:flex`) utilizam indicador de fundo animado com `layoutId="navbar-active-pill"` via `motion.span`, mantendo a mesma cor de destaque (`bg-secondary`) e acessibilidade (`aria-current` / foco visível).
