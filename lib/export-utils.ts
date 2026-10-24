import type { Transaction } from '@/src/types/api';

export interface CsvOptions {
  delimiter?: string;
  includeBom?: boolean;
}

/**
 * Escapa valores para CSV caso contenham delimitadores, quebras de linha ou aspas.
 */
function escapeCsvValue(value: string | number | undefined | null, delimiter = ';'): string {
  if (value === undefined || value === null) return '';
  const stringValue = String(value);
  if (
    stringValue.includes(delimiter) ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Gera string CSV a partir de uma lista de transações com UTF-8 BOM para compatibilidade com Excel.
 */
export function generateCsvTransactions(
  transactions: Transaction[],
  options: CsvOptions = {}
): string {
  const delimiter = options.delimiter ?? ';';
  const includeBom = options.includeBom ?? true;

  const headers = ['Data', 'Descrição', 'Categoria', 'Conta', 'Tipo', 'Valor'];
  const headerLine = headers.map((h) => escapeCsvValue(h, delimiter)).join(delimiter);

  const rows = transactions.map((t) => {
    // Formata data ISO para DD/MM/YYYY
    let formattedDate = t.date;
    try {
      const parts = t.date.split('T')[0].split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch {
      formattedDate = t.date;
    }

    const description = t.cleanDescription || t.rawDescription || '';
    const category = t.category || 'Não Categorizado';
    const accountName = t.account?.name || (t.accountId ? 'Conta Vinculada' : 'Principal');
    const type = t.amount >= 0 ? 'Receita' : 'Despesa';
    const formattedAmount = t.amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return [
      escapeCsvValue(formattedDate, delimiter),
      escapeCsvValue(description, delimiter),
      escapeCsvValue(category, delimiter),
      escapeCsvValue(accountName, delimiter),
      escapeCsvValue(type, delimiter),
      escapeCsvValue(formattedAmount, delimiter),
    ].join(delimiter);
  });

  const content = [headerLine, ...rows].join('\r\n');
  return includeBom ? `\uFEFF${content}` : content;
}

/**
 * Dispara o download de um Blob no navegador
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
