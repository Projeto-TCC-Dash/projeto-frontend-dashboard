# Implementation Plan: Segregação de Metas Financeiras e Central de Perfil de Usuário

**Branch**: `010-profile-goals-segregation` | **Date**: 2026-10-24 | **Spec**: [spec.md](./spec.md)

## Summary

Segregar a experiência de **Metas e Perfil Financeiro** da **Central de Configurações do Usuário**:
1. Criar rota dedicada `/goals` para planejamento exclusivo de metas financeiras (`FinancialProfileForm`), vinculada ao menu lateral (`Sidebar`).
2. Vincular o componente de usuário no cabeçalho (`UserNav`) como ponto de entrada para a área de perfil e configurações de conta (`/settings/profile`).
3. Unificar a gestão de foto de perfil (avatar) e a edição de nome de exibição em um único formulário integrado (`UserProfileIdentityForm`), persistindo foto e nome de forma coordenada em um único clique no botão "Salvar alterações".
4. Manter as abas de "Segurança & Sessão" e "Central de Exportação" organizadas sob o shell de configurações de conta.

## Technical Context

- **Language/Version**: TypeScript 5 em modo estrito (`strict: true`, zero `any`).
- **Framework & Stack**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React, Shadcn.
- **Gerenciamento de Estado de Servidor**: TanStack Query (`@tanstack/react-query`) com invalidação direcionada de `['userProfile']`.
- **Manipulação de Arquivos e Memória**: `URL.createObjectURL` e limpeza mandatória com `URL.revokeObjectURL` para previews de avatar, com validação de limite de 5MB e formatos suportados (JPEG, PNG, WebP).
- **Roteamento**:
  - `/goals`: Nova página exclusiva para metas financeiras.
  - `/settings/profile`: Central de identidade do usuário (avatar unificado + nome + e-mail somente leitura).
  - `/settings/security`: 2FA por e-mail, contas vinculadas e logout seguro.
  - `/settings/export`: Central de exportação de dados (CSV, PDF, XLSX).
- **Testes Automatizados**: Vitest e React Testing Library (`pnpm test`).

## Constitution Check

- [x] **I. TypeScript Estrito & Zero `any`**: Todas as entidades, props e estados de rascunho estritamente tipados sem o uso de `any`.
- [x] **II. Clean Code & SRP**: `UserProfileIdentityForm` cuida da interface e do estado local de rascunho de identidade; hooks `useUserProfile` gerenciam as mutações no servidor.
- [x] **V. TanStack Query Reativo**: Salvamento de nome e foto invalida a query de perfil e atualiza o estado de autenticação em cache sem recarregar a página.
- [x] **VII. Testes Automatizados Obrigatórios**: Cobertura completa de testes para a nova rota `/goals`, o formulário unificado `UserProfileIdentityForm`, e a navegação no `UserNav` e `Sidebar`.
- [x] **IX. Manipulação Segura de Mídias**: Previews de imagem utilizam controle estrito de memória (`URL.createObjectURL` com liberação via `URL.revokeObjectURL` no unmount/troca) e validação client-side antes de salvar.

## Project Structure

### Documentation (this feature)

```text
specs/010-profile-goals-segregation/
├── plan.md              # Este plano de implementação
├── research.md          # Decisões de arquitetura e UX
├── data-model.md        # Modelos de dados e transições de estado
├── quickstart.md        # Guia de validação ponta a ponta
├── contracts/           # Contratos de componentes e UI
│   └── ui-contracts.md
└── tasks.md             # Tarefas de implementação (geradas no próximo passo)
```

### Source Code (repository root)

```text
app/(dashboard)/
├── goals/
│   ├── page.tsx               # Nova página dedicada de metas financeiras
│   └── page.test.tsx          # Teste de renderização da página de metas
├── settings/
│   ├── layout.tsx             # Shell de abas de configurações
│   ├── profile/
│   │   ├── page.tsx           # Página de perfil com formulário unificado de identidade
│   │   └── page.test.tsx
│   ├── security/
│   │   └── page.tsx
│   └── export/
│       └── page.tsx

components/
├── layout/
│   ├── sidebar.tsx            # Atualização para apontar "Perfil e Metas" para /goals
│   ├── sidebar.test.tsx
│   ├── user-nav.tsx           # Atualização com avatar visual e link para /settings/profile
│   └── user-nav.test.tsx
└── profile/
    ├── user-profile-identity-form.tsx      # Formulário unificado (avatar + nome com salvamento atômico)
    ├── user-profile-identity-form.test.tsx
    ├── financial-profile-form.tsx          # Formulário de metas financeiras
    └── financial-profile-form.test.tsx
```

## Implementation Phases

### Phase 1: Formulário Unificado de Identidade (`UserProfileIdentityForm`)
- Integrar seletor e preview de avatar diretamente no `UserProfileIdentityForm`.
- Gerenciar estado de rascunho para foto selecionada (`pendingAvatarFile`), remoção (`pendingAvatarRemove`) e edição de nome.
- Implementar verificação de sujeira (`isDirty`) para controlar o botão unificado "Salvar alterações".
- Garantir descarte seguro de URLs de objeto temporárias com `URL.revokeObjectURL`.
- Criar/atualizar testes unitários em `components/profile/user-profile-identity-form.test.tsx`.

### Phase 2: Rota Dedicada de Metas Financeiras (`/goals`)
- Criar a página `app/(dashboard)/goals/page.tsx` renderizando unicamente `FinancialProfileForm`.
- Remover a renderização do `FinancialProfileForm` de `app/(dashboard)/settings/profile/page.tsx`.
- Ajustar `app/(dashboard)/settings/profile/page.tsx` para renderizar apenas o formulário unificado de identidade.
- Criar testes unitários para a página `/goals` e atualizar os testes de `/settings/profile`.

### Phase 3: Atualização da Navegação (`Sidebar` e `UserNav`)
- Atualizar `components/layout/sidebar.tsx` para apontar o item "Perfil e Metas" para `/goals`.
- Atualizar `components/layout/user-nav.tsx` para exibir o avatar do usuário com fallback de iniciais e redirecionar ao clicar para `/settings/profile`.
- Atualizar testes de `sidebar.test.tsx` e `user-nav.test.tsx`.

### Phase 4: Validação Integrada e Homologação
- Executar suíte completa de testes (`pnpm test`).
- Executar checagem estrita de tipos TypeScript (`pnpm typecheck`).
- Executar linter (`pnpm lint`).
- Validar cenários do `quickstart.md`.
