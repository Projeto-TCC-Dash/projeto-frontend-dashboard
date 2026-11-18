# Data Model: Módulo Fiscal, Investimentos Dedicados e Planejamento Orçamentário

**Feature Branch**: `015-fiscal-advisory-planning` | **Date**: 2026-11-18

---

## 1. Módulo Fiscal (`src/types/api.ts`)

### 1.1 Enums e Labels

```typescript
export const TAX_CATEGORIES = [
  "HEALTH",
  "EDUCATION",
  "PENSION_PGBL",
  "ALIMONY",
  "BUSINESS_EXPENSE_BOOK",
  "OTHER_DEDUCTIBLE",
] as const

export type TaxCategory = (typeof TAX_CATEGORIES)[number]

export const TAX_CATEGORY_LABELS: Record<TaxCategory, string> = {
  HEALTH: "Saúde",
  EDUCATION: "Educação / Instrução",
  PENSION_PGBL: "Previdência Complementar (PGBL)",
  ALIMONY: "Pensão Alimentícia Judicial",
  BUSINESS_EXPENSE_BOOK: "Livro-Caixa Profissional",
  OTHER_DEDUCTIBLE: "Outras Despesas Dedutíveis",
}

export const FISCAL_VERIFICATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "EXEMPT",
] as const

export type FiscalVerificationStatus =
  (typeof FISCAL_VERIFICATION_STATUSES)[number]

export const FISCAL_STATUS_LABELS: Record<FiscalVerificationStatus, string> = {
  PENDING: "Pendente de Comprovante",
  CONFIRMED: "Comprovado",
  EXEMPT: "Isento de Comprovação",
}
```

### 1.2 Estruturas de Classificação, Resumo Anual, OCR e Dossiê

```typescript
export interface TransactionFiscalMetadata {
  isTaxDeductible: boolean
  taxCategory?: TaxCategory
  providerDocument?: string
  providerName?: string
  deductibleAmount?: number
  status: FiscalVerificationStatus
  notes?: string
}

export interface UpdateTransactionFiscalDTO {
  isTaxDeductible: boolean
  taxCategory?: TaxCategory
  providerDocument?: string
  providerName?: string
  deductibleAmount?: number
  status?: FiscalVerificationStatus
  notes?: string
}

export interface FiscalCategoryBreakdown {
  taxCategory: TaxCategory
  totalAmount: number
  confirmedAmount: number
  pendingAmount: number
  count: number
}

export interface FiscalPjSummary {
  applicable: boolean
  grossRevenueYearToDate: number
  annualLimit: number
  ceilingPercentage: number
  proLaboreTotal: number
  dividendsTotal: number
}

export interface FiscalAnnualSummary {
  year: string
  totalDeductibleExpenses: number
  confirmedDeductibleExpenses: number
  pendingDocumentationExpenses: number
  byCategory: FiscalCategoryBreakdown[]
  pjSummary: FiscalPjSummary
}

export interface FiscalOcrExtractedData {
  providerDocument?: string
  providerName?: string
  totalAmount?: number
  issueDate?: string
  description?: string
}

export interface FiscalOcrSuggestedMatch {
  transactionId: string
  date: string
  amount: number
  cleanDescription: string
  confidence: "HIGH" | "MEDIUM" | "LOW"
}

export interface FiscalOcrResponse {
  proofDocumentId: string
  originalFilename: string
  extractedData: FiscalOcrExtractedData
  suggestedMatches: FiscalOcrSuggestedMatch[]
}

export type FiscalDossierFormat = "pdf" | "xlsx"
```

---

## 2. Módulo de Orçamentos Mensais (`src/types/api.ts`)

```typescript
export const BUDGET_CONSUMPTION_STATUSES = [
  "REGULAR",
  "WARNING",
  "EXCEEDED",
] as const

export type BudgetConsumptionStatus =
  (typeof BUDGET_CONSUMPTION_STATUSES)[number]

export interface CategoryBudgetLimit {
  category: Category
  limitAmount: number
}

export interface SetBudgetPlanDTO {
  totalLimitAmount: number
  categoryBudgets: CategoryBudgetLimit[]
}

export interface BudgetConsumptionItem {
  category: Category
  limitAmount: number
  spentAmount: number
  remainingAmount: number
  percentConsumed: number
  status: BudgetConsumptionStatus
}

export interface BudgetOverview {
  month: string
  totalLimitAmount: number
  totalSpentAmount: number
  totalRemainingAmount: number
  globalPercentConsumed: number
  globalStatus: BudgetConsumptionStatus
  categories: BudgetConsumptionItem[]
}
```

### Regras Visuais de Status
- `REGULAR` (`< 70%`): Cor esmeralda (`emerald-500`), badge `"Regular"`.
- `WARNING` (`70% a 99,9%`): Cor âmbar (`amber-500`), badge `"Atenção"`.
- `EXCEEDED` (`≥ 100%`): Cor rosa/vermelho (`rose-500`), badge `"Excedido"`.

---

## 3. Análise Multi-Mês do Servidor (`src/types/api.ts`)

```typescript
export type MultiMonthRange = "3" | "6" | "12"
export type FixedCostTrendStatus = "STABLE" | "GROWING" | "DECLINING"

export interface MultiMonthSummaryPoint {
  month: string
  totalIncome: number
  totalExpenses: number
  netBalance: number
  savingsRate: number
}

export interface MultiMonthAnalysisResponse {
  rangeMonths: number
  averageSavingsRate: number
  averageMonthlyExpenses: number
  averageMonthlyIncome: number
  fixedCostTrend: {
    status: FixedCostTrendStatus
    percentageChange: number
    alertCategory?: string
  }
  monthlyHistory: MultiMonthSummaryPoint[]
}
```

---

## 4. Investimentos Dedicados (`src/types/api.ts` & `src/types/charts.ts`)

- Reutiliza `ASSET_MACRO_CLASSES`, `ASSET_MACRO_CLASS_LABELS`, `InvestmentPortfolioSummary` e `UpsertInvestmentHoldingDTO` já definidos em `src/types/api.ts`.
- Mapeia os itens com `amount > 0` para `CategoryChartDatum[]` (consumido por `DonutChart`) e `BarListItem[]` (consumido por `BarList`) na nova página dedicada `/investments`.

---

## 5. Regras de Validação (`lib/validations/fiscal.ts` e `lib/validations/budget.ts`)

### 5.1 Fiscal
- `providerDocument`: Opcional; quando preenchido (após remover pontuação), deve ter exatamente `11` (CPF) ou `14` (CNPJ) dígitos numéricos.
- `providerName`: Opcional; mínimo 2 caracteres e máximo 120.
- `deductibleAmount`: Opcional; se informado, deve ser `> 0`.
- `notes`: Opcional; máximo 250 caracteres.
- **Upload OCR**: Aceita apenas MIME types `application/pdf`, `image/jpeg`, `image/png`, `image/webp` e tamanho `<= 10 MB`.

### 5.2 Orçamentos
- `totalLimitAmount`: Obrigatório e `> 0`.
- `categoryBudgets`: Lista não vazia; cada item com `limitAmount > 0`.
