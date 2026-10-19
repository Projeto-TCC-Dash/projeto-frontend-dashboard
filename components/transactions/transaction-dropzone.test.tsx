import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { TransactionDropzone } from "./transaction-dropzone";

describe("TransactionDropzone component", () => {
  it("renders upload instructions and accepted formats", () => {
    render(<TransactionDropzone onFileSelected={vi.fn()} isUploading={false} />);

    expect(screen.getByText(/Arraste seu extrato bancário/i)).toBeDefined();
    expect(screen.getByText(/\.OFX ou \.CSV/i)).toBeDefined();
    expect(screen.getByText(/Até 10MB/i)).toBeDefined();
  });

  it("handles valid file drop and triggers onFileSelected", () => {
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

    expect(onFileSelected).toHaveBeenCalledWith(file);
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
