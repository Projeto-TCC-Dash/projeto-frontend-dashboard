# Research & Architecture Decisions: Responsividade Completa da Aplicação

**Feature Branch**: `012-full-app-responsiveness` | **Date**: 2026-11-11

## 1. Breakpoint da Navegação Principal (`Navbar` e `UserNav`)

- **Decision**: Mover a transição da barra horizontal completa de links (`NAV_ITEMS`) de `md:` (`768px`) para `lg:` (`1024px`), e compactar os controles da direita (`AiKeyStatusBadge`, `UserNav`, `ThemeToggle`, `Logout`) em viewports `<640px` (`sm:`) e principalmente `320px–375px`.
- **Rationale**:
  - Atualmente, `components/layout/navbar.tsx` exibe os 5 links horizontais em `md:flex` (`768px`), somados ao texto `FinAI Dashboard` (`sm:inline-block`), `AiKeyStatusBadge`, `ThemeToggle`, `UserNav` (`max-w-[140px] sm:max-w-[180px]`) e botão de sair — totalizando ~980px de largura e comprimindo o cabeçalho na faixa de tablets (`768px–1023px`).
  - Em `320px–375px`, exibir simultaneamente nome do usuário (`max-w-[140px]`), selo de IA, alternador de tema, botão de logout e menu hambúrguer excede `320px`. Ocultar o texto do nome/e-mail no botão do perfil em telas `<420px`/`<sm` (mantendo apenas o avatar acessível com `aria-label`/`title` e incluindo o resumo de perfil/sair dentro do menu mobile ou compacto no topo) elimina qualquer risco de overflow em `320px`.
  - Adicionar fechamento automático ao mudar de rota (`usePathname`), tecla `Escape`, e clique fora / botão explícito melhora a usabilidade mobile e no redimensionamento contínuo.
- **Alternatives considered**:
  - Reduzir fontes e paddings dos 5 links para tentar espremê-los em `768px`: rejeitado porque degrada a legibilidade e diminui a área de toque em tablets.

---

## 2. Estratégia para Tabela de Transações em Telas Menores (`TransactionTable`)

- **Decision**: Implementar layout híbrido responsivo em `components/transactions/transaction-table.tsx`:
  - **Mobile (`<768px` / `<md`)**: Lista empilhada de cartões responsivos exibindo todas as 7 informações do lançamento (Descrição principal + descrição bruta com `break-words`, Data, Categoria em badge, Conta associada, Origem, Valor com cor/ícone de fluxo e botões de Editar/Excluir com área confortável de toque).
  - **Tablet/Notebook/Desktop (`>=768px` / `md:`)**: Tabela completa preservada dentro de container `overflow-x-auto` com truncamento controlado e colunas alinhadas, sem gerar scroll horizontal no `<body>`.
- **Rationale**:
  - A spec exige preservação de leitura e acesso a todas as 7 colunas sem scroll horizontal na página inteira, permitindo transformar dados em cards no mobile. Em `320px–767px`, uma tabela de 7 colunas com `whitespace-nowrap` obriga arrasto lateral extenso e dificulta associar linha com botões de ação.
  - Manter exatamente os mesmos `aria-label` (`Editar transação`, `Excluir transação`) e textos/badges garante compatibilidade integral com os testes existentes e acessibilidade.
- **Alternatives considered**:
  - Ocultar colunas (`Conta`, `Origem`) no mobile via `hidden md:table-cell`: rejeitado porque violaria o requisito de preservar acesso a todas as informações sem perda.
  - Manter apenas `overflow-x-auto` no mobile: rejeitado como única solução pois prejudica a leitura em 320px–480px.

---

## 3. Grids Adaptativos de Métricas e Gráfico de Rosca (`MetricCardsGrid`, `CategoryDonutChart`, `DashboardHeader`)

- **Decision**:
  - **`MetricCardsGrid`**: Adotar `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5` (ou manter 3+2 balanceado em `1024px–1439px` com `xl:grid-cols-5` somente quando houver largura confortável e tipografia fluida `text-xl sm:text-2xl` com `truncate`/tabular-nums nos valores), garantindo que notebooks `1024px–1279px` não apertem 5 colunas e valores altos em BRL não quebrem o layout.
  - **`CategoryDonutChart`**: Tornar o SVG fluido usando `viewBox="0 0 260 260"` com CSS `className="h-auto w-full max-w-[220px] sm:max-w-[260px]"` (removendo rigidez que encosta nas bordas em `320px`), ajustar `max-w` proporcional do miolo central e garantir que o toque em dispositivos móveis funcione de forma previsível (tanto na fatia quanto nos itens de `CategoryChartLegend`).
  - **`DashboardHeader` e `MonthSelector`**: Permitir que `MonthSelector` reduza seu `min-w` em telas muito estreitas (`min-w-[140px] sm:min-w-[170px]`), expanda para `w-full justify-between sm:w-auto` no mobile, e que o atalho `Extratos & Transações` assuma `w-full justify-center sm:w-auto`.
- **Rationale**:
  - Com padding de página `px-4` (32px) + padding do Card (`p-4`/`p-6` = 32–48px), uma viewport de `320px` tem apenas `240px–256px` de área útil interna; um SVG fixo em `260px` excede `256px`! Torná-lo `w-full max-w-[220px] sm:max-w-[260px]` resolve o corte matemático em `320px`.
- **Alternatives considered**:
  - Diminuir padding global do app inteiro para `px-2`: rejeitado para preservar o respiro visual em telas normais e desktop.

---

## 4. Contenção de Altura e Rolagem em Modais Customizados e Base (`Dialog`, `AccountFormDialog`, `AccountDeleteDialog`, `TransactionDeleteDialog`, `TransactionEditDialog`)

- **Decision**: Padronizar todos os contêineres internos de diálogo (inclusive os modais customizados com portal direto em `AccountFormDialog`, `AccountDeleteDialog` e `TransactionDeleteDialog`) com `max-h-[90dvh] overflow-y-auto` (alinhado ao `components/ui/dialog.tsx`), paddings responsivos `p-4 sm:p-6`, e botões de rodapé com `flex-col-reverse gap-2 sm:flex-row sm:justify-end` com largura total no mobile quando necessário.
- **Rationale**:
  - Os modais de contas e exclusão de transação atualmente renderizam com portal próprio sem `max-h` e sem `overflow-y-auto`, podendo cortar título ou botão de confirmação em telas baixas (`320x568`), modo paisagem mobile ou quando o teclado virtual reduz a altura útil.
- **Alternatives considered**:
  - Migrar todos os modais customizados imediatamente para o componente `Dialog`: opcional/viável se não quebrar testes que validam estrutura e props específicas; adicionar classes responsivas equivalentes diretamente (ou extrair classe compartilhada) reduz risco de regressão nos testes existentes mantendo consistência.

---

## 5. Chat Dinâmico (`dvh`), Quebra de Conteúdo e Botão Flutuante (`ChatPage`, `ChatDrawer`, `ChatMessageItem`, `MarkdownRenderer`, `ChatFloatingButton`)

- **Decision**:
  - Substituir `h-[calc(100vh-6.5rem)]` em `app/(dashboard)/chat/page.tsx` por `h-[calc(100dvh-6.5rem)]` (com fallback `h-[calc(100vh-6.5rem)]` ou `min-h-[420px]`), e na gaveta `ChatDrawer` usar `h-dvh w-full sm:max-w-md md:max-w-lg`.
  - Aplicar `min-w-0 break-words [overflow-wrap:anywhere]` nas bolhas de `ChatMessageItem` e suporte a `overflow-x-auto` / `break-words` em blocos de código e links longos no `MarkdownRenderer`.
  - Em `ChatFloatingButton`, ajustar posicionamento responsivo (`right-4 bottom-4 sm:right-6 sm:bottom-6`) e garantir `pb-20 sm:pb-6` (ou espaço seguro equivalente no `<main>` do `DashboardLayout`) para que o botão flutuante nunca cubra o último botão de confirmação de formulários/tabelas quando rolado até o fim da página no mobile.
- **Rationale**:
  - Em navegadores mobile (iOS Safari e Android Chrome), `100vh` inclui a área atrás da barra de endereço retrátil, escondendo o `ChatInput`; `100dvh` acompanha exatamente a viewport visível dinâmica.
  - O `pb-20` no rodapé do conteúdo autenticado resolve o problema clássico de FAB cobrindo o botão "Salvar Alterações" ou "Excluir" no final da rolagem.
- **Alternatives considered**:
  - Ocultar `ChatFloatingButton` no mobile: rejeitado pois o requisito exige que funcionalidades existentes continuem acessíveis em todos os dispositivos.

---

## 6. Filtros, Campos de Data e Alvos de Toque (`TransactionFilters`, `TransactionExportCard`, `UserProfileIdentityForm`, `FinancialProfileForm`, `AccountCard`, `SettingsNav`)

- **Decision**:
  - **`TransactionFilters`**: Usar `grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-end` (ou `w-full sm:w-auto sm:min-w-[150px]`) para que no mobile cada filtro ocupe 100% da largura disponível sem vazar `<select>` com nomes longos.
  - **`TransactionExportCard`**: Alterar o intervalo de datas customizado de `grid-cols-2` para `grid-cols-1 sm:grid-cols-2`, evitando espremer dois `<Input type="date">` em 256px no mobile `320px`.
  - **Botões e Alvos de Toque**: Elevar botões de ícone críticos (`AccountCard`, `TransactionTable`, `MonthSelector`, `UploadSummaryBanner`, `ChatDrawer`, `UserAvatarUploader`) para área clicável mínima confortável (`size-10 sm:size-8` ou `min-h-10 sm:min-h-8`) em telas touch `<640px` mantendo visual compacto no desktop.
  - **Botões Primários de Formulário**: Tornar `w-full sm:w-auto` os botões de submissão em `FinancialProfileForm`, `UserProfileIdentityForm`, `DashboardHeader` e `AccountsPage`.
  - **Estilos Globais (`app/globals.css`)**: Adicionar `overflow-x-clip` seguro no container de `body`/`html` apenas como rede de segurança adicional (nunca mascarando bugs internos — cada componente deve respeitar `min-w-0` e `max-w-full`).
- **Rationale**:
  - `overflow-x-clip` (diferente de `overflow-x-hidden`) não quebra `position: sticky` da `Navbar`!
- **Alternatives considered**:
  - Usar `overflow-x: hidden` em `html, body`: rejeitado porque em CSS `overflow-x: hidden` no ancestral quebra `position: sticky` da `Navbar` em vários navegadores. `overflow-x: clip` preserva `sticky` integralmente.
