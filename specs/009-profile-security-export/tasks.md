# Tasks: Perfil de Usuário, Segurança (Google Auth) e Central de Exportação

**Input**: Design documents from `/specs/009-profile-security-export/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Phase 1: Foundational (Tipagem, Schemas Zod e Utilitários de Domínio)

- [x] T001 [P] Estender entidades `UserProfileResponse`, `UserSecuritySettings` e DTOs em `src/types/api.ts`
- [x] T002 [P] Criar schemas Zod para validação de nome e avatar (tamanho <= 5MB e formatos de imagem) em `lib/validations/profile.ts`
- [x] T003 [P] Implementar utilitário puro `generateCsvTransactions` em `lib/export-utils.ts` com testes em `lib/export-utils.test.ts`

---

## Phase 2: User Story 1 - Gerenciamento de Identidade, Nome e Foto de Perfil (Priority: P1) 🎯 MVP

**Goal**: Permitir que o usuário visualize seus dados, altere o nome e faça upload, preview e exclusão do seu avatar.

- [x] T004 [P] [US1] Adicionar testes unitários para métodos de atualização de nome e avatar no hook `useUserProfile` em `hooks/use-user-profile.test.tsx`
- [x] T005 [US1] Implementar métodos `updateName`, `uploadAvatar` e `deleteAvatar` com invalidação do TanStack Query em `hooks/use-user-profile.ts`
- [x] T006 [P] [US1] Criar componente de avatar interativo `UserAvatarUploader` com suporte a preview e exclusão segura em `components/profile/user-avatar-uploader.tsx`
- [x] T007 [US1] Criar formulário de dados cadastrais `UserProfileIdentityForm` e integrá-lo com a aba de perfil em `components/profile/user-profile-identity-form.tsx` e `app/(dashboard)/settings/profile/page.tsx`
- [x] T008 [US1] Criar testes unitários e de integração para `UserAvatarUploader` e `UserProfileIdentityForm` em `components/profile/user-avatar-uploader.test.tsx` e `components/profile/user-profile-identity-form.test.tsx`

---

## Phase 3: User Story 2 - Segurança de Sessão e Encerramento Seguro (Priority: P1) 🎯 MVP

**Goal**: Permitir ao usuário gerenciar a segurança da conta e encerrar sua sessão com segurança.

- [x] T009 [US2] Criar aba de segurança em `app/(dashboard)/settings/security/page.tsx` com botão de ação "Sair da Sessão" (Logout) seguro
- [x] T010 [US2] Criar testes unitários para `SecuritySettingsPage` em `app/(dashboard)/settings/security/page.test.tsx`

---

## Phase 4: User Story 3 - Vínculo de Conta Google (Priority: P2)

**Goal**: Permitir vincular e desvincular conta Google com trava de segurança para contas sem senha local.

- [x] T013 [P] [US3] Criar componente `ConnectedAccountsSection` em `components/security/connected-accounts-section.tsx` com botões de vínculo/desvinculação do Google e diálogo de bloqueio se `hasLocalPassword: false`
- [x] T014 [US3] Criar testes unitários e de integração para `ConnectedAccountsSection` em `components/security/connected-accounts-section.test.tsx`

---

## Phase 5: User Story 4 - Central de Exportação de Dados Financeiros (Priority: P2)

**Goal**: Disponibilizar central de exportação em CSV, XLSX e PDF com filtros de período, contas e categorias.

- [x] T015 [P] [US4] Criar hook `useExportTransactions` em `hooks/use-export-transactions.ts` gerenciando downloads de CSV, XLSX e PDF via Blob com feedback visual
- [x] T016 [P] [US4] Criar componente `TransactionExportCard` e tela `/settings/export` em `components/transactions/transaction-export-card.tsx` e `app/(dashboard)/settings/export/page.tsx`
- [x] T017 [US4] Criar testes para `useExportTransactions` e `TransactionExportCard` em `hooks/use-export-transactions.test.tsx` e `components/transactions/transaction-export-card.test.tsx`

---

## Phase 6: Polish & Verification

- [x] T018 Executar bateria completa de testes automatizados (`pnpm test`), verificação de tipos estritos (`pnpm typecheck`) e checagem de estilo e lint (`pnpm lint`)
