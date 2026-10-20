# Implementation Plan: Perfil Financeiro, Regime de Renda e Metas do Usuário

**Branch**: `feature/005-financial-profile-onboarding` | **Date**: 2026-10-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-financial-profile-onboarding/spec.md`

## Summary

Implementar no frontend a experiência de configuração do perfil financeiro voluntário do usuário, consumindo os endpoints `GET /api/user/profile` e `PUT /api/user/profile`. A entrega abrange:
- Tipos canônicos de domínio e schemas Zod para validação em `types/api.ts` e `lib/validations/profile.ts`.
- Hook customizado `useUserProfile` e mutation `useUpdateFinancialProfile` com TanStack Query para gerenciamento reativo e invalidação de cache analítico.
- Página de configurações `/settings/profile` com formulário moderno (`FinancialProfileForm`), seletor de regime de renda, campo de renda em BRL com máscara monetária, chips multi-seleção de metas e seletor de perfil de risco.
- Banner contextual no Dashboard (`ProfileOnboardingBanner`) com controle de exibição na sessão via `sessionStorage`.
- Atualização da navegação (link permanente na Sidebar e atalho no dropdown de usuário na Navbar).
- Cobertura de testes unitários e de integração com Vitest e Testing Library.

## Technical Context

**Language/Version**: TypeScript 5.8+ (Strict mode: `strict: true`, `noImplicitAny: true`, zero `any`)  
**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS v4, `@tanstack/react-query`, `lucide-react`, `zod`  
**Storage**: Client-side `sessionStorage` para controle de dispensa do banner durante a sessão; persistência em MongoDB via API backend REST  
**Testing**: Vitest 5.0+ e `@testing-library/react` em ambiente `happy-dom`  
**Target Platform**: Navegadores Web modernos (Chrome, Firefox, Safari, Edge) em desktop e mobile  
**Project Type**: Single-page application integrada com backend Fastify/Next.js App Router  
**Performance Goals**: Tempo de renderização < 100ms; atualização reativa pós-salvamento < 1s; zero recarregamento manual de página  
**Constraints**: 100% de respeito à LGPD e voluntariedade; sem bloqueio de rotas para usuários sem perfil; BRL formatting progressivo  
**Scale/Scope**: 1 nova página protegida (`/settings/profile`), 2 novos componentes UI (`FinancialProfileForm`, `ProfileOnboardingBanner`), 1 novo hook (`useUserProfile`), 2 componentes de layout atualizados (`Navbar`, `Sidebar`)  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. TypeScript Estrito & Zero `any`**: Todos os dados tipados via contratos canônicos em `types/api.ts` e inferidos pelo Zod.
- [x] **II. Clean Code & Respeito ao Contexto**: Mantém baseline React 19, Next.js 16, Tailwind v4 e Lucide Icons; lógica de negócio isolada em hooks.
- [x] **III. Gestão de Estado de IA**: Perfil enriquece diagnósticos futuros do Gemini sem bloquear uso geral.
- [x] **IV. Consumo de Streaming SSE**: Não é modificado diretamente; o chat se beneficiará automaticamente do perfil no backend.
- [x] **V. TanStack Query Reativo**: Mutações em `/api/user/profile` disparam invalidação direcionada de `['user-profile']` e `['financial-analysis']`.
- [x] **VI. Segurança & LGPD**: Coleta voluntária, token Bearer anexado automaticamente, zero PII em console.
- [x] **VII. Testes Obrigatórios**: Testes unitários para schema Zod, hook com TanStack Query e componentes visuais com Vitest.

## Project Structure

### Documentation (this feature)

```text
specs/005-financial-profile-onboarding/
├── spec.md              # Especificação de requisitos funcionais
├── checklists/          # Checklists de qualidade
│   └── requirements.md
├── plan.md              # Este plano de implementação
├── research.md          # Decisões arquiteturais e justificativas
├── data-model.md        # Modelos TypeScript e schema Zod
├── quickstart.md        # Guia de validação rápida e comandos
├── contracts/           # Contratos JSON Schema dos endpoints
│   └── user-profile-contract.json
└── tasks.md             # Tarefas ordenadas (geradas no /speckit-tasks)
```

### Source Code (repository root)

```text
types/
└── api.ts                             # Extensão com tipos de IncomeType, FinancialGoal, RiskProfile, UserProfile

lib/
├── validations/
│   ├── profile.ts                     # Schema Zod para atualização de perfil
│   └── profile.test.ts                # Testes unitários do schema Zod
└── formatters.ts                      # Suporte a formatação e parsing de moeda BRL

hooks/
├── use-user-profile.ts                # useUserProfile e useUpdateFinancialProfile (TanStack Query)
└── use-user-profile.test.tsx          # Testes automatizados do hook com mocks de API

components/
├── profile/
│   ├── financial-profile-form.tsx     # Formulário de perfil com regimes, metas, risco e renda BRL
│   ├── financial-profile-form.test.tsx
│   ├── profile-onboarding-banner.tsx  # Banner contextual com controle por sessionStorage
│   └── profile-onboarding-banner.test.tsx
└── layout/
    ├── navbar.tsx                     # Adição de atalho "Meu Perfil Financeiro"
    └── sidebar.tsx                    # Adição de link de navegação "Perfil Financeiro"

app/
├── page.tsx                           # Inclusão do ProfileOnboardingBanner no Dashboard
└── settings/
    └── profile/
        └── page.tsx                   # Página protegida de Perfil Financeiro
```

**Structure Decision**: Adoção da estrutura padrão do Next.js App Router já existente no repositório, mantendo isolamento de componentes sob `components/profile/` e hooks sob `hooks/`.

## Complexity Tracking

Nenhuma violação aos princípios da Constituição Técnica foi identificada. O design é direto, utiliza bibliotecas já instaladas no projeto e respeita o modelo de dados já ativo no backend.
