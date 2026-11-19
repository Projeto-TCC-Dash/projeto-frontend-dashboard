# Implementation Plan: Evolução Visual de Gráficos e Histórico Financeiro Consolidado Multi-Mês

**Branch**: `014-multi-month-charts-evolution` | **Date**: 2026-11-18 | **Spec**: [spec.md](file:///home/debhg/Projetos/projeto-frontend-dashboard/specs/014-multi-month-charts-evolution/spec.md)

**Input**: Feature specification from `/specs/014-multi-month-charts-evolution/spec.md`

---

## Summary

Implementar a evolução visual de gráficos e o histórico financeiro consolidado de múltiplos meses no dashboard e tela de contas:
1. **Gráfico Histórico Consolidado Multi-Mês (`MultiMonthEvolutionChart`)**: Componente baseado no `ComposedChart` do Recharts, combinando barras de receitas e despesas por competência mensal e uma linha/área suave sobreposta (`monotone`) com gradiente esmeralda demonstrando a subida contínua do saldo acumulado, com seletores de horizonte temporal (`6M`, `12M`, `Tudo`), linha zero (`y = 0`) e linha de meta de reserva contextualizada com o perfil do usuário.
2. **Polimento Visual nos Gráficos Existentes**:
   - `DonutChart`: Cantos curvos nas extremidades das fatias (`cornerRadius={6}`) e expansão radial suave no hover/foco.
   - `PeriodCashflowCard`: Alternador de modo de exibição entre `Diário` (barras com gradiente vertical e `maxBarSize: 28`) e `Acumulado` (área contínua que evidencia subidas e descidas do caixa ao longo dos dias do mês), com cálculo do saldo líquido pontual no tooltip.
3. **Indicadores de Tendência e Sparklines nos KPIs**:
   - `MetricCard` e `MetricCardsGrid`: Selos percentuais comparativos mês a mês (MoM) com inversão semântica para despesas e mini sparklines discretas no rodapé dos cartões.
4. **Alocação Patrimonial e Gráficos em Contas (`/accounts`)**:
   - `AccountAllocationBar`: Barra horizontal proporcional segmentada por tipo de conta (Corrente, Investimento, Dinheiro, Cartão) abaixo do saldo patrimonial.
   - Ativação do componente existente de séries temporais financeiras (`InvestmentTimeSeriesChart`) na tela de contas.
5. **Zero chamadas em loop de IA**:
   - Agregação pura no cliente (`lib/dashboard-charts.ts`), utilizando transações já existentes e mantendo tempo de resposta instantâneo (< 300ms) com custo zero de infraestrutura.

---

## Technical Context

**Language/Version**: TypeScript 5 (`strict: true`, zero `any`), React 19.3.0, Next.js 16.4.3 (App Router)

**Primary Dependencies**:
- Gráficos & Visualização: `recharts` (`^3.10.1`), `react-is` (`^19.3.1`), `lightweight-charts` (`^5.3.0`)
- Animações & Transições: `@number-flow/react` (`^0.6.2`), `motion` (`^14.12.0`), `@formkit/auto-animate` (`^0.10.2`)
- Estilização & UI: Tailwind CSS v4, `@base-ui/react`, `lucide-react`, `next-themes`, `class-variance-authority`
- Camada de Dados: `@tanstack/react-query` (`^5.104.4`), `zod` (`^4.6.7`)

**Storage**: N/A (derivação client-side puramente em memória das séries temporais a partir das transações já cacheadas pelo TanStack Query)

**Testing**: Vitest 5.0.5 + `@testing-library/react` 16.3.3 + `happy-dom` 21.0.3 (`pnpm test`), `tsc --noEmit` (`pnpm typecheck`), ESLint (`pnpm lint`), `next build` (`pnpm build`)

**Target Platform**: Web Responsiva (Smartphones `>= 320px`, Tablets, Laptops e Desktops ultrawide) com suporte completo a temas claro/escuro e acessibilidade `prefers-reduced-motion`

**Project Type**: Aplicação Web Next.js (App Router) — Frontend Dashboard Financeiro

**Performance Goals**:
- Atualização e renderização do gráfico histórico multi-mês em `< 300ms`
- Animações suaves a 60fps sem bloquear cliques ou rolagem
- Zero requisições redundantes a endpoints de diagnóstico de IA

**Constraints**:
- Preservar integralmente as cores canônicas oficiais das 11 categorias e os tokens semânticos da Spec 013
- Preservar a segregação contábil de quitação de faturas (`invoiceSettlements`)
- Garantir sustentação de linha plana em lacunas temporais (meses sem lançamentos)
- Compatibilidade com preferências de movimento reduzido do sistema operacional

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Verificação & Aderência |
|---|---|---|
| **I. TypeScript Estrito e Zero `any`** | ✅ PASS | Todos os novos tipos em `src/types/charts.ts`, helpers em `lib/dashboard-charts.ts` e props dos novos componentes são estritamente tipados sem qualquer uso de `any`. |
| **II. Clean Code, Componentização e Baseline** | ✅ PASS | Respeita a base Next.js 16 + React 19 + Tailwind v4; funções de cálculo histórico são isoladas como funções puras em `lib/dashboard-charts.ts` (SRP) e testadas unitariamente; novos componentes visuais são desacoplados e reutilizáveis. |
| **III. Gestão de Estado BYOK & UX Resiliente** | ✅ PASS | A agregação de múltiplos meses opera independentemente de chaves de IA, sem gerar chamadas desnecessárias que possam esgotar limites de cota ou falhar com 429/503. |
| **IV. Consumo Streaming SSE** | ✅ PASS | O módulo de chat conversacional em tempo real (`/chat`) não é afetado pelas mudanças visuais do dashboard. |
| **V. TanStack Query Reativo** | ✅ PASS | Os novos componentes reutilizam as queries existentes (`useTransactions`, `useAccounts`, `useUserProfile`) com cache inteligente e invalidação automática em caso de mutações. |
| **VI. Segurança no Cliente & Privacidade** | ✅ PASS | Nenhuma exposição de dados sensíveis ou tokens em logs; processamento estritamente local no navegador. |
| **VII. Testes Automatizados Obrigatórios** | ✅ PASS | Cobertura abrangente com testes unitários para agregação de séries históricas, alternadores de modo, cantos arredondados, sparklines e preferência de movimento reduzido. |
| **VIII. Identidade e Segurança de Sessão** | ✅ PASS | Rotas de autenticação e proteção de sessão permanecem inalteradas. |
| **IX. Mídias, Exportação e Portais** | ✅ PASS | Exportações e regras de layout preservadas sem interferência. |

*Post-Design Re-Check (após Phase 1)*: Todos os contratos definidos em [contracts/multi-month-charts-contracts.md](file:///home/debhg/Projetos/projeto-frontend-dashboard/specs/014-multi-month-charts-evolution/contracts/multi-month-charts-contracts.md), o modelo em [data-model.md](file:///home/debhg/Projetos/projeto-frontend-dashboard/specs/014-multi-month-charts-evolution/data-model.md) e as decisões consolidadas em [research.md](file:///home/debhg/Projetos/projeto-frontend-dashboard/specs/014-multi-month-charts-evolution/research.md) respeitam integralmente os 9 princípios da Constituição Técnica.

---

## Project Structure

### Documentation (this feature)

```text
specs/014-multi-month-charts-evolution/
├── spec.md                                      # Especificação funcional (US1..US4, FR-001..FR-013, SC-001..SC-005)
├── plan.md                                      # Este plano (/speckit-plan)
├── research.md                                  # Decisões de arquitetura, agregação client-side e ComposedChart
├── data-model.md                                # Estruturas de dados (MultiMonthEvolutionPoint, TrendMetric, etc.)
├── quickstart.md                                # Guia executável de validação estática e testes
├── contracts/
│   └── multi-month-charts-contracts.md          # Contratos de componentes, props e acessibilidade
└── checklists/
    └── requirements.md                          # Checklist de qualidade da especificação (16/16 ✅)
```

### Source Code (repository root)

```text
src/types/
└── charts.ts                                    # Extensão com MultiMonthHorizon, MultiMonthEvolutionPoint, PeriodCashflowViewMode, TrendMetric

lib/
├── dashboard-charts.ts                          # Novas funções puras: buildMultiMonthEvolutionSeries, calculateMoMTrend, buildAccountAllocationSegments
└── dashboard-charts.test.ts                     # Testes unitários para cálculos de séries multi-mês, gap-filling e tendências

components/
├── ui/
│   └── tremor/
│       └── donut-chart.tsx                      # Adição de cornerRadius={6} e destaque radial ampliado
├── dashboard/
│   ├── multi-month-evolution-chart.tsx          # NOVO: Card de Evolução Financeira Consolidada Multi-Mês (ComposedChart)
│   ├── multi-month-evolution-chart.test.tsx     # NOVO: Testes unitários do gráfico histórico e seletores 6M/12M/Tudo
│   ├── period-cashflow-card.tsx                 # Atualização: alternador Diário vs Acumulado + maxBarSize={28} + saldo no tooltip
│   ├── period-cashflow-card.test.tsx            # Testes do novo modo acumulado e gradiente
│   ├── metric-card.tsx                          # Suporte a selo MoM e mini sparkline
│   ├── metric-card.test.tsx                     # Testes de renderização com trend e sparkline
│   └── metric-cards-grid.tsx                    # Passagem de métricas de tendência calculadas
├── accounts/
│   ├── account-allocation-bar.tsx               # NOVO: Barra horizontal segmentada de alocação de patrimônio
│   └── account-allocation-bar.test.tsx          # NOVO: Testes unitários da barra proporcional por tipo de conta

app/(dashboard)/
├── page.tsx                                     # Inclusão do MultiMonthEvolutionChart na grade do dashboard
└── accounts/
    └── page.tsx                                 # Inclusão da AccountAllocationBar e ativação do InvestmentTimeSeriesChart
```

**Structure Decision**: Preserva a arquitetura do projeto organizando novos componentes em `components/dashboard/` e `components/accounts/`, mantendo os primitivos em `components/ui/tremor/`, os tipos canônicos em `src/types/charts.ts` e todas as funções puras de agregação de séries isoladas em `lib/dashboard-charts.ts`.

---

## Complexity Tracking

Nenhuma violação à Constituição identificada. Não há exceções ou desvios arquiteturais a justificar.
