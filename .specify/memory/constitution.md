<!--
Sync Impact Report:
- Version change: 1.1.0 -> 1.2.0
- List of modified principles:
  - Added VIII. Gestão de Identidade e Segurança de Sessão
  - Added IX. Manipulação Segura de Mídias, Validação de Arquivos e Exportação
- Added sections:
  - Updated Arquitetura e Stack Técnica com suporte a uploads multipart, Blobs e exportações (CSV, PDF, XLSX)
  - Updated Padrões de Desenvolvimento com regras de portais para modais de confirmação crítica
- Governance:
  - Incremented MINOR version per semver policy (new core principles and capability expansions).
- Follow-up TODOs:
  - None.
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
- **Nomenclatura Significativa**: Variáveis, funções e componentes DEVEM ter nomes descritivos e autoexplicativos em inglês técnico padrão (ex: `useFinancialAnalysis`, `TransactionEditModal`, `CategoryDonutChart`, `UserAvatarUploader`).
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
- Mutações (`POST`, `PATCH`, `PUT`, `DELETE`) DEVEM disparar invalidação direcionada das chaves de query afetadas (`invalidateQueries`), mantendo o dashboard sincronizado sem recarregamento completo de página.

### VI. Segurança no Cliente e Privacidade por Design
- Tokens JWT DEVEM ser armazenados de forma centralizada e anexados automaticamente nas requisições protegidas (`Authorization: Bearer <token>`).
- É PROIBIDO registrar dados pessoais identificáveis (PII), senhas, tokens ou chaves em chamadas de `console.log`.
- O upload de extratos (.ofx e .csv) DEVE validar no lado do cliente a extensão do arquivo e o tamanho máximo permitido (10MB) antes do envio.

### VII. Testes Automatizados Obrigatórios (Vitest & Testing Library)
- Todo novo componente de formulário, hook customizado e módulo utilitário DEVE conter testes unitários e de integração automatizados com Vitest e Testing Library.
- As mutações e validações de regras de negócio DEVEM ser cobertas com cenários de sucesso e caminhos de erro antes da homologação da entrega.
- Testes automatizados DEVEM ser executáveis localmente e no pipeline de integração contínua através do comando `pnpm test`.

### VIII. Gestão de Identidade e Segurança de Sessão
- **Salvaguarda Contra Orfandade de Autenticação**: A interface DEVE impedir a desvinculação de conta externa (ex: Google OAuth) se esta for o único meio de autenticação ativo do usuário (sem senha cadastrada), prevenindo bloqueio permanente de acesso.
- **Encerramento Seguro de Sessão (Logout)**:
  - O logout DEVE invocar a rota de revogação de sessão no servidor (`POST /api/auth/logout`), expurgar tokens locais em cookies e `localStorage`, limpar os caches do TanStack Query e redirecionar imediatamente o usuário para `/login`.

### IX. Manipulação Segura de Mídias, Validação de Arquivos e Exportação
- **Upload e Gestão de Avatar**:
  - Validação estrita no cliente de tamanho máximo (até 5MB) e tipos MIME autorizados (`image/jpeg`, `image/png`, `image/webp`).
  - Preview imediato no navegador com liberação de recursos temporários (`URL.revokeObjectURL`) ao desmontar ou trocar de imagem.
  - Fallback determinístico para avatar com iniciais do nome do usuário quando não houver foto cadastrada ou após a exclusão do avatar.
- **Central de Exportação de Relatórios**:
  - Download de arquivos (CSV, PDF, XLSX) gerados pelo backend via streams/Blobs binários utilizando o nome de arquivo canônico retornado nos headers (`Content-Disposition`) ou fallback determinístico formatado com data.
  - Liberação mandatória de memória chamando `URL.revokeObjectURL` após o acionamento do elemento de download âncora.
  - Bloqueio contra múltiplos cliques concorrentes com indicadores visuais de loading/progresso durante a geração do arquivo.

## Arquitetura e Stack Técnica

- **Runtime & Framework**: Next.js 16 (App Router) e React 19 conforme definido no `package.json`.
- **Linguagem**: TypeScript 5 em modo estrito, sem supressões (`@ts-ignore` ou `any`).
- **Estilização & Componentes**: Tailwind CSS v4, `@base-ui/react`, Lucide Icons, Shadcn e suporte a tema dark/light (`next-themes`).
- **Gerenciamento de Estado de Servidor**: TanStack Query (`@tanstack/react-query`) para caching, sincronização e refetch reativo.
- **Comunicação em Tempo Real**: Streams SSE nativos com `ReadableStream` e decodificação progressiva UTF-8 sem dependências externas pesadas.
- **Mídias e Arquivos**: Suporte nativo a uploads multipart com validação client-side, manipulação de `Blob` para downloads e controle estrito de memória (`URL.createObjectURL` / `URL.revokeObjectURL`).
- **Testes Automatizados**: Vitest e React Testing Library (`@testing-library/react`) configurados com ambiente DOM (`happy-dom` ou `jsdom`) para execução de testes unitários e testes de integração de componentes e hooks.
- **Tipagens e Contratos Canônicos**: Centralizados em `src/types/api.ts` cobrindo Usuário, Autenticação, Sessão, Exportações, Transações, Métricas Financeiras e Chunks de Chat.

## Padrões de Desenvolvimento e Validação de Qualidade

- **Validação Estática**: Todo código produzido DEVE compilar com sucesso via `pnpm typecheck` (`tsc --noEmit`) e passar pelas regras de lint configuradas no projeto (`pnpm lint`).
- **Validação de Testes**: Todo novo módulo ou funcionalidade DEVE ser submetido à validação de testes automatizados via `pnpm test`, sendo reprovada qualquer entrega que contenha quebras de testes existentes ou novas funcionalidades críticas sem cobertura.
- **Portais para Diálogos Críticos**: Todos os modais (`Dialog`, `AlertDialog`) de exclusão de mídias e logout DEVEM renderizar via `createPortal(..., document.body)` para evitar problemas de sobreposição e herança de estilos CSS.
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

**Version**: 1.2.0 | **Ratified**: 2026-10-19 | **Last Amended**: 2026-10-24
