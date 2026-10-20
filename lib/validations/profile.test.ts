import { describe, it, expect } from 'vitest';
import { updateFinancialProfileSchema } from './profile';

describe('updateFinancialProfileSchema', () => {
  it('deve validar com sucesso um payload vazio (todos os campos opcionais)', () => {
    const result = updateFinancialProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('deve validar com sucesso um perfil completo válido', () => {
    const validData = {
      incomeType: 'PJ_AUTONOMO',
      declaredMonthlyIncome: 8500.5,
      goals: ['RESERVA_EMERGENCIA', 'INVESTIR_LONGO_PRAZO'],
      riskProfile: 'MODERATE',
    };

    const result = updateFinancialProfileSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('deve aceitar declaredMonthlyIncome igual a 0', () => {
    const result = updateFinancialProfileSchema.safeParse({
      declaredMonthlyIncome: 0,
    });
    expect(result.success).toBe(true);
  });

  it('deve rejeitar declaredMonthlyIncome negativo', () => {
    const result = updateFinancialProfileSchema.safeParse({
      declaredMonthlyIncome: -100,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'A renda mensal deve ser igual ou superior a zero'
      );
    }
  });

  it('deve rejeitar regime de renda inválido', () => {
    const result = updateFinancialProfileSchema.safeParse({
      incomeType: 'INVALID_REGIME',
    });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar meta financeira desconhecida', () => {
    const result = updateFinancialProfileSchema.safeParse({
      goals: ['RESERVA_EMERGENCIA', 'META_INVENTADA'],
    });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar perfil de risco inválido', () => {
    const result = updateFinancialProfileSchema.safeParse({
      riskProfile: 'SUPER_RISK',
    });
    expect(result.success).toBe(false);
  });
});
