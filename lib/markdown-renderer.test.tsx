import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import React from "react"
import { MarkdownRenderer } from "./markdown-renderer"

describe("MarkdownRenderer", () => {
  it("renders headings properly", () => {
    const md = "# Titulo 1\n## Titulo 2\n### Titulo 3"
    render(<MarkdownRenderer content={md} />)

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Titulo 1"
    )
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Titulo 2"
    )
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Titulo 3"
    )
  })

  it("renders bullet lists and numbered lists", () => {
    const md = "- Item A\n- Item B\n1. Primeiro\n2. Segundo"
    render(<MarkdownRenderer content={md} />)

    expect(screen.getByText("Item A")).toBeInTheDocument()
    expect(screen.getByText("Item B")).toBeInTheDocument()
    expect(screen.getByText("Primeiro")).toBeInTheDocument()
    expect(screen.getByText("Segundo")).toBeInTheDocument()
  })

  it("renders bold and italic formatting safely", () => {
    const md = "Este é um texto com **destaque em negrito** e *itálico*."
    render(<MarkdownRenderer content={md} />)

    const bold = screen.getByText("destaque em negrito")
    expect(bold.tagName).toBe("STRONG")
    const italic = screen.getByText("itálico")
    expect(italic.tagName).toBe("EM")
  })

  it("handles empty or blank content gracefully", () => {
    const { container } = render(<MarkdownRenderer content="" />)
    expect(container.firstChild).toBeNull()
  })

  it("applies overflow containment and word wrapping for continuous URLs and inline code", () => {
    const longUrl = `https://financeiro.exemplo.com/relatorios/${"a".repeat(80)}`
    const longCode = `TOKEN_CONTINUO_SEM_ESPACOS_${"X".repeat(60)}`
    const md = `Veja o link ${longUrl} e use \`${longCode}\` na consulta.`

    const { container } = render(<MarkdownRenderer content={md} />)
    const root = container.firstElementChild as HTMLElement
    expect(root).toHaveClass(
      "min-w-0",
      "max-w-full",
      "overflow-x-auto",
      "break-words",
      "[overflow-wrap:anywhere]"
    )

    const codeEl = screen.getByText(longCode)
    expect(codeEl).toHaveClass("break-words", "[overflow-wrap:anywhere]")
  })
})
