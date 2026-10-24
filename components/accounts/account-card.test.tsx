import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { AccountCard } from "./account-card";
import type { Account } from "@/src/types/api";

describe("AccountCard Component", () => {
  const mockAccount: Account = {
    id: "acc-1",
    name: "Nubank Principal",
    type: "CHECKING",
    balance: 3450.75,
    initialBalance: 1000,
    institution: "Nu Pagamentos S.A.",
    color: "#8B5CF6",
    createdAt: "2026-10-19T10:00:00Z",
    updatedAt: "2026-10-19T10:00:00Z",
  };

  it("deve renderizar dados da conta, instituição, badge de tipo e saldo formatado em BRL", () => {
    render(<AccountCard account={mockAccount} />);

    expect(screen.getByText("Nubank Principal")).toBeDefined();
    expect(screen.getByText("Nu Pagamentos S.A.")).toBeDefined();
    expect(screen.getByText("Conta Corrente")).toBeDefined();
    // Saldo formatado em BRL
    expect(screen.getByText(/3\.450,75/)).toBeDefined();
  });

  it("deve exibir saldo negativo com destaque visual apropriado", () => {
    const negativeAccount: Account = {
      ...mockAccount,
      type: "CREDIT_CARD",
      balance: -1250.4,
    };

    render(<AccountCard account={negativeAccount} />);

    expect(screen.getByText("Cartão de Crédito")).toBeDefined();
    expect(screen.getByText(/-.*1\.250,40/)).toBeDefined();
  });

  it("deve acionar onEdit ao clicar no botão de edição", () => {
    const onEdit = vi.fn();
    render(<AccountCard account={mockAccount} onEdit={onEdit} />);

    const editBtn = screen.getByRole("button", { name: /editar/i });
    fireEvent.click(editBtn);

    expect(onEdit).toHaveBeenCalledWith(mockAccount);
  });

  it("deve acionar onDelete ao clicar no botão de exclusão", () => {
    const onDelete = vi.fn();
    render(<AccountCard account={mockAccount} onDelete={onDelete} />);

    const deleteBtn = screen.getByRole("button", { name: /excluir/i });
    fireEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith(mockAccount);
  });
});
