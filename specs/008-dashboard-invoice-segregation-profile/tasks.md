# Tasks: Dashboard com Segregação de Faturas e Diagnóstico IA Calibrado

**Input**: Design documents from `/specs/008-dashboard-invoice-segregation-profile/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Phase 1: Foundational (Tipagem e Utilitários de Domínio)

- [x] T001 Estender interface `FinancialMetrics` em `src/types/api.ts` com o campo opcional `invoiceSettlements?: number`
- [x] T002 Implementar função pura `computeEmergencyReserveGuideline` em `lib/formatters.ts` e testes unitários em `lib/formatters.test.ts`

---

## Phase 2: User Story 1 - Card de Quitação de Faturas e Saldo Líquido Atualizado (Priority: P1) 🎯 MVP

**Goal**: Exibir no Grid de KPIs do Dashboard o novo card "Quitação de Faturas" e recalcular o Saldo Líquido sem duplicidade contábil.

- [x] T003 [US1] Atualizar `components/dashboard/metric-cards-grid.tsx` para renderizar 5 cards responsivos, incluindo "Quitação de Faturas" (`invoiceSettlements ?? 0`) e atualizar o Saldo Líquido para `totalIncome - totalExpenses - (invoiceSettlements ?? 0)`
- [x] T004 [US1] Atualizar `components/dashboard/metric-cards-grid.test.tsx` cobrindo o card de Quitação de Faturas, saldo recalculado com e sem faturas e novos estados de carregamento

---

## Phase 3: User Story 2 - Gráfico de Rosca com Suporte às 11 Categorias Canônicas (Priority: P1) 🎯 MVP

**Goal**: Assegurar suporte visual integral às 11 categorias canônicas oficiais no gráfico de rosca e na legenda interativa.

- [x] T005 [US2] Adicionar mapeamento oficial de cores para "Pagamento de Fatura" (`#64748b`) e "Investimentos" (`#06b6d4`) em `CATEGORY_COLORS` no arquivo `components/dashboard/category-chart-legend.tsx`
- [x] T006 [US2] Atualizar testes em `components/dashboard/category-donut-chart.test.tsx` verificando renderização e cores semânticas para as novas categorias canônicas

---

## Phase 4: User Story 3 - Parecer de IA com Diretriz de Reserva de Emergência Calibrada (Priority: P2)

**Goal**: Apresentar no card de diagnóstico do mês um destaque contextual com a meta de reserva de emergência sob medida para o regime de renda do usuário e gastos do mês.

- [x] T007 [US3] Atualizar `components/dashboard/ai-diagnosis-card.tsx` para calcular e exibir a diretriz personalizada de reserva de emergência (3-6 meses para CLT/servidor público, 6-12 meses para PJ/autônomo/empresário, 6 meses padrão) com valores calculados em BRL
- [x] T008 [US3] Atualizar `app/(dashboard)/page.tsx` para fornecer o `userProfile` e `totalExpenses` para o `AiDiagnosisCard`
- [x] T009 [US3] Atualizar testes em `components/dashboard/ai-diagnosis-card.test.tsx` validando exibição da diretriz calibrada por regime de renda

---

## Phase 5: User Story 4 - Alinhamento Contextual de Recomendações às Metas Declaradas (Priority: P3)

**Goal**: Destacar as metas prioritárias ativas do usuário no cabeçalho das recomendações práticas no `AiDiagnosisCard`.

- [x] T010 [US4] Atualizar `components/dashboard/ai-diagnosis-card.tsx` para renderizar badges/chips das metas ativas do usuário na seção de recomendações
- [x] T011 [US4] Atualizar testes em `components/dashboard/ai-diagnosis-card.test.tsx` validando renderização de chips de metas ativas

---

## Phase 6: Polish & Verification

- [x] T012 Executar bateria completa de testes automatizados (`pnpm test`), verificação de tipos estritos (`pnpm typecheck`) e checagem de estilo e lint (`pnpm lint`)
