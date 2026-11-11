# Tasks: Perfil de Usuário, Autenticação Social Google e Central de Exportação

**Input**: Design documents from `/specs/009-profile-security-export/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/profile-security-export-contracts.md`

**Organization**: Tarefas agrupadas por fases e por histórias de usuário para viabilizar implementação e testes independentes de cada entrega.

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

---

## Phase 1: Setup (Shared Infrastructure & Dependencies)

**Purpose**: Instalação de dependências externas e infraestrutura base de autenticação social Google.

- [X] T001 Instalar dependência `@react-oauth/google` para integração com Google Identity Services (GIS) em `package.json`
- [X] T002 [P] Adicionar configuração de ambiente `NEXT_PUBLIC_GOOGLE_CLIENT_ID` em `.env.example` e documentar chave de desenvolvimento em `.env.local`
- [X] T003 Envolver a aplicação com o provedor `GoogleOAuthProvider` no arquivo raiz `app/layout.tsx` consumindo `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID`

---

## Phase 2: Foundational (Tipagem Estrita e Schemas Zod)

**Purpose**: Contratos canônicos de tipos e validações que bloqueiam o desenvolvimento das histórias de usuário.

- [X] T004 [P] Estender entidades `UserProfileResponse`, `UserSecuritySettings`, `AvatarUploadResponse`, `GoogleAuthPayload`, `GoogleAuthResponse` e `ExportFilterParams` em `src/types/api.ts`
- [X] T005 [P] Criar e atualizar schemas Zod de perfil `updateUserProfileSchema` e validação de avatar (`file.size <= 5 * 1024 * 1024`, tipos `image/jpeg`, `image/png`, `image/webp`) em `lib/validations/profile.ts`
- [X] T006 [P] Criar schemas Zod de exportação `exportFiltersSchema` (`format: 'csv' | 'xlsx' | 'pdf'`, formato de mês `YYYY-MM` e regra `startDate <= endDate`) em `lib/validations/export.ts`
- [X] T007 [P] Desenvolver testes unitários para as regras de validação de perfil e exportação em `lib/validations/profile.test.ts` e `lib/validations/export.test.ts`

**Checkpoint**: Base de tipagem e validações concluída — início do desenvolvimento das histórias de usuário.

---

## Phase 3: User Story 1 - Gerenciamento de Identidade, Nome e Foto de Perfil (Priority: P1) 🎯 MVP

**Goal**: Permitir que a pessoa usuária visualize seus dados cadastrais, altere seu nome de exibição (`PATCH /api/user/profile`) e faça upload/exclusão de avatar (`POST /api/user/avatar`, `DELETE /api/user/avatar`) com pré-visualização instantânea e sincronização no cabeçalho.

**Independent Test**: Acessar `/settings/profile`, alterar o nome e fazer upload de imagem até 5MB, confirmando o preview imediato e o salvamento conjunto; em seguida, clicar em remover foto e validar o retorno ao fallback de iniciais.

### Tests for User Story 1 ⚠️

- [X] T008 [P] [US1] Criar testes unitários para o hook `useUserProfile` cobrindo consulta, `updateName`, `uploadAvatar` e `deleteAvatar` em `hooks/use-user-profile.test.tsx`
- [X] T009 [P] [US1] Criar testes unitários para o componente `UserAvatarUploader` cobrindo preview, upload e diálogo de exclusão em `components/profile/user-avatar-uploader.test.tsx`
- [X] T010 [P] [US1] Criar testes de integração para o formulário unificado `UserProfileIdentityForm` em `components/profile/user-profile-identity-form.test.tsx`

### Implementation for User Story 1

- [X] T011 [US1] Implementar métodos `updateName` (`PATCH /api/user/profile`), `uploadAvatar` (`POST /api/user/avatar` multipart/form-data) e `deleteAvatar` (`DELETE /api/user/avatar`) no hook `hooks/use-user-profile.ts`
- [X] T012 [US1] Implementar componente `UserAvatarUploader` com suporte a preview instantâneo via `URL.createObjectURL`, descarte de memória via `URL.revokeObjectURL` e diálogo modal de remoção em `components/profile/user-avatar-uploader.tsx`
- [X] T013 [US1] Integrar salvamento atômico de nome e foto de perfil no componente unificado `components/profile/user-profile-identity-form.tsx`
- [X] T014 [US1] Integrar o formulário de identidade na página de configurações de perfil em `app/(dashboard)/settings/profile/page.tsx`
- [X] T015 [US1] Sincronizar reativamente o avatar e nome atualizados no componente de cabeçalho `components/layout/user-nav.tsx`

**Checkpoint**: User Story 1 funcional e testável de forma independente.

---

## Phase 4: User Story 2 - Login Social com Google na Tela de Entrada (Priority: P1) 🎯 MVP

**Goal**: Disponibilizar o botão oficial "Entrar com o Google" na tela `/login`, enviando `{ idToken }` para `POST /api/auth/google`, redirecionando ao dashboard em caso de sucesso e exibindo banner amigável caso a conta não esteja vinculada (401/404).

**Independent Test**: Na tela `/login`, clicar em "Entrar com o Google". Com conta Google não vinculada, verificar o banner orientando a entrar com e-mail/senha; com conta vinculada, verificar autenticação com persistência de token e redirecionamento.

### Tests for User Story 2 ⚠️

- [X] T016 [P] [US2] Criar testes unitários para o hook `useGoogleLogin` cobrindo sucesso, cancelamento de popup e erro 401/404 de conta não vinculada em `hooks/use-google-login.test.tsx`
- [X] T017 [P] [US2] Criar testes unitários para o componente `GoogleLoginButton` em `components/auth/google-login-button.test.tsx`

### Implementation for User Story 2

- [X] T018 [US2] Criar custom hook `useGoogleLogin` com handshake GIS consumindo `POST /api/auth/google` e tratando erros 401/404 em `hooks/use-google-login.ts`
- [X] T019 [US2] Implementar componente `GoogleLoginButton` com logotipo oficial SVG, acessibilidade e estados de loading em `components/auth/google-login-button.tsx`
- [X] T020 [US2] Integrar o botão `GoogleLoginButton` e o divisor visual ("ou continue com e-mail") no formulário `components/auth/login-form.tsx`

**Checkpoint**: User Story 2 funcional e testável na tela de login.

---

## Phase 5: User Story 3 - Vínculo e Desvinculação de Conta Google no Perfil de Segurança (Priority: P2)

**Goal**: Permitir ao usuário autenticado vincular sua conta Google (`POST /api/auth/google/link` com `{ idToken }`) e desvinculá-la (`DELETE /api/auth/google/unlink`), aplicando guarda contra lockout quando `hasLocalPassword: false`.

**Independent Test**: Na aba `/settings/security`, clicar em "Conectar Conta Google" para vincular e confirmar status "Conectado". Tentar desvincular sem senha local e validar bloqueio com aviso; com senha local, confirmar desvinculação após diálogo.

### Tests for User Story 3 ⚠️

- [X] T021 [P] [US3] Criar testes unitários para o hook `useGoogleAuth` cobrindo mutações de link e unlink em `hooks/use-google-auth.test.tsx`
- [X] T022 [P] [US3] Criar testes unitários para o componente `ConnectedAccountsSection` cobrindo fluxo de conexão, conflito 409 e guarda de bloqueio em `components/security/connected-accounts-section.test.tsx`

### Implementation for User Story 3

- [X] T023 [US3] Refinar custom hook `useGoogleAuth` para envio de `{ idToken }` no link e tratamento de 409 Conflict em `hooks/use-google-auth.ts`
- [X] T024 [US3] Implementar seção de contas conectadas `ConnectedAccountsSection` com diálogo de desvinculação e guarda contra bloqueio de conta em `components/security/connected-accounts-section.tsx`
- [X] T025 [US3] Integrar a seção `ConnectedAccountsSection` na aba de segurança em `app/(dashboard)/settings/security/page.tsx`

**Checkpoint**: User Story 3 funcional com segurança em camadas.

---

## Phase 6: User Story 4 - Central de Exportação de Dados Financeiros (CSV, XLSX e PDF) (Priority: P2)

**Goal**: Disponibilizar tela e cards de exportação em `/settings/export` consumindo `GET /api/transactions/export?format=csv|xlsx|pdf` com filtros de mês, datas, conta e categoria e download nativo com `Content-Disposition`.

**Independent Test**: Na tela `/settings/export`, selecionar filtros e acionar download em CSV, XLSX e PDF, validando o download do arquivo binário/texto com nomenclatura adequada e feedback de carregamento.

### Tests for User Story 4 ⚠️

- [X] T026 [P] [US4] Criar testes unitários para o hook `useExportTransactions` em `hooks/use-export-transactions.test.tsx`
- [X] T027 [P] [US4] Criar testes unitários para o componente `TransactionExportCard` em `components/transactions/transaction-export-card.test.tsx`

### Implementation for User Story 4

- [X] T028 [US4] Criar hook `useExportTransactions` consumindo `GET /api/transactions/export`, processando Blobs binários, extraindo nome do header `Content-Disposition` e liberando memória com `URL.revokeObjectURL` em `hooks/use-export-transactions.ts`
- [X] T029 [US4] Criar componente `TransactionExportCard` com seletores de formato, filtros de período, conta bancária, categoria e botão com estado `isPending` em `components/transactions/transaction-export-card.tsx`
- [X] T030 [US4] Criar a página de configurações de exportação em `app/(dashboard)/settings/export/page.tsx`
- [X] T031 [US4] Adicionar link da aba "Central de Exportação" no menu de navegação de configurações em `components/settings/settings-nav.tsx`

**Checkpoint**: User Story 4 funcional com download de extratos financeiros nos três formatos.

---

## Phase 7: User Story 5 - Encerramento Seguro de Sessão (Logout) (Priority: P3)

**Goal**: Fornecer ação de logout seguro, destruindo tokens no cliente e redirecionando para a rota de login pública.

**Independent Test**: Clicar no botão "Sair da Sessão" em `/settings/security` ou no menu de usuário e validar a limpeza de tokens e redirecionamento para `/login`.

- [X] T032 [US5] Assegurar a ação de logout seguro com destruição de tokens no `localStorage` e redirecionamento para `/login` no card de sessão em `app/(dashboard)/settings/security/page.tsx`
- [X] T033 [US5] Adicionar testes unitários para a ação de logout seguro em `app/(dashboard)/settings/security/page.test.tsx`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de qualidade geral, execução da suíte completa de testes, validação estática de tipagem e verificação dos cenários do quickstart.

- [X] T034 [P] Executar bateria completa de testes automatizados com Vitest (`pnpm test`) garantindo 100% de aprovação em todos os arquivos de teste
- [X] T035 [P] Executar checagem estrita de tipos com TypeScript (`pnpm typecheck`) garantindo zero erros e zero uso de `any`
- [X] T036 Executar validação de formatação e linting com `pnpm lint` e `pnpm format`
- [X] T037 Validar cenários de ponta a ponta conforme o guia `specs/009-profile-security-export/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode ser iniciada imediatamente.
- **Foundational (Phase 2)**: Depende do Setup — bloqueia as histórias de usuário.
- **User Stories (Phase 3 a 7)**: Dependem da conclusão da Phase 2 (Foundational).
  - US1 (Identidade/Avatar) e US2 (Login Social Google) são P1 e podem ser desenvolvidas em paralelo.
  - US3 (Vínculo Google) e US4 (Exportação) são P2 e dependem da base estabelecida em US1 e US2.
  - US5 (Logout) é P3.
- **Polish (Phase 8)**: Depende da conclusão de todas as histórias desejadas.

### Parallel Opportunities

- Tarefas marcadas com `[P]` operam em arquivos isolados sem colisão de escrita:
  - Phase 1: `T002` pode rodar em paralelo.
  - Phase 2: `T004`, `T005`, `T006` e `T007` podem rodar em paralelo.
  - Phase 3: Testes `T008`, `T009` e `T010` podem ser criados em paralelo.
  - Phase 4: Testes `T016` e `T017` podem ser criados em paralelo.
  - Phase 5: Testes `T021` e `T022` podem ser criados em paralelo.
  - Phase 6: Testes `T026` e `T027` podem ser criados em paralelo.
  - Phase 8: `T034` e `T035` podem rodar simultaneamente.

---

## Implementation Strategy (MVP First)

1. **Passo 1 (Foundational)**: Concluir Phase 1 e Phase 2 (`@react-oauth/google`, tipagens em `api.ts`, schemas Zod).
2. **Passo 2 (MVP Identidade)**: Implementar Phase 3 (User Story 1 - Avatar e Perfil). Testar e validar.
3. **Passo 3 (MVP Autenticação Social)**: Implementar Phase 4 (User Story 2 - Login com Google). Testar e validar.
4. **Passo 4 (Governança e Portabilidade)**: Implementar Phase 5 (User Story 3 - Vínculo Google) e Phase 6 (User Story 4 - Central de Exportação).
5. **Passo 5 (Fechamento e Estabilização)**: Implementar Phase 7 (Logout) e Phase 8 (Bateria total de testes e conformidade técnica).
