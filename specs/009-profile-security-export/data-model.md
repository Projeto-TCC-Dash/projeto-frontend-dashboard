# Data Model: Feature 009 (Perfil, Google Auth & Exportação)

Este documento define as entidades, DTOs e tipagens canônicas de dados no frontend, garantindo conformidade estrita com o Princípio I da Constituição (TypeScript Estrito e Zero `any`) e com os contratos do backend.

---

## 1. Modelos de Identidade e Perfil de Usuário

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
  name: string;
}

export interface AvatarUploadResponse {
  success: boolean;
  message: string;
  avatarUrl: string | null;
}
```

---

## 2. Modelos de Autenticação Social Google (GIS / OAuth 2.0)

```typescript
export interface GoogleAuthPayload {
  idToken: string;
}

export interface GoogleAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
    hasAiKey: boolean;
  };
}

export interface GoogleLinkResponse extends UserProfileResponse {
  success?: boolean;
  message?: string;
  googleAccount?: {
    googleEmail: string;
    linkedAt: string;
  };
}

export interface GoogleUnlinkResponse {
  id: string;
  email: string;
  security: {
    hasLocalPassword: boolean;
    googleLinked: false;
  };
  success: boolean;
  message: string;
}
```

---

## 3. Modelos da Central de Exportação de Dados

```typescript
export type ExportFormat = "csv" | "xlsx" | "pdf";

export interface ExportFilterParams {
  format: ExportFormat;
  month?: string;
  startDate?: string;
  endDate?: string;
  accountId?: string;
  category?: string;
}

export interface ExportState {
  isExporting: boolean;
  progressFormat: ExportFormat | null;
  error: string | null;
}
```

---

## 4. Validações Zod (lib/validations/profile.ts e export.ts)

```typescript
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_AVATAR_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const updateUserProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome deve ter no mínimo 2 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
});

export const exportFiltersSchema = z.object({
  format: z.enum(['csv', 'xlsx', 'pdf']),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Formato de mês inválido (YYYY-MM)').optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inicial inválida (YYYY-MM-DD)').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data final inválida (YYYY-MM-DD)').optional(),
  accountId: z.string().length(24, 'ID de conta inválido').optional(),
  category: z.string().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'A data inicial não pode ser posterior à data final',
  path: ['endDate'],
});
```
