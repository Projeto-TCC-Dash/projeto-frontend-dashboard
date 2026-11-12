import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import * as React from "react"
import { UserNav } from "./user-nav"
import { useAuth } from "@/hooks/use-auth"
import { useUserProfile } from "@/hooks/use-user-profile"

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}))

vi.mock("@/hooks/use-user-profile", () => ({
  useUserProfile: vi.fn(),
}))

describe("UserNav Component", () => {
  const mockLogout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("não deve renderizar nada se o usuário não estiver autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      logout: mockLogout,
    } as unknown as ReturnType<typeof useAuth>)

    vi.mocked(useUserProfile).mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useUserProfile>)

    const { container } = render(<UserNav />)
    expect(container.firstChild).toBeNull()
  })

  it("deve renderizar link para /settings/profile com email e iniciais do usuário", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "1", email: "debora@exemplo.com", hasAiKey: true },
      logout: mockLogout,
    } as unknown as ReturnType<typeof useAuth>)

    vi.mocked(useUserProfile).mockReturnValue({
      data: {
        id: "1",
        email: "debora@exemplo.com",
        name: "Débora Goulart",
        avatarUrl: null,
        hasAiKey: true,
      },
    } as unknown as ReturnType<typeof useUserProfile>)

    render(<UserNav />)

    const profileLink = screen.getByRole("link", { name: /Débora Goulart/i })
    expect(profileLink.getAttribute("href")).toBe("/settings/profile")

    // Iniciais 'DG' devem estar presentes no fallback de avatar
    expect(screen.getByText("DG")).toBeDefined()
    expect(screen.getByText("Débora Goulart")).toBeDefined()
  })

  it("deve renderizar a imagem do avatar quando avatarUrl estiver disponível", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "1", email: "debora@exemplo.com", hasAiKey: true },
      logout: mockLogout,
    } as unknown as ReturnType<typeof useAuth>)

    vi.mocked(useUserProfile).mockReturnValue({
      data: {
        id: "1",
        email: "debora@exemplo.com",
        name: "Débora Goulart",
        avatarUrl: "https://storage.exemplo.com/avatar.png",
        hasAiKey: true,
      },
    } as unknown as ReturnType<typeof useUserProfile>)

    render(<UserNav />)

    const avatarImg = screen.getByRole("img", {
      name: /Foto de perfil de Débora Goulart/i,
    })
    expect(avatarImg.getAttribute("src")).toBe(
      "https://storage.exemplo.com/avatar.png"
    )
  })

  it("deve acionar logout ao clicar no botão de sair", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "1", email: "debora@exemplo.com", hasAiKey: true },
      logout: mockLogout,
    } as unknown as ReturnType<typeof useAuth>)

    vi.mocked(useUserProfile).mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useUserProfile>)

    render(<UserNav />)

    const logoutBtn = screen.getByRole("button", { name: /Encerrar sessão/i })
    fireEvent.click(logoutBtn)

    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it("ocultará texto longo do perfil abaixo de sm preservando aria-label e áreas táteis no mobile", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: "1",
        email: "debora.muito.longo@exemplo.com",
        hasAiKey: true,
      },
      logout: mockLogout,
    } as unknown as ReturnType<typeof useAuth>)

    vi.mocked(useUserProfile).mockReturnValue({
      data: {
        id: "1",
        email: "debora.muito.longo@exemplo.com",
        name: "Débora Goulart Sobrenome Extenso",
        avatarUrl: null,
        hasAiKey: true,
      },
    } as unknown as ReturnType<typeof useUserProfile>)

    render(<UserNav />)

    const profileLink = screen.getByRole("link", {
      name: /Débora Goulart Sobrenome Extenso/i,
    })
    expect(profileLink.className).toContain("min-h-10")

    const nameEl = screen.getByText("Débora Goulart Sobrenome Extenso")
    const textContainer = nameEl.parentElement
    expect(textContainer?.className).toContain("hidden")
    expect(textContainer?.className).toContain("sm:flex")

    const logoutBtn = screen.getByRole("button", { name: /Encerrar sessão/i })
    expect(logoutBtn.className).toContain("size-10")
    expect(logoutBtn.className).toContain("sm:w-auto")
  })
})
