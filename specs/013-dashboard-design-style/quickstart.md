# Quickstart & Validation Guide: Estilização Visual dos Dashboards

**Feature Branch**: `feature/013-dashboard-design-style` | **Date**: 2026-11-12

Este guia descreve os passos de verificação após a implementação dos requisitos de [spec.md](file:///home/debhg/Projetos/projeto-frontend-dashboard/specs/013-dashboard-design-style/spec.md), seguindo os contratos em [design-visualization-contracts.md](file:///home/debhg/Projetos/projeto-frontend-dashboard/specs/013-dashboard-design-style/contracts/design-visualization-contracts.md) e o modelo em [data-model.md](file:///home/debhg/Projetos/projeto-frontend-dashboard/specs/013-dashboard-design-style/data-model.md).

---

## 1. Pré-requisitos e Verificação de Dependências

1. Confirmar que a branch ativa é `feature/013-dashboard-design-style`.
2. Após instalação das dependências previstas no plano (`recharts`, `react-is`, `lightweight-charts`, `@number-flow/react`, `motion`, `@formkit/auto-animate`), verificar o alinhamento de `react-is` com `react` 19 no `package.json` / `pnpm-lock.yaml` para evitar conflitos de peer dependencies com Recharts.

---

## 2. Validação Estática e Build

Executar a suíte padrão de qualidade exigida pela Constituição do projeto:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

**Resultados Esperados**:
- Zero erros de TypeScript (`strict: true`, zero uso de `any`).
- Zero erros de lint ou diretivas inválidas de Client Components (`'use client'`).
- Build Next.js concluído sem falhas de SSR em componentes que utilizam Canvas (`lightweight-charts`) ou DOM refs (`@number-flow/react`, `@formkit/auto-animate`).

---

## 3. Validação Automatizada (Vitest & Testing Library)

```bash
pnpm test
```

**Resultados Esperados**:
- 100% dos testes existentes permanecem aprovados sem regressão nos seletores e regras contábeis (`MetricCard`, `MetricCardsGrid`, `CategoryDonutChart`, `PeriodCashflowCard`, `AiDiagnosisCard`, `DashboardPage`, `Navbar`, `TransactionTable`, `AccountSection`).
- Novos cenários automatizados validam:
  - `lib/dashboard-charts.ts`: agregação semanal e fallback de fluxo do período, preservando segregação de `Pagamento de Fatura`.
  - Componentes Tremor Raw (`DonutChart`, `BarList`, `BarChart`, `ProgressBar`) e `PeriodCashflowCard`: renderização simultânea empilhada abaixo de Categorias, estado vazio, tooltips e sincronia de destaque/clique *drill-down*.
  - `AiDiagnosisCard` (`matchedDesktopHeight`): cabeçalho fixo (`xl:shrink-0`), corpo com rolagem interna (`xl:flex-1 xl:min-h-0 xl:overflow-y-auto`) e igualação estrutural ao slot direito em todos os estados.
  - `InvestmentTimeSeriesChart`: inicialização com API v5, troca dinâmica de tema (`light` ↔ `dark`), formatação BRL no crosshair, limpeza no unmount e estado vazio sem dados fictícios.
  - `AnimatedNumberValue`, `BorderBeam` e acessibilidade `prefers-reduced-motion`: supressão automática de animações quando movimento reduzido está ativo e ausência de animação ativa em estados de erro/chave BYOK pendente.

---

## 4. Roteiro de Verificação Visual & Interativa (`pnpm dev`)

Subir o servidor local (`pnpm dev` na porta `3001`) e validar no navegador:

1. **Estética Preservada & Bento Grid Empilhado**:
   - Abrir `/` em desktop (`>=1280px`) nos modos **Claro** e **Escuro**: confirmar manutenção da paleta neutra e disposição em que a coluna esquerda (`7/12`) exibe **Distribuição por Categorias** acima e **Fluxo do Período** logo abaixo como cards independentes, enquanto a coluna direita (`5/12`) exibe o **Parecer do Consultor Financeiro** exatamente na mesma altura somada dos dois cards à esquerda (mesma linha de base).
   - Em parecer longo, verificar que título, badge e botão `"Recalcular Diagnóstico"` permanecem fixos no topo do card e apenas o corpo rola com o mouse; em estados curtos (ou BYOK pendente / erro / vazio), confirmar que o card preserva a mesma altura sem barra de rolagem desnecessária.
   - Redimensionar para `320px`, `375px`, `768px` e `1024px`: confirmar zero scroll horizontal, empilhamento em 1 coluna e altura natural sem barra de rolagem interna presa.
2. **Gráficos Tremor Raw & Drill-down**:
   - No card **Distribuição por Categorias**, passar o cursor/tocar em segmentos do `DonutChart` e itens do `BarList` confirmando destaque sincronizado e tooltip em BRL.
   - Clicar em uma categoria e validar redirecionamento para `/transactions?month=YYYY-MM&category=...`.
   - Logo abaixo no card **Fluxo do Período**, verificar simultaneamente (sem precisar clicar em abas) as barras comparativas de Receitas vs. Despesas (e Faturas quando houver) com tooltip formatado.
3. **Animações e Troca Rápida de Meses**:
   - Navegar rapidamente entre 3 meses no `MonthSelector`: confirmar transição numérica fluida nos KPIs (`tabular-nums`, sem tremor horizontal) e estabilização imediata nos valores do último mês selecionado.
   - Acionar `"Recalcular Diagnóstico"` no `AiDiagnosisCard` e verificar destaque sutil em borda durante o carregamento.
   - Navegar entre links da `Navbar` no desktop e confirmar deslizamento suave do indicador ativo.
   - Filtrar transações ou categorias e observar reposicionamento suave das listas.
4. **Base `lightweight-charts` & Acessibilidade**:
   - Em página/story ou teste de verificação isolado do `InvestmentTimeSeriesChart`, validar crosshair em BRL, zoom/pan e alternância de tema via atalho `d` ou `ThemeToggle`.
   - Ativar **Reduzir movimento** nas preferências de acessibilidade do SO / DevTools (`Emulate CSS media feature prefers-reduced-motion: reduce`) e confirmar supressão imediata de animações contínuas e deslocamentos.
