# Implementation Plan: Exclusão de Transações, 11 Categorias Canônicas e Associação de Contas

**Branch**: `feature/007-transactions-extended-deletion-categories` | **Date**: 2026-10-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-transactions-extended-deletion-categories/spec.md`

## Summary

Estender o módulo de transações no frontend da aplicação para sincronizá-lo com as capacidades da versão v1.1.0 já entregues no backend (Features 007 e 008 do backend). A implementação contempla:
1. **11 Categorias Canônicas Oficiais**: Expansão do catálogo canônico com a inclusão de `"Pagamento de Fatura"` (paleta Slate `#64748B`) e `"Investimentos"` (paleta Ciano `#06B6D4`), atualizando tipagens, validações Zod, filtros e badges de exibição.
2. **Exclusão Atômica de Transações**: Implementação do hook customizado `useDeleteTransaction` com TanStack Query para consumir `DELETE /api/transactions/:id`, acompanhado de diálogo modal de confirmação (`TransactionDeleteDialog` via `createPortal`) com feedback imediato e invalidação reativa em cadeia (`['transactions']`, `['accounts']` e `['analysis']`).
3. **Associação de Contas na Ingestão (Upload OFX/CSV)**: Adição de seletor suspenso no `TransactionDropzone` alimentado por `useAccounts`, permitindo ao usuário vincular o extrato importado a uma conta financeira específica através de `POST /api/transactions/upload?accountId=<id>`.
4. **Edição com Reatribuição de Conta**: Atualização do modal `TransactionEditDialog` para permitir alterar ou desvincular a conta bancária associada ao lançamento via `PATCH /api/transactions/:id`.
5. **Filtro e Rastreabilidade Visual por Conta**: Inclusão de seletor de conta bancária na barra de filtros (`TransactionFilters`) e renderização de coluna/badge dedicada de conta na tabela (`TransactionTable`).
6. **Estratégia TDD com 100% de Aprovação**: Criação e atualização de testes automatizados unitários e de integração com Vitest e Testing Library.

## Technical Context

**Language/Version**: TypeScript 5.8+ (Modo estrito: `strict: true`, `noImplicitAny: true`, zero `any`)  
**Primary Dependencies**: Next.js 16.4 (App Router), React 19, Tailwind CSS v4, `@tanstack/react-query` v5, `lucide-react`, `zod`  
**Storage**: Persistência via API Fastify/MongoDB; cache e mutações client-side orquestrados via TanStack Query  
**Testing**: Vitest 5.0+, `@testing-library/react` em ambiente `happy-dom`  
**Target Platform**: Navegadores Web modernos (desktop e mobile)  
**Performance Goals**: Exclusão e resposta da UI < 300ms; atualização de queries em segundo plano sem flickers visuais  
**Constraints**: Diálogos modais renderizados obrigatoriamente no `document.body` via `createPortal` (Princípio de isolamento CSS contra `backdrop-blur`); compatibilidade retroativa com uploads e transações sem conta associada  
**Scale/Scope**: 1 novo hook (`useDeleteTransaction`), 1 novo componente de diálogo (`TransactionDeleteDialog`), atualização de 4 componentes existentes (`TransactionTable`, `TransactionFilters`, `TransactionDropzone`, `TransactionEditDialog`), atualização de schemas e tipos canônicos  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. TypeScript Estrito & Zero `any`**: `CANONICAL_CATEGORIES`, `Transaction`, `UpdateTransactionDTO` e `TransactionFilterParams` declarados estritamente com narrowing via Zod em `types/api.ts` e `lib/validations/transaction.ts`.
- [x] **II. Clean Code & Respeito ao Contexto**: Componentes visuais mantêm responsabilidade única (SRP); toda lógica de mutação e rede reside isolada nos custom hooks (`useDeleteTransaction`, `useTransactions`, `useUploadTransactions`).
- [x] **III. Gestão de Estado de IA**: A segregação de "Pagamento de Fatura" e "Investimentos" prepara a base contábil para que os diagnósticos de IA do Gemini não contabilizem quitações de fatura como gastos primários duplos.
- [x] **IV. Consumo de Streaming SSE**: Mantém integridade do módulo de chat sem colisões.
- [x] **V. TanStack Query Reativo**: `useDeleteTransaction` e `useUpdateTransaction` disparam invalidação direcionada para `['transactions']`, `['accounts']` e `['analysis']`.
- [x] **VI. Segurança & Privacidade**: Validação de formato e tamanho (10MB) mantida no client antes do upload; JWT interceptado automaticamente pelo `apiClient`.
- [x] **VII. Testes Obrigatórios**: Testes unitários para schemas Zod, testes do novo hook `useDeleteTransaction` e testes de componente para diálogo de exclusão, upload com conta e filtros expandidos.

## Project Structure

### Documentation (this feature)

```text
specs/007-transactions-extended-deletion-categories/
├── spec.md              # Requisitos funcionais e cenários de aceitação
├── checklists/          # Checklists de qualidade
│   └── requirements.md  # Checklist de conformidade e prontidão
├── plan.md              # Este plano arquitetural
├── research.md          # Decisões arquiteturais e justificativas técnicas
├── data-model.md        # Modelos TypeScript e schemas Zod
├── quickstart.md        # Roteiro de testes automatizados e homologação manual
├── contracts/           # Contratos canônicos da API
│   └── transactions-extended-contract.json
└── tasks.md             # Tarefas atômicas de implementação (geradas no /speckit-tasks)
```

### Source Code Impact (repository root)

```text
src/
└── types/
    └── api.ts                             # Expansão para 11 categorias e accountId/account em Transaction

lib/
└── validations/
    ├── transaction.ts                     # Schema Zod atualizado com 11 categorias e accountId opcional
    └── transaction.test.ts                # Testes unitários do schema Zod com as 11 categorias

hooks/
├── use-delete-transaction.ts              # Novo hook de mutação DELETE /api/transactions/:id
├── use-delete-transaction.test.tsx        # Testes automatizados com mock de API e invalidação de cache
├── use-transactions.ts                    # Atualização para suportar parâmetro accountId no filtro
├── use-transactions.test.tsx              # Testes do hook useTransactions com accountId
├── use-upload-transactions.ts             # Atualização para suportar accountId na query string
└── use-upload-transactions.test.tsx       # Testes do upload com e sem accountId

components/
└── transactions/
    ├── transaction-table.tsx              # Coluna "Conta", badges com novas cores e botão de exclusão
    ├── transaction-table.test.tsx         # Testes de componente da tabela com ações e badges
    ├── transaction-delete-dialog.tsx      # Diálogo modal de confirmação de exclusão segura
    ├── transaction-delete-dialog.test.tsx # Testes do diálogo de exclusão com portal e callbacks
    ├── transaction-filters.tsx            # Filtro com 11 categorias e seletor de contas bancárias
    ├── transaction-filters.test.tsx       # Testes dos filtros com as 11 categorias e contas
    ├── transaction-dropzone.tsx           # Seletor de conta para vincular extrato importado
    ├── transaction-dropzone.test.tsx      # Testes da seleção de conta no upload
    ├── transaction-edit-dialog.tsx        # Campo para reatribuir ou desvincular conta bancária
    └── transaction-edit-dialog.test.tsx   # Testes da edição de categoria, descrição e conta
```

## Complexity Tracking

Nenhuma complexidade acidental identificada. O design reutiliza integralmente o ecossistema de componentes já homologado no projeto (`Dialog`, `Button`, `Badge`, `Select`), conecta-se diretamente ao hook `useAccounts` já desenvolvido na Feature 006 e consome os endpoints do backend Fastify já em execução e testados no branch `develop`.
