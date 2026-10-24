# Research & Architectural Analysis: Feature 009

## Overview

A **Feature 009** estende a plataforma com um ecossistema completo de **Gestão de Identidade (Perfil & Avatar)**, **Segurança em Camadas (2FA via E-mail & Google OAuth)** e uma **Central de Exportação de Dados Financeiros (CSV, PDF, XLSX)**.

## Key Findings & Decisions

### 1. Gestão de Identidade e Avatar
- **Contratos de API REST**:
  - `GET /api/user/profile`: Retorna `id`, `email`, `name`, `avatarUrl`, `hasAiKey`, `security` e `financialProfile`.
  - `PATCH /api/user/profile`: Atualização parcial de nome de exibição (`{ name: string }`).
  - `POST /api/user/avatar`: Upload multipart/form-data com a imagem (suporta `.jpg`, `.jpeg`, `.png`, `.webp`, limite 5MB).
  - `DELETE /api/user/avatar`: Exclusão da imagem, restaurando o avatar fallback com iniciais.
- **Componentização e UX**:
  - O avatar renderiza a imagem com suporte a preview instantâneo via `URL.createObjectURL(file)`.
  - Se sem imagem, calcula as iniciais do nome de forma determinística (ex: "Ana Silva" -> "AS") com fundo de contraste semântico.

### 2. Autenticação em Dois Fatores (2FA via E-mail) e Gestão de Sessão
- **Fluxo de Ativação do 2FA**:
  1. Usuário clica em "Ativar 2FA" na aba de Segurança.
  2. Frontend chama `POST /api/auth/2fa/request-enable`. O backend gera um código OTP de 6 dígitos numéricos com validade de 5 minutos e despacha para o e-mail cadastrado.
  3. Modal com 6 campos de dígitos (ou input formatado) recebe o código digitado pelo usuário.
  4. Frontend chama `POST /api/auth/2fa/confirm-enable` enviando `{ code: "123456" }`.
  5. Sucesso: status atualizado para ativo e invalidação da query de perfil.
- **Desativação de 2FA**:
  - Exige confirmação de segurança (`POST /api/auth/2fa/disable`) para evitar desativação indevida.
- **Encerramento de Sessão (Logout)**:
  - Destruição de credenciais no `localStorage`, limpeza do `QueryClient` de cache do TanStack Query e redirecionamento imediato para `/login`.

### 3. Vínculo de Conta Google
- **Fluxo OAuth2**:
  - Integração via `POST /api/auth/google/link` (troca de authorization code ou credencial ID Token).
  - Desvinculação via `DELETE /api/auth/google/unlink` protegida: se `hasLocalPassword: false`, a interface alerta e orienta o usuário a cadastrar uma senha antes de desconectar o Google.

### 4. Central de Exportação de Dados Financeiros (CSV, XLSX e PDF)
- **Filtros Flexíveis**:
  - Período: Mês específico (`YYYY-MM`), intervalo de datas (`startDate`, `endDate`) ou tudo.
  - Conta bancária: `accountId` específico ou todas.
  - Categoria: `category` específica ou todas.
- **Estratégia Híbrida e Resiliente de Geração de Arquivos**:
  - **CSV**: Utilitário puro client-side e/ou endpoint `GET /api/transactions/export?format=csv`, codificado com BOM UTF-8 (`\uFEFF`) para compatibilidade perfeita com Excel brasileiro.
  - **XLSX**: Consumo do endpoint binário `GET /api/transactions/export?format=xlsx` com download seguro via Blob.
  - **PDF**: Consumo do endpoint `GET /api/transactions/export?format=pdf` diagramado com logotipo, sumário de métricas e listagem de transações, ou visualização para impressão.
