# Data Model: Dashboard Financeiro e Análise Mensal com IA

**Feature Branch**: `003-dashboard-metrics-analysis`  
**Date**: 2026-10-19  
**Status**: Completed  

---

## 1. Entities & Data Structures

### 1.1 CategoryMetric
Representa a métrica consolidada de gastos para uma categoria canônica específica em uma competência mensal.

| Campo | Tipo | Descrição | Regras de Validação |
|---|---|---|---|
| `category` | `string` | Nome da categoria canônica (ex: `"Alimentação"`, `"Moradia"`) | Deve pertencer às categorias canônicas ou `"Outros"` |
| `amount` | `number` | Montante financeiro total gasto na categoria | Valor não negativo (`amount >= 0`) |
| `percentage` | `number` | Proporção relativa em relação às despesas totais do mês | Intervalo entre `0` e `100` (`0 <= percentage <= 100`) |

---

### 1.2 FinancialMetrics
Agrupamento consolidado dos indicadores-chave de desempenho (KPIs) financeiros da competência.

| Campo | Tipo | Descrição | Regras de Validação |
|---|---|---|---|
| `totalIncome` | `number` | Total consolidado de receitas no mês | `totalIncome >= 0` |
| `totalExpenses` | `number` | Total consolidado de despesas no mês | `totalExpenses >= 0` |
| `netBalance` | `number` | Saldo líquido apurado no mês | `netBalance === totalIncome - totalExpenses` (pode ser positivo, zero ou negativo) |
| `savingsRate` | `number` | Percentual de economia em relação à receita | Se `totalIncome > totalExpenses`: `((totalIncome - totalExpenses) / totalIncome) * 100`. Se `totalIncome === 0` ou `totalExpenses >= totalIncome`: fixado em `0` |
| `topCategories` | `CategoryMetric[]` | Lista ordenada de categorias de despesa | Ordenada decrescentemente por `amount` |

---

### 1.3 FinancialAnalysis
Objeto completo retornado pelo backend contendo métricas calculadas e parecer analítico contextual gerado por IA.

| Campo | Tipo | Descrição | Regras de Validação |
|---|---|---|---|
| `cached` | `boolean` | Indica se a resposta veio do cache do backend | Booleano obrigatório |
| `month` | `string` | Competência de referência | Formato canônico `YYYY-MM` (ex: `"2026-10"`) |
| `diagnosis` | `string` | Texto analítico gerado pela IA em Markdown | Texto estruturado com títulos, listas e parágrafos |
| `recommendations` | `string[]` | Recomendações práticas e acionáveis | Coleção de strings contendo orientações financeiras |
| `metrics` | `FinancialMetrics` | Métricas e distribuição de categorias | Objeto válido de `FinancialMetrics` |
| `generatedAt` | `string` | Timestamp ISO 8601 da geração da análise | Timestamp válido em UTC |
| `expiresAt` | `string` | Timestamp ISO 8601 de expiração do cache | Timestamp válido em UTC (`expiresAt >= generatedAt`) |

---

### 1.4 DashboardMonthState
Estado local de navegação do dashboard controlado pela página.

| Campo | Tipo | Descrição | Padrão / Comportamento |
|---|---|---|---|
| `selectedMonth` | `string` | Mês atualmente visualizado | Formato `YYYY-MM`. Inicializa com o mês corrente |
| `canNavigateNext` | `boolean` | Flag de controle de navegação | Impede avançar para meses futuros muito distantes |
| `isRefreshing` | `boolean` | Flag de reprocessamento manual ativo | Ativado durante `forceRefresh=true` |

---

## 2. State Transitions & Lifecycle

### 2.1 Ciclo de Vida da Consulta de Análise (`useFinancialAnalysis`)

```
[ Inicialização do Dashboard ]
          │
          ▼
   ( Lê selectedMonth ) ──► [ Query Key: ['analysis', month] ]
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
         [ Cache Hit Local ]                       [ Cache Miss / Stale ]
                 │                                         │
                 ▼                                         ▼
      Exibe dados imediatos               Dispara GET /api/analysis/:month
                                                           │
                                   ┌───────────────────────┴───────────────────────┐
                                   ▼                                               ▼
                           [ Sucesso (200 OK) ]                             [ Erro HTTP ]
                                   │                                               │
                                   ▼                                               ▼
                         Armazena em Cache Query                         Trata 403 / 429 / 503
                     Atualiza Cards, Gráfico e Parecer                     Exibe Alerta Contextual
```

### 2.2 Ciclo de Vida do Reprocessamento Manual (`forceRefresh`)

```
[ Usuário Clica em "Recalcular Diagnóstico" ]
          │
          ▼
Ativa spinner e estado isRefetching
          │
          ▼
Dispara GET /api/analysis/:month?forceRefresh=true
          │
          ▼
Backend ignora cache, recalcula dados e invoca IA
          │
          ▼
Resposta 200 OK com cached: false
          │
          ▼
TanStack Query substitui cache local da competência
Feedback visual de sucesso ("Diagnóstico atualizado")
```

---

## 3. Integridade e Regras de Negócio de Interface

1. **Proteção Contra Divisão por Zero**: Se `totalIncome === 0`, `savingsRate` DEVE ser sempre formatado e exibido como `0.0%`, nunca `NaN` ou `Infinity`.
2. **Semântica de Déficit**: Quando `netBalance < 0`, o cartão de saldo deve usar variante de alerta visual (vermelho/destaque) e a taxa de poupança exibe badge de alerta `"Sem poupança / Déficit orçamentário"`.
3. **Drill-Down de Categorias**: Ao clicar em uma categoria no gráfico ou na legenda, dispara navegação direta para `/transactions?month=${selectedMonth}&category=${encodeURIComponent(category)}`.
4. **Resiliência BYOK**: Se `user.hasAiKey === false`, o bloco do parecer exibe o componente `AiKeyRequiredBanner` com gatilho direto para abrir o modal de cadastro de chave.
