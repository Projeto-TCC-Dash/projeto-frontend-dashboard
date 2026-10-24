# Quickstart & Verification Guide: Exclusão de Transações, 11 Categorias Canônicas e Associação de Contas

**Feature**: `specs/007-transactions-extended-deletion-categories`  
**Status**: Completed  
**Date**: 2026-10-23  

---

## 🚀 Roteiro de Validação Rápida

### 1. Testes Automatizados (Vitest)

Execute a suíte de testes focada no módulo de transações e a bateria completa da aplicação:

```bash
# Executar testes da Feature 007
pnpm test hooks/use-delete-transaction.test.tsx components/transactions/transaction-table.test.tsx components/transactions/transaction-filters.test.tsx components/transactions/transaction-dropzone.test.tsx

# Executar suíte completa da aplicação
pnpm test
```

### 2. Verificação Estática de Tipagem e Linter

```bash
pnpm typecheck
pnpm lint
```

---

## 🧪 Roteiro de Homologação Manual (Ponta a Ponta)

### Cenário 1: 11 Categorias Canônicas
1. Navegue até `/transactions`.
2. Abra a barra de filtros de categorias e verifique que constam:
   - "Pagamento de Fatura" e "Investimentos", além das 9 anteriores.
3. Edite uma transação e altere a categoria para "Pagamento de Fatura".
4. Verifique que a linha na tabela recebe o badge Slate (`#64748B`).
5. Edite outra transação e selecione "Investimentos".
6. Verifique que a linha na tabela recebe o badge Ciano (`#06B6D4`).

### Cenário 2: Exclusão Segura com Diálogo de Confirmação
1. Na tabela de transações, localize um lançamento indesejado ou duplicado.
2. Clique no ícone de lixeira ("Excluir transação") na coluna de ações.
3. Observe a abertura do diálogo de confirmação modal (`AlertDialog`).
4. Verifique a exibição dos dados do lançamento (descrição limpa, data e valor formatado em BRL).
5. Clique em "Cancelar" e certifique-se de que a transação permanece na tabela.
6. Clique novamente na lixeira e confirme a exclusão.
7. Observe a remoção imediata da linha, notificação toast e recálculo reativo dos dados sem reload de tela.

### Cenário 3: Upload de Extrato Vinculado a uma Conta
1. Certifique-se de que possui ao menos uma conta cadastrada em `/accounts` (ex: "Nubank").
2. Na página `/transactions`, localize a área de upload (`TransactionDropzone`).
3. No seletor "Conta de Origem", selecione a conta "Nubank".
4. Arraste ou selecione um arquivo `.ofx` ou `.csv`.
5. Após o upload bem-sucedido, verifique que os lançamentos importados trazem o badge da conta "Nubank" na coluna "Conta" da tabela.

### Cenário 4: Filtro por Conta Bancária
1. Na barra de filtros de `/transactions`, selecione a conta "Nubank".
2. Verifique que a tabela exibe apenas as transações vinculadas a essa conta.
3. Alterne para "Todas as Contas" e confira a restauração da listagem global.
