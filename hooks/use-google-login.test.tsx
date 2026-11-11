import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import * as React from "react"
import { useGoogleLogin } from "./use-google-login"
import { AuthProvider } from "@/hooks/use-auth"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/login",
}))

describe("useGoogleLogin", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    mockPush.mockClear()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    )
  }

  it("deve autenticar com sucesso via Google e redirecionar para / quando hasAiKey for true", async () => {
    const mockAuthResponse = {
      token: "jwt-token-google",
      user: {
        id: "user-123",
        email: "debora@gmail.com",
        name: "Débora Goulart",
        avatarUrl: null,
        hasAiKey: true,
      },
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockAuthResponse,
    })
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useGoogleLogin(), { wrapper })

    await act(async () => {
      const res = await result.current.loginWithGoogle("valid-id-token")
      expect(res).toEqual(mockAuthResponse)
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/google"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ idToken: "valid-id-token" }),
      })
    )
    expect(mockPush).toHaveBeenCalledWith("/")
    expect(localStorage.getItem("auth_token")).toBe("jwt-token-google")
  })

  it("deve redirecionar para /onboarding quando o usuário não tiver chave de IA (hasAiKey: false)", async () => {
    const mockAuthResponse = {
      token: "jwt-token-google",
      user: {
        id: "user-456",
        email: "novo@gmail.com",
        name: "Novo Usuário",
        avatarUrl: null,
        hasAiKey: false,
      },
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockAuthResponse,
    })
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useGoogleLogin(), { wrapper })

    await act(async () => {
      await result.current.loginWithGoogle("valid-id-token")
    })

    expect(mockPush).toHaveBeenCalledWith("/onboarding")
  })

  it("deve capturar erro 401/404 de conta não vinculada e exibir mensagem explicativa", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        statusCode: 401,
        message:
          "Nenhuma conta vinculada a este perfil Google. Faça login com suas credenciais para vincular.",
      }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useGoogleLogin(), { wrapper })

    await act(async () => {
      try {
        await result.current.loginWithGoogle("unlinked-id-token")
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(Error)
      }
    })

    expect(result.current.error).toContain(
      "Nenhuma conta vinculada a este perfil Google. Faça login com seu e-mail e senha tradicionais e conecte sua conta Google na aba Configurações > Segurança."
    )
    expect(mockPush).not.toHaveBeenCalled()
  })
})
