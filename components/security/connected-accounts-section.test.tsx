import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import * as React from "react"
import { ConnectedAccountsSection } from "./connected-accounts-section"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

let mockScriptLoaded = true
let capturedGoogleLoginOptions: {
  onSuccess?: (res: { access_token?: string }) => void | Promise<void>
  onError?: (err: { error_description?: string }) => void
  onNonOAuthError?: (err: { type: string }) => void
} = {}
const mockTriggerGooglePopup = vi.fn()

vi.mock("@react-oauth/google", () => ({
  useGoogleOAuth: () => ({
    clientId: "mock-google-client-id",
    scriptLoadedSuccessfully: mockScriptLoaded,
  }),
  useGoogleLogin: (options: typeof capturedGoogleLoginOptions) => {
    capturedGoogleLoginOptions = options
    return mockTriggerGooglePopup
  },
}))

describe("ConnectedAccountsSection Component", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem("auth_token", "jwt-test-token")
    mockScriptLoaded = true
    capturedGoogleLoginOptions = {}
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
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  it("deve renderizar estado não conectado e permitir vincular", async () => {
    const onLink = vi.fn().mockResolvedValue(undefined)

    render(
      <ConnectedAccountsSection
        googleLinked={false}
        hasLocalPassword={true}
        onLink={onLink}
      />,
      { wrapper }
    )

    expect(screen.getByText("Não vinculado")).toBeInTheDocument()
    const linkBtn = screen.getByTestId("link-google-button")
    expect(linkBtn).toBeInTheDocument()

    fireEvent.click(linkBtn)

    await waitFor(() => {
      expect(onLink).toHaveBeenCalledTimes(1)
    })
  })

  it("deve renderizar estado conectado com email e data de vínculo", () => {
    render(
      <ConnectedAccountsSection
        googleLinked={true}
        googleEmail="debora.google@gmail.com"
        googleLinkedAt="2026-10-20T14:00:00Z"
        hasLocalPassword={true}
      />,
      { wrapper }
    )

    expect(screen.getByText("Conectado")).toBeInTheDocument()
    expect(screen.getByText(/debora.google@gmail.com/)).toBeInTheDocument()
    expect(screen.getByTestId("unlink-google-button")).toBeInTheDocument()
  })

  it("deve bloquear desvinculação se hasLocalPassword for false", async () => {
    const onUnlink = vi.fn()

    render(
      <ConnectedAccountsSection
        googleLinked={true}
        googleEmail="debora.google@gmail.com"
        hasLocalPassword={false}
        onUnlink={onUnlink}
      />,
      { wrapper }
    )

    const unlinkBtn = screen.getByTestId("unlink-google-button")
    fireEvent.click(unlinkBtn)

    // Diálogo de bloqueio deve estar aberto
    expect(screen.getByTestId("unlink-blocked-dialog")).toBeInTheDocument()
    expect(screen.getByText("Desvinculação Bloqueada")).toBeInTheDocument()
    expect(screen.getByText(/única forma de acesso/i)).toBeInTheDocument()
    expect(onUnlink).not.toHaveBeenCalled()

    // Botão Compreendi fecha o diálogo
    fireEvent.click(screen.getByTestId("close-blocked-dialog-button"))
    await waitFor(() => {
      expect(screen.queryByTestId("unlink-blocked-dialog")).toBeNull()
    })
  })

  it("deve permitir desvinculação com confirmação se hasLocalPassword for true", async () => {
    const onUnlink = vi.fn().mockResolvedValue(undefined)

    render(
      <ConnectedAccountsSection
        googleLinked={true}
        googleEmail="debora.google@gmail.com"
        hasLocalPassword={true}
        onUnlink={onUnlink}
      />,
      { wrapper }
    )

    const unlinkBtn = screen.getByTestId("unlink-google-button")
    fireEvent.click(unlinkBtn)

    expect(screen.getByTestId("unlink-confirm-dialog")).toBeInTheDocument()
    expect(screen.getByText("Desvincular conta Google?")).toBeInTheDocument()

    const confirmBtn = screen.getByTestId("confirm-unlink-button")
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(onUnlink).toHaveBeenCalledTimes(1)
    })
  })

  it("deve exibir banner de erro se onLink rejeitar", async () => {
    const onLink = vi.fn().mockRejectedValue(new Error("Falha no OAuth Google"))

    render(
      <ConnectedAccountsSection
        googleLinked={false}
        hasLocalPassword={true}
        onLink={onLink}
      />,
      { wrapper }
    )

    fireEvent.click(screen.getByTestId("link-google-button"))

    await waitFor(() => {
      expect(screen.getByTestId("google-auth-error")).toHaveTextContent(
        "Falha no OAuth Google"
      )
    })
  })

  it("deve abrir popup do Google OAuth e enviar idToken ao vincular sem onLink customizado", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        id: "user-1",
        email: "debora@teste.com",
        hasAiKey: true,
        security: {
          hasLocalPassword: true,
          googleLinked: true,
          googleEmail: "debora@gmail.com",
        },
      }),
    })
    vi.stubGlobal("fetch", fetchMock)

    mockTriggerGooglePopup.mockImplementationOnce(() => {
      void capturedGoogleLoginOptions.onSuccess?.({
        access_token: "google-oauth-token-abc",
      })
    })

    render(
      <ConnectedAccountsSection googleLinked={false} hasLocalPassword={true} />,
      { wrapper }
    )

    fireEvent.click(screen.getByTestId("link-google-button"))

    expect(mockTriggerGooglePopup).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/google/link"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ idToken: "google-oauth-token-abc" }),
        })
      )
    })
  })

  it("deve exibir mensagem de conflito 409 se a conta Google já pertencer a outro perfil", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        statusCode: 409,
        error: "Conflict",
        message:
          "Esta conta Google já está vinculada a outro perfil cadastrado.",
      }),
    })
    vi.stubGlobal("fetch", fetchMock)

    mockTriggerGooglePopup.mockImplementationOnce(() => {
      void capturedGoogleLoginOptions.onSuccess?.({
        access_token: "google-conflict-token",
      })
    })

    render(
      <ConnectedAccountsSection googleLinked={false} hasLocalPassword={true} />,
      { wrapper }
    )

    fireEvent.click(screen.getByTestId("link-google-button"))

    await waitFor(() => {
      expect(screen.getByTestId("google-auth-error")).toHaveTextContent(
        "Esta conta Google já está vinculada a outro perfil cadastrado."
      )
    })
  })

  it("deve exibir feedback amigável quando o usuário fechar o popup do Google", async () => {
    mockTriggerGooglePopup.mockImplementationOnce(() => {
      capturedGoogleLoginOptions.onNonOAuthError?.({ type: "popup_closed" })
    })

    render(
      <ConnectedAccountsSection googleLinked={false} hasLocalPassword={true} />,
      { wrapper }
    )

    fireEvent.click(screen.getByTestId("link-google-button"))

    await waitFor(() => {
      expect(screen.getByTestId("google-auth-error")).toHaveTextContent(
        "Conexão com o Google cancelada antes da conclusão."
      )
      expect(screen.getByTestId("link-google-button")).not.toBeDisabled()
    })
  })

  it("deve avisar se o script do Google GIS ainda não estiver carregado", async () => {
    mockScriptLoaded = false

    render(
      <ConnectedAccountsSection googleLinked={false} hasLocalPassword={true} />,
      { wrapper }
    )

    fireEvent.click(screen.getByTestId("link-google-button"))

    expect(mockTriggerGooglePopup).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(screen.getByTestId("google-auth-error")).toHaveTextContent(
        /ainda está carregando ou foi bloqueado/i
      )
    })
  })
})
