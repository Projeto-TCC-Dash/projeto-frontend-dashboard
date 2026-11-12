# UI & Layout Contracts: Responsividade Completa da Aplicação

**Feature Branch**: `012-full-app-responsiveness` | **Date**: 2026-11-11

Este documento define os contratos visuais, estruturais e de acessibilidade/testabilidade que todos os componentes responsivos devem cumprir sem quebrar contratos de API ou `data-testid` existentes.

---

## 1. Contrato Global de Viewport & Shell

1. **Zero Overflow Horizontal na Raiz**:
   - Em qualquer rota (`/` até `/settings/*`, `/login`, `/register`), `document.documentElement.scrollWidth <= window.innerWidth` para todas as larguras `>= 320px`.
   - `html` e `body` em `app/globals.css` utilizam `overflow-x-clip` (preservando `position: sticky` do cabeçalho).
2. **Área Segura contra Botão Flutuante (`DashboardLayout`)**:
   - `main` em `app/(dashboard)/layout.tsx` mantém respiro inferior (`pb-24 sm:pb-8` quando fora de `/chat` ou `pb-20 sm:pb-6`) para impedir que `ChatFloatingButton` cubra botões de ação ao final das páginas em telas móveis.

---

## 2. Contrato de Navegação (`Navbar`, `UserNav`, `AiKeyStatusBadge`, `SettingsNav`)

1. **Breakpoint da Barra Superior (`Navbar`)**:
   - Links horizontais (`NAV_ITEMS`) exibidos exclusivamente a partir de `lg:` (`>= 1024px`) — `hidden lg:flex`.
   - Botão hambúrguer (`aria-label="Abrir menu móvel"`, `aria-expanded`, `aria-controls`) exibido abaixo de `lg:` (`lg:hidden`) com área clicável mínima `size-10` (`40px`).
   - Menu móvel recolhível exibido abaixo de `lg:` (`lg:hidden`) contendo todos os 5 itens de navegação e resumo compacto da conta/ação de sair em telas muito pequenas, fechando automaticamente via `pathname` change, `Escape` e clique fora.
2. **Área de Usuário e Status em 320px–480px (`UserNav` e `AiKeyStatusBadge`)**:
   - Em `<480px` (`<sm`), `UserNav` exibe o avatar circular e oculta texto longo de nome/e-mail (`hidden sm:flex`) para evitar overflow do cabeçalho em `320px–375px`, mantendo `aria-label` / `title` descritivo e o botão de logout acessível.
   - `Navbar` mantém `min-w-0` e `gap-1.5 sm:gap-3` para não esmagar o logotipo à esquerda.
3. **Abas de Configurações (`SettingsNav`)**:
   - Mantém rolagem horizontal contida apenas no container `<nav>` em telas pequenas, com `min-w-0` no wrapper pai para não expandir o grid/container da página.

---

## 3. Contrato do Dashboard (`DashboardHeader`, `MonthSelector`, `MetricCardsGrid`, `CategoryDonutChart`, `AiDiagnosisCard`, `ProfileOnboardingBanner`)

1. **`DashboardHeader` & `MonthSelector`**:
   - Em `<640px`, controles de mês e botão `"Extratos & Transações"` empilham com largura total (`w-full sm:w-auto`).
   - `MonthSelector` usa largura flexível no centro (`min-w-0 flex-1 sm:min-w-[170px] sm:flex-none`) e botões laterais com alvo tátil adequado (`size-9 sm:size-8`).
2. **`MetricCardsGrid`**:
   - Distribuição progressiva: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5` (ou `xl:grid-cols-5` com tipografia `text-xl xl:text-2xl` ajustada para caber sem corte).
   - Cards aplicam `min-w-0` e `break-words` em descrições/valores.
3. **`CategoryDonutChart` & `CategoryChartLegend`**:
   - SVG responsivo via `viewBox="0 0 260 260"` + `className="h-auto w-full max-w-[220px] sm:max-w-[260px]"` para caber folgadamente em viewports `320px`.
   - Em telas touch, o toque na fatia ou item da legenda continua executando a navegação de drill-down sem depender de hover prévio.

---

## 4. Contrato de Transações, Filtros e Exportação (`TransactionFilters`, `TransactionTable`, `TransactionExportCard`, `TransactionsPage`)

1. **`TransactionFilters`**:
   - Em `<640px`, layout vertical em coluna única (`grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-end`), com selects `w-full min-w-0` evitando que nomes longos de contas alarguem a viewport.
   - Controles de mês `input[type="month"]` com `min-w-0 flex-1 sm:flex-none`.
2. **`TransactionTable` (Regra de Compatibilidade com Testes DOM)**:
   - Em telas estreitas (`<768px`) vs médias/grandes (`>=768px`), **NÃO duplicar simultaneamente nós idênticos com os mesmos `data-testid`/textos no DOM** se isso quebrar queries únicas do Vitest (`getByText`, `getByRole`).
   - **Opções permitidas pela arquitetura**:
     - Ou utilizar um hook leve de viewport (`useMediaQuery("(max-width: 767px)")`, padrão desktop `false` no SSR/testes existentes para manter 100% dos testes atuais intactos, mais suíte dedicada simulando `matchMedia` mobile para testar os cards);
     - Ou manter estrutura responsiva única/CSS garantindo zero quebra nos queries existentes de `transaction-table.test.tsx`.
   - Toda ação de edição/exclusão em mobile deve possuir área mínima `size-10 sm:size-8`.
3. **`TransactionExportCard`**:
   - No filtro de intervalo customizado (`periodType === "range"`), empilhar inputs de data em `grid-cols-1 sm:grid-cols-2` para evitar compressão em `320px`.
   - Cards de formato (CSV, XLSX, PDF) em `grid-cols-1 md:grid-cols-3`.

---

## 5. Contrato de Modais, Contas, Formulários e Chat

1. **Modais (`Dialog`, `AccountFormDialog`, `AccountDeleteDialog`, `TransactionDeleteDialog`, `TransactionEditDialog`, `AiKeyModal`)**:
   - Todos os painéis modais devem ter `max-h-[90dvh] overflow-y-auto` e padding `p-4 sm:p-6`.
   - Botões de fechar e ações de rodapé responsivos (`flex-col-reverse gap-2 sm:flex-row sm:justify-end`) com alvos confortáveis para toque.
2. **Contas e Formulários (`AccountsPage`, `AccountCard`, `UserProfileIdentityForm`, `FinancialProfileForm`)**:
   - Valor de patrimônio líquido e títulos de conta aplicam `min-w-0 break-words`.
   - Botões de ação primários (`Nova Conta`, `Salvar Perfil`, `Salvar Alterações`) usam `w-full sm:w-auto`.
   - Grupos de botões em `UserProfileIdentityForm` usam `flex-wrap`.
3. **Chat (`ChatPage`, `ChatDrawer`, `ChatMessageItem`, `MarkdownRenderer`, `ChatFloatingButton`)**:
   - `ChatPage` utiliza `h-[calc(100dvh-6.5rem)] min-h-[420px]`.
   - `ChatDrawer` utiliza `h-dvh w-full sm:max-w-md md:max-w-lg`.
   - `ChatMessageItem` aplica `min-w-0 break-words [overflow-wrap:anywhere]` no corpo da mensagem (usuário e assistente) e `MarkdownRenderer` envolve tabelas/blocos de código extensos com `max-w-full overflow-x-auto`.
   - `ChatFloatingButton` usa `right-4 bottom-4 sm:right-6 sm:bottom-6`.
