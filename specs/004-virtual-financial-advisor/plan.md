# Implementation Plan: Painel Conversacional de Consultoria Financeira Virtual com Streaming SSE em Tempo Real

**Branch**: `004-virtual-financial-advisor` | **Date**: 2026-10-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-virtual-financial-advisor/spec.md`

---

## Summary

Implementação do Consultor Financeiro Virtual em tempo real consumindo o endpoint `POST /api/chat/stream` via Server-Sent Events (SSE) com leitor nativo `ReadableStream` e decodificação UTF-8 progressiva. A interface adota um modelo híbrido completo: uma gaveta lateral deslizante (`ChatDrawer`) acessível globalmente a partir do cabeçalho e de um botão flutuante de atalho, e uma rota dedicada em tela cheia (`/chat`). A solução conta com controle de interrupção imediata via `AbortController` ("Parar resposta"), efeito de digitação suave com auto-scroll inteligente, geração dinâmica de perguntas rápidas baseadas no orçamento do mês corrente, histórico persistente em `sessionStorage` para privacidade de dados e tratamento gracioso dos estados de chave BYOK (`hasAiKey`) e erros de cota (HTTP 429/503).

---

## Technical Context

**Language/Version**: TypeScript 5.x configurado em modo estrito (`strict: true`, `noImplicitAny: true`, zero `any`).

**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS v4, `@tanstack/react-query` v5, Lucide React, Base UI / Shadcn.

**Storage**:
- Armazenamento de sessão (`sessionStorage`) sob a chave `@finai:chat_session` retendo `{ sessionId, messages }`.
- LocalStorage para token JWT gerenciado pelo cliente de autenticação.
- Cache de métricas do TanStack Query (`['analysis', currentMonth]`) para alimentação contextual dos chips rápidos.

**Testing**: Vitest, React Testing Library (`@testing-library/react`), `happy-dom`.

**Target Platform**: Navegadores Web modernos (Chrome, Safari, Firefox, Edge) com suporte a Web Streams e Server-Sent Events; layout responsivo desktop e mobile.

**Project Type**: Web Application (Frontend Dashboard / Next.js Client Components).

**Performance Goals**:
- Latência de primeiro token renderizado < 1,5s após início da transmissão do servidor.
- Interrupção imediata de geração < 100ms ao acionar "Parar resposta".
- Rolagem automática suave mantendo 60fps sem congelamentos de interface durante alto volume de chunks.

**Constraints**:
- **Princípio I da Constituição**: TypeScript Estrito com proibição expressa de `any` (uso estrito dos tipos canônicos de `src/types/api.ts`).
- **Princípio II da Constituição**: Single Responsibility Principle (lógica isolada em `useChatStream`, componentes focados estritamente em UI).
- **Princípio III da Constituição**: Resiliência BYOK (bloqueio pedagógico caso `hasAiKey === false` com gatilho direto para cadastro de chave no Google AI Studio, e tratamento resiliente de erros 403, 429 e 503 com retry inline).
- **Princípio IV da Constituição**: Consumo obrigatório de SSE nativo via `ReadableStream` com decodificador progressivo UTF-8 e cancelamento via `AbortController`.
- **Princípio VII da Constituição**: Testes automatizados obrigatórios cobrindo o parser de stream, o hook customizado e os componentes da interface.

**Scale/Scope**:
- 1 hook customizado (`useChatStream`).
- 1 utilitário de processamento de stream (`chat-stream-parser.ts`).
- 1 contexto global para controle do Drawer (`chat-drawer-context.tsx`).
- 6 componentes modulares (`ChatPanel`, `ChatMessageList`, `ChatMessageItem`, `ChatInput`, `QuickSuggestionChips`, `ChatDrawer`).
- 1 rota de página completa (`app/(dashboard)/chat/page.tsx`).
- Gatilhos de abertura integrados ao `Navbar` e botão flutuante de acesso rápido.
- Suíte completa de testes automatizados com Vitest.

---

## Constitution Check

*GATE: Avaliação contra a Constituição do Projeto (.specify/memory/constitution.md)*

| Princípio | Descrição | Status | Justificativa / Mecanismo |
|---|---|---|---|
| **I. TypeScript Estrito & Zero "any"** | Tipagem 100% forte sem `any` | **PASS** | Uso rigoroso dos tipos canônicos `ChatMessage`, `ChatStreamChunk` de `src/types/api.ts` e tipos explícitos para callbacks e payloads. |
| **II. Clean Code & Componentização** | Componentes enxutos, SRP e hooks customizados | **PASS** | Orquestração do stream, abort e persistência isolada em `useChatStream`. Componentes visuais atômicos (`ChatMessageItem`, `QuickSuggestionChips`, `ChatInput`). |
| **III. Gestão de Estado de IA & BYOK** | UX resiliente para chave ausente ou erros de IA | **PASS** | Bloqueio explicativo caso `hasAiKey === false` com botão para modal BYOK; tratamento inline de 429 e 503 com ação "Tentar novamente". |
| **IV. Streaming SSE** | Consumo de SSE via `ReadableStream` e `AbortController` | **PASS** | Consumo direto com `fetch`, decodificador progressivo `TextDecoder`, buffer de linhas e cancelamento instantâneo via sinal `AbortController`. |
| **V. Cache Reativo TanStack Query** | Gerenciamento de leitura e invalidação | **PASS** | Leitura de `['analysis', currentMonth]` para personalização dos chips de atalho orçamentários. |
| **VI. Segurança e Privacidade** | Proteção de tokens e retenção em `sessionStorage` | **PASS** | Token JWT no cabeçalho `Authorization: Bearer`, histórico mantido em `sessionStorage` para privacidade sem exposição em `localStorage` persistente. |
| **VII. Testes Obrigatórios** | Cobertura com Vitest e Testing Library | **PASS** | Testes unitários para o parser de SSE, testes com mocks de `ReadableStream` para o hook e testes de interação para todos os componentes. |

---

## Project Structure

### Documentation (this feature)

```text
specs/004-virtual-financial-advisor/
├── spec.md              # Especificação de requisitos e cenários de aceitação
├── checklists/
│   └── requirements.md  # Checklist de qualidade validado (16/16)
├── plan.md              # Este arquivo de plano de implementação
├── research.md          # Decisões de arquitetura e tecnologia (Phase 0)
├── data-model.md        # Entidades, lifecycle e regras de negócio (Phase 1)
├── contracts/
│   └── chat-stream-contract.json # Contrato canônico do endpoint POST /api/chat/stream
├── quickstart.md        # Guia de homologação e testes automatizados (Phase 1)
└── tasks.md             # Tarefas atômicas de implementação (Phase 2 - /speckit-tasks)
```

### Source Code Architecture

```text
app/
└── (dashboard)/
    └── chat/
        └── page.tsx                         # Rota dedicada do Consultor Financeiro (Full-screen)

components/
└── chat/
    ├── chat-panel.tsx                       # Painel orquestrador central (usado no Drawer e na rota /chat)
    ├── chat-message-list.tsx                # Lista rolável de mensagens com auto-scroll inteligente
    ├── chat-message-item.tsx                # Bolha de mensagem individual (User vs Model, Markdown, Alertas inline)
    ├── chat-input.tsx                       # Barra de digitação com alternância Enviar / Parar resposta
    ├── quick-suggestion-chips.tsx          # Chips de perguntas rápidas baseadas no orçamento ativo
    ├── chat-drawer.tsx                      # Gaveta lateral expansível com sobreposição não bloqueante
    ├── chat-drawer-context.tsx              # Contexto React para abertura/fechamento global do Drawer
    └── chat-floating-button.tsx             # Botão flutuante de atalho rápido no canto inferior do dashboard

hooks/
├── use-chat-stream.ts                       # Custom Hook central: SSE ReadableStream, AbortController, sessionStorage
└── use-chat-stream.test.tsx                 # Testes automatizados do hook com mocks de streams

lib/
├── chat-stream-parser.ts                    # Utilitário puro para parsing de buffers SSE ("data: ...")
└── chat-stream-parser.test.ts               # Testes unitários do decodificador SSE
```

**Structure Decision**: Adoção da estrutura canônica do Next.js App Router com desacoplamento rigoroso: componentes visuais em `components/chat/`, lógica de streaming em `hooks/use-chat-stream.ts`, utilitário puro em `lib/chat-stream-parser.ts` e página dedicada em `app/(dashboard)/chat/page.tsx`.

---

## Complexity Tracking

> **Nenhuma violação aos princípios da Constituição foi detectada. Todos os gates foram avaliados como PASS.**
