import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./use-auth"
import { useMultiMonthAnalysis } from "./use-multi-month-analysis"
import type { MultiMonthAnalysisResponse } from "@/src/types/api"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

describe("hooks/use-multi-month-analysis", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem("auth_token", "valid-token")
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "u1", email: "user@test.com", hasAiKey: true })
    )
    vi.restoreAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    )
  }

  it("fetches multi-month trend summary for requested range", async () => {
    const mockResponse: MultiMonthAnalysisResponse = {
      rangeMonths: 6,
      averageSavingsRate: 22.5,
      averageMonthlyExpenses: 4350,
      averageMonthlyIncome: 7500,
      fixedCostTrend: {
        status: "GROWING",
        percentageChange: 12.4,
        alertCategory: "Moradia",
      },
      monthlyHistory: [
        {
          month: "2026-06",
          totalIncome: 7500,
          totalExpenses: 4200,
          netBalance: 3300,
          savingsRate: 44,
        },
      ],
    }

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useMultiMonthAnalysis("6"), {
      wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/analysis/multi-month?range=6"),
      expect.any(Object)
    )
    expect(result.current.analysis?.averageSavingsRate).toBe(22.5)
    expect(result.current.analysis?.fixedCostTrend.status).toBe("GROWING")
  })
})
