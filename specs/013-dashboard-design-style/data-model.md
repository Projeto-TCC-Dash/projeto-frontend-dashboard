# Data & UI Model: Estilização Visual dos Dashboards, Visualizações Analíticas e Animações

**Feature Branch**: `feature/013-dashboard-design-style` | **Date**: 2026-11-12

> **Nota de Escopo**: Esta feature não altera contratos REST do backend nem entidades persistidas no servidor. Este documento formaliza os tokens visuais, os modelos de transformação client-side para gráficos Tremor Raw, os contratos de dados desacoplados para a base `lightweight-charts` e os estados de animação/movimento da interface.

---

## 1. Tokens Semânticos e Paleta de Gráficos (`SemanticThemeTokens`)

### 1.1 Tokens de Superfície e Identidade (Preservados de `app/globals.css`)
- **Superfícies Neutras**: `--background`, `--card`, `--popover`, `--muted`, `--secondary`, `--border`, `--input`, `--primary` mantidos nos valores `oklch` atuais para modo claro (`:root`) e escuro (`.dark`).
- **Tokens Semânticos de Gráficos (`--chart-1`..`--chart-5`)**:
  - `--chart-1`: Esmeralda (`oklch(0.696 0.17 162.48)` no escuro / `oklch(0.60 0.16 162)` no claro) — Receitas / Superávit
  - `--chart-2`: Azul (`oklch(0.623 0.214 259.815)` / `oklch(0.55 0.20 259)`) — Fluxo / Transporte / Comparativo
  - `--chart-3`: Âmbar (`oklch(0.769 0.188 70.08)` / `oklch(0.68 0.17 70)`) — Alimentação / Alerta / Poupança intermediária
  - `--chart-4`: Violeta (`oklch(0.627 0.265 303.9)` / `oklch(0.56 0.22 300)`) — Moradia / Destaque secundário
  - `--chart-5`: Ciano (`oklch(0.715 0.143 215.221)` / `oklch(0.62 0.14 215)`) — Investimentos / Meta
- **11 Categorias Canônicas (`CATEGORY_COLORS`)**:
  - Mapeamento oficial preservado integralmente (`Moradia`, `Alimentação`, `Transporte`, `Saúde`, `Lazer`, `Educação`, `Receita`, `Pagamento de Fatura`, `Investimentos`, `Outros`, `Não Categorizado`), expandido em `lib/chart-utils.ts` com classes compatíveis com Tremor Raw (`fill-*`, `bg-*`, `text-*`, `stroke-*`) além dos valores hexadecimais canônicos.

---

## 2. Modelos de Visualização Analítica (Tremor Raw)

### 2.1 `CategoryChartItem`
Representação compartilhada entre o `DonutChart` (Tremor Raw), o `BarList` (ranking proporcional) e o *drill-down* para transações:
- `category: string` — Nome da categoria canônica
- `amount: number` — Montante gasto (`> 0`) em BRL
- `percentage: number` — Percentual relativo ao total de despesas (`0..100`)
- `color: string` — Cor hexadecimal oficial de `getCategoryColor(category)`
- `formattedAmount: string` — Valor formatado via `formatCurrencyBRL(amount)`
- **Regras de Validação**:
  - Filtrar itens com `amount <= 0`.
  - Ordenar em ordem decrescente por `amount`.
  - Manter todas as categorias ativas (sem agrupar categorias pequenas em "Outros" artificialmente).

### 2.2 `PeriodFlowDatum` (`CashflowPoint`)
Ponto de série agregada para o gráfico comparativo (`BarChart` Tremor Raw) no card independente **"Fluxo do Período"**:
- `periodLabel: string` (`label`) — Rótulo do intervalo no mês (ex.: `"Sem 1"`, `"Sem 2"`, `"Sem 3"`, `"Sem 4"`, `"Sem 5"` ou `"Resumo"` em fallback sem transações detalhadas)
- `Receitas: number` (`receitas`) — Soma de entradas (`amount > 0` ou categoria `Receita`) no intervalo, sempre `>= 0`
- `Despesas: number` (`despesas`) — Soma de despesas primárias (`amount < 0` excluindo `"Pagamento de Fatura"`) em valor absoluto `>= 0`
- `Faturas: number` (`faturas`) — Soma de quitações de fatura (`category === "Pagamento de Fatura"`) em valor absoluto `>= 0`
- `netBalance: number` — `Receitas - Despesas - Faturas`
- **Regras de Derivação (`lib/dashboard-charts.ts`)**:
  - Função pura determinística `buildPeriodCashflowSeries(transactions, metrics, month)`.
  - Se `transactions.length > 0`, agrupa pelas semanas do mês selecionado (`1–7`, `8–14`, `15–21`, `22–28`, `29–31`) filtrando corretamente apenas transações com valores válidos (`Number.isFinite`).
  - Se `transactions.length === 0` mas `metrics` possui `totalIncome > 0` ou `totalExpenses > 0`, gera série consolidada única `"Competência"` com `metrics.totalIncome`, `metrics.totalExpenses` e `metrics.invoiceSettlements ?? 0` (para não exibir gráfico vazio incorretamente quando métricas existem).
  - Se ambos estiverem zerados, retorna array vazio `[]` acionando o estado vazio ilustrado.

### 2.3 Composição Analítica Empilhada (Sem Abas)
- `CategoryDonutChart` (**Distribuição por Categorias**) e `PeriodCashflowCard` (**Fluxo do Período**) são renderizados simultaneamente em pilha vertical na coluna esquerda do Bento Grid, com estados independentes de carregamento e estado vazio.

---

## 3. Modelos de Séries Temporais para Futuros Dashboards de Investimentos (`src/types/charts.ts`)

### 3.1 `InvestmentChartSeriesType`
- `"area" | "line" | "candlestick"` (padrão: `"area"`).

### 3.2 `InvestmentTimeSeriesPoint` (para `area` e `line`)
- `time: string` — Data ISO `YYYY-MM-DD` (ou timestamp Unix em segundos `number` compatível com `lightweight-charts` v5)
- `value: number` — Valor patrimonial ou cotação na unidade da carteira (`BRL`)

### 3.3 `InvestmentOhlcPoint` (para `candlestick` futuro)
- `time: string` — Data ISO `YYYY-MM-DD` (ou timestamp Unix em segundos)
- `open: number`
- `high: number`
- `low: number`
- `close: number`

### 3.4 `InvestmentCrosshairReadout`
Estado exibido no cabeçalho/legenda interativa do gráfico ao mover o cursor/toque:
- `timeLabel: string` — Data formatada em `pt-BR` (`DD/MM/YYYY`)
- `formattedValue: string` — Valor formatado via `formatCurrencyBRL`
- `rawValue: number`

### 3.5 `InvestmentChartThemePalette`
Derivado dinamicamente do tema ativo (`"light" | "dark"`):
- `backgroundColor: string` (`"transparent"`)
- `textColor: string`
- `gridColor: string`
- `borderColor: string`
- `lineColor: string` (ciano/esmeralda semântico harmonizado com a estética neutra)
- `areaTopColor: string`
- `areaBottomColor: string`
- `upColor: string` / `downColor: string` (para candlesticks futuros)

---

## 4. Modelos de Animação e Estado Visual

### 4.1 `MetricValueFormatMode`
- `"currency"` — Formatação `BRL` padrão (`R$ 10.000,00`)
- `"signed-currency"` — Prefixo explícito `+` quando `numericValue > 0` (`+R$ 4.000,00`) e sinal negativo padrão para `< 0`
- `"percentage"` — Percentual com 1 casa decimal (`60,0%`)

### 4.2 `AiDiagnosisVisualState` & Geometria Responsiva do Bento Grid
Máquina de estados visuais aplicada ao `AiDiagnosisCard` e ao `BorderBeam`:
- `"byok-pending"` (`!hasAiKey`) → Borda âmbar estática, sem `BorderBeam`.
- `"error"` (`Boolean(error)`) → Borda rose estática, sem `BorderBeam`.
- `"loading"` (`isLoading`) → Skeleton animado padrão, sem `BorderBeam`.
- `"empty"` (`!analysis`) → Borda tracejada neutra, sem `BorderBeam`.
- `"processing"` (`Boolean(analysis) && isRefreshing`) → `BorderBeam` ativo em destaque sutil indicando recálculo em andamento.
- `"ready"` (`Boolean(analysis) && !isRefreshing`) → Acabamento refinado com brilho/borda estática ou beam ultra sutil (suprimido se `prefersReducedMotion === true`).

Regras de geometria responsiva (`matchedDesktopHeight: boolean`, ativo no `DashboardPage`):
- **Desktop (`>= 1280px` / `xl:`)**: em todos os estados (`byok-pending`, `error`, `loading`, `empty`, `processing`, `ready`), o `AiDiagnosisCard` assume exatamente a altura combinada dos dois cards da coluna esquerda (`CategoryDonutChart` + `gap-6` + `PeriodCashflowCard`), fixando o `CardHeader` no topo (`xl:shrink-0`) e atribuindo `xl:flex-1 xl:min-h-0 xl:overflow-y-auto` ao `CardContent` (sem barra de rolagem quando o conteúdo couber; rolagem via mouse exclusivamente no corpo quando ultrapassar).
- **Mobile/Tablet (`< 1280px`)**: comportamento em fluxo natural de documento (`static`, `h-auto`), sem rolagem interna aprisionada.

### 4.3 `MotionAccessibilityState`
- `prefersReducedMotion: boolean`
  - Controlado globalmente pelo `<MotionConfig reducedMotion="user">` e pelo hook `usePrefersReducedMotion()`.
  - Quando `true`: `NumberFlow` desativa animação progressiva (`animated={false}`), `BorderBeam` não renderiza sweep animado, `useSafeAutoAnimate` chama `enable(false)`, e componentes `motion` suprimem deslocamentos espaciais (`transform`/`layout`).
