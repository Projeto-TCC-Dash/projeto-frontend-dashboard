import { z } from 'zod';
import { INCOME_TYPES, FINANCIAL_GOALS, RISK_PROFILES } from '@/src/types/api';

export const updateFinancialProfileSchema = z.object({
  incomeType: z.enum(INCOME_TYPES).optional(),
  declaredMonthlyIncome: z
    .number()
    .min(0, 'A renda mensal deve ser igual ou superior a zero')
    .optional(),
  goals: z.array(z.enum(FINANCIAL_GOALS)).optional(),
  riskProfile: z.enum(RISK_PROFILES).optional(),
});

export type UpdateFinancialProfileFormData = z.infer<typeof updateFinancialProfileSchema>;
