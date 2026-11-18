# Tasks: Módulo Fiscal, Investimentos Dedicados e Planejamento Orçamentário

**Input**: Design documents from `/specs/015-fiscal-advisory-planning/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Format: `- [ ] [ID] [P?] [Story?] Description with exact file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Contratos de tipos canônicos e adição das novas rotas na navegação principal

- [X] T001 [P] Adicionar `APP_ROUTES.FISCAL` (`/fiscal`), `APP_ROUTES.INVESTMENTS` (`/investments`) e os tipos canônicos fiscais (`TAX_CATEGORIES`, `TAX_CATEGORY_LABELS`, `FISCAL_VERIFICATION_STATUSES`, `FISCAL_STATUS_LABELS`, `TransactionFiscalMetadata`, `UpdateTransactionFiscalDTO`, `FiscalAnnualSummary`, `FiscalOcrResponse`, `FiscalDossierFormat`), orçamentários (`BUDGET_CONSUMPTION_STATUSES`, `BudgetOverview`, `SetBudgetPlanDTO`) e multi-mês (`MultiMonthRange`, `FixedCostTrendStatus`, `MultiMonthAnalysisResponse`) em `src/types/api.ts`
- [X] T002 [P] Adicionar os destinos de navegação **Investimentos** (`/investments`) e **Fiscal** (`/fiscal`) em `components/layout/navbar.tsx` e `components/layout/sidebar.tsx`, atualizando os testes em `components/layout/navbar.test.tsx` e `components/layout/sidebar.test.tsx`

---

## Phase 2: Foundational (Schemas de Validação Zod)

**Purpose**: Regras determinísticas de validação client-side antes de construir hooks e formulários

**⚠️ CRITICAL**: Bloqueia os formulários de classificação fiscal, upload OCR e plano orçamentário

- [X] T003 [P] Criar testes unitários de validação fiscal (CPF/CNPJ com exatos 11 ou 14 dígitos após limpeza, `deductibleAmount > 0`, `providerName` 2–120 chars, `notes <= 250` chars, arquivo OCR `<= 10 MB` nos formatos PDF/JPG/PNG/WEBP) em `lib/validations/fiscal.test.ts`
- [X] T004 Criar schemas Zod fiscais (`updateTransactionFiscalSchema`, `validateFiscalOcrFile`) em `lib/validations/fiscal.ts`
- [X] T005 [P] Criar testes unitários de validação orçamentária (`totalLimitAmount > 0`, `categoryBudgets` mínimo 1 item com `limitAmount > 0`) em `lib/validations/budget.test.ts`
- [X] T006 Criar schemas Zod orçamentários (`setBudgetPlanSchema`) em `lib/validations/budget.ts`

**Checkpoint**: Tipos e validações base aprovados. As User Stories podem iniciar em paralelo.

---

## Phase 3: User Story 1 - Página Dedicada de Planejamento Fiscal na Navegação Principal (Priority: P1) 🎯 MVP

**Goal**: Entregar a tela dedicada `/fiscal` com resumo anual, classificação dedutível, OCR com conciliação, painel PJ/MEI, download de dossiê PDF/XLSX e aviso legal obrigatório

**Independent Test**: Acessar `/fiscal` pela barra de navegação, alternar o ano, classificar uma despesa, enviar recibo para OCR, verificar o teto PJ/MEI e acionar exportação PDF/XLSX

### Testes para User Story 1

- [X] T007 [P] [US1] Criar testes unitários para `useFiscalSummary`, `useUpdateTransactionFiscal`, `useUploadFiscalOcr` (incluindo fallback `403 AI_KEY_REQUIRED`) e `useExportFiscalDossier` (`Blob` + `Content-Disposition` + `URL.revokeObjectURL`) em `hooks/use-fiscal.test.tsx`
- [X] T009 [P] [US1] Criar testes unitários para os componentes fiscais (`FiscalLegalNotice`, `FiscalSummaryCards`, `FiscalPjPanel`, `FiscalOcrDropzone`, `FiscalExpensesList`, `FiscalEditDialog`) em `components/fiscal/fiscal-components.test.tsx`

### Implementação para User Story 1

- [X] T008 [US1] Implementar hooks fiscais (`useFiscalSummary`, `useUpdateTransactionFiscal`, `useUploadFiscalOcr`, `useExportFiscalDossier`) em `hooks/use-fiscal.ts`
- [X] T010 [P] [US1] Implementar `FiscalLegalNotice` (texto legal obrigatório FR-008) em `components/fiscal/fiscal-legal-notice.tsx` e `FiscalSummaryCards` em `components/fiscal/fiscal-summary-cards.tsx`
- [X] T011 [P] [US1] Implementar `FiscalPjPanel` (faturamento acumulado, barra de progresso frente ao teto referencial MEI R$ 81.000,00 com alerta visual `>= 80%`, pró-labore e dividendos) em `components/fiscal/fiscal-pj-panel.tsx`
- [X] T012 [US1] Implementar `FiscalOcrDropzone` (validação `<= 10 MB`, extração OCR, modal de conciliação com confiança `HIGH|MEDIUM|LOW` e fallback BYOK) em `components/fiscal/fiscal-ocr-dropzone.tsx`
- [X] T013 [US1] Implementar `FiscalEditDialog` em `components/fiscal/fiscal-edit-dialog.tsx` e `FiscalExpensesList` em `components/fiscal/fiscal-expenses-list.tsx`
- [X] T014 [US1] Implementar página dedicada `/fiscal` (seletor de ano, exportação PDF/XLSX, resumo anual, painel PJ, OCR, despesas e aviso legal permanente) em `app/(dashboard)/fiscal/page.tsx` e teste de integração em `app/(dashboard)/fiscal/page.test.tsx`

**Checkpoint**: Módulo Fiscal completo e navegável de forma independente.

---

## Phase 4: User Story 2 - Página Dedicada de Carteira de Investimentos na Navegação Principal (Priority: P1) 🎯 MVP

**Goal**: Entregar a tela dedicada `/investments` com gráfico proporcional das 6 macroclasses, diagnóstico de aderência ao perfil de risco, atualização de posições e evolução patrimonial

**Independent Test**: Acessar `/investments` pelo menu principal, verificar o DonutChart sincronizado ao ranking das macroclasses, ler o diagnóstico de risco e atualizar o saldo de uma macroclasse

### Testes para User Story 2

- [X] T015 [P] [US2] Criar testes unitários para o gráfico proporcional das macroclasses de ativos em `components/investments/investment-allocation-donut.test.tsx`

### Implementação para User Story 2

- [X] T016 [US2] Implementar `InvestmentAllocationDonut` (`DonutChart` + `BarList` sincronizado para as 6 macroclasses) em `components/investments/investment-allocation-donut.tsx`
- [X] T017 [US2] Criar página dedicada `/investments` integrando `InvestmentAllocationDonut`, `InvestmentPortfolioCard` (diagnóstico de risco + modal `PUT /api/investments/holdings`) e `InvestmentTimeSeriesChart` em `app/(dashboard)/investments/page.tsx` e testes em `app/(dashboard)/investments/page.test.tsx`
- [X] T018 [US2] Atualizar `app/(dashboard)/accounts/page.tsx` e `app/(dashboard)/accounts/page.test.tsx` adicionando atalho direto para `/investments` mantendo a gestão de contas limpa

**Checkpoint**: Experiência dedicada de Investimentos operacional e navegável.

---

## Phase 5: User Story 3 - Planejamento e Acompanhamento de Orçamentos Mensais (Priority: P2)

**Goal**: Exibir widget "Orçamentos do Mês" no dashboard principal com barras coloridas (`< 70%` verde, `70–99,9%` amarelo, `>= 100%` vermelho) e modal de definição/edição de tetos

**Independent Test**: Visualizar o card no dashboard com orçamento vazio ou preenchido, abrir o modal de configuração de tetos e verificar a atualização das barras de progresso por categoria

### Testes para User Story 3

- [X] T019 [P] [US3] Criar testes unitários para `useBudget` (tratando HTTP `404` como `budget: null` sem erro) e `useUpsertBudget` em `hooks/use-budgets.test.tsx`
- [X] T021 [P] [US3] Criar testes unitários para `MonthlyBudgetCard` e `BudgetFormDialog` validando faixas semânticas (`REGULAR`, `WARNING`, `EXCEEDED`) e estado vazio em `components/dashboard/monthly-budget-card.test.tsx`

### Implementação para User Story 3

- [X] T020 [US3] Implementar `useBudget` e `useUpsertBudget` em `hooks/use-budgets.ts`
- [X] T022 [US3] Implementar `BudgetFormDialog` em `components/dashboard/budget-form-dialog.tsx` e `MonthlyBudgetCard` em `components/dashboard/monthly-budget-card.tsx`
- [X] T023 [US3] Integrar `MonthlyBudgetCard` no dashboard principal em `app/(dashboard)/page.tsx` e atualizar testes em `app/(dashboard)/page.test.tsx`

**Checkpoint**: Planejamento orçamentário mensal funcional no dashboard.

---

## Phase 6: User Story 4 - Análise Multi-Mês Consolidada e Sinergia Contextual com o Consultor (Priority: P3)

**Goal**: Integrar métricas de tendência do servidor (`GET /api/analysis/multi-month?range=3|6|12`) ao gráfico histórico (`3M | 6M | 12M | Tudo`) e enriquecer sugestões do consultor virtual

**Independent Test**: Alternar janelas `3M`, `6M` e `12M` visualizando média de poupança, média de despesas e tendência de custos fixos; abrir o chat e confirmar chips contextuais

### Testes para User Story 4

- [X] T024 [P] [US4] Criar testes unitários para `useMultiMonthAnalysis` em `hooks/use-multi-month-analysis.test.tsx`

### Implementação para User Story 4

- [X] T025 [US4] Implementar hook `useMultiMonthAnalysis` (`GET /api/analysis/multi-month?range=3|6|12`) em `hooks/use-multi-month-analysis.ts`
- [X] T026 [US4] Atualizar `MultiMonthHorizon` em `src/types/charts.ts`, `lib/dashboard-charts.ts` (`3M | 6M | 12M | ALL`) e `components/dashboard/multi-month-evolution-chart.tsx` (botão `3M`, médias e badge `fixedCostTrend`), conectando em `app/(dashboard)/page.tsx` e atualizando testes
- [X] T027 [P] [US4] Adicionar sugestões rápidas contextuais de orçamento, planejamento fiscal e investimentos em `components/chat/quick-suggestion-chips.tsx` e atualizar `components/chat/quick-suggestion-chips.test.tsx`

**Checkpoint**: Todas as histórias implementadas e integradas.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de qualidade, lint, build estático e cobertura de testes

- [X] T028 [P] Executar checagem estática de tipos (`pnpm typecheck`) e linter (`pnpm lint`)
- [X] T029 Executar suíte completa de testes automatizados (`pnpm test`) garantindo 100% dos testes verdes
- [X] T030 Executar validação de fluxos conforme `specs/015-fiscal-advisory-planning/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Execução imediata.
- **Foundational (Phase 2)**: Depende da Phase 1 (`src/types/api.ts`) — bloqueia hooks e formulários das US1 e US3.
- **User Stories (Phase 3 a 6)**: Podem avançar em paralelo após Phase 2 (ou sequencialmente por prioridade: US1 → US2 → US3 → US4).
- **Polish (Phase 7)**: Depende da conclusão de todas as User Stories.

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Concluir Phase 1 (Tipos & Navegação) e Phase 2 (Schemas Zod)
2. Concluir Phase 3 (Página dedicada `/fiscal` com resumo, classificação, OCR, PJ e Dossiê)
3. Concluir Phase 4 (Página dedicada `/investments` com Donut + Diagnóstico + Patrimônio)
4. **VALIDAR MVP**: Testar navegação entre `/`, `/accounts`, `/investments` e `/fiscal`
5. Concluir Phase 5 (Orçamentos Mensais) e Phase 6 (Multi-Mês `3M|6M|12M` + Chips)
6. Concluir Phase 7 (`pnpm typecheck`, `pnpm lint`, `pnpm test`)
