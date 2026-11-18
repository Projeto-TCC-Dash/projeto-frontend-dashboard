import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./use-auth"
import {
  useInvestmentPortfolio,
  useUpsertInvestmentHolding,
} from "./use-investments"
import type { InvestmentPortfolioSummary } from "@/src/types/api"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

describe("useInvestmentPortfolio & useUpsertInvestmentHolding", () => {
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
        mutations: { retry: false },
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

  const mockSummary: InvestmentPortfolioSummary = {
    totalInvested: 50000,
    riskProfile: "MODERATE",
    holdings: [
      { macroClass: "FIXED_INCOME", amount: 30000, percentage: 60 },
      { macroClass: "EQUITIES", amount: 15000, percentage: 30 },
      { macroClass: "REAL_ESTATE", amount: 5000, percentage: 10 },
      { macroClass: "INTERNATIONAL", amount: 0, percentage: 0 },
      { macroClass: "CRYPTO", amount: 0, percentage: 0 },
      { macroClass: "CASH_LIQUIDITY", amount: 0, percentage: 0 },
    ],
    allocationDiagnosis: {
      adherentToRiskProfile: true,
      recommendations: [
        "Sua carteira apresenta boa diversificação entre estabilidade e crescimento patrimonial.",
      ],
    },
  }

  it("fetches investment portfolio holdings and diagnosis from /api/investments/holdings", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockSummary,
    })
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useInvestmentPortfolio(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.totalInvested).toBe(50000)
    expect(result.current.allocationDiagnosis?.adherentToRiskProfile).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/investments/holdings"),
      expect.anything()
    )
  })

  it("upserts investment holding via PUT /api/investments/holdings", async () => {
    const updatedSummary: InvestmentPortfolioSummary = {
      ...mockSummary,
      totalInvested: 55000,
    }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => updatedSummary,
    })
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useUpsertInvestmentHolding(), {
      wrapper,
    })

    await act(async () => {
      const res = await result.current.upsertHolding({
        accountId: "507f1f77bcf86cd799439011",
        macroClass: "FIXED_INCOME",
        amount: 35000,
      })
      expect(res.totalInvested).toBe(55000)
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/investments/holdings"),
      expect.objectContaining({ method: "PUT" })
    )
  })
})
