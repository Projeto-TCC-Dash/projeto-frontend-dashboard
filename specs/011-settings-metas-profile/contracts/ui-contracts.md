# UI & Route Contracts: Perfil de Investidor e Metas (/settings/metas)

**Feature**: `011-settings-metas-profile`  
**Date**: 2026-10-24  
**Status**: Ready

## 1. Contrato da Rota `/settings/metas`

- **Arquivo**: `app/(dashboard)/settings/metas/page.tsx`
- **Componentes Renderizados**:
  - Cabeçalho: Título "Perfil de Investidor & Metas" com descrição de apoio.
  - Conteúdo: Formulário `FinancialProfileForm`.
  - Não renderiza abas de `SettingsNav` nem dados de identidade do usuário.
- **Hooks Consumidos**: `useUserProfile`, `useUpdateFinancialProfile`.

---

## 2. Contrato de Layout de Configurações

- **Arquivo**: `app/(dashboard)/settings/layout.tsx`
- **Comportamento**:
  - Quando a rota for `/settings/metas`: não renderiza o wrapper com título "Configurações da Conta" e nem as abas `SettingsNav`.
  - Quando a rota for `/settings/profile`, `/settings/security` ou `/settings/export`: renderiza o layout com `SettingsNav` e título "Configurações da Conta".
  - Abas em `SettingsNav`:
    - "Informações de Identidade" -> `/settings/profile`
    - "Segurança & Sessão" -> `/settings/security`
    - "Exportar Dados" -> `/settings/export`

---

## 3. Contrato da Sidebar (`components/layout/sidebar.tsx`)

- **Item Atualizado**:
  `{ href: "/settings/metas", label: "Perfil e Metas", icon: Target }`

---

## 4. Contrato de Resolução de Imagem de Avatar (`lib/formatters.ts`)

- **Função**: `resolveAvatarUrl(url: string | null | undefined): string | null`
- **Comportamento**:
  - Se a URL for nula, indefinida ou vazia, retorna `null`.
  - Se a URL começar com `/uploads/` ou `/api/` (caminho relativo provido pelo backend Fastify), concatena a origem do backend (`http://localhost:3000` em desenvolvimento local).
  - Se for URL absoluta (`http://`, `https://` ou `blob:`), retorna a URL sem alterações.
- **Componentes Consumidores**: `UserNav` (`components/layout/user-nav.tsx`) e `UserAvatarUploader` (`components/profile/user-avatar-uploader.tsx`). Em caso de erro 404/falha de carregamento, ambos os componentes alternam para fallback com as iniciais do usuário.
