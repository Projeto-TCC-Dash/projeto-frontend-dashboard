# Data Model: Autenticação, Shell Base e Gestão BYOK da Chave de IA

**Feature**: `001-auth-shell-byok`  
**Date**: 2026-10-19  
**Status**: Ready  

---

## 1. Entidades do Domínio

### 1.1 `User` (Usuário Autenticado)
Representa a conta do usuário retornada pelo backend nas operações de autenticação e consulta de perfil.

```typescript
export interface User {
  id: string;        // UUID v4 ou identificador único gerado pelo backend
  email: string;     // E-mail único e normalizado (RFC 5322)
  hasAiKey: boolean; // Indica se o usuário possui chave de API Google AI Studio ativa
}
```

- **Regras de Validação**:
  - `id`: Obrigatório, string não vazia.
  - `email`: Formato de e-mail válido, lowercase.
  - `hasAiKey`: Booleano determinístico.

---

### 1.2 `AuthSession` (Sessão de Autenticação no Cliente)
Mantém as credenciais de sessão ativas na memória e armazenamento local do navegador.

```typescript
export interface AuthSession {
  token: string | null;         // Token JWT assinado pelo backend
  user: User | null;            // Dados do usuário logado
  isAuthenticated: boolean;     // Flag calculada (token !== null && user !== null)
  isLoading: boolean;           // Indica se a sessão ainda está sendo hidratada no mount
}
```

- **Regras de Validação & Ciclo de Vida**:
  - Inicialização: Lê token e dados de usuário persistidos no `localStorage` ao carregar a aplicação.
  - Login / Registro: Atualiza `token` e `user`, armazena no `localStorage` e sinaliza `isAuthenticated: true`.
  - Logout / Token Expirado: Remove token do `localStorage`, zera estado para `null` e sinaliza `isAuthenticated: false`.

---

### 1.3 `AiKeyStatus` (Estado Operacional da Chave de IA)
Descreve o estado da chave do Google AI Studio configurada para a conta.

```typescript
export type AiKeyOperationalStatus = 
  | 'NOT_CONFIGURED'                // Usuário ainda não cadastrou a chave
  | 'ACTIVE_VERIFIED'               // Chave testada e 100% operacional no modelo
  | 'ACTIVE_PROVISIONAL_DEMAND'     // Chave salva com sucesso, mas provedor sob alta demanda temporária
  | 'INVALID_OR_REVOKED';           // Chave rejeitada ou inválida

export interface AiKeyConfigState {
  status: AiKeyOperationalStatus;
  lastVerifiedAt?: string;          // ISO 8601 da última validação
  message?: string;                 // Mensagem explicativa de retorno
}
```

- **Transições de Estado**:
```text
           [ Início / hasAiKey: false ]
                         │
                         ▼
                  NOT_CONFIGURED
                         │
            PUT /api/user/ai-key (Submissão)
                         │
        ┌────────────────┼────────────────┐
        │                │                │
(Status 200/Verified) (Status 200/Demand) (Erro 400/401)
        ▼                ▼                ▼
 ACTIVE_VERIFIED  ACTIVE_PROVISIONAL_  INVALID_OR_REVOKED
                         DEMAND           │
        │                │                │
        └────────────────┼────────────────┘
                         ▼
        (Permite reteste / atualização a qualquer momento)
```

---

### 1.4 `ThemePreference` (Preferência Visual do Tema)
Controla o tema da interface visual gerenciado via `next-themes`.

```typescript
export type ThemeMode = 'light' | 'dark' | 'system';
```

- **Persistência**: Armazenado sob a chave `theme` no `localStorage`.

---

## 2. DTOs de Requisição e Resposta (Contratos da API)

### 2.1 Login / Cadastro (`AuthCredentialsDTO`)
```typescript
export interface AuthCredentialsDTO {
  email: string;     // min 1 caractere, formato válido de e-mail
  password: string;  // min 8 caracteres
}

export interface AuthResponse {
  token: string;
  user: User;
}
```

### 2.2 Configuração da Chave (`SetAiKeyDTO`)
```typescript
export interface SetAiKeyDTO {
  apiKey: string;    // String não vazia, tipicamente iniciando com "AIzaSy"
}

export interface SetApiKeyResponse {
  success: boolean;
  message: string;
  status?: 'ACTIVE_VERIFIED' | 'ACTIVE_PROVISIONAL_DEMAND';
}
```
