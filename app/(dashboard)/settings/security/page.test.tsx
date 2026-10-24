import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import SecuritySettingsPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/settings/security",
}));

describe("SecuritySettingsPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("auth_token", "jwt-mock");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "user-1", email: "debora@teste.com", hasAiKey: true })
    );
    vi.restoreAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  }

  it("deve carregar e exibir status do 2FA e opções de segurança", async () => {
    const mockProfile = {
      id: "user-1",
      email: "debora@teste.com",
      hasAiKey: true,
      security: {
        twoFactorEnabled: false,
        hasLocalPassword: true,
        googleLinked: true,
        googleEmail: "debora.google@gmail.com",
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockProfile,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<SecuritySettingsPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId("2fa-status-badge")).toHaveTextContent("Desativado");
      expect(screen.getByText("Ativar 2FA via E-mail")).toBeInTheDocument();
      expect(screen.getByText("debora.google@gmail.com")).toBeInTheDocument();
      expect(screen.getByTestId("security-logout-button")).toBeInTheDocument();
    });
  });

  it("deve disparar fluxo de solicitação de código 2FA ao clicar em ativar", async () => {
    const mockProfile = {
      id: "user-1",
      email: "debora@teste.com",
      hasAiKey: true,
      security: {
        twoFactorEnabled: false,
        hasLocalPassword: true,
        googleLinked: false,
      },
    };

    const fetchMock = vi.fn().mockImplementation((url) => {
      if (url.includes("/api/auth/2fa/request-enable")) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ message: "Código enviado", expiresInSeconds: 60 }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockProfile,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<SecuritySettingsPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId("toggle-2fa-button")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("toggle-2fa-button"));

    await waitFor(() => {
      expect(screen.getByTestId("two-factor-setup-modal")).toBeInTheDocument();
    });
  });
});
