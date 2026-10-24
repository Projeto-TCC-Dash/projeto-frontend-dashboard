import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TransactionTable } from "./transaction-table";
import { Transaction } from "@/src/types/api";

describe("TransactionTable component", () => {
  let queryClient: QueryClient;

  function renderWithProviders(ui: React.ReactElement) {
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });
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

  it("renders transaction rows with formatted date, descriptions, account and badges", () => {
    const txWithAccount: Transaction[] = [
      {
        ...mockTransactions[0],
        accountId: "acc-1",
        account: {
          id: "acc-1",
          name: "Nubank",
          institution: "Nu",
          color: "#8B5CF6",
        },
      },
      {
        ...mockTransactions[1],
        accountId: undefined,
        account: undefined,
      },
    ];

    renderWithProviders(<TransactionTable transactions={txWithAccount} isLoading={false} />);

    expect(screen.getByText("Data")).toBeDefined();
    expect(screen.getByText("Descrição")).toBeDefined();
    expect(screen.getByText("Categoria")).toBeDefined();
    expect(screen.getByText("Conta")).toBeDefined();
    expect(screen.getByText("Origem")).toBeDefined();
    expect(screen.getByText("Valor")).toBeDefined();

    expect(screen.getByText("iFood Refeição")).toBeDefined();
    expect(screen.getByText("Salário")).toBeDefined();
    expect(screen.getByText("15/10/2026")).toBeDefined();
    expect(screen.getByText("05/10/2026")).toBeDefined();
    expect(screen.getByText("Alimentação")).toBeDefined();
    expect(screen.getByText("Receita")).toBeDefined();
    expect(screen.getByText("Nubank")).toBeDefined();
    expect(screen.getByText("—")).toBeDefined();
    expect(screen.getByText("OFX")).toBeDefined();
    expect(screen.getByText("CSV")).toBeDefined();
  });

  it("renders badges for new canonical categories: Pagamento de Fatura and Investimentos", () => {
    const extendedTransactions: Transaction[] = [
      {
        id: "tx-fatura",
        externalId: "ext-fatura",
        rawDescription: "PAG FATURA CARTAO NUBANK",
        cleanDescription: "Fatura Nubank",
        amount: -1250.0,
        date: "2026-10-10T14:00:00Z",
        category: "Pagamento de Fatura",
        source: "OFX",
      },
      {
        id: "tx-invest",
        externalId: "ext-invest",
        rawDescription: "APORTE TESOURO SELIC",
        cleanDescription: "Aporte Tesouro Direto",
        amount: -500.0,
        date: "2026-10-12T11:00:00Z",
        category: "Investimentos",
        source: "CSV",
      },
    ];

    renderWithProviders(
      <TransactionTable
        transactions={extendedTransactions}
        isLoading={false}
      />
    );

    expect(screen.getByText("Pagamento de Fatura")).toBeDefined();
    expect(screen.getByText("Investimentos")).toBeDefined();
  });

  it("calls onEdit with transaction when edit button is clicked", () => {
    const onEdit = vi.fn();
    renderWithProviders(
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

  it("calls onDelete or opens delete dialog when delete button is clicked", () => {
    const onDelete = vi.fn();
    renderWithProviders(
      <TransactionTable
        transactions={mockTransactions}
        isLoading={false}
        onDelete={onDelete}
      />
    );

    const deleteButtons = screen.getAllByRole("button", { name: /Excluir transação/i });
    fireEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith(mockTransactions[0]);
  });

  it("renders empty state when transactions list is empty", () => {
    renderWithProviders(<TransactionTable transactions={[]} isLoading={false} />);
    expect(screen.getByText(/Nenhuma transação encontrada/i)).toBeDefined();
  });

  it("renders loading skeleton or spinner when isLoading is true", () => {
    renderWithProviders(<TransactionTable transactions={[]} isLoading={true} />);
    expect(screen.getByText(/Carregando transações/i)).toBeDefined();
  });
});
