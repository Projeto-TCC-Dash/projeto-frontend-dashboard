# UI & Component Contracts: Segregação de Metas e Central de Perfil

**Feature**: `010-profile-goals-segregation`  
**Date**: 2026-10-24  
**Status**: Ready

## 1. Contrato do Componente `UserProfileIdentityForm`

Formulário unificado que consolida os controles de avatar e de dados cadastrais (nome e e-mail).

### Props do Componente

```typescript
export interface UserProfileIdentityFormProps {
  initialName?: string;
  email: string;
  avatarUrl?: string | null;
  onSave: (payload: {
    name?: string;
    avatarFile?: File | null;
    removeAvatar?: boolean;
  }) => Promise<void>;
  isPending?: boolean;
}
```

### Comportamento e Interações:
- **Input File**: Aceita `image/jpeg, image/png, image/webp` de até 5MB. Ao selecionar, dispara validação local e armazena em `pendingAvatarFile`, gerando preview via `URL.createObjectURL`.
- **Ação Remover Foto**: Se o usuário possuir avatar cadastrado ou um novo selecionado, aciona a remoção pendente, limpando o arquivo selecionado e marcando `pendingAvatarRemove = true`.
- **Botão Salvar Alterações**:
  - Habilitado se `(name.trim() !== (initialName || "")) || pendingAvatarFile !== null || pendingAvatarRemove`.
  - Ao ser clicado, invoca `onSave({ name: name.trim(), avatarFile: pendingAvatarFile, removeAvatar: pendingAvatarRemove })`.
  - Exibe spinner e desabilita todos os inputs enquanto `isPending` for verdadeiro.

---

## 2. Contrato do Componente `UserNav`

Indicador e botão de acesso rápido à área de configurações de conta no cabeçalho da aplicação.

### Props do Componente
Nenhuma prop obrigatória (consome contexto `useAuth` e hook `useUserProfile`).

### Renderização:
- Link clicável envolvendo o avatar e os textos de identificação com atributo `href="/settings/profile"`.
- Avatar:
  - Se `userProfile.avatarUrl` existir: renderiza imagem do avatar com borda sutil.
  - Se não existir ou estiver em carregamento: renderiza iniciais do usuário com fundo `bg-primary/10 text-primary font-semibold`.
- Textos:
  - Nome do usuário em destaque (`font-medium text-foreground`).
  - E-mail em subtítulo discreto (`text-xs text-muted-foreground truncate`).
- Botão "Sair" integrado para encerramento de sessão seguro (`useAuth().logout`).

---

## 3. Contrato da Página de Metas (`app/(dashboard)/goals/page.tsx`)

Visualização dedicada ao planejamento financeiro pessoal.

### Estrutura:
- Título principal: **"Metas & Perfil Financeiro"**.
- Subtítulo: "Defina sua reserva de emergência, perfil de risco e objetivos financeiros."
- Conteúdo:
  - Card de Metas e Alocação (`FinancialProfileForm`).
  - Não renderiza `SettingsNav`, dados cadastrais de usuário, foto de perfil, 2FA ou botões de exportação.

---

## 4. Contrato do Menu Lateral (`components/layout/sidebar.tsx`)

### Lista Canônica de Itens do Sidebar (`SIDEBAR_ITEMS`):
```typescript
export const SIDEBAR_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Contas e Cartões", icon: Wallet },
  { href: "/transactions", label: "Extratos & Transações", icon: ReceiptText },
  { href: "/goals", label: "Perfil e Metas", icon: Target },
  { href: "/chat", label: "Consultor IA", icon: BotMessageSquare },
];
```
- A rota `/settings/profile` é intencionalmente omitida do menu lateral principal, sendo acessível com exclusividade pelo cabeçalho superior (`UserNav`).
