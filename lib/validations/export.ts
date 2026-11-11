import { z } from "zod"
import { EXPORT_FORMATS } from "@/src/types/api"

export const exportFiltersSchema = z
  .object({
    format: z.enum(EXPORT_FORMATS, {
      message: "Formato de exportação inválido",
    }),
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/, "Formato de mês inválido. Use AAAA-MM")
      .optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inicial inválida. Use AAAA-MM-DD")
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data final inválida. Use AAAA-MM-DD")
      .optional(),
    accountId: z.string().optional(),
    category: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate)
      }
      return true
    },
    {
      message: "A data inicial não pode ser posterior à data final",
      path: ["endDate"],
    }
  )

export type ExportFiltersFormData = z.infer<typeof exportFiltersSchema>
