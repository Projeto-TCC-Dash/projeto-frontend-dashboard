# Data Model: Exclusão de Transações, 11 Categorias Canônicas e Associação de Contas

**Feature**: `specs/007-transactions-extended-deletion-categories`  
**Status**: Completed  
**Date**: 2026-10-23  

---

## 1. Entidades Canônicas e Tipos TypeScript (`src/types/api.ts`)

### 1.1 Catálogo Oficial de 11 Categorias Canônicas

```typescript
export const CANONICAL_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Lazer',
  'Educação',
  'Receita',
  'Pagamento de Fatura',
  'Investimentos',
  'Outros',
  'Não Categorizado',
] as const;

export type Category = (typeof CANONICAL_CATEGORIES)[number];
```

### 1.2 Entidade `Transaction` (com Suporte a Conta Bancária)

```typescript
export interface TransactionAccountSummary {
  id: string;
  name: string;
  color?: string;
  institution?: string;
}

export interface Transaction {
  id: string;
  externalId: string;
  rawDescription: string;
  cleanDescription: string;
  amount: number; // Positivo = Receita, Negativo = Despesa
  date: string; // ISO 8601 UTC
  category: Category;
  source: TransactionSource;
  accountId?: string; // Vínculo com a conta bancária
  account?: TransactionAccountSummary; // Dados desnormalizados para visualização ágil
}
```

### 1.3 DTOs de Edição e Filtros de Consulta

```typescript
export interface UpdateTransactionDTO {
  category?: Category;
  cleanDescription?: string;
  accountId?: string | null; // ID da nova conta associada ou null para desvincular
}

export interface TransactionFilterParams {
  month?: string; // YYYY-MM
  category?: Category;
  source?: TransactionSource;
  accountId?: string; // Filtro por conta bancária
}

export interface UploadTransactionsOptions {
  accountId?: string; // Conta associada às transações do arquivo importado
}
```

---

## 2. Esquemas de Validação com Zod (`lib/validations/transaction.ts`)

```typescript
import { z } from 'zod';
import { CANONICAL_CATEGORIES } from '@/types/api';

export const canonicalCategoryEnum = z.enum(CANONICAL_CATEGORIES);

export const updateTransactionSchema = z.object({
  cleanDescription: z
    .string()
    .trim()
    .min(1, 'A descrição limpa deve conter pelo menos 1 caractere')
    .max(200, 'A descrição não pode exceder 200 caracteres')
    .optional(),
  category: canonicalCategoryEnum.optional(),
  accountId: z.string().trim().nullable().optional(),
});

export type UpdateTransactionFormData = z.infer<typeof updateTransactionSchema>;

export const MAX_TRANSACTION_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_EXTENSIONS = ['.ofx', '.csv'] as const;

export function validateTransactionFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Selecione um arquivo de extrato' };
  }

  const name = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!hasValidExt) {
    return {
      valid: false,
      error: 'Formato inválido. Apenas arquivos .ofx e .csv são suportados',
    };
  }

  if (file.size > MAX_TRANSACTION_FILE_SIZE) {
    return {
      valid: false,
      error: 'Arquivo muito grande. O limite máximo é de 10MB',
    };
  }

  return { valid: true };
}
```

---

## 3. Mapeamento de Cores e Estilos dos Badges de Categoria

| Categoria | Cor Hexadecimal | Classes Tailwind (Claro / Escuro) | Semântica |
|---|---|---|---|
| **Alimentação** | `#F59E0B` (Amber) | `bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300` | Consumo diário essencial |
| **Transporte** | `#3B82F6` (Blue) | `bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300` | Locomoção e combustível |
| **Moradia** | `#8B5CF6` (Purple) | `bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300` | Aluguel, contas e manutenção |
| **Saúde** | `#EF4444` (Red) | `bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300` | Farmácia e consultas |
| **Lazer** | `#EC4899` (Pink) | `bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300` | Entretenimento e viagens |
| **Educação** | `#10B981` (Emerald) | `bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300` | Cursos, livros e faculdade |
| **Receita** | `#16A34A` (Green) | `bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300` | Salários e entradas |
| **Pagamento de Fatura** | `#64748B` (Slate) | `bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200` | Quitação contábil de cartão |
| **Investimentos** | `#06B6D4` (Cyan) | `bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300` | Aportes e patrimônio |
| **Outros** | `#6B7280` (Gray) | `bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300` | Despesas diversas |
| **Não Categorizado** | `#F97316` (Orange) | `bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300` | Pendente de classificação |
