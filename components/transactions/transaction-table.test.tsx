import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { TransactionTable } from "./transaction-table";
import { Transaction } from "@/src/types/api";

describe("TransactionTable component", () => {
  const mockTransactions: Transaction[] = [
    {
      id: "tx-1",
      externalId: "ext-1",
      rawDescription: "IFOOD *RESTAURANTE",
      cleanDescription: "iFood Refeição",
      amount: -45.5,
      date: "2026-10-15T19:00:00Z",
      category: "Alimentação",
      source: "OFX",
    },
    {
      id: "tx-2",
      externalId: "ext-2",
      rawDescription: "TED SALARIO",
      cleanDescription: "Salário",
      amount: 4500.0,
      date: "2026-10-05T10:00:00Z",
      category: "Receita",
      source: "CSV",
    },
  ];

  it("renders transaction rows with formatted date, descriptions and badges", () => {
    render(<TransactionTable transactions={mockTransactions} isLoading={false} />);

    expect(screen.getByText("iFood Refeição")).toBeDefined();
    expect(screen.getByText("Salário")).toBeDefined();
    expect(screen.getByText("15/10/2026")).toBeDefined();
    expect(screen.getByText("05/10/2026")).toBeDefined();
    expect(screen.getByText("Alimentação")).toBeDefined();
    expect(screen.getByText("Receita")).toBeDefined();
    expect(screen.getByText("OFX")).toBeDefined();
    expect(screen.getByText("CSV")).toBeDefined();
  });

  it("calls onEdit with transaction when edit button is clicked", () => {
    const onEdit = vi.fn();
    render(
      <TransactionTable
        transactions={mockTransactions}
        isLoading={false}
        onEdit={onEdit}
      />
    );

    const editButtons = screen.getAllByRole("button", { name: /Editar transação/i });
    fireEvent.click(editButtons[0]);
    expect(onEdit).toHaveBeenCalledWith(mockTransactions[0]);
  });

  it("renders empty state when transactions list is empty", () => {
    render(<TransactionTable transactions={[]} isLoading={false} />);
    expect(screen.getByText(/Nenhuma transação encontrada/i)).toBeDefined();
  });

  it("renders loading skeleton or spinner when isLoading is true", () => {
    render(<TransactionTable transactions={[]} isLoading={true} />);
    expect(screen.getByText(/Carregando transações/i)).toBeDefined();
  });
});
