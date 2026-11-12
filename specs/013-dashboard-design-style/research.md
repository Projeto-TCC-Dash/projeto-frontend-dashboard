# Research & Architecture Decisions: Estilização Visual dos Dashboards, Visualizações Analíticas e Animações

**Feature Branch**: `feature/013-dashboard-design-style` | **Date**: 2026-11-12

---

## 1. Preservação Estética, Tokens de Tema e Mapeamento de Gráficos (`app/globals.css` & `lib/chart-utils.ts`)

- **Decision**: Preservar integralmente a paleta neutra atual (`oklch` em `:root` e `.dark`), os raios de borda (`--radius: 0.625rem`), as fontes `Geist` / `Geist_Mono` e as cores semânticas existentes (`emerald`, `rose`, `amber`, `sky`, mais as 11 cores canônicas em `CATEGORY_COLORS`), atualizando exclusivamente os tokens `--chart-1`..`--chart-5` em `app/globals.css` (hoje em escala de cinza) e criando um mapa centralizado em `lib/chart-utils.ts` compatível com Tremor Raw e `lightweight-charts`.
- **Rationale**:
  - O usuário solicitou manter a mesma estética da plataforma. Manter `--background`, `--card`, `--border`, `--primary` e `--muted` intactos evita alteração de identidade visual.
  - Atualmente `--chart-1`..`--chart-5` em `app/globals.css` estão definidos como cinzas puros (`oklch(0.87 0 0)` a `oklch(0.269 0 0)`). Alinhá-los com cores semânticas discretas (esmeralda, azul, âmbar, violeta e ciano) e centralizar os utilitários de cor em `lib/chart-utils.ts` garante consistência entre os gráficos Tremor Raw e os modos claro/escuro.
- **Alternatives considered**:
  - Substituir toda a paleta do app por um tema colorido (ex: Tweakcn com `--background` azulado e `--primary` verde): rejeitado porque alteraria a estética neutra atual, contrariando o requisito explícito de preservação visual.

---

## 2. Adoção de Tremor Raw em React 19 + Tailwind CSS v4

- **Decision**: Adotar a arquitetura copy-paste do **Tremor Raw** em `components/ui/tremor/` (`donut-chart.tsx`, `bar-list.tsx`, `bar-chart.tsx`, `progress-bar.tsx`) usando:
  - `recharts` (`^2.15.x` ou `^3.x`) + dependência explícita `react-is` alinhada ao React 19 (`pnpm.overrides` em `package.json` garantindo `react-is` compatível com `19.x`) para `DonutChart` e `BarChart`;
  - Implementação pura React + Tailwind CSS v4 (sem Recharts) para `BarList` e `ProgressBar`;
  - Renderização simultânea em dois cards independentes empilhados (`CategoryDonutChart` acima e `PeriodCashflowCard` abaixo), evitando complexidade desnecessária de tabs (`role="tablist"`) e tornando ambas as visões imediatamente legíveis no painel.
- **Rationale**:
  - Tremor Raw é copy-paste sobre Tailwind, portanto não impõe `tailwind.config.js` legado (incompatível com Tailwind v4 `@import "tailwindcss";`) e permite controle total de tipagem estrita TypeScript (`strict: true`, zero `any`).
  - Em React 19, `recharts` depende internamente de `react-is`; sem alinhar `react-is` para a versão 19, gráficos Recharts podem renderizar vazios ou gerar conflitos de peer dependencies no `pnpm`. Fixar `react-is` nas overrides previne esse problema desde a instalação.
  - Reutilizar `@base-ui/react` mantém o `bundle` enxuto e respeita o Princípio II da Constituição (baseline do projeto).
- **Alternatives considered**:
  - Instalar `@tremor/react` (pacote legado v3): rejeitado porque exige configuração de `tailwind.config.js` v3 e possui conflitos de peer dependencies com React 19 e Tailwind v4.
  - Usar `shadcn/ui` charts isolado sem Tremor Raw: rejeitado porque o solicitante escolheu explicitamente o padrão visual Tremor Raw (`DonutChart` + `BarList` + `BarChart` + `ProgressBar`).

---

## 3. Visão Complementar de Fluxo do Período com Dados Existentes (`lib/dashboard-charts.ts`)

- **Decision**: Construir o card comparativo independente de fluxo do período (`PeriodCashflowCard` usando `BarChart` do Tremor Raw) a partir de agregação pura client-side em `lib/dashboard-charts.ts` (`buildPeriodCashflowSeries`) consumindo `useTransactions({ month: selectedMonth })` e `metrics` (`totalIncome`, `totalExpenses`, `invoiceSettlements`) já disponíveis via `useFinancialAnalysis(selectedMonth)`.
- **Rationale**:
  - A spec e a arquitetura garantem zero alterações de backend (`Assumptions`: sem novos endpoints REST).
  - As transações retornadas por `GET /api/transactions?month=YYYY-MM` possuem `amount` (positivo = receita, negativo = despesa), `date` (ISO 8601) e `category` (permitindo segregar `"Pagamento de Fatura"` exatamente como na regra contábil da Feature 008!).
  - Agrupar por semanas do mês (`Sem 1`..`Sem 4/5`) ou dia com barras comparativas **Receitas** vs **Despesas Primárias** entrega valor analítico imediato ao lado da visão de categorias.
  - Quando a lista de transações ainda estiver carregando ou vazia em testes de integração que só mockam `useFinancialAnalysis`, um fallback limpo exibe barras de resumo consolidado do mês (`Receitas`, `Despesas Primárias`, `Faturas`, `Saldo`) ou estado vazio proporcional sem quebrar componentes.
- **Alternatives considered**:
  - Criar novo endpoint de série diária no backend: rejeitado por estar fora do escopo frontend e violar a premissa de dados existentes.

---

## 4. Fundação Reutilizável com `lightweight-charts` v5 para Futuros Dashboards de Investimentos

- **Decision**: Instalar `lightweight-charts` (`^5.x`) e encapsulá-lo em um componente client-side desacoplado `components/charts/investment-time-series-chart.tsx` utilizando a API oficial v5 `chart.addSeries(AreaSeries | LineSeries | CandlestickSeries, options)` com:
  - Sincronização dinâmica com `useTheme()` (`resolvedTheme` do `next-themes`) via `chart.applyOptions(...)`;
  - Redimensionamento automático via `ResizeObserver` (`autoSize: true` / `applyOptions({ width })`) com limpeza segura no `unmount`;
  - Tooltip/legenda de crosshair reativa formatando valores em BRL (`formatCurrencyBRL`) e datas em `pt-BR`;
  - Estado vazio padronizado quando `data.length === 0` (nunca exibindo cotações fictícias em telas produtivas);
  - Contrato de dados genérico (`InvestmentTimeSeriesPoint` / `InvestmentOhlcPoint`) em `src/types/charts.ts`.
- **Rationale**:
  - Na v5 de `lightweight-charts`, métodos antigos como `chart.addAreaSeries()` foram removidos em favor de `chart.addSeries(AreaSeries, ...)`. Documentar e usar a API v5 evita erros de compilação TypeScript.
  - Como `lightweight-charts` opera diretamente sobre `<canvas>` via DOM imperativo (`useRef` + `useEffect`), não possui conflitos de reconciliação com React 19, desde que isolado em `'use client'` e com verificação de ambiente browser.
  - Configurar `handleScroll: { mouseWheel: false, pressedMouseMove: true }` (ou ativar zoom com modificador/botão) evita sequestrar o scroll vertical da página em notebooks e dispositivos móveis.
- **Alternatives considered**:
  - `lightweight-charts` v4: rejeitado por ser linha anterior sem suporte às otimizações e API unificada `addSeries` da v5.
  - Renderizar série mockada de ativos no dashboard principal hoje: rejeitado pela `FR-009` (não exibir cotações fictícias em produção na ausência de dados reais).

---

## 5. Conjunto Completo de Animações, Micro-Interações e Acessibilidade (`prefers-reduced-motion`)

- **Decision**: Integrar as quatro frentes de animação solicitadas de forma coordenada, leve e acessível:
  1. **Contexto Global de Acessibilidade**: Adicionar `<MotionConfig reducedMotion="user">` em `components/providers.tsx` e criar hook/utilitário `hooks/use-reduced-motion.ts` (`window.matchMedia("(prefers-reduced-motion: reduce)")`) para coordenar bibliotecas fora do escopo do Motion.
  2. **Transição Numérica nos KPIs (`@number-flow/react`)**: Criar wrapper `components/ui/animated-number-value.tsx` configurando `locales="pt-BR"`, `format` (`currency: "BRL"` ou `percent`), `tabular-nums`, e `respectMotionPreference` / fallback estático imediato quando `numericValue` não for informado ou quando em ambiente SSR/teste sem custom elements completos.
  3. **Coreografia de Entrada e Indicador de Navegação (`motion` via `motion/react`)**:
     - Entrada escalonada discreta nos cards de `MetricCardsGrid` e blocos Bento da `DashboardPage` (`opacity` + `y: 10 -> 0`, duração `<= 0.22s`);
     - Indicador ativo deslizante (`layoutId="navbar-active-pill"`) na `Navbar` desktop.
  4. **Destaque Sutil no Cartão de IA (`BorderBeam` — padrão Magic UI em CSS/Tailwind v4)**:
     - Criar `components/ui/border-beam.tsx` usando exclusivamente CSS `@keyframes` + `mask-composite` (zero runtime JS pesado, respeitando `@media (prefers-reduced-motion: reduce)`), exibido em modo sutil durante `isRefreshing` e acabamento suave quando `analysis` está pronto, completamente desligado em estados `!hasAiKey`, `error` ou `!analysis`.
  5. **Animação Automática em Listas (`@formkit/auto-animate`)**:
     - Aplicar `useAutoAnimate` via wrapper seguro `hooks/use-safe-auto-animate.ts` (que desabilita automaticamente via `enable(!prefersReducedMotion)`) em `BarList` / legenda de categorias, lista mobile de `TransactionTable` e grid de `AccountSection`.
- **Rationale**:
  - Importar de `motion/react` (pacote `motion`) garante compatibilidade nativa com React 19 sem warnings legados.
  - Isolar `BorderBeam` em CSS puro com `pointer-events-none` preserva cliques, acessibilidade e simplicidade de manutenção.
  - Usar `tabular-nums` + largura estável no `AnimatedNumberValue` impede tremor horizontal durante a rolagem numérica em `MetricCard` (atendendo `SC-003` e edge case de milhões/negativos).
- **Alternatives considered**:
  - Usar apenas animações CSS manuais para tudo: rejeitado porque perde a transição numérica inteligente (`@number-flow/react`), o `layoutId` fluido da navegação (`motion/react`) e o reposicionamento automático em listas filtradas (`@formkit/auto-animate`), além do solicitante ter aprovado explicitamente todas as animações sugeridas.

---

## 6. Layout Bento Grid Empilhado, Altura Igualada e Rolagem Interna no Parecer IA

- **Decision**: Evoluir `app/(dashboard)/page.tsx` mantendo `DashboardHeader`, `ProfileOnboardingBanner` e `MetricCardsGrid` no topo, e organizando a área analítica inferior em **Bento Grid responsivo** (`grid grid-cols-1 gap-6 xl:grid-cols-12`):
  - **Coluna esquerda (`xl:col-span-7 flex flex-col gap-6`)**: dois cards independentes sempre visíveis empilhados — `CategoryDonutChart` (**Distribuição por Categorias**) acima e `PeriodCashflowCard` (**Fluxo do Período**) diretamente abaixo, eliminando a navegação em abas.
  - **Coluna direita (`xl:col-span-5 xl:relative`)**: `AiDiagnosisCard` com prop `matchedDesktopHeight` usando posicionamento CSS puro no desktop (`xl:absolute xl:inset-0 xl:flex xl:flex-col xl:overflow-hidden`), fixando todos os cabeçalhos (`xl:shrink-0`) e delegando a rolagem com mouse exclusivamente ao corpo (`xl:flex-1 xl:min-h-0 xl:overflow-y-auto`) em todos os estados (`ready`, `processing`, `byok-pending`, `error`, `loading`, `empty`). Em telas `< 1280px` (`320px` a `1279px`), os estilos `xl:` não se aplicam, preservando altura natural no fluxo vertical da página sem barra de rolagem interna presa.
  - Em `MetricCard`: envolver o ícone em container sutil tintado por variante (`bg-emerald-500/10`, `bg-rose-500/10`, `bg-amber-500/10`, `bg-muted`) e adicionar uma barra compacta `ProgressBar` (Tremor Raw) opcional para o card de **Taxa de Poupança** mantendo a cor e o badge de déficit inalterados.
- **Rationale**:
  - Em CSS Grid (`grid-template-rows: auto`), se o card da coluna direita permanecesse no fluxo normal apenas com `xl:h-full`, um parecer longo expandiria a própria linha do grid e esticaria a coluna esquerda em vez de ativar rolagem interna. Ao tornar o slot esquerdo o definidor único da altura da linha (`H_left`) e posicionar o `AiDiagnosisCard` com `xl:absolute xl:inset-0` dentro do wrapper esticado (`xl:relative`, herdando `align-self: stretch` do grid), o card direito assume exatamente `H_left` em **100% dos casos**: quando o parecer é longo, rola internamente com o mouse mantendo título/status/*Recalcular Diagnóstico* visíveis no topo; quando é curto, BYOK pendente, vazio ou erro, preserva a mesma linha de base da coluna esquerda sem barra de rolagem desnecessária.
  - Em telas largas (`>=1280px`), empilhar os dois gráficos à esquerda reduz a altura da coluna direita ao nível exato da dupla de visualizações sem empurrar informações para longe da dobra inicial; em `< 1280px`, `grid-cols-1` preserva integralmente a responsividade da Feature 012.
- **Alternatives considered**:
  - Medir a altura da coluna esquerda via `ResizeObserver` em JS e aplicar `style={{ height }}` inline no `AiDiagnosisCard`: rejeitado por causar flash de layout na hidratação SSR, maior acoplamento entre colunas e complexidade desnecessária frente ao padrão puro em CSS Grid.
  - Manter apenas `xl:h-full` sem desacoplar a altura intrínseca do card direito: rejeitado porque CSS Grid expandiria a altura da linha pelo conteúdo maior do parecer, anulando o overflow interno no corpo.
  - Usar `max-height` fixa em pixels (ex.: `xl:max-h-[600px]`): rejeitado porque não acompanha dinamicamente a altura combinada exata dos dois cards da esquerda nem iguala estados mais curtos na linha de base (`Q2 → Opção A`).
  - Colocar `6/6` (metade-metade): rejeitado porque o `DonutChart` + `BarList` / `BarChart` precisa de largura ligeiramente maior (`7/12`) para manter legenda confortável ao lado do gráfico em `1280px`.

---

## 7. Estratégia de Testes em Vitest + `happy-dom` (Preservação dos 327+ Testes Existentes)

- **Decision**:
  - Adicionar polyfills determinísticos em `tests/setup.ts` para `ResizeObserver`, `window.matchMedia` (caso ausente no ambiente de teste) e fallback seguro para `@number-flow/react` caso o Web Component/Shadow DOM não inicialize completamente em `happy-dom`, garantindo que `screen.getByText("R$ 10.000,00")` e `screen.getByTestId("metric-value")` continuem funcionando sem falhas em `metric-card.test.tsx`, `metric-cards-grid.test.tsx` e `app/(dashboard)/page.test.tsx`.
  - Para Recharts em `happy-dom` (onde containers têm `clientWidth = 0`), adotar largura/altura de fallback ou mock limpo de `ResponsiveContainer` quando dimensões forem zero no DOM de teste, mantendo interação real de clique/hover no `BarList`, `DonutChart` e `data-testid` contratuais.
  - Para `lightweight-charts` em `happy-dom` (que não possui contexto Canvas 2D completo por padrão), validar `InvestmentTimeSeriesChart` via mock estruturado de `createChart` / `AreaSeries` testando: chamada de inicialização com opções de tema claro/escuro, `applyOptions` na troca de tema, `setData`, `subscribeCrosshairMove`, `remove()` no unmount e exibição real do estado vazio quando `data` estiver vazio.
  - Atualizar `app/(dashboard)/page.test.tsx` para incluir mock padrão de `useTransactions` caso `DashboardPage` passe transações ao gráfico de fluxo do período.
- **Rationale**:
  - Garante zero regressão nos testes existentes (Princípio VII da Constituição) enquanto valida comportamento real e contratos visuais dos novos componentes.
- **Alternatives considered**:
  - Trocar `happy-dom` por `jsdom` globalmente: rejeitado para não impactar performance nem quebrar configurações existentes de outros testes da suíte.
