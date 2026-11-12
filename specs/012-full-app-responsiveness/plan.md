# Implementation Plan: Responsividade Completa da Aplicação

**Branch**: `012-full-app-responsiveness` | **Date**: 2026-11-11 | **Spec**: [spec.md](file:///home/debhg/Projetos/projeto-frontend-dashboard/specs/012-full-app-responsiveness/spec.md)

**Input**: Feature specification from `/specs/012-full-app-responsiveness/spec.md`

---

## Summary

Adaptar todas as rotas, layouts, componentes de navegação, painéis analíticos, tabelas de transações, filtros, formulários, diálogos modais e interface do consultor virtual IA para operarem de forma consistente, sem rolagem horizontal global e com áreas de toque adequadas nas seis faixas de resolução de referência (`320px–375px`, `376px–480px`, `481px–767px`, `768px–1023px`, `1024px–1439px` e `>=1440px`). A solução baseia-se exclusivamente em Tailwind CSS v4 nativo, contenção de viewport (`dvh`, `overflow-x-clip`, `max-h-[90dvh]`), ajuste de breakpoints (`lg:` para barra de navegação horizontal completa), visualização adaptativa de transações (`cards` no mobile / `table` no desktop) e zero alteração de regras de negócio, APIs REST ou dependências externas desnecessárias.

---

## Technical Context

**Language/Version**: TypeScript 5 (`strict: true`), React 19.3.0, Next.js 16.4.3 (App Router)

**Primary Dependencies**: Tailwind CSS v4 (`@tailwindcss/postcss`), `@base-ui/react`, `lucide-react`, Shadcn patterns, `@tanstack/react-query`, `@react-oauth/google` (sem adição de novas dependências externas)

**Storage**: N/A (apenas estado efêmero de UI no cliente para menu móvel e media query opcional)

**Testing**: Vitest 5.0.5 + `@testing-library/react` 16.3.3 + `happy-dom` 21.0.3 (`pnpm test`), `tsc --noEmit` (`pnpm typecheck`), ESLint (`pnpm lint`), `next build` (`pnpm build`)

**Target Platform**: Navegadores Web Desktop, Notebooks, Tablets e Smartphones (`>= 320px`, incluindo iOS Safari / Android Chrome com barras dinâmicas e teclado virtual)

**Project Type**: Aplicação Web Next.js (App Router) — Frontend Dashboard

**Performance Goals**: Zero Cumulative Layout Shift (CLS) decorrente de quebras de layout, transições suaves em drawers/menus a 60fps e ausência de listeners pesados de resize quando resolvível via CSS ou `matchMedia`

**Constraints**: Preservar integralmente funcionalidades existentes, contratos REST, schemas Zod, identidade visual, acessibilidade e todos os 327 testes automatizados existentes

**Scale/Scope**: Estilização global (`app/globals.css`), 1 layout raiz + 3 sub-layouts (`(auth)`, `(dashboard)`, `(dashboard)/settings`), 13 rotas (`/` até `/settings/*`, `/login`, `/register`, `/accounts`, `/transactions`, `/chat`, `/onboarding`, `/goals`) e ~47 componentes em `components/`

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Verificação & Aderência |
|---|---|---|
| **I. TypeScript Estrito e Zero `any`** | ✅ PASS | Qualquer hook/helper novo (ex: `useMediaQuery`) usará tipagem estrita sem `any` explícito ou implícito. |
| **II. Clean Code, Componentização e Baseline** | ✅ PASS | Respeita integralmente `package.json` (Next 16, React 19, Tailwind v4); evita duplicação criando helpers compartilhados apenas onde houver necessidade real (ex: `useMediaQuery` ou classe base de modal). |
| **III. Gestão de Estado BYOK & UX Resiliente** | ✅ PASS | `AiKeyStatusBadge` e `AiKeyModal` preservam estados `ACTIVE_VERIFIED` / `ACTIVE_PROVISIONAL_DEMAND` / ausente; apenas ganham adaptação visual para `320px` e `max-h-[90dvh]`. |
| **IV. Consumo Streaming SSE** | ✅ PASS | Lógica de streaming e `AbortController` do chat inalterada; melhorias limitadas a altura `dvh`, quebra de palavra e drawer responsivo. |
| **V. TanStack Query Reativo** | ✅ PASS | Nenhuma alteração em queries/mutations ou políticas de invalidação de cache. |
| **VI. Segurança no Cliente & Privacidade** | ✅ PASS | Tokens, guards de autenticação e validação de upload inalterados. |
| **VII. Testes Automatizados Obrigatórios** | ✅ PASS | Todos os 66 arquivos de teste (327 testes) deverão continuar verdes e novos cenários cobrirão comportamento responsivo de `Navbar`, `TransactionTable`, filtros e modais. |
| **VIII. Identidade e Segurança de Sessão** | ✅ PASS | Fluxos de Google OAuth, trava de desvinculação (`hasLocalPassword`) e logout seguro mantidos intactos. |
| **IX. Mídias, Exportação e Portais** | ✅ PASS | Upload/remoção de avatar, exportações e `createPortal(..., document.body)` em todos os diálogos preservados com contenção `max-h-[90dvh] overflow-y-auto`. |

*Post-Design Re-Check (após Phase 1)*: Zero violações encontradas. Não há necessidade de entradas em `Complexity Tracking`.

---

## Project Structure

### Documentation (this feature)

```text
specs/012-full-app-responsiveness/
├── spec.md                              # Requisitos funcionais, histórias P1-P2 e critérios SC-001..SC-004
├── plan.md                              # Este arquivo (/speckit-plan)
├── research.md                          # Decisões técnicas e alternativas avaliadas (Phase 0)
├── data-model.md                        # Faixas de resolução e estados locais de UI (Phase 1)
├── quickstart.md                        # Roteiro de validação E2E por viewport (Phase 1)
├── contracts/
│   └── responsive-ui-contracts.md       # Contratos visuais, touch e acessibilidade (Phase 1)
├── checklists/
│   └── requirements.md                  # Checklist de qualidade da especificação (16/16 ✅)
└── tasks.md                             # Será gerado na próxima etapa (/speckit-tasks)
```

### Source Code (repository root)

```text
app/
├── globals.css                                    # Proteção global overflow-x-clip & quebra segura
├── layout.tsx                                     # Root shell com Providers
├── (auth)/
│   ├── layout.tsx                                 # Layout de login/registro responsivo
│   ├── login/page.tsx
│   └── register/page.tsx
└── (dashboard)/
    ├── layout.tsx                                 # Respiro inferior seguro contra FAB mobile
    ├── page.tsx                                   # Dashboard principal
    ├── accounts/page.tsx                          # Gestão de contas e patrimônio
    ├── transactions/page.tsx                      # Gestão de extratos, banners e listagem
    ├── onboarding/page.tsx                        # Boas-vindas e ativação BYOK
    ├── chat/page.tsx                              # Chat em altura dinâmica (100dvh)
    ├── goals/page.tsx                             # Redirect legado -> /settings/metas
    └── settings/
        ├── layout.tsx                             # Shell de configurações
        ├── profile/page.tsx                       # Perfil unificado (foto + nome)
        ├── security/page.tsx                      # Contas Google conectadas & logout
        ├── export/page.tsx                        # Central de exportação CSV/XLSX/PDF
        └── metas/page.tsx                         # Perfil de investidor & metas

components/
├── layout/
│   ├── navbar.tsx                                 # Menu mobile <lg, fechamento Escape/click-outside/rota
│   ├── user-nav.tsx                               # Compactação de texto <sm sem esmagar header
│   ├── theme-toggle.tsx                           # Alvo de toque adequado
│   └── sidebar.tsx                                # Verificação de alinhamento caso reutilizado
├── ai-key/
│   ├── ai-key-status-badge.tsx                    # Compactação em 320px
│   └── ai-key-modal.tsx / ai-key-form.tsx         # Diálogo com rolagem interna
├── dashboard/
│   ├── dashboard-header.tsx                       # Empilhamento e botão w-full sm:w-auto
│   ├── month-selector.tsx                         # Largura fluida em 320px e alvos de toque
│   ├── metric-cards-grid.tsx & metric-card.tsx    # Grids 1 -> 2 -> 3 -> 5 e tipografia fluida
│   ├── category-donut-chart.tsx & legend          # SVG responsivo max-w-[220px] sm:max-w-[260px]
│   └── ai-diagnosis-card.tsx                      # Quebras limpas em listas e textos
├── transactions/
│   ├── transaction-filters.tsx                    # Grid vertical no mobile com w-full min-w-0
│   ├── transaction-table.tsx                      # Cards no mobile (<768px) / Tabela >=768px
│   ├── transaction-dropzone.tsx                   # Ajustes de padding/textos no mobile
│   ├── upload-summary-banner.tsx                  # Alinhamento e alvo de fechar
│   ├── transaction-edit-dialog.tsx                # Max-height + truncamento fluido
│   ├── transaction-delete-dialog.tsx              # Max-h-[90dvh] overflow-y-auto + botões mobile
│   └── transaction-export-card.tsx                # Date range grid-cols-1 sm:grid-cols-2
├── accounts/
│   ├── account-card.tsx                           # Alvos de toque >=40px no mobile
│   ├── account-form-dialog.tsx                    # Max-h-[90dvh] overflow-y-auto
│   └── account-delete-dialog.tsx                  # Max-h-[90dvh] overflow-y-auto
├── profile/ & settings/ & security/
│   ├── user-profile-identity-form.tsx             # Wrap de botões de foto & submit w-full sm:w-auto
│   ├── financial-profile-form.tsx                 # Submit w-full sm:w-auto & chips fluidos
│   ├── profile-onboarding-banner.tsx              # Alinhamento de ações no mobile
│   ├── connected-accounts-section.tsx             # Botão Google responsivo
│   └── settings-nav.tsx                           # Scroll horizontal contido das abas
├── chat/
│   ├── chat-drawer.tsx                            # h-dvh w-full sm:max-w-md md:max-w-lg
│   ├── chat-panel.tsx & chat-input.tsx            # Min-w-0 e layout fluido
│   ├── chat-message-item.tsx                      # break-words [overflow-wrap:anywhere]
│   └── chat-floating-button.tsx                   # Posicionamento seguro right-4 bottom-4
└── ui/
    └── dialog.tsx                                 # Padronização max-h-[90dvh] / p-4 sm:p-6

hooks/
└── use-media-query.ts                             # Hook SSR-safe para alternância de apresentação mobile/desktop sem duplicação ambígua no DOM

lib/
└── markdown-renderer.tsx                          # Quebra segura de links/código e scroll em tabelas largas
```

**Structure Decision**: Manter integralmente a estrutura modular existente de Next.js App Router (`app/`, `components/`, `hooks/`, `lib/`), introduzindo no máximo um utilitário enxuto `hooks/use-media-query.ts` para permitir alternância limpa entre cards mobile e tabela desktop em `TransactionTable` sem quebrar nenhuma asserção existente no Vitest.

---

## Implementation Phases

### Phase 1: Fundação Global, Shell e Navegação (`US1`)
- Adicionar proteção `overflow-x-clip` em `html` e `body` no `app/globals.css` (preservando `sticky` da barra superior).
- Ajustar `app/(dashboard)/layout.tsx` com `pb-24 sm:pb-8` para respiro seguro contra o `ChatFloatingButton`.
- Refatorar `components/layout/navbar.tsx` para usar `lg:flex` na barra horizontal completa (`>=1024px`), menu móvel até `1023px` (`lg:hidden`) com `aria-expanded`, fechamento automático por troca de rota, `Escape` e clique externo, e compactação de espaçamentos em `320px`.
- Adaptar `components/layout/user-nav.tsx` para exibir avatar compacto com `aria-label` e ocultar nome/e-mail em telas `<640px` (`hidden sm:flex`), além de disponibilizar acesso rápido ao perfil no menu móvel caso necessário.
- Ajustar `components/layout/theme-toggle.tsx` e `components/ai-key/ai-key-status-badge.tsx` para não apertar em `320px`.

### Phase 2: Painel Principal e Visualizações (`US2`)
- Adaptar `components/dashboard/dashboard-header.tsx` e `components/dashboard/month-selector.tsx` com largura flexível (`min-w-0 flex-1 sm:min-w-[170px]`), botão CTA `w-full sm:w-auto` e alvos de toque confortáveis.
- Refinar `components/dashboard/metric-cards-grid.tsx` e `components/dashboard/metric-card.tsx` para distribuição balanceada em notebooks (`1024px–1439px`) e desktops (`>=1440px`), mantendo valores monetários legíveis sem corte em `320px`.
- Tornar o SVG de `components/dashboard/category-donut-chart.tsx` fluido via CSS (`w-full max-w-[220px] sm:max-w-[260px] h-auto`) e verificar legendas em `CategoryChartLegend` e quebras em `AiDiagnosisCard` e `ProfileOnboardingBanner`.

### Phase 3: Transações, Filtros, Upload e Exportação (`US3`)
- Criar `hooks/use-media-query.ts` (SSR-safe, retorna `false` no servidor e sincroniza com `window.matchMedia` no cliente) com testes unitários dedicados.
- Adaptar `components/transactions/transaction-filters.tsx` para coluna única em `<640px` (`grid-cols-1 sm:flex`) com `<select>` `w-full min-w-0`.
- Atualizar `components/transactions/transaction-table.tsx` para renderizar cards empilhados legíveis quando em viewport mobile (`<768px`) mantendo todos os 7 atributos e botões de ação acessíveis ao toque (`size-10 sm:size-8`), e preservar a tabela completa em `>=768px`.
- Ajustar `app/(dashboard)/transactions/page.tsx`, `components/transactions/upload-summary-banner.tsx` e `components/transactions/transaction-dropzone.tsx` para empilhamento fluido no mobile.
- Ajustar `components/transactions/transaction-export-card.tsx` alterando o seletor de intervalo customizado de `grid-cols-2` para `grid-cols-1 sm:grid-cols-2`.

### Phase 4: Contas, Formulários, Configurações e Modais (`US4`)
- Padronizar `max-h-[90dvh] overflow-y-auto` e paddings `p-4 sm:p-6` em `components/ui/dialog.tsx`, `components/accounts/account-form-dialog.tsx`, `components/accounts/account-delete-dialog.tsx` e `components/transactions/transaction-delete-dialog.tsx`, além de ajustar truncamentos/rodapés em `TransactionEditDialog` e `AiKeyModal`.
- Atualizar `app/(dashboard)/accounts/page.tsx` e `components/accounts/account-card.tsx` (tipografia fluida no patrimônio, `break-words` e alvos de toque confortáveis no mobile).
- Refinar `components/profile/user-profile-identity-form.tsx`, `components/profile/financial-profile-form.tsx`, `components/security/connected-accounts-section.tsx` e `components/settings/settings-nav.tsx` (botões `w-full sm:w-auto`, `flex-wrap` em grupos de ação e proteção `min-w-0`).

### Phase 5: Consultor IA, Chat e Validação Completa (`US5`)
- Atualizar `app/(dashboard)/chat/page.tsx` para `h-[calc(100dvh-6.5rem)] min-h-[420px]`, `components/chat/chat-drawer.tsx` para `h-dvh`, e `components/chat/chat-floating-button.tsx` para `right-4 bottom-4 sm:right-6 sm:bottom-6`.
- Atualizar `components/chat/chat-message-item.tsx` e `lib/markdown-renderer.tsx` com `min-w-0 break-words [overflow-wrap:anywhere]` e proteção contra tabelas/códigos largos.
- Criar e expandir testes automatizados em Vitest (`navbar.test.tsx`, `transaction-table.test.tsx`, `use-media-query.test.tsx`, modais/filtros/exportação) e executar verificação final (`pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`) + checklist de `quickstart.md`.
