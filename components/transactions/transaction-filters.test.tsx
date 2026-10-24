import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { TransactionFilters } from "./transaction-filters";
import * as useAccountsModule from "@/hooks/use-accounts";
import type { Account } from "@/src/types/api";

vi.mock("@/hooks/use-accounts");

describe("TransactionFilters component", () => {
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

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(useAccountsModule, "useAccounts").mockReturnValue({
      accounts: mockAccounts,
      netWorth: 1500,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useAccountsModule.useAccounts>);
  });

  it("renders month selector with current month and category/source/account options", () => {
    const onFilterChange = vi.fn();
    render(
      <TransactionFilters
        month="2026-10"
        category={undefined}
        source={undefined}
        accountId={undefined}
        onFilterChange={onFilterChange}
      />
    );

    expect(screen.getByDisplayValue("2026-10")).toBeDefined();
    expect(screen.getByLabelText(/Mês de Competência/i)).toBeDefined();
    expect(screen.getByLabelText(/Categoria/i)).toBeDefined();
    expect(screen.getByLabelText(/Origem/i)).toBeDefined();
    expect(screen.getByLabelText(/Conta Bancária/i)).toBeDefined();
    expect(screen.getByRole("option", { name: /Todas as contas/i })).toBeDefined();
    expect(screen.getByRole("option", { name: /Nubank \(Nu\)/i })).toBeDefined();
  });

  it("shifts month backward and forward via buttons", () => {
    const onFilterChange = vi.fn();
    render(
      <TransactionFilters
        month="2026-10"
        onFilterChange={onFilterChange}
      />
    );

    const prevBtn = screen.getByRole("button", { name: /Mês anterior/i });
    fireEvent.click(prevBtn);
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ month: "2026-09" })
    );

    const nextBtn = screen.getByRole("button", { name: /Próximo mês/i });
    fireEvent.click(nextBtn);
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ month: "2026-11" })
    );
  });

  it("triggers filter change when category or source is changed", () => {
    const onFilterChange = vi.fn();
    render(
      <TransactionFilters
        month="2026-10"
        onFilterChange={onFilterChange}
      />
    );

    const categorySelect = screen.getByLabelText(/Categoria/i);
    fireEvent.change(categorySelect, { target: { value: "Alimentação" } });
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: "Alimentação" })
    );

    fireEvent.change(categorySelect, { target: { value: "Pagamento de Fatura" } });
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: "Pagamento de Fatura" })
    );

    fireEvent.change(categorySelect, { target: { value: "Investimentos" } });
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: "Investimentos" })
    );

    const sourceSelect = screen.getByLabelText(/Origem/i);
    fireEvent.change(sourceSelect, { target: { value: "OFX" } });
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ source: "OFX" })
    );
  });

  it("triggers filter change when account is selected and cleared", () => {
    const onFilterChange = vi.fn();
    const { rerender } = render(
      <TransactionFilters
        month="2026-10"
        accountId={undefined}
        onFilterChange={onFilterChange}
      />
    );

    const accountSelect = screen.getByLabelText(/Conta Bancária/i);
    fireEvent.change(accountSelect, { target: { value: "acc-1" } });
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: "acc-1" })
    );

    rerender(
      <TransactionFilters
        month="2026-10"
        accountId="acc-1"
        onFilterChange={onFilterChange}
      />
    );

    const clearBtn = screen.getByRole("button", { name: /Limpar filtros/i });
    fireEvent.click(clearBtn);
    expect(onFilterChange).toHaveBeenCalledWith({
      month: "2026-10",
      category: undefined,
      source: undefined,
      accountId: undefined,
    });
  });
});
