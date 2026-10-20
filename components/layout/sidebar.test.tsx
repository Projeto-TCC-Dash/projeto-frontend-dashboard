import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Sidebar } from "./sidebar";

let currentPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

describe("Sidebar Component", () => {
  it("deve renderizar os itens de navegação incluindo 'Contas e Cartões'", () => {
    currentPathname = "/";
    render(<Sidebar />);

    expect(screen.getByText("FinAI Dashboard")).toBeDefined();
    expect(screen.getByText("Dashboard")).toBeDefined();
    expect(screen.getByText("Contas e Cartões")).toBeDefined();
    expect(screen.getByText("Extratos & Transações")).toBeDefined();
    expect(screen.getByText("Perfil Financeiro")).toBeDefined();
    expect(screen.getByText("Consultor IA")).toBeDefined();

    const accountsLink = screen.getByRole("link", { name: /Contas e Cartões/i });
    expect(accountsLink.getAttribute("href")).toBe("/accounts");
  });

  it("deve destacar visualmente o link de 'Contas e Cartões' quando a rota ativa for '/accounts'", () => {
    currentPathname = "/accounts";
    render(<Sidebar />);

    const accountsLink = screen.getByRole("link", { name: /Contas e Cartões/i });
    expect(accountsLink.className).toContain("bg-primary/10 text-primary font-semibold");
  });
});
