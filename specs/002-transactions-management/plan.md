# Implementation Plan: Gestão de Transações Financeiras com Upload e Categorização Inteligente

**Branch**: `002-transactions-management` | **Date**: 2026-10-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from [`specs/002-transactions-management/spec.md`](./spec.md)

---

## Summary

Esta feature implementa a tela de Gestão de Transações da plataforma de inteligência financeira: importação de extratos bancários nos formatos `.ofx` e `.csv` via upload drag-and-drop com validação estrita no cliente (limite de 10MB e extensão permitida), listagem com paginação e ordenação cronológica decrescente, filtros dinâmicos por mês de competência (`YYYY-MM`), categoria canônica e origem (`OFX`, `CSV`, `SEED`), edição manual de descrições e categorias via modal acessível (`Dialog`), e rotina de categorização automática em lote de toda a conta do usuário por IA com suporte ao modelo BYOK (Google AI Studio).

A abordagem técnica emprega Next.js 16 (App Router), React 19, componentes de interface com Tailwind CSS v4 e `@base-ui/react`, orquestração reativa de cache com TanStack Query v5 (`@tanstack/react-query`), validações Zod e testes automatizados obrigatórios com Vitest e React Testing Library (Princípio VII da Constituição).

---

## Technical Context

**Language/Version**: TypeScript 5 em modo estrito (`strict: true`, `noImplicitAny: true`, zero `any`, sem supressões `@ts-ignore`).

**Primary Dependencies**: Next.js 16.4.0 (App Router), React 19.3.0, `@base-ui/react`, Tailwind CSS v4, `lucide-react`, `@tanstack/react-query`, `zod`.

**Storage**: Armazenamento no backend via API REST (`/api/transactions`); cache reativo no cliente gerenciado por TanStack Query (`queryClient`); sessão e token Bearer gerenciados via `localStorage`.

**Testing**: Bateria automatizada com Vitest e React Testing Library (`pnpm test`), verificação estática de tipos com `pnpm typecheck` (`tsc --noEmit`), linting com `pnpm lint` (`eslint`) e cenários ponta a ponta detalhados em [quickstart.md](./quickstart.md).

**Target Platform**: Navegadores web modernos (Chrome, Firefox, Safari, Edge), layout responsivo cobrindo resoluções de 320px (mobile) a 2560px (desktop/ultrawide).

**Project Type**: Web Application (Next.js App Router Frontend).

**Performance Goals**:
- Transição de filtros e renderização da listagem de transações em < 1s (com cache pré-aquecido: < 100ms).
- Upload e resposta do resumo de importação em < 3s para extratos de até 500 lançamentos.
- Edição manual de transação refletida instantaneamente na interface em < 1s.

**Constraints**:
- Validação client-side obrigatória de arquivos antes do despacho (máximo 10MB, apenas `.ofx` e `.csv`).
- Restrição a um arquivo por operação de upload (`multiple: false`).
- Separação estrita de responsabilidades (SRP): componentes visuais em `components/transactions/` e chamadas de rede/estado em custom hooks (`hooks/`).
- Bloqueio amigável de chamadas de IA caso a chave do Google AI Studio (`hasAiKey: false`) não esteja configurada.

**Scale/Scope**: Feature 2 de 4 no roadmap do frontend. Abrange a rota `/transactions`, 6 componentes especializados, 4 custom hooks, funções puras de formatação/validação e suíte de testes automatizados.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Princípio Constitucional | Status | Justificativa / Validação |
| :--- | :---: | :--- |
| **I. TypeScript Estrito e Zero "any"** | ✅ PASS | Tipos canônicos centralizados em `src/types/api.ts` e DTOs tipados sem `any` em todo o fluxo. |
| **II. Clean Code, Componentização & SRP** | ✅ PASS | Componentes visuais desacoplados de regras de rede; custom hooks isolados (`useTransactions`, `useUploadTransactions`, `useUpdateTransaction`, `useCategorizeTransactions`). |
| **III. Gestão de Estado de IA & UX BYOK** | ✅ PASS | `useCategorizeTransactions` avalia `hasAiKey`; se não configurada, direciona para o `AiKeyModal` sem disparar erro 403; trata 429 e 503 com resiliência. |
| **IV. Streaming SSE em Tempo Real** | ⚪ N/A | Reservado para o Chatbot Assistente (Feature 4). |
| **V. Camada de Dados Reativa (TanStack Query)** | ✅ PASS | Chaves de consulta estruturadas `['transactions', { month, category, source }]` com invalidação direcionada pós-upload, edição e categorização. |
| **VI. Segurança no Cliente & Privacidade** | ✅ PASS | Token JWT centralizado via `api-client.ts`; validação client-side prévia de arquivos (10MB); zero log de informações sensíveis ou financeiras. |
| **VII. Testes Automatizados Obrigatórios** | ✅ PASS | Testes automatizados com Vitest e React Testing Library cobrindo formulários, hooks e formatadores, validados por `pnpm test`. |

---

## Project Structure

### Documentation (this feature)

```text
specs/002-transactions-management/
├── plan.md              # Este documento de planejamento de implementação
├── research.md          # Pesquisa técnica e decisões arquiteturais consolidadas
├── data-model.md        # Entidades, DTOs e diagramas de estado
├── quickstart.md        # Roteiro prático de validação e testes
├── contracts/           # Contrato formal JSON Schema dos endpoints
│   └── transactions-contract.json
└── checklists/
    └── requirements.md  # Checklist de qualidade da especificação
```

### Source Code (repository layout)

```text
app/
└── (dashboard)/
    └── transactions/
        └── page.tsx                         # Página da rota /transactions

components/
├── layout/
│   └── navbar.tsx                           # Atualização: adição do link de navegação Transações
└── transactions/
    ├── transaction-dropzone.tsx             # Zona de soltura drag-and-drop de extratos (.ofx e .csv)
    ├── transaction-filters.tsx              # Barra de filtros (seletor de mês YYYY-MM, categoria, origem)
    ├── transaction-table.tsx                # Tabela de transações com formatação monetária e badges
    ├── transaction-edit-dialog.tsx          # Modal de edição manual acessível (Dialog)
    ├── categorize-button.tsx                # Botão de ação de categorização em lote integrado a BYOK
    └── upload-summary-banner.tsx            # Card/banner informativo de resultado de importação

hooks/
├── use-transactions.ts                      # Consulta e filtragem com TanStack Query
├── use-transactions.test.tsx                # Teste do hook de listagem e refetch
├── use-upload-transactions.ts               # Mutação multipart de envio de extratos
├── use-upload-transactions.test.tsx         # Teste do hook de upload
├── use-update-transaction.ts                # Mutação PATCH de atualização pontual
├── use-update-transaction.test.tsx          # Teste do hook de atualização
├── use-categorize-transactions.ts           # Mutação POST de categorização com IA e guarda BYOK
└── use-categorize-transactions.test.tsx     # Teste do hook de categorização e estados de erro

lib/
├── formatters.ts                            # Funções puras: formatCurrencyBRL, formatDateBR, navegação de mês
├── formatters.test.ts                       # Testes das funções puras de formatação
└── validations/
    ├── transaction.ts                       # Validação de arquivos (10MB, .ofx, .csv) e schema Zod de edição
    └── transaction.test.ts                  # Testes unitários das regras de validação
```

---

## Complexity Tracking

*Nenhum princípio constitucional violado; nenhuma complexidade acidental introduzida.*
