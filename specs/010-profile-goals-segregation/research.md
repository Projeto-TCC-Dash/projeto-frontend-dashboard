# Research & Architecture Decisions: Segregação de Metas Financeiras e Central de Perfil de Usuário

**Feature**: `010-profile-goals-segregation`  
**Date**: 2026-10-24  
**Status**: Completed

## 1. Segregação de Rotas e Navegação

### Contexto
Anteriormente, o item do menu lateral "Perfil Financeiro" apontava para `/settings/profile`. Essa página agregava simultaneamente o seletor de abas de configurações (`SettingsNav`), o upload de avatar (`UserAvatarUploader`), a edição de nome (`UserProfileIdentityForm`) e o formulário de metas financeiras (`FinancialProfileForm`). Além disso, o componente `UserNav` no cabeçalho apontava para a mesma página mista.

### Decisão
- **Rota Dedicada de Metas**: Criar a rota `app/(dashboard)/goals/page.tsx`, acessada pelo menu lateral (Sidebar) com o rótulo **"Perfil e Metas"** (ícone `Target` ou `UserCheck`). Essa página conterá unicamente o `FinancialProfileForm` e métricas/resumo de objetivos de reserva, perfil de risco e metas patrimoniais, sem abas de configurações de conta ou dados cadastrais.
- **Central de Perfil e Configurações via Cabeçalho**: O componente `UserNav` (no cabeçalho do dashboard) passa a ser o ponto de entrada primário para a conta do usuário. Ao clicar no avatar/nome/e-mail, o usuário é direcionado para `/settings/profile`.
- **Abas de Configurações**: Mantidas sob o layout `/settings/layout.tsx`:
  1. `/settings/profile`: "Informações de Identidade" (Nome, E-mail e Foto em formulário unificado).
  2. `/settings/security`: "Segurança & Sessão" (contas conectadas, logout).
  3. `/settings/export`: "Central de Exportação" (Exportação de relatórios CSV, PDF, XLSX).

### Rationale
Separa com nitidez os dois domínios da aplicação:
1. **Domínio Financeiro**: Gestão de patrimônio, orçamento e metas (menu lateral principal).
2. **Domínio de Identidade e Conta**: Preferências pessoais, segurança de acesso e governança de dados (cabeçalho superior / menu de perfil).

---

## 2. Formulário Unificado de Identidade com Salvamento Coordenado (Foto + Nome)

### Contexto
O usuário solicitou que a parte de foto de perfil fique integrada à aba de informações de identidade, de modo que ao salvar a alteração, o sistema salve a foto e a alteração do nome juntos em um único clique de confirmação.

### Decisão
Unificar o estado local em `UserProfileIdentityForm`:
- **Estado de Rascunho (Draft State)**:
  - `name`: valor atual do input de nome.
  - `pendingAvatarFile: File | null`: arquivo selecionado no input file aguardando envio.
  - `pendingAvatarPreview: string | null`: URL temporária criada via `URL.createObjectURL(file)` para preview em tempo real.
  - `pendingAvatarRemove: boolean`: flag indicando que o usuário optou por remover a foto existente.
- **Detecção de Mudança (`isDirty`)**:
  - `isDirty = (name.trim() !== (initialName || "")) || (pendingAvatarFile !== null) || pendingAvatarRemove;`
  - O botão "Salvar alterações" fica desabilitado quando `!isDirty` ou durante o carregamento (`isPending`).
- **Submissão Coordenada**:
  - Quando o usuário clica em "Salvar alterações", a submissão executa de forma coordenada:
    1. Se `pendingAvatarRemove` for verdadeiro: executa `deleteAvatar()`.
    2. Se `pendingAvatarFile` existir: executa `uploadAvatar(pendingAvatarFile)`.
    3. Se `name.trim() !== initialName`: executa `updateName(name.trim())`.
  - Ao concluir com sucesso, exibe notificação única ("Perfil atualizado com sucesso"), descarta as URLs de objeto temporárias com `URL.revokeObjectURL`, limpa os estados pendentes e invalida a query `['userProfile']`.

### Rationale
- Proporciona UX moderna e coesa (padrão de configurações de perfil do GitHub, Google e Vercel), onde seleções de mídia e edições textuais não disparam requisições imediatas e inesperadas, permitindo ao usuário revisar e cancelar antes de submeter.
- Evita envio de arquivos órfãos se o usuário desistir da alteração.

---

## 3. Gestão Segura de Recursos em Memória (Preview de Imagem)

### Decisão
- Em conformidade com o **Princípio IX da Constituição**, o componente monitora o ciclo de vida do `pendingAvatarPreview`. Ao selecionar uma nova imagem ou ao desmontar o componente (`useEffect` cleanup), o recurso temporário alocado no navegador é liberado via `URL.revokeObjectURL(previewUrl)`.
- Validação client-side estrita de tamanho (até 5MB) e tipos MIME (`image/jpeg`, `image/png`, `image/webp`) antes de atribuir o arquivo ao estado pendente. Se inválido, emite erro imediato e não altera a imagem.

---

## 4. Atualização Reativa no Cabeçalho (`UserNav`)

### Decisão
- Aprimorar o `UserNav` para exibir visualmente o avatar cadastrado (ou as iniciais do nome se não houver foto) ao lado do nome/e-mail, consumindo os dados reativos da query de perfil (`useUserProfile`), sincronizado com o status de autenticação.
- Manter o link acessível tanto no desktop quanto em telas menores, garantindo clique intuitivo em qualquer resolução.
