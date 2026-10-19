import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { TransactionEditDialog } from "./transaction-edit-dialog";
import { Transaction } from "@/src/types/api";

describe("TransactionEditDialog component", () => {
  const mockTx: Transaction = {
    id: "tx-edit-1",
    externalId: "ext-1",
    rawDescription: "COMPRA DB SUPERMERCADOS",
    cleanDescription: "Supermercado DB",
    amount: -120.5,
    date: "2026-10-17T15:00:00Z",
    category: "Alimentação",
    source: "OFX",
  };

  it("renders audit reference (rawDescription and amount) and pre-filled inputs", () => {
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
  });

  it("calls onSave with updated cleanDescription and category when submitted", () => {
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

    const saveButton = screen.getByRole("button", { name: /Salvar Alterações/i });
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith({
      cleanDescription: "Supermercado Semanal",
      category: "Outros",
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
