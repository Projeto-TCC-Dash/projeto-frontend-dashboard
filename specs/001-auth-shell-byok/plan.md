# Implementation Plan: Autenticação, Shell Base e Gestão BYOK da Chave de IA

**Branch**: `001-auth-shell-byok` | **Date**: 2026-10-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from [`specs/001-auth-shell-byok/spec.md`](./spec.md)

## Summary

Esta feature estabelece a espinha dorsal da plataforma de inteligência financeira no frontend: autenticação completa do usuário (cadastro e login com JWT e proteção de rotas), layout shell responsivo com alternância instantânea entre temas claro/escuro e gestão da chave do Google AI Studio (Bring Your Own Key) com validação de conectividade em tempo real via `PUT /api/user/ai-key` e tratamento resiliente de alta demanda provisória (`ACTIVE_PROVISIONAL_DEMAND`).

A abordagem técnica adota o Next.js 16 (App Router) e React 19 já presentes no projeto, com estilização Tailwind CSS v4 e Shadcn, formulários tipados estritamente com Zod, e camada de dados reativa orientada a TanStack Query (`@tanstack/react-query`) e cliente de API centralizado com injeção automática de Bearer Token.

---

## Technical Context

**Language/Version**: TypeScript 5 em modo estrito (`strict: true`, zero `any`, sem supressões `@ts-ignore`).

**Primary Dependencies**: Next.js 16.4.0 (App Router), React 19.3.0, `@base-ui/react`, Tailwind CSS v4, `lucide-react`, `next-themes`, `@tanstack/react-query`, `zod`.

**Storage**: `localStorage` no cliente para persistência do token JWT (`auth_token`), dados essenciais do usuário e preferência de tema via `next-themes`.

**Testing**: Verificação estática com `pnpm typecheck` (`tsc --noEmit`), linting com `pnpm lint` (`eslint`) e cenários manuais/E2E guiados em [quickstart.md](./quickstart.md).

**Target Platform**: Navegadores web modernos (Evergreen browsers: Chrome, Edge, Safari, Firefox), layout responsivo cobrindo de 320px (mobile) a 2560px (desktop/ultrawide).

**Project Type**: Web Application (Next.js App Router Frontend).

**Performance Goals**: Tempo de carregamento inicial < 1s, alternância de tema < 100ms sem piscar (*flicker*), feedback do ping ativo da chave de IA exibido em < 3s.

**Constraints**:
- Zero uso de `any` ou tipos implícitos (Princípio I da Constituição).
- Proibição absoluta de logging de credenciais, senhas ou API keys em `console.log` (Princípio VI).
- Componentes visuais puramente declarativos (SRP), isolando lógica em Custom Hooks (Princípio II).

**Scale/Scope**: Feature 1 de 4 no roadmap do frontend. Abrange 3 rotas principais (`/login`, `/register`, `/onboarding`), layout protegido com casca responsiva e modal de gerenciamento de chave BYOK.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Princípio Constitucional | Status | Justificativa / Validação |
| :--- | :---: | :--- |
| **I. TypeScript Estrito e Zero "any"** | ✅ PASS | Todos os contratos em `src/types/api.ts` e schemas Zod inferem tipos estritos sem `any`. |
| **II. Clean Code, Componentização & SRP** | ✅ PASS | Componentes visuais desacoplados de regras de rede; custom hooks dedicados (`useAuth`, `useAiKey`). |
| **III. Gestão de Estado de IA & UX BYOK** | ✅ PASS | Status `hasAiKey` tratado como cidadão de primeira classe; onboarding mandatório com suporte a `ACTIVE_PROVISIONAL_DEMAND`. |
| **IV. Streaming SSE em Tempo Real** | ⚪ N/A | Reservado para o Chatbot (Feature 4), mas arquitetura do cliente HTTP compatível. |
| **V. Camada de Dados Reativa (TanStack Query)** | ✅ PASS | Invalidação direcionada de queries (`['user']`, `['auth']`) e mutações seguras para login, registro e BYOK. |
| **VI. Segurança no Cliente & Privacidade** | ✅ PASS | Token centralizado em `api-client.ts`, inclusão transparente de Bearer token, zero vazamento de PII/chaves em logs. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-auth-shell-byok/
├── plan.md              # Este arquivo de planejamento arquitetural
├── research.md          # Decisões técnicas e alternativas avaliadas
├── data-model.md        # Entidades, DTOs e máquinas de estado
├── quickstart.md        # Roteiro prático de validação e testes
├── contracts/           # Contratos JSON Schema dos endpoints
│   ├── auth-contract.json
│   └── user-ai-key-contract.json
└── checklists/
    └── requirements.md  # Checklist de qualidade da especificação
```

### Source Code (repository layout)

```text
app/
├── (auth)/
│   ├── layout.tsx              # Layout minimalista centralizado para login/registro
│   ├── login/
│   │   └── page.tsx            # Tela de login
│   └── register/
│       └── page.tsx            # Tela de cadastro
├── (dashboard)/
│   ├── layout.tsx              # Shell autenticado: Navbar, Sidebar móvel, Badges, UserMenu
│   ├── page.tsx                # Página inicial protegida (Dashboard)
│   └── onboarding/
│       └── page.tsx            # Etapa de onboarding mandatória para configurar chave BYOK
├── layout.tsx                  # Root layout com Fontes e Providers
├── globals.css                 # Estilos globais e tokens Tailwind v4
components/
├── ui/                         # Componentes base (button, input, badge, dialog, toast)
├── auth/
│   ├── login-form.tsx          # Formulário de login com validação Zod
│   └── register-form.tsx       # Formulário de cadastro com validação Zod
├── layout/
│   ├── navbar.tsx              # Barra de navegação responsiva com logo e status
│   ├── theme-toggle.tsx        # Botão de alternância Dark/Light
│   └── user-nav.tsx            # Identificação do usuário logado e botão Logout
├── ai-key/
│   ├── ai-key-modal.tsx        # Modal para gerenciar e retestar a chave BYOK
│   ├── ai-key-status-badge.tsx # Indicador visual de status (Conectada, Demanda, Não Configurada)
│   └── ai-key-form.tsx         # Formulário de teste ativo da chave de API
├── providers.tsx               # Provedores unificados (QueryClientProvider, ThemeProvider, AuthProvider)
hooks/
├── use-auth.ts                 # Hook de autenticação (login, register, logout, session state)
└── use-ai-key.ts               # Hook de mutação e validação ativa da chave BYOK
lib/
├── api-client.ts               # Wrapper centralizado de fetch com injeção automática de JWT
└── utils.ts                    # Utilitários de composição de classe CSS (cn)
src/
└── types/
    └── api.ts                  # Tipagens canônicas (User, AuthResponse, SetApiKeyResponse, etc.)
```

**Structure Decision**: Adotado o padrão de Route Groups do Next.js App Router (`(auth)` e `(dashboard)`), permitindo isolar totalmente o layout de autenticação do shell autenticado da plataforma, sem duplicação de lógica e com lazy loading natural.

---

## Complexity Tracking

Nenhuma violação ou desvio da Constituição detectado. Todas as escolhas técnicas aderem estritamente aos princípios ratificados.
