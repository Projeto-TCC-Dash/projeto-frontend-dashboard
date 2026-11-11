import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import * as React from "react"
import { GoogleLoginButton } from "./google-login-button"

// Mock do @react-oauth/google para simular o botão e callbacks
vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({
    onSuccess,
    onError,
  }: {
    onSuccess: (credentialResponse: { credential?: string }) => void
    onError: () => void
  }) => (
    <button
      data-testid="mock-gis-button"
      onClick={() => onSuccess({ credential: "mock-google-id-token" })}
      onContextMenu={() => onError()}
    >
      Entrar com o Google
    </button>
  ),
  useGoogleLogin: () => vi.fn(),
}))

describe("GoogleLoginButton", () => {
  it("deve renderizar o container do botão Google", () => {
    const onSuccess = vi.fn()
    render(<GoogleLoginButton onSuccess={onSuccess} />)

    expect(
      screen.getByTestId("google-login-button-container")
    ).toBeInTheDocument()
    expect(screen.getByTestId("mock-gis-button")).toBeInTheDocument()
  })

  it("deve invocar onSuccess com o idToken retornado", () => {
    const onSuccess = vi.fn()
    render(<GoogleLoginButton onSuccess={onSuccess} />)

    fireEvent.click(screen.getByTestId("mock-gis-button"))
    expect(onSuccess).toHaveBeenCalledWith("mock-google-id-token")
  })

  it("deve invocar onError em caso de erro retornado pelo provedor", () => {
    const onSuccess = vi.fn()
    const onError = vi.fn()
    render(<GoogleLoginButton onSuccess={onSuccess} onError={onError} />)

    fireEvent.contextMenu(screen.getByTestId("mock-gis-button"))
    expect(onError).toHaveBeenCalledWith(
      "Não foi possível autenticar com o Google. Tente novamente."
    )
  })

  it("deve exibir indicador de carregamento quando isLoading for true", () => {
    const onSuccess = vi.fn()
    render(<GoogleLoginButton onSuccess={onSuccess} isLoading={true} />)

    expect(screen.getByTestId("google-login-loading")).toBeInTheDocument()
    expect(screen.getByText("Conectando com o Google...")).toBeInTheDocument()
    expect(screen.queryByTestId("mock-gis-button")).not.toBeInTheDocument()
  })
})
