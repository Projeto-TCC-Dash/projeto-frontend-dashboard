import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { AccountDeleteDialog } from "./account-delete-dialog";
import type { Account } from "@/src/types/api";

describe("AccountDeleteDialog Component", () => {
  const mockAccount: Account = {
    id: "acc-1",
    name: "Nubank Principal",
    type: "CHECKING",
    balance: 2000,
    initialBalance: 1000,
    institution: "Nubank",
    color: "#8B5CF6",
    createdAt: "2026-10-19T10:00:00Z",
    updatedAt: "2026-10-19T10:00:00Z",
  };

  it("deve renderizar o diálogo com nome da conta e aviso de ação destrutiva", () => {
    render(
      <AccountDeleteDialog
        isOpen={true}
        account={mockAccount}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText("Excluir Conta Financeira")).toBeDefined();
    expect(screen.getByText(/Nubank Principal/i)).toBeDefined();
    expect(
      screen.getByText(/Excluir também todas as transações associadas a esta conta/i)
    ).toBeDefined();
  });

  it("deve disparar onConfirm com cascade=false por padrão", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <AccountDeleteDialog
        isOpen={true}
        account={mockAccount}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: /Confirmar Exclusão/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith("acc-1", false);
    });
  });

  it("deve disparar onConfirm com cascade=true quando o checkbox estiver marcado", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <AccountDeleteDialog
        isOpen={true}
        account={mockAccount}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    const cascadeCheckbox = screen.getByRole("checkbox");
    fireEvent.click(cascadeCheckbox);

    const deleteBtn = screen.getByRole("button", { name: /Confirmar Exclusão/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith("acc-1", true);
    });
  });

  it("deve manter o diálogo aberto e exibir alerta contextual em caso de erro de transações vinculadas", async () => {
    const onConfirm = vi
      .fn()
      .mockRejectedValue(new Error("Esta conta possui transações vinculadas."));

    render(
      <AccountDeleteDialog
        isOpen={true}
        account={mockAccount}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: /Confirmar Exclusão/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Esta conta possui transações vinculadas/i)
      ).toBeDefined();
    });

    // O diálogo continua aberto
    expect(screen.getByText("Excluir Conta Financeira")).toBeDefined();
  });
});
