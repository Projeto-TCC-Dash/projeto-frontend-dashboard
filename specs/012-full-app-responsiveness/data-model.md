# Data & UI State Model: Responsividade Completa da Aplicação

**Feature Branch**: `012-full-app-responsiveness` | **Date**: 2026-11-11

> **Nota de Escopo**: Conforme os requisitos não funcionais, esta feature **não altera entidades de domínio, schemas Zod de API, contratos REST ou payloads de backend**. Este modelo documenta exclusivamente os estados de interface e faixas de resolução do cliente.

---

## 1. Faixas de Resolução de Referência (`ViewportTier`)

| Faixa | Intervalo (Largura) | Prefixo Tailwind Referência | Comportamento Estrutural Principal |
|---|---|---|---|
| **Smartphones Pequenos** | `320px – 375px` | Base (`<380px` / `<sm`) | Coluna única estrita; avatar/ícones compactos no header sem texto longo; menu móvel recolhível; lista de transações em cards; botões de formulário em largura total (`w-full`). |
| **Smartphones Médios** | `376px – 480px` | Base → `sm` (`<640px`) | Coluna única em grids principais; campos de data/filtro empilhados; gráfico vetorial contido (`max-w-[220px]`); modais com rolagem interna `max-h-[90dvh]`. |
| **Smartphones Grandes** | `481px – 767px` | `sm` (`>=640px`) e `<md` | Grids auxiliares podem usar 2 colunas (`sm:grid-cols-2`); visualização em cards na tabela abaixo de `768px`; header ainda usa menu móvel até `1023px`. |
| **Tablets** | `768px – 1023px` | `md` (`>=768px`) e `<lg` | Tabela completa de transações com rolagem horizontal contida se necessário; menu móvel ainda ativo ou header compacto sem quebrar links; grids em 2 colunas (`md:grid-cols-2`). |
| **Notebooks** | `1024px – 1439px` | `lg` (`>=1024px`) e `xl` (`>=1280px`) | Barra de navegação horizontal completa (`lg:flex`); `MetricCardsGrid` balanceado (`lg:grid-cols-3` / `xl:grid-cols-5` somente com valores protegidos); `AccountSection` e `TransactionExportCard` em 3 colunas. |
| **Desktops** | `>=1440px` | `2xl` (`>=1536px`) / `max-w-7xl` | Experiência completa em contêiner centralizado (`max-w-7xl`), 5 KPI cards lado a lado no dashboard, gaveta de chat lateral (`max-w-lg`) e margens amplas. |

---

## 2. Estados Locais de Interface Afetados

### `MobileNavState` (`components/layout/navbar.tsx`)
- `mobileMenuOpen: boolean` — controla exibição do menu recolhível abaixo de `lg` (`<1024px`).
- **Transições de Segurança**:
  - Navegação de rota (`pathname` muda) → `setMobileMenuOpen(false)`.
  - Tecla `Escape` pressionada com menu aberto → `setMobileMenuOpen(false)`.
  - Clique fora do container `<header>` com menu aberto → `setMobileMenuOpen(false)`.
  - Atributos de acessibilidade sincronizados: `aria-expanded={mobileMenuOpen}` e `aria-controls="mobile-navigation-menu"`.

### `TransactionPresentationMode` (`components/transactions/transaction-table.tsx`)
- Renderização puramente declarativa via CSS responsivo:
  - **Cards Mobile (`md:hidden`)**: exibe todos os 7 atributos do tipo `Transaction` (`date`, `cleanDescription`/`rawDescription`, `category`, `account`, `source`, `amount`, ações `onEdit`/`onDelete`).
  - **Tabela Desktop/Tablet (`hidden md:block`)**: exibe `<table>` clássica dentro de `overflow-x-auto`.
  - **Nota de Testes DOM**: Como `happy-dom` no Vitest renderiza ambos os blocos no DOM quando alternados apenas por CSS (`md:hidden` / `hidden md:block`), os testes que buscam textos únicos ou botões por `getByRole` / `getByText` precisam ser verificados para evitar ambiguidade por duplicação de nós no DOM (ou utilizar `useMediaQuery` / seletor específico preservando a compatibilidade com toda a suíte existente!). *(Detalhe crítico documentado em `contracts/responsive-ui-contracts.md` e `plan.md` para verificação explícita durante o planejamento e testes!)*

### `DialogViewportConstraint` (`components/ui/dialog.tsx` e modais portados)
- Aplicação uniforme de contenção à viewport:
  - Backdrop `fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto`.
  - Painel do diálogo com `max-h-[90dvh] w-full overflow-y-auto` para que cabeçalho, conteúdo e rodapé nunca fiquem cortados em viewports baixas.
