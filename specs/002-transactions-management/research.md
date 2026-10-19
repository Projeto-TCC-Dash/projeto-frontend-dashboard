# Research: Gestão de Transações Financeiras com Upload e Categorização

**Feature Branch**: `002-transactions-management`  
**Date**: 2026-10-19  
**Status**: Completed  

Este documento consolida as pesquisas técnicas, decisões arquiteturais e padrões de implementação adotados para a tela de gestão de transações financeiras, cobrindo upload drag-and-drop, listagem filtrável, edição manual via Dialog e categorização inteligente em lote.

---

## 1. Upload Drag-and-Drop e Validação Client-Side

### Contexto
O usuário precisa enviar extratos bancários nos formatos `.ofx` e `.csv` de até 10MB via `POST /api/transactions/upload` utilizando arrastar-e-soltar ou seletor de arquivos, com validação de cliente antes de despachar a requisição (Princípio VI da Constituição).

### Decisão
Implementar uma zona de drop (`Dropzone`) com manipuladores nativos HTML5 (`onDragOver`, `onDragLeave`, `onDrop`) e input de arquivo oculto acionado por clique, sem adicionar bibliotecas pesadas de terceiros (respeitando o Princípio II - KISS/DRY).
- **Validação de Tamanho**: `file.size <= 10 * 1024 * 1024` (10MB).
- **Validação de Extensão**: Extração do sufixo do nome do arquivo (`file.name.toLowerCase().endsWith('.ofx') || file.name.toLowerCase().endsWith('.csv')`).
- **Restrição de Concorrência**: Suporte estrito a **um único arquivo por operação** (`multiple: false`), conforme definido na clarificação de requisitos.
- **Envio HTTP**: Montagem de `FormData` com campo `file` e chamada via `apiClient` com multipart preservado.

### Rationale
- O `api-client.ts` existente já possui suporte automático a `FormData`, pulando a adição do cabeçalho `Content-Type: application/json` quando o body for instância de `FormData`, permitindo que o navegador configure a fronteira multipart (`boundary`) nativamente.
- O uso de manipuladores nativos elimina dependências extras (ex: `react-dropzone`) que podem introduzir conflitos de versão com React 19.

### Alternativas Avaliadas
- **`react-dropzone`**: Descartado por adicionar dependência externa com risco de compatibilidade com React 19 / Next.js 16.
- **Upload concorrente de múltiplos arquivos**: Descartado na fase de clarificação para evitar relatórios parciais confusos e saturação de requisições.

---

## 2. Estratégia de Cache e Queries com TanStack Query

### Contexto
A listagem de transações depende de filtros dinâmicos por mês de competência (`YYYY-MM`), categoria canônica e origem (`OFX`, `CSV`, `SEED`). Operações de upload, edição e categorização modificam o estado de dados no servidor e exigem sincronização reativa imediata sem recarregar a página (Princípio V da Constituição).

### Decisão
Estruturar as query keys de forma hierárquica e granular:
- **Chave de Listagem**: `['transactions', { month, category, source }]`
- **Invalidation Strategy**:
  - `POST /api/transactions/upload`: Dispara `queryClient.invalidateQueries({ queryKey: ['transactions'] })`, sincronizando o mês corrente e outros meses afetados pelo extrato.
  - `PATCH /api/transactions/:id`: Dispara `queryClient.invalidateQueries({ queryKey: ['transactions'] })` ou atualização otimista/reativa do item na query ativa.
  - `POST /api/transactions/categorize`: Dispara `queryClient.invalidateQueries({ queryKey: ['transactions'] })` globalmente, já que a categorização afeta transações de toda a conta.
- **Configurações de Cache**:
  - `staleTime: 60 * 1000` (1 minuto de frescor para navegação rápida entre abas e filtros sem refetch desnecessário).
  - `gcTime: 5 * 60 * 1000` (5 minutos para coleta de lixo).

### Rationale
TanStack Query v5 lida nativamente com cancelamento de requisições obsoletas ao trocar rapidamente de filtros de mês ou categoria, mantendo a interface reativa e livre de condições de corrida (*race conditions*).

---

## 3. Navegação Mensal e Formatação de Moeda e Data

### Contexto
O usuário precisa navegar confortavelmente entre meses de competência (com padrão no mês atual `YYYY-MM`), e visualizar valores monetários em Real (R$) e datas no formato brasileiro (DD/MM/AAAA).

### Decisão
- **Funções Utilitárias Puras** em `lib/utils.ts` ou `lib/formatters.ts`:
  - `formatCurrencyBRL(amount: number): string`: Formata usando `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
  - `formatDateBR(dateIsoUtc: string): string`: Formata data ISO 8601 para `DD/MM/AAAA`.
  - `getCurrentYearMonth(): string`: Retorna o mês corrente no padrão `YYYY-MM`.
  - `shiftYearMonth(yearMonth: string, offsetMonths: number): string`: Auxiliar puro para avançar ou recuar meses.
- **Sincronização de Estado**:
  - O seletor de mês permite avançar/retroceder mês a mês via setas (`<` e `>`) ou escolher diretamente pelo controle `input type="month"` com fallback elegante.

### Rationale
Funções puras e isoladas atendem integralmente aos princípios de SRP e testabilidade unitária com Vitest (Princípio VII).

---

## 4. Edição Manual de Transação via Dialog Modal Acessível

### Contexto
O usuário pode alterar a descrição limpa e a categoria canônica de uma transação via `PATCH /api/transactions/:id`. A clarificação definiu o uso de Modal (Dialog) acessível, exibindo a descrição bancária original (`rawDescription`) estática para referência de auditoria.

### Decisão
- Utilizar o componente `Dialog` existente em `components/ui/dialog.tsx` (baseado em `@base-ui/react`), garantindo foco acessível, fechamento com a tecla `Escape` e bloqueio de rolagem do fundo.
- O formulário de edição valida:
  - `cleanDescription`: string obrigatória com no mínimo 1 caractere não vazio.
  - `category`: uma das 9 categorias canônicas definidas em `CANONICAL_CATEGORIES`.
- A descrição original `rawDescription` e o valor original são renderizados em painel de leitura/auditoria no topo do modal.

---

## 5. Integração com BYOK e Tratamento de Resiliência de IA

### Contexto
A categorização em lote via `POST /api/transactions/categorize` depende de um modelo de linguagem e da existência de uma chave de API do Google AI Studio configurada (`hasAiKey: true`) na conta do usuário (Princípio III da Constituição).

### Decisão
- Criar o hook `useCategorizeTransactions`, que consome o contexto de autenticação `useAuth()`.
- Se `user.hasAiKey === false`:
  - O botão "Categorizar com IA" exibe uma indicação visual ou, ao ser acionado, abre diretamente o modal de gerenciamento de chave BYOK (`AiKeyModal`), impedindo chamadas com erro 403 previsível.
- Tratamento de Resiliência HTTP:
  - `403`: Solicita cadastro de chave de IA.
  - `429`: Toast com alerta de taxa limite de requisições excedida no Google AI Studio.
  - `503`: Toast informativo de alta demanda temporária upstream com sugestão de nova tentativa em instantes.

---

## 6. Cobertura de Testes Automatizados (Vitest & RTL)

### Contexto
O Princípio VII da Constituição torna obrigatórios testes automatizados para novos formulários, hooks e utilitários, executáveis via `pnpm test`.

### Decisão
Criar baterias de testes com Vitest e Testing Library cobrindo:
1. `lib/validations/transaction.test.ts`: Validação de arquivos (extensões válidas, limites de 10MB) e schema de edição.
2. `lib/formatters.test.ts`: Funções de formatação de moeda, data e navegação de competência.
3. `hooks/use-transactions.test.tsx`: Hook de busca e filtragem com TanStack Query.
4. `hooks/use-upload-transactions.test.tsx`: Hook de upload com mock de sucesso e erro.
5. `components/transactions/transaction-edit-dialog.test.tsx`: Abertura do modal, preenchimento e submissão de PATCH.
