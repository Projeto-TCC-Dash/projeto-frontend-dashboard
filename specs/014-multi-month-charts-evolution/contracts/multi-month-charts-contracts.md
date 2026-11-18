# Interface Contracts: Evolução Visual de Gráficos e Histórico Multi-Mês

**Feature Branch**: `014-multi-month-charts-evolution` | **Date**: 2026-11-18

---

## 1. Componente: `MultiMonthEvolutionChart`

**Arquivo**: `components/dashboard/multi-month-evolution-chart.tsx`

### Props Interface

```typescript
import type { MultiMonthHorizon, MultiMonthEvolutionPoint } from "@/src/types/charts"

export interface MultiMonthEvolutionChartProps {
  /** Pontos mensais calculados para a visualização */
  data: readonly MultiMonthEvolutionPoint[]
  /** Horizonte temporal selecionado atualmente */
  horizon: MultiMonthHorizon
  /** Callback acionado quando o usuário altera o horizonte */
  onHorizonChange: (horizon: MultiMonthHorizon) => void
  /** Meta de reserva de emergência em BRL (opcional para traçar ReferenceLine) */
  emergencyFundTarget?: number
  /** Estado de carregamento */
  isLoading?: boolean
  /** Altura do gráfico em pixels (padrão: 320) */
  height?: number
  /** Classes CSS adicionais */
  className?: string
}
```

### Contrato de Testabilidade (data-testids e Acessibilidade)

- Container principal: `data-testid="multi-month-evolution-chart"`
- Cabeçalho do card: `data-testid="multi-month-chart-header"`
- Seletores de horizonte temporal:
  - Container: `data-testid="horizon-selector"`
  - Botão 6M: `data-testid="horizon-btn-6M"`, `aria-pressed="true|false"`
  - Botão 12M: `data-testid="horizon-btn-12M"`, `aria-pressed="true|false"`
  - Botão Tudo: `data-testid="horizon-btn-ALL"`, `aria-pressed="true|false"`
- Superfície do gráfico (ComposedChart): `data-testid="composed-chart-surface"`
- Selo de crescimento do período: `data-testid="period-growth-badge"`
- Estado vazio: `data-testid="multi-month-chart-empty"`
- Estado de loading (Skeleton): `data-testid="multi-month-chart-loading"`

---

## 2. Componente: `PeriodCashflowCard` (Aprimorado)

**Arquivo**: `components/dashboard/period-cashflow-card.tsx`

### Props Interface Atualizada

```typescript
import type { FinancialMetrics } from "@/src/types/api"
import type { PeriodCashflowViewMode } from "@/src/types/charts"

export interface PeriodCashflowCardProps {
  metrics: FinancialMetrics | null | undefined
  month: string
  isLoading?: boolean
  className?: string
  /** Modo inicial de exibição (padrão: 'daily') */
  initialViewMode?: PeriodCashflowViewMode
}
```

### Contrato de Testabilidade e Interação

- Alternador de modo de exibição no cabeçalho:
  - Toggle group: `data-testid="cashflow-view-mode-toggle"`
  - Opção "Diário": `data-testid="view-mode-daily"`, `aria-pressed="true|false"`
  - Opção "Acumulado": `data-testid="view-mode-cumulative"`, `aria-pressed="true|false"`
- Gráfico no modo diário: renderiza `BarChart` com `maxBarSize={28}`
- Gráfico no modo acumulado: renderiza `AreaChart` (`data-testid="cumulative-cashflow-area-chart"`) com curva contínua
- Tooltip com saldo líquido: `data-testid="cashflow-tooltip-net"`

---

## 3. Primitivo: `DonutChart` (Aprimorado)

**Arquivo**: `components/ui/tremor/donut-chart.tsx`

### Refinamento da Props e Renderização

```typescript
export interface DonutChartProps {
  // ... props existentes ...
  /** Raio de curvatura das extremidades das fatias (padrão: 6) */
  cornerRadius?: number
  /** Destaque radial ativo na fatia selecionada */
  activeSliceHighlight?: boolean
}
```

### Contrato de Testabilidade

- Donut container: `data-testid="tremor-donut-chart"`
- Cada fatia (`Cell`) possui transição suave de opacidade e raio:
  - Ativa: `stroke="var(--background)"`, `strokeWidth={2}`
  - Inativa/esmaecida: `fillOpacity={0.35}`
  - Todas as fatias possuem cantos arredondados via `cornerRadius={6}` no elemento `Pie`.

---

## 4. Componente: `MetricCard` (Aprimorado com Tendência e Sparkline)

**Arquivo**: `components/dashboard/metric-card.tsx`

### Props Interface Atualizada

```typescript
import type { TrendMetric } from "@/src/types/charts"

export interface MetricCardProps {
  // ... props existentes ...
  /** Indicador de variação percentual mês a mês (MoM) */
  trend?: TrendMetric | null
  /** Dados para a mini sparkline no rodapé do cartão (opcional) */
  sparklineData?: number[]
}
```

### Contrato de Testabilidade

- Selo de tendência: `data-testid="metric-trend-badge"`
  - Contém texto formatado (ex.: `+8,5% vs mês ant.`)
  - Classe semântica verde (`bg-emerald-500/10 text-emerald-600`) para positivo ou vermelha (`bg-rose-500/10 text-rose-600`) para alerta/queda
- Mini sparkline: `data-testid="metric-sparkline"`

---

## 5. Componente: `AccountAllocationBar`

**Arquivo**: `components/accounts/account-allocation-bar.tsx`

### Props Interface

```typescript
import type { AccountAllocationSegment } from "@/src/types/charts"

export interface AccountAllocationBarProps {
  /** Segmentos proporcionais por tipo de conta */
  segments: readonly AccountAllocationSegment[]
  /** Patrimônio total consolidado */
  totalBalance: number
  /** Classes CSS adicionais */
  className?: string
}
```

### Contrato de Testabilidade

- Container da barra de alocação: `data-testid="account-allocation-bar"`
- Cada segmento horizontal: `data-testid="allocation-segment-{type}"` com largura proporcional `width: {percentage}%`
- Legenda com percentuais: `data-testid="allocation-legend"`
