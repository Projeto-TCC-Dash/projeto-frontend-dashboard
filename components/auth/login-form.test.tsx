import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import * as React from "react"
import { LoginForm } from "./login-form"
import { AuthProvider } from "@/hooks/use-auth"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/login",
}))

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({
    onSuccess,
  }: {
    onSuccess: (res: { credential?: string }) => void
  }) => (
    <button
      data-testid="mock-google-button"
      onClick={() => onSuccess({ credential: "test-token" })}
    >
      Entrar com o Google
    </button>
  ),
  useGoogleLogin: () => vi.fn(),
}))

describe("LoginForm", () => {
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

  it("deve renderizar campos de login tradicional e opção Google com divisor visual", () => {
    render(<LoginForm />, { wrapper })

    expect(screen.getByText("Entrar na Conta")).toBeInTheDocument()
    expect(screen.getByTestId("mock-google-button")).toBeInTheDocument()
    expect(screen.getByText("ou continue com e-mail")).toBeInTheDocument()
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument()
    expect(screen.getByLabelText("Senha")).toBeInTheDocument()
  })

  it("deve autenticar via Google e redirecionar ao dashboard", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        token: "jwt-google-success",
        user: {
          id: "u-1",
          email: "debora@google.com",
          name: "Debora",
          hasAiKey: true,
        },
      }),
    })
    vi.stubGlobal("fetch", fetchMock)

    render(<LoginForm />, { wrapper })

    fireEvent.click(screen.getByTestId("mock-google-button"))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/")
    })
  })

  it("deve exibir alerta instrutivo quando conta Google não estiver vinculada (401)", async () => {
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

    render(<LoginForm />, { wrapper })

    fireEvent.click(screen.getByTestId("mock-google-button"))

    await waitFor(() => {
      expect(
        screen.getByText(/Nenhuma conta vinculada a este perfil Google/i)
      ).toBeInTheDocument()
    })
  })
})
