# Research & Architectural Analysis: Feature 009 (Perfil, Google Auth & Exportação)

## Overview

A **Feature 009** estende a plataforma com um ecossistema completo de:
1. **Gestão de Identidade e Perfil Cadastral** (Upload e exclusão de avatar com preview, edição de nome de exibição sincronizada no cabeçalho).
2. **Integração Social com Google via Google Identity Services (GIS)**:
   - Login social rápido com Google na tela de login (`/login`) via `@react-oauth/google`.
   - Vínculo e desvinculação de conta Google na aba de configurações de segurança (`/settings/security`) com salvaguarda estrita contra bloqueio de conta (lockout).
3. **Central de Exportação de Dados Financeiros**:
   - Download de extratos transacionais nos formatos canônicos `csv` (UTF-8 com BOM e separador `;`), `xlsx` (com tipos e formatação contábil em BRL) e `pdf` (diagramado com KPIs executivos).

---

## Key Findings & Decisions

### 1. Gestão de Avatar e Identidade (`011-user-avatar-identity`)
- **Endpoints de Backend**:
  - `GET /api/user/profile`: Retorna dados cadastrais (`id`, `email`, `name`, `avatarUrl`, `security`, `createdAt`).
  - `PATCH /api/user/profile`: Atualização parcial do nome de exibição (`{ name: string }`).
  - `POST /api/user/avatar`: Upload `multipart/form-data` (campo `file`) com validação de JPG, PNG e WebP até 5MB. Retorna `{ success: true, message: string, avatarUrl: string }`.
  - `DELETE /api/user/avatar`: Exclusão da foto física no servidor. Retorna `{ success: true, message: string, avatarUrl: null }`.
- **Decisão Arquitetural de Frontend**:
  - A manipulação do avatar opera em modo *draft* dentro do formulário unificado `UserProfileIdentityForm` (Feature 010), fornecendo preview instantâneo via `URL.createObjectURL(file)`. Ao desmontar ou trocar de foto, executa-se `URL.revokeObjectURL(previewUrl)`.
  - Fallback determinístico para iniciais com contraste de cores caso `avatarUrl` seja nulo ou vazio.

### 2. Login Social e Vínculo com Google (`013-google-auth-linking`)
- **Tecnologia Adotada**: `@react-oauth/google` e Google Identity Services (GIS).
  - Configuração desacoplada com `NEXT_PUBLIC_GOOGLE_CLIENT_ID` via `GoogleOAuthProvider` no layout raiz ou no shell de autenticação.
  - Para ambientes de teste/desenvolvimento sem credencial real, o botão e o hook tratam fallback elegante e mocks no Vitest.
- **Fluxo de Login Rápido (`/login`)**:
  1. Usuário clica no botão "Entrar com o Google" renderizado via GIS (`useGoogleLogin` com fluxo `id_token` / credencial JWT).
  2. Frontend envia payload `{ idToken }` para `POST /api/auth/google`.
  3. **Sucesso (200 OK)**: Backend retorna `{ token: string, user: UserSession }`. O frontend armazena a sessão (`localStorage`), emite toast e redireciona para `/dashboard` (ou `/onboarding` se `hasAiKey: false`).
  4. **Conta não vinculada (401 ou 404)**: O backend responde que não há conta associada a este Google ID (`message: "Nenhuma conta vinculada a este perfil Google. Faça login com suas credenciais para vincular."`).
  5. **Tratamento de UX**: O frontend intercepta essa resposta de erro específica e exibe banner/alerta instrutivo: *"Esta conta Google ainda não está vinculada. Faça login com seu e-mail e senha habituais e conecte sua conta Google na aba Configurações > Segurança."*
  6. **Cancelamento do Popup**: Caso o usuário feche a janela do Google sem consentir, o hook restaura o estado inicial sem lançar erro crítico na tela.
- **Fluxo de Vínculo e Desvinculação (`/settings/security`)**:
  - `POST /api/auth/google/link`: Envia `{ idToken }` com token JWT Bearer. Em caso de 409 (Google já vinculado a outro usuário), exibe mensagem de conflito. Em sucesso, invalida `['user-profile']`.
  - `DELETE /api/auth/google/unlink`: Desfaz o vínculo. Se `security.hasLocalPassword: false`, a interface intercepta e bloqueia a ação, abrindo modal que explica que o usuário precisa cadastrar uma senha local antes de desconectar o Google.

### 3. Central de Exportação de Dados Financeiros (`014-financial-data-export`)
- **Endpoint Canônico**: `GET /api/transactions/export?format=csv|xlsx|pdf`.
- **Filtros Suportados**:
  - `format`: `"csv"` | `"xlsx"` | `"pdf"` (obrigatório).
  - `month`: Mês no padrão `YYYY-MM`.
  - `startDate` e `endDate`: Intervalo de datas no formato `YYYY-MM-DD`.
  - `accountId`: Filtragem por conta bancária específica.
  - `category`: Filtragem por categoria canônica.
- **Padrão de Download no Navegador**:
  - Utilização de `apiClient.getBlob()` ou `fetch` com headers de autorização `Bearer <token>`.
  - Extração do nome do arquivo a partir do header HTTP `Content-Disposition: attachment; filename="..."`.
  - Fallback determinístico de nomenclatura caso o header não esteja exposto: `extrato-financeiro-<periodo>.<ext>`.
  - Criação de elemento âncora temporário `<a href="blobUrl" download="filename">` com acionamento programático `.click()` e destruição imediata de memória com `URL.revokeObjectURL(blobUrl)`.
  - Estado de loading visual durante o download, prevenindo requisições concorrentes duplicadas.

### 4. Descontinuação e Expurgo
- **2FA (Autenticação em Dois Fatores)**: Nenhuma menção, tela ou código no frontend, refletindo o expurgo total no backend.
- **Cloudflare Turnstile**: Nenhuma chamada, widget ou validação client-side.
