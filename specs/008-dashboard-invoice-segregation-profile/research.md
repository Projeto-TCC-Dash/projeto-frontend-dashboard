# Research & Architectural Analysis: Feature 008

## Overview

A **Feature 008** conclui a esteira de evolução v1.1.0 no Frontend, conectando a interface ao tratamento contábil inteligente de faturas de cartão de crédito e ao perfil financeiro voluntário do usuário.

## Key Findings

### 1. Consumo do Campo `invoiceSettlements`
- **Origem no Backend**: `GET /api/analysis/:month` retorna no objeto `metrics` o campo `invoiceSettlements` (número em ponto flutuante, e.g. `2400.00`).
- **Comportamento Contábil**: O backend já exclui as transações da categoria `"Pagamento de Fatura"` de `totalExpenses` e de `topCategories`. As faturas são agregadas separadamente em `invoiceSettlements`.
- **Saldo Líquido Real de Caixa**:
  - `netBalance = totalIncome - totalExpenses - (invoiceSettlements ?? 0)`
  - Isso garante que a liquidação de cartão de crédito saia do caixa sem duplicar o consumo primário já registrado.
- **Taxa de Poupança (`savingsRate`)**:
  - `calculateSavingsRate(metrics.totalIncome, metrics.totalExpenses)`
  - Permanece baseada nas despesas primárias de consumo, pois a fatura é quitação de passivo e não despesa nova.

### 2. Grid de KPIs no Dashboard
- O grid atual possui 4 cards: Receitas Totais, Despesas Totais, Saldo Líquido e Taxa de Poupança.
- Novo layout responsivo:
  - 5 cards: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5` (ou `sm:grid-cols-2 lg:grid-cols-5`).
  - Card 1: Receitas Totais (`totalIncome`, indicador positivo, verde).
  - Card 2: Despesas Primárias (`totalExpenses`, indicador negativo, vermelho, subtítulo "Consumo real do mês").
  - Card 3: Quitação de Faturas (`invoiceSettlements ?? 0`, subtítulo "Liquidação de cartão", ícone CreditCard).
  - Card 4: Saldo Líquido (`totalIncome - totalExpenses - invoiceSettlements`, indicador superávit/déficit).
  - Card 5: Taxa de Poupança (`savings.formattedRate`, indicador de saúde orçamentária).

### 3. Gráfico de Rosca de Categorias (`CategoryDonutChart`)
- No backend, a categoria "Pagamento de Fatura" nunca é enviada em `topCategories`.
- Para total conformidade com as 11 categorias canônicas:
  - `"Pagamento de Fatura"`: `#64748B` (Slate)
  - `"Investimentos"`: `#06B6D4` (Cyan)
- Ambos os mapeamentos devem ser atualizados em `components/dashboard/category-chart-legend.tsx` em `CATEGORY_COLORS`.

### 4. Calibração da Diretriz de Reserva de Emergência no `AiDiagnosisCard`
- Consome o perfil do usuário via `useUserProfile()`.
- Regras de calibração:
  - **CLT** ou **PUBLIC_SERVANT**: 3 a 6 meses de despesas primárias (`totalExpenses * 3` a `totalExpenses * 6`).
  - **PJ_AUTONOMO** ou **ENTREPRENEUR**: 6 a 12 meses de despesas primárias (`totalExpenses * 6` a `totalExpenses * 12`).
  - **STUDENT**, **RETIRED**, **OTHER** ou Não informado: 6 meses de despesas primárias (média prudencial).
- Exibição de chips/badges das metas prioritárias ativas cadastradas em `financialProfile.goals` no cabeçalho das recomendações práticas da IA.
