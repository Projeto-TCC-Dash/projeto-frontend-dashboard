import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { TransactionExportCard } from "./transaction-export-card";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/hooks/use-accounts", () => ({
  useAccounts: () => ({
    accounts: [
      { id: "acc-nubank", name: "Nubank Débito" },
      { id: "acc-itau", name: "Itaú Corrente" },
    ],
    isLoading: false,
  }),
}));

describe("TransactionExportCard Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  it("deve renderizar filtros de período, contas carregadas e os 3 botões de formato", () => {
    render(<TransactionExportCard />, { wrapper });

    expect(screen.getByTestId("period-type-select")).toBeInTheDocument();
    expect(screen.getByTestId("month-input")).toBeInTheDocument();
    expect(screen.getByTestId("account-filter-select")).toBeInTheDocument();
    expect(screen.getByText("Nubank Débito")).toBeInTheDocument();
    expect(screen.getByTestId("category-filter-select")).toBeInTheDocument();

    expect(screen.getByTestId("export-csv-button")).toBeInTheDocument();
    expect(screen.getByTestId("export-xlsx-button")).toBeInTheDocument();
    expect(screen.getByTestId("export-pdf-button")).toBeInTheDocument();
  });

  it("deve disparar exportação em CSV com os parâmetros selecionados", async () => {
    const onExport = vi.fn().mockResolvedValue(undefined);
    render(<TransactionExportCard onExport={onExport} />, { wrapper });

    const monthInput = screen.getByTestId("month-input");
    fireEvent.change(monthInput, { target: { value: "2026-11" } });

    const exportBtn = screen.getByTestId("export-csv-button");
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledWith({
        format: "csv",
        month: "2026-11",
      });
      expect(screen.getByTestId("export-success-message")).toHaveTextContent(
        "Exportação em CSV iniciada com sucesso!"
      );
    });
  });

  it("deve suportar período customizado por intervalo de datas para XLSX", async () => {
    const onExport = vi.fn().mockResolvedValue(undefined);
    render(<TransactionExportCard onExport={onExport} />, { wrapper });

    // Alterna para intervalo customizado
    const periodSelect = screen.getByTestId("period-type-select");
    fireEvent.change(periodSelect, { target: { value: "range" } });

    const startDate = screen.getByTestId("start-date-input");
    const endDate = screen.getByTestId("end-date-input");

    fireEvent.change(startDate, { target: { value: "2026-10-01" } });
    fireEvent.change(endDate, { target: { value: "2026-10-31" } });

    const xlsxBtn = screen.getByTestId("export-xlsx-button");
    fireEvent.click(xlsxBtn);

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledWith({
        format: "xlsx",
        startDate: "2026-10-01",
        endDate: "2026-10-31",
      });
    });
  });

  it("deve incluir filtros de conta e categoria ao exportar PDF", async () => {
    const onExport = vi.fn().mockResolvedValue(undefined);
    render(<TransactionExportCard onExport={onExport} />, { wrapper });

    const accountSelect = screen.getByTestId("account-filter-select");
    fireEvent.change(accountSelect, { target: { value: "acc-nubank" } });

    const categorySelect = screen.getByTestId("category-filter-select");
    fireEvent.change(categorySelect, { target: { value: "Moradia" } });

    const pdfBtn = screen.getByTestId("export-pdf-button");
    fireEvent.click(pdfBtn);

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledWith(
        expect.objectContaining({
          format: "pdf",
          accountId: "acc-nubank",
          category: "Moradia",
        })
      );
    });
  });

  it("deve exibir banner de erro caso o download falhe", async () => {
    const onExport = vi.fn().mockRejectedValue(new Error("Erro de exportação 500"));
    render(<TransactionExportCard onExport={onExport} />, { wrapper });

    fireEvent.click(screen.getByTestId("export-csv-button"));

    await waitFor(() => {
      expect(screen.getByTestId("export-error-message")).toHaveTextContent(
        "Erro de exportação 500"
      );
    });
  });
});
