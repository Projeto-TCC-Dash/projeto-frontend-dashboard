# Tasks: Autenticação, Shell Base e Gestão BYOK da Chave de IA

**Feature**: `001-auth-shell-byok`  
**Input**: Design artifacts from [`specs/001-auth-shell-byok/`](./) (`spec.md`, `plan.md`, `data-model.md`, `contracts/`, `research.md`, `quickstart.md`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Instalação de dependências essenciais e estruturação dos contratos canônicos e provedores globais.

- [X] T001 Adicionar dependências essenciais `@tanstack/react-query` e `zod` em `package.json`
- [X] T002 [P] Criar tipagens canônicas (`User` com `id: string`, `email: string`, `hasAiKey: boolean`, `AuthResponse`, `SetApiKeyResponse`, `AiKeyOperationalStatus`, `AuthCredentialsDTO`, `SetAiKeyDTO`) em `src/types/api.ts`
- [X] T003 [P] Criar provedores globais da aplicação integrando `QueryClientProvider` e `ThemeProvider` em `components/providers.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura base de comunicação com a API, validação e gerenciamento de sessão que bloqueia as user stories.

**⚠️ CRITICAL**: Nenhuma tarefa das fases seguintes deve ser iniciada antes da conclusão desta fundação.

- [X] T004 Implementar cliente HTTP centralizado com base URL, parsing de erros e interceptação automática de `Authorization: Bearer <token>` de `localStorage` em `lib/api-client.ts`
- [X] T005 [P] Implementar schemas de validação Zod (`loginSchema` com email válido e senha obrigatória, `registerSchema` com senha `minLength(8)` e `aiKeySchema` com `minLength(20)`) em `lib/validations/auth.ts` e `lib/validations/ai-key.ts`
- [X] T006 [P] Implementar componentes primitivos de interface baseados em Tailwind v4 e `@base-ui/react` em `components/ui/input.tsx`, `components/ui/card.tsx`, `components/ui/badge.tsx` e `components/ui/dialog.tsx`
- [X] T007 Implementar contexto e hook de autenticação com persistência de token JWT e estado da sessão (`token`, `user`, `isAuthenticated`, `isLoading`, `login`, `register`, `logout`) em `hooks/use-auth.ts`

**Checkpoint**: Fundação pronta — implementação das User Stories pode iniciar de forma independente.

---

## Phase 3: User Story 1 - Autenticação e Controle de Sessão (Priority: P1) 🎯 MVP

**Goal**: Permitir que usuários realizem cadastro com senha mínima de 8 caracteres, login com e-mail/senha, mantenham sessão ativa e realizem logout com proteção de rotas restritas.

**Independent Test**: Registrar nova conta com e-mail válido e senha com no mínimo 8 caracteres, efetuar login, recarregar a página confirmando a sessão ativa, efetuar logout e tentar acessar rotas internas confirmando redirecionamento para `/login`.

### Implementation for User Story 1

- [X] T008 [P] [US1] Criar layout centralizado e responsivo para telas de autenticação em `app/(auth)/layout.tsx`
- [X] T009 [P] [US1] Implementar componente LoginForm com campos de e-mail e senha, feedback visual de erro e estado de submissão em `components/auth/login-form.tsx`
- [X] T010 [P] [US1] Implementar componente RegisterForm com campos de e-mail e senha (mínimo de 8 caracteres), feedback de erro e estado de carregamento em `components/auth/register-form.tsx`
- [X] T011 [US1] Implementar página de login com integração do `LoginForm` e link para cadastro em `app/(auth)/login/page.tsx`
- [X] T012 [US1] Implementar página de cadastro com integração do `RegisterForm` e link para login em `app/(auth)/register/page.tsx`
- [X] T013 [US1] Implementar componente guard de proteção de rotas privadas e redirecionamento de usuários deslogados em `components/auth/auth-guard.tsx`

**Checkpoint**: User Story 1 (MVP) 100% funcional e testável de forma isolada.

---

## Phase 4: User Story 2 - Layout Shell Responsivo com Navegação e Tema (Priority: P2)

**Goal**: Fornecer a casca unificada da aplicação com barra de navegação responsiva (desktop e mobile), exibição do e-mail do usuário logado, botão de logout e alternância contínua entre temas claro e escuro.

**Independent Test**: Acessar a aplicação autenticado, alternar entre os temas claro e escuro (< 100ms sem piscar), recarregar para validar a persistência da preferência e testar o menu em resolução móvel (375px) sem transbordamento lateral.

### Implementation for User Story 2

- [X] T014 [P] [US2] Implementar componente ThemeToggle com ícones Lucide Sun/Moon para alternância entre temas `light` e `dark` em `components/layout/theme-toggle.tsx`
- [X] T015 [P] [US2] Implementar componente UserNav exibindo o e-mail do usuário logado e acionamento de logout em `components/layout/user-nav.tsx`
- [X] T016 [US2] Implementar componente Navbar responsivo com logo da plataforma, links principais, gaveta móvel para smartphones, `ThemeToggle` e `UserNav` em `components/layout/navbar.tsx`
- [X] T017 [US2] Implementar layout autenticado do dashboard envolvendo páginas com `AuthGuard` e `Navbar` em `app/(dashboard)/layout.tsx`
- [X] T018 [US2] Implementar página principal de destino do dashboard em `app/(dashboard)/page.tsx` integrando o shell base

**Checkpoint**: User Stories 1 e 2 funcionais e integradas de forma independente.

---

## Phase 5: User Story 3 - Gestão e Teste Ativo da Chave BYOK (Priority: P3)

**Goal**: Fornecer onboarding obrigatório para usuários sem chave de IA (`hasAiKey: false`), execução de teste ativo via `PUT /api/user/ai-key` com tratamento para `ACTIVE_VERIFIED` e `ACTIVE_PROVISIONAL_DEMAND`, indicador visual de status no cabeçalho e modal de reteste/gerenciamento.

**Independent Test**: Submeter chave de API no onboarding, validar feedback imediato de `ACTIVE_VERIFIED` (verde) ou `ACTIVE_PROVISIONAL_DEMAND` (amarelo com avanço liberado), confirmar bloqueio para chaves inválidas e abrir o modal de gerenciamento pelo cabeçalho do dashboard.

### Implementation for User Story 3

- [X] T019 [US3] Implementar custom hook de mutação da chave de IA consumindo `PUT /api/user/ai-key` e invalidando cache do usuário em `hooks/use-ai-key.ts`
- [X] T020 [P] [US3] Implementar componente AiKeyStatusBadge com 3 estados visuais (`NOT_CONFIGURED` em tom neutro, `ACTIVE_VERIFIED` em verde e `ACTIVE_PROVISIONAL_DEMAND` em amarelo) em `components/ai-key/ai-key-status-badge.tsx`
- [X] T021 [P] [US3] Implementar componente AiKeyForm com campo seguro de chave, link para o Google AI Studio, estado de teste ativo e tratamento de alertas de alta demanda em `components/ai-key/ai-key-form.tsx`
- [X] T022 [US3] Implementar modal de gerenciamento e reteste da chave de API acessível pelo clique no `AiKeyStatusBadge` em `components/ai-key/ai-key-modal.tsx`
- [X] T023 [US3] Implementar página de onboarding mandatória em `app/(dashboard)/onboarding/page.tsx` bloqueando o dashboard para usuários com `hasAiKey: false` e liberando acesso com aviso sob `ACTIVE_PROVISIONAL_DEMAND`

**Checkpoint**: Todas as 3 User Stories concluídas e testáveis de ponta a ponta.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de qualidade estática, conformidade com a Constituição e validação final dos cenários.

- [X] T024 [P] Validar conformidade de tipagem estrita com zero `any` e ausência de erros de linting via `pnpm typecheck` e `pnpm lint`
- [X] T025 Executar bateria de validação manual fim a fim conforme cenários descritos em `specs/001-auth-shell-byok/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode ser iniciado imediatamente.
- **Foundational (Phase 2)**: Depende da conclusão do Setup — **BLOQUEIA** todas as User Stories.
- **User Story 1 (Phase 3)**: Depende da conclusão da Fundação — entrega o MVP de autenticação.
- **User Story 2 (Phase 4)**: Depende da Fundação e da sessão de US1 para identificação do usuário.
- **User Story 3 (Phase 5)**: Depende do shell de US2 (Navbar) e da sessão de US1 (autenticação e chave).
- **Polish (Phase 6)**: Depende da conclusão de todas as User Stories.

### Parallel Opportunities

- **Fase 1**: `T002` e `T003` podem ser executados em paralelo após `T001`.
- **Fase 2**: `T005` e `T006` podem ser executados em paralelo após `T004`.
- **Fase 3 (US1)**: `T008`, `T009` e `T010` podem ser desenvolvidos em paralelo antes de `T011`, `T012` e `T013`.
- **Fase 4 (US2)**: `T014` e `T015` podem ser desenvolvidos em paralelo antes da composição da `Navbar` em `T016`.
- **Fase 5 (US3)**: `T020` e `T021` podem ser desenvolvidos em paralelo após `T019`.

---

## Implementation Strategy

### MVP First (User Story 1)
1. Completar Setup (Fase 1) e Fundação (Fase 2).
2. Implementar User Story 1 (Fase 3): Cadastro, Login, Logout e Guarda de Rotas.
3. **Ponto de Parada & Validação**: Validar autenticação completa antes de avançar para navegação e BYOK.

### Incremental Delivery
1. Setup + Fundação → Base pronta.
2. User Story 1 → Autenticação funcional (MVP).
3. User Story 2 → Shell responsivo com tema claro/escuro.
4. User Story 3 → Onboarding obrigatório e gestão BYOK com tratamento de alta demanda.
5. Polish → Verificação estrita de TypeScript e testes fim a fim.


---

## Phase 7: Convergence

**Purpose**: Resolver lacunas identificadas pela auditoria de conformidade com a Constituição v1.1.0 (Princípio VII).

- [X] T026 [CRITICAL] Configurar runner de testes Vitest, ambiente DOM e script `pnpm test` no `package.json` e `vitest.config.ts` per Constitution VII (missing)
- [X] T027 [CRITICAL] [P] Implementar testes unitários para schemas Zod e cliente HTTP em `lib/validations/auth.test.ts`, `lib/validations/ai-key.test.ts` e `lib/api-client.test.ts` per Constitution VII (missing)
- [X] T028 [CRITICAL] Implementar testes automatizados para hooks de autenticação e gestão de chave BYOK em `hooks/use-auth.test.tsx` e `hooks/use-ai-key.test.ts` per Constitution VII (missing)
