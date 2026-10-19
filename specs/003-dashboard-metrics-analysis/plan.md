# Implementation Plan: Dashboard Financeiro com Métricas Consolidadas, Gráfico de Categorias e Parecer por IA

**Branch**: `003-dashboard-metrics-analysis` | **Date**: 2026-10-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-dashboard-metrics-analysis/spec.md`

---

## Summary

Implementação da tela principal do Dashboard Financeiro (`/dashboard`), consumindo o endpoint canônico `GET /api/analysis/:month` (com suporte a recálculo forçado via `?forceRefresh=true`). A tela consolida 4 cartões de KPIs essenciais (Receitas Totais, Despesas Totais, Saldo Líquido e Taxa de Poupança), um gráfico interativo de rosca (Donut Chart) em SVG nativo apresentando todas as categorias ativas com navegação por drill-down para `/transactions`, um seletor dinâmico de competência mensal (`YYYY-MM`) e o parecer analítico mensal estruturado em Markdown com recomendações acionáveis, indicador de cache e resiliência BYOK para usuários sem chave de IA cadastrada.

---

## Technical Context

**Language/Version**: TypeScript 5.x configurado em modo estrito (`strict: true`, zero `any`).

**Primary Dependencies**: Next.js 16.4 (App Router), React 19.3, Tailwind CSS v4, `@tanstack/react-query` v5, Lucide React, Base UI / Shadcn.

**Storage**: Armazenamento em memória pelo cliente TanStack Query com cache inteligente (`staleTime: 5min`, `gcTime: 30min`), sessão JWT gerenciada via LocalStorage.

**Testing**: Vitest 5.x, React Testing Library (`@testing-library/react`), `happy-dom`.

**Target Platform**: Navegadores Web modernos (Chrome, Firefox, Safari, Edge), layout responsivo para desktop e dispositivos móveis.

**Project Type**: Web Application (Frontend Dashboard / Next.js Client Components).

**Performance Goals**: Tempo de renderização inicial < 1s; alternância entre meses cacheados < 100ms sem recarregamento de página; zero flickering visual com Skeletons de carregamento.

**Constraints**:
- Princípio I da Constituição: TypeScript Estrito com proibição expressa de `any`.
- Princípio II da Constituição: Single Responsibility Principle (lógica isolada em Custom Hooks, componentes focados em UI).
- Princípio III da Constituição: Resiliência BYOK (cards de métricas continuam visíveis se `hasAiKey === false`, parecer analítico exibe CTA para configurar chave).
- Princípio V da Constituição: Operações de leitura via TanStack Query com chaves `['analysis', month]`.
- Princípio VII da Constituição: Testes automatizados obrigatórios cobrindo utilitários, hooks e componentes.

**Scale/Scope**: 4 cartões de métricas, gráfico de rosca de até 8 categorias de despesa com navegação por drill-down, bloco analítico em Markdown, 1 hook customizado, 5 novos componentes e suíte de testes automatizados.

---

## Constitution Check

*GATE: Avaliação contra a Constituição do Projeto (.specify/memory/constitution.md)*

| Princípio | Descrição | Status | Justificativa / Mecanismo |
|---|---|---|---|
| **I. TypeScript Estrito & Zero "any"** | Tipagem 100% forte sem `any` | **PASS** | Todas as estruturas utilizam os contratos canônicos de `src/types/api.ts` e tipos explícitos para props e retornos de hooks. |
| **II. Clean Code & Componentização** | Componentes enxutos, SRP e hooks customizados | **PASS** | Lógica de consulta e mutação isolada em `useFinancialAnalysis`, componentes de UI modulares (`MetricCard`, `CategoryDonutChart`, `AiDiagnosisCard`, `MonthSelector`). |
| **III. Gestão de Estado de IA & BYOK** | UX resiliente para chave ausente ou erros de IA | **PASS** | Verificação de `hasAiKey` com exibição de banner educativo e gatilho para o modal BYOK, tratamento gracioso para erros 403, 429 e 503. |
| **IV. Streaming SSE** | Consumo de SSE | **N/A** | Não aplicável a esta feature (pertence à Feature 4 - Chatbot Assistente). |
| **V. Cache Reativo TanStack Query** | Gerenciamento de leitura e invalidação | **PASS** | Cache com chave `['analysis', month]`, `refreshAnalysis` via `forceRefresh=true`, invalidação automática pós-transações. |
| **VI. Segurança e Privacidade** | Sanitização e proteção de tokens | **PASS** | Token JWT no cabeçalho `Authorization: Bearer`, sanitização completa de HTML/Markdown antes da renderização. |
| **VII. Testes Obrigatórios** | Cobertura com Vitest e Testing Library | **PASS** | Testes unitários e de integração para `useFinancialAnalysis`, formatadores de deficit/poupança e todos os componentes visuais. |

---

## Project Structure

### Documentation (this feature)

```text
specs/003-dashboard-metrics-analysis/
├── spec.md              # Especificação de requisitos e cenários de aceitação
├── checklists/
│   └── requirements.md  # Checklist de qualidade validado (16/16)
├── plan.md              # Este arquivo de plano de implementação
├── research.md          # Decisões de arquitetura e tecnologia (Phase 0)
├── data-model.md        # Entidades, lifecycle e regras de negócio (Phase 1)
├── contracts/
│   └── analysis-contract.json # Contrato canônico dos endpoints da API
├── quickstart.md        # Guia de homologação e testes automatizados (Phase 1)
└── tasks.md             # Tarefas atômicas de implementação (Phase 2 - /speckit-tasks)
```

### Source Code Architecture

```text
app/
└── (dashboard)/
    └── page.tsx                         # Página principal do Dashboard (Client Component orquestrador)

components/
└── dashboard/
    ├── dashboard-header.tsx             # Cabeçalho com título, badge de status de IA e seletor de mês
    ├── month-selector.tsx               # Seletor de competência (mês anterior, próximo mês e picker)
    ├── metric-card.tsx                  # Cartão individual de KPI com variantes semânticas e skeleton
    ├── metric-cards-grid.tsx            # Grid responsivo contendo os 4 KPIs essenciais
    ├── category-donut-chart.tsx         # Gráfico de rosca SVG nativo interativo com drill-down
    ├── category-chart-legend.tsx        # Legenda descritiva com valores, percentuais e cores
    └── ai-diagnosis-card.tsx            # Card analítico: Markdown sanitizado, recomendações e BYOK fallback

hooks/
├── use-financial-analysis.ts            # Custom Hook com TanStack Query para consulta e forceRefresh
└── use-financial-analysis.test.tsx      # Testes automatizados do hook

lib/
├── formatters.ts                        # Expansão dos formatadores monetários, percentuais e cálculo de poupança
├── formatters.test.ts                   # Testes unitários de formatação e déficit
└── markdown-renderer.tsx                # Renderizador seguro e sanitizado para o parecer analítico

tests/ (co-located)
├── components/dashboard/metric-card.test.tsx
├── components/dashboard/category-donut-chart.test.tsx
└── components/dashboard/ai-diagnosis-card.test.tsx
```

**Structure Decision**: Adoção do padrão co-located modular adotado nas Features 001 e 002, alocando componentes específicos em `components/dashboard/`, hooks em `hooks/`, funções utilitárias puras em `lib/` e a página no App Router em `app/(dashboard)/page.tsx`.

---

## Complexity Tracking

> **Nenhuma violação aos princípios da Constituição**. Arquitetura enxuta, sem dependências conflitantes com React 19, utilizando SVG vetorial nativo para gráficos e renderizador seguro para Markdown.
