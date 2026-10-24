# Research & Architectural Decisions: Exclusão de Transações, 11 Categorias Canônicas e Associação de Contas

**Feature**: `specs/007-transactions-extended-deletion-categories`  
**Status**: Completed  
**Date**: 2026-10-23  

---

## 1. Contexto e Objetivos Técnicos

A Feature 007 é o elo de integração que conecta as transações bancárias às contas financeiras criadas na Feature 006, além de sincronizar o frontend com as capacidades contábeis entregues no backend (Features 007 e 008 do backend).

Os quatro pilares técnicos desta entrega são:
1. Expansão das 9 categorias originais para as **11 Categorias Canônicas Oficiais**.
2. **Exclusão atômica de transações** via `DELETE /api/transactions/:id` com confirmação segura (`AlertDialog`).
3. **Associação de extratos a contas bancárias** na área de upload (`POST /api/transactions/upload?accountId=...`).
4. **Filtro por conta e badges visuais** de instituição na listagem de lançamentos (`GET /api/transactions?accountId=...`).

---

## 2. Decisões Arquiteturais

### Decisão 1: Identidade Visual e Semântica das Novas Categorias Canônicas

* **Desafio**: Distinguir visualmente as novas categorias ("Pagamento de Fatura" e "Investimentos") das categorias de consumo já existentes (Alimentação, Transporte, Lazer, etc.), garantindo contraste e harmonia nos temas Claro e Escuro.
* **Solução**:
  - **`Pagamento de Fatura`**: Paleta **Slate / Cinza Azulado** (`#64748B`).
    - *Semântica*: Representa transferência contábil interna / liquidação de cartão de crédito. Não é uma despesa primária (os gastos reais já foram somados individualmente na fatura). O tom neutro e sofisticado reflete essa neutralidade contábil.
    - *Classes Tailwind*: `bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700`.
  - **`Investimentos`**: Paleta **Ciano / Azul Piscina** (`#06B6D4`).
    - *Semântica*: Representa aportes, aplicações financeiras e acumulação patrimonial. O tom ciano vibrante destaca ações de construção de riqueza sem se confundir com receitas operacionais (Verde).
    - *Classes Tailwind*: `bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700`.
* **Impacto**: O array `CANONICAL_CATEGORIES` em `src/types/api.ts` e as cores de badge em `components/transactions/transaction-table.tsx` são centralizados em um mapa de cores tipado e reutilizável.

---

### Decisão 2: Exclusão Atômica com Portal e Invalidação Reativa em Cadeia

* **Desafio**: A exclusão de uma transação é destrutiva e afeta simultaneamente três domínios do sistema:
  1. A própria listagem de transações (`['transactions']`).
  2. Os saldos acumulados das contas bancárias (`['accounts']`).
  3. Os cálculos de receitas, despesas, saldo líquido e diagnóstico de IA (`['analysis']`).
* **Solução**:
  - **Diálogo Seguro**: Criar `TransactionDeleteDialog` utilizando `createPortal(..., document.body)` para evitar bugs de sobreposição decorrentes de filtros CSS (`backdrop-blur`).
  - **Hook `useDeleteTransaction`**:
    ```typescript
    export function useDeleteTransaction() {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (id: string) => apiClient.delete(`/api/transactions/${id}`),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['accounts'] });
          queryClient.invalidateQueries({ queryKey: ['analysis'] });
        },
      });
    }
    ```
* **Impacto**: Zero descompasso de dados entre páginas. Se o usuário excluir uma despesa de R$ 500 vinculada ao Nubank, a tabela de transações, o card de saldo do Nubank em `/accounts` e o saldo líquido no `/dashboard` são atualizados no mesmo instante.

---

### Decisão 3: Associação Opcional de Conta no Upload de Extratos

* **Desafio**: Usuários podem importar extratos vinculados a um banco específico (ex: extrato do Banco do Brasil em `.ofx`) ou extratos gerais sem conta pré-cadastrada.
* **Solução**:
  - No componente `TransactionDropzone`, incluir um seletor suspenso "Vincular a uma conta" posicionado acima da zona de arrastar e soltar.
  - O seletor consome `useAccounts` e lista as contas cadastradas com seus nomes e instituições, além da opção inicial e padrão: `"Sem conta vinculada / Padrão"`.
  - Se o usuário selecionar uma conta, o hook `useUploadTransactions` envia a requisição como:
    `POST /api/transactions/upload?accountId=<id>`
  - Se o usuário mantiver a opção padrão, a requisição continua sendo enviada como `POST /api/transactions/upload` (sem quebras de compatibilidade retroativa).
* **Impacto**: Flexibilidade total tanto para quem adota a gestão multiconta quanto para quem prefere o modo rápido avulso.

---

### Decisão 4: Edição Manual com Vínculo e Transferência de Conta

* **Desafio**: Uma transação importada sem conta pode precisar ser associada a uma conta posteriormente, ou pode ter sido vinculada à conta errada.
* **Solução**:
  - Atualizar o `TransactionEditDialog` para incluir o campo "Conta Financeira" com as opções de contas ativas mais a opção "Nenhuma conta".
  - O payload de edição `PATCH /api/transactions/:id` passa a enviar:
    ```typescript
    {
      category?: Category;
      cleanDescription?: string;
      accountId?: string | null;
    }
    ```
* **Impacto**: Controle granular do usuário para corrigir qualquer metadado de lançamento.

---

### Decisão 5: Filtro por Conta e Apresentação Visual na Tabela

* **Desafio**: O usuário precisa auditar apenas os lançamentos de um cartão específico ou de uma conta específica sem perder a facilidade de ver o consolidado.
* **Solução**:
  - A barra de filtros `TransactionFilters` ganha um dropdown "Conta" ao lado de "Mês" e "Categoria".
  - O hook `useTransactions` passa a aceitar `{ month, category, source, accountId }`, gerando a chave de cache determinística:
    `['transactions', { month, category, source, accountId }]`
  - A tabela renderiza uma coluna "Conta" com badge visual contendo uma esfera com a cor configurada da conta (`account.color`) e o nome da instituição, facilitando a diferenciação visual.
* **Impacto**: Navegação ágil e visualmente agradável, conectando os módulos `/accounts` e `/transactions`.
