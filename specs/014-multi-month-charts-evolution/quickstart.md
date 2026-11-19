# Quickstart: Validação e Homologação da Evolução Visual e Gráficos Multi-Mês

**Feature Branch**: `014-multi-month-charts-evolution` | **Date**: 2026-11-18

---

## 1. Pré-Requisitos e Preparação de Ambiente

Certifique-se de que o ambiente local possui os pacotes instalados e o servidor de desenvolvimento pode ser executado:

```bash
# 1. Validar integridade de dependências
pnpm install

# 2. Executar checagem estática de tipagem estrita
pnpm typecheck

# 3. Executar suíte completa de testes automatizados existentes
pnpm test
```

---

## 2. Cenários de Validação Automatizada (Testes Unitários & Integração)

### 2.1 Funções Puras de Séries Históricas e Tendências

Executar os testes automatizados para verificar cálculos de agregação:

```bash
pnpm test lib/dashboard-charts.test.ts
```

**Resultados Esperados**:
- [x] Agrupamento correto de múltiplos meses a partir de transações brutas.
- [x] Preenchimento de lacunas (flatline constante de saldo acumulado em meses sem transações).
- [x] Cálculo da curva acumulada (`cumulativeBalance`) demonstrando a subida correta.
- [x] Cálculo determinístico da tendência MoM com inversão semântica para despesas.
- [x] Proporções percentuais corretas na barra de alocação de contas.

### 2.2 Componentes Gráficos Refinados e Acessibilidade

Executar os testes dos componentes de UI:

```bash
pnpm test components/dashboard/
pnpm test components/ui/tremor/
pnpm test components/charts/
pnpm test components/accounts/
```

**Resultados Esperados**:
- [x] `MultiMonthEvolutionChart` renderiza barras mensais + curva de subida + seletores 6M/12M/Tudo.
- [x] `PeriodCashflowCard` alterna fluidamente entre visão diária (barras com gradiente) e visão acumulada (área).
- [x] `DonutChart` renderiza fatias com `cornerRadius={6}` e responde a hover/toque.
- [x] `MetricCard` exibe selos comparativos MoM e mini sparkline.
- [x] `prefers-reduced-motion` desativa animações contínuas sem quebrar o layout.

---

## 3. Roteiro de Inspeção Visual no Navegador

Inicie a aplicação localmente:

```bash
pnpm dev
```

Acesse `http://localhost:3001` e execute a seguinte checklist visual:

1. **Dashboard Principal (`/`)**:
   - **Topo (KPIs)**: Observe os 5 cartões de resumo com os selos de variação percentual vs. mês anterior e a mini curva no rodapé.
   - **Gráfico Histórico de Longo Prazo**: Localize o card de "Evolução Financeira", alterne entre `6M`, `12M` e `Tudo`, e verifique a curva verde contínua demonstrando a subida do saldo acumulado.
   - **Fluxo do Período**: No card inferior esquerdo do Bento Grid, clique no alternador para o modo "Acumulado" e observe a curva de caixa diária subindo e descendo com as movimentações.
   - **Distribuição por Categorias**: Passe o cursor sobre o gráfico de rosca e note as extremidades arredondadas das fatias e o destaque ampliado.

2. **Gestão de Contas (`/accounts`)**:
   - Logo abaixo do cartão de "Patrimônio Líquido Total", verifique a barra horizontal segmentada demonstrando a alocação de ativos por categoria de conta.
   - Observe a ativação da área de séries temporais de patrimônio com o gráfico do TradingView.

3. **Modos de Exibição e Responsividade**:
   - Alterne entre modo claro e escuro no cabeçalho e confirme que todos os gráficos atualizam as cores de fundo, eixos e gradientes imediatamente.
   - Abra as ferramentas de desenvolvedor (F12) e redimensione para 375px (iPhone) e 1440px+ (Desktop) para confirmar ausência de rolagem horizontal espúria.
