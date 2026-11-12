import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog"

describe("Dialog component", () => {
  it("does not render when open is false", () => {
    render(
      <Dialog open={false} onOpenChange={vi.fn()}>
        <DialogContent>
          <DialogTitle>Título Fechado</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    expect(screen.queryByText("Título Fechado")).toBeNull()
  })

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
    )

    expect(screen.getByText("Título Aberto")).toBeDefined()
    expect(screen.getByText("Descrição do modal")).toBeDefined()
    expect(screen.getByText("Conteúdo do Modal")).toBeDefined()
  })

  it("calls onOpenChange(false) when Escape key is pressed", () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open={true} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Modal Escape</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    fireEvent.keyDown(window, { key: "Escape" })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("calls onClose when the close X button is clicked", () => {
    const onClose = vi.fn()
    render(
      <Dialog open={true} onOpenChange={vi.fn()}>
        <DialogContent onClose={onClose}>
          <DialogTitle>Modal com Botão Fechar</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    const closeBtn = screen.getByRole("button", { name: /Fechar/i })
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalled()
  })

  it("enforces dynamic viewport max-height containment and stacked mobile footer", () => {
    render(
      <Dialog open={true} onOpenChange={vi.fn()}>
        <DialogContent data-testid="dialog-panel" onClose={vi.fn()}>
          <DialogHeader>
            <DialogTitle>Modal Responsivo</DialogTitle>
          </DialogHeader>
          <p>Conteúdo longo</p>
          <DialogFooter data-testid="dialog-footer">
            <button type="button">Cancelar</button>
            <button type="button">Confirmar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )

    const panel = screen.getByTestId("dialog-panel")
    expect(panel.className).toContain("max-h-[90dvh]")
    expect(panel.className).toContain("overflow-y-auto")
    expect(panel.className).toContain("p-4")
    expect(panel.className).toContain("sm:p-6")

    const closeBtn = screen.getByRole("button", { name: /Fechar/i })
    expect(closeBtn.className).toContain("size-10")
    expect(closeBtn.className).toContain("sm:size-8")

    const footer = screen.getByTestId("dialog-footer")
    expect(footer.className).toContain("flex-col-reverse")
    expect(footer.className).toContain("sm:flex-row")
  })
})
