# Implementation Plan: Estilização Visual dos Dashboards, Visualizações Analíticas e Animações

**Branch**: `feature/013-dashboard-design-style` | **Date**: 2026-11-12 | **Spec**: [spec.md](file:///home/debhg/Projetos/projeto-frontend-dashboard/specs/013-dashboard-design-style/spec.md)

**Input**: Feature specification from `/specs/013-dashboard-design-style/spec.md`

---

## Summary

Elevar a apresentação visual, a riqueza analítica e o polimento interativo dos dashboards preservando integralmente a estética neutra e minimalista atual nos modos claro e escuro. A arquitetura técnica adota: (1) componentes copy-paste **Tremor Raw** (`DonutChart`, `BarList`, `BarChart`, `ProgressBar`) apoiados por `recharts` + `react-is` compatíveis com React 19 e Tailwind v4, organizados em dois cards independentes empilhados na coluna esquerda do painel (`CategoryDonutChart` para **Distribuição por Categorias** acima e `PeriodCashflowCard` para **Fluxo do Período** diretamente abaixo, sem abas); (2) base desacoplada e reutilizável com **Lightweight Charts v5** (`createChart` + `addSeries`) preparada para futuros dashboards de investimentos com sincronização de tema, crosshair em BRL e estado vazio sem cotações fictícias; (3) suíte coordenada de animações com **`@number-flow/react`**, **`motion` (`motion/react`)**, **`BorderBeam`** em CSS puro (padrão Magic UI) e **`@formkit/auto-animate`**, todas subordinadas à preferência `prefers-reduced-motion`; e (4) reorganização em **Bento Grid** (`7/5`) em telas largas (`>= 1280px`) onde o card de **Parecer do Consultor Financeiro** (`AiDiagnosisCard`) na coluna direita é exatamente igualado à altura combinada dos dois cards da esquerda em todos os estados — mantendo cabeçalho e botão de recálculo fixos no topo com rolagem interna via mouse apenas no corpo quando o conteúdo ultrapassar essa altura — e preservando empilhamento natural no fluxo da página em `< 1280px`.

---

## Technical Context

**Language/Version**: TypeScript 5 (`strict: true`, zero `any`), React 19.3.0, Next.js 16.4.3 (App Router)

**Primary Dependencies**:
- Já instaladas: Tailwind CSS v4 (`@tailwindcss/postcss`), `tw-animate-css`, `@base-ui/react`, `lucide-react`, `next-themes`, `@tanstack/react-query`, `class-variance-authority`, `zod`
- Novas dependências planejadas: `recharts` + `react-is` (suporte React 19 para `DonutChart`/`BarChart` Tremor Raw), `lightweight-charts` (`^5.x` para base de séries temporais), `@number-flow/react` (transição numérica em KPIs), `motion` (coreografia de layout/entrada e `MotionConfig`), `@formkit/auto-animate` (animação automática de listas filtradas)

**Storage**: N/A (apenas transformação client-side em memória de métricas e transações já cacheadas pelo TanStack Query)

**Testing**: Vitest 5.0.5 + `@testing-library/react` 16.3.3 + `happy-dom` 21.0.3 (`pnpm test`), `tsc --noEmit` (`pnpm typecheck`), ESLint (`pnpm lint`), `next build` (`pnpm build`)

**Target Platform**: Web Responsiva (Desktop, Notebooks, Tablets e Smartphones `>= 320px`) com suporte completo a modos claro/escuro e `prefers-reduced-motion`

**Project Type**: Aplicação Web Next.js (App Router) — Frontend Dashboard

**Performance Goals**: Estabilização visual de valores/gráficos em `< 500ms` após chegada dos dados, animações compostas leves a 60fps sem bloquear cliques e zero regressão de CLS/scroll em mobile

**Constraints**: Preservar integralmente a paleta neutra e identidade visual vigentes, as 11 cores canônicas em `CATEGORY_COLORS`, a segregação contábil de `invoiceSettlements`, as garantias de responsividade da Feature 012, ausência de novos endpoints de backend e zero cotações fictícias em telas produtivas

**Scale/Scope**: Tokens de tema em `app/globals.css`, wrapper global em `components/providers.tsx`, dashboard principal (`app/(dashboard)/page.tsx` e `components/dashboard/*`), primitivos Tremor Raw em `components/ui/tremor/`, componente-base de investimentos em `components/charts/`, utilitários de animação/navegação (`Navbar`, `TransactionTable`, `AccountSection`) e suíte completa de testes unitários/integração

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Verificação & Aderência |
|---|---|---|
| **I. TypeScript Estrito e Zero `any`** | ✅ PASS | Todos os componentes Tremor Raw copiados, wrappers de `lightweight-charts` v5, `@number-flow/react` e helpers de `lib/dashboard-charts.ts` serão tipados estritamente sem `any` explícito ou implícito. |
| **II. Clean Code, Componentização e Baseline** | ✅ PASS | Respeita o baseline `Next 16 + React 19 + Tailwind v4`; evita pacotes redundantes e isola cards de responsabilidade única (`CategoryDonutChart` + `PeriodCashflowCard`) e transformações puras (`lib/dashboard-charts.ts`) fora dos componentes visuais (SRP), usando CSS Grid nativo sem observadores JS frágeis para alinhamento de altura. |
| **III. Gestão de Estado BYOK & UX Resiliente** | ✅ PASS | `AiDiagnosisCard` mantém todos os fluxos de chave ausente (`!hasAiKey`), erros `429`/`503`, vazio e cache 24h com alinhamento exato à altura combinada da coluna esquerda no desktop (`≥ 1280px`); `BorderBeam` é explicitamente desabilitado quando em erro ou chave pendente. |
| **IV. Consumo Streaming SSE** | ✅ PASS | O módulo de chat SSE permanece intacto, sem impacto de animações ou bundles pesados de gráficos na rota `/chat`. |
| **V. TanStack Query Reativo** | ✅ PASS | `useFinancialAnalysis` e `useTransactions` mantêm suas chaves de cache e invalidações atuais, sem alterar políticas de refetch ou contratos de API. |
| **VI. Segurança no Cliente & Privacidade** | ✅ PASS | Nenhuma exposição de tokens, PII ou chaves em logs; processamento de gráficos estritamente client-side sobre dados já autorizados. |
| **VII. Testes Automatizados Obrigatórios** | ✅ PASS | Todos os 66+ arquivos de teste existentes permanecerão aprovados (`pnpm test`), complementados por novos testes unitários/integração para gráficos Tremor Raw, base `lightweight-charts`, `lib/dashboard-charts.ts`, animações e `prefers-reduced-motion`. |
| **VIII. Identidade e Segurança de Sessão** | ✅ PASS | Fluxos de login, Google OAuth, proteção de rotas e logout inalterados. |
| **IX. Mídias, Exportação e Portais** | ✅ PASS | Portais de diálogos críticos e regras de exportação/upload mantidos intactos. |

*Post-Design Re-Check (após Phase 1)*: Contratos definidos em [contracts/design-visualization-contracts.md](file:///home/debhg/Projetos/projeto-frontend-dashboard/specs/013-dashboard-design-style/contracts/design-visualization-contracts.md) e modelo em [data-model.md](file:///home/debhg/Projetos/projeto-frontend-dashboard/specs/013-dashboard-design-style/data-model.md) preservam 100% da conformidade constitucional sem exceções ou violações.

---

## Project Structure

### Documentation (this feature)

```text
specs/013-dashboard-design-style/
├── spec.md                                      # Especificação funcional (US1..US4, FR-001..FR-013, SC-001..SC-006)
├── plan.md                                      # Este plano (/speckit-plan)
├── research.md                                  # Decisões técnicas, compatibilidade React 19/Tailwind v4 e estratégia de testes
├── data-model.md                                # Tokens semânticos, séries de fluxo, tipos de investimento e estados visuais
├── quickstart.md                                # Guia executável de validação estática, testes e roteiro visual
├── contracts/
│   └── design-visualization-contracts.md        # Contratos de UI, props, data-testid e acessibilidade
├── checklists/
│   └── requirements.md                          # Checklist de qualidade da especificação (16/16 ✅)
└── tasks.md                                     # Será gerado na próxima etapa (/speckit-tasks)
```

### Source Code (repository root)

```text
app/
├── globals.css                                  # Tokens --chart-1..5 refinados + keyframes acessíveis de borda/movimento
└── (dashboard)/
    ├── page.tsx                                 # Bento Grid desktop (7/5): pilha esquerda (Categorias + Fluxo do Período) e coluna direita (AiDiagnosisCard igualado em altura)
    └── page.test.tsx                            # Integração de useTransactions, cards empilhados e slot de diagnóstico com altura igualada

components/
├── providers.tsx                                # Inclusão de <MotionConfig reducedMotion="user">
├── ui/
│   ├── animated-number-value.tsx                # Wrapper @number-flow/react (pt-BR / BRL / tabular-nums / fallback)
│   ├── border-beam.tsx                          # Destaque animado sutil em CSS puro (padrão Magic UI)
│   └── tremor/
│       ├── donut-chart.tsx                      # Tremor Raw DonutChart (Recharts) adaptado ao tema shadcn
│       ├── bar-list.tsx                         # Tremor Raw BarList (Tailwind puro) com sincronia e drill-down
│       ├── bar-chart.tsx                        # Tremor Raw BarChart (Recharts) com tooltip BRL
│       └── progress-bar.tsx                     # Tremor Raw ProgressBar acessível
├── charts/
│   ├── investment-time-series-chart.tsx         # Base reutilizável lightweight-charts v5 (Area/Line/Candlestick + temas + crosshair)
│   └── investment-time-series-chart.test.tsx    # Testes unitários do contrato v5, tema, resize e estado vazio
├── dashboard/
│   ├── metric-card.tsx                          # Refinamento visual (ícone em badge tintado, AnimatedNumberValue, ProgressBar opcional)
│   ├── metric-cards-grid.tsx                    # Passagem de numericValue/formatMode + entrada escalonada Motion
│   ├── category-donut-chart.tsx                 # Card independente superior: Distribuição por Categorias (Tremor Raw DonutChart + BarList e drill-down)
│   ├── category-chart-legend.tsx                # Sincronia de hover/toque e suporte a AutoAnimate
│   ├── period-cashflow-card.tsx                 # Card independente inferior (substitui o card em abas): Fluxo do Período com Tremor Raw BarChart
│   ├── period-cashflow-card.test.tsx            # Testes unitários do card independente de fluxo do período
│   └── ai-diagnosis-card.tsx                    # Integração de BorderBeam (processing/ready), cabeçalho fixo e corpo rolável igualado à coluna esquerda no desktop (xl:)
├── layout/
│   └── navbar.tsx                               # Indicador deslizante layoutId="navbar-active-pill" no menu desktop
├── accounts/
│   └── account-section.tsx                      # Suporte opcional a useSafeAutoAnimate na grade de contas
└── transactions/
    └── transaction-table.tsx                    # Suporte opcional a useSafeAutoAnimate na listagem filtrada

hooks/
├── use-reduced-motion.ts                        # Leitura segura de prefers-reduced-motion com fallback para SSR/testes
└── use-safe-auto-animate.ts                     # Wrapper de @formkit/auto-animate subordinado a prefers-reduced-motion

lib/
├── chart-utils.ts                               # Utilitários de cores Tremor Raw + mapeamento canônico e paleta lightweight-charts
├── dashboard-charts.ts                          # Funções puras de agregação (buildPeriodCashflowSeries, buildCategoryChartData, buildCategoryBarListItems)
└── dashboard-charts.test.ts                     # Testes unitários de agregação e segregação de faturas

src/types/
└── charts.ts                                    # Tipagens estritas para gráficos analíticos e séries temporais de investimentos (sem tipo de aba)

tests/
└── setup.ts                                     # Polyfills determinísticos (ResizeObserver, matchMedia) para suíte Vitest/happy-dom
```

**Structure Decision**: Manter a estrutura existente do App Router (`app/`, `components/`, `hooks/`, `lib/`, `src/types/`, `tests/`), organizando os primitivos copy-paste Tremor Raw sob `components/ui/tremor/`, os componentes reutilizáveis de séries temporais financeiras em `components/charts/`, e isolando toda lógica pura de transformação de séries em `lib/dashboard-charts.ts` e `lib/chart-utils.ts`.

---

## Complexity Tracking

Nenhuma violação à Constituição identificada. Não há desvios arquiteturais a justificar.
