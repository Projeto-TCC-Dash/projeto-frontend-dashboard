# Data Model: Feature 008

## Entities and Interfaces

### 1. Extensão de `FinancialMetrics` em `src/types/api.ts`

```typescript
export interface CategoryMetric {
  category: string;
  amount: number;
  percentage: number;
}

export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  invoiceSettlements?: number; // Quitação de faturas de cartão de crédito no período
  netBalance: number;
  savingsRate: number; // Em percentual (ex: 35.5%)
  topCategories: CategoryMetric[];
}
```

### 2. Calibração de Perfil e Diretriz de Reserva

```typescript
export interface EmergencyReserveGuideline {
  minMonths: number;
  maxMonths: number;
  minAmount: number;
  maxAmount: number;
  label: string;
  isCustomized: boolean;
}

export function computeEmergencyReserveGuideline(
  incomeType?: IncomeType,
  monthlyExpenses: number = 0
): EmergencyReserveGuideline {
  let minMonths = 6;
  let maxMonths = 6;
  let isCustomized = false;

  if (incomeType === "CLT" || incomeType === "PUBLIC_SERVANT") {
    minMonths = 3;
    maxMonths = 6;
    isCustomized = true;
  } else if (incomeType === "PJ_AUTONOMO" || incomeType === "ENTREPRENEUR") {
    minMonths = 6;
    maxMonths = 12;
    isCustomized = true;
  }

  const minAmount = monthlyExpenses * minMonths;
  const maxAmount = monthlyExpenses * maxMonths;

  const label =
    minMonths === maxMonths
      ? `${minMonths} meses de despesas`
      : `${minMonths} a ${maxMonths} meses de despesas`;

  return {
    minMonths,
    maxMonths,
    minAmount,
    maxAmount,
    label,
    isCustomized,
  };
}
```
