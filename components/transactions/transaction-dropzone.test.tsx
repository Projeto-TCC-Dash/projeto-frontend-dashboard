import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { TransactionDropzone } from "./transaction-dropzone";
import * as useAccountsModule from "@/hooks/use-accounts";
import type { Account } from "@/src/types/api";

vi.mock("@/hooks/use-accounts");

describe("TransactionDropzone component", () => {
  const mockAccounts: Account[] = [
    {
      id: "acc-1",
      name: "Nubank",
      type: "CHECKING",
      balance: 2000,
      initialBalance: 1000,
      institution: "Nu",
      color: "#8B5CF6",
      createdAt: "2026-10-19T10:00:00Z",
      updatedAt: "2026-10-19T10:00:00Z",
    },
    {
      id: "acc-2",
      name: "Cartão XP",
      type: "CREDIT_CARD",
      balance: -500,
      initialBalance: 0,
      institution: "XP",
      color: "#06B6D4",
      createdAt: "2026-10-19T10:00:00Z",
      updatedAt: "2026-10-19T10:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(useAccountsModule, "useAccounts").mockReturnValue({
      accounts: mockAccounts,
      netWorth: 1500,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useAccountsModule.useAccounts>);
  });

  it("renders upload instructions and accepted formats", () => {
    render(<TransactionDropzone onFileSelected={vi.fn()} isUploading={false} />);

    expect(screen.getByText(/Arraste seu extrato bancário/i)).toBeDefined();
    expect(screen.getByText(/\.OFX ou \.CSV/i)).toBeDefined();
    expect(screen.getByText(/Até 10MB/i)).toBeDefined();
  });

  it("renders account selector with default option and user accounts", () => {
    render(<TransactionDropzone onFileSelected={vi.fn()} isUploading={false} />);

    expect(screen.getByLabelText(/Conta Bancária de Origem/i)).toBeDefined();
    expect(screen.getByRole("option", { name: /Sem conta vinculada/i })).toBeDefined();
    expect(screen.getByRole("option", { name: /Nubank \(Nu\)/i })).toBeDefined();
    expect(screen.getByRole("option", { name: /Cartão XP \(XP\)/i })).toBeDefined();
  });

  it("handles valid file drop and triggers onFileSelected without accountId when unselected", () => {
    const onFileSelected = vi.fn();
    render(<TransactionDropzone onFileSelected={onFileSelected} isUploading={false} />);

    const dropzone = screen.getByTestId("transaction-dropzone");
    const file = new File(["dummy content"], "extrato.ofx", {
      type: "application/x-ofx",
    });

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(onFileSelected).toHaveBeenCalledWith(file, undefined);
  });

  it("triggers onFileSelected with file and accountId when an account is selected", () => {
    const onFileSelected = vi.fn();
    render(<TransactionDropzone onFileSelected={onFileSelected} isUploading={false} />);

    const select = screen.getByLabelText(/Conta Bancária de Origem/i);
    fireEvent.change(select, { target: { value: "acc-1" } });

    const dropzone = screen.getByTestId("transaction-dropzone");
    const file = new File(["dummy content"], "extrato.ofx", {
      type: "application/x-ofx",
    });

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(onFileSelected).toHaveBeenCalledWith(file, "acc-1");
  });

  it("rejects multiple files dropped simultaneously", () => {
    const onFileSelected = vi.fn();
    render(<TransactionDropzone onFileSelected={onFileSelected} isUploading={false} />);

    const dropzone = screen.getByTestId("transaction-dropzone");
    const file1 = new File(["c1"], "extrato1.ofx");
    const file2 = new File(["c2"], "extrato2.csv");

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file1, file2],
      },
    });

    expect(onFileSelected).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Por favor, selecione apenas um arquivo por vez/i)
    ).toBeDefined();
  });

  it("rejects invalid file extension on drop", () => {
    const onFileSelected = vi.fn();
    render(<TransactionDropzone onFileSelected={onFileSelected} isUploading={false} />);

    const dropzone = screen.getByTestId("transaction-dropzone");
    const file = new File(["pdf content"], "extrato.pdf", {
      type: "application/pdf",
    });

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(onFileSelected).not.toHaveBeenCalled();
    expect(screen.getByText(/Formato de arquivo não suportado/i)).toBeDefined();
  });

  it("shows uploading indicator when isUploading is true", () => {
    render(<TransactionDropzone onFileSelected={vi.fn()} isUploading={true} />);

    expect(screen.getByText(/Processando e importando extrato/i)).toBeDefined();
  });
});
