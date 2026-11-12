import { act, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InvestmentTimeSeriesChart } from "@/components/charts/investment-time-series-chart"

const applyOptionsMock = vi.fn()
const removeMock = vi.fn()
const setDataMock = vi.fn()
const fitContentMock = vi.fn()
const subscribeCrosshairMoveMock = vi.fn()
const unsubscribeCrosshairMoveMock = vi.fn()
const addSeriesMock = vi.fn(() => ({
  setData: setDataMock,
}))

const createChartMock = vi.fn(() => ({
  addSeries: addSeriesMock,
  applyOptions: applyOptionsMock,
  remove: removeMock,
  timeScale: () => ({
    fitContent: fitContentMock,
  }),
  subscribeCrosshairMove: subscribeCrosshairMoveMock,
  unsubscribeCrosshairMove: unsubscribeCrosshairMoveMock,
}))

let currentTheme = "light"

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: currentTheme,
  }),
}))

vi.mock("lightweight-charts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("lightweight-charts")>()
  return {
    ...actual,
    createChart: () => createChartMock(),
  }
})

describe("InvestmentTimeSeriesChart (lightweight-charts v5)", () => {
  beforeEach(() => {
    currentTheme = "light"
    vi.clearAllMocks()
  })

  it("renders empty state without calling createChart or inventing fake market data", () => {
    render(<InvestmentTimeSeriesChart data={[]} />)

    expect(screen.getByTestId("investment-chart-empty")).toBeInTheDocument()
    expect(createChartMock).not.toHaveBeenCalled()
    expect(screen.queryByTestId("investment-chart-canvas")).toBeNull()
  })

  it("mounts v5 AreaSeries chart cleanly, formats latest BRL value, and cleans up on unmount", () => {
    const data = [
      { time: "2026-10-01", value: 10000 },
      { time: "2026-10-15", value: 12450.8 },
    ]

    const { unmount } = render(
      <InvestmentTimeSeriesChart title="Carteira Consolidada" data={data} />
    )

    expect(
      screen.getByTestId("investment-time-series-chart")
    ).toBeInTheDocument()
    expect(createChartMock).toHaveBeenCalledTimes(1)
    expect(addSeriesMock).toHaveBeenCalledTimes(1)
    expect(setDataMock).toHaveBeenCalledWith(data)
    expect(fitContentMock).toHaveBeenCalledTimes(1)
    expect(
      screen
        .getByTestId("investment-chart-readout")
        .textContent?.replace(/\u00a0/g, " ")
    ).toBe("R$ 12.450,80")

    unmount()
    expect(unsubscribeCrosshairMoveMock).toHaveBeenCalledTimes(1)
    expect(removeMock).toHaveBeenCalledTimes(1)
  })

  it("supports candlestick and line series and calls applyOptions when theme changes", () => {
    const ohlcData = [
      { time: "2026-10-01", open: 100, high: 115, low: 95, close: 110 },
    ]

    const { rerender } = render(
      <InvestmentTimeSeriesChart seriesType="candlestick" data={ohlcData} />
    )

    expect(setDataMock).toHaveBeenCalledWith(ohlcData)

    act(() => {
      currentTheme = "dark"
      rerender(
        <InvestmentTimeSeriesChart seriesType="candlestick" data={ohlcData} />
      )
    })

    expect(applyOptionsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: expect.objectContaining({
          textColor: "#a1a1aa",
        }),
      })
    )
  })

  it("supports line series and updates BRL readout on crosshair move", () => {
    const data = [
      { time: "2026-10-01", value: 10000 },
      { time: "2026-10-10", value: 11250 },
    ]

    render(<InvestmentTimeSeriesChart seriesType="line" data={data} />)

    expect(setDataMock).toHaveBeenCalledWith(data)
    const crosshairHandler = subscribeCrosshairMoveMock.mock.calls[0]?.[0] as
      | ((param: {
          time?: string
          seriesData?: Map<unknown, { value: number }>
        }) => void)
      | undefined
    expect(crosshairHandler).toBeDefined()

    act(() => {
      crosshairHandler?.({
        time: "2026-10-01",
        seriesData: new Map([["s1", { value: 10000 }]]),
      })
    })

    expect(
      screen
        .getByTestId("investment-chart-readout")
        .textContent?.replace(/\u00a0/g, " ")
    ).toBe("R$ 10.000,00")
    expect(screen.getByText("2026-10-01")).toBeInTheDocument()

    act(() => {
      crosshairHandler?.({})
    })

    expect(
      screen
        .getByTestId("investment-chart-readout")
        .textContent?.replace(/\u00a0/g, " ")
    ).toBe("R$ 11.250,00")
  })
})
