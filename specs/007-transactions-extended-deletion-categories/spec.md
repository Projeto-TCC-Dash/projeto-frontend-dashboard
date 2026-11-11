# Feature Specification: Exclusão de Transações, 11 Categorias Canônicas e Associação de Contas

**Feature Branch**: `feature/007-transactions-extended-deletion-categories`

**Created**: 2026-10-23

**Status**: Implemented

**Input**: User description: "Estender módulo de transações adicionando suporte às 11 categorias canônicas (incluindo Pagamento de Fatura e Investimentos), ação de exclusão via DELETE /api/transactions/:id com diálogo de confirmação, seletor de conta no upload de extratos e filtro por conta na listagem."

## Clarifications

### Session 2026-10-23

- Q: No upload de extratos bancários (OFX/CSV), o vínculo a uma conta financeira cadastrada deve ser obrigatório ou facultativo? → A: Facultativo: a área de upload disponibiliza um seletor suspenso de contas listando as contas cadastradas do usuário mais a opção padrão "Sem conta / Padrão". Se selecionada uma conta, o parâmetro `accountId` é enviado na query do endpoint (`POST /api/transactions/upload?accountId=<id>`).
- Q: Ao excluir uma transação individual, como a interface deve tratar a confirmação e a sincronização dos dados? → A: Confirmação segura e reatividade total: a ação de excluir exibe um diálogo de confirmação (`AlertDialog` renderizado via `createPortal`) informando a descrição e valor do lançamento; ao confirmar, o sistema dispara `DELETE /api/transactions/:id`, exibe feedback de sucesso (toast) e invalida de forma atômica as consultas de transações (`['transactions']`), resumo de contas (`['accounts']`) e métricas do dashboard (`['analysis']`).
- Q: Como a conta bancária associada deve ser representada na tabela de transações e na edição manual? → A: Na tabela de transações, uma coluna/badge dedicada apresenta a cor e o nome da instituição/conta (ou traço neutro caso não vinculada). No modal de edição (`TransactionEditDialog`), além de categoria e descrição, o usuário pode reatribuir ou remover a conta bancária do lançamento.
- Q: Como as duas novas categorias canônicas devem ser identificadas visualmente no sistema? → A: A categoria "Pagamento de Fatura" utiliza a paleta Slate/Cinza Azulado (`#64748B`) para refletir sua natureza contábil de liquidação interna, enquanto a categoria "Investimentos" adota a paleta Ciano/Azul Piscina (`#06B6D4`) para destacar aportes e patrimônio.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Suporte Completo às 11 Categorias Canônicas Oficiais (Priority: P1) 🎯 MVP

Como uma pessoa usuária organizando meus lançamentos financeiros, desejo classificar e visualizar transações com as duas novas categorias oficiais ("Pagamento de Fatura" e "Investimentos"), além das 9 anteriores, para que eu possa distinguir quitações de cartão de crédito e aportes patrimoniais das minhas despesas rotineiras de consumo.

**Why this priority**: É a espinha dorsal de conformidade contábil da v1.1.0 e pré-requisito indispensável para que o backend e os relatórios de IA segreguem faturas e investimentos sem distorcer o cálculo de consumo real.

**Independent Test**: Pode ser testado de ponta a ponta acessando a tela de transações, abrindo o modal de edição de uma transação qualquer e verificando que a lista suspensa de categorias apresenta todas as 11 categorias canônicas (incluindo "Pagamento de Fatura" e "Investimentos"); ao salvar uma delas, o badge na tabela atualiza imediatamente com a cor semântica e o nome da nova categoria.

**Acceptance Scenarios**:

1. **Given** a tabela de transações na tela `/transactions`, **When** o usuário inspeciona uma transação categorizada como "Pagamento de Fatura", **Then** a interface renderiza um badge temático com coloração Slate/Cinza Azulado (`#64748B`) e rótulo "Pagamento de Fatura".
2. **Given** a tabela de transações na tela `/transactions`, **When** o usuário inspeciona uma transação categorizada como "Investimentos", **Then** a interface renderiza um badge temático com coloração Ciano (`#06B6D4`) e rótulo "Investimentos".
3. **Given** o modal de edição manual (`TransactionEditDialog`), **When** o usuário clica para alterar a categoria, **Then** a seleção contém todas as 11 categorias canônicas: "Alimentação", "Transporte", "Moradia", "Saúde", "Lazer", "Educação", "Receita", "Pagamento de Fatura", "Investimentos", "Outros" e "Não Categorizado".
4. **Given** a barra de filtros de transações (`TransactionFilters`), **When** o usuário abre o dropdown de categorias, **Then** as 11 categorias estão disponíveis para filtragem e selecionar "Pagamento de Fatura" ou "Investimentos" filtra reativamente apenas os lançamentos correspondentes.

---

### User Story 2 - Exclusão Pontual Atômica de Transações com Confirmação (Priority: P1) 🎯 MVP

Como uma pessoa usuária que importou um lançamento indevido ou transação duplicada, desejo poder excluir pontualmente uma transação individual com um diálogo de confirmação seguro, para manter meu histórico financeiro fidedigno sem risco de exclusões acidentais.

**Why this priority**: Erros em extratos bancários, duplicidades operacionais ou estornos manuais exigem capacidade de expurgo pontual. Sem exclusão, o usuário fica refém de dados incorretos acumulados.

**Independent Test**: Pode ser testado na tabela de transações clicando no botão de exclusão (ícone de lixeira) em uma linha de transação, confirmando a exibição do diálogo de confirmação com dados do lançamento, clicando em "Confirmar Exclusão" e verificando que a linha desaparece da listagem imediatamente com mensagem de confirmação.

**Acceptance Scenarios**:

1. **Given** uma linha de transação na `TransactionTable`, **When** o usuário observa a coluna de ações, **Then** um botão de ação com ícone de lixeira ("Excluir transação") está disponível ao lado do botão de editar.
2. **Given** o clique no botão de excluir transação, **When** a ação é disparada, **Then** um diálogo de confirmação modal (`AlertDialog` renderizado no `document.body` via `createPortal`) é exibido, destacando a descrição da transação, data e o valor monetário formatado em BRL, alertando que a ação é irreversível.
3. **Given** o diálogo de confirmação aberto, **When** o usuário clica em "Cancelar", **Then** o diálogo é fechado sem disparar nenhuma requisição de rede e a transação permanece inalterada na tabela.
4. **Given** o diálogo de confirmação aberto, **When** o usuário clica em "Excluir", **Then** o sistema dispara a mutação `DELETE /api/transactions/:id`, exibe indicador de carregamento no botão, fecha o diálogo em caso de sucesso, emite notificação toast de confirmação e atualiza reativamente a listagem, o resumo de contas e os indicadores do mês sem recarregar a página.
5. **Given** um erro transitório de rede ou rejeição pelo backend durante a exclusão, **When** a resposta de erro é recebida, **Then** o diálogo exibe feedback de erro claro e a transação permanece preservada.

---

### User Story 3 - Associação de Contas Financeiras no Upload e na Edição (Priority: P2)

Como uma pessoa usuária que possui múltiplas contas bancárias cadastradas na plataforma, desejo selecionar a qual conta pertence o extrato bancário no momento do upload (ou associar/trocar a conta de uma transação já existente), para que meus lançamentos fiquem organizados e rastreáveis por instituição bancária.

**Why this priority**: Conecta o módulo de transações diretamente ao ecossistema multiconta introduzido na Feature 006, viabilizando reconciliação bancária precisa.

**Independent Test**: Pode ser testado acessando o componente de upload de transações (`TransactionDropzone`), verificando a presença do seletor "Vincular a uma conta", selecionando uma conta existente (ex: "Nubank Principal"), realizando o upload de um arquivo `.ofx` ou `.csv` e confirmando que as transações resultantes exibem o identificador/badge da referida conta na tabela.

**Acceptance Scenarios**:

1. **Given** o componente de upload (`TransactionDropzone`), **When** o usuário visualiza a área de importação, **Then** há um campo seletor "Conta de Origem" que lista as contas ativas cadastradas pelo usuário (obtidas via `useAccounts`) e a opção padrão "Sem conta vinculada / Padrão".
2. **Given** um usuário que selecionou uma conta específica no seletor de upload, **When** ele envia um arquivo `.ofx` ou `.csv`, **Then** a requisição multipart é submetida anexando o identificador da conta na query string (`POST /api/transactions/upload?accountId=<id>`).
3. **Given** um usuário que manteve a opção "Sem conta vinculada / Padrão", **When** ele faz o upload, **Then** a requisição é submetida sem o parâmetro `accountId`, garantindo total compatibilidade retroativa.
4. **Given** uma transação existente exibida na tabela, **When** o usuário clica em "Editar", **Then** o modal `TransactionEditDialog` inclui um campo seletor de Conta Bancária permitindo vincular a transação a uma conta existente ou desvinculá-la, enviando `accountId` via `PATCH /api/transactions/:id`.

---

### User Story 4 - Filtro por Conta Bancária e Apresentação Visual Integrada (Priority: P3)

Como uma pessoa usuária auditando minhas despesas, desejo filtrar a listagem de transações por uma conta bancária específica e visualizar claramente em cada linha a qual conta ela pertence, para que eu possa auditar lançamentos conta por conta ou ter uma visão consolidada de todas as instituições.

**Why this priority**: Facilita a auditoria de extratos específicos e fornece rastreabilidade visual imediata para usuários que movimentam mais de um banco ou cartão de crédito.

**Independent Test**: Pode ser testado na barra de filtros de `/transactions`, selecionando uma conta bancária específica no dropdown de contas e validando que a tabela exibe somente transações vinculadas àquela conta; e em seguida alternando para "Todas as Contas" para restaurar a visão unificada.

**Acceptance Scenarios**:

1. **Given** a barra de filtros (`TransactionFilters`), **When** a tela de transações é carregada, **Then** há um seletor suspenso de Conta Bancária posicionado ao lado dos filtros de Mês e Categoria, com opção padrão "Todas as Contas".
2. **Given** o seletor de contas ativo, **When** o usuário seleciona uma conta específica (ex: "Itaú Corrente"), **Then** a tabela atualiza reativamente consumindo `GET /api/transactions?month=...&accountId=<id>`, exibindo exclusivamente lançamentos vinculados àquela conta.
3. **Given** a tabela de transações renderizada, **When** as linhas são exibidas, **Then** uma coluna "Conta" apresenta um badge elegante contendo o ponto de cor personalizado da conta e o nome da instituição/conta (ex: "Nubank"), ou um traço discreto caso a transação não possua conta vinculada.
4. **Given** um usuário que não possui nenhuma conta bancária cadastrada na plataforma, **When** a tela `/transactions` é aberta, **Then** os seletores de conta no upload e nos filtros exibem apenas a opção geral "Todas as Contas" ou ficam desabilitados com dica amigável convidando ao cadastro em `/accounts`.

---

### Edge Cases

- **Exclusão de transação vinculada a conta bancária**: Ao excluir uma transação que estava vinculada a uma conta com saldo computado, a mutação no backend já ajusta o saldo; o frontend deve obrigatoriamente invalidar as chaves de query `['accounts']` e `['transactions']` simultaneamente para manter os cards de `/accounts` sincronizados.
- **Upload de arquivo vazio ou inválido com conta selecionada**: A validação client-side existente de extensão (`.ofx`, `.csv`) e tamanho (até 10MB) continua operando normalmente; se o arquivo for rejeitado antes do envio, o estado da conta selecionada é preservado sem reset inesperado.
- **Transação associada a uma conta que foi excluída posteriormente**: Caso uma conta seja excluída sem cascata e as transações fiquem órfãs (ou com `accountId` nulo/desconhecido), a interface deve renderizar com segurança a indicação "Conta não vinculada" sem quebras de execução ou erros de chave nula.
- **Múltiplas transações com a mesma descrição mas contas distintas**: Os badges de conta em cada linha da tabela permitem distinguir imediatamente compras homônimas feitas em cartões ou contas diferentes (ex: "Uber" no Nubank vs "Uber" no Itaú).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE atualizar o tipo canônico `Category` e o array `CANONICAL_CATEGORIES` em `src/types/api.ts` para conter 11 categorias: `"Alimentação"`, `"Transporte"`, `"Moradia"`, `"Saúde"`, `"Lazer"`, `"Educação"`, `"Receita"`, `"Pagamento de Fatura"`, `"Investimentos"`, `"Outros"` e `"Não Categorizado"`.
- **FR-002**: O sistema DEVE atribuir identidades visuais consistentes às novas categorias canônicas nos badges e componentes:
  - `"Pagamento de Fatura"`: Paleta Slate / Cinza Azulado (`#64748B`, classes Tailwind slate-100/slate-800 com borda suave).
  - `"Investimentos"`: Paleta Ciano / Azul Piscina (`#06B6D4`, classes Tailwind cyan-100/cyan-800 com borda suave).
- **FR-003**: O esquema Zod de validação de transações (`lib/validations/transaction.ts`) DEVE ser expandido para validar as 11 categorias canônicas em todas as operações de criação e atualização.
- **FR-004**: O sistema DEVE disponibilizar uma ação de exclusão em cada linha da tabela de transações (`TransactionTable`), identificada visualmente por ícone de lixeira com variante semântica destrutiva/sutil.
- **FR-005**: Ao acionar a ação de exclusão, o sistema DEVE abrir um diálogo modal de confirmação (`AlertDialog`) implementado via `createPortal(..., document.body)` para evitar problemas de camada com elementos de desfoque (`backdrop-blur`).
- **FR-006**: O diálogo de confirmação de exclusão DEVE apresentar a descrição original da transação, a data do lançamento, o valor formatado em reais (BRL) e uma mensagem clara de advertência sobre a irreversibilidade da operação.
- **FR-007**: O sistema DEVE fornecer um custom hook `useDeleteTransaction` em `hooks/use-delete-transaction.ts` que executa a requisição `DELETE /api/transactions/:id` utilizando TanStack Query.
- **FR-008**: Em caso de sucesso na exclusão, o hook `useDeleteTransaction` DEVE invalidar reativamente as queries de transações (`['transactions']`), resumo de contas (`['accounts']`) e análises de dashboard (`['analysis']`), emitindo notificação de confirmação.
- **FR-009**: O modelo de dados de transação no frontend (`Transaction` em `src/types/api.ts`) DEVE ser expandido para incluir os campos opcionais `accountId?: string` e `account?: { id: string; name: string; color?: string; institution?: string }`.
- **FR-010**: O componente de upload (`TransactionDropzone`) DEVE incluir um seletor suspenso de contas alimentado pelo hook `useAccounts`, permitindo vincular opcionalmente o arquivo importado a uma conta (`accountId`).
- **FR-011**: O hook `useUploadTransactions` DEVE aceitar um parâmetro opcional `accountId?: string` e repassá-lo na query string (`POST /api/transactions/upload?accountId=<id>`) quando informado.
- **FR-012**: O modal de edição manual (`TransactionEditDialog`) DEVE incluir um campo seletor de Conta Bancária permitindo ao usuário alterar ou desvincular a conta da transação via `PATCH /api/transactions/:id`.
- **FR-013**: A barra de filtros (`TransactionFilters`) DEVE incorporar um seletor suspenso de Conta Bancária com valor inicial "Todas as contas", permitindo filtrar a listagem por uma conta específica.
- **FR-014**: O hook `useTransactions` DEVE suportar o parâmetro opcional `accountId?: string`, compondo a chave de cache `['transactions', { month, category, source, accountId }]` e enviando o parâmetro na requisição `GET /api/transactions`.
- **FR-015**: A tabela de transações (`TransactionTable`) DEVE renderizar uma coluna dedicada "Conta" com badge visual exibindo a cor da conta e o nome da instituição, ou indicador neutro quando não houver conta vinculada.
- **FR-016**: Toda a interface e mensagens de feedback DEVEM estar redigidas em português brasileiro claro, mantendo acessibilidade (ARIA labels e foco nos diálogos) e zero uso de `any` no TypeScript.

### Key Entities

- **Transaction**: Registro financeiro que possui identificador único, data, descrição bruta, descrição higienizada, valor monetário (positivo ou negativo), categoria canônica (entre as 11 oficiais), canal de origem (`OFX`, `CSV`, `SEED`) e vínculo opcional a uma conta bancária (`accountId`).
- **Account**: Conta financeira ou cartão cadastrado pelo usuário (possuindo nome, tipo, instituição financeira, saldo atual e cor de identificação hexadecimal), disponível para vincular transações.
- **CanonicalCategory**: Catálogo oficial e imutável de 11 categorias homologadas pela plataforma para classificação contábil e orçamentária.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário consegue excluir uma transação indesejada com confirmação visual em menos de 3 segundos, com atualização instantânea da tabela sem necessidade de recarregar a página (`F5`).
- **SC-002**: 100% das transações importadas com uma conta selecionada na área de upload refletem a associação com a conta correspondente na tabela de lançamentos.
- **SC-003**: Todas as 11 categorias canônicas são selecionáveis nos filtros e na edição manual, com renderização consistente dos badges em 100% das resoluções de tela.
- **SC-004**: A suíte de testes automatizados do frontend é expandida mantendo 100% de aprovação (zero quebras de regressão nos 209 testes existentes).
- **SC-005**: A verificação estática `pnpm typecheck` e o linter `pnpm lint` concluem com 0 erros e 0 warnings, preservando TypeScript estrito sem `any`.

## Assumptions

- O backend em execução no branch `develop` (`projeto-backend-dashboard`) já suporta o endpoint `DELETE /api/transactions/:id`, a query `accountId` no upload e na listagem, e as 11 categorias canônicas (entregues nas Features 007 e 008 do backend).
- O módulo de contas da Feature 006 do frontend já disponibiliza o hook `useAccounts` com retorno tipado de contas para alimentar os seletores.
- Usuários sem contas cadastradas podem continuar utilizando a plataforma normalmente em modo avulso (todas as operações de conta são estritamente opcionais).
