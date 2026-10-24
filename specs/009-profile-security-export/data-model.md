# Data Model: Feature 009

## Interfaces e Modelos de Domínio

### 1. Entidade de Perfil de Usuário Estendida (`UserProfileResponse`)

```typescript
export interface UserSecuritySettings {
  twoFactorEnabled: boolean;
  hasLocalPassword: boolean;
  googleLinked: boolean;
  googleEmail?: string;
  googleLinkedAt?: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string | null;
  hasAiKey: boolean;
  security?: UserSecuritySettings;
  financialProfile?: FinancialProfile;
  createdAt?: string;
}

export interface UpdateUserProfileDTO {
  name?: string;
}
```

### 2. DTOs de Autenticação em Dois Fatores (2FA)

```typescript
export interface Request2FAResponse {
  message: string;
  expiresInSeconds: number;
}

export interface Confirm2FADTO {
  code: string;
}

export interface Disable2FADTO {
  password?: string;
  code?: string;
}

export interface TwoFactorActionResponse {
  success: boolean;
  message: string;
  twoFactorEnabled: boolean;
}
```

### 3. Filtros e Parâmetros de Exportação

```typescript
export type ExportFormat = "csv" | "xlsx" | "pdf";

export interface ExportFilterParams {
  format: ExportFormat;
  month?: string;
  startDate?: string;
  endDate?: string;
  accountId?: string;
  category?: Category;
}
```
