# Tasks: Perfil de Usuário, Segurança (2FA & Google Auth) e Central de Exportação

**Input**: Design documents from `/specs/009-profile-security-export/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Phase 1: Foundational (Tipagem, Schemas Zod e Utilitários de Domínio)

- [ ] T001 [P] Estender entidades `UserProfileResponse`, `UserSecuritySettings` e DTOs em `src/types/api.ts`
- [ ] T002 [P] Criar schemas Zod para validação de nome, avatar (tamanho <= 5MB e formatos de imagem) e 2FA em `lib/validations/profile.ts`
- [ ] T003 [P] Implementar utilitário puro `generateCsvTransactions` em `lib/export-utils.ts` com testes em `lib/export-utils.test.ts`

---

## Phase 2: User Story 1 - Gerenciamento de Identidade, Nome e Foto de Perfil (Priority: P1) 🎯 MVP

**Goal**: Permitir que o usuário visualize seus dados, altere o nome e faça upload, preview e exclusão do seu avatar.

- [ ] T004 [P] [US1] Adicionar testes unitários para métodos de atualização de nome e avatar no hook `useUserProfile` em `hooks/use-user-profile.test.tsx`
- [ ] T005 [US1] Implementar métodos `updateName`, `uploadAvatar` e `deleteAvatar` com invalidação do TanStack Query em `hooks/use-user-profile.ts`
- [ ] T006 [P] [US1] Criar componente de avatar interativo `UserAvatarUploader` com suporte a preview e exclusão segura em `components/profile/user-avatar-uploader.tsx`
- [ ] T007 [US1] Criar formulário de dados cadastrais `UserProfileIdentityForm` e integrá-lo com a aba de perfil em `components/profile/user-profile-identity-form.tsx` e `app/(dashboard)/settings/profile/page.tsx`
- [ ] T008 [US1] Criar testes unitários e de integração para `UserAvatarUploader` e `UserProfileIdentityForm` em `components/profile/user-avatar-uploader.test.tsx` e `components/profile/user-profile-identity-form.test.tsx`

---

## Phase 3: User Story 2 - Autenticação em Dois Fatores (2FA via E-mail) e Segurança de Sessão (Priority: P1) 🎯 MVP

**Goal**: Permitir ao usuário ativar e desativar o 2FA via e-mail e encerrar sua sessão com segurança.

- [ ] T009 [P] [US2] Criar hook `useTwoFactorAuth` em `hooks/use-two-factor-auth.ts` consumindo endpoints de 2FA e logout
- [ ] T010 [P] [US2] Criar modal OTP de 6 dígitos `TwoFactorSetupModal` com contagem regressiva e feedback em `components/security/two-factor-setup-modal.tsx`
- [ ] T011 [US2] Criar aba de segurança em `app/(dashboard)/settings/security/page.tsx` com switch de 2FA e botão de ação "Sair da Sessão" (Logout)
- [ ] T012 [US2] Criar testes unitários para `useTwoFactorAuth` e `TwoFactorSetupModal` em `hooks/use-two-factor-auth.test.tsx` e `components/security/two-factor-setup-modal.test.tsx`

---

## Phase 4: User Story 3 - Vínculo de Conta Google (Priority: P2)

**Goal**: Permitir vincular e desvincular conta Google com trava de segurança para contas sem senha local.

- [ ] T013 [P] [US3] Criar componente `ConnectedAccountsSection` em `components/security/connected-accounts-section.tsx` com botões de vínculo/desvinculação do Google e diálogo de bloqueio se `hasLocalPassword: false`
- [ ] T014 [US3] Criar testes unitários e de integração para `ConnectedAccountsSection` em `components/security/connected-accounts-section.test.tsx`

---

## Phase 5: User Story 4 - Central de Exportação de Dados Financeiros (Priority: P2)

**Goal**: Disponibilizar central de exportação em CSV, XLSX e PDF com filtros de período, contas e categorias.

- [ ] T015 [P] [US4] Criar hook `useExportTransactions` em `hooks/use-export-transactions.ts` gerenciando downloads de CSV, XLSX e PDF via Blob com feedback visual
- [ ] T016 [P] [US4] Criar componente `TransactionExportCard` e tela `/settings/export` em `components/transactions/transaction-export-card.tsx` e `app/(dashboard)/settings/export/page.tsx`
- [ ] T017 [US4] Criar testes para `useExportTransactions` e `TransactionExportCard` em `hooks/use-export-transactions.test.tsx` e `components/transactions/transaction-export-card.test.tsx`

---

## Phase 6: Polish & Verification

- [ ] T018 Executar bateria completa de testes automatizados (`pnpm test`), verificação de tipos estritos (`pnpm typecheck`) e checagem de estilo e lint (`pnpm lint`)
