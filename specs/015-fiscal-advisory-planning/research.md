# Research: Módulo Fiscal, Investimentos Dedicados e Planejamento Orçamentário

**Feature Branch**: `015-fiscal-advisory-planning` | **Date**: 2026-11-18

---

## 1. Reconciliação de Contratos entre Resumo e Backend Real

Ao inspecionar diretamente o servidor backend (`/home/debhg/Projetos/projeto-backend-dashboard`), foram identificadas diferenças pontuais entre a documentação resumo e os schemas Zod reais em produção. O frontend seguirá estritamente os contratos reais executados pelo servidor, com tolerância segura onde aplicável.

### 1.1 Categorias Fiscais (`TAX_CATEGORIES`)
- **Backend Real (`src/config/constants.ts`)**: `['HEALTH', 'EDUCATION', 'PENSION_PGBL', 'ALIMONY', 'BUSINESS_EXPENSE_BOOK', 'OTHER_DEDUCTIBLE']`.
- **Decisão**: Mapear em `src/types/api.ts` exatamente esses 6 enums oficiais com rótulos amigáveis em PT-BR (`Saúde`, `Educação`, `Previdência (PGBL)`, `Pensão Alimentícia`, `Livro-Caixa Profissional`, `Outras Dedutíveis`).

### 1.2 Investimentos (`GET /api/investments/holdings`)
- **Backend Real (`src/schemas/investment.schemas.ts`)**:
  - Retorna `{ totalInvested, riskProfile, holdings: [{ macroClass, amount, percentage }], allocationDiagnosis: { adherentToRiskProfile, recommendations } }`.
  - Macroclasses reais: `FIXED_INCOME`, `EQUITIES`, `REAL_ESTATE`, `INTERNATIONAL`, `CRYPTO`, `CASH_LIQUIDITY`.
- **Decisão**: Manter os tipos canônicos reais já adotados em `src/types/api.ts` e elevar a experiência de investimentos para a nova página dedicada `/investments` (utilizando `DonutChart` + `BarList` + `InvestmentPortfolioCard` + `InvestmentTimeSeriesChart`), deixando `/accounts` focada em gestão de contas e patrimônio consolidado (com link rápido para `/investments`).

### 1.3 Orçamentos Mensais (`GET /api/budgets/:month` e `PUT /api/budgets/:month`)
- **Backend Real (`src/schemas/budget.schemas.ts`)**:
  - Quando o usuário ainda não definiu orçamento para `month`, `GET /api/budgets/:month` retorna HTTP `404` (`BudgetNotFoundError`).
  - **Decisão**: O hook `useBudget(month)` deve capturar `ApiClientError` com `status === 404` e retornar `budget: null` sem retry e sem disparar estado de erro fatal, permitindo renderizar o estado orientativo ("Nenhum orçamento definido para este mês") com CTA de configuração.
  - O formulário de edição (`PUT /api/budgets/:month`) exige `totalLimitAmount > 0` e ao menos 1 categoria em `categoryBudgets` com `limitAmount > 0`.

### 1.4 Análise Multi-Mês (`GET /api/analysis/multi-month?range=3|6|12`)
- **Backend Real (`src/schemas/analysis.schemas.ts`)**:
  - Retorna `{ rangeMonths, averageSavingsRate, averageMonthlyExpenses, averageMonthlyIncome, fixedCostTrend: { status, percentageChange, alertCategory }, monthlyHistory: [{ month, totalIncome, totalExpenses, netBalance, savingsRate }] }`.
- **Decisão**: Criar hook `useMultiMonthAnalysis(range: "3" | "6" | "12")` para consumir os indicadores agregados (`averageSavingsRate`, `averageMonthlyExpenses`, `fixedCostTrend`) diretamente do servidor, enriquecendo o card `MultiMonthEvolutionChart` no dashboard principal com badges de tendência dos custos fixos e seletores `3M`, `6M`, `12M` e `Tudo`.

### 1.5 Exportação Binária do Dossiê Fiscal (`GET /api/fiscal/dossier`)
- **Decisão**: Seguir exatamente o padrão já homologado em `hooks/use-export-transactions.ts` (Princípio IX da Constituição): `fetch` autenticado com `Authorization: Bearer`, leitura de `response.blob()`, extração do nome via `Content-Disposition` com fallback `dossie-fiscal-${year}.${format}`, acionamento de `triggerBlobDownload` e revogação obrigatória de URL temporária.

### 1.6 Upload OCR Multipart (`POST /api/fiscal/ocr`)
- **Decisão**: Validar no cliente antes do envio os formatos permitidos (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`) e limite máximo de `10 MB` (conforme `FISCAL_PROOF_CONFIG` do backend). Tratar graciosamente erro `403` (`AI_KEY_REQUIRED`) exibindo botão para abrir o `AiKeyModal` (BYOK).

---

## 2. Arquitetura de Navegação e Rotas

- **Novas Rotas App Router**:
  - `app/(dashboard)/fiscal/page.tsx`: Página dedicada ao Planejamento Fiscal (IRPF, PJ/MEI, OCR, classificação de despesas e exportação de dossiê).
  - `app/(dashboard)/investments/page.tsx`: Página dedicada à Carteira de Investimentos (gráfico Donut de macroclasses, ranking `BarList`, diagnóstico de risco, atualização de posições e gráfico temporal patrimonial).
- **Barra de Navegação (`Navbar` e `Sidebar`)**:
  - Adicionar `Investimentos` (`/investments`, ícone `TrendingUp`) e `Fiscal` (`/fiscal`, ícone `FileSpreadsheet` ou `Scale`/`Landmark`) em `NAV_ITEMS` (`components/layout/navbar.tsx`) e `SIDEBAR_ITEMS` (`components/layout/sidebar.tsx`).
  - Manter espaçamento compacto e menu móvel acessível (`min-h-11`).

---

## 3. Aviso Legal e Segurança

- **Aviso Legal Obrigatório (FR-008)**: Renderizar componente reutilizável `FiscalLegalNotice` de forma destacada na página `/fiscal` (e também no modal de OCR e exportação):
  > *"AVISO LEGAL: Esta ferramenta atua na organização e planejamento financeiro-tributário, não substituindo a escrituração nem o parecer formal de um contador legalmente habilitado."*
- **Validação de CPF/CNPJ**: Remover pontuação antes do envio (`replace(/\D/g, "")`) e validar exatamente 11 ou 14 dígitos via Zod no cliente (`lib/validations/fiscal.ts`).
