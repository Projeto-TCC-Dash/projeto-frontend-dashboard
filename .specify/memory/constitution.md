<!--
Sync Impact Report:
- Version change: initial scaffold [CONSTITUTION_VERSION] -> 1.0.0
- List of modified principles:
  - Replaced template placeholders with 6 core principles:
    - [PRINCIPLE_1_NAME] -> I. TypeScript Estrito e Zero "any"
    - [PRINCIPLE_2_NAME] -> II. Clean Code, Componentização e Respeito ao Contexto Existente
    - [PRINCIPLE_3_NAME] -> III. Gestão de Estado de IA e UX Resiliente BYOK (Bring Your Own Key)
    - [PRINCIPLE_4_NAME] -> IV. Consumo de Streaming em Tempo Real (Server-Sent Events)
    - [PRINCIPLE_5_NAME] -> V. Camada de Dados Reativa com Cache Inteligente (TanStack Query)
    - Added PRINCIPLE_6 -> VI. Segurança no Cliente e Privacidade por Design
- Added sections:
  - Arquitetura e Stack Técnica
  - Padrões de Desenvolvimento e Validação de Qualidade
- Governance:
  - Added amendment procedure, semantic versioning policy, and compliance review rules.
- Follow-up TODOs:
  - None. All placeholders resolved based on frontend.md and repository package.json inspection.
-->

# Constituição da Plataforma de Inteligência Financeira - Frontend

## Core Principles

### I. TypeScript Estrito e Zero "any"
- O frontend DEVE ser construído com TypeScript configurado em modo estrito (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`).
- É TERMINANTEMENTE PROIBIDO o uso de `any` explícito ou implícito em qualquer módulo, componente, hook, serviço ou chamada de API.
- Tipagens dinâmicas externas DEVEM ser tratadas como `unknown` e submetidas a *narrowing* via Zod ou *type guards* determinísticos.
- Todas as entidades de domínio e respostas de backend DEVEM respeitar estritamente os contratos canônicos de API definidos para o ecossistema.

### II. Clean Code, Componentização e Respeito ao Contexto Existente
- **Baseline do Projeto**: A IA e os desenvolvedores DEVEM obrigatoriamente inspecionar e respeitar o esqueleto pré-existente e as versões já instaladas no `package.json` (Next.js 16, React 19, Tailwind CSS v4, Lucide React, Shadcn). É proibido impor versões conflitantes ou reescrever a base do projeto. Novas dependências devem ser adicionadas apenas se essenciais e totalmente compatíveis.
- **Single Responsibility Principle (SRP)**: Componentes visuais DEVEM se preocupar estritamente com renderização, acessibilidade e interatividade de interface. Lógica de negócios, chamadas de API e manipulação de estado complexo DEVEM residir isoladas em **Custom Hooks**.
- **KISS (Keep It Simple, Stupid) & DRY (Don't Repeat Yourself)**: Evitar abstrações prematuras e acoplamento desnecessário. Criar componentes utilitários apenas quando houver duplicidade real de interface comprovada.
- **Nomenclatura Significativa**: Variáveis, funções e componentes DEVEM ter nomes descritivos e autoexplicativos em inglês técnico padrão (ex: `useFinancialAnalysis`, `TransactionEditModal`, `CategoryDonutChart`).
- **Funções Pequenas e Puras**: Funções utilitárias e formatadores de moeda, porcentagem e data DEVEM ser puras, determinísticas e testáveis unitariamente de forma isolada.

### III. Gestão de Estado de IA e UX Resiliente BYOK (Bring Your Own Key)
- O status `hasAiKey` do usuário autenticado é um estado de primeira classe da interface:
  - Se `hasAiKey: false`: recursos dependentes de IA (Categorização por IA, Diagnóstico do Mês e Chat SSE) DEVEM exibir estado amigável com botão de ativação de chave.
  - O modal de cadastro de chave DEVE fornecer link direto para o Google AI Studio e reportar o resultado do teste ativo de conexão (`ACTIVE_VERIFIED` ou `ACTIVE_PROVISIONAL_DEMAND`).
- A interface DEVE tratar graciosamente erros `403` (chave ausente), `429` (limite de taxa) e `503` (alta demanda upstream temporária no Google AI Studio), orientando o usuário com alternativas e recuperação sem travamento da aplicação.

### IV. Consumo de Streaming em Tempo Real (Server-Sent Events)
- O assistente financeiro DEVE consumir o endpoint SSE (`POST /api/chat/stream`) utilizando a API nativa `ReadableStream` (`fetch`) com decodificador UTF-8 progressivo.
- O efeito de digitação e a renderização progressiva DEVEM atualizar a tela sem provocar re-renderizações desnecessárias na lista de mensagens anteriores.
- O usuário DEVE poder interromper a resposta a qualquer momento via botão "Parar geração" ancorado em `AbortController`.

### V. Camada de Dados Reativa com Cache Inteligente (TanStack Query)
- Todas as operações de leitura (`GET`) DEVEM utilizar TanStack Query com políticas de cache explícitas (`staleTime`, `gcTime`).
- Mutações (`POST`, `PATCH`, `PUT`) DEVEM disparar invalidação direcionada das chaves de query afetadas (`invalidateQueries`), mantendo o dashboard sincronizado sem recarregamento completo de página.

### VI. Segurança no Cliente e Privacidade por Design
- Tokens JWT DEVEM ser armazenados de forma centralizada e anexados automaticamente nas requisições protegidas (`Authorization: Bearer <token>`).
- É PROIBIDO registrar dados pessoais identificáveis (PII), senhas, tokens ou chaves em chamadas de `console.log`.
- O upload de extratos (.ofx e .csv) DEVE validar no lado do cliente a extensão do arquivo e o tamanho máximo permitido (10MB) antes do envio.

## Arquitetura e Stack Técnica

- **Runtime & Framework**: Next.js 16 (App Router) e React 19 conforme definido no `package.json`.
- **Linguagem**: TypeScript 5 em modo estrito, sem supressões (`@ts-ignore` ou `any`).
- **Estilização & Componentes**: Tailwind CSS v4, `@base-ui/react`, Lucide Icons, Shadcn e suporte a tema dark/light (`next-themes`).
- **Gerenciamento de Estado de Servidor**: TanStack Query (`@tanstack/react-query`) para caching, sincronização e refetch reativo.
- **Comunicação em Tempo Real**: Streams SSE nativos com `ReadableStream` e decodificação progressiva UTF-8 sem dependências externas pesadas.
- **Tipagens e Contratos Canônicos**: Centralizados em `src/types/api.ts` cobrindo Usuário, Autenticação, Transações, Métricas Financeiras e Chunks de Chat.

## Padrões de Desenvolvimento e Validação de Qualidade

- **Validação Estática**: Todo código produzido DEVE compilar com sucesso via `pnpm typecheck` (`tsc --noEmit`) e passar pelas regras de lint configuradas no projeto (`pnpm lint`).
- **Formatação de Código**: Manter conformidade com as regras do Prettier (`pnpm format`).
- **Isolamento de Domínio**: Componentes de interface localizados em `components/`, hooks em `hooks/`, serviços de API em `services/`, tipos em `types/` e utilitários em `lib/` ou `utils/`.
- **Tratamento de Exceções**: Todas as rotas de chamada externa DEVEM conter tratamento de erro amigável na interface com toasts informativos ou banners de fallback.

## Governance

- **Supremacia da Constituição**: Esta Constituição prevalece sobre decisões pontuais e práticas legadas no desenvolvimento do frontend.
- **Conformidade em Pull Requests e Revisões**: Toda nova tela, componente, hook ou feature desenvolvida no frontend DEVE ser avaliada e aprovada contra os princípios desta Constituição.
- **Procedimento de Emenda**:
  - Propostas de alteração de princípios devem ser documentadas com justificativa de impacto.
  - Atualizações devem refletir nos arquivos de governança e no histórico do projeto.
- **Política de Versionamento Semântico**:
  - **MAJOR**: Alterações ou remoções com quebra de compatibilidade em princípios ou regras arquiteturais.
  - **MINOR**: Inclusão de novos princípios, seções ou expansões materiais das diretrizes.
  - **PATCH**: Refinamentos textuais, esclarecimentos e correções sem impacto nas regras de governança.

**Version**: 1.0.0 | **Ratified**: 2026-10-19 | **Last Amended**: 2026-10-19
