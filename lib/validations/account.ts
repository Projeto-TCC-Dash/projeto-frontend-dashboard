import { z } from 'zod';
import { ACCOUNT_TYPES } from '@/src/types/api';

export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const createAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome da conta é obrigatório')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  type: z.enum(ACCOUNT_TYPES, {
    message: 'Tipo de conta inválido',
  }),
  initialBalance: z.number().default(0),
  institution: z
    .string()
    .trim()
    .max(50, 'Instituição deve ter no máximo 50 caracteres')
    .optional(),
  color: z
    .string()
    .regex(HEX_COLOR_REGEX, 'Cor deve estar no formato hexadecimal (#RRGGBB)')
    .default('#2563EB'),
});

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = createAccountSchema.partial();

export type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;
