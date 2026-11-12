import type { Category } from "@/src/types/api"
import type { TremorColor } from "@/src/types/charts"
import { formatCurrencyBRL } from "@/lib/formatters"

export const CATEGORY_HEX_COLORS: Record<string, string> = {
  Moradia: "#8b5cf6",
  Alimentação: "#f59e0b",
  Transporte: "#3b82f6",
  Saúde: "#ef4444",
  Lazer: "#10b981",
  Educação: "#0284c7",
  Receita: "#14b8a6",
  "Pagamento de Fatura": "#64748b",
  Investimentos: "#06b6d4",
  Outros: "#64748b",
  "Não Categorizado": "#71717a",
}

export const CATEGORY_TREMOR_COLORS: Record<Category | string, TremorColor> = {
  Moradia: "violet",
  Alimentação: "amber",
  Transporte: "blue",
  Saúde: "rose",
  Lazer: "emerald",
  Educação: "sky",
  Receita: "teal",
  "Pagamento de Fatura": "slate",
  Investimentos: "cyan",
  Outros: "slate",
  "Não Categorizado": "zinc",
}

export interface TremorColorTokens {
  bg: string
  bgMuted: string
  text: string
  hex: string
}

export const TREMOR_COLOR_MAP: Record<TremorColor, TremorColorTokens> = {
  emerald: {
    bg: "bg-emerald-500",
    bgMuted: "bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    hex: "#10b981",
  },
  violet: {
    bg: "bg-violet-500",
    bgMuted: "bg-violet-500/20",
    text: "text-violet-600 dark:text-violet-400",
    hex: "#8b5cf6",
  },
  amber: {
    bg: "bg-amber-500",
    bgMuted: "bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    hex: "#f59e0b",
  },
  blue: {
    bg: "bg-blue-500",
    bgMuted: "bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    hex: "#3b82f6",
  },
  rose: {
    bg: "bg-rose-500",
    bgMuted: "bg-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
    hex: "#ef4444",
  },
  cyan: {
    bg: "bg-cyan-500",
    bgMuted: "bg-cyan-500/20",
    text: "text-cyan-600 dark:text-cyan-400",
    hex: "#06b6d4",
  },
  sky: {
    bg: "bg-sky-600",
    bgMuted: "bg-sky-600/20",
    text: "text-sky-600 dark:text-sky-400",
    hex: "#0284c7",
  },
  teal: {
    bg: "bg-teal-500",
    bgMuted: "bg-teal-500/20",
    text: "text-teal-600 dark:text-teal-400",
    hex: "#14b8a6",
  },
  slate: {
    bg: "bg-slate-500",
    bgMuted: "bg-slate-500/20",
    text: "text-slate-600 dark:text-slate-400",
    hex: "#64748b",
  },
  zinc: {
    bg: "bg-zinc-500",
    bgMuted: "bg-zinc-500/20",
    text: "text-zinc-600 dark:text-zinc-400",
    hex: "#71717a",
  },
}

export function resolveCategoryColor(category: string): string {
  return CATEGORY_HEX_COLORS[category] ?? "#64748b"
}

export function resolveCategoryTremorColor(category: string): TremorColor {
  return CATEGORY_TREMOR_COLORS[category] ?? "slate"
}

export function resolveColorHex(color: TremorColor | string): string {
  if (color in TREMOR_COLOR_MAP) {
    return TREMOR_COLOR_MAP[color as TremorColor].hex
  }
  if (color in CATEGORY_HEX_COLORS) {
    return CATEGORY_HEX_COLORS[color]
  }
  return color
}

export function getTremorColorTokens(
  color: TremorColor = "emerald"
): TremorColorTokens {
  return TREMOR_COLOR_MAP[color] ?? TREMOR_COLOR_MAP.emerald
}

export function formatCompactCurrencyBRL(value: number): string {
  if (!Number.isFinite(value)) return "R$ 0"
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""

  if (abs >= 1_000_000) {
    return `${sign}R$ ${(abs / 1_000_000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mi`
  }

  if (abs >= 1_000) {
    return `${sign}R$ ${(abs / 1_000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mil`
  }

  return formatCurrencyBRL(value)
}
