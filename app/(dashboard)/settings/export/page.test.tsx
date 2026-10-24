import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import ExportSettingsPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/hooks/use-accounts", () => ({
  useAccounts: () => ({
    accounts: [],
    isLoading: false,
  }),
}));

describe("ExportSettingsPage", () => {
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

  it("deve renderizar a central de exportação com os 3 formatos disponíveis", () => {
    render(<ExportSettingsPage />, { wrapper });

    expect(screen.getByText("Filtros & Opções de Exportação")).toBeInTheDocument();
    expect(screen.getByTestId("export-csv-button")).toBeInTheDocument();
    expect(screen.getByTestId("export-xlsx-button")).toBeInTheDocument();
    expect(screen.getByTestId("export-pdf-button")).toBeInTheDocument();
  });
});
