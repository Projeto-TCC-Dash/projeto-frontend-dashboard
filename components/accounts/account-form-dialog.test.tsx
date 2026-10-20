import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { AccountFormDialog } from "./account-form-dialog";
import type { Account } from "@/src/types/api";

describe("AccountFormDialog Component", () => {
  it("deve renderizar modal de criação com campos vazios e paleta de cores", () => {
    render(
      <AccountFormDialog
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText("Nova Conta Financeira")).toBeDefined();
    expect(screen.getByLabelText(/Nome da Conta/i)).toBeDefined();
    expect(screen.getByLabelText(/Tipo de Conta/i)).toBeDefined();
    expect(screen.getByLabelText(/Saldo Inicial/i)).toBeDefined();
    expect(screen.getByLabelText(/Instituição Financeira/i)).toBeDefined();
    expect(screen.getByText("Cor de Identificação")).toBeDefined();
  });

  it("deve renderizar modal de edição pré-preenchida com dados da conta", () => {
    const accountToEdit: Account = {
      id: "acc-1",
      name: "Nubank Principal",
      type: "CHECKING",
      balance: 5000,
      initialBalance: 2000,
      institution: "Nu Pagamentos",
      color: "#8B5CF6",
      createdAt: "2026-10-19T10:00:00Z",
      updatedAt: "2026-10-19T10:00:00Z",
    };

    render(
      <AccountFormDialog
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        accountToEdit={accountToEdit}
      />
    );

    expect(screen.getByText("Editar Conta Financeira")).toBeDefined();
    const nameInput = screen.getByLabelText(/Nome da Conta/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Nubank Principal");
    const instInput = screen.getByLabelText(/Instituição Financeira/i) as HTMLInputElement;
    expect(instInput.value).toBe("Nu Pagamentos");
    const balanceInput = screen.getByLabelText(/Saldo Inicial/i) as HTMLInputElement;
    expect(balanceInput.value).toContain("2.000,00");
  });

  it("deve submeter o formulário de criação com valores válidos", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <AccountFormDialog
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    const nameInput = screen.getByLabelText(/Nome da Conta/i);
    fireEvent.change(nameInput, { target: { value: "Inter PJ" } });

    const balanceInput = screen.getByLabelText(/Saldo Inicial/i);
    fireEvent.change(balanceInput, { target: { value: "1.500,50" } });

    const submitBtn = screen.getByRole("button", { name: /Salvar Conta/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Inter PJ",
          initialBalance: 1500.5,
        })
      );
    });
  });
});
