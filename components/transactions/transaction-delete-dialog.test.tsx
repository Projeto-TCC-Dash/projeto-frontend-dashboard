import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { TransactionDeleteDialog } from "./transaction-delete-dialog";
import { Transaction } from "@/src/types/api";

describe("TransactionDeleteDialog Component", () => {
  const mockTransaction: Transaction = {
    id: "tx-delete-123",
    externalId: "ext-123",
    rawDescription: "RESTAURANTE DA VILA",
    cleanDescription: "Restaurante da Vila",
    amount: -85.9,
    date: "2026-10-18T12:30:00Z",
    category: "Alimentação",
    source: "OFX",
  };

  it("renders transaction details and confirmation message when open", () => {
    render(
      <TransactionDeleteDialog
        isOpen={true}
        transaction={mockTransaction}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText("Excluir Transação")).toBeDefined();
    expect(screen.getByText("Restaurante da Vila")).toBeDefined();
    expect(screen.getByText(/18\/10\/2026/)).toBeDefined();
    expect(screen.getByText(/Alimentação/)).toBeDefined();
    expect(screen.getByText("-R$ 85,90")).toBeDefined();
  });

  it("calls onClose when Cancel button or Close icon is clicked", () => {
    const onClose = vi.fn();
    render(
      <TransactionDeleteDialog
        isOpen={true}
        transaction={mockTransaction}
        onClose={onClose}
        onConfirm={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: /Cancelar/i });
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalled();

    const closeIconBtn = screen.getByRole("button", { name: "Fechar" });
    fireEvent.click(closeIconBtn);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("calls onConfirm with transaction.id and closes dialog on success", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <TransactionDeleteDialog
        isOpen={true}
        transaction={mockTransaction}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const confirmBtn = screen.getByRole("button", { name: /Confirmar Exclusão/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith("tx-delete-123");
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("displays error message when onConfirm fails", async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error("Falha ao excluir transação"));
    const onClose = vi.fn();

    render(
      <TransactionDeleteDialog
        isOpen={true}
        transaction={mockTransaction}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const confirmBtn = screen.getByRole("button", { name: /Confirmar Exclusão/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText("Falha ao excluir transação")).toBeDefined();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it("disables buttons and displays loading indicator when isDeleting is true", () => {
    render(
      <TransactionDeleteDialog
        isOpen={true}
        transaction={mockTransaction}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={true}
      />
    );

    expect(screen.getByText(/Excluindo\.\.\./i)).toBeDefined();
    const cancelBtn = screen.getByRole("button", { name: /Cancelar/i });
    expect(cancelBtn.hasAttribute("disabled")).toBe(true);
  });
});
