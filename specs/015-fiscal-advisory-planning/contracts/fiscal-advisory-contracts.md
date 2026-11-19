# Interface Contracts: Módulo Fiscal, Investimentos Dedicados e Orçamentos Mensais

**Feature Branch**: `015-fiscal-advisory-planning` | **Date**: 2026-11-18

---

## 1. Navegação Principal (`Navbar` & `Sidebar`)

- **`APP_ROUTES` (`src/types/api.ts`)**:
  - `FISCAL: "/fiscal"`
  - `INVESTMENTS: "/investments"`
- **Itens na Barra de Navegação (`components/layout/navbar.tsx` e `components/layout/sidebar.tsx`)**:
  - `Investimentos` (`/investments`) — acessível em 1 clique no menu desktop e menu mobile
  - `Fiscal` (`/fiscal`) — acessível em 1 clique no menu desktop e menu mobile

---

## 2. Hooks de Dados Reativos (TanStack Query)

### 2.1 `hooks/use-fiscal.ts`
- `useFiscalSummary(year: string)` → `GET /api/fiscal/summary?year=YYYY` (`queryKey: ["fiscal", "summary", year]`)
- `useUpdateTransactionFiscal()` → `PATCH /api/transactions/:id/fiscal` (invalida `["fiscal"]` e `["transactions"]`)
- `useUploadFiscalOcr()` → `POST /api/fiscal/ocr` via `FormData` com `file` (retorna `FiscalOcrResponse`; trata erro `403` `AI_KEY_REQUIRED`)
- `useExportFiscalDossier()` → `GET /api/fiscal/dossier?year=YYYY&format=pdf|xlsx` via `fetch` + `Blob` + `triggerBlobDownload`

### 2.2 `hooks/use-budgets.ts`
- `useBudget(month: string)` → `GET /api/budgets/:month` (`queryKey: ["budgets", month]`); trata HTTP `404` graciosamente retornando `budget: null` sem erro nem retry.
- `useUpsertBudget()` → `PUT /api/budgets/:month` (atualiza cache `["budgets", month]` e invalida `["budgets"]`)

### 2.3 `hooks/use-multi-month-analysis.ts`
- `useMultiMonthAnalysis(range: "3" | "6" | "12")` → `GET /api/analysis/multi-month?range=...` (`queryKey: ["analysis", "multi-month", range]`)

### 2.4 `hooks/use-investments.ts` (Já existente — reutilizado em `/investments`)
- `useInvestmentPortfolio()` → `GET /api/investments/holdings`
- `useUpsertInvestmentHolding()` → `PUT /api/investments/holdings`

---

## 3. Contratos de Componentes de Interface

### 3.1 Módulo Fiscal (`app/(dashboard)/fiscal/page.tsx` & `components/fiscal/*`)
- **`FiscalLegalNotice` (`components/fiscal/fiscal-legal-notice.tsx`)**:
  - `data-testid="fiscal-legal-notice"`
  - Exibe obrigatoriamente o texto literal da FR-008.
- **`FiscalSummaryCards` (`components/fiscal/fiscal-summary-cards.tsx`)**:
  - `data-testid="fiscal-summary-cards"`
  - Cards: Total Dedutível, Comprovado, Pendente de Comprovante (alerta), e breakdown por categoria fiscal.
- **`FiscalPjPanel` (`components/fiscal/fiscal-pj-panel.tsx`)**:
  - `data-testid="fiscal-pj-panel"`
  - Renderizado quando `pjSummary.applicable === true`; exibe barra de progresso do teto MEI (`R$ 81.000,00`) com alerta visual quando `ceilingPercentage >= 80`, além de `proLaboreTotal` e `dividendsTotal`.
- **`FiscalOcrDropzone` (`components/fiscal/fiscal-ocr-dropzone.tsx`)**:
  - `data-testid="fiscal-ocr-dropzone"`
  - Valida extensão/MIME e tamanho `<= 10 MB`; exibe modal/painel de conciliação (`data-testid="fiscal-ocr-reconcile-modal"`) com transações sugeridas (`confidence: HIGH | MEDIUM | LOW`) e botão "Vincular" por sugestão; se `!hasAiKey` ou erro `403`, exibe CTA para configurar chave BYOK.
- **`FiscalExpensesList` (`components/fiscal/fiscal-expenses-list.tsx`)**:
  - `data-testid="fiscal-expenses-list"`
  - Lista transações de despesa do ano selecionado com botão/modal para editar classificação fiscal (`PATCH /api/transactions/:id/fiscal`).
- **`FiscalDossierExport` (no cabeçalho de `/fiscal`)**:
  - Botões `data-testid="export-dossier-pdf"` e `data-testid="export-dossier-xlsx"`.

### 3.2 Página Dedicada de Investimentos (`app/(dashboard)/investments/page.tsx`)
- `data-testid="investments-page"`
- Reutiliza `DonutChart` (distribuição pelas 6 macroclasses com cores canônicas e legenda `BarList`), `InvestmentPortfolioCard` (diagnóstico de risco, recomendações e modal de atualização de posição) e `InvestmentTimeSeriesChart` (evolução patrimonial derivada das contas/transações).

### 3.3 Widget de Orçamentos Mensais (`components/dashboard/monthly-budget-card.tsx` & `budget-form-dialog.tsx`)
- `data-testid="monthly-budget-card"`
- Exibe barra global + lista por categoria com faixas visuais:
  - `REGULAR`: `bg-emerald-500` / badge esmeralda
  - `WARNING`: `bg-amber-500` / badge âmbar
  - `EXCEEDED`: `bg-rose-500` / badge vermelha
- Estado vazio (`budget === null`): `data-testid="monthly-budget-empty"` com botão `data-testid="configure-budget-btn"`.
- Modal de edição (`BudgetFormDialog`): `data-testid="budget-form-dialog"` permitindo definir `totalLimitAmount` e `limitAmount` por categoria de despesa (`Moradia`, `Alimentação`, `Transporte`, `Saúde`, `Lazer`, `Educação`, `Outros`).

### 3.4 Evolução Multi-Mês Enriquecida (`components/dashboard/multi-month-evolution-chart.tsx`)
- Suporta filtro rápido `3M | 6M | 12M | Tudo` (`horizon-btn-3M`, `horizon-btn-6M`, `horizon-btn-12M`, `horizon-btn-ALL`).
- Exibe indicadores de `averageSavingsRate`, `averageMonthlyExpenses` e badge de `fixedCostTrend` (`Estável`, `Em Alta`, `Em Queda` + `alertCategory` se aplicável).
