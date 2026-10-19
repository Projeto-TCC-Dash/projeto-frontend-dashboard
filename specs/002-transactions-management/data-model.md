# Data Model: Gestão de Transações Financeiras

**Feature Branch**: `002-transactions-management`  
**Date**: 2026-10-19  
**Status**: Completed  

Este documento descreve as entidades de domínio, objetos de transferência de dados (DTOs), esquemas de validação e máquinas de estado da funcionalidade de Gestão de Transações.

---

## 1. Entidades de Domínio

### 1.1 `Transaction` (Transação Financeira)
Representa uma movimentação financeira individual importada ou gerada na plataforma.

| Campo | Tipo | Descrição | Restrições / Validações |
|---|---|---|---|
| `id` | `string` | Identificador único da transação no banco | UUID ou string não vazia |
| `externalId` | `string` | Identificador bancário único de conciliação | Presente no OFX/CSV (ex: FITID) |
| `rawDescription` | `string` | Descrição original extraída do extrato | Texto bruto bancário |
| `cleanDescription` | `string` | Descrição higienizada/amigável legível | Editável pelo usuário, min 1 char |
| `amount` | `number` | Valor monetário em Real (Float/Decimal) | Positivo = Receita, Negativo = Despesa |
| `date` | `string` | Data e hora da transação | Padrão ISO 8601 UTC (ex: `2026-10-19T14:30:00Z`) |
| `category` | `Category` | Categoria canônica oficial atribuída | Uma das 9 categorias oficiais |
| `source` | `TransactionSource` | Meio de entrada do registro | `'OFX'` \| `'CSV'` \| `'SEED'` |

### 1.2 `Category` (Categorias Canônicas Oficiais)
Conjunto estrito de 9 categorias financeiras padronizadas:
- `'Alimentação'`
- `'Transporte'`
- `'Moradia'`
- `'Saúde'`
- `'Lazer'`
- `'Educação'`
- `'Receita'`
- `'Outros'`
- `'Não Categorizado'`

### 1.3 `TransactionSource` (Origem da Transação)
- `'OFX'`: Importada via arquivo de extrato Open Financial Exchange.
- `'CSV'`: Importada via planilha tabular delimitada por vírgula/ponto-e-vírgula.
- `'SEED'`: Dados padrão de demonstração gerados na inicialização da conta.

---

## 2. DTOs e Contratos de Dados

### 2.1 `TransactionFilters` (Filtros de Consulta de Transações)
Utilizado na composição de query params para `GET /api/transactions`.

```typescript
export interface TransactionFilters {
  month: string;              // Formato 'YYYY-MM' obrigatório (ex: '2026-10')
  category?: Category;        // Categoria específica ou undefined (todas)
  source?: TransactionSource; // Origem específica ou undefined (todas)
}
```

### 2.2 `UploadTransactionsResponse`
Resposta estruturada emitida por `POST /api/transactions/upload`.

```typescript
export interface UploadTransactionsResponse {
  totalExtracted: number;     // Total de movimentações identificadas no extrato
  imported: number;           // Total de novas movimentações persistidas com sucesso
  duplicatesIgnored: number;  // Total de itens ignorados por conciliação de externalId prévio
}
```

### 2.3 `UpdateTransactionDTO`
Payload enviado via `PATCH /api/transactions/:id`.

```typescript
export interface UpdateTransactionDTO {
  cleanDescription?: string;  // Novo texto amigável
  category?: Category;        // Nova categoria canônica
}
```

### 2.4 `CategorizeResponse`
Resposta estruturada emitida por `POST /api/transactions/categorize`.

```typescript
export interface CategorizeResponse {
  uniqueMerchantsAnalyzed: number; // Quantidade de estabelecimentos comerciais únicos submetidos à IA
  transactionsUpdated: number;      // Total de transações reclassificadas no lote global
}
```

---

## 3. Máquinas de Estado da Interface

### 3.1 Dropzone de Upload de Extratos
```
[IDLE]
  │
  ├──> (dragenter / dragover com arquivo válido) ──> [DRAGGING_OVER]
  │                                                      │
  │                                                      ├──> (dragleave / drop cancelado) ──> [IDLE]
  │                                                      └──> (drop) ─────────────────────────┐
  │                                                                                           ▼
  ├──> (arquivo selecionado via input file) ──────────────────────────────────────────> [VALIDATING]
                                                                                              │
                       ┌──────────────────────────────────────────────────────────────────────┴─────────┐
                       ▼                                                                                ▼
             [INVALID_CLIENT_FILE]                                                            [UPLOADING]
           (tamanho > 10MB ou extensão incorreta)                                                       │
                       │                                                        ┌───────────────────────┴───────────────────────┐
                       ▼                                                        ▼                                               ▼
              (dismiss / novo arquivo)                                      [SUCCESS]                                        [ERROR]
                       │                                            (exibe resumo: inseridos/duplicados)              (exibe erro de API/rede)
                       └──────────────────────────────────────────────>         │                                               │
                                                                                └───> (fechar/novo upload) ──> [IDLE] <─────────┘
```

### 3.2 Modal de Edição de Transação (Dialog)
```
[CLOSED]
  │
  └──> (clique no botão 'Editar' da linha) ──> [OPEN_EDITING] (preenchido com dados atuais)
                                                     │
                                                     ├──> (cancelar / Esc / fechar) ──> [CLOSED] (descarta alterações)
                                                     └──> (submissão do formulário) ──> [SAVING] (PATCH /api/transactions/:id)
                                                                                            │
                                                                   ┌────────────────────────┴────────────────────────┐
                                                                   ▼                                                 ▼
                                                                [SAVED]                                          [SAVE_ERROR]
                                                      (fecha modal e invalida query)                     (exibe toast e mantém modal aberto)
                                                                   │                                                 │
                                                                   └───> [CLOSED]                                    └───> [OPEN_EDITING]
```

### 3.3 Ação de Categorização em Lote com Suporte BYOK
```
[IDLE]
  │
  └──> (clique no botão 'Categorizar com IA')
             │
             ├──> [user.hasAiKey === false] ───────> [PROMPT_BYOK] ──> (abre AiKeyModal)
             │
             └──> [user.hasAiKey === true] ────────> [CATEGORIZING] (POST /api/transactions/categorize)
                                                           │
                                          ┌────────────────┴────────────────┐
                                          ▼                                 ▼
                                      [SUCCESS]                          [ERROR]
                                (toast: X analisados,            (trata 403, 429, 503 com orientações
                                  Y atualizados)                    e alternativas amigáveis)
                                          │                                 │
                                          └────────────────> [IDLE] <───────┘
```
