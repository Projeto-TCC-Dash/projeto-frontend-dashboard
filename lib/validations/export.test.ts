import { describe, it, expect } from "vitest"
import { exportFiltersSchema } from "./export"

describe("exportFiltersSchema", () => {
  it("deve validar com sucesso formato csv sem filtros opcionais", () => {
    const result = exportFiltersSchema.safeParse({ format: "csv" })
    expect(result.success).toBe(true)
  })

  it("deve validar com sucesso formato xlsx e mês específico", () => {
    const result = exportFiltersSchema.safeParse({
      format: "xlsx",
      month: "2026-10",
    })
    expect(result.success).toBe(true)
  })

  it("deve validar com sucesso formato pdf e intervalo de datas válido", () => {
    const result = exportFiltersSchema.safeParse({
      format: "pdf",
      startDate: "2026-10-01",
      endDate: "2026-10-31",
      accountId: "60d0fe4f5311236168a109ca",
      category: "Alimentação",
    })
    expect(result.success).toBe(true)
  })

  it("deve rejeitar formato inválido", () => {
    const result = exportFiltersSchema.safeParse({
      format: "doc",
    })
    expect(result.success).toBe(false)
  })

  it("deve rejeitar formato de mês inválido", () => {
    const result = exportFiltersSchema.safeParse({
      format: "csv",
      month: "10-2026",
    })
    expect(result.success).toBe(false)
  })

  it("deve rejeitar data final anterior à data inicial", () => {
    const result = exportFiltersSchema.safeParse({
      format: "csv",
      startDate: "2026-10-15",
      endDate: "2026-10-05",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "A data inicial não pode ser posterior à data final"
      )
    }
  })
})
