# 🧭 Guia Mestre de Construção do Frontend com Spec-Kit

> 📌 **Nota de Governança e Versão**: A versão viva e oficial da Constituição Técnica mantida pelo Spec Kit reside em [`.specify/memory/constitution.md`](.specify/memory/constitution.md) (versão 1.2.0, ratificada com 9 princípios fundamentais). O roadmap estratégico e o status de entrega de cada ciclo estão centralizados em [`ROADMAP.md`](ROADMAP.md).

Este documento contém todo o contexto arquitetural, regras de governança, contratos de API e a esteira de comandos pronta para criar o **Dashboard Financeiro Inteligente (Frontend)** utilizando o **Spec-Kit**, 100% alinhado às capacidades mais recentes do backend (incluindo Contas Bancárias, Exclusão de Transações, Contabilidade de Faturas e Perfil Financeiro com Calibragem de IA).

---

## 📑 Sumário

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Análise de Contexto e Stack Baseada no `package.json`](#2-análise-de-contexto-e-stack-baseada-no-packagejson)
3. [Constituição Técnica do Frontend (`constitution.md`)](#3-constituição-técnica-do-frontend-constitutionmd)
4. [Contratos de API e Tipos TypeScript](#4-contratos-de-api-e-tipos-typescript)
5. [Tabela Resumo dos Endpoints da API](#5-tabela-resumo-dos-endpoints-da-api)
6. [Sequência de Comandos Spec-Kit para Execução](#6-sequência-de-comandos-spec-kit-para-execução)
7. [Estrutura de Diretórios Recomendada](#7-estrutura-de-diretórios-recomendada)
8. [Inicialização no Esqueleto Existente Passo a Passo](#8-inicialização-no-esqueleto-existente-passo-a-passo)

---

## 1. Visão Geral do Produto

O Frontend é um **Dashboard de Inteligência Financeira Pessoal (PFM)** focado em:
- **Perfil Financeiro e Onboarding Contextual**: Cadastro voluntário do regime de trabalho (CLT, PJ/Autônomo, Servidor Público, etc.), renda mensal estimada, metas prioritárias (Reserva de Emergência, Quitar Dívidas, etc.) e tolerância a risco.
- **Gestão Multiconta e Cartões**: Cadastro e visualização de múltiplas contas (Corrente, Cartão de Crédito, Investimento, Dinheiro) com saldo consolidado, patrimônio líquido e vinculação de transações.
- **Gestão Ágil de Extratos e Transações**: Upload drag-and-drop de arquivos `.ofx` e `.csv`, visualização com 11 categorias canônicas, edição inline/modal (`PATCH`), exclusão atômica (`DELETE`) e categorização automática em lote por IA.
- **Diagnóstico com IA em Cache (24h) Calibrado**: Exibição estruturada do parecer financeiro gerado pelo Google Gemini com recomendações práticas, segregação de faturas de cartão (`invoiceSettlements`) e dimensionamento da reserva de emergência sob medida para o regime de renda do usuário (3-6 meses para CLT vs. 6-12 meses para PJ/Autônomo).
- **Consultor Financeiro em Tempo Real (SSE)**: Chat conversacional com streaming contínuo de conselhos personalizados, alimentado pelo resumo financeiro do mês e pelo perfil de vida do usuário.
- **Experiência BYOK Transparente**: Fluxo claro para cadastro e validação ativa da API Key gratuita do Google AI Studio do próprio usuário (custo zero no servidor).

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
- **Estilização & UI**: Respeitar o setup de estilização presente (Tailwind CSS, CSS Modules, Radix UI, Lucide Icons, Shadcn, etc.).
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
- Tipagens dinâmicas externas DEVEM ser tratadas como `unknown` e submetidas a narrowing via Zod ou type guards.

### II. Clean Code, Componentização e Respeito ao Contexto Existente
- Baseline do Projeto: A IA e os desenvolvedores DEVEM obrigatoriamente inspecionar e respeitar o esqueleto pré-existente e as versões já instaladas no package.json. É proibido impor versões conflitantes ou reescrever a base do projeto. Novas dependências devem ser adicionadas apenas se essenciais e totalmente compatíveis.
- Single Responsibility Principle (SRP): Componentes visuais DEVEM se preocupar estritamente com renderização e acessibilidade. Lógica de negócios, chamadas de API e manipulação de estado complexo DEVEM residir isoladas em Custom Hooks.
- KISS (Keep It Simple, Stupid) & DRY (Don't Repeat Yourself): Evitar abstrações prematuras e acoplamento desnecessário. Criar componentes utilitários apenas quando houver duplicidade real de interface.
- Nomenclatura Significativa: Variáveis, funções e componentes DEVEM ter nomes descritivos e autoexplicativos em inglês técnico padrão (ex: `useFinancialAnalysis`, `TransactionEditModal`, `CategoryDonutChart`, `AccountCard`).
- Funções Pequenas e Puras: Funções utilitárias e formatadores de moeda/data DEVEM ser puras, determinísticas e testáveis unitariamente.

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
- Mutações (`POST`, `PATCH`, `PUT`, `DELETE`) DEVEM disparar invalidação direcionada das chaves de query afetadas (`invalidateQueries`), mantendo o dashboard, a lista de transações, as contas e o cache de análise sincronizados sem recarregamento de página.

### VI. Perfil Financeiro Voluntário e Respeito à LGPD
- O preenchimento do perfil financeiro (regime de renda, renda declarada, metas e tolerância a risco) é 100% voluntário.
- A aplicação NUNCA DEVE bloquear fluxos para usuários que optarem por não preencher o perfil.
- Nenhuma informação bancária sensível (números reais de agência/conta, senhas) deve ser solicitada ou manipulada no cliente.

### VII. Segurança no Cliente e Privacidade por Design
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
// CATEGORIAS CANÔNICAS (11 Categorias Oficiais)
// ==========================================
export const CANONICAL_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Lazer',
  'Educação',
  'Investimentos',
  'Pagamento de Fatura',
  'Receita',
  'Outros',
  'Não Categorizado',
] as const;

export type Category = typeof CANONICAL_CATEGORIES[number];

// Cores e rótulos sugeridos para UI
export const CATEGORY_COLORS: Record<Category, string> = {
  'Alimentação': '#F59E0B',
  'Transporte': '#3B82F6',
  'Moradia': '#10B981',
  'Saúde': '#EF4444',
  'Lazer': '#8B5CF6',
  'Educação': '#EC4899',
  'Investimentos': '#06B6D4',
  'Pagamento de Fatura': '#64748B',
  'Receita': '#22C55E',
  'Outros': '#94A3B8',
  'Não Categorizado': '#F43F5E',
};

// ==========================================
// CONTAS BANCÁRIAS E CARTÕES
// ==========================================
export const ACCOUNT_TYPES = [
  'CHECKING',
  'CREDIT_CARD',
  'INVESTMENT',
  'CASH',
  'OTHER',
] as const;
export type AccountType = typeof ACCOUNT_TYPES[number];

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CHECKING: 'Conta Corrente',
  CREDIT_CARD: 'Cartão de Crédito',
  INVESTMENT: 'Investimentos',
  CASH: 'Dinheiro / Espécie',
  OTHER: 'Outro',
};

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  institution?: string;
  color?: string; // Hexadecimal, ex: "#3B82F6"
  balance: number; // Saldo consolidado calculado (initialBalance + somatório de transações)
  transactionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListAccountsResponse {
  accounts: Account[];
  totalAccounts: number;
  netWorth: number; // Patrimônio líquido (soma dos saldos de todas as contas)
}

export interface CreateAccountDTO {
  name: string;
  type: AccountType;
  initialBalance?: number;
  institution?: string;
  color?: string; // Formato "#RRGGBB"
}

export interface UpdateAccountDTO {
  name?: string;
  type?: AccountType;
  initialBalance?: number;
  institution?: string;
  color?: string;
}

// ==========================================
// PERFIL FINANCEIRO DO USUÁRIO (ONBOARDING)
// ==========================================
export const INCOME_TYPES = [
  'CLT',
  'PJ_AUTONOMO',
  'PUBLIC_SERVANT',
  'ENTREPRENEUR',
  'STUDENT',
  'RETIRED',
  'OTHER',
] as const;
export type IncomeType = typeof INCOME_TYPES[number];

export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  CLT: 'CLT (Carteira Assinada)',
  PJ_AUTONOMO: 'PJ / Autônomo / Freelancer',
  PUBLIC_SERVANT: 'Servidor Público',
  ENTREPRENEUR: 'Empresário / Sócio',
  STUDENT: 'Estudante / Estagiário',
  RETIRED: 'Aposentado / Pensionista',
  OTHER: 'Outro',
};

export const FINANCIAL_GOALS = [
  'RESERVA_EMERGENCIA',
  'QUITAR_DIVIDAS',
  'COMPRAR_IMOVEL',
  'INVESTIR_LONGO_PRAZO',
  'CONTROLE_GASTOS',
] as const;
export type FinancialGoal = typeof FINANCIAL_GOALS[number];

export const FINANCIAL_GOAL_LABELS: Record<FinancialGoal, string> = {
  RESERVA_EMERGENCIA: 'Criar / Expandir Reserva de Emergência',
  QUITAR_DIVIDAS: 'Quitar Dívidas e Empréstimos',
  COMPRAR_IMOVEL: 'Comprar Imóvel / Casa Própria',
  INVESTIR_LONGO_PRAZO: 'Investir para Longo Prazo / Independência',
  CONTROLE_GASTOS: 'Controlar Gastos Supérfluos e Orçamento',
};

export const RISK_PROFILES = [
  'CONSERVATIVE',
  'MODERATE',
  'AGGRESSIVE',
] as const;
export type RiskProfile = typeof RISK_PROFILES[number];

export const RISK_PROFILE_LABELS: Record<RiskProfile, string> = {
  CONSERVATIVE: 'Conservador (prioriza segurança e liquidez)',
  MODERATE: 'Moderado (equilíbrio entre segurança e rentabilidade)',
  AGGRESSIVE: 'Agressivo (foco em crescimento com tolerância à oscilação)',
};

export interface FinancialProfile {
  incomeType?: IncomeType;
  declaredMonthlyIncome?: number;
  goals?: FinancialGoal[];
  riskProfile?: RiskProfile;
  updatedAt?: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  hasAiKey: boolean;
  financialProfile?: FinancialProfile;
}

export interface UpdateFinancialProfileDTO {
  incomeType?: IncomeType;
  declaredMonthlyIncome?: number;
  goals?: FinancialGoal[];
  riskProfile?: RiskProfile;
}

// ==========================================
// AUTENTICAÇÃO E CHAVE BYOK
// ==========================================
export interface AuthUser {
  id: string;
  email: string;
  hasAiKey: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface SetApiKeyResponse {
  success: boolean;
  message: string;
  status?: 'ACTIVE_VERIFIED' | 'ACTIVE_PROVISIONAL_DEMAND';
}

// ==========================================
// TRANSAÇÕES
// ==========================================
export const TRANSACTION_SOURCES = ['OFX', 'CSV', 'SEED'] as const;
export type TransactionSource = typeof TRANSACTION_SOURCES[number];

export interface Transaction {
  id: string;
  accountId?: string;
  externalId: string;
  rawDescription: string;
  cleanDescription: string;
  amount: number; // Positivo = Receita, Negativo = Despesa
  date: string;   // ISO 8601 UTC
  category: Category;
  source: TransactionSource;
}

export interface ListTransactionsResponse {
  transactions: Transaction[];
}

export interface ListTransactionsFilter {
  month?: string;       // Formato 'YYYY-MM'
  category?: Category;
  source?: TransactionSource;
  accountId?: string;   // ObjectId de 24 caracteres
}

export interface UploadTransactionsResponse {
  totalExtracted: number;
  imported: number;
  duplicatesIgnored: number;
}

export interface UpdateTransactionDTO {
  category?: Category;
  cleanDescription?: string;
  accountId?: string;
}

export interface DeleteTransactionResponse {
  success: boolean;
  message: string;
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
  totalExpenses: number;        // Gastos operacionais primários (consumo real)
  invoiceSettlements: number;   // Quitação de faturas de cartão (não duplica em totalExpenses)
  netBalance: number;           // Saldo líquido = totalIncome - totalExpenses - invoiceSettlements
  savingsRate: number;          // Taxa de poupança em %
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

## 5. Tabela Resumo dos Endpoints da API

Todas as rotas (exceto `/health`, `/api/auth/register` e `/api/auth/login`) exigem o cabeçalho:
`Authorization: Bearer <TOKEN_JWT>`

| Método | Rota | Descrição | Principais Parâmetros / Body |
|---|---|---|---|
| `GET` | `/health` | Healthcheck da API e conexão MongoDB | - |
| `POST` | `/api/auth/register` | Cadastro de usuário | `{ email, password }` |
| `POST` | `/api/auth/login` | Login e emissão de JWT | `{ email, password }` |
| `PUT` | `/api/user/ai-key` | Cadastro e validação da chave Gemini | `{ apiKey }` |
| `GET` | `/api/user/profile` | Obter dados cadastrais e perfil financeiro | - |
| `PUT` | `/api/user/profile` | Atualizar perfil voluntário (invalida cache IA) | `{ incomeType?, declaredMonthlyIncome?, goals?, riskProfile? }` |
| `GET` | `/api/accounts` | Listar contas com saldo consolidado e patrimônio | - |
| `POST` | `/api/accounts` | Criar nova conta ou cartão | `{ name, type, initialBalance?, institution?, color? }` |
| `PATCH` | `/api/accounts/:id` | Editar conta | `{ name?, type?, initialBalance?, institution?, color? }` |
| `DELETE` | `/api/accounts/:id` | Excluir conta | Query: `?cascade=true\|false` |
| `POST` | `/api/transactions/upload` | Upload multipart de arquivo OFX ou CSV | `file`, Query: `?accountId=<id>` |
| `GET` | `/api/transactions` | Listar transações filtradas | Query: `?month=YYYY-MM&category=&source=&accountId=` |
| `PATCH` | `/api/transactions/:id` | Editar transação (invalida cache IA) | `{ category?, cleanDescription?, accountId? }` |
| `DELETE` | `/api/transactions/:id` | Excluir transação (invalida cache IA) | - |
| `POST` | `/api/transactions/categorize` | Categorização em lote via IA | - |
| `GET` | `/api/analysis/:month` | Diagnóstico e métricas mensais com IA | Query: `?forceRefresh=true\|false` |
| `POST` | `/api/chat/stream` | Streaming de consultoria via SSE | `{ message, sessionId? }` |

---

## 6. Sequência de Comandos Spec-Kit para Execução

Execute cada um dos comandos abaixo, um por vez, na raiz do repositório frontend. Cada comando segue o ciclo completo: **Specify → Plan → Tasks → Implement → Converge**.

---

### 🔹 Feature 1: Autenticação, Shell Base e Gestão BYOK da Chave de IA

**Comando de Especificação:**
```bash
/speckit-specify Criar fluxo de autenticação com login e cadastro (JWT), layout responsivo base com sidebar/navbar e tema dark/light, e modal/página para cadastro e teste ativo da chave de API do Google AI Studio (BYOK) via PUT /api/user/ai-key com indicação visual de status da IA.
```

**O que esta feature entrega:**
- Telas de `/login` e `/register` com validação de e-mail e senha mínima de 8 caracteres via React Hook Form + Zod.
- Armazenamento e interceptação do Token JWT nas requisições HTTP (`Authorization: Bearer <token>`).
- Layout Shell do Dashboard (Sidebar / Navbar) exibindo o e-mail do usuário e um Badge de Status da Chave de IA (Verde = Ativa, Amarelo = Demanda Alta, Cinza/Vermelho = Não configurada).
- Modal "Configurar Chave do Gemini" com link direto para o Google AI Studio, input com máscara e feedback do status retornado (`ACTIVE_VERIFIED` ou `ACTIVE_PROVISIONAL_DEMAND`).

---

### 🔹 Feature 2: Perfil Financeiro, Regime de Renda e Metas do Usuário (Onboarding & Configurações)

**Comando de Especificação:**
```bash
/speckit-specify Criar tela e modal de perfil financeiro voluntário consumindo GET /api/user/profile e PUT /api/user/profile, permitindo ao usuário configurar seu regime de renda (CLT, PJ_AUTONOMO, PUBLIC_SERVANT, etc.), renda mensal declarada, metas financeiras prioritárias (RESERVA_EMERGENCIA, QUITAR_DIVIDAS, etc.) e perfil de risco (CONSERVATIVE, MODERATE, AGGRESSIVE), com banner opcional de preenchimento e invalidação reativa de análises.
```

**O que esta feature entrega:**
- Tela ou seção em `/settings/profile` para gerenciamento do perfil financeiro.
- Banner discreto no Dashboard convidando o usuário a personalizar sua experiência caso o perfil ainda não tenha sido preenchido (com opção de dispensar).
- Seletor de Regime de Renda com cards visuais ou dropdown (`CLT`, `PJ/Autônomo`, `Servidor Público`, etc.).
- Input de Renda Mensal Declarada com máscara monetária BRL e validação de valores não-negativos.
- Seleção múltipla de Metas Financeiras (chips selecionáveis com ícones correspondentes).
- Seletor de Perfil de Risco (`Conservador`, `Moderado`, `Agressivo`).
- Feedback instantâneo de salvamento e invalidação automática dos caches de análise mensal.

---

### 🔹 Feature 3: Gestão de Contas Bancárias e Cartões de Crédito

**Comando de Especificação:**
```bash
/speckit-specify Criar módulo de gestão de contas e cartões consumindo GET /api/accounts, POST /api/accounts, PATCH /api/accounts/:id e DELETE /api/accounts/:id, exibindo cards de saldo por instituição/tipo, resumo de patrimônio líquido consolidado, modal de criação/edição com seletor de cor hexadecimal e confirmação de exclusão com suporte a cascade.
```

**O que esta feature entrega:**
- Seção ou página `/accounts` com grid de cards de contas e cartões de crédito.
- Card de topo com o **Patrimônio Líquido Total** (`netWorth`) somando os saldos consolidados de todas as contas.
- Badges visuais por tipo de conta (`Conta Corrente`, `Cartão de Crédito`, `Investimentos`, `Dinheiro`).
- Modal para Criar/Editar conta com: Nome, Tipo de Conta, Saldo Inicial, Instituição Financeira e Seletor de Cor (Hex).
- Modal de confirmação para exclusão de conta, alertando se houver transações vinculadas e permitindo exclusão segura (`?cascade=true`).

---

### 🔹 Feature 4: Ingestão de Extratos, Listagem, Edição e Exclusão de Transações

**Comando de Especificação:**
```bash
/speckit-specify Criar tela de gestão de transações com upload drag-and-drop de extratos OFX e CSV para POST /api/transactions/upload (com seleção opcional de conta), listagem filtrada por mês (YYYY-MM), categoria (11 canônicas), conta e origem, edição de categoria e descrição via PATCH /api/transactions/:id, exclusão via DELETE /api/transactions/:id, e botão de categorização em lote via POST /api/transactions/categorize.
```

**O que esta feature entrega:**
- Área de Upload Drag & Drop aceitando arquivos `.ofx` e `.csv`, com seletor opcional da Conta de destino (`accountId`), feedback de progresso e relatório de importação (`totalExtracted`, `imported`, `duplicatesIgnored`).
- Tabela moderna de transações com:
  - Formatação monetária em BRL (verde para receitas positivas, vermelho para despesas negativas).
  - Badges coloridos para as **11 categorias canônicas** (incluindo `Pagamento de Fatura` e `Investimentos`).
  - Badge identificador da Conta associada.
  - Filtro dinâmico multi-critério: competência (`YYYY-MM`), categoria, conta bancária e canal de ingestão (`OFX`, `CSV`, `SEED`).
- Modal de edição inline via `PATCH /api/transactions/:id` permitindo alterar categoria, nome limpo e conta vinculada.
- Ação de exclusão com modal de confirmação via `DELETE /api/transactions/:id`.
- Botão "Classificar com IA" que aciona `POST /api/transactions/categorize` com loading state e atualização reativa da lista.

---

### 🔹 Feature 5: Dashboard Financeiro, Métricas, Segregação de Faturas e Diagnóstico com IA

**Comando de Especificação:**
```bash
/speckit-specify Criar dashboard analítico financeiro consumindo GET /api/analysis/:month, com cards de resumo (Receitas, Despesas Primárias, Quitação de Faturas, Saldo Líquido e Taxa de Poupança), gráfico de rosca de distribuição por categorias, gráfico de barras temporal, diagnóstico com IA calibrado pelo regime de renda do usuário, lista de recomendações priorizadas e botão de recálculo com forceRefresh=true.
```

**O que esta feature entrega:**
- Seletor de competência mensal (`YYYY-MM`) no topo do dashboard com navegação mês anterior / próximo mês.
- 5 Cards de Métricas Principais (KPIs):
  - **Receitas Totais**: valor total de entradas no mês.
  - **Despesas Primárias (Consumo)**: valor real de consumo (alimentação, moradia, etc.).
  - **Quitação de Faturas**: valor segregado de liquidação de cartão (`invoiceSettlements`), evitando contagem duplicada.
  - **Saldo Líquido do Mês**: saldo final calculado com destaque visual.
  - **Taxa de Poupança**: percentual economizado com barra de progresso colorida.
- Gráfico de Rosca (Donut Chart) com Recharts detalhando as maiores categorias de despesa e percentuais.
- Card de **Diagnóstico com IA Calibrado**:
  - Badge indicativo de cache ("⚡ Cache ativo 24h" ou "✨ Análise recém-gerada").
  - Diagnóstico em prosa financeira formatado com markdown, mencionando a reserva de emergência recomendada sob medida para o regime do usuário (3-6 meses para CLT vs. 6-12 meses para PJ/Autônomo).
  - Lista de recomendações práticas priorizadas de acordo com as metas declaradas (ex: foco em desendividamento quando a meta for `QUITAR_DIVIDAS`).
  - Botão de ação "Recalcular Diagnóstico" (`?forceRefresh=true`) com spinner.

---

### 🔹 Feature 6: Assistente Financeiro Virtual em Streaming (SSE) com Contexto Pessoal

**Comando de Especificação:**
```bash
/speckit-specify Criar painel conversacional de consultoria financeira virtual consumindo POST /api/chat/stream em tempo real via Server-Sent Events (SSE), com histórico de mensagens, efeito de digitação progressiva, respostas contextualizadas no perfil financeiro e orçamento do mês do usuário, sugestões de perguntas rápidas e botão de interrupção da resposta.
```

**O que esta feature entrega:**
- Drawer lateral flutuante ou tela dedicada `/chat` com layout moderno de mensageria.
- Consumo resiliente de SSE com leitor de stream nativo, exibindo a resposta do Gemini em tempo real sem travar a interface.
- Respostas que levam em conta o regime de trabalho, renda declarada e metas do usuário (ex: alertar sobre reserva ao sugerir novos gastos para quem é PJ).
- Chips de perguntas rápidas sugeridas (ex: *"Como está minha meta de reserva de emergência?"*, *"Onde posso cortar gastos neste mês?"*, *"Consigo investir R$ 1.000 com meu saldo atual?"*).
- Persistência e sincronização de `sessionId` para continuidade da conversa.
- Tratamento de erros de cota e alta demanda temporária (HTTP 429 / 503) com botão amigável de "Tentar novamente".

---

## 7. Estrutura de Diretórios Recomendada

```text
frontend/
├── src/
│   ├── assets/              # Logos, ícones SVG
│   ├── components/
│   │   ├── common/          # Button, Modal, Card, Input, Badge, Dropdown, Skeleton
│   │   ├── layout/          # Navbar, Sidebar, PageContainer, Shell, AiKeyBadge
│   │   ├── profile/         # FinancialProfileForm, IncomeTypeSelector, GoalChips
│   │   ├── accounts/        # AccountCard, AccountList, CreateAccountModal
│   │   ├── dashboard/       # MetricCard, CategoryDonutChart, CashFlowChart, NetWorthCard
│   │   ├── transactions/    # TransactionTable, UploadModal, TransactionEditModal, DeleteModal
│   │   ├── analysis/        # AiDiagnosisCard, RecommendationList, CacheBadge, ReserveTargetAlert
│   │   └── chat/            # ChatDrawer, ChatMessageList, ChatInput, QuickChips
│   ├── hooks/               # Custom Hooks:
│   │                        # - useAuth
│   │                        # - useUserProfile
│   │                        # - useAccounts
│   │                        # - useTransactions
│   │                        # - useFinancialAnalysis
│   │                        # - useChatStream
│   ├── services/            # Clientes HTTP (api.ts, auth.service.ts, user.service.ts, account.service.ts, transaction.service.ts)
│   ├── types/               # api.ts (interfaces canônicas idênticas ao backend)
│   ├── utils/               # formatters.ts (BRL currency, dates, percentages)
│   ├── pages/               # Login, Register, Dashboard, Transactions, Accounts, Settings, Chat
│   ├── routes/              # AppRoutes, ProtectedRoute
│   ├── App.tsx
│   └── main.tsx
├── .env.example             # VITE_API_BASE_URL=http://localhost:3000
├── tailwind.config.js
└── tsconfig.json            # strict: true
```

---

## 8. Inicialização no Esqueleto Existente Passo a Passo

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
/speckit-specify Criar fluxo de autenticação com login e cadastro (JWT), layout responsivo base com sidebar/navbar e tema dark/light, e modal/página para cadastro e teste ativo da chave de API do Google AI Studio (BYOK) via PUT /api/user/ai-key com indicação visual de status da IA.
```
