import { describe, it, expect } from 'vitest';
import { createAccountSchema, updateAccountSchema } from './account';

describe('createAccountSchema', () => {
  it('deve validar com sucesso um payload válido com todos os campos', () => {
    const validData = {
      name: 'Nubank Principal',
      type: 'CHECKING',
      initialBalance: 1500.5,
      institution: 'Nubank',
      color: '#8B5CF6',
    };

    const result = createAccountSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Nubank Principal');
      expect(result.data.type).toBe('CHECKING');
      expect(result.data.initialBalance).toBe(1500.5);
      expect(result.data.institution).toBe('Nubank');
      expect(result.data.color).toBe('#8B5CF6');
    }
  });

  it('deve aplicar valores padrão para initialBalance (0) e color (#2563EB)', () => {
    const minimalData = {
      name: 'Carteira Física',
      type: 'CASH',
    };

    const result = createAccountSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.initialBalance).toBe(0);
      expect(result.data.color).toBe('#2563EB');
      expect(result.data.institution).toBeUndefined();
    }
  });

  it('deve rejeitar nome vazio ou apenas espaços', () => {
    const invalidData = {
      name: '   ',
      type: 'CHECKING',
    };

    const result = createAccountSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Nome da conta é obrigatório');
    }
  });

  it('deve rejeitar nome com mais de 50 caracteres', () => {
    const invalidData = {
      name: 'A'.repeat(51),
      type: 'CHECKING',
    };

    const result = createAccountSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Nome deve ter no máximo 50 caracteres');
    }
  });

  it('deve rejeitar tipo de conta inválido', () => {
    const invalidData = {
      name: 'Minha Conta',
      type: 'CRYPTO_WALLET',
    };

    const result = createAccountSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Tipo de conta inválido');
    }
  });

  it('deve rejeitar código de cor fora do padrão hexadecimal (#RRGGBB)', () => {
    const invalidColors = ['blue', '#123', '#GGGGGG', '123456', '#1234567'];

    for (const color of invalidColors) {
      const result = createAccountSchema.safeParse({
        name: 'Conta Teste',
        type: 'OTHER',
        color,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Cor deve estar no formato hexadecimal (#RRGGBB)');
      }
    }
  });
});

describe('updateAccountSchema', () => {
  it('deve permitir atualização parcial de campos', () => {
    const partialData = {
      name: 'Novo Nome',
      color: '#10B981',
    };

    const result = updateAccountSchema.safeParse(partialData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Novo Nome');
      expect(result.data.color).toBe('#10B981');
      expect(result.data.type).toBeUndefined();
    }
  });

  it('deve permitir atualizar apenas initialBalance', () => {
    const result = updateAccountSchema.safeParse({ initialBalance: 2500 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.initialBalance).toBe(2500);
    }
  });
});
