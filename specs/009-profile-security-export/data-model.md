# Data Model: Feature 009

## Interfaces e Modelos de Domínio

### 1. Entidade de Perfil de Usuário Estendida (`UserProfileResponse`)

```typescript
export interface UserSecuritySettings {
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

### 2. Filtros e Parâmetros de Exportação

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
