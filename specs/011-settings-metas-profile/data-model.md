# Data Model: Perfil de Investidor e Metas (/settings/metas)

**Feature**: `011-settings-metas-profile`  
**Date**: 2026-10-24  
**Status**: Ready

## Modelos e Entidades

### 1. Perfil de Investidor e Metas (`FinancialProfile`)

Entidade consumida e persistida na rota `/settings/metas`.

```typescript
export type RiskProfile = "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE";

export type IncomeType =
  | "CLT"
  | "PJ_AUTONOMO"
  | "PUBLIC_SERVANT"
  | "ENTREPRENEUR"
  | "STUDENT"
  | "RETIRED"
  | "OTHER";

export type FinancialGoal =
  | "RESERVA_EMERGENCIA"
  | "QUITAR_DIVIDAS"
  | "COMPRAR_IMOVEL"
  | "INVESTIR_LONGO_PRAZO"
  | "CONTROLE_GASTOS";

export interface FinancialProfile {
  incomeType?: IncomeType;
  declaredMonthlyIncome?: number;
  goals?: FinancialGoal[];
  riskProfile?: RiskProfile;
  updatedAt?: string;
}

export interface UpdateFinancialProfileDTO {
  incomeType?: IncomeType;
  declaredMonthlyIncome?: number;
  goals?: FinancialGoal[];
  riskProfile?: RiskProfile;
}
```

### 2. Mapeamento de Rotas da Aplicação

```typescript
export interface NavigationRouteConfig {
  sidebarItems: Array<{
    href: string;
    label: string;
    icon: string;
  }>;
  accountSettingsRoutes: {
    identity: string;   // "/settings/profile"
    security: string;   // "/settings/security"
    export: string;     // "/settings/export"
  };
  investorProfileRoute: string; // "/settings/metas"
}
```
