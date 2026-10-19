# 🧭 Guia Mestre de Construção do Frontend com Spec-Kit

Este documento contém todo o contexto arquitetural, regras de governança, contratos de API e a esteira de comandos pronta para criar o **Dashboard Financeiro Inteligente (Frontend)** utilizando o **Spec-Kit**.

---

## 📑 Sumário

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Análise de Contexto e Stack Baseada no `package.json`](#2-análise-de-contexto-e-stack-baseada-no-packagejson)
3. [Constituição Técnica do Frontend (`constitution.md`)](#3-constituição-técnica-do-frontend-constitutionmd)
4. [Contratos de API e Tipos TypeScript](#4-contratos-de-api-e-tipos-typescript)
5. [Sequência de Comandos Spec-Kit para Execução](#5-sequência-de-comandos-spec-kit-para-execução)
6. [Estrutura de Diretórios Recomendada](#6-estrutura-de-diretórios-recomendada)
7. [Inicialização no Esqueleto Existente Passo a Passo](#7-inicialização-no-esqueleto-existente-passo-a-passo)

---

## 1. Visão Geral do Produto

O Frontend é um **Dashboard de Inteligência Financeira Pessoal** focado em:
- **Visualização Analítica de Alto Impacto**: Gráficos de fluxo de caixa, distribuição de despesas por categoria canônica, taxa de poupança e saldo líquido.
- **Diagnóstico com IA em Cache (24h)**: Exibição estruturada do parecer financeiro gerado pelo Google Gemini com recomendações práticas, avisos de risco e badge de cache inteligente.
- **Consultor Financeiro em Tempo Real (SSE)**: Chat interativo com streaming contínuo de conselhos personalizados alimentados pelo resumo financeiro do usuário.
- **Gestão Ágil de Extratos e Transações**: Upload drag-and-drop de arquivos `.ofx` e `.csv`, edição inline/modal (`PATCH`), categorização automática por IA e filtro multi-mês.
- **Experiência BYOK Transparente**: Fluxo claro para cadastro e validação ativa da API Key gratuita do Google AI Studio do próprio usuário.

---

## 2. Análise de Contexto e Stack Baseada no `package.json`

> 🤖 **DIRETIVA MANDATÓRIA PARA A IA / AGENTE SPEC-KIT:**
> **NÃO prescreva ou force versões arbitrárias de bibliotecas ou frameworks.**
> O projeto será criado a partir de um **esqueleto pré-existente**. Portanto, a sua PRIMEIRA ação ao planejar qualquer feature ou tarefa DEVE ser:
> 1. Inspecionar o `package.json` para mapear dependências já instaladas (`dependencies` e `devDependencies`).
> 2. Inspecionar as configurações do bundler (`vite.config.*`, `next.config.*`, etc.), do TypeScript (`tsconfig.json`) e de estilo (`tailwind.config.*`, `postcss.config.*`, CSS modules).
> 3. Adotar as ferramentas e versões já presentes como baseline inegociável.
> 4. **Apenas** sugerir ou instalar novas bibliotecas se uma capacidade indispensável estiver completamente ausente (ex: renderização de gráficos ou manipulação de stream), garantindo sempre compatibilidade sem causar conflitos de dependências.

### Capacidades Funcionais Esperadas (a serem mapeadas no esqueleto):

- **Core / Runtime**: Usar o React e o bundler (Vite, Next.js, etc.) já definidos no `package.json`.
- **Linguagem**: TypeScript em modo estrito (validar `tsconfig.json`).
- **Roteamento**: Adotar a solução já configurada no projeto (ex: `react-router-dom`, router do Next.js ou similar).
- **Estilização & UI**: Respeitar o setup de estilização presente (Tailwind CSS, CSS Modules, Radix UI, Shadcn, etc.).
- **Visualização de Dados (Gráficos)**: Recomendar/utilizar biblioteca compatível com React (ex: `recharts`, `chart.js` ou equivalente já disponível) para gráficos de rosca e barras.
- **Data Fetching & Cache**: Priorizar TanStack Query (`@tanstack/react-query`) ou a camada de dados nativa do esqueleto.
- **Formulários & Validação**: Utilizar o que estiver presente (ex: `react-hook-form` + `zod` ou equivalente).
- **Streaming SSE**: Utilizar a API nativa `ReadableStream` / `fetch` do browser (zero dependências extras necessárias).

---

## 3. Constituição Técnica do Frontend (`constitution.md`)

> **Instrução**: No repositório do frontend, após rodar `specify init`, substitua o conteúdo de `.specify/memory/constitution.md` por este texto:

```markdown
# Constituição da Plataforma de Inteligência Financeira - Frontend

## Princípios Centrais

### I. TypeScript Estrito e Zero "any"
- O frontend DEVE ser construído com TypeScript configurado em modo estrito (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`).
- É TERMINANTEMENTE PROIBIDO o uso de `any` explícito ou implícito em qualquer módulo, componente, hook ou chamada de API.
- Tipagens dinâmicas externas DEVEM ser tratadas como `unknown` e submetidas a *narrowing* via Zod ou *type guards*.

### II. Clean Code, Componentização e Respeito ao Contexto Existente
- **Baseline do Projeto**: A IA e os desenvolvedores DEVEM obrigatoriamente inspecionar e respeitar o esqueleto pré-existente e as versões já instaladas no `package.json`. É proibido impor versões conflitantes ou reescrever a base do projeto. Novas dependências devem ser adicionadas apenas se essenciais e totalmente compatíveis.
- **Single Responsibility Principle (SRP)**: Componentes visuais DEVEM se preocupar estritamente com renderização e acessibilidade. Lógica de negócios, chamadas de API e manipulação de estado complexo DEVEM residir isoladas em **Custom Hooks**.
- **KISS (Keep It Simple, Stupid) & DRY (Don't Repeat Yourself)**: Evitar abstrações prematuras e acoplamento desnecessário. Criar componentes utilitários apenas quando houver duplicidade real de interface.
- **Nomenclatura Significativa**: Variáveis, funções e componentes DEVEM ter nomes descritivos e autoexplicativos em inglês técnico padrão (ex: `useFinancialAnalysis`, `TransactionEditModal`, `CategoryDonutChart`).
- **Funções Pequenas e Puras**: Funções utilitárias e formatadores de moeda/data DEVEM ser puras, determinísticas e testáveis unitariamente.

### III. Gestão de Estado de IA e UX Resiliente BYOK (Bring Your Own Key)
- O status `hasAiKey` do usuário autenticado é um estado de primeira classe da interface:
  - Se `hasAiKey: false`: recursos dependentes de IA (Categorização por IA, Diagnóstico do Mês e Chat SSE) DEVEM exibir estado amigável com botão de ativação de chave.
  - O modal de cadastro de chave DEVE fornecer link direto para o Google AI Studio e reportar o resultado do teste ativo de conexão (`ACTIVE_VERIFIED` ou `ACTIVE_PROVISIONAL_DEMAND`).
- A interface DEVE tratar graciosamente erros `403` (chave ausente), `429` (limite de taxa) e `503` (alta demanda upstream temporária no Google AI Studio), orientando o usuário sem travamento da aplicação.

### IV. Consumo de Streaming em Tempo Real (Server-Sent Events)
- O assistente financeiro DEVE consumir o endpoint SSE (`POST /api/chat/stream`) utilizando a API nativa `ReadableStream` (`fetch`) com decodificador UTF-8 progressivo.
- O efeito de digitação e renderização progressiva DEVE atualizar a tela sem provocar re-renderizações desnecessárias na lista de mensagens anteriores.
- O usuário DEVE poder interromper a resposta via botão "Parar geração" (`AbortController`).

### V. Camada de Dados Reativa com Cache Inteligente (TanStack Query)
- Todas as operações de leitura (`GET`) DEVEM utilizar TanStack Query com políticas de cache explícitas (`staleTime`, `gcTime`).
- Mutações (`POST`, `PATCH`, `PUT`) DEVEM disparar invalidação direcionada das chaves de query afetadas (`invalidateQueries`), mantendo o dashboard sincronizado sem recarregamento de página.

### VI. Segurança no Cliente e Privacidade por Design
- Tokens JWT DEVEM ser armazenados de forma centralizada e anexados automaticamente nas requisições protegidas (`Authorization: Bearer <token>`).
- É PROIBIDO registrar dados pessoais identificáveis (PII), senhas, tokens ou chaves em chamadas de `console.log`.
- O upload de extratos (.ofx e .csv) DEVE validar client-side a extensão do arquivo e o tamanho máximo permitido (10MB) antes do envio.

## Governance
- Toda nova tela, componente ou feature desenvolvida no frontend DEVE ser avaliada e aprovada contra os princípios desta Constituição.
```

---

## 4. Contratos de API e Tipos TypeScript

Arquivo sugerido para o frontend: `src/types/api.ts`

```typescript
// ==========================================
// CATEGORIAS CANÔNICAS (9 Categorias Oficiais)
// ==========================================
export const CANONICAL_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Lazer',
  'Educação',
  'Receita',
  'Outros',
  'Não Categorizado',
] as const;

export type Category = typeof CANONICAL_CATEGORIES[number];

export const TRANSACTION_SOURCES = ['OFX', 'CSV', 'SEED'] as const;
export type TransactionSource = typeof TRANSACTION_SOURCES[number];

// ==========================================
// AUTENTICAÇÃO E USUÁRIO
// ==========================================
export interface User {
  id: string;
  email: string;
  hasAiKey: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SetApiKeyResponse {
  success: boolean;
  message: string;
  status?: 'ACTIVE_VERIFIED' | 'ACTIVE_PROVISIONAL_DEMAND';
}

// ==========================================
// TRANSAÇÕES
// ==========================================
export interface Transaction {
  id: string;
  externalId: string;
  rawDescription: string;
  cleanDescription: string;
  amount: number; // Positivo = Receita, Negativo = Despesa
  date: string;   // ISO 8601 UTC
  category: Category;
  source: TransactionSource;
}

export interface UploadTransactionsResponse {
  totalExtracted: number;
  imported: number;
  duplicatesIgnored: number;
}

export interface UpdateTransactionDTO {
  category?: Category;
  cleanDescription?: string;
}

export interface CategorizeResponse {
  uniqueMerchantsAnalyzed: number;
  transactionsUpdated: number;
}

// ==========================================
// ANÁLISE FINANCEIRA & DASHBOARD
// ==========================================
export interface CategoryMetric {
  category: string;
  amount: number;
  percentage: number;
}

export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number; // Em percentual (ex: 35.5%)
  topCategories: CategoryMetric[];
}

export interface FinancialAnalysis {
  cached: boolean;
  month: string;       // Formato 'YYYY-MM'
  diagnosis: string;   // Parecer analítico em markdown
  recommendations: string[];
  metrics: FinancialMetrics;
  generatedAt: string;
  expiresAt: string;
}

// ==========================================
// CHATBOT ASSISTENTE (SSE)
// ==========================================
export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  content: string;
  timestamp?: string;
}

export interface ChatStreamChunk {
  text?: string;
  done?: boolean;
  sessionId?: string;
  error?: string;
  code?: string;
  statusCode?: number;
}
```

---

## 5. Sequência de Comandos Spec-Kit para Execução

Execute cada um dos comandos abaixo, um por vez, na raiz do repositório frontend. Cada comando segue o ciclo completo: **Specify → Plan → Tasks → Implement → Converge**.

---

### 🔹 Feature 1: Autenticação, Shell Base e Gestão BYOK da Chave de IA

**Comando de Especificação:**
```bash
/speckit-specify Criar fluxo de autenticação com login e cadastro (JWT), layout responsivo base com barra de navegação e tema dark/light, e modal/página para cadastro e teste ativo da chave de API do Google AI Studio (BYOK) via PUT /api/user/ai-key com indicação visual de status da IA.
```

**O que esta feature entrega:**
- Telas de `/login` e `/register` com validação de e-mail e senha mínima de 8 caracteres via React Hook Form + Zod.
- Armazenamento e interceptação do Token JWT nas requisições HTTP (`Authorization: Bearer <token>`).
- Layout Shell do Dashboard (Sidebar / Navbar) exibindo o e-mail do usuário e um Badge de Status da Chave de IA (Verde = Ativa, Amarelo = Demanda Alta, Cinza/Vermelho = Não configurada).
- Modal "Configurar Chave do Gemini" com validação do formato, link para o Google AI Studio e feedback do ping ativo.

---

### 🔹 Feature 2: Ingestão de Extratos, Listagem e Edição de Transações

**Comando de Especificação:**
```bash
/speckit-specify Criar tela de gestão de transações com upload drag-and-drop de extratos OFX e CSV para POST /api/transactions/upload, listagem filtrada por mês (YYYY-MM), categoria canônica e origem, edição manual de transações via PATCH /api/transactions/:id, e botão de categorização automática em lote via POST /api/transactions/categorize.
```

**O que esta feature entrega:**
- Área de Upload Drag & Drop aceitando arquivos `.ofx` e `.csv` com feedback de progresso e relatório de importação (`totalExtracted`, `imported`, `duplicatesIgnored`).
- Tabela moderna de transações com:
  - Formatação monetária em BRL (verde para receitas positivas, vermelho para despesas negativas).
  - Badges coloridos para cada uma das 9 categorias canônicas (destacando "Não Categorizado" com cor de alerta).
  - Filtro dinâmico por mês (`YYYY-MM`), categoria e canal de ingestão (`OFX`, `CSV`, `SEED`).
- Modal ou edição inline via `PATCH /api/transactions/:id` permitindo alterar a categoria canônica e o nome amigável do lançamento com feedback imediato.
- Botão "Classificar com IA" que aciona `POST /api/transactions/categorize` com loading state e atualização reativa da lista.

---

### 🔹 Feature 3: Dashboard Financeiro, Métricas e Gráficos Analíticos com IA

**Comando de Especificação:**
```bash
/speckit-specify Criar dashboard analítico financeiro consumindo GET /api/analysis/:month, com cards de resumo (Receitas, Despesas, Saldo Líquido e Taxa de Poupança), gráfico de rosca de distribuição por categorias, gráfico de evolução temporal, diagnóstico textual gerado por IA, lista de recomendações e botão de recálculo com forceRefresh=true.
```

**O que esta feature entrega:**
- Seletor de competência mensal (`YYYY-MM`) no topo do dashboard com navegação mês anterior / próximo mês.
- 4 Cards de Métricas Principais (KPIs):
  - **Receitas Totais**: valor e indicador positivo.
  - **Despesas Totais**: valor e indicador de saída.
  - **Saldo Líquido do Mês**: saldo calculado com destaque visual.
  - **Taxa de Poupança**: percentual economizado com barra de progresso.
- Gráfico de Rosca (Donut Chart) com Recharts detalhando as maiores categorias de despesa e percentuais.
- Card de **Diagnóstico com IA**:
  - Badge indicativo de cache ("⚡ Cache ativo 24h" ou "✨ Análise recém-gerada").
  - Diagnóstico em prosa financeira formatado com markdown.
  - Lista de recomendações práticas priorizadas.
  - Botão de ação "Recalcular Diagnóstico" (`?forceRefresh=true`) com spinner.

---

### 🔹 Feature 4: Assistente Financeiro Virtual em Streaming (SSE)

**Comando de Especificação:**
```bash
/speckit-specify Criar painel conversacional de consultoria financeira virtual consumindo POST /api/chat/stream em tempo real via Server-Sent Events (SSE), com histórico de mensagens, efeito de digitação progressiva, sugestões de perguntas rápidas baseadas no orçamento do mês e botão de interrupção da resposta.
```

**O que esta feature entrega:**
- Drawer lateral ou tela dedicada `/chat` com layout moderno de mensageria.
- Consumo resiliente de SSE com leitor de stream nativo, exibindo a resposta do Gemini em tempo real sem travamento.
- Chips de perguntas rápidas sugeridas (ex: *"Como reduzir gastos em alimentação?"*, *"Qual foi meu maior gasto atípico?"*, *"Consigo investir R$ 500 este mês?"*).
- Persistência e sincronização de `sessionId` para continuidade da conversa.
- Tratamento de erros de cota e alta demanda temporária (HTTP 429 / 503) com botão de "Tentar novamente".

---

## 6. Estrutura de Diretórios Recomendada

```text
frontend/
├── src/
│   ├── assets/              # Logos, ilustrações SVG
│   ├── components/
│   │   ├── common/          # Button, Modal, Card, Input, Badge, Dropdown
│   │   ├── layout/          # Navbar, Sidebar, PageContainer, Shell
│   │   ├── dashboard/       # MetricCard, CategoryDonutChart, CashFlowChart
│   │   ├── transactions/    # TransactionTable, UploadModal, TransactionEditModal
│   │   ├── analysis/        # AiDiagnosisCard, RecommendationList, CacheBadge
│   │   └── chat/            # ChatDrawer, ChatMessageList, ChatInput, QuickChips
│   ├── hooks/               # Custom Hooks (useAuth, useTransactions, useAnalysis, useChatStream)
│   ├── services/            # Clientes HTTP (api.ts, auth.service.ts, transaction.service.ts)
│   ├── types/               # api.ts (interfaces canônicas idênticas ao backend)
│   ├── utils/               # formatters.ts (BRL currency, dates, percentages)
│   ├── pages/               # Login, Register, Dashboard, Transactions, Settings
│   ├── routes/              # AppRoutes, ProtectedRoute
│   ├── App.tsx
│   └── main.tsx
├── .env.example             # VITE_API_BASE_URL=http://localhost:3000
├── tailwind.config.js
└── tsconfig.json            # strict: true
```

---

## 7. Inicialização no Esqueleto Existente Passo a Passo

```bash
# 1. No terminal, navegue até a pasta do seu esqueleto frontend existente
cd caminho/para/seu-esqueleto-frontend

# 2. Instale as dependências já declaradas no package.json
npm install
# (ou 'pnpm install' / 'yarn', conforme o gerenciador configurado no esqueleto)

# 3. Inicialize o Spec-Kit no repositório do frontend
specify init

# 4. Configure a Constituição do Frontend
# Copie integralmente o texto da Seção 3 ("Constituição Técnica do Frontend")
# e cole dentro do arquivo: .specify/memory/constitution.md

# 5. Inicie a primeira feature!
# A IA inspecionará seu package.json, identificará seu bundler, roteador,
# sistema de estilos e adaptará o plano e os componentes perfeitamente ao que já existe.
/speckit-specify Criar fluxo de autenticação com login e cadastro (JWT), layout responsivo base com barra de navegação e tema dark/light, e modal/página para cadastro e teste ativo da chave de API do Google AI Studio (BYOK) via PUT /api/user/ai-key com indicação visual de status da IA.
```

