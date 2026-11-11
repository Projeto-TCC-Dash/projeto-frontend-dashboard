import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useGoogleAuth } from "./use-google-auth"
import { apiClient } from "@/lib/api-client"
import type { UserProfileResponse } from "@/src/types/api"

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

describe("useGoogleAuth Hook", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  it("deve vincular conta Google com sucesso chamando POST /api/auth/google/link", async () => {
    const mockProfile: UserProfileResponse = {
      id: "u123",
      email: "user@example.com",
      name: "User Name",
      hasAiKey: false,
      security: {
        hasLocalPassword: true,
        googleLinked: true,
        googleEmail: "user@gmail.com",
        googleLinkedAt: "2026-10-30T00:00:00Z",
      },
    }

    vi.mocked(apiClient.post).mockResolvedValueOnce(mockProfile)

    const { result } = renderHook(() => useGoogleAuth(), { wrapper })

    await act(async () => {
      const response = await result.current.linkGoogle({ idToken: "token-123" })
      expect(response).toEqual(mockProfile)
    })

    expect(apiClient.post).toHaveBeenCalledWith("/api/auth/google/link", {
      idToken: "token-123",
    })
    expect(queryClient.getQueryData(["user-profile"])).toEqual(mockProfile)
  })

  it("deve propagar erro ao falhar vinculação (ex: 409 Conflict)", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(
      new Error(
        "Esta conta Google já está vinculada a outro perfil cadastrado."
      )
    )

    const { result } = renderHook(() => useGoogleAuth(), { wrapper })

    await expect(
      act(async () => {
        await result.current.linkGoogle({ idToken: "token-already-linked" })
      })
    ).rejects.toThrow(
      "Esta conta Google já está vinculada a outro perfil cadastrado."
    )

    expect(apiClient.post).toHaveBeenCalledWith("/api/auth/google/link", {
      idToken: "token-already-linked",
    })
  })

  it("deve desvincular conta Google com sucesso chamando DELETE /api/auth/google/unlink", async () => {
    const mockProfile: UserProfileResponse = {
      id: "u123",
      email: "user@example.com",
      name: "User Name",
      hasAiKey: false,
      security: {
        hasLocalPassword: true,
        googleLinked: false,
      },
    }

    vi.mocked(apiClient.delete).mockResolvedValueOnce(mockProfile)

    const { result } = renderHook(() => useGoogleAuth(), { wrapper })

    await act(async () => {
      const response = await result.current.unlinkGoogle()
      expect(response).toEqual(mockProfile)
    })

    expect(apiClient.delete).toHaveBeenCalledWith("/api/auth/google/unlink")
    expect(queryClient.getQueryData(["user-profile"])).toEqual(mockProfile)
  })

  it("deve propagar erro ao falhar desvinculação (ex: 400 Bad Request sem senha local)", async () => {
    vi.mocked(apiClient.delete).mockRejectedValueOnce(
      new Error(
        "Não é possível desvincular a conta Google pois ela é o único método de autenticação."
      )
    )

    const { result } = renderHook(() => useGoogleAuth(), { wrapper })

    await expect(
      act(async () => {
        await result.current.unlinkGoogle()
      })
    ).rejects.toThrow(
      "Não é possível desvincular a conta Google pois ela é o único método de autenticação."
    )

    expect(apiClient.delete).toHaveBeenCalledWith("/api/auth/google/unlink")
  })
})
