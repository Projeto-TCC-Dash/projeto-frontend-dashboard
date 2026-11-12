"use client"

import * as React from "react"
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  LineSeries,
  createChart,
  type AreaData,
  type CandlestickData,
  type IChartApi,
  type LineData,
  type MouseEventParams,
  type Time,
} from "lightweight-charts"
import { useTheme } from "next-themes"
import { TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrencyBRL } from "@/lib/formatters"
import type {
  InvestmentCandlestickPoint,
  InvestmentSingleValuePoint,
  InvestmentTimeSeriesChartProps,
} from "@/src/types/charts"

function isCandlestickPoint(
  point: InvestmentSingleValuePoint | InvestmentCandlestickPoint
): point is InvestmentCandlestickPoint {
  return "open" in point && "close" in point
}

function resolveChartTheme(isDark: boolean) {
  return {
    textColor: isDark ? "#a1a1aa" : "#71717a",
    gridColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)",
    borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
    lineColor: isDark ? "#34d399" : "#059669",
    topColor: isDark ? "rgba(52, 211, 153, 0.28)" : "rgba(16, 185, 129, 0.22)",
    bottomColor: "rgba(16, 185, 129, 0.0)",
    upColor: "#10b981",
    downColor: "#ef4444",
  }
}

export function InvestmentTimeSeriesChart({
  title = "Evolução Patrimonial",
  subtitle,
  seriesType = "area",
  data,
  height = 320,
  className,
  showHeader = true,
  emptyTitle = "Sem séries históricas de investimentos disponíveis",
  emptyDescription = "Os gráficos temporais serão exibidos assim que dados reais de cotações ou posição patrimonial estiverem sincronizados.",
}: InvestmentTimeSeriesChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const isDarkRef = React.useRef(isDark)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const chartRef = React.useRef<IChartApi | null>(null)

  const latestPoint = data.length > 0 ? data[data.length - 1] : null
  const latestValue = React.useMemo(() => {
    if (!latestPoint) return null
    return isCandlestickPoint(latestPoint)
      ? latestPoint.close
      : latestPoint.value
  }, [latestPoint])

  const [hoveredReadout, setHoveredReadout] = React.useState<{
    timeLabel: string
    value: number
  } | null>(null)

  React.useEffect(() => {
    const container = containerRef.current
    if (!container || data.length === 0) return

    const palette = resolveChartTheme(isDarkRef.current)

    const chart = createChart(container, {
      width: container.clientWidth || 640,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: palette.textColor,
      },
      grid: {
        vertLines: { color: palette.gridColor },
        horzLines: { color: palette.gridColor },
      },
      rightPriceScale: {
        borderColor: palette.borderColor,
      },
      timeScale: {
        borderColor: palette.borderColor,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        pinch: true,
        mouseWheel: false,
      },
      localization: {
        priceFormatter: (price: number) => formatCurrencyBRL(price),
      },
    })

    chartRef.current = chart

    if (seriesType === "candlestick") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: palette.upColor,
        downColor: palette.downColor,
        borderVisible: false,
        wickUpColor: palette.upColor,
        wickDownColor: palette.downColor,
      })

      const ohlcData: CandlestickData<Time>[] = data
        .filter(isCandlestickPoint)
        .map((point) => ({
          time: point.time as Time,
          open: point.open,
          high: point.high,
          low: point.low,
          close: point.close,
        }))
      series.setData(ohlcData)
    } else if (seriesType === "line") {
      const series = chart.addSeries(LineSeries, {
        color: palette.lineColor,
        lineWidth: 2,
      })

      const lineData: LineData<Time>[] = data
        .filter((p): p is InvestmentSingleValuePoint => !isCandlestickPoint(p))
        .map((point) => ({
          time: point.time as Time,
          value: point.value,
        }))
      series.setData(lineData)
    } else {
      const series = chart.addSeries(AreaSeries, {
        lineColor: palette.lineColor,
        topColor: palette.topColor,
        bottomColor: palette.bottomColor,
        lineWidth: 2,
      })

      const areaData: AreaData<Time>[] = data
        .filter((p): p is InvestmentSingleValuePoint => !isCandlestickPoint(p))
        .map((point) => ({
          time: point.time as Time,
          value: point.value,
        }))
      series.setData(areaData)
    }

    chart.timeScale().fitContent()

    const handleCrosshairMove = (param: MouseEventParams<Time>) => {
      if (!param.time || !param.seriesData || param.seriesData.size === 0) {
        setHoveredReadout(null)
        return
      }

      const firstEntry = param.seriesData.values().next().value
      if (!firstEntry) {
        setHoveredReadout(null)
        return
      }

      const numericValue =
        "close" in firstEntry
          ? firstEntry.close
          : "value" in firstEntry
            ? firstEntry.value
            : null

      if (typeof numericValue === "number") {
        setHoveredReadout({
          timeLabel: String(param.time),
          value: numericValue,
        })
      }
    }

    chart.subscribeCrosshairMove(handleCrosshairMove)

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver((entries) => {
            const entry = entries[0]
            if (entry && entry.contentRect.width > 0) {
              chart.applyOptions({ width: Math.floor(entry.contentRect.width) })
            }
          })
        : null

    resizeObserver?.observe(container)

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove)
      resizeObserver?.disconnect()
      chart.remove()
      chartRef.current = null
    }
  }, [data, height, seriesType])

  React.useEffect(() => {
    isDarkRef.current = isDark
    const chart = chartRef.current
    if (!chart) return

    const palette = resolveChartTheme(isDark)
    chart.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: palette.textColor,
      },
      grid: {
        vertLines: { color: palette.gridColor },
        horzLines: { color: palette.gridColor },
      },
      rightPriceScale: {
        borderColor: palette.borderColor,
      },
      timeScale: {
        borderColor: palette.borderColor,
      },
    })
  }, [isDark])

  if (data.length === 0) {
    return (
      <div
        data-testid="investment-chart-empty"
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center",
          className
        )}
      >
        <div className="mb-3 rounded-full bg-muted/60 p-3">
          <TrendingUp className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
        <p className="mt-1 max-w-md text-xs text-muted-foreground">
          {emptyDescription}
        </p>
      </div>
    )
  }

  const displayValue = hoveredReadout?.value ?? latestValue

  return (
    <div
      data-testid="investment-time-series-chart"
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-xs sm:p-6",
        className
      )}
    >
      {showHeader ? (
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {subtitle ? (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {displayValue !== null ? (
            <div className="text-right tabular-nums">
              <span
                data-testid="investment-chart-readout"
                className="text-lg font-bold text-foreground"
              >
                {formatCurrencyBRL(displayValue)}
              </span>
              {hoveredReadout ? (
                <p className="text-[11px] text-muted-foreground">
                  {hoveredReadout.timeLabel}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        ref={containerRef}
        data-testid="investment-chart-canvas"
        className="w-full"
        style={{ height }}
      />
    </div>
  )
}
