# Technical Research & Architecture Decisions: Gestão Multiconta e Cartões de Crédito

**Feature**: `specs/006-accounts-management`  
**Date**: 2026-10-19  

Este documento registra as pesquisas técnicas, decisões de arquitetura e justificativas de design adotadas para a implementação da Feature 006.

---

## 1. Organização Visual da Página `/accounts` (Seções Temáticas vs Grid Único)

### Decisão
Apresentar as contas organizadas em **seções verticais temáticas** dedicadas a cada um dos cinco tipos canônicos de conta (`Contas Correntes`, `Cartões de Crédito`, `Investimentos`, `Dinheiro em Espécie`, `Outras`), cada uma com:
- Título da categoria acompanhado de ícone canônico (`Landmark`, `CreditCard`, `TrendingUp`, `Banknote`, `Wallet`).
- Subtotal parcial acumulado formatado em BRL.
- Grid responsivo de cards das contas pertencentes àquela categoria (ou estado vazio sutil se não houver contas cadastradas naquele tipo).

### Racional
1. **Clareza Contábil Imediata**: Usuários com múltiplas contas precisam distinguir rapidamente sua liquidez imediata (saldo em conta corrente) de seu patrimônio de longo prazo (investimentos) e seus passivos/obrigações imediatas (faturas de cartão de crédito).
2. **Escaneabilidade sem Filtros Manuais**: Uma divisão temática elimina a necessidade de o usuário alternar abas ou aplicar filtros frequentes para entender sua situação financeira por classe de ativo/passivo.
3. **Harmonia com o Design System**: Combina perfeitamente com a paleta Tailwind v4 e os cards já utilizados no Dashboard.

### Alternativas Consideradas
- *Grid unificado com barra de filtros*: Exigiria cliques adicionais para analisar saldos de uma categoria específica e dificultaria a exibição de subtotais claros por classe de conta.
- *Abas de navegação (Tabs)*: Ocultaria as demais categorias, impedindo a visão holística do patrimônio em uma única rolagem.

---

## 2. Tipos Canônicos de Conta e Paleta de Cores Pré-definidas

### Decisão
Adotar os 5 tipos canônicos definidos pelo backend:
```typescript
export const ACCOUNT_TYPES = [
  'CHECKING',
  'CREDIT_CARD',
  'INVESTMENT',
  'CASH',
  'OTHER',
] as const;
```

Para a seleção visual de cor na criação e edição de contas, oferecer uma paleta curada de 8 cores pré-definidas (com alto contraste em temas claro e escuro), além de um seletor livre com validação de regex hexadecimal (`^#[0-9A-Fa-f]{6}$`):
- Azul Institucional: `#2563EB`
- Roxo / Nubank: `#8B5CF6`
- Laranja / Inter / Itaú: `#F97316`
- Verde / Safra / Dinheiro: `#10B981`
- Ciano / XP / Rico: `#06B6D4`
- Vermelho / Santander / Bradesco: `#EF4444`
- Amarelo / Ouro / BB: `#F59E0B`
- Grafite / Slate: `#64748B`

### Racional
1. Cores consistentes permitem que o usuário reconheça instantaneamente seus bancos nas listagens de transações e relatórios futuros sem precisar ler o nome da conta.
2. A validação estrita de formato hexadecimal de 6 dígitos assegura que códigos de cores inválidos nunca sejam enviados ao backend ou quebrem a renderização de estilos CSS dinâmicos.

---

## 3. Gestão e Edição do Saldo Inicial (`initialBalance`)

### Decisão
O campo `initialBalance` será preenchível na criação (`POST /api/accounts`) e **editável** na modal de alteração (`PATCH /api/accounts/:id`).
- Na criação, o valor padrão é `0` caso não preenchido.
- Na edição, o formulário é pré-carregado com o `initialBalance` atual. Ao submeter uma alteração, o backend recalcula dinamicamente o `balance` atual da conta considerando o novo saldo inicial somado ao balanço das transações vinculadas.

### Racional
1. Conforme a clarificação acordada com o usuário (Opção B da Sessão 2026-10-19), dar flexibilidade total ao usuário para ajustar o saldo de abertura corrige erros de digitação iniciais sem necessidade de deletar e recriar a conta.
2. O utilitário `parseBrlToNumber` e `formatCurrency` já testado em `lib/formatters.ts` é reaproveitado para proporcionar digitação progressiva e máscara uniforme em BRL.

---

## 4. Diálogo de Exclusão Adaptativo e Resiliência contra Erro de Cascata

### Decisão
Implementar o diálogo de exclusão (`AccountDeleteDialog`) com arquitetura adaptativa:
1. O diálogo renderiza via `createPortal(..., document.body)` para evitar problemas de camada z-index ou backdrop blur.
2. Apresenta o checkbox "Excluir também todas as transações associadas a esta conta" (`cascade=true`).
3. Se o usuário confirmar a exclusão com `cascade=false` e o backend retornar erro `400` ou `409` (indicando que a conta possui transações vinculadas e não pode ser excluída sem cascata):
   - O diálogo **não fecha**;
   - Uma mensagem de alerta amigável em vermelho é exibida dentro do próprio corpo do diálogo;
   - O checkbox de cascata é realçado visualmente;
   - O usuário pode marcar o checkbox e reconfirmar a exclusão sem precisar reabrir a modal.

### Racional
1. Evita a frustração do usuário ao receber um toast genérico de erro que fecha o diálogo e o obriga a clicar novamente em "Excluir" para refazer a operação.
2. Fornece transparência sobre o motivo do bloqueio contábil.

---

## 5. Estratégia de Cache e Invalidação Reativa com TanStack Query

### Decisão
Centralizar as consultas e mutações no hook `hooks/use-accounts.ts`:
- Chave de consulta principal: `['accounts']`
- `GET /api/accounts`: Retorna `{ accounts: Account[], netWorth: number }`.
- Mutações:
  - `useCreateAccount`: Dispara `POST /api/accounts`, invalida `['accounts']` e `['financial-analysis']`.
  - `useUpdateAccount`: Dispara `PATCH /api/accounts/:id`, invalida `['accounts']` e `['financial-analysis']`.
  - `useDeleteAccount`: Dispara `DELETE /api/accounts/:id?cascade=true|false`, invalida `['accounts']`, `['transactions']` e `['financial-analysis']`.

### Racional
1. Mantém total conformidade com o Princípio V da Constituição Técnica (TanStack Query Reativo).
2. Como a exclusão em cascata remove transações, invalidar `['transactions']` garante que a listagem de lançamentos reflita a remoção imediatamente quando o usuário navegar entre as páginas.
