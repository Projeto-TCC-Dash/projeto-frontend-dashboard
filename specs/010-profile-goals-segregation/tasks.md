# Tasks: Segregação de Metas Financeiras e Central de Perfil de Usuário

**Input**: Design documents from `/specs/010-profile-goals-segregation/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui-contracts.md](./contracts/ui-contracts.md)  
**Tests**: Automated tests with Vitest and React Testing Library required by project constitution (Princípio VII).

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4])
- Strict checklist format with exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definição de contratos e interfaces para o formulário unificado e navegação

- [X] T001 Create unified identity draft models and update API contracts in src/types/api.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Utilitários essenciais de validação de arquivo e coordenação de mutações

- [X] T002 [P] Implement avatar file validation utilities (5MB limit, JPEG/PNG/WebP types) in lib/validations/avatar.ts
- [X] T003 [P] Enhance profile mutation coordination in hooks/use-user-profile.ts to support atomic save of name and avatar

---

## Phase 3: User Story 1 - Ponto de Entrada Exclusivo para Metas e Perfil Financeiro (Priority: P1) 🎯 MVP

**Goal**: Criar rota dedicada `/goals` para metas financeiras e atualizar o item correspondente no menu lateral (`Sidebar`), desvinculando metas das configurações de conta.

**Independent Test**: Acessar o item "Perfil e Metas" no menu lateral do dashboard, verificar navegação para `/goals` e constatar que a página exibe unicamente o formulário de metas financeiras (`FinancialProfileForm`), sem abas de configurações ou dados cadastrais.

### Tests for User Story 1

- [X] T004 [P] [US1] Create unit tests for goals page rendering and financial profile form isolation in app/(dashboard)/goals/page.test.tsx
- [X] T005 [P] [US1] Update unit tests for sidebar navigation items and active states in components/layout/sidebar.test.tsx

### Implementation for User Story 1

- [X] T006 [US1] Implement dedicated goals page in app/(dashboard)/goals/page.tsx rendering exclusively FinancialProfileForm
- [X] T007 [US1] Update sidebar navigation item pointing "Perfil e Metas" to /goals in components/layout/sidebar.tsx

**Checkpoint**: User Story 1 funcional e testável de forma autônoma (MVP da segregação de metas).

---

## Phase 4: User Story 2 - Acesso à Área de Perfil e Conta ao Clicar no Nome/E-mail (Priority: P1) 🎯 MVP

**Goal**: Configurar o componente `UserNav` no cabeçalho para exibir visualmente o avatar e direcionar para `/settings/profile` ao ser clicado.

**Independent Test**: Clicar no identificador do usuário no cabeçalho superior e confirmar navegação para `/settings/profile`.

### Tests for User Story 2

- [X] T008 [P] [US2] Create unit tests for UserNav rendering avatar image, initials fallback, and navigation link in components/layout/user-nav.test.tsx

### Implementation for User Story 2

- [X] T009 [US2] Update UserNav component in components/layout/user-nav.tsx to render the user avatar with fallback, display name, and link to /settings/profile

**Checkpoint**: User Story 2 funcional - o cabeçalho é a âncora de entrada oficial para a conta do usuário.

---

## Phase 5: User Story 3 - Formulário Unificado de Identidade com Salvamento Conjunto (Priority: P1) 🎯 MVP

**Goal**: Unificar o seletor de foto de perfil (com preview local e opção de remoção) e a edição de nome em um único formulário com botão "Salvar alterações" atômico.

**Independent Test**: Na aba de identidade, selecionar uma nova imagem, alterar o nome de exibição e clicar em "Salvar alterações", confirmando que ambos são persistidos conjuntamente e refletidos no cabeçalho.

### Tests for User Story 3

- [X] T010 [P] [US3] Create comprehensive tests for unified identity form (preview, remove photo, name change, isDirty state, and submit) in components/profile/user-profile-identity-form.test.tsx
- [X] T011 [P] [US3] Update tests for profile settings page in app/(dashboard)/settings/profile/page.test.tsx

### Implementation for User Story 3

- [X] T012 [US3] Refactor UserProfileIdentityForm in components/profile/user-profile-identity-form.tsx into an integrated component with avatar preview, memory cleanup (URL.revokeObjectURL), and coordinated save
- [X] T013 [US3] Refactor profile settings page in app/(dashboard)/settings/profile/page.tsx to render exclusively the unified identity form, removing duplicate avatar cards and financial profile form

**Checkpoint**: User Story 3 funcional - salvamento unificado de identidade completo.

---

## Phase 6: User Story 4 - Centralização de Segurança, Sessão e Exportação na Área de Perfil (Priority: P2)

**Goal**: Garantir que as abas de "Segurança & Sessão" e "Central de Exportação" permaneçam coesas sob a navegação de configurações de perfil.

**Independent Test**: Navegar entre as abas "Informações de Identidade", "Segurança & Sessão" e "Central de Exportação" na área de perfil e validar funcionamento autônomo de cada aba.

### Tests for User Story 4

- [X] T014 [P] [US4] Update navigation tests for settings tabs in components/settings/settings-nav.test.tsx

### Implementation for User Story 4

- [X] T015 [US4] Review and refine SettingsNav labels and route indicators in components/settings/settings-nav.tsx and app/(dashboard)/settings/layout.tsx

**Checkpoint**: Todas as 4 User Stories integradas e operando sem vazamento de escopo.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validação de qualidade, conformidade com a Constituição e integridade da suíte de testes

- [X] T016 [P] Execute strict TypeScript typecheck (pnpm typecheck) and ensure zero any violations
- [X] T017 [P] Execute linter and code formatting check (pnpm lint)
- [X] T018 Run complete automated test suite (pnpm test) to verify 100% passing tests
- [X] T019 Execute manual validation scenarios from specs/010-profile-goals-segregation/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências - inicia imediatamente.
- **Foundational (Phase 2)**: Depende do Setup (Phase 1) - bloqueia implementação de stories.
- **User Story 1 (Phase 3)**: Depende de Phase 2.
- **User Story 2 (Phase 4)**: Depende de Phase 2 (pode rodar em paralelo com US1).
- **User Story 3 (Phase 5)**: Depende de Phase 2 e consome os utilitários de validação e tipos.
- **User Story 4 (Phase 6)**: Depende de Phase 5.
- **Polish (Phase 7)**: Depende de todas as stories concluídas.

### User Story Dependencies

- **US1 (Metas /goals)**: Independente de US2 e US3.
- **US2 (UserNav)**: Independente na renderização visual do cabeçalho.
- **US3 (Identidade Unificada)**: Independente em seu formulário de edição de perfil.
- **US4 (Abas de Configuração)**: Consolida a navegação das abas.

---

## Parallel Opportunities

- `T002` (validações) e `T003` (hooks) podem rodar em paralelo na Phase 2.
- Testes `T004` e `T005` podem rodar em paralelo com a implementação de US1.
- `T008` (testes UserNav) pode rodar em paralelo com `T010` (testes Formulário Unificado).
- Na Phase 7, checagem de tipos `T016` e lint `T017` podem rodar em paralelo.

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)
1. Completar Setup (Phase 1) e Foundational (Phase 2).
2. Implementar US1: isolar rota `/goals` e atualizar o Sidebar. Validar de forma independente.
3. Implementar US2: atualizar `UserNav` no cabeçalho como âncora de perfil.
4. Implementar US3: unificar o formulário de identidade (foto + nome) e limpar `/settings/profile`.
5. Validar US4 e executar testes integrados na Phase 7.
