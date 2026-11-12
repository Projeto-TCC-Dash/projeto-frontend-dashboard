# Tasks: Perfil de Investidor e Metas (/settings/metas)

**Input**: Design documents from `/specs/011-settings-metas-profile/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui-contracts.md](./contracts/ui-contracts.md)  
**Tests**: Automated tests with Vitest and React Testing Library required by project constitution (Princípio VII).

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Strict checklist format with exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificação de contratos e rotas para suporte a `/settings/metas`

- [X] T001 Setup and verify route constants in src/types/api.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Isolamento de layout sob `/settings` para desacoplar `/settings/metas` das abas da conta

- [X] T002 [P] Create unit test for settings layout conditional isolation in app/(dashboard)/settings/layout.test.tsx
- [X] T003 Implement layout isolation in app/(dashboard)/settings/layout.tsx to omit SettingsNav and account header when on /settings/metas

---

## Phase 3: User Story 1 - Acesso ao Perfil de Investidor via `/settings/metas` (Priority: P1) 🎯 MVP

**Goal**: Criar a rota `/settings/metas` com o formulário de perfil de investidor e metas patrimoniais, e atualizar o link no menu lateral (`Sidebar`).

**Independent Test**: Clicar em "Perfil e Metas" no menu lateral e confirmar que a aplicação abre `/settings/metas` exibindo unicamente o formulário de perfil de investidor (tolerância a risco, metas financeiras prioritárias, renda e regime de trabalho), sem abas de conta ou campos cadastrais.

### Tests for User Story 1

- [X] T004 [P] [US1] Create unit tests for /settings/metas page rendering exclusively investor profile and goals in app/(dashboard)/settings/metas/page.test.tsx
- [X] T005 [P] [US1] Update sidebar unit tests to assert "Perfil e Metas" points to /settings/metas in components/layout/sidebar.test.tsx

### Implementation for User Story 1

- [X] T006 [US1] Implement dedicated investor profile & goals page in app/(dashboard)/settings/metas/page.tsx
- [X] T007 [US1] Update SIDEBAR_ITEMS in components/layout/sidebar.tsx pointing "Perfil e Metas" to /settings/metas

**Checkpoint**: User Story 1 funcional e testável de forma autônoma.

---

## Phase 4: User Story 2 - Entrada em `/settings/profile` Restrita ao Clique no Nome/Avatar (Priority: P1) 🎯 MVP

**Goal**: Garantir que `/settings/profile` permaneça exclusivo para acesso via cabeçalho do usuário (`UserNav`).

**Independent Test**: Clicar no identificador de usuário no topo da tela e confirmar navegação direta para `/settings/profile` com o formulário de identidade unificado.

### Tests for User Story 2

- [X] T008 [P] [US2] Verify UserNav unit tests asserting exclusive navigation to /settings/profile in components/layout/user-nav.test.tsx

### Implementation for User Story 2

- [X] T009 [US2] Review and assert UserNav component in components/layout/user-nav.tsx exclusively links to /settings/profile

**Checkpoint**: User Story 2 validada e coesa com o fluxo da aplicação.

---

## Phase 5: User Story 3 - Coerência e Redirecionamento da Rota Anterior (Priority: P2)

**Goal**: Assegurar compatibilidade com links legados redirecionando `/goals` para `/settings/metas`.

**Independent Test**: Acessar `/goals` e constatar redirecionamento automático para `/settings/metas`.

### Tests for User Story 3

- [X] T010 [P] [US3] Update tests for /goals redirecting to /settings/metas in app/(dashboard)/goals/page.test.tsx

### Implementation for User Story 3

- [X] T011 [US3] Configure redirect to /settings/metas in app/(dashboard)/goals/page.tsx

**Checkpoint**: Todas as histórias integradas sem links quebrados.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de qualidade estrita e garantia de regressão zero

- [X] T012 [P] Execute strict TypeScript typecheck (pnpm typecheck)
- [X] T013 [P] Execute linter check (pnpm lint)
- [X] T014 Run complete automated test suite (pnpm test) to verify 100% pass rate
- [X] T015 Validate end-to-end scenarios from specs/011-settings-metas-profile/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências.
- **Foundational (Phase 2)**: Depende do Setup.
- **User Story 1 (Phase 3)**: Depende de Phase 2.
- **User Story 2 (Phase 4)**: Pode ser validada em paralelo com US1.
- **User Story 3 (Phase 5)**: Depende de US1 (`/settings/metas` criada).
- **Polish (Phase 6)**: Depende de todas as fases anteriores.

---

## Parallel Opportunities

- `T002` e `T004` podem ser desenvolvidos em paralelo com `T008`.
- `T012` (`typecheck`) e `T013` (`lint`) rodam em paralelo.

---

## Implementation Strategy

### MVP First (User Story 1)
1. Concluir Setup e Foundational (isolamento de layout).
2. Criar a página `/settings/metas` e atualizar o item da Sidebar.
3. Validar US1 de forma independente.
4. Validar US2 e redirecionamento de US3.
5. Executar suíte completa de testes.
