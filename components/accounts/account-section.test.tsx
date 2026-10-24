import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { AccountSection } from "./account-section";
import type { Account } from "@/src/types/api";

describe("AccountSection Component", () => {
  const mockAccounts: Account[] = [
    {
      id: "acc-1",
      name: "Nubank Principal",
      type: "CHECKING",
      balance: 2000,
      initialBalance: 1000,
      institution: "Nubank",
      color: "#8B5CF6",
      createdAt: "2026-10-19T10:00:00Z",
      updatedAt: "2026-10-19T10:00:00Z",
    },
    {
      id: "acc-2",
      name: "Itaú Corrente",
      type: "CHECKING",
      balance: 1500,
      initialBalance: 500,
      institution: "Itaú",
      color: "#F97316",
      createdAt: "2026-10-19T10:00:00Z",
      updatedAt: "2026-10-19T10:00:00Z",
    },
  ];

  it("deve renderizar o título da seção, o subtotal acumulado e os cards", () => {
    render(<AccountSection type="CHECKING" accounts={mockAccounts} />);

    expect(screen.getByRole("heading", { name: /Conta Corrente/i })).toBeDefined();
    // Subtotal é 2000 + 1500 = 3500
    expect(screen.getByText(/3\.500,00/)).toBeDefined();
    expect(screen.getByText("Nubank Principal")).toBeDefined();
    expect(screen.getByText("Itaú Corrente")).toBeDefined();
  });

  it("deve renderizar estado vazio da seção quando não houver contas naquela categoria", () => {
    render(<AccountSection type="INVESTMENT" accounts={[]} />);

    expect(screen.getByText("Investimentos")).toBeDefined();
    expect(screen.getByText(/0,00/)).toBeDefined();
    expect(screen.getByText(/Nenhuma conta cadastrada nesta categoria/i)).toBeDefined();
  });
});
