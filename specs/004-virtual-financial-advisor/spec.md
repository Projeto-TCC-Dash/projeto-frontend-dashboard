# Feature Specification: Painel Conversacional de Consultoria Financeira Virtual com Streaming SSE em Tempo Real

**Feature Branch**: `004-virtual-financial-advisor`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "Criar painel conversacional de consultoria financeira virtual consumindo POST /api/chat/stream em tempo real via Server-Sent Events (SSE), com histórico de mensagens, efeito de digitação progressiva, sugestões de perguntas rápidas baseadas no orçamento do mês e botão de interrupção da resposta."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Diálogo Conversacional com Streaming em Tempo Real e Digitação Progressiva (Priority: P1)

Como uma pessoa usuária autenticada na plataforma, desejo interagir com um consultor financeiro virtual enviando perguntas em linguagem natural e visualizando as respostas sendo geradas progressivamente em tempo real, para que eu obtenha esclarecimentos rápidos, contextualizados e dinâmicos sobre minhas finanças sem tempos mortos de espera.

**Why this priority**: É o valor central da funcionalidade conversacional. A visualização contínua e fluida da resposta gerada token a token reduz a percepção de latência, provê sensação imediata de inteligência ativa e viabiliza a leitura instantânea das orientações financeiras.

**Independent Test**: Pode ser testado de forma autônoma acessando o painel de consultoria financeira, digitando uma dúvida financeira (ex: "Qual é a regra 50-30-20 e como ela se aplica ao meu perfil?") e confirmando o envio da mensagem, a aparição imediata da bolha do usuário e a renderização progressiva e legível da resposta do assistente via fluxo contínuo de caracteres/palavras com rolagem automática suave.

**Acceptance Scenarios**:

1. **Given** que o usuário autenticado acessa o painel de chat, **When** digita uma mensagem na caixa de entrada e clica em enviar (ou pressiona Enter sem Shift), **Then** a mensagem do usuário é imediatamente adicionada ao histórico da conversa, o campo de entrada é limpo e um indicador inicial de geração ("Pensando..." ou cursor pulsante) é exibido na área do assistente.
2. **Given** que o servidor inicia a transmissão de dados em fluxo contínuo (Server-Sent Events), **When** os fragmentos de texto chegam ao cliente, **Then** o conteúdo da resposta do assistente é atualizado progressivamente na tela com efeito visual de digitação fluida, sem piscar ou congelar a interface.
3. **Given** que a resposta está sendo gerada e ultrapassa a altura visível do painel, **When** novos fragmentos são anexados, **Then** a janela de mensagens realiza auto-scroll suave acompanhando o texto recém-gerado, a menos que o usuário tenha rolado manualmente para cima para reler mensagens anteriores.
4. **Given** que a resposta inclui formatação estruturada (Markdown com listas com marcadores, destaques em negrito, tabelas ou valores monetários), **When** a transmissão é concluída, **Then** o texto completo é renderizado com tipografia limpa, hierarquia visual nítida e formatação correta de elementos enriquecidos.
5. **Given** que a geração do fluxo é concluída com sucesso pelo servidor, **When** o sinal de término de stream é detectado, **Then** o estado do assistente retorna para ocioso/pronto, reabilitando a entrada de novas perguntas.

---

### User Story 2 - Controle de Interrupção de Geração e Resiliência de Conexão (Priority: P2)

Como uma pessoa usuária, desejo ter a capacidade de interromper voluntariamente a geração da resposta a qualquer momento por meio de um botão visível de parada, além de ser informada com clareza em caso de falhas de conexão ou limites de cota, para que eu mantenha total controle do consumo da IA e consiga reaver a conversa sem bloqueios.

**Why this priority**: Evita frustração do usuário quando a IA começa a elaborar respostas excessivamente longas ou fora do objetivo desejado, preserva o consumo de recursos/tokens e garante que problemas transitórios de rede ou de provedor sejam contornados de forma transparente.

**Independent Test**: Pode ser testado iniciando uma pergunta que gere resposta longa e clicando no botão "Parar resposta" enquanto o texto ainda está fluindo; a emissão deve cessar imediatamente, o trecho já recebido deve ser preservado e a barra de entrada liberada para nova consulta. Também pode ser validado simulando queda de conexão ou resposta 429/503 e verificando o alerta amigável com opção de reenvio.

**Acceptance Scenarios**:

1. **Given** que uma resposta do assistente está sendo gerada ativamente em fluxo contínuo, **When** o usuário clica no botão "Parar resposta" (ou ícone de interrupção), **Then** a recepção do fluxo é imediatamente cancelada no navegador, o conteúdo acumulado até aquele milissegundo é mantido no histórico, é exibida uma indicação sutil de resposta interrompida e a caixa de entrada volta ao estado disponível.
2. **Given** que o usuário está no painel conversacional, **When** uma transmissão de resposta está em andamento, **Then** o botão de envio é transformado no botão de parada ("Parar geração") e o campo de texto é desabilitado temporariamente contra envios concorrentes até o término ou cancelamento.
3. **Given** que ocorre uma instabilidade de conexão ou erro no serviço upstream (ex: erro 429 de taxa excedida ou 503 de alta demanda temporária no provedor de IA), **When** a conexão falha, **Then** a interface apresenta uma notificação contextual amigável explicando a situação (sem jargões técnicos) e disponibiliza um botão "Tentar novamente" para reexecutar a última solicitação.
4. **Given** que o usuário clica em "Tentar novamente" após uma falha de transmissão, **When** a ação é disparada, **Then** o sistema reenvia o último prompt do usuário limpando a mensagem de erro anterior e reiniciando a geração do fluxo.

---

### User Story 3 - Sugestões de Perguntas Rápidas (Chips de Ação) Baseadas no Orçamento do Mês (Priority: P3)

Como uma pessoa usuária, desejo visualizar sugestões dinâmicas de perguntas inteligentes e cartões de atalho (chips rápidos) contextuais ao meu orçamento do mês corrente, para que eu possa iniciar análises financeiras pertinentes com apenas um toque, sem precisar formular prompts complexos do zero.

**Why this priority**: Reduz a barreira de entrada da consultoria por inteligência artificial ("síndrome da página em branco"), ensinando o usuário a extrair o melhor valor analítico de seus dados financeiros (gastos atípicos, categorias dominantes, viabilidade de aportes e metas de economia).

**Independent Test**: Pode ser testado acessando o painel de chat com um mês selecionado contendo transações registradas; o sistema deve apresentar chips contextuais com perguntas formuladas a partir dos maiores ofensores de despesa e saldo do período. Ao clicar em qualquer chip, o texto deve ser automaticamente enviado como pergunta ao consultor.

**Acceptance Scenarios**:

1. **Given** que o painel de chat é aberto e o usuário possui dados financeiros no mês ativo, **When** a lista de mensagens está vazia ou no início da conversa, **Then** a interface exibe uma fileira ou grade de chips com sugestões rápidas pertinentes ao orçamento (ex: "Como reduzir despesas em [Maior Categoria]?", "Tive algum gasto atípico neste mês?", "Consigo guardar R$ 500 com o saldo atual?", "Qual categoria mais comprometeu minha renda?").
2. **Given** a exibição dos chips de sugestão rápida, **When** o usuário clica ou toca em um chip de pergunta, **Then** o texto correspondente é inserido no fluxo e enviado automaticamente como mensagem do usuário, iniciando a resposta transmitida pelo assistente.
3. **Given** que o usuário ainda não possui transações ou dados consolidados no mês selecionado, **When** os chips de sugestão são montados, **Then** o sistema exibe perguntas conceituais gerais de planejamento financeiro pessoal (ex: "Como organizar uma reserva de emergência?", "Qual a melhor estratégia para pagar dívidas caras?", "O que é taxa de poupança ideal?").
4. **Given** que uma resposta está sendo gerada ativamente, **When** os chips de sugestões são avaliados, **Then** eles permanecem desabilitados temporariamente para evitar envios acidentais em sobreposição.

---

### User Story 4 - Histórico de Mensagens, Continuidade de Sessão e Gate BYOK (Priority: P4)

Como uma pessoa usuária, desejo manter o histórico da conversa enquanto navego pela plataforma financeira, podendo alternar entre visualização em gaveta lateral (drawer) e página cheia, com respeito ao status da minha chave de IA (BYOK), para ter flexibilidade no uso do assistente sem perder o fio condutor da consultoria.

**Why this priority**: Conecta a ferramenta conversacional à experiência de uso contínua do dashboard financeiro, permitindo consultar dados de transações e relatórios mantendo a conversa ativa, além de assegurar que o usuário sem chave de inteligência artificial cadastrada seja conduzido pedagogicamente à configuração de sua chave no Google AI Studio.

**Independent Test**: Pode ser testado abrindo o chat como drawer a partir do dashboard, realizando trocas de mensagens, fechando e reabrindo o painel ou navegando entre páginas para verificar a retenção das mensagens da sessão atual. Em conta sem chave (`hasAiKey: false`), deve validar a exibição do bloqueio informativo com atalho para cadastro de chave.

**Acceptance Scenarios**:

1. **Given** um usuário com `hasAiKey: false`, **When** tenta abrir o painel de consultoria financeira, **Then** a interface exibe um estado ilustrado explicativo de chave não configurada, informando a necessidade de cadastrar a chave gratuita do Google AI Studio e fornecendo botão direto para abertura do modal de configuração de chave.
2. **Given** um usuário com `hasAiKey: true`, **When** envia perguntas e fecha a gaveta ou navega entre abas da aplicação, **Then** as mensagens trocadas na sessão atual permanecem salvas e são reapresentadas integralmente ao reabrir o painel.
3. **Given** uma conversa com histórico de mensagens existente, **When** o usuário clica na ação "Limpar conversa" / "Nova consulta", **Then** uma confirmação é solicitada e, após confirmada, o histórico da tela é zerado, um novo identificador de sessão é estabelecido e os chips de perguntas rápidas voltam a ser exibidos.
4. **Given** o painel conversacional, **When** o usuário estiver no desktop ou dispositivo móvel, **Then** a interface deve ser acessível como painel lateral deslizante (drawer) sem sobrepor elementos essenciais do dashboard e possuir botão de alternância para tela dedicada de mensagens quando desejado foco total.

---

### Edge Cases

- **Mensagem vazia ou apenas com espaços**: O botão de envio deve permanecer desabilitado enquanto o campo de entrada contiver apenas espaços em branco ou quebras de linha vazias.
- **Envio rápido duplicado**: Se o usuário pressionar Enter repetidas vezes em rápida sucessão, o sistema deve registrar e despachar exclusivamente a primeira mensagem, bloqueando disparos concorrentes.
- **Cancelamento precoce (antes do primeiro fragmento)**: Se o usuário clicar em "Parar resposta" antes que o primeiro chunk de texto chegue do servidor, a requisição é cancelada limpando o indicador de carregamento e exibindo mensagem neutra ("Geração cancelada antes da emissão").
- **Queda abrupta de conectividade no meio do stream**: Se o fluxo for cortado abruptamente pela rede, o sistema deve manter os caracteres recebidos e adicionar um aviso informativo discreto ("Conexão interrompida. O texto recebido foi preservado."), oferecendo ação para reenvio da pergunta.
- **Mensagem com código ou tabelas em Markdown incompleto**: Durante a digitação progressiva, blocos de código ou tabelas Markdown ainda abertos (sem fechamento de delimitadores) devem ser renderizados de forma segura sem quebrar o layout da página.
- **Token de autenticação expirado durante o chat**: Se a requisição do stream retornar erro de autorização (401), o sistema deve redirecionar o usuário para renovação de login sem perda de dados na interface.
- **Volume alto de mensagens no histórico**: O painel de mensagens deve suportar dezenas de mensagens sem degradação perceptível de renderização ou lentidão na rolagem.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer uma interface conversacional de consultoria financeira acessível via gaveta lateral (drawer) e/ou rota dedicada, permitindo interação por texto com o assistente virtual.
- **FR-002**: O sistema DEVE validar o status de chave de inteligência artificial (`hasAiKey`) do usuário antes de permitir envios, apresentando estado informativo com gatilho para o modal de cadastro de chave caso o usuário ainda não possua chave ativa.
- **FR-003**: O sistema DEVE consumir o endpoint de mensagens em fluxo contínuo (`POST /api/chat/stream`) transmitindo a mensagem do usuário e o identificador de sessão ativo (`sessionId`).
- **FR-004**: O sistema DEVE processar os eventos Server-Sent Events (SSE) decodificando progressivamente os fragmentos de texto em tempo real sem travar a navegação da aplicação.
- **FR-005**: O sistema DEVE renderizar a resposta do assistente de maneira progressiva com efeito visual de digitação contínua, anexando cada novo fragmento recebido sem remontar ou re-renderizar a lista de mensagens anteriores.
- **FR-006**: O sistema DEVE disponibilizar um botão de interrupção imediata ("Parar resposta" / "Cancelar geração") visível durante todo o período em que um fluxo estiver ativo.
- **FR-007**: Ao acionar o botão de interrupção, o sistema DEVE abortar imediatamente a conexão em andamento através de sinal de cancelamento de requisição, mantendo todo o conteúdo parcial já recebido no histórico da conversa.
- **FR-008**: O sistema DEVE disponibilizar chips interativos de perguntas rápidas contextualmente construídos a partir das métricas e categorias do mês orçamentário ativo (ex: categoria de maior gasto, taxa de poupança, transações atípicas).
- **FR-009**: Ao selecionar um chip de pergunta rápida, o sistema DEVE disparar o envio do respectivo texto como uma nova mensagem do usuário para o assistente, desabilitando temporariamente os demais chips.
- **FR-010**: O sistema DEVE exibir alternativas de perguntas gerais de educação financeira quando o usuário não possuir movimentações registradas no mês selecionado.
- **FR-011**: O sistema DEVE manter o histórico de mensagens da conversa durante a sessão do usuário, exibindo papéis claramente diferenciados (usuário e modelo/assistente) com respectivos carimbos de data/hora.
- **FR-012**: O sistema DEVE oferecer ação explícita para o usuário reiniciar ou limpar a conversa ("Nova consulta" / "Limpar histórico"), gerando um novo identificador de sessão.
- **FR-013**: O sistema DEVE interpretar e formatar adequadamente respostas retornadas em Markdown, suportando listas, ênfases (negrito/itálico), tabelas e formatação de valores monetários.
- **FR-014**: O sistema DEVE manter rolagem automática acompanhando os novos fragmentos de texto emitidos, pausando o acompanhamento se o usuário rolar intencionalmente para cima para reler trechos anteriores.
- **FR-015**: O sistema DEVE capturar e tratar de maneira amigável erros de transmissão (incluindo 429 para limite de requisições, 503 para sobrecarga de provedor upstream e falhas de rede), exibindo opções de reenvio ("Tentar novamente").

---

### Key Entities *(include if feature involves data)*

- **ChatMessage**: Representa uma mensagem individual no diálogo conversacional.
  - Atributos principais: identificador único, papel do emissor (`user` ou `model`), conteúdo textual completo ou em construção, carimbo de data/hora de criação, estado de conclusão/interrupção e possíveis metadados de erro.
- **ChatSession**: Representa o contexto e ciclo de vida de uma sessão de consultoria financeira.
  - Atributos principais: identificador de sessão (`sessionId`), mês/competência financeira de referência, coleção ordenada de mensagens, status operacional (ocioso, gerando fluxo, interrompido ou com falha).
- **QuickSuggestionChip**: Representa um atalho sugerido de pergunta rápida contextualmente gerada para o usuário.
  - Atributos principais: identificador, rótulo textual exibido ao usuário, pergunta completa a ser despachada, categoria financeira associada ou tag de tema (ex: "Despesas", "Poupança", "Planejamento").
- **StreamChunkState**: Representa o estado transitório do pacote recebido em tempo real pelo canal SSE.
  - Atributos principais: fragmento de texto recebido, sinalizador de encerramento (`done`), identificador de sessão retornado, código ou mensagem de erro em caso de anormalidade no servidor.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O primeiro caractere de resposta do assistente financeiro DEVE ser exibido na interface em até 1,5 segundo após o início da transmissão do servidor em conexões normais de internet.
- **SC-002**: A interrupção manual da resposta através do botão "Parar resposta" DEVE cessar a recepção e congelar o texto parcial em menos de 100 milissegundos após o clique do usuário.
- **SC-003**: 100% dos fragmentos de texto recebidos via streaming DEVEM ser integrados de forma cumulativa sem perda de palavras, inversão de ordem ou duplicidade de caracteres.
- **SC-004**: Em caso de falha de conexão (429, 503 ou perda de rede), o sistema DEVE apresentar a mensagem de orientação com botão de reenvio em até 500 milissegundos após o evento de erro.
- **SC-005**: Usuários DEVEM conseguir iniciar uma consulta financeira profunda com apenas 1 clique utilizando os chips de perguntas rápidas baseadas no orçamento do mês.
- **SC-006**: A alternância entre fechar e reabrir o painel conversacional durante a mesma sessão de uso DEVE preservar 100% das mensagens trocadas sem recarregamento ou perda de contexto.

---

## Assumptions

- O usuário já se encontra autenticado na plataforma com token de acesso válido para despachar requisições ao endpoint de chat.
- As métricas financeiras consolidadas do mês ativo (maior categoria de despesa, taxa de poupança e saldo) estão disponíveis no contexto da aplicação ou via cache de consultas para compor os textos dos chips rápidos.
- Respostas do consultor utilizam a sintaxe padrão Markdown para estruturar tópicos, ênfases e tabelas.
- O histórico de mensagens mantido em memória do navegador/armazenamento de sessão pertence ao ciclo da sessão corrente e pode ser reiniciado deliberadamente pelo usuário quando desejar iniciar uma nova consulta.
- Usuários sem chave cadastrada (`hasAiKey: false`) têm acesso visual à casca do painel conversacional, mas são impedidos de despachar perguntas, recebendo instrução direta e acessível para inclusão de chave no Google AI Studio conforme o Princípio III da Constituição do projeto.
