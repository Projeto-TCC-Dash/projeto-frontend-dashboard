# Implementation Plan: Perfil de Usuário, Autenticação Social Google e Central de Exportação

**Branch**: `feature/009-profile-security-export` | **Date**: 2026-10-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-profile-security-export/spec.md` alinhada aos contratos oficiais do backend em `/home/debhg/Projetos/projeto-backend-dashboard/specs/` (Features 011, 013 e 014).

## Summary

Implementar a arquitetura completa do módulo de **Perfil de Usuário (Identidade, Nome e Avatar com upload/exclusão)**, **Autenticação Social Google (Login Rápido via GIS na tela `/login` e Vínculo/Desvinculação em `/settings/security` com guarda contra lockout)** e **Central de Exportação de Dados Financeiros (`/settings/export` para CSV, XLSX e PDF)** no `projeto-frontend-dashboard`.

---

## Technical Context

**Language/Version**: TypeScript 5 em modo estrito (`strict: true`, zero `any`).

**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS v4, `@tanstack/react-query` v5, `@react-oauth/google` para GIS (Google Identity Services), Lucide Icons, Shadcn UI.

**Storage**: `localStorage` para tokens de sessão (`auth_token`, `auth_user`), cache gerenciado via TanStack Query (`user-profile`, `transactions`, `auth`).

**Testing**: Vitest 5, React Testing Library (`@testing-library/react`), `happy-dom`.

**Target Platform**: Navegadores Web modernos (Chrome, Firefox, Safari, Edge) em desktop e mobile responsivo.

**Project Type**: Next.js Web Application (Frontend Dashboard SPA/SSR híbrido).

**Performance Goals**:
- Preview de avatar e transições de tela em menos de 100ms.
- Disparo de download de relatórios e feedback visual em menos de 500ms.
- 100% de acessibilidade e ausência de bloqueios em cancelamento de popups Google.

**Constraints**:
- Zero tolerância a `any` ou supressões de tipagem (`@ts-ignore`).
- Expurgo total e permanente de 2FA e Cloudflare Turnstile.
- Validação no cliente de arquivos até 5MB nos formatos JPG, PNG e WebP.

**Scale/Scope**: 3 rotas principais (`/login`, `/settings/profile`, `/settings/security`, `/settings/export`) e seus respectivos hooks e componentes desacoplados.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. TypeScript Estrito & Zero `any`**: Todas as tipagens de perfil, upload, Google OAuth (`idToken`, respostas) e filtros de exportação tipadas de forma estrita em `src/types/api.ts` e validadas por Zod em `lib/validations/`.
- [x] **II. Clean Code & SRP**: Componentes de UI (`GoogleLoginButton`, `ConnectedAccountsSection`, `UserAvatarUploader`, `TransactionExportCard`) desacoplados de chamadas diretas de rede, delegando toda a lógica para custom hooks dedicados (`useGoogleLogin`, `useGoogleAuth`, `useUserProfile`, `useExportTransactions`).
- [x] **V. TanStack Query Reativo**: Mutações de perfil (`updateName`, `uploadAvatar`, `deleteAvatar`), link do Google e unlink disparam invalidação e atualização otimista de chaves de query (`['user-profile']`, `['auth']`).
- [x] **VI. Segurança e Privacidade**: O token de acesso Google é transmitido de forma segura para o backend sem log no console; salvaguarda rigorosa contra desvinculação da conta Google quando esta for o único meio de acesso (`hasLocalPassword: false`).
- [x] **VII. Testes Automatizados Obrigatórios**: Cobertura de 100% dos novos hooks e componentes com Vitest e React Testing Library (`pnpm test`), cobrindo fluxos de sucesso, erros de rede, cancelamento de popup e validação de tamanho de arquivo.
- [x] **VIII. Gestão de Identidade e Segurança de Sessão**: Sincronização reativa de identidade no shell e logout seguro com invalidação de credenciais e limpeza de cache.
- [x] **IX. Manipulação Segura de Mídias, Validação de Arquivos e Exportação**: Validação de uploads multipart, liberação de memória chamando `URL.revokeObjectURL` para previews e downloads de Blobs binários (CSV, XLSX, PDF).

---

## Project Structure

### Documentation (this feature)

```text
specs/009-profile-security-export/
├── plan.md              # Este plano arquitetural
├── research.md          # Análise de padrões, GIS e decisões técnicas
├── data-model.md        # Entidades, DTOs e extensões de schemas Zod
├── quickstart.md        # Guia de validação e cenários ponta a ponta
├── contracts/           # Contratos canônicos de API (Features 011, 013 e 014)
│   └── profile-security-export-contracts.md
└── tasks.md             # Tarefas ordenadas por dependência (a ser gerado via /speckit-tasks)
```

### Source Code (repository layout)

```text
components/
├── auth/
│   ├── login-form.tsx                  # Integração do botão oficial Google GIS
│   ├── google-login-button.tsx         # Componente do botão social Google com GIS
│   └── google-login-button.test.tsx    # Testes unitários do botão Google
├── profile/
│   ├── user-avatar-uploader.tsx        # Upload, preview instantâneo e exclusão de avatar
│   ├── user-avatar-uploader.test.tsx
│   ├── user-profile-identity-form.tsx  # Formulário unificado de nome e foto
│   └── user-profile-identity-form.test.tsx
├── security/
│   ├── connected-accounts-section.tsx  # Gestão de vínculo com Google e trava de senha
│   └── connected-accounts-section.test.tsx
└── transactions/
    ├── transaction-export-card.tsx     # Central de exportação com seletores de formato
    └── transaction-export-card.test.tsx

hooks/
├── use-google-login.ts                 # Hook para handshake do login social (@react-oauth/google)
├── use-google-login.test.tsx
├── use-google-auth.ts                  # Hook para vincular/desvincular Google no perfil
├── use-google-auth.test.tsx
├── use-user-profile.ts                 # Hook para perfil, upload/remoção de avatar e nome
├── use-user-profile.test.tsx
├── use-export-transactions.ts          # Hook para download de Blobs (CSV, XLSX, PDF)
└── use-export-transactions.test.tsx

app/(dashboard)/
├── settings/
│   ├── profile/page.tsx                # Aba de identidade e dados cadastrais
│   ├── security/page.tsx               # Aba de segurança (Google e Logout)
│   └── export/page.tsx                 # Aba dedicada à central de exportação

src/types/
└── api.ts                              # DTOs e entidades canônicas atualizadas

lib/validations/
├── profile.ts                          # Schemas Zod de nome e foto
├── export.ts                           # Schemas Zod de filtros de exportação
└── auth.ts                             # Schemas Zod de autenticação
```

---

## Implementation Phases

### Phase 1: Tipagem Canônica e Schemas Zod
- Estender `src/types/api.ts` com `GoogleAuthPayload`, `GoogleAuthResponse`, `GoogleLinkResponse`, `AvatarUploadResponse` e `ExportFilterParams`.
- Criar schemas Zod em `lib/validations/profile.ts` e `lib/validations/export.ts` para validação de filtros de datas e regras de arquivo de imagem.

### Phase 2: Módulo de Login Social Google (`/login`)
- Instalar e configurar `@react-oauth/google` com o provedor contextual `GoogleOAuthProvider` usando `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
- Criar o custom hook `useGoogleLogin` gerenciando o fluxo de envio do `idToken` para `POST /api/auth/google`.
- Implementar o componente `GoogleLoginButton` com os estados visuais adequados (padrão, carregamento e tratamento do erro 401/404 de conta não vinculada).
- Integrar no formulário de login (`components/auth/login-form.tsx`).
- Desenvolver testes unitários abrangentes com Vitest.

### Phase 3: Módulo de Vínculo de Google e Segurança (`/settings/security`)
- Atualizar o hook `useGoogleAuth` para consumir o `idToken` do Google GIS via `POST /api/auth/google/link` e `DELETE /api/auth/google/unlink`.
- Refinar `ConnectedAccountsSection` para lidar com erro de conflito 409 e com a trava impeditiva quando `hasLocalPassword: false`.
- Testar os cenários de vinculação, bloqueio de desvinculação e logout seguro.

### Phase 4: Módulo de Identidade e Avatar (`/settings/profile`)
- Assegurar a operação do formulário unificado `UserProfileIdentityForm` conectando os endpoints `POST /api/user/avatar`, `DELETE /api/user/avatar` e `PATCH /api/user/profile`.
- Validar limpeza de memória `URL.revokeObjectURL` para previews temporários e fallback automático para iniciais do usuário.

### Phase 5: Central de Exportação de Dados (`/settings/export`)
- Criar o custom hook `useExportTransactions` consumindo `GET /api/transactions/export?format=csv|xlsx|pdf`.
- Extrair o nome do arquivo a partir de `Content-Disposition` e acionar o download do Blob via âncora invisível.
- Implementar a página `/settings/export` e/ou o componente `TransactionExportCard` com seletores de formato, mês, datas, conta e categoria.
- Desenvolver testes unitários cobrindo download de arquivos e tratamento de erros de rede.

### Phase 6: Validação de Qualidade e Conformidade
- Executar suíte completa de testes automatizados: `pnpm test`.
- Validar integridade e ausência de erros estáticos: `pnpm typecheck`.
- Validar linting e formatação: `pnpm lint` e `pnpm format`.
