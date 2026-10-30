import { describe, it, expect } from 'vitest';
import {
  updateFinancialProfileSchema,
  updateUserProfileSchema,
  avatarFileSchema,
  validateAvatarFile,
} from './profile';

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

describe('updateUserProfileSchema', () => {
  it('deve aceitar um nome válido com 2 ou mais caracteres', () => {
    const result = updateUserProfileSchema.safeParse({ name: 'Maria Silva' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Maria Silva');
    }
  });

  it('deve rejeitar nome menor que 2 caracteres ou apenas espaços', () => {
    const result = updateUserProfileSchema.safeParse({ name: ' a ' });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar nome com mais de 100 caracteres', () => {
    const result = updateUserProfileSchema.safeParse({ name: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });
});

describe('avatarFileSchema e validateAvatarFile', () => {
  it('deve aceitar arquivo de imagem válido <= 5MB', () => {
    const file = new File(['image bytes'], 'avatar.png', { type: 'image/png' });
    const result = avatarFileSchema.safeParse(file);
    expect(result.success).toBe(true);

    const validation = validateAvatarFile(file);
    expect(validation.valid).toBe(true);
  });

  it('deve aceitar imagens nos formatos jpeg, png e webp', () => {
    const jpg = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' });
    const webp = new File(['dummy'], 'photo.webp', { type: 'image/webp' });

    expect(avatarFileSchema.safeParse(jpg).success).toBe(true);
    expect(avatarFileSchema.safeParse(webp).success).toBe(true);
  });

  it('deve rejeitar arquivo maior que 5MB', () => {
    const largeFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', {
      type: 'image/png',
    });
    const result = avatarFileSchema.safeParse(largeFile);
    expect(result.success).toBe(false);

    const validation = validateAvatarFile(largeFile);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('5MB');
  });

  it('deve rejeitar formato de arquivo não suportado', () => {
    const textFile = new File(['hello'], 'document.pdf', {
      type: 'application/pdf',
    });
    const result = avatarFileSchema.safeParse(textFile);
    expect(result.success).toBe(false);

    const validation = validateAvatarFile(textFile);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('Formato de imagem inválido');
  });
});
