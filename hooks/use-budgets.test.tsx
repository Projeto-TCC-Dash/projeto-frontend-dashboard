import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./use-auth"
import { useBudget, useUpsertBudget } from "./use-budgets"
import type { BudgetOverview } from "@/src/types/api"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

describe("hooks/use-budgets", () => {
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

  it("treats HTTP 404 as budget: null without throwing error state", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useBudget("2026-11"), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.budget).toBeNull()
    expect(result.current.isError).toBe(false)
  })

  it("fetches monthly budget and updates via useUpsertBudget", async () => {
    const mockBudget: BudgetOverview = {
      month: "2026-11",
      totalLimitAmount: 6500,
      totalSpentAmount: 4200,
      totalRemainingAmount: 2300,
      globalPercentConsumed: 64.6,
      globalStatus: "REGULAR",
      categories: [
        {
          category: "Alimentação",
          limitAmount: 1800,
          spentAmount: 1500,
          remainingAmount: 300,
          percentConsumed: 83.3,
          status: "WARNING",
        },
      ],
    }

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockBudget), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...mockBudget,
            totalLimitAmount: 7000,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        )
      )

    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(
      () => ({
        budgetQuery: useBudget("2026-11"),
        upsert: useUpsertBudget(),
      }),
      { wrapper }
    )

    await waitFor(() =>
      expect(result.current.budgetQuery.budget?.totalLimitAmount).toBe(6500)
    )

    await act(async () => {
      const updated = await result.current.upsert.upsertBudget({
        month: "2026-11",
        data: {
          totalLimitAmount: 7000,
          categoryBudgets: [{ category: "Alimentação", limitAmount: 2000 }],
        },
      })
      expect(updated.totalLimitAmount).toBe(7000)
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/budgets/2026-11"),
      expect.objectContaining({ method: "PUT" })
    )
  })
})
