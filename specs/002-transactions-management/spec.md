# Feature Specification: Gestão de Transações Financeiras com Upload de Extratos e Categorização Inteligente

**Feature Branch**: `002-transactions-management`

**Created**: 2026-10-19

**Status**: Implemented

**Input**: User description: "Criar tela de gestão de transações com upload drag-and-drop de extratos OFX e CSV para POST /api/transactions/upload, listagem filtrada por mês (YYYY-MM), categoria canônica e origem, edição manual de transações via PATCH /api/transactions/:id, e botão de categorização automática em lote via POST /api/transactions/categorize."

## Clarifications

### Session 2026-10-19

- Q: Ao acionar o botão de categorização automática por IA, qual deve ser o escopo de transações processadas? (FR-009) → A: Global: processa todas as transações com categoria "Não Categorizado" de toda a conta do usuário em lote único via POST /api/transactions/categorize, sincronizando e atualizando em seguida as transações visíveis no mês selecionado.
- Q: A área de upload drag-and-drop deve aceitar múltiplos arquivos simultâneos ou apenas um arquivo por operação? (FR-004) → A: Arquivo único: a zona de drop aceita um único arquivo por vez (.ofx ou .csv com até 10MB), processando atomicamente e exibindo imediatamente o feedback de importação e duplicidades descartadas.
- Q: Como deve ser a interação de interface para a edição manual da descrição e da categoria de uma transação? (FR-007) → A: Modal de edição (Dialog): abre uma janela modal acessível contendo o campo de descrição limpa editável, o seletor das 9 categorias canônicas e a exibição da descrição bruta original (`rawDescription`) como referência de auditoria.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualização e Filtragem Dinâmica de Transações (Priority: P1)

Como uma pessoa usuária da plataforma financeira, desejo visualizar todas as minhas movimentações financeiras de forma clara e organizada, com possibilidade de filtrar por mês de competência, categoria canônica e origem do extrato, para que eu possa auditar e acompanhar minhas receitas e despesas com agilidade.

**Why this priority**: É o núcleo da experiência de gestão financeira. O usuário precisa primeiro visualizar, auditar e filtrar seus dados existentes com transparência antes de importar novos arquivos ou aplicar inteligência artificial em lote.

**Independent Test**: Pode ser testado de forma autônoma acessando a tela de transações com dados pré-existentes, alterando o mês selecionado, aplicando filtros por categoria (ex: "Alimentação") e por origem (ex: "OFX"), verificando que a listagem reflete exatamente as transações correspondentes com paginação/rolagem e totais de visualização corretos.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa a página de gestão de transações, **When** a tela é carregada pela primeira vez, **Then** o sistema exibe as transações referentes ao mês corrente (`YYYY-MM`) com valores formatados (positivo/receita destacado em verde, negativo/despesa em vermelho/neutro), data, descrição amigável, badge de categoria canônica e identificador de origem.
2. **Given** a listagem de transações com filtros disponíveis, **When** o usuário altera o mês de competência no seletor, **Then** a lista atualiza seus registros para exibir apenas transações ocorridas no mês selecionado.
3. **Given** uma lista de transações com múltiplos registros, **When** o usuário filtra por uma categoria canônica específica (ex: "Transporte"), **Then** somente transações pertencentes a essa categoria são exibidas na listagem.
4. **Given** transações provenientes de diferentes fontes (`OFX`, `CSV`, `SEED`), **When** o usuário seleciona uma origem no filtro correspondente, **Then** a visualização restringe os resultados à origem escolhida.
5. **Given** que não há transações para a combinação de filtros selecionada, **When** a busca é concluída, **Then** a interface apresenta um estado vazio amigável orientando o usuário a limpar filtros ou importar extratos.

---

### User Story 2 - Importação de Extratos via Upload Drag-and-Drop (Priority: P2)

Como uma pessoa usuária, desejo arrastar e soltar (drag-and-drop) ou selecionar arquivos de extratos bancários nos formatos OFX ou CSV, para importar automaticamente novas transações para minha conta com validação prévia e feedback claro sobre importações e duplicidades.

**Why this priority**: Permite que os usuários tragam seus dados reais de contas correntes e cartões de crédito para a plataforma sem necessidade de digitação manual de cada movimentação.

**Independent Test**: Pode ser testado arrastando ou selecionando um arquivo de extrato válido (.ofx ou .csv), acompanhando o progresso do upload e confirmando a recepção da mensagem de resumo (total extraído, novas transações inseridas e duplicidades descartadas), com atualização imediata da listagem.

**Acceptance Scenarios**:

1. **Given** a área de upload de extratos, **When** o usuário arrasta um único arquivo válido (.ofx ou .csv com tamanho até 10MB) sobre a zona delimitada e o solta, **Then** a interface exibe feedback visual do arquivo capturado e inicia o envio imediatamente.
2. **Given** um arquivo com extensão não permitida (ex: .pdf ou .xlsx) ou que exceda o limite de 10MB, **When** o usuário tenta arrastar ou selecionar o arquivo, **Then** o sistema rejeita a operação no próprio cliente, exibindo alerta claro sobre o limite de formato ou tamanho permitido sem realizar chamada de rede indevida.
3. **Given** um upload de extrato processado com sucesso, **When** a resposta de importação é concluída, **Then** o sistema apresenta feedback quantitativo informando quantas transações foram extraídas, quantas foram inseridas como novas e quantas foram ignoradas por duplicidade.
4. **Given** a conclusão bem-sucedida da importação de um extrato, **When** o feedback é apresentado, **Then** a lista de transações do mês correspondente é atualizada automaticamente para refletir as novas transações importadas.

---

### User Story 3 - Edição Manual de Descrição e Categoria da Transação (Priority: P3)

Como uma pessoa usuária, desejo editar o texto descritivo amigável e alterar a categoria de uma transação individualmente através de uma janela modal, para corrigir classificações incorretas ou personalizar como as despesas são apresentadas no meu controle, tendo a descrição bancária original como referência.

**Why this priority**: Garante autonomia ao usuário para retificar ou complementar informações extraídas dos extratos, especialmente nomes truncados ou categorias genéricas.

**Independent Test**: Pode ser testado clicando no botão de edição de uma transação na listagem, verificando a abertura do modal acessível (Dialog) com a descrição original e os campos editáveis, alterando sua descrição amigável e selecionando uma nova categoria entre as 9 canônicas oficiais, salvando as alterações e confirmando que os novos dados persistem na tabela.

**Acceptance Scenarios**:

1. **Given** uma transação na listagem, **When** o usuário clica no botão de edição dessa transação, **Then** o sistema abre um modal de edição (Dialog) acessível pré-preenchido com a descrição amigável atual, o seletor da categoria vigente e a descrição original bancária (`rawDescription`) exibida de forma estática como referência de auditoria.
2. **Given** o modal de edição de transação aberto, **When** o usuário seleciona uma nova categoria da lista canônica oficial (Alimentação, Transporte, Moradia, Saúde, Lazer, Educação, Receita, Outros, Não Categorizado) e/ou ajusta a descrição e confirma o salvamento, **Then** o modal fecha, a alteração é persistida via backend e refletida de imediato na listagem sem perda de contexto ou rolagem indesejada.
3. **Given** o modal de edição de transação aberto, **When** o usuário tenta salvar uma descrição vazia, pressiona a tecla Esc ou cancela a operação, **Then** o sistema valida o campo obrigatório ou fecha o modal sem alterar a transação original.

---

### User Story 4 - Categorização Automática em Lote com Suporte BYOK (Priority: P4)

Como uma pessoa usuária, desejo acionar com um único clique a categorização automática inteligente das minhas transações não classificadas, para economizar tempo na organização financeira através de modelos avançados de IA.

**Why this priority**: É o valor diferenciado da plataforma com inteligência artificial, agrupando compras por estabelecimento comercial e atribuindo a categoria correta com rapidez.

**Independent Test**: Pode ser testado com uma conta com chave de IA ativa clicando no botão de categorização em lote e verificando o relatório de estabelecimentos analisados e transações atualizadas; alternativamente, testar com conta sem chave de IA ativa para validar a orientação amigável de configuração da chave.

**Acceptance Scenarios**:

1. **Given** que o usuário possui chave de IA configurada (`hasAiKey: true`) e existem transações na conta na categoria "Não Categorizado", **When** clica no botão "Categorizar com IA", **Then** o sistema exibe estado visual de processamento em lote, despacha a solicitação para processar globalmente todas as pendências da conta, apresenta mensagem informando a quantidade de estabelecimentos únicos analisados e transações atualizadas, e recarrega a listagem do mês ativo refletindo as novas classificações.
2. **Given** que o usuário não possui chave de IA configurada (`hasAiKey: false`), **When** visualiza a ação de categorização automática, **Then** a interface indica com clareza a necessidade da chave do Google AI Studio e permite abrir diretamente o modal de configuração de chave (BYOK) sem disparar requisições com falha previsível.
3. **Given** que ocorre uma oscilação temporária de alta demanda ou indisponibilidade no serviço de IA durante a categorização em lote, **When** o processamento falha, **Then** o sistema exibe notificação amigável instruindo o usuário a tentar novamente em instantes, mantendo os dados financeiros existentes intactos e seguros.

---

### Edge Cases

- O que acontece se o usuário arrastar múltiplos arquivos de uma vez para a zona de upload? A zona rejeita o lote com um aviso orientando a submeter um único extrato por vez.
- O que acontece se um arquivo OFX ou CSV estiver corrompido, vazio ou ilegível? O sistema deve interceptar a falha com mensagem orientando que a estrutura do arquivo está fora do padrão bancário legível, sem corromper transações anteriores.
- O que acontece quando o extrato importado contém apenas transações que já existem integralmente na base do usuário? O sistema deve concluir a importação com sucesso indicando que 0 transações foram importadas e 100% foram ignoradas por duplicidade, sem criar duplicatas.
- O que acontece se o usuário filtrar por um mês futuro ou passado remoto sem nenhuma movimentação? A listagem exibe visualização de lista vazia com indicação de que não há dados no período, permitindo retornar ao mês atual com um clique.
- O que acontece durante a categorização em lote se nenhuma transação precisar de reclassificação? O sistema informa amigavelmente que todas as movimentações da conta já se encontram categorizadas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer uma tela dedicada de Gestão de Transações acessível pelo menu de navegação da aplicação para usuários autenticados.
- **FR-002**: O sistema DEVE exibir uma listagem de transações com paginação ou carregamento ordenado decrescente por data contendo: data de realização, descrição amigável (e descrição original em detalhe/tooltip), valor monetário em Real (R$), categoria canônica atual e tag da origem (`OFX`, `CSV`, `SEED`).
- **FR-003**: O sistema DEVE permitir a filtragem da listagem de transações por mês de competência no formato `YYYY-MM` (com valor padrão inicial no mês corrente), por categoria canônica e por origem da transação.
- **FR-004**: O sistema DEVE disponibilizar uma área intuitiva de upload com suporte a arrastar-e-soltar (drag-and-drop) e seletor de arquivos de sistema para extratos bancários nos formatos `.ofx` e `.csv`, aceitando um único arquivo por operação.
- **FR-005**: O sistema DEVE validar previamente no cliente se o arquivo de extrato possui extensão permitida (`.ofx` ou `.csv`) e tamanho máximo de até 10MB antes de despachar para o servidor.
- **FR-006**: O sistema DEVE exibir o resultado detalhado pós-upload, informando quantidade de registros extraídos, total de transações importadas e total de duplicidades ignoradas.
- **FR-007**: O sistema DEVE permitir a edição manual pontual de qualquer transação via modal acessível (Dialog), possibilitando a alteração da sua descrição amigável e a redefinição da categoria canônica entre as 9 opções oficiais do sistema (`Alimentação`, `Transporte`, `Moradia`, `Saúde`, `Lazer`, `Educação`, `Receita`, `Outros`, `Não Categorizado`), exibindo a descrição original (`rawDescription`) como referência de auditoria.
- **FR-008**: O sistema DEVE sincronizar e revalidar imediatamente as consultas e somatórios de tela logo após a conclusão de qualquer importação de arquivo ou edição manual de transação.
- **FR-009**: O sistema DEVE disponibilizar uma ação de "Categorizar com IA" em lote que envia todas as movimentações com categoria "Não Categorizado" de toda a conta do usuário para análise inteligente e relata o total de estabelecimentos analisados e registros atualizados.
- **FR-010**: O sistema DEVE condicionar a experiência da ação de categorização em lote ao estado da chave de inteligência artificial (`hasAiKey`): exibindo atalho amigável para ativação da chave pessoal caso não configurada.
- **FR-011**: O sistema DEVE apresentar tratamento amigável com notificações (toasts ou avisos de contextualização) para situações de sucesso, erro de validação de arquivo, erro de conexão ou instabilidade de IA (status 403, 429, 503).

### Key Entities

- **Transação Financeira (Transaction)**: Registro individual de movimentação financeira contendo identificador único, identificador externo de conciliação bancária, descrição original (extraída do extrato), descrição limpa/amigável, valor monetário (positivo para receita, negativo para despesa), data da ocorrência (UTC), categoria canônica atribuída e origem do dado (`OFX`, `CSV` ou `SEED`).
- **Categoria Canônica (Category)**: Um dos 9 agrupamentos padrão do sistema: Alimentação, Transporte, Moradia, Saúde, Lazer, Educação, Receita, Outros, Não Categorizado.
- **Origem da Transação (TransactionSource)**: Proveniência da transação no sistema, identificada como arquivo bancário `OFX`, extrato em planilha `CSV` ou dados de demonstração/inicialização `SEED`.
- **Resultado de Importação (UploadSummary)**: Resumo informativo com quantidade total de transações extraídas do arquivo, novos itens gravados e itens descartados por duplicidade prévia.
- **Resultado de Categorização em Lote (CategorizationSummary)**: Resumo informativo da rotina de IA, detalhando quantidade de estabelecimentos únicos submetidos à análise semântica e número de transações efetivamente reclassificadas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário consegue filtrar e localizar uma transação específica por mês e categoria em menos de 5 segundos.
- **SC-002**: O upload e a validação do extrato informam o resumo de importação (novas transações e duplicidades) em menos de 3 segundos para extratos típicos de até 500 lançamentos.
- **SC-003**: A edição manual de descrição e categoria de uma transação atualiza a tela instantaneamente (em menos de 1 segundo) após a confirmação.
- **SC-004**: 100% das tentativas de upload de arquivos com extensões inválidas ou tamanho superior a 10MB são bloqueadas no cliente com mensagens compreensíveis antes de qualquer envio de rede.
- **SC-005**: Usuários sem chave de IA configurada conseguem compreender o motivo do bloqueio do recurso de categorização e acessar a configuração de chave em no máximo 1 clique.
- **SC-006**: A interface da listagem e da área de upload adapta-se a telas de computadores e smartphones sem rolagem horizontal ou sobreposição de controles.

## Assumptions

- O usuário já realizou login na aplicação e possui sessão ativa e autenticada para acessar as transações.
- Os endpoints de backend correspondentes (`POST /api/transactions/upload`, `GET /api/transactions`, `PATCH /api/transactions/:id`, `POST /api/transactions/categorize`) seguem os contratos canônicos já previstos na tipagem central da aplicação (`src/types/api.ts`).
- Os arquivos OFX e CSV submetidos possuem formatação bancária compatível com os parsers da API (identificadores de transação, data, valor e memorando).
- Para a categorização automática por inteligência artificial, o usuário deve ter configurado previamente sua chave de API pessoal do Google AI Studio (modelo BYOK).
- A listagem exibe por padrão as transações do mês calendário corrente do sistema, com controles visuais de avanço e retrocesso mensal.
