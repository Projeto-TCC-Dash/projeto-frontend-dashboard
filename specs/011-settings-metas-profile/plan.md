# Implementation Plan: Perfil de Investidor e Metas (/settings/metas)

**Branch**: `011-settings-metas-profile` | **Date**: 2026-10-24 | **Spec**: [spec.md](./spec.md)

## Summary

Ajustar a arquitetura de rotas e navegação para posicionar a tela de **Perfil de Investidor e Metas** especificamente na rota `/settings/metas`, garantindo que:
1. O item "Perfil e Metas" no menu lateral direcione para `/settings/metas`.
2. A tela `/settings/metas` exiba exclusivamente o perfil de investidor e metas patrimoniais do usuário, isolada das abas de administração de conta (`SettingsNav`).
3. O acesso a `/settings/profile` continue exclusivo para quando o usuário clicar no seu identificador (nome, e-mail ou avatar) no cabeçalho superior (`UserNav`).
4. Links para a rota legada `/goals` redirecionem suavemente para `/settings/metas`.

## Technical Context

- **Language/Version**: TypeScript 5 em modo estrito (`strict: true`, zero `any`).
- **Framework**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React.
- **Roteamento**:
  - `/settings/metas`: Rota dedicada ao perfil de investidor.
  - `/settings/profile`: Rota exclusiva de identidade e perfil cadastral (aberta pelo clique no nome).
  - `/settings/layout.tsx`: Layout condicional que renderiza `SettingsNav` apenas para as abas de conta e mantém `/settings/metas` limpo.
- **Testes Automatizados**: Vitest e React Testing Library (`pnpm test`).

## Constitution Check

- [x] **I. TypeScript Estrito & Zero `any`**: Tipagens estritas em todas as props e rotas.
- [x] **II. Clean Code & SRP**: Isolamento de layout limpo via verificação condicional em `SettingsLayout`.
- [x] **V. TanStack Query Reativo**: Mutação de perfil financeiro invalida queries de perfil e de análise de IA.
- [x] **VII. Testes Automatizados**: Testes cobrindo `/settings/metas`, o redirecionamento de `/goals`, `SettingsLayout` e a navegação no `Sidebar`.

## Project Structure

```text
app/(dashboard)/
├── goals/
│   └── page.tsx                         # Redirecionamento para /settings/metas
├── settings/
│   ├── layout.tsx                       # Layout com isolamento condicional para /settings/metas
│   ├── layout.test.tsx                  # Teste de isolamento de layout
│   ├── metas/
│   │   ├── page.tsx                     # Página dedicada ao Perfil de Investidor e Metas
│   │   └── page.test.tsx                # Teste unitário da página de metas
│   ├── profile/
│   │   └── page.tsx                     # Dados cadastrais de identidade (acesso via UserNav)
│   ├── security/
│   │   └── page.tsx
│   └── export/
│       └── page.tsx

components/
└── layout/
    ├── sidebar.tsx                      # Item "Perfil e Metas" apontando para /settings/metas
    ├── sidebar.test.tsx
    ├── user-nav.tsx                     # Link exclusivo para /settings/profile
    └── user-nav.test.tsx
```

## Implementation Phases

### Phase 1: Rota e Tela de Metas (`/settings/metas`)
- Criar `app/(dashboard)/settings/metas/page.tsx` renderizando o `FinancialProfileForm`.
- Configurar `app/(dashboard)/settings/layout.tsx` para não exibir o cabeçalho de configurações da conta nem o `SettingsNav` na rota `/settings/metas`.
- Redirecionar `app/(dashboard)/goals/page.tsx` para `/settings/metas`.

### Phase 2: Atualização do Menu Lateral e Testes
- Atualizar `components/layout/sidebar.tsx` para apontar "Perfil e Metas" para `/settings/metas`.
- Atualizar testes de `sidebar.test.tsx`, `settings/layout.test.tsx`, `settings/metas/page.test.tsx` e `goals/page.test.tsx`.

### Phase 3: Validação de Qualidade
- Executar `pnpm test`, `pnpm typecheck` e `pnpm lint`.
