# Data Model: Perfil Financeiro do Usuário

**Feature**: `005-financial-profile-onboarding`  
**Date**: 2026-10-19  

---

## 1. Tipos e Enums de Domínio (`types/api.ts`)

```typescript
// Regime de Trabalho e Renda
export const INCOME_TYPES = [
  'CLT',
  'PJ_AUTONOMO',
  'PUBLIC_SERVANT',
  'ENTREPRENEUR',
  'STUDENT',
  'RETIRED',
  'OTHER',
] as const;
export type IncomeType = typeof INCOME_TYPES[number];

export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  CLT: 'CLT (Carteira Assinada)',
  PJ_AUTONOMO: 'PJ / Autônomo / Freelancer',
  PUBLIC_SERVANT: 'Servidor Público',
  ENTREPRENEUR: 'Empresário / Sócio',
  STUDENT: 'Estudante / Estagiário',
  RETIRED: 'Aposentado / Pensionista',
  OTHER: 'Outro',
};

// Metas Financeiras Prioritárias
export const FINANCIAL_GOALS = [
  'RESERVA_EMERGENCIA',
  'QUITAR_DIVIDAS',
  'COMPRAR_IMOVEL',
  'INVESTIR_LONGO_PRAZO',
  'CONTROLE_GASTOS',
] as const;
export type FinancialGoal = typeof FINANCIAL_GOALS[number];

export const FINANCIAL_GOAL_LABELS: Record<FinancialGoal, string> = {
  RESERVA_EMERGENCIA: 'Criar / Expandir Reserva de Emergência',
  QUITAR_DIVIDAS: 'Quitar Dívidas e Empréstimos',
  COMPRAR_IMOVEL: 'Comprar Imóvel / Casa Própria',
  INVESTIR_LONGO_PRAZO: 'Investir para Longo Prazo / Independência',
  CONTROLE_GASTOS: 'Controlar Gastos Supérfluos e Orçamento',
};

// Perfil de Tolerância a Risco
export const RISK_PROFILES = [
  'CONSERVATIVE',
  'MODERATE',
  'AGGRESSIVE',
] as const;
export type RiskProfile = typeof RISK_PROFILES[number];

export const RISK_PROFILE_LABELS: Record<RiskProfile, string> = {
  CONSERVATIVE: 'Conservador (prioriza segurança e liquidez)',
  MODERATE: 'Moderado (equilíbrio entre segurança e rentabilidade)',
  AGGRESSIVE: 'Agressivo (foco em crescimento com tolerância à oscilação)',
};

// Entidades de Perfil
export interface FinancialProfile {
  incomeType?: IncomeType;
  declaredMonthlyIncome?: number;
  goals?: FinancialGoal[];
  riskProfile?: RiskProfile;
  updatedAt?: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  hasAiKey: boolean;
  financialProfile?: FinancialProfile;
}

export interface UpdateFinancialProfileDTO {
  incomeType?: IncomeType;
  declaredMonthlyIncome?: number;
  goals?: FinancialGoal[];
  riskProfile?: RiskProfile;
}
```

---

## 2. Schema de Validação Zod (`lib/validations/profile.ts`)

```typescript
import { z } from 'zod';
import { INCOME_TYPES, FINANCIAL_GOALS, RISK_PROFILES } from '@/types/api';

export const updateFinancialProfileSchema = z.object({
  incomeType: z.enum(INCOME_TYPES).optional(),
  declaredMonthlyIncome: z
    .number()
    .min(0, 'A renda mensal deve ser igual ou superior a zero')
    .optional(),
  goals: z.array(z.enum(FINANCIAL_GOALS)).optional(),
  riskProfile: z.enum(RISK_PROFILES).optional(),
});

export type UpdateFinancialProfileFormData = z.infer<typeof updateFinancialProfileSchema>;
```

---

## 3. Estado de Cliente para o Banner (`ProfileOnboardingBanner`)

- **Visibilidade**:
  - `isConfigured`: `Boolean(userProfile?.financialProfile?.incomeType || userProfile?.financialProfile?.goals?.length)`
  - `isDismissed`: `sessionStorage.getItem('dismiss_profile_banner') === 'true'`
  - Renderiza se: `!isConfigured && !isDismissed`
- **Ações**:
  - `onDismiss()`: `sessionStorage.setItem('dismiss_profile_banner', 'true')` e oculta localmente.
  - `onConfigure()`: navega para `/settings/profile`.
