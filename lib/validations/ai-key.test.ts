import { describe, it, expect } from "vitest";
import { aiKeySchema } from "./ai-key";

describe("aiKeySchema", () => {
  it("deve validar chave do Google AI Studio com formato e tamanho adequados", () => {
    const validKey = "AIzaSyD-1234567890abcdefghijklmn";
    const result = aiKeySchema.safeParse({ apiKey: validKey });
    expect(result.success).toBe(true);
  });

  it("deve rejeitar chave com menos de 20 caracteres", () => {
    const shortKey = "AIzaSyCurta";
    const result = aiKeySchema.safeParse({ apiKey: shortKey });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("20 caracteres");
    }
  });

  it("deve rejeitar chave contendo espaços ou caracteres especiais inválidos", () => {
    const invalidCharKey = "AIzaSy 1234567890abcdef!@#$%";
    const result = aiKeySchema.safeParse({ apiKey: invalidCharKey });
    expect(result.success).toBe(false);
  });
});
