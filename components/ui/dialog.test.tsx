import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";

describe("Dialog component", () => {
  it("does not render when open is false", () => {
    render(
      <Dialog open={false} onOpenChange={vi.fn()}>
        <DialogContent>
          <DialogTitle>Título Fechado</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.queryByText("Título Fechado")).toBeNull();
  });

  it("renders into document.body portal when open is true", () => {
    render(
      <Dialog open={true} onOpenChange={vi.fn()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título Aberto</DialogTitle>
            <DialogDescription>Descrição do modal</DialogDescription>
          </DialogHeader>
          <p>Conteúdo do Modal</p>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText("Título Aberto")).toBeDefined();
    expect(screen.getByText("Descrição do modal")).toBeDefined();
    expect(screen.getByText("Conteúdo do Modal")).toBeDefined();
  });

  it("calls onOpenChange(false) when Escape key is pressed", () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open={true} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Modal Escape</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onClose when the close X button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Dialog open={true} onOpenChange={vi.fn()}>
        <DialogContent onClose={onClose}>
          <DialogTitle>Modal com Botão Fechar</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const closeBtn = screen.getByRole("button", { name: /Fechar/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
