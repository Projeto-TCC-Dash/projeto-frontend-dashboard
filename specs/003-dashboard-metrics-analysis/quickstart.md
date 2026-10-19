# Quickstart & Verification Guide: Dashboard Financeiro e Análise Mensal com IA

**Feature Branch**: `003-dashboard-metrics-analysis`  
**Date**: 2026-10-19  
**Status**: Ready for Implementation  

---

## 1. Prerequisites & Environment Setup

1. Certifique-se de que as dependências do projeto estejam instaladas:
   ```bash
   pnpm install
   ```
2. Verifique se a compilação estática TypeScript e os testes existentes passam sem erros:
   ```bash
   pnpm typecheck
   pnpm test
   ```

---

## 2. Test Execution & Coverage Verification

A entrega desta funcionalidade é validada por uma suíte de testes automatizados com Vitest e React Testing Library, abrangendo utilitários, hooks customizados e componentes de interface.

### 2.1 Executar os Testes da Funcionalidade

```bash
# Executa toda a suíte de testes em modo run único
pnpm test

# Ou executa os testes específicos do dashboard
pnpm vitest run components/dashboard hooks/use-financial-analysis lib/formatters
```

### 2.2 Cenários Cobertos nos Testes Automatizados

1. **`lib/formatters.test.ts`**:
   - Formatação de moeda BRL (`R$ 1.250,50`).
   - Formatação percentual (`25,4%`).
   - Formatação de competência `YYYY-MM` para extenso (`"Outubro de 2026"`).
   - Cálculo seguro e formatação da taxa de poupança (retornando `0.0%` e status de déficit quando despesas > receitas ou receitas = 0).

2. **`hooks/use-financial-analysis.test.tsx`**:
   - Consulta reativa de `GET /api/analysis/:month` com token JWT.
   - Chamada de recálculo com `forceRefresh=true` via `refreshAnalysis()`.
   - Tratamento de status de cache (`cached: true/false`).
   - Tratamento resiliente de erro 403 (chave ausente) e 503 (alta demanda upstream).

3. **`components/dashboard/metric-card.test.tsx`**:
   - Renderização dos 4 cards de KPIs (Receitas, Despesas, Saldo Líquido e Taxa de Poupança).
   - Indicação semântica de superávit (verde/positivo) vs déficit (alerta/vermelho).
   - Exibição do badge `"Sem poupança / Déficit orçamentário"` em caso de saldo negativo.
   - Estado de carregamento com skeleton.

4. **`components/dashboard/category-donut-chart.test.tsx`**:
   - Renderização das fatias proporcionais para todas as categorias com despesa > 0.
   - Exibição de tooltips com valor e percentual ao interagir.
   - Navegação por drill-down para `/transactions?month=YYYY-MM&category=...` ao clicar na fatia ou item da legenda.
   - Estado vazio quando não houver despesas registradas no período.

5. **`components/dashboard/ai-diagnosis-card.test.tsx`**:
   - Renderização rica e sanitizada do texto em Markdown (`diagnosis`).
   - Renderização da lista destacada de recomendações práticas.
   - Exibição do badge de status de cache e disparo do botão "Recalcular Diagnóstico".
   - Fallback BYOK amigável quando `hasAiKey === false`, acionando o modal de configuração de chave de IA.
   - Tratamento gracioso de erros 429 e 503 com opção de retentativa.

---

## 3. Manual Interactive Verification Flow

Para homologar a interface manualmente em ambiente local:

1. **Iniciar o Servidor de Desenvolvimento**:
   ```bash
   pnpm dev
   ```
2. **Acessar a Aplicação**:
   - Abra [http://localhost:3000/dashboard](http://localhost:3000/dashboard) no navegador.
   - Autentique-se com um usuário válido ou crie uma conta.

3. **Verificação dos Indicadores (KPIs)**:
   - Verifique os 4 cartões no topo: Receitas Totais, Despesas Totais, Saldo Líquido e Taxa de Poupança.
   - Se houver despesas maiores que receitas, confirme o badge de alerta `"Sem poupança / Déficit orçamentário"` no cartão de taxa de poupança.

4. **Verificação do Gráfico de Categorias e Drill-down**:
   - Passe o cursor sobre o gráfico de rosca e valide os tooltips.
   - Clique em uma categoria (ex: `"Alimentação"`) e confirme que a navegação o direciona para `/transactions?month=YYYY-MM&category=Alimentação`.

5. **Verificação do Diagnóstico por IA e Cache**:
   - Se o usuário tiver chave configurada: visualize o parecer analítico renderizado em Markdown e as recomendações.
   - Clique em "Recalcular Diagnóstico" e comprove o feedback de loading e a atualização do parecer.
   - Se o usuário não tiver chave: confirme a exibição do card educativo e clique no botão para abrir o modal BYOK.

6. **Verificação do Seletor de Competência**:
   - Alterne o mês selecionado no topo e confirme a atualização reativa de todos os componentes da tela sem reload completo de página.
