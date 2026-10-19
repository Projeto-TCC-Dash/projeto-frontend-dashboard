# FinAI Dashboard — Frontend de Inteligência Financeira Pessoal

Frontend moderno desenvolvido em **Next.js 16 (App Router)** e **React 19** para gestão de finanças pessoais, ingestão de extratos bancários, métricas analíticas e consultor financeiro virtual via inteligência artificial em tempo real.

---

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 16.4 (App Router, Turbopack)
- **Linguagem**: TypeScript 5 (Modo Estrito, zero `any`)
- **Biblioteca de Interface**: React 19, Tailwind CSS v4, Lucide Icons, Shadcn UI / Base UI
- **Gerenciamento de Estado & Cache**: TanStack Query (`@tanstack/react-query` v5)
- **Comunicação em Tempo Real**: Streams SSE nativos com `ReadableStream` e decodificação progressiva UTF-8
- **Testes Automatizados**: Vitest + React Testing Library + `happy-dom` (145 testes)
- **Padronização**: ESLint + Prettier

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
- Node.js 20+ e `pnpm` instalados.
- Backend da API (`projeto-backend-dashboard-sdd`) em execução na porta `3000`.

### 2. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo para criar seu `.env.local`:
```bash
cp .env.example .env.local
```

O conteúdo padrão aponta para o backend Fastify:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

> **Nota**: O `next.config.ts` possui proxy automático (`rewrites`) de `/api/*` para o backend, facilitando o desenvolvimento sem bloqueios de CORS.

### 3. Instalar Dependências
```bash
pnpm install
```

### 4. Iniciar o Servidor de Desenvolvimento
```bash
pnpm dev
```
Acesse a aplicação no navegador em `http://localhost:3000` (ou `http://localhost:3001` caso a porta 3000 esteja em uso pelo backend).

---

## 🧪 Scripts de Qualidade e Testes

```bash
# Executar suíte completa de testes automatizados (145 testes)
pnpm test

# Verificação estática de tipos TypeScript
pnpm typecheck

# Executar linter de código
pnpm lint

# Formatação de arquivos com Prettier
pnpm format

# Build de produção otimizado
pnpm build
```

---

## 🧭 Mapeamento das Funcionalidades (Spec-Kit)

Todas as funcionalidades foram arquitetadas e construídas através do fluxo do **Spec-Kit**:

1. **Feature 1: Autenticação, Shell Base e Gestão BYOK** (`specs/001-auth-shell-byok`)
   - Login, cadastro, persistência de JWT, layout responsivo com Dark/Light mode e modal de ativação da chave Gemini no Google AI Studio.
2. **Feature 2: Ingestão de Extratos e Gestão de Transações** (`specs/002-transactions-management`)
   - Upload Drag-and-drop de `.ofx` e `.csv`, tabela de lançamentos com filtros e edição manual (`PATCH`), além de categorização em lote por IA.
3. **Feature 3: Dashboard Financeiro e Diagnóstico com IA** (`specs/003-dashboard-metrics-analysis`)
   - Seletor de mês, 4 cards de KPIs financeiros, gráfico de rosca de categorias e parecer consultivo de IA com cache inteligente de 24h.
4. **Feature 4: Consultor Financeiro Virtual com Streaming SSE** (`specs/004-virtual-financial-advisor`)
   - Chat lateral deslizante (Drawer) global e página cheia (`/chat`), efeito de digitação contínua, botão "Parar resposta", chips de atalho orçamentários e recuperação de sessão.
