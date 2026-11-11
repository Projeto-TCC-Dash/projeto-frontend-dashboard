# API & UI Contracts: Feature 009 (Perfil, Google Auth & Central de Exportação)

Este documento sintetiza os contratos HTTP consumidos pelo frontend junto à API backend (`projeto-backend-dashboard`).

---

## 1. Módulo de Perfil e Avatar (Feature 011 Backend)

### `GET /api/user/profile`
Retorna os dados completos do usuário autenticado.

- **Headers**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Response 200 OK**:
  ```json
  {
    "id": "67140f8a8...",
    "email": "usuario@exemplo.com",
    "name": "Débora Goulart",
    "avatarUrl": "/uploads/avatars/user-67140f8a8.webp",
    "hasAiKey": true,
    "security": {
      "hasLocalPassword": true,
      "googleLinked": true,
      "googleEmail": "debora.google@gmail.com",
      "googleLinkedAt": "2026-10-24T18:00:00.000Z"
    },
    "createdAt": "2026-10-20T14:00:00.000Z"
  }
  ```

### `PATCH /api/user/profile`
Atualiza o nome de exibição do usuário.

- **Headers**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Débora H. Goulart"
  }
  ```
- **Response 200 OK**: Objeto `UserProfileResponse` atualizado.
- **Response 400 Bad Request**: Validação de nome violada (mínimo 2 caracteres).

### `POST /api/user/avatar`
Upload de imagem para avatar do perfil.

- **Headers**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`, `Content-Type: multipart/form-data`
- **Body**: Campo `file` com arquivo binário (`image/jpeg`, `image/png` ou `image/webp` com até 5MB).
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "message": "Avatar atualizado com sucesso",
    "avatarUrl": "/uploads/avatars/67140f8a8-1729765432.png"
  }
  ```
- **Response 400 Bad Request**: Formato de imagem não suportado ou tamanho excedente.

### `DELETE /api/user/avatar`
Remove a foto de perfil personalizada e apaga o arquivo físico no servidor.

- **Headers**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "message": "Avatar removido com sucesso",
    "avatarUrl": null
  }
  ```

---

## 2. Autenticação e Vínculo Social Google (Feature 013 Backend)

### `POST /api/auth/google` (Login Rápido com Google na tela de Login)
Autentica o usuário na plataforma usando a credencial Google previamente vinculada.

- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "idToken": "eyJhbGciOiJSUzI1NiIs..."
  }
  ```
- **Response 200 OK**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "60d0fe4f5311236168a109ca",
      "email": "usuario@exemplo.com",
      "name": "Maria Silva",
      "avatarUrl": "/uploads/avatars/avatar.webp",
      "hasAiKey": true
    }
  }
  ```
- **Response 401 Unauthorized / 404 Not Found**:
  ```json
  {
    "statusCode": 401,
    "error": "Unauthorized",
    "message": "Nenhuma conta vinculada a este perfil Google. Faça login com suas credenciais para vincular."
  }
  ```
  *Comportamento de UX*: O frontend intercepta essa mensagem específica e apresenta banner orientando o login por e-mail e senha para realizar o vínculo em Configurações > Segurança.

### `POST /api/auth/google/link` (Vincular Google no Perfil de Segurança)
Vincula a conta Google ao perfil autenticado.

- **Headers**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "idToken": "eyJhbGciOiJSUzI1NiIs..."
  }
  ```
- **Response 200 OK**: Objeto `UserProfileResponse` com `security.googleLinked: true`, `security.googleEmail` e `security.googleLinkedAt`.
- **Response 409 Conflict**: Conta Google já vinculada a outro usuário cadastrado.

### `DELETE /api/auth/google/unlink` (Desvincular Google no Perfil de Segurança)
Desfaz o vínculo da conta Google da conta logada.

- **Headers**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Response 200 OK**:
  ```json
  {
    "id": "507f1f77bcf86cd799439011",
    "email": "usuario@exemplo.com",
    "security": {
      "hasLocalPassword": true,
      "googleLinked": false
    },
    "success": true,
    "message": "Conta Google desvinculada com sucesso."
  }
  ```
- **Response 400 Bad Request**: Rejeição caso o usuário não tenha senha local cadastrada (`hasLocalPassword: false`).

---

## 3. Central de Exportação de Dados Financeiros (Feature 014 Backend)

### `GET /api/transactions/export`
Gera e faz streaming de download do extrato transacional formatado.

- **Headers**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Query Parameters**:
  - `format`: `"csv"` | `"xlsx"` | `"pdf"` (obrigatório).
  - `month`: Formato `YYYY-MM` (opcional).
  - `startDate`: Formato `YYYY-MM-DD` (opcional).
  - `endDate`: Formato `YYYY-MM-DD` (opcional).
  - `accountId`: ID da conta bancária (opcional).
  - `category`: Categoria canônica (opcional).
- **Response 200 OK**:
  - `Content-Type`:
    - CSV: `text/csv; charset=utf-8` (delimitador `;` com prefixo UTF-8 BOM `\uFEFF`)
    - XLSX: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
    - PDF: `application/pdf`
  - `Content-Disposition`: `attachment; filename="extrato-<periodo>.<ext>"`
  - Stream binário do arquivo gerado para download imediato.
- **Response 400 Bad Request**: Parâmetro de formato inválido ou `startDate > endDate`.
