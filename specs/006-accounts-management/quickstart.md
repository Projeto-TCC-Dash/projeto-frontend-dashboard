# Quickstart & Verification Guide: Gestão Multiconta e Cartões de Crédito

**Feature**: `specs/006-accounts-management`  
**Date**: 2026-10-19  

Este guia detalha o roteiro de execução e validação ponta a ponta da Feature 006 para desenvolvedores e QA.

---

## 1. Pré-requisitos e Setup

```bash
# Garantir branch correta
git checkout feature/006-accounts-management

# Instalar dependências se necessário
npm install

# Executar suite completa de testes
npm test -- --run

# Validar compilação TypeScript estrita
npx tsc --noEmit
```

---

## 2. Cenários de Validação Funcional (Manual / E2E)

### Cenário 1: Visualizar Patrimônio Líquido e Seções Temáticas (US1)
1. Iniciar aplicação com `npm run dev` e acessar `http://localhost:3000`.
2. Realizar login com usuário de teste.
3. Clicar no menu lateral "Contas e Cartões" (`/accounts`).
4. **Verificação**:
   - Card de destaque exibe o **Patrimônio Líquido Total** consolidado com sinal e cor condizente com saldo positivo/negativo.
   - As contas cadastradas aparecem separadas nas seções verticais: `Contas Correntes`, `Cartões de Crédito`, `Investimentos`, `Dinheiro em Espécie` e `Outras Contas`.
   - Cada seção exibe o respectivo subtotal somado de suas contas.

### Cenário 2: Criar Nova Conta Bancária com Cor Customizada (US2)
1. Na página `/accounts`, clicar no botão "+ Nova Conta".
2. Preencher:
   - Nome: `Nubank Reserva`
   - Instituição: `Nubank`
   - Tipo de Conta: `Conta Corrente`
   - Saldo Inicial: `R$ 5.000,00`
   - Cor: selecionar o roxo violeta (`#8B5CF6`).
3. Clicar em "Salvar Conta".
4. **Verificação**:
   - A modal fecha e uma notificação toast de sucesso é exibida.
   - A conta `Nubank Reserva` surge imediatamente na seção `Contas Correntes`.
   - O Patrimônio Líquido Total é recalculado instantaneamente (+ R$ 5.000,00).

### Cenário 3: Editar Conta e Ajustar Saldo Inicial (US2)
1. No card da conta recém-criada, clicar no botão de menu/ações e selecionar "Editar".
2. Alterar o saldo inicial para `R$ 6.500,00` e a cor para `#2563EB`.
3. Clicar em "Salvar Alterações".
4. **Verificação**:
   - Os dados atualizados são exibidos na tela sem recarregamento da página.
   - O Patrimônio Líquido Total aumenta em R$ 1.500,00.

### Cenário 4: Excluir Conta com Diálogo Adaptativo e Cascata (US3)
1. Clicar em "Excluir" no card de uma conta com transações associadas.
2. Com o checkbox "Excluir também todas as transações associadas" desmarcado, clicar em "Confirmar Exclusão".
3. **Verificação**:
   - O diálogo **não fecha** e exibe um alerta de erro em vermelho informando sobre lançamentos vinculados.
   - O checkbox de exclusão em cascata é destacado visualmente.
4. Marcar o checkbox de exclusão em cascata e clicar em "Confirmar Exclusão".
5. **Verificação**:
   - A conta e seus lançamentos são excluídos com sucesso.
   - A conta desaparece da listagem e o patrimônio líquido é recalculado.

---

## 3. Comandos de Validação Automatizada

```bash
# Executar testes da Feature 006
npx vitest run lib/validations/account.test.ts hooks/use-accounts.test.tsx components/accounts

# Executar bateria de regressão
npm test -- --run
```
