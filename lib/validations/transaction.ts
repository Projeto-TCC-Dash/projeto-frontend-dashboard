import { z } from "zod";
import { CANONICAL_CATEGORIES } from "@/src/types/api";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_STATEMENT_EXTENSIONS = [".ofx", ".csv"] as const;

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateStatementFile(file: File): FileValidationResult {
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_STATEMENT_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: "Formato de arquivo não suportado. Por favor, envie um arquivo .OFX ou .CSV.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: "O tamanho do arquivo excede o limite máximo permitido de 10MB.",
    };
  }

  return { isValid: true };
}

export const updateTransactionSchema = z.object({
  cleanDescription: z
    .string()
    .trim()
    .min(1, "A descrição limpa não pode estar vazia"),
  category: z.enum(CANONICAL_CATEGORIES, {
    message: "Selecione uma categoria canônica válida",
  }),
  accountId: z.string().trim().nullable().optional(),
});

export type UpdateTransactionFormData = z.infer<typeof updateTransactionSchema>;
