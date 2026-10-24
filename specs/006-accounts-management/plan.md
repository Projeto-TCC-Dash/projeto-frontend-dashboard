# Implementation Plan: Gestão Multiconta e Cartões de Crédito

**Branch**: `feature/006-accounts-management` | **Date**: 2026-10-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-accounts-management/spec.md`

## Summary

Implementar no frontend a experiência de gestão multiconta e cartões de crédito na rota `/accounts`, consumindo os endpoints REST `GET /api/accounts`, `POST /api/accounts`, `PATCH /api/accounts/:id` e `DELETE /api/accounts/:id?cascade=true|false`. A entrega contempla:
- Tipos canônicos de domínio e validações com Zod em `types/api.ts` e `lib/validations/account.ts`.
- Hook customizado `useAccounts` com TanStack Query para listagem, cálculos de subtotais e patrimônio líquido, além de mutações reativas (`useCreateAccount`, `useUpdateAccount`, `useDeleteAccount`).
- Página `/accounts` no App Router com card de destaque de **Patrimônio Líquido Total** (`netWorth`), indicador visual positivo/negativo e seções verticais temáticas para cada tipo de conta com seus respectivos subtotais acumulados.
- Modal de criação e edição (`AccountFormDialog`) com seleção de tipo de conta, máscara monetária em BRL para `initialBalance`, instituição e seletor visual de cor (paleta pré-definida + input hex).
- Diálogo seguro de confirmação de exclusão (`AccountDeleteDialog`) com checkbox de cascata (`cascade=true`) e comportamento adaptativo (mantém o diálogo aberto em caso de rejeição por transações vinculadas destacando a opção de cascata).
- Atualização da navegação (link fixo "Contas e Cartões" na Sidebar e menu móvel).
- Cobertura completa de testes unitários e de integração com Vitest e Testing Library.

## Technical Context

**Language/Version**: TypeScript 5.8+ (Strict mode: `strict: true`, `noImplicitAny: true`, zero `any`)  
**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS v4, `@tanstack/react-query`, `lucide-react`, `zod`, `react-hook-form`  
**Storage**: Persistência via API backend REST (Fastify/MongoDB); estado de cache client-side via TanStack Query  
**Testing**: Vitest 5.0+ e `@testing-library/react` em ambiente `happy-dom`  
**Target Platform**: Navegadores Web modernos (Chrome, Firefox, Safari, Edge) em desktop e mobile  
**Project Type**: Single-page application integrada com backend Fastify/Next.js App Router  
**Performance Goals**: Tempo de renderização < 100ms; atualização reativa pós-mutação < 1s; zero recarregamento manual de página  
**Constraints**: Renderização de modais via Portal (`document.body`) para evitar conflitos de backdrop CSS; formatação monetária progressiva em BRL; tipagem estrita com Zod  
**Scale/Scope**: 1 nova página protegida (`/accounts`), 4 novos componentes de interface (`AccountCard`, `AccountSection`, `AccountFormDialog`, `AccountDeleteDialog`), 1 novo hook (`useAccounts`), 1 componente de navegação atualizado (`Sidebar`)  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. TypeScript Estrito & Zero `any`**: Todas as entidades (`Account`, `AccountsOverview`, `AccountType`, DTOs) tipadas em `types/api.ts` e validadas por schemas Zod determinísticos.
- [x] **II. Clean Code & Respeito ao Contexto**: Mantém baseline React 19, Next.js 16, Tailwind v4 e Lucide Icons; lógica de negócio e mutações isoladas no hook `useAccounts`.
- [x] **III. Gestão de Estado de IA**: A gestão de contas fornece a base contábil para as análises futuras do consultor e dashboard sem acoplamento bloqueante.
- [x] **IV. Consumo de Streaming SSE**: Preserva o padrão do projeto sem interferir no chat conversacional.
- [x] **V. TanStack Query Reativo**: Todas as mutações (`POST`, `PATCH`, `DELETE`) invalidam a query `['accounts']` e consultas correlatas (`['financial-analysis']`), garantindo consistência imediata sem refresh.
- [x] **VI. Segurança & LGPD**: Token JWT anexado automaticamente via `apiClient`, confirmação explícita para ações destrutivas, zero logging de dados sensíveis.
- [x] **VII. Testes Obrigatórios**: Testes unitários para schema Zod, hook com TanStack Query e componentes visuais com Vitest e Testing Library.

## Project Structure

### Documentation (this feature)

```text
specs/006-accounts-management/
├── spec.md              # Especificação de requisitos funcionais
├── checklists/          # Checklists de qualidade
│   └── requirements.md
├── plan.md              # Este plano de implementação
├── research.md          # Decisões arquiteturais e justificativas
├── data-model.md        # Modelos TypeScript e schema Zod
├── quickstart.md        # Guia de validação rápida e comandos
├── contracts/           # Contratos JSON Schema dos endpoints
│   └── accounts-contract.json
└── tasks.md             # Tarefas ordenadas (geradas no /speckit-tasks)
```

### Source Code (repository root)

```text
types/
└── api.ts                             # Extensão com Account, AccountsOverview, AccountType e DTOs

lib/
└── validations/
    ├── account.ts                     # Schemas Zod para criação e edição de contas
    └── account.test.ts                # Testes unitários dos schemas Zod

hooks/
├── use-accounts.ts                    # Hook de listagem, cálculos e mutações (TanStack Query)
└── use-accounts.test.tsx              # Testes automatizados do hook com mocks de API

components/
├── accounts/
│   ├── account-card.tsx               # Card de conta com cor personalizada, badge e ações
│   ├── account-card.test.tsx
│   ├── account-section.tsx            # Seção temática vertical com subtotal acumulado
│   ├── account-section.test.tsx
│   ├── account-form-dialog.tsx        # Modal de criação/edição com seleção de cor e máscara BRL
│   ├── account-form-dialog.test.tsx
│   ├── account-delete-dialog.tsx      # Diálogo seguro de exclusão com suporte adaptativo a cascade
│   └── account-delete-dialog.test.tsx
└── layout/
    └── sidebar.tsx                    # Inclusão do link de navegação "Contas e Cartões"

app/
└── (dashboard)/
    └── accounts/
        └── page.tsx                   # Página protegida de Gestão Multiconta
```

**Structure Decision**: Adoção da estrutura padrão do Next.js App Router sob `app/(dashboard)/accounts`, componentes isolados em `components/accounts/` e hook em `hooks/use-accounts.ts`.

## Complexity Tracking

Nenhuma violação aos princípios da Constituição Técnica foi identificada. O design respeita a stack existente, reutiliza o utilitário de formatação `formatCurrency` e `parseBrlToNumber` criado na Feature 005, e segue estritamente a API do backend.
