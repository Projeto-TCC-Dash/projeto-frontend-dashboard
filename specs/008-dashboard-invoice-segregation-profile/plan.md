# Implementation Plan: Dashboard com Segregação de Faturas e Diagnóstico IA Calibrado

**Branch**: `feature/008-dashboard-invoice-segregation-profile` | **Spec**: [spec.md](./spec.md)

## Summary

Evoluir o Dashboard principal do sistema (`projeto-frontend-dashboard`) para apresentar o tratamento contábil inteligente de faturas de cartão de crédito e a calibração sob medida do parecer da IA conforme o perfil financeiro do usuário (Feature 008).

## Technical Context

- **Stack**: Next.js 16 (App Router), React 19, Tailwind CSS v4, `@base-ui/react`, Lucide Icons, TanStack Query v5.
- **Domínio**: Métricas financeiras mensais, segregação de faturas de cartão (`invoiceSettlements`), cálculo de saldo líquido real de caixa, compatibilidade com 11 categorias canônicas e diretrizes de reserva de emergência por regime de renda.

## Constitution Check

- [x] **I. TypeScript Estrito & Zero `any`**: Tipos adicionados em `src/types/api.ts` com TypeScript estrito.
- [x] **II. Clean Code & SRP**: Cálculos puros isolados em utilitários (`lib/formatters.ts`), componentes focados em apresentação.
- [x] **III. UX Resiliente BYOK**: Estados de fallback e link para Google AI Studio mantidos.
- [x] **V. TanStack Query Reativo**: Caching mantido com `useFinancialAnalysis` e `useUserProfile`.
- [x] **VII. Testes Automatizados Obrigatórios**: Testes unitários e de integração com Vitest e Testing Library para todos os componentes modificados.

## Implementation Phases

### Phase 1: Tipagem e Utilitários de Domínio
- Estender `FinancialMetrics` em `src/types/api.ts` para suportar `invoiceSettlements?: number`.
- Criar a função utilitária `computeEmergencyReserveGuideline` em `lib/formatters.ts` com testes unitários.

### Phase 2: Mapeamento de Categorias no Donut Chart
- Atualizar `CATEGORY_COLORS` em `components/dashboard/category-chart-legend.tsx` adicionando `"Pagamento de Fatura": "#64748b"` e `"Investimentos": "#06b6d4"`.

### Phase 3: Grid de Métricas (5 Cards com Segregação)
- Atualizar `components/dashboard/metric-cards-grid.tsx` para exibir 5 cards responsivos: Receitas Totais, Despesas Primárias, Quitação de Faturas, Saldo Líquido e Taxa de Poupança.
- Atualizar o cálculo de saldo líquido para descontar `invoiceSettlements`.

### Phase 4: Calibração de IA e Metas no `AiDiagnosisCard`
- Atualizar `components/dashboard/ai-diagnosis-card.tsx` para exibir a diretriz personalizada de reserva de emergência e chips das metas prioritárias.
- Atualizar `app/(dashboard)/page.tsx` para repassar o perfil do usuário ou métricas necessárias.

### Phase 5: Testes e Validação de Qualidade
- Atualizar e criar testes unitários para `metric-cards-grid.test.tsx`, `ai-diagnosis-card.test.tsx`, `category-donut-chart.test.tsx` e `formatters.test.ts`.
- Validar suíte completa com `pnpm test`, `pnpm typecheck` e `pnpm lint`.
