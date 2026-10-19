# Tasks: Gestão de Transações Financeiras com Upload e Categorização Inteligente

**Branch**: `002-transactions-management` | **Date**: 2026-10-19 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Este documento estabelece o plano detalhado e sequencial de tarefas atômicas para implementação da funcionalidade de Gestão de Transações, organizado estritamente por fases e histórias de usuário (User Stories).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização de utilitários de formatação e estrutura de diretórios para a feature de transações

- [X] T001 Criar estrutura de diretórios para a feature de transações em `components/transactions/` e arquivos base
- [X] T002 Implementar utilitários puros de formatação em `lib/formatters.ts` (`formatCurrencyBRL`, `formatDateBR`, `getCurrentYearMonth`, `shiftYearMonth`)
- [X] T003 [P] Criar testes unitários para os formatadores em `lib/formatters.test.ts` e validar execução com Vitest

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Camada base de validações Zod e hooks de dados com TanStack Query que bloqueiam todas as User Stories

**⚠️ CRITICAL**: Nenhuma User Story pode ser iniciada antes da conclusão e validação desta fase foundational.

- [X] T004 Implementar esquemas de validação Zod e utilitários de checagem de arquivos em `lib/validations/transaction.ts` (validação de extensão `.ofx` ou `.csv`, limite de 10MB `file.size <= 10 * 1024 * 1024`, e schema de edição `updateTransactionSchema` com `cleanDescription` min 1 char e `category` canônica)
- [X] T005 [P] Criar testes unitários de validação de arquivos e schema Zod em `lib/validations/transaction.test.ts`
- [X] T006 Implementar hook base de consulta de transações com TanStack Query em `hooks/use-transactions.ts` suportando filtros `month` (`YYYY-MM`), `category` e `source` e chave de cache `['transactions', { month, category, source }]`
- [X] T007 [P] Criar testes automatizados para `useTransactions` em `hooks/use-transactions.test.tsx` com cenários de carregamento, sucesso e erro HTTP

**Checkpoint**: Base foundational pronta — a implementação das User Stories pode iniciar sequencialmente ou em paralelo.

---

## Phase 3: User Story 1 - Visualização e Filtragem Dinâmica de Transações (Priority: P1) 🎯 MVP

**Goal**: Permitir ao usuário autenticado visualizar todas as suas movimentações financeiras com ordenação cronológica decrescente, formatação monetária em Real (receitas em verde, despesas padrão/vermelho), badges das 9 categorias canônicas e origens (`OFX`, `CSV`, `SEED`), além de filtros dinâmicos por mês de competência (`YYYY-MM`), categoria e origem.

**Independent Test**: Acessar `/transactions`, alterar o mês selecionado, aplicar filtro de categoria (ex: "Alimentação") e origem (ex: "OFX") e verificar se a listagem reflete exatamente as transações correspondentes com empty states adequados.

### Tests for User Story 1 ⚠️

- [X] T008 [P] [US1] Criar testes de componente para a barra de filtros em `components/transactions/transaction-filters.test.tsx`
- [X] T009 [P] [US1] Criar testes de componente para a tabela de transações em `components/transactions/transaction-table.test.tsx`

### Implementation for User Story 1

- [X] T010 [P] [US1] Implementar componente de barra de filtros em `components/transactions/transaction-filters.tsx` com seletor de mês (`YYYY-MM`) com botões de avanço/recuo, dropdown das 9 categorias canônicas e dropdown de origens
- [X] T011 [US1] Implementar tabela de transações responsiva em `components/transactions/transaction-table.tsx` com ordenação cronológica decrescente, formatação BRL, badges de categoria e origem, e empty state amigável
- [X] T012 [US1] Integrar a página principal de transações em `app/(dashboard)/transactions/page.tsx` conectando `useTransactions`, `TransactionFilters` e `TransactionTable`
- [X] T013 [US1] Adicionar link ativo de navegação para a rota `/transactions` no menu do cabeçalho em `components/layout/navbar.tsx`

**Checkpoint**: User Story 1 (MVP) completamente funcional e testável de forma autônoma.

---

## Phase 4: User Story 2 - Importação de Extratos via Upload Drag-and-Drop (Priority: P2)

**Goal**: Permitir arrastar e soltar (drag-and-drop) ou selecionar um arquivo único de extrato bancário (.ofx ou .csv de até 10MB), validando no cliente antes do envio para `POST /api/transactions/upload`, e exibindo feedback com contagem de transações extraídas, importadas e duplicidades ignoradas, atualizando a listagem reativamente.

**Independent Test**: Arraste um arquivo inválido (>10MB ou .pdf) e comprove a rejeição local; arraste um arquivo válido (.ofx ou .csv), observe o envio, veja o card de resumo e comprove as novas transações na lista.

### Tests for User Story 2 ⚠️

- [X] T014 [P] [US2] Criar testes unitários para o hook de upload em `hooks/use-upload-transactions.test.tsx` cobrindo sucesso e tratamento de erros
- [X] T015 [P] [US2] Criar testes de componente para a zona de drag-and-drop em `components/transactions/transaction-dropzone.test.tsx` cobrindo eventos `onDrop`, validação client-side e rejeição de múltiplos arquivos

### Implementation for User Story 2

- [X] T016 [US2] Implementar hook de mutação multipart em `hooks/use-upload-transactions.ts` despachando `FormData` para `POST /api/transactions/upload` e invalidando `['transactions']` via TanStack Query
- [X] T017 [US2] Implementar componente de zona de soltura drag-and-drop em `components/transactions/transaction-dropzone.tsx` com suporte a arquivo único (`multiple: false`), animação visual ao arrastar e feedback de validação client-side
- [X] T018 [US2] Implementar componente de resumo de importação em `components/transactions/upload-summary-banner.tsx` exibindo total extraído, importados e duplicidades descartadas
- [X] T019 [US2] Integrar `TransactionDropzone` e `UploadSummaryBanner` na página `app/(dashboard)/transactions/page.tsx` com atualização automática da tabela

**Checkpoint**: User Stories 1 e 2 funcionam de forma integrada e independente.

---

## Phase 5: User Story 3 - Edição Manual de Descrição e Categoria da Transação (Priority: P3)

**Goal**: Permitir ao usuário editar individualmente uma transação via modal acessível (`Dialog`), alterando a descrição amigável e a categoria canônica via `PATCH /api/transactions/:id`, exibindo a descrição bancária original (`rawDescription`) como referência estática de auditoria.

**Independent Test**: Clicar em "Editar" em uma linha da tabela, alterar descrição e categoria no modal Dialog, salvar e verificar atualização imediata na tabela e fechamento do modal.

### Tests for User Story 3 ⚠️

- [X] T020 [P] [US3] Criar testes unitários para o hook de atualização em `hooks/use-update-transaction.test.tsx`
- [X] T021 [P] [US3] Criar testes de componente para o modal de edição em `components/transactions/transaction-edit-dialog.test.tsx` validando renderização de `rawDescription`, campos editáveis, validação e submissão

### Implementation for User Story 3

- [X] T022 [US3] Implementar hook de mutação pontual em `hooks/use-update-transaction.ts` enviando payload `UpdateTransactionDTO` para `PATCH /api/transactions/:id` com invalidação direcionada de cache
- [X] T023 [US3] Implementar componente de modal acessível em `components/transactions/transaction-edit-dialog.tsx` utilizando `components/ui/dialog.tsx`, exibindo `rawDescription` e `amount` como referência de auditoria e formulário para `cleanDescription` e `category`
- [X] T024 [US3] Integrar ação de edição na `TransactionTable` em `components/transactions/transaction-table.tsx`, conectando o botão da linha ao `TransactionEditDialog`

**Checkpoint**: User Stories 1, 2 e 3 plenamente operacionais.

---

## Phase 6: User Story 4 - Categorização Automática em Lote com Suporte BYOK (Priority: P4)

**Goal**: Disponibilizar botão de ação "Categorizar com IA" que dispara `POST /api/transactions/categorize` para processar globalmente todas as transações não categorizadas da conta, com tratamento integrado ao status da chave BYOK (`hasAiKey: false` abre `AiKeyModal`) e tratamento resiliente de erros 403, 429 e 503.

**Independent Test**: Com conta sem chave de IA, clicar no botão e verificar a abertura do modal BYOK sem requisição à API; com chave de IA, clicar e verificar loading, toast de resultado (estabelecimentos analisados e atualizados) e sincronização da tabela.

### Tests for User Story 4 ⚠️

- [X] T025 [P] [US4] Criar testes unitários para o hook de categorização em `hooks/use-categorize-transactions.test.tsx` cobrindo sucesso, guarda de `hasAiKey: false` e erros 429/503
- [X] T026 [P] [US4] Criar testes de componente para o botão de categorização em `components/transactions/categorize-button.test.tsx`

### Implementation for User Story 4

- [X] T027 [US4] Implementar hook de categorização em lote em `hooks/use-categorize-transactions.ts` integrando verificação de `hasAiKey`, disparo para `POST /api/transactions/categorize`, invalidação global de `['transactions']` e tratamento de erros (403, 429, 503)
- [X] T028 [US4] Implementar componente de botão de ação em `components/transactions/categorize-button.tsx` exibindo estado de loading, atalho para modal BYOK caso a chave não esteja configurada, e feedback via toast
- [X] T029 [US4] Integrar `CategorizeButton` no cabeçalho da página de transações em `app/(dashboard)/transactions/page.tsx`

**Checkpoint**: Todas as histórias de usuário implementadas e integradas.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificação global de qualidade, conformidade com os princípios constitucionais e roteiro de validação

- [X] T030 [P] Executar bateria completa de testes automatizados via `pnpm test` e corrigir eventuais regressões
- [X] T031 Executar verificação de tipos estritos TypeScript via `pnpm typecheck` (`tsc --noEmit`) assegurando zero `any`
- [X] T032 [P] Executar checagem de estilo e linting via `pnpm lint`
- [X] T033 Executar validação prática de ponta a ponta dos cenários descritos em `specs/002-transactions-management/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup (T001-T003)
       │
       ▼
Phase 2: Foundational (T004-T007)
       │
       ├───────────────────────────────┬───────────────────────────────┬───────────────────────────────┐
       ▼                               ▼                               ▼                               ▼
Phase 3: US1 (T008-T013) 🎯 MVP  Phase 4: US2 (T014-T019)        Phase 5: US3 (T020-T024)        Phase 6: US4 (T025-T029)
       │                               │                               │                               │
       └───────────────────────────────┴───────────────────────────────┴───────────────────────────────┘
                                                       │
                                                       ▼
                                        Phase 7: Polish (T030-T033)
```

- **Setup (Phase 1)**: Sem dependências — inicia imediatamente.
- **Foundational (Phase 2)**: Depende do Setup. Bloqueia todas as User Stories.
- **User Stories (Phases 3-6)**: Todas dependem da conclusão da Phase 2. Podem ser executadas em sequência de prioridade (P1 → P2 → P3 → P4) ou paralelizadas.
- **Polish (Phase 7)**: Executada após a conclusão das User Stories desejadas.

---

## Parallel Opportunities

- **Phase 1**: `T003` pode rodar em paralelo aos formatadores.
- **Phase 2**: `T005` e `T007` podem ser desenvolvidos em paralelo após `T004` e `T006`.
- **Phase 3 (US1)**: Testes `T008` e `T009` podem ser escritos em paralelo; `T010` e `T011` são componentes isolados.
- **Phase 4 (US2)**: Testes `T014` e `T015` podem rodar em paralelo; `T016` e `T017` em arquivos distintos.
- **Phase 5 (US3)**: Testes `T020` e `T021` podem rodar em paralelo.
- **Phase 6 (US4)**: Testes `T025` e `T026` podem rodar em paralelo.
- **Phase 7**: `T030` (`pnpm test`) e `T032` (`pnpm lint`) podem ser disparados simultaneamente.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Concluir Phase 1 (Setup) e Phase 2 (Foundational).
2. Concluir Phase 3 (User Story 1 - Visualização e Filtros).
3. **STOP e VALIDAR**: Testar a listagem e filtros em `/transactions`. A aplicação já entrega valor de auditoria de extratos pré-existentes.

### Entrega Incremental
1. Base pronta + MVP (US1) entregue.
2. Adicionar US2 (Upload de Extratos Drag-and-Drop) → Testar e homologar importação de arquivos reais.
3. Adicionar US3 (Edição Manual via Dialog) → Testar retificação de categorias e descrições.
4. Adicionar US4 (Categorização em Lote por IA com BYOK) → Testar rotina inteligente e resiliência de chaves.
5. Executar Phase 7 (Portões de qualidade `pnpm test`, `pnpm typecheck`, `pnpm lint`).
