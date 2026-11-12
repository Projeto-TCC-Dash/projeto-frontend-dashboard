import type { Category } from "@/src/types/api"

export type TremorColor =
  | "emerald"
  | "violet"
  | "amber"
  | "blue"
  | "rose"
  | "cyan"
  | "sky"
  | "teal"
  | "slate"
  | "zinc"

export interface CategoryChartDatum {
  category: Category | string
  name: string
  amount: number
  percentage: number
  color: string
  colorName: TremorColor
  href?: string
}

export interface BarListItem {
  key: string
  name: string
  value: number
  color: string
  colorName?: TremorColor
  percentage?: number
  href?: string
}

export interface CashflowPoint {
  label: string
  isoDate: string
  receitas: number
  despesas: number
  faturas: number
  [key: string]: string | number
}

export interface ChartTooltipPayloadItem<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  name?: string | number
  dataKey?: string | number
  value?: number | string
  color?: string
  payload?: TData
}

export type InvestmentSeriesType = "area" | "line" | "candlestick"

export interface InvestmentSingleValuePoint {
  time: string | number
  value: number
}

export interface InvestmentCandlestickPoint {
  time: string | number
  open: number
  high: number
  low: number
  close: number
}

export type InvestmentSeriesPoint =
  InvestmentSingleValuePoint | InvestmentCandlestickPoint

export interface InvestmentTimeSeriesChartProps {
  title?: string
  subtitle?: string
  seriesType?: InvestmentSeriesType
  data: readonly InvestmentSeriesPoint[]
  height?: number
  className?: string
  showHeader?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export type BorderBeamState = "hidden" | "subtle" | "active"
