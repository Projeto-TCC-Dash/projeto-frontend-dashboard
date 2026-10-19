import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "./auth";

describe("loginSchema", () => {
  it("deve validar credenciais corretas com sucesso", () => {
    const result = loginSchema.safeParse({
      email: "usuario@teste.com",
      password: "qualquer-senha",
    });
    expect(result.success).toBe(true);
  });

  it("deve rejeitar e-mail inválido", () => {
    const result = loginSchema.safeParse({
      email: "email-invalido",
      password: "123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Informe um endereço de e-mail válido");
    }
  });

  it("deve rejeitar campos vazios", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("deve validar cadastro com dados consistentes e senha >= 8 caracteres", () => {
    const result = registerSchema.safeParse({
      email: "novo.usuario@teste.com",
      password: "SenhaForte123",
      confirmPassword: "SenhaForte123",
    });
    expect(result.success).toBe(true);
  });

  it("deve rejeitar senha com menos de 8 caracteres", () => {
    const result = registerSchema.safeParse({
      email: "novo.usuario@teste.com",
      password: "1234567",
      confirmPassword: "1234567",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("8 caracteres"))).toBe(true);
    }
  });

  it("deve rejeitar quando as senhas não coincidem", () => {
    const result = registerSchema.safeParse({
      email: "novo.usuario@teste.com",
      password: "SenhaForte123",
      confirmPassword: "SenhaDiferente456",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("não coincidem"))).toBe(true);
    }
  });
});
