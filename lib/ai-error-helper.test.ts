import { describe, expect, it } from "vitest"
import { classifyAiError } from "./ai-error-helper"

describe("classifyAiError", () => {
  it("classifica erros de chave inválida ou expirada para abrir modal de chave", () => {
    const res = classifyAiError(
      new Error(
        "Sua chave da API Gemini parece inválida, expirada ou sem permissão."
      )
    )
    expect(res.category).toBe("auth")
    expect(res.actionType).toBe("open_key_modal")
    expect(res.title).toContain("Chave de IA inválida")
  })

  it("classifica erros 429 / cota como rate_limit com ação de chave", () => {
    const res = classifyAiError("429: Limite de cota atingido.")
    expect(res.category).toBe("rate_limit")
    expect(res.actionType).toBe("open_key_modal")
  })

  it("classifica indisponibilidade de modelo sem culpar a chave do usuário", () => {
    const res = classifyAiError(
      "O serviço de IA está temporariamente indisponível por incompatibilidade do modelo na plataforma."
    )
    expect(res.category).toBe("model_unavailable")
    expect(res.actionType).toBe("retry")
  })

  it("classifica 503 / alta demanda / rede como retry", () => {
    const res = classifyAiError("503: servidores com alta demanda")
    expect(res.category).toBe("network")
    expect(res.actionType).toBe("retry")
  })
})
