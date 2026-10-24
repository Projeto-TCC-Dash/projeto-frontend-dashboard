import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { TransactionEditDialog } from "./transaction-edit-dialog";
import { Transaction, Account } from "@/src/types/api";
import * as useAccountsModule from "@/hooks/use-accounts";

vi.mock("@/hooks/use-accounts");

describe("TransactionEditDialog component", () => {
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

  const mockTx: Transaction = {
    id: "tx-edit-1",
    externalId: "ext-1",
    rawDescription: "COMPRA DB SUPERMERCADOS",
    cleanDescription: "Supermercado DB",
    amount: -120.5,
    date: "2026-10-17T15:00:00Z",
    category: "Alimentação",
    source: "OFX",
    accountId: "acc-1",
    account: {
      id: "acc-1",
      name: "Nubank",
      institution: "Nu",
      color: "#8B5CF6",
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(useAccountsModule, "useAccounts").mockReturnValue({
      accounts: mockAccounts,
      netWorth: 1500,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useAccountsModule.useAccounts>);
  });

  it("renders audit reference (rawDescription and amount) and pre-filled inputs including account", () => {
    render(
      <TransactionEditDialog
        isOpen={true}
        transaction={mockTx}
        onClose={vi.fn()}
        onSave={vi.fn()}
        isSaving={false}
      />
    );

    expect(screen.getByText("Editar Transação")).toBeDefined();
    expect(screen.getByText("COMPRA DB SUPERMERCADOS")).toBeDefined();
    expect(screen.getByDisplayValue("Supermercado DB")).toBeDefined();
    expect(screen.getByDisplayValue("Alimentação")).toBeDefined();
    expect(screen.getByLabelText(/Conta Bancária/i)).toBeDefined();
    expect(screen.getByDisplayValue("Nubank (Nu)")).toBeDefined();
  });

  it("calls onSave with updated cleanDescription, category and selected accountId when submitted", () => {
    const onSave = vi.fn();
    render(
      <TransactionEditDialog
        isOpen={true}
        transaction={mockTx}
        onClose={vi.fn()}
        onSave={onSave}
        isSaving={false}
      />
    );

    const descInput = screen.getByLabelText(/Descrição Amigável/i);
    fireEvent.change(descInput, { target: { value: "Supermercado Semanal" } });

    const categorySelect = screen.getByLabelText(/Categoria Canônica/i);
    fireEvent.change(categorySelect, { target: { value: "Outros" } });

    const accountSelect = screen.getByLabelText(/Conta Bancária/i);
    fireEvent.change(accountSelect, { target: { value: "acc-2" } });

    const saveButton = screen.getByRole("button", { name: /Salvar Alterações/i });
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith({
      cleanDescription: "Supermercado Semanal",
      category: "Outros",
      accountId: "acc-2",
    });
  });

  it("calls onSave with null accountId when unlinking account", () => {
    const onSave = vi.fn();
    render(
      <TransactionEditDialog
        isOpen={true}
        transaction={mockTx}
        onClose={vi.fn()}
        onSave={onSave}
        isSaving={false}
      />
    );

    const accountSelect = screen.getByLabelText(/Conta Bancária/i);
    fireEvent.change(accountSelect, { target: { value: "" } });

    const saveButton = screen.getByRole("button", { name: /Salvar Alterações/i });
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith({
      cleanDescription: "Supermercado DB",
      category: "Alimentação",
      accountId: null,
    });
  });

  it("shows error and does not call onSave if cleanDescription is empty", () => {
    const onSave = vi.fn();
    render(
      <TransactionEditDialog
        isOpen={true}
        transaction={mockTx}
        onClose={vi.fn()}
        onSave={onSave}
        isSaving={false}
      />
    );

    const descInput = screen.getByLabelText(/Descrição Amigável/i);
    fireEvent.change(descInput, { target: { value: "   " } });

    const saveButton = screen.getByRole("button", { name: /Salvar Alterações/i });
    fireEvent.click(saveButton);

    expect(onSave).not.toHaveBeenCalled();
    expect(
      screen.getByText(/A descrição limpa não pode estar vazia/i)
    ).toBeDefined();
  });

  it("calls onClose when cancel button is clicked", () => {
    const onClose = vi.fn();
    render(
      <TransactionEditDialog
        isOpen={true}
        transaction={mockTx}
        onClose={onClose}
        onSave={vi.fn()}
        isSaving={false}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: /Cancelar/i });
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
