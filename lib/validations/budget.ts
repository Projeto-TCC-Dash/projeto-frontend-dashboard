import { z } from "zod"
import { CANONICAL_CATEGORIES } from "@/src/types/api"

export const categoryBudgetLimitSchema = z.object({
  category: z.enum(CANONICAL_CATEGORIES, {
    message: "Categoria inválida",
  }),
  limitAmount: z
    .number({ message: "Informe um valor numérico" })
    .positive("O teto da categoria deve ser maior que zero"),
})

export const setBudgetPlanSchema = z.object({
  totalLimitAmount: z
    .number({ message: "Informe o teto global do mês" })
    .positive("O teto global do mês deve ser maior que zero"),
  categoryBudgets: z
    .array(categoryBudgetLimitSchema)
    .min(1, "Defina ao menos um teto de categoria"),
})

export type SetBudgetPlanFormData = z.infer<typeof setBudgetPlanSchema>
