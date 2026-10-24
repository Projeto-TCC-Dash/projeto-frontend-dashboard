---
description: "Task list for feature 007 transactions extended deletion and categories"
---

# Tasks: Exclusão de Transações, 11 Categorias Canônicas e Associação de Contas

**Input**: Design documents from `/specs/007-transactions-extended-deletion-categories/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/transactions-extended-contract.json`  
**Tests**: Testes automatizados obrigatórios conforme Princípio VII da Constituição Técnica (Vitest + Testing Library).  
**Organization**: Tarefas agrupadas por User Story para possibilitar implementação e testes independentes de cada fatia.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Tarefa executável em paralelo (arquivos distintos, sem dependência mútua)
- **[Story]**: User Story à qual a tarefa pertence (US1, US2, US3, US4)
- Caminhos de arquivo exatos incluídos em cada tarefa

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definição de tipos canônicos de domínio e schemas de validação Zod

- [X] T001 [P] Atualizar tipos canônicos em `src/types/api.ts` expandindo `CANONICAL_CATEGORIES` para as 11 categorias canônicas (inclusão de `"Pagamento de Fatura"` e `"Investimentos"`), expandindo `Transaction` com campos opcionais `accountId?: string` e `account?: TransactionAccountSummary`, e atualizando `UpdateTransactionDTO` e `TransactionFilterParams` com suporte a `accountId`.
- [X] T002 [P] Atualizar schemas de validação Zod em `lib/validations/transaction.ts` expandindo `canonicalCategoryEnum` para validar as 11 categorias canônicas e atualizando `updateTransactionSchema` para aceitar `accountId: z.string().trim().nullable().optional()`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Testes unitários dos schemas, hook de mutação DELETE e suporte a conta nos hooks existentes

**⚠️ CRITICAL**: Nenhuma User Story visual deve começar antes de concluir esta fase.

- [X] T003 [P] Atualizar testes unitários dos schemas Zod em `lib/validations/transaction.test.ts` cobrindo as 11 categorias canônicas (incluindo `"Pagamento de Fatura"` e `"Investimentos"`) e validação de `accountId` (string válida, null para desvincular ou ausente).
- [X] T004 [P] Implementar custom hook de mutação `useDeleteTransaction` em `hooks/use-delete-transaction.ts` consumindo `DELETE /api/transactions/:id` com TanStack Query e disparando invalidação coordenada de `['transactions']`, `['accounts']` e `['analysis']`.
- [X] T005 [P] Criar testes automatizados para `useDeleteTransaction` em `hooks/use-delete-transaction.test.tsx` com Vitest cobrindo chamada HTTP DELETE com ID da transação, sucesso com invalidação de cache e tratamento de erro de rede.
- [X] T006 Atualizar hook `useTransactions` em `hooks/use-transactions.ts` para aceitar parâmetro opcional `accountId?: string`, repassando-o na query string e compondo a chave de cache `['transactions', { month, category, source, accountId }]`.
- [X] T007 [P] Atualizar testes automatizados de `useTransactions` em `hooks/use-transactions.test.tsx` cobrindo consultas com e sem o parâmetro `accountId`.
- [X] T008 Atualizar hook `useUploadTransactions` em `hooks/use-upload-transactions.ts` para suportar `accountId?: string` opcional e enviar como query param `POST /api/transactions/upload?accountId=<id>`.
- [X] T009 [P] Atualizar testes automatizados de `useUploadTransactions` em `hooks/use-upload-transactions.test.tsx` cobrindo upload de extrato com e sem `accountId`.

**Checkpoint**: Camada de dados, validações e hooks de mutação prontos.

---

## Phase 3: User Story 1 - Suporte Completo às 11 Categorias Canônicas Oficiais (Priority: P1) 🎯 MVP

**Goal**: Permitir ao usuário classificar, filtrar e identificar visualmente transações nas 11 categorias canônicas oficiais, com badges temáticos em Slate `#64748B` para "Pagamento de Fatura" e Ciano `#06B6D4` para "Investimentos".

**Independent Test**: Acessar `/transactions`, abrir o dropdown de filtros de categoria e conferir as 11 opções; editar uma transação para "Pagamento de Fatura" e verificar o badge Slate; editar outra para "Investimentos" e verificar o badge Ciano.

### Tests for User Story 1 ⚠️

- [X] T010 [P] [US1] Atualizar testes de componente da tabela em `components/transactions/transaction-table.test.tsx` verificando renderização dos novos badges de `"Pagamento de Fatura"` e `"Investimentos"`.
- [X] T011 [P] [US1] Atualizar testes de componente dos filtros em `components/transactions/transaction-filters.test.tsx` validando que as 11 categorias estão presentes no dropdown e emitem evento de alteração de filtro.

### Implementation for User Story 1

- [X] T012 [US1] Atualizar mapa de cores semânticas e renderização de badges de categoria em `components/transactions/transaction-table.tsx` para suportar as 11 categorias canônicas com estilos Slate para fatura e Ciano para investimentos.
- [X] T013 [US1] Atualizar dropdown de categorias em `components/transactions/transaction-filters.tsx` para exibir as 11 categorias canônicas oficiais.

**Checkpoint**: User Story 1 totalmente funcional e testável de forma independente.

---

## Phase 4: User Story 2 - Exclusão Pontual Atômica de Transações com Confirmação (Priority: P1) 🎯 MVP

**Goal**: Permitir a exclusão pontual de transações com diálogo modal de confirmação (`TransactionDeleteDialog` via `createPortal`), feedback toast e atualização reativa instantânea da listagem sem recarregamento de página.

**Independent Test**: Na tabela de transações, clicar no ícone de lixeira de uma linha; validar abertura do diálogo com dados do lançamento (descrição, data, valor em BRL); clicar em Cancelar e conferir permanência; reabrir e confirmar a exclusão, validando sumiço imediato da linha e notificação de sucesso.

### Tests for User Story 2 ⚠️

- [X] T014 [P] [US2] Criar testes automatizados do diálogo de confirmação em `components/transactions/transaction-delete-dialog.test.tsx` cobrindo renderização via Portal, exibição dos detalhes da transação, acionamento de Cancelar e disparo da mutação ao Confirmar com indicador de loading.

### Implementation for User Story 2

- [X] T015 [US2] Implementar componente `TransactionDeleteDialog` em `components/transactions/transaction-delete-dialog.tsx` utilizando `createPortal(..., document.body)`, mensagem de alerta sobre irreversibilidade, dados do lançamento, botão "Cancelar" e botão "Excluir" com loading state.
- [X] T016 [US2] Integrar o botão de exclusão (ícone de lixeira) e o modal `TransactionDeleteDialog` na coluna de ações de `components/transactions/transaction-table.tsx`, conectando o hook `useDeleteTransaction` com notificação toast de confirmação.

**Checkpoint**: User Stories 1 e 2 funcionando de forma independente e integrada.

---

## Phase 5: User Story 3 - Associação de Contas Financeiras no Upload e na Edição (Priority: P2)

**Goal**: Permitir vincular extratos bancários a uma conta no momento do upload no `TransactionDropzone` e alterar ou desvincular a conta de uma transação existente no `TransactionEditDialog`.

**Independent Test**: Acessar a área de upload de transações, selecionar uma conta existente no dropdown "Conta de Origem", enviar um arquivo `.ofx` ou `.csv` e verificar se as transações criadas trazem a identificação da conta; em seguida, abrir a edição de um lançamento e alterar a conta bancária vinculada.

### Tests for User Story 3 ⚠️

- [X] T017 [P] [US3] Atualizar testes do componente de upload em `components/transactions/transaction-dropzone.test.tsx` cobrindo renderização do seletor de contas (alimentado por `useAccounts`) e envio de `accountId` no upload.
- [X] T018 [P] [US3] Atualizar testes do modal de edição em `components/transactions/transaction-edit-dialog.test.tsx` cobrindo presença do campo de conta bancária e envio de `accountId` no formulário de edição.

### Implementation for User Story 3

- [X] T019 [US3] Atualizar componente `TransactionDropzone` em `components/transactions/transaction-dropzone.tsx` incluindo o seletor suspenso "Conta de Origem" alimentado por `useAccounts` com opção padrão "Sem conta vinculada / Padrão", repassando a conta selecionada para a chamada de upload.
- [X] T020 [US3] Atualizar componente `TransactionEditDialog` em `components/transactions/transaction-edit-dialog.tsx` incluindo o campo seletor de Conta Bancária alimentado por `useAccounts`, permitindo vincular, transferir ou desvincular a transação via `PATCH /api/transactions/:id`.

**Checkpoint**: User Stories 1, 2 e 3 operando de forma integrada.

---

## Phase 6: User Story 4 - Filtro por Conta Bancária e Apresentação Visual Integrada (Priority: P3)

**Goal**: Permitir ao usuário filtrar os lançamentos por conta bancária na barra de filtros e visualizar em cada linha da tabela uma coluna dedicada com badge estilizado da instituição/conta correspondente.

**Independent Test**: Na barra de filtros de `/transactions`, selecionar uma conta bancária e validar que a tabela exibe apenas lançamentos vinculados a ela; alternar para "Todas as Contas" e verificar restauração do total; verificar que cada linha exibe o indicador colorido e o nome da instituição.

### Tests for User Story 4 ⚠️

- [X] T021 [P] [US4] Atualizar testes dos filtros em `components/transactions/transaction-filters.test.tsx` cobrindo renderização do dropdown de contas e disparo do callback `onAccountChange`.
- [X] T022 [P] [US4] Atualizar testes da tabela em `components/transactions/transaction-table.test.tsx` validando renderização da coluna "Conta" com badge visual temático contendo ponto de cor da conta e nome da instituição.

### Implementation for User Story 4

- [X] T023 [US4] Atualizar barra de filtros `TransactionFilters` em `components/transactions/transaction-filters.tsx` adicionando dropdown seletor de Conta Bancária alimentado por `useAccounts` com valor inicial "Todas as Contas".
- [X] T024 [US4] Atualizar tabela `TransactionTable` em `components/transactions/transaction-table.tsx` para renderizar a coluna "Conta" exibindo badge com o indicador de cor da conta (`account.color`) e o nome (`account.name` / `account.institution`) ou traço neutro caso não vinculada.
- [X] T025 [US4] Atualizar página principal de transações em `app/(dashboard)/transactions/page.tsx` para orquestrar o estado de `selectedAccountId` conectando `TransactionFilters` e `TransactionTable` com o hook `useTransactions`.

**Checkpoint**: Todas as 4 User Stories da Feature 007 totalmente funcionais.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificação rigorosa de integridade estática, linter e suíte de testes completa

- [X] T026 [P] Executar checagem estrita de tipos TypeScript sem supressões via `pnpm typecheck`.
- [X] T027 [P] Executar validação de formatação e linting via `pnpm lint`.
- [X] T028 Executar suíte completa de testes automatizados com Vitest via `pnpm test`, assegurando 100% de aprovação em todos os testes novos e pré-existentes.
- [X] T029 Executar homologação manual do fluxo ponta a ponta seguindo o roteiro de verificação em `specs/007-transactions-extended-deletion-categories/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode iniciar imediatamente.
- **Foundational (Phase 2)**: Depende da conclusão da Phase 1 — BLOQUEIA todas as User Stories.
- **User Stories (Phases 3 a 6)**: Todas dependem da Phase 2 (Foundational) completa.
  - Sequência recomendada de execução: US1 (P1) → US2 (P1) → US3 (P2) → US4 (P3).
- **Polish (Phase 7)**: Depende de todas as User Stories estarem concluídas.

### User Story Dependencies

- **User Story 1 (P1)**: 11 Categorias Canônicas — pode iniciar imediatamente após a Phase 2.
- **User Story 2 (P1)**: Exclusão com confirmação — depende do hook `useDeleteTransaction` da Phase 2.
- **User Story 3 (P2)**: Vínculo de Conta no Upload e Edição — depende de `useAccounts` e `useUploadTransactions` atualizado.
- **User Story 4 (P3)**: Filtro por Conta e Coluna na Tabela — depende dos componentes de tabela e filtro alinhados com US1 e US3.

---

## Implementation Strategy

### MVP First (User Stories 1 e 2)
1. Completar Phase 1 (Setup de tipos e schemas Zod).
2. Completar Phase 2 (Foundational: testes de base, hook de exclusão, atualizações de hooks).
3. Completar Phase 3 (US1: 11 categorias nos badges e filtros).
4. Completar Phase 4 (US2: diálogo e ação de exclusão atômica).
5. **Checkpoint MVP**: A aplicação já suporta as 11 categorias e exclusão pontual com 100% dos testes verdes.
6. Em seguida, avançar para Phase 5 (US3: seleção de conta no upload/edição) e Phase 6 (US4: filtro por conta e coluna na tabela).
