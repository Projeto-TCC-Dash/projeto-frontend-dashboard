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

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_AVATAR_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const updateUserProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome deve ter no mínimo 2 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
});

export type UpdateUserProfileFormData = z.infer<typeof updateUserProfileSchema>;

export const avatarFileSchema = z
  .custom<File>(
    (val) =>
      typeof window !== 'undefined' && typeof File !== 'undefined'
        ? val instanceof File
        : typeof val === 'object' && val !== null && 'size' in val && 'type' in val,
    {
      message: 'Arquivo inválido',
    }
  )
  .refine(
    (file) => file.size <= MAX_AVATAR_SIZE_BYTES,
    'A imagem deve ter no máximo 5MB'
  )
  .refine(
    (file) =>
      ALLOWED_AVATAR_TYPES.includes(
        file.type as (typeof ALLOWED_AVATAR_TYPES)[number]
      ),
    'Formato de imagem inválido. Formatos suportados: JPG, PNG e WEBP'
  );

export function validateAvatarFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return { valid: false, error: 'A imagem deve ter no máximo 5MB' };
  }
  if (!ALLOWED_AVATAR_TYPES.includes(file.type as (typeof ALLOWED_AVATAR_TYPES)[number])) {
    return {
      valid: false,
      error: 'Formato de imagem inválido. Formatos suportados: JPG, PNG e WEBP',
    };
  }
  return { valid: true };
}
