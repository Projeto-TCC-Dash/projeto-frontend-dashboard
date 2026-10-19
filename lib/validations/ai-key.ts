import { z } from "zod";

export const aiKeySchema = z.object({
  apiKey: z
    .string()
    .trim()
    .min(20, "A chave de API deve ter no mínimo 20 caracteres")
    .regex(/^[A-Za-z0-9_-]+$/, "A chave contém caracteres inválidos"),
});

export type AiKeyFormData = z.infer<typeof aiKeySchema>;
