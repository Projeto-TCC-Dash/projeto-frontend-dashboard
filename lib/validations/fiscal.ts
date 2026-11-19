import { z } from "zod"
import {
  FISCAL_VERIFICATION_STATUSES,
  TAX_CATEGORIES,
} from "@/src/types/api"

export const MAX_FISCAL_OCR_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FISCAL_OCR_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const
export const ALLOWED_FISCAL_OCR_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
] as const

export interface FiscalFileValidationResult {
  isValid: boolean
  error?: string
}

export function validateFiscalOcrFile(file: File): FiscalFileValidationResult {
  const fileName = file.name.toLowerCase()
  const hasValidMime = ALLOWED_FISCAL_OCR_MIME_TYPES.includes(
    file.type as (typeof ALLOWED_FISCAL_OCR_MIME_TYPES)[number]
  )
  const hasValidExt = ALLOWED_FISCAL_OCR_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  )

  if (!hasValidMime && !hasValidExt) {
    return {
      isValid: false,
      error:
        "Formato não suportado. Envie um comprovante em PDF, PNG, JPG ou WebP.",
    }
  }

  if (file.size > MAX_FISCAL_OCR_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: "O arquivo excede o tamanho máximo permitido de 10MB.",
    }
  }

  return { isValid: true }
}

export const updateTransactionFiscalSchema = z
  .object({
    isTaxDeductible: z.boolean(),
    taxCategory: z.enum(TAX_CATEGORIES).optional(),
    providerDocument: z
      .string()
      .trim()
      .transform((val) => val.replace(/\D/g, ""))
      .refine(
        (val) => val === "" || /^\d{11}$|^\d{14}$/.test(val),
        "Documento deve conter 11 (CPF) ou 14 (CNPJ) dígitos numéricos"
      )
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
    providerName: z
      .string()
      .trim()
      .refine(
        (val) => val === "" || (val.length >= 2 && val.length <= 120),
        "Nome do prestador deve ter entre 2 e 120 caracteres"
      )
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
    deductibleAmount: z
      .number({ message: "Informe um valor dedutível válido" })
      .positive("O valor dedutível deve ser maior que zero")
      .optional(),
    status: z.enum(FISCAL_VERIFICATION_STATUSES).default("PENDING"),
    notes: z
      .string()
      .trim()
      .max(250, "Observações devem ter no máximo 250 caracteres")
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
  })
  .refine(
    (data) => !data.isTaxDeductible || data.taxCategory !== undefined,
    {
      message: "Selecione uma categoria fiscal para despesas dedutíveis",
      path: ["taxCategory"],
    }
  )

export type UpdateTransactionFiscalFormData = z.infer<
  typeof updateTransactionFiscalSchema
>
