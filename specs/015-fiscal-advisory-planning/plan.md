# Implementation Plan: Módulo Fiscal, Investimentos Dedicados e Planejamento Orçamentário

**Branch**: `015-fiscal-advisory-planning` | **Date**: 2026-11-18 | **Spec**: [spec.md](file:///home/debhg/Projetos/projeto-frontend-dashboard/specs/015-fiscal-advisory-planning/spec.md)

**Input**: Feature specification from `/specs/015-fiscal-advisory-planning/spec.md`

---

## Summary

Implementar a integração completa das capacidades de planejamento tributário, orçamentos mensais, carteira de investimentos dedicada e tendências multi-mês no frontend:
1. **Navegação Principal Expandida**: Inclusão dos destinos **Investimentos** (`/investments`) e **Fiscal** (`/fiscal`) em `APP_ROUTES`, `Navbar` (desktop + mobile) e `Sidebar`.
2. **Página Dedicada de Planejamento Fiscal (`/fiscal`)**:
   - Consome `GET /api/fiscal/summary?year=YYYY`, `PATCH /api/transactions/:id/fiscal`, `POST /api/fiscal/ocr` (multipart até 10 MB com chave BYOK) e `GET /api/fiscal/dossier?year=YYYY&format=pdf|xlsx` (stream binário com `Blob` e `URL.revokeObjectURL`).
   - Inclui painel PJ/MEI condicional (teto R$ 81.000,00 com alerta ≥ 80%), lista de classificação fiscal de despesas com validação Zod de CPF/CNPJ (11/14 dígitos), modal de conciliação OCR com confiança e exibição permanente do aviso legal obrigatório.
3. **Página Dedicada de Carteira de Investimentos (`/investments`)**:
   - Visualização exclusiva com gráfico de rosca (`DonutChart`) das 6 macroclasses sincronizado à lista proporcional (`BarList`), diagnóstico consultivo de aderência ao perfil de risco (`InvestmentPortfolioCard`), modal de atualização de posições (`PUT /api/investments/holdings`) e gráfico temporal patrimonial (`InvestmentTimeSeriesChart`).
   - Mantém `/accounts` limpa e focada em contas e patrimônio com atalho para `/investments`.
4. **Widget "Orçamentos do Mês" no Dashboard (`/`)**:
   - Consome `GET /api/budgets/:month` (tratando `404` como estado vazio orientativo) e `PUT /api/budgets/:month`.
   - Exibe barras de progresso com codificação semântica `REGULAR` (`< 70%`), `WARNING` (`70%–99,9%`) e `EXCEEDED` (`≥ 100%`) e modal de edição de tetos globais e por categoria.
5. **Análise Multi-Mês e Consultor Contextual**:
   - Hook `useMultiMonthAnalysis(range: "3" | "6" | "12")` consumindo `GET /api/analysis/multi-month` e integrando os indicadores de taxa média de poupança, média de despesas e tendência de custos fixos (`STABLE | GROWING | DECLINING`) ao `MultiMonthEvolutionChart` (`3M | 6M | 12M | Tudo`).
   - Chips contextuais no consultor virtual (`QuickSuggestionChips`) cobrindo estouro orçamentário, planejamento fiscal e investimentos.

---

## Technical Context

**Language/Version**: TypeScript 5 (`strict: true`, zero `any`), React 19.3.0, Next.js 16.4.3 (App Router)

**Primary Dependencies**:
- UI & Estilo: Tailwind CSS v4, `@base-ui/react`, `lucide-react`, `next-themes`, `class-variance-authority`
- Gráficos & Animação: `recharts` (`^3.10.1`), `lightweight-charts` (`^5.3.0`), `motion` (`^14.12.0`), `@number-flow/react` (`^0.6.2`), `@formkit/auto-animate` (`^0.10.2`)
- Dados & Validação: `@tanstack/react-query` (`^5.104.4`), `zod` (`^4.6.7`)

**Storage**: N/A (caching em memória via TanStack Query; uploads multipart e downloads binários via `Blob`)

**Testing**: Vitest 5.0.5 + `@testing-library/react` 16.3.3 + `happy-dom` 21.0.3 (`pnpm test`), `tsc --noEmit` (`pnpm typecheck`), ESLint (`pnpm lint`)

**Target Platform**: Web Responsiva (`320px` a `1440px+`), temas claro/escuro e `prefers-reduced-motion`

**Project Type**: Aplicação Web Next.js (App Router) — Frontend Dashboard

**Performance Goals**: Feedback instantâneo em classificações e orçamentos via invalidação direcionada de cache, carregamento paralelo sem bloqueio de UI e validação client-side de arquivos antes do upload.

**Constraints**:
- Seguir os contratos reais do backend em `/home/debhg/Projetos/projeto-backend-dashboard` (enums `PENSION_PGBL`, `BUSINESS_EXPENSE_BOOK`, `CASH_LIQUIDITY`, etc.)
- Respeitar integralmente os limites de upload (10 MB; PDF/PNG/JPG/WEBP) e validação de CPF/CNPJ (11/14 dígitos)
- Exibir o aviso legal obrigatório em toda a experiência fiscal
- Liberar memória via `URL.revokeObjectURL` nos downloads de dossiê PDF/XLSX (Princípio IX)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Verificação & Aderência |
|---|---|---|
| **I. TypeScript Estrito e Zero `any`** | ✅ PASS | Todos os novos tipos fiscais, orçamentários e multi-mês em `src/types/api.ts`, schemas Zod em `lib/validations/`, hooks e componentes serão estritamente tipados sem `any`. |
| **II. Clean Code, Componentização e Baseline** | ✅ PASS | Reaproveita 100% da stack instalada (`recharts`, `DonutChart`, `BarList`, `ProgressBar`, `Dialog`); isola chamadas HTTP em hooks dedicados (`use-fiscal.ts`, `use-budgets.ts`, `use-multi-month-analysis.ts`) e regras puras em `lib/validations/` e `lib/dashboard-charts.ts`. |
| **III. Gestão de Estado BYOK & UX Resiliente** | ✅ PASS | OCR fiscal (`/api/fiscal/ocr`) verifica `hasAiKey` e trata `403` (`AI_KEY_REQUIRED`), `429` e `503` com opção direta para abrir `AiKeyModal`, sem bloquear a classificação manual. |
| **IV. Consumo Streaming SSE** | ✅ PASS | Chat SSE inalterado; apenas enriquecimento de chips de sugestão rápida contextuais. |
| **V. TanStack Query Reativo** | ✅ PASS | Queries e mutations com `staleTime` explícito e invalidação cirúrgica (`["fiscal"]`, `["budgets"]`, `["transactions"]`, `["investments"]`). |
| **VI. Segurança no Cliente & Privacidade** | ✅ PASS | JWT anexado centralmente via `apiClient`/`getStoredToken`; validação client-side de extensão/tamanho (10 MB) antes do upload OCR; zero logs de dados sensíveis/documentos. |
| **VII. Testes Automatizados Obrigatórios** | ✅ PASS | Todos os novos hooks, validadores Zod, componentes de UI e páginas (`/fiscal`, `/investments`) terão testes unitários e de integração com Vitest e Testing Library. |
| **VIII. Identidade e Segurança de Sessão** | ✅ PASS | Fluxos de sessão, login e logout preservados integralmente. |
| **IX. Mídias, Exportação e Portais** | ✅ PASS | Exportação do Dossiê Fiscal (`/api/fiscal/dossier`) usa `Blob` + `Content-Disposition` + `triggerBlobDownload` (`URL.revokeObjectURL`) com bloqueio contra duplo clique; modais usam `Dialog` com `createPortal(..., document.body)`. |

*Post-Design Re-Check (após Phase 1)*: Contratos definidos em [contracts/fiscal-advisory-contracts.md](file:///home/debhg/Projetos/projeto-frontend-dashboard/specs/015-fiscal-advisory-planning/contracts/fiscal-advisory-contracts.md) e modelo em [data-model.md](file:///home/debhg/Projetos/projeto-frontend-dashboard/specs/015-fiscal-advisory-planning/data-model.md) estão 100% aderentes à Constituição e aos schemas reais do backend.

---

## Project Structure

### Documentation (this feature)

```text
specs/015-fiscal-advisory-planning/
├── spec.md                                   # Especificação funcional (US1..US4, FR-001..FR-014, SC-001..SC-006)
├── plan.md                                   # Este plano (/speckit-plan)
├── research.md                               # Reconciliação com backend real e decisões técnicas
├── data-model.md                             # Entidades fiscais, orçamentárias, multi-mês e validações
├── quickstart.md                             # Guia de validação estática, testes e roteiro manual
├── contracts/
│   └── fiscal-advisory-contracts.md          # Contratos de rotas, hooks, componentes e data-testids
└── checklists/
    └── requirements.md                       # Checklist de qualidade da especificação (16/16 ✅)
```

### Source Code (repository root)

```text
src/types/
└── api.ts                                    # Extensão: TAX_CATEGORIES, FiscalAnnualSummary, FiscalOcrResponse, BudgetOverview, MultiMonthAnalysisResponse, APP_ROUTES

lib/
└── validations/
    ├── fiscal.ts                             # Schemas Zod para classificação fiscal (CPF/CNPJ) e validação de arquivo OCR (<= 10MB)
    ├── fiscal.test.ts                        # Testes unitários das validações fiscais
    ├── budget.ts                             # Schemas Zod para plano orçamentário mensal
    └── budget.test.ts                        # Testes unitários das validações de orçamento

hooks/
├── use-fiscal.ts                             # useFiscalSummary, useUpdateTransactionFiscal, useUploadFiscalOcr, useExportFiscalDossier
├── use-fiscal.test.tsx                       # Testes unitários do módulo fiscal
├── use-budgets.ts                            # useBudget (tratamento 404 gracioso) e useUpsertBudget
├── use-budgets.test.tsx                      # Testes unitários do módulo de orçamento
├── use-multi-month-analysis.ts               # useMultiMonthAnalysis (3 | 6 | 12 meses)
└── use-multi-month-analysis.test.tsx         # Testes unitários da análise multi-mês

components/
├── layout/
│   ├── navbar.tsx                            # Inclusão de Investimentos (/investments) e Fiscal (/fiscal) em NAV_ITEMS
│   ├── navbar.test.tsx                       # Atualização para validar novos itens de navegação
│   ├── sidebar.tsx                           # Inclusão de Investimentos e Fiscal em SIDEBAR_ITEMS
│   └── sidebar.test.tsx                      # Atualização para validar novos itens na sidebar
├── fiscal/
│   ├── fiscal-legal-notice.tsx               # Aviso legal obrigatório (FR-008)
│   ├── fiscal-summary-cards.tsx              # Cards anuais + breakdown por categoria fiscal
│   ├── fiscal-pj-panel.tsx                   # Painel PJ/MEI com progresso do teto R$ 81.000,00
│   ├── fiscal-ocr-dropzone.tsx               # Upload drag-and-drop OCR + modal de conciliação e fallback BYOK
│   ├── fiscal-expenses-list.tsx              # Lista de despesas com edição/classificação fiscal
│   ├── fiscal-edit-dialog.tsx                # Modal de edição fiscal (categoria, CPF/CNPJ, status, notas)
│   └── fiscal-components.test.tsx            # Testes unitários e de integração dos componentes fiscais
├── investments/
│   ├── investment-allocation-donut.tsx       # DonutChart + BarList sincronizado para as 6 macroclasses
│   └── investment-allocation-donut.test.tsx  # Testes do gráfico de alocação de investimentos
├── dashboard/
│   ├── monthly-budget-card.tsx               # Widget "Orçamentos do Mês" (REGULAR/WARNING/EXCEEDED + estado vazio)
│   ├── budget-form-dialog.tsx                # Modal de criação/edição do plano orçamentário
│   ├── monthly-budget-card.test.tsx          # Testes unitários do widget e modal de orçamento
│   └── multi-month-evolution-chart.tsx       # Evolução para suportar 3M|6M|12M|Tudo + médias e fixedCostTrend
└── chat/
    └── quick-suggestion-chips.tsx            # Chips contextuais adicionais (orçamento, fiscal, investimentos)

app/(dashboard)/
├── page.tsx                                  # Integração de MonthlyBudgetCard + MultiMonthAnalysis
├── page.test.tsx                             # Atualização de testes de integração do dashboard
├── fiscal/
│   ├── page.tsx                              # Página dedicada /fiscal
│   └── page.test.tsx                         # Testes da página /fiscal
├── investments/
│   ├── page.tsx                              # Página dedicada /investments
│   └── page.test.tsx                         # Testes da página /investments
└── accounts/
    └── page.tsx                              # Mantém gestão de contas com atalho rápido para /investments
```

**Structure Decision**: Segue o padrão App Router estabelecido no projeto (`app/(dashboard)/fiscal/page.tsx` e `app/(dashboard)/investments/page.tsx`), mantendo hooks isolados em `hooks/`, validações Zod em `lib/validations/`, e componentes por domínio em `components/fiscal/`, `components/investments/` e `components/dashboard/`.

---

## Complexity Tracking

Nenhuma violação à Constituição identificada. Não há desvios arquiteturais a justificar.
