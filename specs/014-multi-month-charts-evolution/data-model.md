# Data Model: Evolução Visual de Gráficos e Histórico Financeiro Consolidado Multi-Mês

**Feature Branch**: `014-multi-month-charts-evolution` | **Date**: 2026-11-18

---

## 1. Entidades e Tipos TypeScript

### 1.1 Séries Históricas Multi-Mês

```typescript
export type MultiMonthHorizon = "6M" | "12M" | "ALL"

export interface MultiMonthEvolutionPoint {
  /** Competência no formato ISO 'YYYY-MM' (ex: '2026-10') */
  month: string
  /** Rótulo amigável para exibição no eixo X (ex: 'Out/26' ou 'Out') */
  label: string
  /** Soma de todas as receitas do mês em BRL (positivo) */
  receitas: number
  /** Soma das despesas primárias do mês em BRL (positivo absoluto) */
  despesas: number
  /** Soma de pagamentos de fatura de cartão no mês em BRL */
  faturas: number
  /** Saldo líquido do mês = receitas - despesas - faturas */
  netBalance: number
  /** Saldo financeiro acumulado até esta competência = Σ(netBalance_i) */
  cumulativeBalance: number
}

export interface MultiMonthEvolutionData {
  /** Lista ordenada cronologicamente de pontos mensais */
  points: MultiMonthEvolutionPoint[]
  /** Saldo acumulado final do período */
  totalCumulativeBalance: number
  /** Variação total percentual no período selecionado */
  periodGrowthRate?: number
  /** Meta de reserva de emergência calculada em BRL (opcional) */
  emergencyFundTarget?: number
}
```

### 1.2 Modo de Visualização do Fluxo do Período

```typescript
export type PeriodCashflowViewMode = "daily" | "cumulative"

export interface CumulativeDailyCashflowPoint {
  /** Data no formato ISO 'YYYY-MM-DD' */
  isoDate: string
  /** Rótulo abreviado para o eixo X (ex: '05/11') */
  label: string
  /** Entradas ocorridas nesta data */
  receitas: number
  /** Saídas operacionais ocorridas nesta data */
  despesas: number
  /** Faturas pagas nesta data */
  faturas: number
  /** Saldo líquido pontual do dia = receitas - despesas - faturas */
  dailyNet: number
  /** Saldo acumulado correndo ao longo dos dias do mês */
  cumulativeBalance: number
}
```

### 1.3 Indicadores de Tendência Mês a Mês (MoM) e Sparklines

```typescript
export type TrendDirection = "up" | "down" | "neutral"

export interface TrendMetric {
  /** Percentual absoluto ou relativo (ex: 12.5 para 12,5%) */
  rate: number
  /** Direção da variação */
  direction: TrendDirection
  /** Se o resultado é financeiramente positivo para o usuário (ex: queda em gastos = true) */
  isPositive: boolean
  /** Texto formatado para o selo (ex: '+12,5% vs mês ant.') */
  label: string
}

export interface SparklineDataPoint {
  index: number
  value: number
}
```

### 1.4 Segmentação de Alocação Patrimonial por Contas

```typescript
import type { AccountType } from "@/src/types/api"
import type { TremorColor } from "@/src/types/charts"

export interface AccountAllocationSegment {
  type: AccountType
  label: string
  balance: number
  percentage: number
  color: string
  tremorColor: TremorColor
}
```

---

## 2. Regras de Cálculo e Transformações Puras

### 2.1 Agregação Multi-Mês (`buildMultiMonthEvolutionSeries`)

1. **Agrupamento**: Transações são filtradas pelo intervalo selecionado (`6M`: últimos 6 meses a partir da competência ativa; `12M`: últimos 12 meses; `ALL`: todas as transações disponíveis).
2. **Preenchimento de Lacunas (Gap-Filling)**:
   - Determina o mês inicial e final da janela.
   - Itera por todos os meses contínuos (`YYYY-MM`).
   - Se um mês não tiver transações registradas, cria um ponto zerado para aquele mês (`receitas = 0`, `despesas = 0`, `faturas = 0`, `netBalance = 0`), mantendo o `cumulativeBalance` idêntico ao do mês anterior (sustentação de saldo, sem decaimento espúrio).
3. **Cálculo da Meta de Reserva**:
   - `CLT`: 6 × `declaredMonthlyIncome` (ou média de despesas).
   - `PJ_AUTONOMO`: 9 × `declaredMonthlyIncome`.
   - `PUBLIC_SERVANT`: 4 × `declaredMonthlyIncome`.
   - Outros: 6 × `declaredMonthlyIncome`.

### 2.2 Semântica Financeira de Tendência MoM (`calculateMoMTrend`)

- **Para Receitas e Saldo Líquido**:
  - `valorAtual > valorAnterior` → `direction = "up"`, `isPositive = true` (Verde).
  - `valorAtual < valorAnterior` → `direction = "down"`, `isPositive = false` (Vermelho/Rose).
- **Para Despesas Primárias e Quitação de Faturas**:
  - `valorAtual > valorAnterior` → `direction = "up"`, `isPositive = false` (Vermelho/Rose - Alerta de aumento de gastos).
  - `valorAtual < valorAnterior` → `direction = "down"`, `isPositive = true` (Verde - Economia de gastos).
- **Caso `valorAnterior === 0` ou inexistente**: Retorna `null` para omitir suavemente o selo comparativo.

---

## 3. Estados Visuais e Tratamento de Erros / Vazios

| Estado | Comportamento no Gráfico Multi-Mês | Comportamento no Fluxo Acumulado |
|---|---|---|
| **Sem dados / 0 transações** | Exibe container ilustrado amigável com mensagem orientando a importar extratos. | Exibe estado vazio padronizado existente. |
| **Apenas 1 mês cadastrado** | Renderiza barra e ponto com badge "Base inicial de acompanhamento". | Renderiza curva acumulada dos dias do mês normalmente. |
| **Déficit acumulado (saldo < 0)** | A curva transiciona abaixo de `ReferenceLine y=0` com gradiente rose. | A curva transiciona abaixo de zero com cor indicativa de déficit. |
| **`prefers-reduced-motion`** | `isAnimationActive={false}`, transições de escala desativadas, layout instantâneo. | `isAnimationActive={false}`, estabilização direta. |
