import { describe, it, expect } from "vitest"
import {
  MAX_FISCAL_OCR_FILE_SIZE_BYTES,
  updateTransactionFiscalSchema,
  validateFiscalOcrFile,
} from "./fiscal"

describe("lib/validations/fiscal", () => {
  it("validates deductible transaction metadata with stripped 11 or 14 digit CPF/CNPJ", () => {
    const validCpf = updateTransactionFiscalSchema.safeParse({
      isTaxDeductible: true,
      taxCategory: "HEALTH",
      providerDocument: "123.456.789-01",
      providerName: "Clínica Saúde",
      deductibleAmount: 350.5,
      status: "CONFIRMED",
      notes: "Consulta médica",
    })
    expect(validCpf.success).toBe(true)
    if (validCpf.success) {
      expect(validCpf.data.providerDocument).toBe("12345678901")
    }

    const validCnpj = updateTransactionFiscalSchema.safeParse({
      isTaxDeductible: true,
      taxCategory: "EDUCATION",
      providerDocument: "12.345.678/0001-95",
      providerName: "Universidade Exemplo",
      status: "PENDING",
    })
    expect(validCnpj.success).toBe(true)
    if (validCnpj.success) {
      expect(validCnpj.data.providerDocument).toBe("12345678000195")
    }
  })

  it("rejects invalid providerDocument, non-positive deductibleAmount, short providerName and overlong notes", () => {
    const badDoc = updateTransactionFiscalSchema.safeParse({
      isTaxDeductible: true,
      taxCategory: "HEALTH",
      providerDocument: "12345",
      status: "PENDING",
    })
    expect(badDoc.success).toBe(false)

    const badAmount = updateTransactionFiscalSchema.safeParse({
      isTaxDeductible: true,
      taxCategory: "HEALTH",
      deductibleAmount: 0,
      status: "PENDING",
    })
    expect(badAmount.success).toBe(false)

    const badName = updateTransactionFiscalSchema.safeParse({
      isTaxDeductible: true,
      taxCategory: "HEALTH",
      providerName: "A",
      status: "PENDING",
    })
    expect(badName.success).toBe(false)

    const longNotes = updateTransactionFiscalSchema.safeParse({
      isTaxDeductible: true,
      taxCategory: "HEALTH",
      notes: "x".repeat(251),
      status: "PENDING",
    })
    expect(longNotes.success).toBe(false)
  })

  it("requires taxCategory when isTaxDeductible is true", () => {
    const missingCat = updateTransactionFiscalSchema.safeParse({
      isTaxDeductible: true,
      status: "PENDING",
    })
    expect(missingCat.success).toBe(false)

    const nonDeductible = updateTransactionFiscalSchema.safeParse({
      isTaxDeductible: false,
      status: "EXEMPT",
    })
    expect(nonDeductible.success).toBe(true)
  })

  it("validates OCR receipt file types (PDF, PNG, JPG, WEBP) and <= 10MB size limit", () => {
    const validPdf = new File(["pdf-content"], "recibo.pdf", {
      type: "application/pdf",
    })
    expect(validateFiscalOcrFile(validPdf)).toEqual({ isValid: true })

    const validPng = new File(["img"], "nota.png", { type: "image/png" })
    expect(validateFiscalOcrFile(validPng)).toEqual({ isValid: true })

    const invalidExe = new File(["bin"], "virus.exe", {
      type: "application/octet-stream",
    })
    expect(validateFiscalOcrFile(invalidExe).isValid).toBe(false)

    const tooLarge = new File(["a"], "grande.pdf", {
      type: "application/pdf",
    })
    Object.defineProperty(tooLarge, "size", {
      value: MAX_FISCAL_OCR_FILE_SIZE_BYTES + 1,
    })
    expect(validateFiscalOcrFile(tooLarge).isValid).toBe(false)
  })
})
