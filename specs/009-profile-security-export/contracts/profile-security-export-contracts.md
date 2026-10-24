# API Contracts: Feature 009

## 1. Perfil e Avatar

### `GET /api/user/profile`
Retorna os dados cadastrais, avatar e configurações de segurança do usuário autenticado.

#### Resposta HTTP 200 OK
```json
{
  "id": "67140f...",
  "email": "usuario@exemplo.com",
  "name": "Débora Goulart",
  "avatarUrl": "https://storage.exemplo.com/avatars/user-1.webp",
  "hasAiKey": true,
  "security": {
    "twoFactorEnabled": false,
    "hasLocalPassword": true,
    "googleLinked": true,
    "googleEmail": "debora.google@gmail.com",
    "googleLinkedAt": "2026-10-20T14:00:00Z"
  },
  "financialProfile": {
    "incomeType": "CLT",
    "declaredMonthlyIncome": 8500.00,
    "goals": ["RESERVA_EMERGENCIA"]
  }
}
```

### `PATCH /api/user/profile`
Atualiza dados cadastrais como o nome de exibição.

#### Request Body
```json
{
  "name": "Débora H. Goulart"
}
```

### `POST /api/user/avatar`
Upload de nova foto de perfil (Multipart Form-Data: `file`).

### `DELETE /api/user/avatar`
Exclui a foto de perfil do usuário, restaurando o fallback de iniciais.

---

## 2. Autenticação em Dois Fatores (2FA via E-mail)

### `POST /api/auth/2fa/request-enable`
Solicita envio de código de 6 dígitos para o e-mail cadastrado.

### `POST /api/auth/2fa/confirm-enable`
Valida o código de 6 dígitos e ativa o 2FA.
```json
{
  "code": "849201"
}
```

### `POST /api/auth/2fa/disable`
Desativa o 2FA mediante confirmação de credenciais.

---

## 3. Vínculo de Conta Google

### `POST /api/auth/google/link`
Vincula a conta Google autenticada.

### `DELETE /api/auth/google/unlink`
Desvincula a conta Google associada.

---

## 4. Central de Exportação

### `GET /api/transactions/export`
Gera e faz download dos lançamentos financeiros formatados.

#### Parâmetros de Query:
- `format`: `"csv"` | `"xlsx"` | `"pdf"` (obrigatório)
- `month`: Formato `YYYY-MM` (opcional)
- `startDate`: Formato `YYYY-MM-DD` (opcional)
- `endDate`: Formato `YYYY-MM-DD` (opcional)
- `accountId`: ID da conta bancária (opcional)
- `category`: Categoria canônica (opcional)

#### Resposta HTTP 200 OK:
- Header `Content-Disposition: attachment; filename="extrato-financeiro-2026-10.xlsx"`
- Stream binário do arquivo correspondente.
