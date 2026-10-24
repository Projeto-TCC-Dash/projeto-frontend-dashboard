import { describe, it, expect, vi } from 'vitest';
import { generateCsvTransactions, triggerBlobDownload } from './export-utils';
import type { Transaction } from '@/src/types/api';

describe('generateCsvTransactions', () => {
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      externalId: 'ext-1',
      rawDescription: 'Supermercado Pão de Açúcar',
      cleanDescription: 'Pão de Açúcar',
      amount: -150.75,
      date: '2026-10-15T12:00:00Z',
      category: 'Alimentação',
      source: 'CSV',
      account: {
        id: 'acc-1',
        name: 'Nubank Débito',
      },
    },
    {
      id: 'tx-2',
      externalId: 'ext-2',
      rawDescription: 'Salário Mensal',
      cleanDescription: 'Salário Empresa XYZ',
      amount: 6500.0,
      date: '2026-10-05T08:00:00Z',
      category: 'Receita',
      source: 'OFX',
      account: {
        id: 'acc-2',
        name: 'Itaú CC',
      },
    },
    {
      id: 'tx-3',
      externalId: 'ext-3',
      rawDescription: 'Restaurante; "Gourmet"',
      cleanDescription: 'Restaurante "Gourmet"',
      amount: -89.9,
      date: '2026-10-20',
      category: 'Lazer',
      source: 'CSV',
    },
  ];

  it('deve gerar CSV com cabeçalho correto e BOM UTF-8 por padrão', () => {
    const csv = generateCsvTransactions(mockTransactions);
    expect(csv.startsWith('\uFEFF')).toBe(true);

    const lines = csv.replace('\uFEFF', '').split('\r\n');
    expect(lines[0]).toBe('Data;Descrição;Categoria;Conta;Tipo;Valor');
    expect(lines.length).toBe(4); // Cabeçalho + 3 linhas
  });

  it('deve formatar data, tipo (Receita/Despesa) e valores numéricos', () => {
    const csv = generateCsvTransactions(mockTransactions, { includeBom: false });
    const lines = csv.split('\r\n');

    // Primeira transação (Despesa)
    expect(lines[1]).toContain('15/10/2026');
    expect(lines[1]).toContain('Pão de Açúcar');
    expect(lines[1]).toContain('Alimentação');
    expect(lines[1]).toContain('Nubank Débito');
    expect(lines[1]).toContain('Despesa');
    expect(lines[1]).toContain('-150,75');

    // Segunda transação (Receita)
    expect(lines[2]).toContain('05/10/2026');
    expect(lines[2]).toContain('Salário Empresa XYZ');
    expect(lines[2]).toContain('Receita');
    expect(lines[2]).toContain('6.500,00');
  });

  it('deve escapar campos que contenham delimitador ou aspas', () => {
    const csv = generateCsvTransactions(mockTransactions, { includeBom: false });
    const lines = csv.split('\r\n');

    // Terceira transação com aspas no nome
    expect(lines[3]).toContain('"Restaurante ""Gourmet"""');
    expect(lines[3]).toContain('Principal');
  });

  it('deve permitir delimitador customizado como vírgula', () => {
    const csv = generateCsvTransactions(mockTransactions, {
      delimiter: ',',
      includeBom: false,
    });
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('Data,Descrição,Categoria,Conta,Tipo,Valor');
  });
});

describe('triggerBlobDownload', () => {
  it('deve disparar download via elemento âncora e limpar URL', () => {
    const clickMock = vi.fn();
    const appendChildMock = vi.spyOn(document.body, 'appendChild');
    const removeChildMock = vi.spyOn(document.body, 'removeChild');

    const originalCreateObjectURL = window.URL.createObjectURL;
    const originalRevokeObjectURL = window.URL.revokeObjectURL;

    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();

    const originalCreateElement = document.createElement.bind(document);
    const createElementMock = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = originalCreateElement(tagName);
      if (tagName === 'a') {
        el.click = clickMock;
      }
      return el;
    });

    const blob = new Blob(['teste'], { type: 'text/csv' });
    triggerBlobDownload(blob, 'extrato.csv');

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(appendChildMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(removeChildMock).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    createElementMock.mockRestore();
    appendChildMock.mockRestore();
    removeChildMock.mockRestore();
    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;
  });
});
