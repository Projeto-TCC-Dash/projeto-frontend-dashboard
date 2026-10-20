import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./use-auth";
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
} from "./use-accounts";
import type { Account, AccountsOverview } from "@/src/types/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("useAccounts & Account Mutations Hooks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  }

  const mockAccount1: Account = {
    id: "acc-1",
    name: "Nubank Principal",
    type: "CHECKING",
    balance: 2500,
    initialBalance: 1000,
    institution: "Nubank",
    color: "#8B5CF6",
    createdAt: "2026-10-19T10:00:00Z",
    updatedAt: "2026-10-19T10:00:00Z",
  };

  const mockOverview: AccountsOverview = {
    accounts: [mockAccount1],
    netWorth: 2500,
  };

  it("não deve carregar contas se o usuário não estiver autenticado", async () => {
    const { result } = renderHook(() => useAccounts(), { wrapper });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.accounts).toEqual([]);
    expect(result.current.netWorth).toBe(0);
  });

  it("deve carregar contas e netWorth do usuário autenticado com sucesso", async () => {
    localStorage.setItem("auth_token", "jwt-valid-token");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "user-123", email: "user@test.com", hasAiKey: true })
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockOverview,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAccounts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.accounts).toEqual([mockAccount1]);
    expect(result.current.netWorth).toBe(2500);
  });

  it("deve criar uma conta via useCreateAccount e invalidar queries", async () => {
    localStorage.setItem("auth_token", "jwt-valid-token");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "user-123", email: "user@test.com", hasAiKey: true })
    );

    const newAccount: Account = {
      id: "acc-2",
      name: "Itaú Investimentos",
      type: "INVESTMENT",
      balance: 10000,
      initialBalance: 10000,
      institution: "Itaú",
      color: "#F97316",
      createdAt: "2026-10-19T12:00:00Z",
      updatedAt: "2026-10-19T12:00:00Z",
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => newAccount,
    });
    vi.stubGlobal("fetch", fetchMock);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateAccount(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.createAccount({
        name: "Itaú Investimentos",
        type: "INVESTMENT",
        initialBalance: 10000,
        institution: "Itaú",
        color: "#F97316",
      });
    });

    expect(response).toEqual(newAccount);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["accounts"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["financial-analysis"] });
  });

  it("deve atualizar uma conta via useUpdateAccount e invalidar queries", async () => {
    localStorage.setItem("auth_token", "jwt-valid-token");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "user-123", email: "user@test.com", hasAiKey: true })
    );

    const updatedAccount: Account = {
      ...mockAccount1,
      name: "Nubank Reserva",
      initialBalance: 2000,
      balance: 3500,
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => updatedAccount,
    });
    vi.stubGlobal("fetch", fetchMock);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateAccount(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.updateAccount({
        id: "acc-1",
        data: {
          name: "Nubank Reserva",
          initialBalance: 2000,
        },
      });
    });

    expect(response).toEqual(updatedAccount);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["accounts"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["financial-analysis"] });
  });

  it("deve excluir uma conta via useDeleteAccount com cascade=true e invalidar queries", async () => {
    localStorage.setItem("auth_token", "jwt-valid-token");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "user-123", email: "user@test.com", hasAiKey: true })
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ success: true, message: "Conta excluída" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.deleteAccount({
        id: "acc-1",
        cascade: true,
      });
    });

    expect(response).toEqual({ success: true, message: "Conta excluída" });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/accounts/acc-1?cascade=true"),
      expect.objectContaining({ method: "DELETE" })
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["accounts"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["transactions"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["financial-analysis"] });
  });
});
