# Feature Specification: Dashboard com Segregação de Faturas e Diagnóstico IA Calibrado

**Feature Branch**: `feature/008-dashboard-invoice-segregation-profile`

**Created**: 2026-10-24

**Status**: Ready

**Input**: User description: "Atualizar o dashboard financeiro para exibir card segregado de Quitação de Faturas (invoiceSettlements), recalcular saldo líquido sem duplicidade contábil, ajustar gráfico de distribuição para as 11 categorias canônicas e exibir diagnóstico da IA com metas de reserva calibradas pelo perfil de renda e metas do usuário."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Card de Quitação de Faturas e Saldo Líquido Atualizado no Grid de KPIs (Priority: P1) 🎯 MVP

Como pessoa usuária que gerencia seu orçamento através do Dashboard, desejo ver um card de KPI dedicado para "Quitação de Faturas" (`invoiceSettlements`) ao lado das Despesas Primárias (Consumo Real), com o Saldo Líquido refletindo a saída real de caixa (`totalIncome - totalExpenses - invoiceSettlements`), para que eu compreenda exatamente quanto gastei em consumo versus quanto destinei ao pagamento do cartão sem sofrer com duplicidade contábil.

**Why this priority**: É a principal causa de distorção contábil no dashboard pessoal. Sem segregar faturas, os usuários que importam extratos e pagamentos de cartão veem números inflados de consumo e saldos errôneos.

**Independent Test**: Pode ser testado na tela `/` (Dashboard) fornecendo uma resposta de análise com `totalIncome: 10000`, `totalExpenses: 3000` e `invoiceSettlements: 2000`. O grid deve exibir o card "Receitas Totais" (R$ 10.000,00), o card "Despesas Primárias" (R$ 3.000,00), o novo card "Quitação de Faturas" (R$ 2.000,00) e o card "Saldo Líquido" (+R$ 5.000,00), acompanhado da Taxa de Poupança baseada nas despesas de consumo.

**Acceptance Scenarios**:

1. **Given** as métricas financeiras retornadas por `GET /api/analysis/:month`, **When** o componente `MetricCardsGrid` é renderizado, **Then** um novo card de KPI "Quitação de Faturas" é exibido com o valor formatado em BRL (`formatCurrencyBRL(metrics.invoiceSettlements ?? 0)`), ícone semântico de cartão de crédito e descrição informativa "Liquidação de cartão".
2. **Given** o card de despesas, **When** exibido no dashboard, **Then** seu título e descrição evidenciam "Despesas Primárias" ("Consumo real do mês"), deixando explícito que faturas de cartão não estão duplicadas neste total.
3. **Given** receitas, despesas primárias e liquidação de faturas informadas, **When** o Saldo Líquido é computado, **Then** seu valor reflete exatamente `totalIncome - totalExpenses - (invoiceSettlements ?? 0)`, exibindo indicador positivo/negativo com a formatação correta de superávit ou déficit.
4. **Given** um mês sem nenhuma transação de pagamento de fatura (`invoiceSettlements: 0` ou ausente), **When** o grid é renderizado, **Then** o card de "Quitação de Faturas" exibe R$ 0,00 de maneira limpa e consistente sem erros visuais ou quebras de layout responsivo.

---

### User Story 2 - Gráfico de Rosca com Suporte às 11 Categorias Canônicas Oficiais (Priority: P1) 🎯 MVP

Como pessoa usuária visualizando o gráfico de pizza/rosca de categorias (`CategoryDonutChart`), desejo que a paleta de cores suporte com fidelidade as 11 categorias canônicas oficiais (incluindo "Pagamento de Fatura" com `#64748B` e "Investimentos" com `#06B6D4`), e que a proporção de consumo reflita estritamente o montante real de despesas primárias.

**Why this priority**: Garante consistência visual completa com a Feature 007 e impede que categorias canônicas recém-criadas fiquem sem cor identificada ou com rótulos genéricos.

**Independent Test**: Pode ser testado fornecendo fatias contendo categorias como "Investimentos" e verificando que a cor Ciano (`#06B6D4`) é atribuída no SVG do donut e na legenda interativa com drill-down.

**Acceptance Scenarios**:

1. **Given** o mapa de cores `CATEGORY_COLORS` em `category-chart-legend.tsx`, **When** consultado para a categoria "Pagamento de Fatura", **Then** a cor associada é `#64748B` (Slate).
2. **Given** o mapa de cores `CATEGORY_COLORS`, **When** consultado para a categoria "Investimentos", **Then** a cor associada é `#06B6D4` (Cyan).
3. **Given** as maiores categorias de despesa retornadas pela API, **When** renderizadas no donut, **Then** a soma das porcentagens tem como base o montante de despesas primárias, assegurando proporção fidedigna de estilo de vida.
4. **Given** o clique em qualquer fatia ou item da legenda, **When** acionado, **Then** a navegação drill-down direciona para `/transactions?month=...&category=...` preservando a capacidade de auditoria.

---

### User Story 3 - Parecer de IA com Diretriz de Reserva de Emergência Calibrada ao Perfil de Renda (Priority: P2)

Como pessoa usuária que informou seu perfil financeiro (regime de renda CLT, PJ/Autônomo, Servidor Público, etc.), desejo que o Card de Diagnóstico do Mês (`AiDiagnosisCard`) apresente uma diretriz contextual de Reserva de Emergência sob medida baseada no meu regime de renda e nas minhas despesas reais do mês, para que eu saiba a meta financeira em valor monetário que devo alcançar.

**Why this priority**: Conecta diretamente a inteligência artificial ao onboarding voluntário da Feature 005. Dá sentido prático ao regime de renda informado pelo usuário, traduzindo o percentual de gastos em segurança financeira real.

**Independent Test**: Pode ser testado renderizando `AiDiagnosisCard` para um usuário com `incomeType: 'PJ_AUTONOMO'` e despesas primárias de R$ 3.000: o card deve apresentar um destaque informativo orientando a meta de reserva de 6 a 12 meses (R$ 18.000 a R$ 36.000); para um usuário `CLT`, deve orientar a meta de 3 a 6 meses (R$ 9.000 a R$ 18.000).

**Acceptance Scenarios**:

1. **Given** um usuário com perfil `CLT` ou `PUBLIC_SERVANT` e despesas primárias no mês, **When** o card de diagnóstico é renderizado, **Then** um bloco informativo/badge destaca a recomendação de reserva de emergência calibrada para 3 a 6 meses de gastos básicos.
2. **Given** um usuário com perfil `PJ_AUTONOMO` ou `ENTREPRENEUR` e despesas primárias no mês, **When** o card de diagnóstico é renderizado, **Then** a recomendação é calibrada para 6 a 12 meses de despesas básicas devido à maior oscilação de renda.
3. **Given** um usuário que ainda não informou seu regime de renda, **When** o card é renderizado, **Then** a recomendação utiliza a média prudencial de mercado (6 meses) e convida gentilmente a personalizar o perfil em `/settings/profile`.
4. **Given** o valor monetário das despesas primárias do mês, **When** a diretriz é exibida, **Then** a faixa estimada de reserva em reais (BRL) é calculada e apresentada dinamicamente (ex: `3x a 6x despesas`).

---

### User Story 4 - Alinhamento Contextual de Recomendações às Metas Declaradas pelo Usuário (Priority: P3)

Como pessoa usuária que declarou suas metas financeiras prioritárias (ex: `QUITAR_DIVIDAS`, `RESERVA_EMERGENCIA`, `INVESTIR_LONGO_PRAZO`), desejo que as recomendações práticas geradas pelo Gemini no diagnóstico recebam identificadores ou destaques visuais alinhados às minhas metas ativas, facilitando o acompanhamento do plano de ação.

**Why this priority**: Aumenta o engajamento e a personalização da IA, fazendo com que o usuário perceba que o assistente realmente trabalha para seus objetivos particulares.

**Independent Test**: Pode ser testado fornecendo metas declaradas no perfil do usuário (ex: `QUITAR_DIVIDAS`) e verificando que a seção de recomendações práticas exibe chips temáticos com as metas prioritárias ativas do usuário.

**Acceptance Scenarios**:

1. **Given** um usuário com metas cadastradas em `financialProfile.goals`, **When** a seção de recomendações do `AiDiagnosisCard` é renderizada, **Then** badges/chips com os rótulos amigáveis das metas ativas são exibidos no cabeçalho da seção de recomendações.
2. **Given** um usuário sem metas cadastradas, **When** a seção de recomendações é renderizada, **Then** as recomendações são apresentadas normalmente no formato padrão sem quebras de layout.

---

### Edge Cases

- **Mês com despesas primárias zeradas (`totalExpenses = 0`)**: O cálculo da diretriz de reserva de emergência não gera valores negativos ou `NaN`; caso não haja gastos base, exibe mensagem neutra convidando ao registro de despesas ou utilizando a renda declarada como referência.
- **Usuário sem perfil financeiro cadastrado**: O dashboard funciona de maneira 100% resiliente com valores padrão de mercado, exibindo o banner de convite ao onboarding sem bloquear nenhum recurso do painel.
- **Mês com apenas faturas de cartão e zero despesas primárias adicionais**: O saldo líquido subtrai a liquidação de fatura com precisão e a taxa de poupança opera normalmente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O componente `MetricCardsGrid` DEVE exibir 5 cards de KPI responsivos quando houver métricas disponíveis: Receitas Totais, Despesas Primárias, Quitação de Faturas, Saldo Líquido e Taxa de Poupança.
- **FR-002**: O cálculo do Saldo Líquido exibido no card DEVE descontar tanto as despesas primárias quanto as quitações de fatura: `netBalance = totalIncome - totalExpenses - (invoiceSettlements ?? 0)`.
- **FR-003**: A interface DEVE utilizar a tipagem canônica `FinancialMetrics` estendida com o campo opcional `invoiceSettlements?: number` em `src/types/api.ts`.
- **FR-004**: O mapa de cores `CATEGORY_COLORS` DEVE incluir explicitamente as cores semânticas oficiais das 11 categorias canônicas: "Pagamento de Fatura" (`#64748B`) e "Investimentos" (`#06B6D4`).
- **FR-005**: O componente `AiDiagnosisCard` DEVE receber ou acessar o perfil financeiro do usuário (`FinancialProfile`) para exibir a diretriz calibrada de reserva de emergência sob medida.
- **FR-006**: A diretriz de reserva de emergência DEVE recomendar 3 a 6 meses para `CLT` e `PUBLIC_SERVANT`, 6 a 12 meses para `PJ_AUTONOMO` e `ENTREPRENEUR`, e 6 meses para perfis não informados ou outros regimes.
- **FR-007**: Quando o usuário possuir despesas primárias superiores a zero, a diretriz DEVE calcular a faixa monetária correspondente em BRL (ex: `formatCurrencyBRL(min)` a `formatCurrencyBRL(max)`).
- **FR-008**: O card de diagnóstico DEVE exibir badges das metas ativas do usuário quando `financialProfile.goals` contiver itens selecionados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das liquidações de fatura de cartão de crédito são visíveis em card segregado, com zero duplicidade em Despesas Primárias.
- **SC-002**: 100% de consistência contábil no Saldo Líquido do Dashboard refletindo `totalIncome - totalExpenses - invoiceSettlements`.
- **SC-003**: 100% das 11 categorias canônicas mapeadas com cores exclusivas no gráfico de rosca e na legenda.
- **SC-004**: 100% de testes automatizados unitários e de integração verdes (`pnpm test`) cobrindo os novos componentes, cálculos e cenários de renderização.
