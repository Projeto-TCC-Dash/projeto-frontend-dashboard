# Feature Specification: Gestão Multiconta e Cartões de Crédito

**Feature Branch**: `feature/006-accounts-management`

**Created**: 2026-10-19

**Status**: Implemented

**Input**: User description: "Criar módulo de gestão de contas e cartões em /accounts consumindo GET /api/accounts, POST /api/accounts, PATCH /api/accounts/:id e DELETE /api/accounts/:id, exibindo cards de saldo por tipo, card de patrimônio líquido consolidado, modal de criação/edição com seletor de cor e diálogo de exclusão segura com suporte a cascade."

## Clarifications

### Session 2026-10-19

- Q: Como as contas devem ser estruturadas e organizadas visualmente na página `/accounts`? → A: Seções verticais temáticas separadas por tipo de conta (Contas Correntes, Cartões de Crédito, Investimentos, Dinheiro em Espécie, Outras), cada uma exibindo seus respectivos cards e o subtotal financeiro acumulado daquela categoria.
- Q: O campo de saldo inicial (`initialBalance`) deve poder ser alterado durante a edição de uma conta existente? → A: Sempre editável: o usuário pode alterar o saldo inicial tanto na criação quanto na edição da conta, recalculando o saldo atual com base no novo ponto de partida.
- Q: Como a interface deve se comportar quando o usuário tentar excluir uma conta com transações vinculadas sem marcar a opção de exclusão em cascata? → A: Diálogo adaptativo: o diálogo de confirmação permanece aberto, exibe um alerta de erro contextual explicando que há transações vinculadas e destaca visualmente o checkbox de cascata para que o usuário possa marcar e reconfirmar no mesmo fluxo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visão Consolidada do Patrimônio Líquido e Listagem de Contas (Priority: P1)

Como um usuário que possui contas e cartões em múltiplas instituições financeiras, quero acessar uma página dedicada (`/accounts`) para visualizar meu patrimônio líquido consolidado e o saldo de cada uma das minhas contas agrupadas por tipo, para ter clareza imediata sobre minha real situação patrimonial.

**Why this priority**: É a essência e o valor fundamental da gestão multiconta. Sem a visualização consolidada e a listagem estruturada das contas existentes, nenhuma operação de controle de saldo ou governança financeira é possível.

**Independent Test**: Pode ser testado acessando `/accounts` e verificando a renderização do card de Patrimônio Líquido Total com o valor somado de todas as contas, além dos cards individuais agrupados por categoria (`Conta Corrente`, `Cartão de Crédito`, `Investimentos`, `Dinheiro em Espécie`, `Outras Contas`) exibindo saldos, cores e instituições correspondentes.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado que possui 3 contas cadastradas com saldos variados (ex: Conta Corrente R$ 2.500,00, Investimento R$ 10.000,00 e Fatura de Cartão de Crédito -R$ 1.200,00), **When** o usuário acessa `/accounts`, **Then** o sistema exibe o card de destaque "Patrimônio Líquido Total" com o valor consolidado de R$ 11.300,00 e indicador visual de saldo positivo.
2. **Given** um usuário que ainda não possui nenhuma conta cadastrada, **When** ele acessa `/accounts`, **Then** o sistema exibe um estado vazio (*empty state*) com mensagem acolhedora informando a ausência de contas e um botão de ação destacado "Criar Primeira Conta".
3. **Given** a listagem de contas renderizada na tela, **When** o usuário visualiza cada card de conta, **Then** ele identifica claramente o nome da conta, a instituição financeira, a categoria da conta, a cor de destaque personalizada, o saldo formatado em reais (BRL) e os botões de ação para editar e excluir.

---

### User Story 2 - Cadastro e Edição de Contas com Personalização Visual (Priority: P2)

Como um usuário que abriu uma nova conta bancária ou deseja ajustar os dados de uma conta existente, quero poder cadastrar ou editar contas informando nome, instituição, tipo de conta, saldo inicial e cor de identificação, para manter meus registros organizados e facilmente reconhecíveis visualmente.

**Why this priority**: Permite ao usuário manter seus dados bancários fidedignos e personalizados ao longo do tempo, atribuindo cores distintas para cada banco ou finalidade.

**Independent Test**: Pode ser testado acionando o botão "Nova Conta", preenchendo o formulário com dados válidos (nome, instituição, tipo, saldo inicial e cor), salvando e verificando que a nova conta surge imediatamente na listagem com os dados informados; e em seguida clicando em "Editar" para alterar o nome ou cor e conferir a atualização refletida na tela.

**Acceptance Scenarios**:

1. **Given** a página de contas aberta, **When** o usuário clica em "Nova Conta", **Then** uma janela modal de cadastro é exibida contendo campos para nome da conta, instituição financeira, seletor de tipo de conta (`Conta Corrente`, `Cartão de Crédito`, `Investimentos`, `Dinheiro`, `Outro`), saldo inicial em reais e uma paleta de cores pré-definidas complementada por seletor de cor hexadecimal livre.
2. **Given** o formulário de cadastro preenchido com dados válidos, **When** o usuário confirma a criação, **Then** a modal é fechada, a nova conta é imediatamente incorporada à lista e ao cálculo do patrimônio líquido, e uma notificação de sucesso é apresentada.
3. **Given** um card de conta existente, **When** o usuário clica na ação "Editar", **Then** a janela modal é aberta pré-preenchida com os dados atuais da conta (nome, instituição, tipo, saldo inicial e cor de identificação), permitindo ajustes e salvamento imediato sem recarregamento de página.

---

### User Story 3 - Exclusão Segura de Contas com Política de Cascata (Priority: P3)

Como um usuário que deseja encerrar o controle de uma conta ou remover um registro incorreto, quero poder excluir uma conta de maneira segura com diálogo de confirmação claro, tendo a opção de manter ou remover em cascata as transações vinculadas, para evitar perdas acidentais de histórico financeiro.

**Why this priority**: A exclusão de contas envolve risco de integridade contábil sobre transações bancárias passadas. Uma política de exclusão segura protege o usuário contra perdas irreversíveis.

**Independent Test**: Pode ser testado clicando no botão "Excluir" de uma conta, validando a exibição do diálogo de confirmação com aviso sobre transações vinculadas, confirmando a exclusão com ou sem a opção de cascata selecionada, e conferindo a remoção da conta da listagem e o recálculo do patrimônio líquido.

**Acceptance Scenarios**:

1. **Given** um card de conta na listagem, **When** o usuário clica no botão "Excluir", **Then** o sistema exibe um diálogo de confirmação advertindo que a ação é destrutiva e apresentando uma opção de exclusão em cascata ("Excluir também todas as transações associadas a esta conta").
2. **Given** uma conta sem transações vinculadas, **When** o usuário confirma a exclusão com a opção de cascata desmarcada, **Then** a conta é excluída com sucesso, removida da tela e uma mensagem de confirmação é exibida.
3. **Given** uma conta que possui transações vinculadas, **When** o usuário tenta excluir com a opção de cascata desmarcada e a operação é rejeitada pelo backend, **Then** o diálogo de confirmação permanece aberto, exibe um alerta de erro contextual explicando que há transações vinculadas e destaca visualmente o checkbox de cascata para que o usuário possa marcar e reconfirmar no mesmo fluxo.
4. **Given** uma conta com transações vinculadas, **When** o usuário marca a opção de exclusão em cascata e confirma, **Then** a conta e todos os seus lançamentos vinculados são removidos e o patrimônio líquido é recalculado instantaneamente.

---

### User Story 4 - Navegação Integrada na Aplicação (Priority: P4)

Como um usuário navegando pelo sistema, quero ter acesso direto à página de Contas através da barra de navegação principal da aplicação, identificando visualmente quando estou nessa área.

**Why this priority**: Garante fluidez e ergonomia de uso, conectando a nova funcionalidade ao restante da suíte financeira (Dashboard, Transações, Perfil).

**Independent Test**: Pode ser testado clicando no item "Contas" no menu lateral e validando o redirecionamento para `/accounts`, com destaque visual no item de menu ativo tanto em desktop quanto em dispositivos móveis.

**Acceptance Scenarios**:

1. **Given** o menu lateral da aplicação, **When** o usuário observa as opções de navegação, **Then** o item "Contas" está visível com ícone representativo de instituição financeira/carteira.
2. **Given** qualquer tela do sistema, **When** o usuário clica no item "Contas", **Then** é redirecionado para a rota `/accounts` e o item correspondente no menu ganha destaque visual de rota ativa.

---

### Edge Cases

- **Saldo Consolidado Negativo**: Quando o somatório de saldos e faturas resulta em valor negativo, o card de Patrimônio Líquido Total deve exibir destaque com indicador visual negativo (ex: tonalidade avermelhada/coral) e sinal de menos antecedendo a moeda, mantendo formatação monetária clara.
- **Falha de Conectividade ou Erro de Servidor**: Em caso de erro na obtenção da lista de contas ou durante operações de criação/edição/exclusão, o sistema deve apresentar estado de erro com mensagem explicativa e botão para tentar novamente, sem travar a interface.
- **Formato Inválido de Cor Hexadecimal**: Se o usuário inserir manualmente um código de cor inválido, a interface deve validar o formato hexadecimal padrão (#RRGGBB) antes da submissão.
- **Valores Extremos de Saldo**: O sistema deve comportar formatação e exibição de saldos de zero até valores de dezenas de milhões de reais sem quebra visual de layout ou sobreposição de texto em telas menores.
- **Tentativa de Exclusão da Única Conta Ativa**: O sistema proíbe a remoção da única conta ativa restante do usuário; a interface intercepta a mensagem do backend e a exibe contextualmente no corpo do diálogo de exclusão sem fechar a janela.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer rota dedicada `/accounts` acessível por link fixo na barra lateral de navegação (Sidebar) e no menu de navegação móvel.
- **FR-002**: O sistema DEVE exibir em destaque o Patrimônio Líquido Total do usuário, calculado a partir da consolidação de todas as contas ativas cadastradas.
- **FR-003**: O sistema DEVE organizar a página `/accounts` em seções verticais temáticas dedicadas para cada um dos cinco tipos canônicos (`Conta Corrente`, `Cartão de Crédito`, `Investimentos`, `Dinheiro em Espécie` e `Outras Contas`), exibindo em cada seção os cards das contas correspondentes e o subtotal parcial acumulado daquela categoria.
- **FR-004**: Cada card de conta na listagem DEVE exibir: nome/apelido da conta, nome da instituição financeira, etiqueta ou ícone do tipo de conta, saldo atual formatado em BRL, indicador de cor personalizado e ações de edição e exclusão.
- **FR-005**: O sistema DEVE permitir a criação de novas contas através de janela modal, exigindo preenchimento de nome, seleção do tipo de conta e permitindo definir saldo inicial, instituição e cor de identificação visual.
- **FR-006**: O sistema DEVE oferecer paleta pré-definida de cores recomendadas para as contas, além de controle para escolha livre de cor hexadecimal.
- **FR-007**: O sistema DEVE permitir a edição de todos os dados de qualquer conta existente (nome, instituição, tipo de conta, saldo inicial e cor) através de modal pré-preenchida, recalculando dinamicamente o saldo correspondente.
- **FR-008**: O sistema DEVE fornecer diálogo de confirmação seguro antes de realizar a exclusão de qualquer conta, alertando explicitamente sobre o impacto irreversível da ação.
- **FR-009**: O diálogo de confirmação de exclusão DEVE conter controle opcional (checkbox) para exclusão em cascata de todas as transações associadas à conta a ser removida.
- **FR-010**: Se o usuário solicitar a exclusão de uma conta com lançamentos associados sem selecionar a opção de cascata, o sistema DEVE manter o diálogo de confirmação aberto, exibir mensagem de erro explicativa contextual e destacar visualmente o controle de cascata para possibilitar reenvio imediato.
- **FR-011**: O sistema DEVE atualizar reativamente os dados em tela e recalcular o Patrimônio Líquido Total imediatamente após qualquer operação de criação, edição ou exclusão de conta, sem exigir recarregamento da página pelo navegador.
- **FR-012**: O sistema DEVE exibir estado vazio explicativo com chamada para ação ("Criar Primeira Conta") caso o usuário não possua contas cadastradas.

### Key Entities *(include if feature involves data)*

- **Conta Financeira (`Account`)**:
  - `id`: Identificador único da conta.
  - `name`: Nome ou apelido atribuído à conta pelo usuário (ex: "Nubank Principal", "Reserva Tesouro Selic").
  - `type`: Tipo canônico da conta (`CHECKING`, `CREDIT_CARD`, `INVESTMENT`, `CASH`, `OTHER`).
  - `balance`: Saldo atual calculado da conta em moeda corrente.
  - `initialBalance`: Saldo inicial definido no momento da criação da conta.
  - `institution`: Nome da instituição financeira correspondente (ex: "Itaú", "Nubank", "XP", "Carteira Física").
  - `color`: Código de cor em formato hexadecimal (#RRGGBB) utilizado para identificação visual rápida na interface.
  - `createdAt` / `updatedAt`: Carimbos de data e hora de registro e modificação.
- **Visão Consolidada de Contas (`AccountsOverview`)**:
  - `accounts`: Coleção das contas financeiras do usuário autenticado.
  - `netWorth`: Valor monetário consolidado representando o patrimônio líquido total do usuário (soma dos ativos menos passivos/faturas).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário consegue visualizar seu patrimônio líquido consolidado e a relação de todas as suas contas em menos de 1 segundo após acessar a página `/accounts`.
- **SC-002**: O usuário consegue cadastrar uma nova conta financeira em menos de 30 segundos utilizando o formulário guiado com paleta de cores.
- **SC-003**: 100% das operações de exclusão de contas exigem confirmação explícita em diálogo dedicado antes de serem despachadas, eliminando cliques destrutivos acidentais.
- **SC-004**: Após a criação, edição ou exclusão de uma conta, o patrimônio líquido total e a listagem de contas são atualizados visualmente na interface em menos de 1 segundo sem recarregamento da página.
- **SC-005**: Usuários sem nenhuma conta cadastrada conseguem acionar o fluxo de criação a partir do estado vazio da página com exatamente 1 clique.

## Assumptions

- O usuário já realizou autenticação na aplicação e dispõe de uma sessão de acesso válida.
- Os serviços de backend fornecem endpoints para consulta (`GET /api/accounts`), criação (`POST /api/accounts`), alteração (`PATCH /api/accounts/:id`) e exclusão (`DELETE /api/accounts/:id?cascade=true|false`).
- Todos os valores monetários informados e exibidos utilizam o padrão do Real Brasileiro (BRL - R$).
- Uma conta do tipo Cartão de Crédito (`CREDIT_CARD`) reflete seus débitos pendentes de forma a deduzir do patrimônio líquido consolidado quando o saldo for devedor.
- Nomes de instituições bancárias e apelidos de contas são tratados em português com tipografia acessível e alto contraste visual de acordo com as cores selecionadas.
