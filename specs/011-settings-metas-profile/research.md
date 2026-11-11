# Research & Architecture Decisions: Perfil de Investidor e Metas (/settings/metas)

**Feature**: `011-settings-metas-profile`  
**Date**: 2026-10-24  
**Status**: Completed

## 1. Roteamento e Isolamento de Layout

### Contexto
O usuário esclareceu a separação desejada:
- `/settings/profile` deve ser aberto exclusivamente quando o usuário clica no seu nome/avatar no cabeçalho.
- O link "Perfil e Metas" na navbar/sidebar deve ser `/settings/metas`, contendo unicamente o formulário de perfil de investidor do usuário.
- O layout de configurações atual (`app/(dashboard)/settings/layout.tsx`) engloba todas as rotas sob `/settings/*` com o cabeçalho "Configurações da Conta" e a barra de abas `SettingsNav` (Identidade, Segurança, Exportação).

### Decisão de Arquitetura
1. **Isolamento de Layout em `app/(dashboard)/settings/layout.tsx`**:
   - Detectar quando a rota ativa for `/settings/metas` (via `usePathname()`).
   - Se for `/settings/metas`, renderizar diretamente o conteúdo da página (`<>{children}</>`) sem a navegação de abas da conta (`SettingsNav`) e sem o título "Configurações da Conta", garantindo que a página de metas seja 100% dedicada ao perfil de investidor.
   - Se for qualquer rota de administração de conta (`/settings/profile`, `/settings/security`, `/settings/export`), renderizar normalmente o layout padrão com as abas de configurações.
2. **Criação da Rota `app/(dashboard)/settings/metas/page.tsx`**:
   - Renderiza exclusivamente o `FinancialProfileForm`, permitindo ao usuário configurar:
     - Perfil de Risco (Conservador, Moderado, Agressivo).
     - Metas Financeiras Prioritárias.
     - Renda Mensal Declarada.
     - Regime de Trabalho.
   - Título e cabeçalho focados: **"Perfil de Investidor & Metas"**.
3. **Redirecionamento Suave de `/goals`**:
   - Em `app/(dashboard)/goals/page.tsx`, executar redirecionamento para `/settings/metas` ou delegar renderização para evitar links quebrados em acessos diretos.
4. **Atualização da Sidebar (`components/layout/sidebar.tsx`)**:
   - Atualizar a lista canônica `SIDEBAR_ITEMS`:
     `{ href: "/settings/metas", label: "Perfil e Metas", icon: Target }`

---

## 2. Ponto de Entrada para `/settings/profile`

### Decisão
- O componente `UserNav` no cabeçalho superior (`components/layout/user-nav.tsx`) permanece como o ponto de entrada oficial para `/settings/profile`.
- Ao clicar no nome, e-mail ou avatar do usuário, navega para `/settings/profile` (onde residem o formulário unificado de foto de perfil + nome e as abas de segurança e exportação).

---

## 3. Gestão de Estado e Mutações

### Decisão
- `/settings/metas` consome os hooks existentes `useUserProfile` e `useUpdateFinancialProfile`.
- A mutação de atualização do perfil financeiro invalida as queries `['user-profile']` e `['financial-analysis']`, sincronizando instantaneamente as calibrações do consultor IA e do dashboard.
