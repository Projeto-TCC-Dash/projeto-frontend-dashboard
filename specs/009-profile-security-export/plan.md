# Implementation Plan: Perfil de Usuário, Segurança (2FA & Google Auth) e Central de Exportação

**Branch**: `feature/009-profile-security-export` | **Spec**: [spec.md](./spec.md)

## Summary

Implementar a aba completa de **Perfil de Usuário (Identidade, Nome e Avatar com upload/exclusão)**, **Segurança em Camadas (2FA via e-mail, vínculo com Google e Logout seguro)** e **Central de Exportação de Dados Financeiros (CSV, XLSX e PDF formatados)** no `projeto-frontend-dashboard`.

## Technical Context

- **Stack**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, Shadcn, TanStack Query v5.
- **Roteamento**: Shell de configurações em `/settings` com abas dedicadas:
  - `/settings/profile`: Dados pessoais, avatar e perfil financeiro voluntário.
  - `/settings/security`: Autenticação em dois fatores (2FA), contas conectadas (Google) e encerramento de sessão.
  - `/settings/export`: Central de exportação de dados com filtros e download de relatórios.
- **Armazenamento e Estado**: TanStack Query com invalidação de chaves `['userProfile']`, `['auth']` e `['transactions']`.

## Constitution Check

- [x] **I. TypeScript Estrito & Zero `any`**: Todas as novas entidades e DTOs tipados estritamente com TypeScript e Zod em `src/types/api.ts` e `lib/validations/`.
- [x] **II. Clean Code & SRP**: Lógica de rede isolada em custom hooks (`useUserProfile`, `useTwoFactorAuth`, `useExportTransactions`). Componentes focados exclusivamente em interface e acessibilidade.
- [x] **V. TanStack Query Reativo**: Mutação de perfil, avatar e 2FA disparam invalidação explícita de queries.
- [x] **VI. Segurança e Privacidade**: Validação rigorosa de extensões de arquivo e tamanho (até 5MB) no cliente; tokens limpos com segurança no logout.
- [x] **VII. Testes Automatizados Obrigatórios**: Cobertura de 100% dos novos hooks e componentes com Vitest e Testing Library (`pnpm test`).

## Implementation Phases

### Phase 1: Tipagem e Validações
- Atualizar `src/types/api.ts` com `UserSecuritySettings`, `UpdateUserProfileDTO`, DTOs de 2FA e parâmetros de exportação.
- Criar schemas Zod em `lib/validations/profile-security.ts` e `lib/validations/export.ts`.

### Phase 2: Módulo de Perfil e Avatar (US1)
- Criar componente de Avatar interativo com preview, botão de upload, seletor de arquivo e diálogo de confirmação de exclusão.
- Criar formulário de edição de nome de exibição.
- Adicionar hook `useUpdateProfile` e `useAvatarUpload`.

### Phase 3: Segurança, 2FA via E-mail e Google Auth (US2 & US3)
- Criar hook `useTwoFactorAuth` com mutações para solicitar código, confirmar ativação e desativar.
- Criar modal de validação OTP de 6 dígitos com timer regressivo e botão de reenvio.
- Criar card de contas conectadas com fluxo de Google OAuth e trava de segurança para contas sem senha local.
- Integrar ação explícita de encerramento de sessão (Logout) seguro.

### Phase 4: Central de Exportação de Dados (US4)
- Criar tela/aba `/settings/export` com seletores de período, conta bancária e categoria.
- Implementar utilitário de geração de CSV client-side com BOM UTF-8 e serviço de download de arquivos binários (XLSX e PDF).
- Criar hook `useExportTransactions` com indicador de progresso e feedback visual via toast.

### Phase 5: Testes e Validação de Qualidade
- Desenvolver testes unitários para os novos componentes, hooks e utilitários.
- Validar suíte completa com `pnpm test`, `pnpm typecheck` e `pnpm lint`.
