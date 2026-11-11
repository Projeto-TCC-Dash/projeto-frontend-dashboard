# Data Model: Segregação de Metas Financeiras e Central de Perfil de Usuário

**Feature**: `010-profile-goals-segregation`  
**Date**: 2026-10-24  
**Status**: Ready

## Entidades e Modelos de Dados

### 1. Perfil de Usuário (Domínio de Identidade)

Entidade canônica representando os dados do usuário autenticado expostos na interface.

```typescript
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  createdAt: string;
}
```

### 2. Estado de Rascunho do Formulário Unificado de Identidade (`UnifiedIdentityDraft`)

Estrutura de estado gerenciada internamente no componente `UserProfileIdentityForm` para orquestrar o salvamento coordenado de imagem e dados cadastrais.

```typescript
export interface UnifiedIdentityDraft {
  name: string;
  pendingAvatarFile: File | null;
  pendingAvatarPreview: string | null;
  pendingAvatarRemove: boolean;
  isDirty: boolean;
  validationError?: string | null;
}
```

#### Regras de Validação e Transição de Estado:
- **Tamanho Máximo do Arquivo**: 5MB (5.242.880 bytes).
- **Tipos MIME Permitidos**: `image/jpeg`, `image/png`, `image/webp`.
- **Transição: Adição de Foto**:
  - `pendingAvatarFile = file`
  - `pendingAvatarPreview = URL.createObjectURL(file)`
  - `pendingAvatarRemove = false`
- **Transição: Remoção de Foto**:
  - `pendingAvatarFile = null`
  - Liberação de `pendingAvatarPreview` via `URL.revokeObjectURL`
  - `pendingAvatarRemove = true`
- **Transição: Cancelamento/Descarte**:
  - Limpeza de `pendingAvatarFile` e revogação de `pendingAvatarPreview`.
- **Condição `isDirty`**:
  - `(name.trim() !== (initialName || "")) || (pendingAvatarFile !== null) || pendingAvatarRemove`

---

### 3. Perfil de Metas Financeiras (`FinancialProfile`)

Entidade mantida exclusivamente na rota `/goals` para o planejamento de metas patrimoniais do usuário.

```typescript
export type RiskProfile = "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE";

export interface FinancialProfile {
  monthlyIncome?: number;
  riskProfile?: RiskProfile;
  monthlyInvestmentGoal?: number;
  emergencyFundTarget?: number;
  emergencyFundCurrent?: number;
  shortTermGoals?: string;
  mediumTermGoals?: string;
  longTermGoals?: string;
  updatedAt?: string;
}
```

#### Regras de Validação:
- Valores numéricos (renda, reserva e metas) devem ser estritamente não-negativos (`>= 0`).
- Atualizações persistidas via hook `useUpdateFinancialProfile` invalidando a chave de query `['userProfile']`.

---

### 4. Configuração de Itens de Navegação (`SidebarItem` & `SettingsTab`)

```typescript
export interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}
```

#### Estrutura Atualizada do Menu Lateral:
1. `Dashboard` (`/`)
2. `Contas e Cartões` (`/accounts`)
3. `Extratos & Transações` (`/transactions`)
4. `Perfil e Metas` (`/goals`)
5. `Consultor IA` (`/chat`)

#### Estrutura Atualizada das Abas de Configuração de Conta (`/settings`):
1. `Informações de Identidade` (`/settings/profile`)
2. `Segurança & Sessão` (`/settings/security`)
3. `Central de Exportação` (`/settings/export`)
