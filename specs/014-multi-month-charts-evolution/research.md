# Research: Evolução Visual de Gráficos e Histórico Financeiro Consolidado Multi-Mês

**Feature Branch**: `014-multi-month-charts-evolution` | **Date**: 2026-11-18

---

## 1. Estratégia de Obtenção e Agregação de Dados Multi-Mês

### Contexto do Desafio
O dashboard atual opera primariamente no escopo de uma única competência mensal (`GET /api/analysis/:month` e `GET /api/transactions?month=YYYY-MM`). Para exibir um gráfico de "todos os meses" demonstrando a trajetória acumulada e a "subida" do saldo financeiro, é imperativo obter dados de múltiplos meses sem onerar o backend nem disparar chamadas em loop para a geração de diagnósticos de IA (Google Gemini), preservando cotas e tempo de carregamento instantâneo.

### Decisão
1. **Agregação Pura no Cliente via `useTransactions` Multi-Período ou Histórico Total**:
   - O contrato canônico em `src/types/api.ts` define `TransactionFilterParams` com `month?: string` opcional.
   - Criar uma função utilitária pura em `lib/dashboard-charts.ts`: `buildMultiMonthEvolutionSeries(transactions, range, monthlyIncome, riskProfile)`.
   - Se a chamada sem `month` retornar o histórico consolidado (ou consultas paralelas em lote apenas das transações brutas de 6/12 meses), o processamento agrega as transações em buckets de `YYYY-MM`.
   - Para cada mês calcula:
     - `totalIncome` (soma de transações da categoria "Receita")
     - `totalExpenses` (soma de despesas primárias, exceto faturas)
     - `invoiceSettlements` (soma da categoria "Pagamento de Fatura")
     - `netBalance = totalIncome - totalExpenses - invoiceSettlements`
     - `cumulativeBalance = Σ(netBalance)` desde o início do período ordenado cronologicamente.
2. **Fallback Gracioso para Mês Único ou Poucos Dados**:
   - Caso o histórico possua apenas 1 competência (ex.: usuário recém-cadastrado), o gráfico renderiza o ponto inicial com destaque explicativo, sem erros de renderização no Recharts.
   - Em lacunas temporais (meses sem movimentação entre competências com dados), o cálculo sustenta o `cumulativeBalance` constante (flatline horizontal), evitando quedas falsas para zero.

### Alternativas Consideradas
- *Chamar `GET /api/analysis/:month` para os últimos 12 meses*: **Rejeitado**. Dispara de 6 a 12 requisições pesadas ao backend, aciona o gerador de IA em meses sem cache, gera lentidão perceptível no primeiro carregamento e consome desnecessariamente a cota do Gemini.
- *Exigir novo endpoint backend antes de desenvolver o frontend*: **Rejeitado**. Violaria a autonomia de entrega do frontend; a derivação de séries a partir de dados brutos de transações é uma função pura determinística e de altíssimo desempenho no cliente (< 2ms para 1.000 transações).

---

## 2. Arquitetura do Gráfico de Evolução Multi-Mês (`ComposedChart`)

### Decisão
Utilizar o `ComposedChart` da biblioteca `recharts` (já instalada em `^3.10.1`), combinando:
1. `<Bar dataKey="receitas" fill="var(--color-emerald-500, #10b981)" radius={[4, 4, 0, 0]} maxBarSize={28} />`
2. `<Bar dataKey="despesas" fill="var(--color-rose-500, #ef4444)" radius={[4, 4, 0, 0]} maxBarSize={28} />`
3. `<Area type="monotone" dataKey="cumulativeBalance" stroke="#34d399" fill="url(#cumulativeBalanceGradient)" strokeWidth={2.5} />`
4. `<ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />` delimitando superávit e déficit acumulados.
5. Linha de referência opcional para Meta de Reserva de Emergência (`ReferenceLine y={emergencyFundTarget} stroke="#f59e0b" strokeDasharray="4 4" label="Meta de Reserva"`), calculada a partir do `declaredMonthlyIncome` e `incomeType` do perfil financeiro.
6. Seletor de período no cabeçalho do card: chips acessíveis com estados `6M`, `12M` e `Tudo`.

### Rationale
- O `ComposedChart` combina perfeitamente barras discretas (entradas vs saídas de cada mês) com a linha/área contínua que evidencia a sensação de **subida** solicitada pelo usuário.
- O gradiente na área (`#cumulativeBalanceGradient`) inicia com opacidade ~25% no topo e transiciona para 0% na base, mantendo a estética minimalista da Spec 013 sem poluição visual.

---

## 3. Polimento Visual e Interatividade nos Gráficos Existentes

### Decisão
1. **`DonutChart` Tremor Raw (`components/ui/tremor/donut-chart.tsx`)**:
   - Adicionar `cornerRadius={6}` no componente `<Pie>` do Recharts, conferindo acabamento arredondado refinado a cada fatia.
   - Aprimorar o hover/foco: além de diminuir a opacidade das fatias não selecionadas (`fillOpacity={isDimmed ? 0.35 : 1}`), aplicar expansão radial suave no elemento ativo via borda destacada e raio levemente dilatado (`innerRadius="62%"` e `outerRadius="92%"`).
2. **`PeriodCashflowCard` (`components/dashboard/period-cashflow-card.tsx`)**:
   - Incluir alternador de modo de visualização no cabeçalho: `Diário` (visão pontual em barras) vs `Acumulado` (evolução contínua do saldo de caixa ao longo dos dias do mês via `AreaChart`).
   - Adicionar `maxBarSize={28}` no `BarChart` para impedir barras excessivamente largas quando houver poucos lançamentos.
   - Aplicar gradiente vertical luminoso nas barras (topo mais saturado, base sutilmente translúcida).
   - Enriquecer o `BarChartTooltip` exibindo o **Saldo Líquido do Dia/Ponto** (`receitas - despesas - faturas`).

### Rationale
- O alternador `Diário` / `Acumulado` responde diretamente à demanda do usuário de ver a "subida" financeira tanto no longo prazo (multi-mês) quanto no curto prazo (dia a dia do mês de competência).

---

## 4. Indicadores MoM e Mini Sparklines nos Cartões de Métricas (`MetricCard`)

### Decisão
1. **Variação MoM (Month-over-Month)**:
   - Calcular percentual de variação: `((valorAtual - valorAnterior) / valorAnterior) * 100`.
   - Inversão de semântica financeira para Despesas: aumento de gastos = status negativo/alerta (vermelho/rose), redução de gastos = status positivo (verde/esmeralda).
   - Renderizar no `MetricCard` como badge sutil com ícone de seta (`ArrowUpRight` / `ArrowDownRight`).
2. **Mini Sparklines**:
   - Componente ultraleve `SparklineChart` (~32px de altura) baseado em `AreaChart` do Recharts sem eixos, sem grid e com margens zeradas, recebendo array numérico simples `values: number[]`.
   - Renderização no rodapé do `MetricCard` com preenchimento em gradiente discreto coerente com a cor variante do card (`positive`, `negative`, `warning`, `default`).

### Rationale
- Transforma os cartões estáticos de KPI em instrumentos analíticos dinâmicos de alta legibilidade executiva, sem quebrar o layout existente.

---

## 5. Alocação de Ativos e Séries Temporais em Contas (`/accounts`)

### Decisão
1. **Barra de Alocação de Patrimônio**:
   - Criar `AccountAllocationBar` que agrupa os saldos das contas por tipo (`CHECKING`, `INVESTMENT`, `CASH`, `CREDIT_CARD`), calcula a proporção percentual de cada fatia sobre o patrimônio total e renderiza uma barra horizontal segmentada com cantos arredondados, tooltip informativo e cores canônicas.
2. **Ativação de Séries Temporais de Patrimônio**:
   - Conectar o componente existente `InvestmentTimeSeriesChart` (baseado em TradingView `lightweight-charts` v5) em `app/(dashboard)/accounts/page.tsx`, alimentando-o com a evolução dos saldos das contas ou saldo consolidado calculado.

---

## 6. Acessibilidade e Preferência de Movimento (`prefers-reduced-motion`)

### Decisão
- Utilizar o hook já homologado `usePrefersReducedMotion` para desativar animações de desenho contínuo (`isAnimationActive={!prefersReducedMotion}`) em todos os gráficos novos e aprimorados.
- Preservar alinhamento estrito em dispositivos móveis (`>= 320px`) com tamanhos mínimos de toque (`44px` de altura para botões e seletores).
