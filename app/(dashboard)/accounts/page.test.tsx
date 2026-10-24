import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import AccountsPage from "./page";
import * as useAccountsModule from "@/hooks/use-accounts";
import type { Account } from "@/src/types/api";

vi.mock("@/hooks/use-accounts");

describe("AccountsPage", () => {
  const mockCreateAccount = vi.fn().mockResolvedValue({});
  const mockUpdateAccount = vi.fn().mockResolvedValue({});
  const mockDeleteAccount = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(useAccountsModule, "useCreateAccount").mockReturnValue({
      createAccount: mockCreateAccount,
      isPending: false,
    } as unknown as ReturnType<typeof useAccountsModule.useCreateAccount>);
    vi.spyOn(useAccountsModule, "useUpdateAccount").mockReturnValue({
      updateAccount: mockUpdateAccount,
      isPending: false,
    } as unknown as ReturnType<typeof useAccountsModule.useUpdateAccount>);
    vi.spyOn(useAccountsModule, "useDeleteAccount").mockReturnValue({
      deleteAccount: mockDeleteAccount,
      isPending: false,
    } as unknown as ReturnType<typeof useAccountsModule.useDeleteAccount>);
  });

  const mockAccounts: Account[] = [
    {
      id: "acc-1",
      name: "Nubank",
      type: "CHECKING",
      balance: 2000,
      initialBalance: 1000,
      institution: "Nu",
      color: "#8B5CF6",
      createdAt: "2026-10-19T10:00:00Z",
      updatedAt: "2026-10-19T10:00:00Z",
    },
    {
      id: "acc-2",
      name: "Cartão XP",
      type: "CREDIT_CARD",
      balance: -500,
      initialBalance: 0,
      institution: "XP",
      color: "#06B6D4",
      createdAt: "2026-10-19T10:00:00Z",
      updatedAt: "2026-10-19T10:00:00Z",
    },
  ];

  it("deve exibir estado de loading quando os dados estiverem sendo carregados", () => {
    vi.spyOn(useAccountsModule, "useAccounts").mockReturnValue({
      accounts: [],
      netWorth: 0,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useAccountsModule.useAccounts>);

    render(<AccountsPage />);

    expect(screen.getByText(/Carregando contas e patrimônio/i)).toBeDefined();
  });

  it("deve renderizar o card de patrimônio líquido e as seções com contas", () => {
    vi.spyOn(useAccountsModule, "useAccounts").mockReturnValue({
      accounts: mockAccounts,
      netWorth: 1500,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useAccountsModule.useAccounts>);

    render(<AccountsPage />);

    expect(screen.getByText("Gestão de Contas & Cartões")).toBeDefined();
    expect(screen.getByText("Patrimônio Líquido Total")).toBeDefined();
    expect(screen.getByText(/1\.500,00/)).toBeDefined();
    expect(screen.getByText("Nubank")).toBeDefined();
    expect(screen.getByText("Cartão XP")).toBeDefined();
  });

  it("deve abrir o modal de nova conta ao clicar em 'Nova Conta'", () => {
    vi.spyOn(useAccountsModule, "useAccounts").mockReturnValue({
      accounts: mockAccounts,
      netWorth: 1500,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useAccountsModule.useAccounts>);

    render(<AccountsPage />);

    const newAccountBtn = screen.getByRole("button", { name: /Nova Conta/i });
    fireEvent.click(newAccountBtn);

    expect(screen.getByText("Nova Conta Financeira")).toBeDefined();
  });

  it("deve abrir o diálogo de exclusão ao clicar em excluir no card", () => {
    vi.spyOn(useAccountsModule, "useAccounts").mockReturnValue({
      accounts: mockAccounts,
      netWorth: 1500,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useAccountsModule.useAccounts>);

    render(<AccountsPage />);

    const deleteBtns = screen.getAllByRole("button", { name: /Excluir conta/i });
    fireEvent.click(deleteBtns[0]);

    expect(screen.getByText("Excluir Conta Financeira")).toBeDefined();
  });
});
