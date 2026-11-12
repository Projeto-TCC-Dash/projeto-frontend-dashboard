# Feature Specification: Responsividade Completa da Aplicação

**Feature Branch**: `012-full-app-responsiveness`

**Created**: 2026-11-11

**Status**: Draft

**Input**: User description: "Melhoria de responsividade em toda a aplicação, garantindo uma experiência de uso consistente, funcional e visualmente agradável em dispositivos desktop, notebooks, tablets e smartphones, sem comprometer a identidade visual, o design ou as funcionalidades existentes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegação Principal e Estrutura Global sem Estouro Horizontal (Priority: P1) 🎯 MVP

Como uma pessoa usuária acessando a plataforma a partir de smartphones pequenos (320px), smartphones médios/grandes, tablets ou desktops, desejo que a barra de navegação superior, a área de identificação do usuário e a estrutura base das páginas se adaptem automaticamente à largura da tela com um menu móvel funcional, para que eu acesse qualquer seção do sistema sem cortes, sobreposições ou barra de rolagem horizontal na página.

**Why this priority**: A estrutura de navegação e o layout envolvem todas as rotas da aplicação; qualquer estouro ou esmagamento no cabeçalho compromete imediatamente a usabilidade e impede o acesso às funcionalidades em dispositivos móveis e tablets.

**Independent Test**: Pode ser testada redimensionando o navegador por todas as faixas de resolução (de 320px a 1440px+), validando que não existe rolagem horizontal na página, que a barra superior mantém itens legíveis e acessíveis, e que o menu móvel abre, navega para cada rota e fecha corretamente.

**Acceptance Scenarios**:

1. **Given** uma viewport de smartphone pequeno (320px a 375px), **When** qualquer página autenticada ou pública é carregada, **Then** a largura total renderizada não ultrapassa a viewport (zero rolagem horizontal na página) e os controles do cabeçalho (marca, status de IA, alternador de tema, acesso ao perfil, saída e menu) permanecem visíveis sem sobreposição.
2. **Given** uma viewport mobile ou tablet em que a navegação horizontal completa não cabe confortavelmente (abaixo da largura de desktop), **When** o usuário aciona o botão de menu móvel, **Then** todas as rotas principais (Dashboard, Contas, Extratos, Metas e Consultor) são exibidas em lista vertical com áreas de toque confortáveis, fechando automaticamente ao escolher uma opção, pressionar Escape ou clicar fora.
3. **Given** uma viewport de tablet (768px a 1023px) ou notebook (1024px a 1439px), **When** o usuário navega pelo sistema, **Then** os links de navegação e a identificação da conta não sofrem quebra desordenada nem comprimem o nome ou ações da barra superior.
4. **Given** o redimensionamento contínuo da janela entre resoluções móveis e desktop, **When** a transição ultrapassa o limiar de layout, **Then** o menu móvel recolhe de forma limpa sem deixar camadas órfãs bloqueando a tela.

---

### User Story 2 - Painel Financeiro Principal e Visualizações Adaptativas (Priority: P1) 🎯 MVP

Como uma pessoa usuária acompanhando minha saúde financeira no celular ou tablet, desejo que o cabeçalho do painel, o seletor de mês, os cartões de métricas, o gráfico proporcional de categorias e o diagnóstico inteligente se reorganizem verticalmente e em grids proporcionais com interações compatíveis com toque, para que eu interprete todos os indicadores financeiros com clareza em qualquer dispositivo.

**Why this priority**: O painel principal é a tela de entrada da aplicação e concentra gráficos vetoriais, valores monetários e múltiplos cartões lado a lado que precisam manter legibilidade e interação por toque em telas estreitas.

**Independent Test**: Pode ser testada acessando o painel principal nas seis faixas de resolução com dados carregados e em estado vazio, validando alinhamento do seletor de mês, ausência de cortes nos valores monetários dos cartões, leitura do gráfico de rosca e seleção das categorias por toque.

**Acceptance Scenarios**:

1. **Given** o cabeçalho do painel financeiro e o seletor de mês em um smartphone pequeno (320px a 480px), **When** renderizados, **Then** título, selo de status, seletor de competência mensal e atalho para extratos empilham-se ou alinham-se dentro da largura disponível sem vazar os limites do cartão.
2. **Given** os cinco cartões de resumo financeiro (Receitas, Despesas Primárias, Quitação de Faturas, Saldo Líquido e Taxa de Poupança), **When** exibidos de 320px até 1440px+, **Then** adaptam o número de colunas conforme a largura disponível mantendo valores monetários completos e legíveis sem truncamento indevido ou aperto excessivo em notebooks intermediários.
3. **Given** o gráfico proporcional de despesas por categoria e sua legenda, **When** visualizados em smartphones (320px a 480px), **Then** o gráfico escala proporcionalmente ao container sem cortes laterais, a legenda reorganiza-se em coluna única ou duas colunas legíveis, e tocar em uma fatia ou item da legenda funciona corretamente sem depender exclusivamente de hover do mouse.
4. **Given** o cartão de diagnóstico financeiro e o banner de convite ao preenchimento de perfil, **When** exibidos em telas estreitas, **Then** textos, listas de recomendações e botões de ação ajustam-se com quebras de linha naturais e margens internas equilibradas.

---

### User Story 3 - Gestão de Transações, Filtros, Upload e Exportação em Telas Menores (Priority: P1) 🎯 MVP

Como uma pessoa usuária auditando movimentações, importando extratos ou exportando relatórios em dispositivos móveis ou tablets, desejo que os controles de filtro, a área de envio de arquivos, a listagem de transações e os formulários de exportação sejam totalmente operáveis sem perda de colunas ou compressão de campos, para gerenciar meus lançamentos de ponta a ponta em qualquer tela.

**Why this priority**: A tela de transações possui a tabela mais larga do sistema (7 atributos por lançamento) além de múltiplos filtros e seletores de data, sendo o ponto de maior risco de quebra visual em smartphones e tablets.

**Independent Test**: Pode ser testada acessando a gestão de transações e a central de exportação em resoluções de 320px, 376px, 768px e 1440px, filtrando dados, editando/excluindo um lançamento e acionando downloads de relatórios sem rolagem horizontal da página inteira.

**Acceptance Scenarios**:

1. **Given** os filtros de transações (mês de competência, categoria, origem e conta bancária) em smartphones (320px a 767px), **When** exibidos, **Then** os seletores expandem proporcionalmente à largura do container e empilham-se sem estourar o card mesmo quando existirem nomes extensos de contas ou instituições.
2. **Given** a listagem de transações em dispositivos móveis (320px a 767px), **When** existem lançamentos para exibir, **Then** todas as informações (data, descrição, categoria, conta, origem, valor e botões de editar/excluir) permanecem legíveis e acessíveis — seja por apresentação em cartões empilhados em telas estreitas ou por rolagem horizontal estritamente restrita ao container da tabela, preservando a página sem scroll lateral.
3. **Given** os banners de resumo (pós-upload e pós-categorização automática) e a área de seleção de arquivo em telas pequenas, **When** exibidos, **Then** textos e botões de dispensar ou confirmar organizam-se sem comprimir palavras nem vazar bordas.
4. **Given** a central de exportação (`/settings/export`) em smartphones pequenos (320px a 480px), **When** o usuário seleciona intervalo customizado de datas e escolhe entre CSV, XLSX e PDF, **Then** os dois campos de data e os três cartões de formato empilham-se confortavelmente sem cortar dígitos ou botões de ação.

---

### User Story 4 - Contas, Configurações, Formulários e Modais Confortáveis ao Toque (Priority: P2)

Como uma pessoa usuária gerenciando minhas contas bancárias, perfil pessoal, metas de investidor, segurança ou autenticando-me no sistema em dispositivos móveis, desejo que formulários, abas de configuração, cartões de conta, janelas modais e alvos de clique adaptem-se à altura e largura da tela com conforto para toque, para concluir cadastros e confirmações críticas sem cortes nem cliques acidentais.

**Why this priority**: Telas com altura reduzida (como smartphones de 320x568, modo paisagem ou teclado virtual aberto) frequentemente cortam botões de confirmação em janelas modais ou dificultam toques em ícones pequenos.

**Independent Test**: Pode ser testada abrindo cada diálogo modal (criar/editar conta, excluir conta, editar/excluir transação, configurar chave de IA, desvincular Google, remover avatar) e navegando por `/login`, `/register`, `/onboarding`, `/accounts`, `/settings/profile`, `/settings/security` e `/settings/metas` em viewports móveis e tablets.

**Acceptance Scenarios**:

1. **Given** qualquer janela modal ou diálogo de confirmação em smartphones (inclusive com altura reduzida ou teclado virtual aberto), **When** aberto, **Then** o diálogo respeita margens da viewport, limita sua altura à tela visível e oferece rolagem interna suave para que título, campos e botões de cancelar/confirmar nunca fiquem inacessíveis fora da área visível.
2. **Given** os botões de ação baseados em ícone (editar/excluir transação, editar/excluir conta, navegação de meses, remoção rápida de avatar, alternador de tema e fechamento de painéis), **When** operados em dispositivos com tela touch, **Then** oferecem área clicável mínima confortável para toque sem comprometer o alinhamento em desktop.
3. **Given** as páginas de configurações (`/settings/profile`, `/settings/security`, `/settings/export` e `/settings/metas`), **When** visualizadas em 320px a 767px, **Then** a barra de abas mantém todas as opções acessíveis sem cortar rótulos, os controles de foto de perfil e vínculo Google empilham botões adequadamente e os cartões de regime de renda/risco ajustam-se sem truncamento.
4. **Given** a página de contas (`/accounts`) e o cartão de Patrimônio Líquido Total, **When** renderizados com valores monetários altos ou nomes longos de instituições em 320px, **Then** os valores e títulos ajustam tipografia ou quebram linha de maneira limpa dentro do cartão, e os cartões distribuem-se em 1 coluna no mobile, 2 no tablet/notebook e 3 no desktop.

---

### User Story 5 - Consultor Financeiro Virtual e Botão Flutuante Sem Obstrução (Priority: P2)

Como uma pessoa usuária interagindo com o Consultor Financeiro Virtual em tela cheia ou pela gaveta lateral em dispositivos móveis, desejo que a área de conversa respeite a altura útil dinâmica da tela (mesmo com teclado aberto), que mensagens extensas quebrem linhas dentro da bolha e que o botão flutuante não bloqueie outros controles da interface.

**Why this priority**: O chat em streaming utiliza altura fixa calculada sobre a viewport e conteúdo dinâmico em Markdown; em smartphones, barras retráteis do navegador e teclados virtuais costumam ocultar o campo de entrada ou causar scroll lateral por URLs e blocos longos.

**Independent Test**: Pode ser testada abrindo `/chat` e a gaveta lateral do consultor em viewports de 320px a 1440px+, enviando mensagens extensas com URLs/listas e validando visibilidade contínua do campo de entrada e posicionamento seguro do botão flutuante nas demais páginas.

**Acceptance Scenarios**:

1. **Given** a página dedicada de chat (`/chat`) em navegadores móveis onde a barra de endereço ou o teclado virtual altera a altura útil da janela, **When** o usuário digita e acompanha a resposta, **Then** o cabeçalho, a lista de mensagens e a caixa de envio permanecem integralmente visíveis utilizando altura dinâmica da viewport sem cortes no rodapé.
2. **Given** a gaveta lateral do consultor aberta em smartphones (320px a 480px) ou tablets, **When** exibida, **Then** ocupa a largura adequada ao dispositivo sem ultrapassar os limites da tela e mantém os botões de expandir/fechar acessíveis.
3. **Given** mensagens enviadas pelo usuário ou respostas geradas em Markdown contendo palavras longas, URLs, códigos ou listas, **When** renderizadas dentro das bolhas de mensagem, **Then** o texto adapta-se aos limites internos da bolha sem estourar horizontalmente o painel de chat.
4. **Given** o botão flutuante do consultor nas demais rotas, **When** exibido em telas pequenas, **Then** utiliza espaçamento inferior seguro para minimizar obstrução sobre botões finais de formulários e ações de tabela, mantendo acesso fácil por toque.

---

### Edge Cases

- **Strings e valores extremos em 320px**: Nomes de usuários extensos, e-mails longos, instituições bancárias com títulos compridos, valores financeiros na casa de milhões (ex.: `-R$ 1.250.480,90`) e descrições brutas de extratos sem espaços não devem forçar o alargamento horizontal da página ou de cards/bolhas.
- **Telas baixas / paisagem em smartphones**: Diálogos modais e menus abertos em dispositivos com altura limitada (ex.: 568px em retrato ou <420px em paisagem mobile) não devem cortar botões de submissão ou fechamento.
- **Redimensionamento dinâmico desktop ↔ mobile**: Ao diminuir ou aumentar a janela do navegador com o menu mobile ou a gaveta do chat abertos, não deve permanecer estado visual quebrado ou camada invisível bloqueando interações.
- **Campos nativos de data e mês (`date` / `month`)**: Em smartphones de 320px, dois campos de data lado a lado ou acompanhados de botões laterais devem empilhar ou flexibilizar largura para não cortar o calendário nativo.
- **Tabelas e listas com zero itens ou carregando**: Estados de carregamento (skeletons) e estados vazios devem respeitar os mesmos limites e grids responsivos do estado populado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Toda a aplicação (rotas de autenticação, painel principal, contas, transações, metas, configurações, onboarding e chat) DEVE adaptar-se integralmente às larguras de 320px até 1440px ou superiores, sem gerar barra de rolagem horizontal na página inteira em nenhuma resolução.
- **FR-002**: A barra de navegação principal DEVE impedir sobreposição e compressão de seus elementos em smartphones pequenos (320px–375px) e tablets (768px–1023px), exibindo navegação horizontal completa apenas quando houver largura suficiente e oferecendo menu móvel recolhível nas faixas inferiores.
- **FR-003**: O menu móvel DEVE permitir abrir e fechar de forma previsível, incluindo fechamento automático ao selecionar uma rota ou acionar a tecla de cancelamento (Escape).
- **FR-004**: O identificador do usuário no cabeçalho DEVE ajustar a exibição de texto (nome e e-mail) em telas muito estreitas para preservar o acesso ao avatar/perfil e ao botão de encerramento de sessão sem esmagamento.
- **FR-005**: Todos os cabeçalhos de página, cartões de resumo, banners e barras de filtro DEVEM reorganizar seus itens e botões de ação em direção vertical ou com quebra fluida em telas pequenas, impedindo corte de textos ou extrapolar bordas.
- **FR-006**: A listagem de transações DEVE garantir visualização legível de todos os campos (data, descrição, categoria, conta, origem, valor e ações) em smartphones e tablets, utilizando apresentação adaptada em cartões para telas estreitas ou rolagem horizontal estritamente contida no container da tabela.
- **FR-007**: A central de exportação e os seletores de competência ou intervalo de datas DEVEM evitar colocar dois controles nativos de data comprimidos na mesma linha em smartphones pequenos, garantindo operação clara de todos os campos.
- **FR-008**: O gráfico proporcional de categorias e sua legenda DEVEM ajustar suas dimensões ao espaço disponível sem vazar containers em 320px e garantir seleção interativa acessível por toque.
- **FR-009**: Todas as janelas modais e diálogos de confirmação da aplicação DEVEM limitar-se à altura útil da viewport com rolagem interna própria quando o conteúdo exceder a altura da tela.
- **FR-010**: Textos contínuos longos (nomes, e-mails, valores monetários elevados, descrições brutas, URLs e blocos formatados em mensagens do chat) DEVEM respeitar os limites dos respectivos containers com truncamento controlado ou quebra de palavra segura.
- **FR-011**: Elementos interativos focados em navegação, filtros, fechamento de modais e ações em listas DEVEM possuir áreas de toque adequadas em dispositivos móveis/tablets, e botões principais de formulários DEVEM expandir ou posicionar-se confortavelmente em telas estreitas.
- **FR-012**: A tela dedicada do consultor virtual (`/chat`) DEVE acompanhar a altura dinâmica visível da viewport em dispositivos móveis para manter o campo de envio visível, e o botão flutuante do consultor não deve impedir o uso de controles inferiores nas páginas.
- **FR-013**: Todas as adaptações responsivas DEVEM preservar integralmente as regras de negócio, contratos de dados com o servidor, comportamentos de autenticação/segurança, identidade visual e cobertura automatizada de testes existente.

### Escopo das Telas e Módulos Auditados

*(Inventário mapeado na análise prévia da estrutura do projeto, sem alterações implementadas nesta etapa)*

- **Estilos Globais e Layouts**: Estilização global, layout raiz, layout de autenticação (`/login`, `/register`), layout do painel autenticado e layout das configurações.
- **Navegação e Shell**: Barra superior global, menu móvel, identificador do usuário, selo de status da chave de IA, alternador de tema, menu lateral legado (caso reutilizado) e abas de configurações.
- **Páginas e Domínios**: Painel Principal (`/`), Contas (`/accounts`), Transações (`/transactions`), Onboarding (`/onboarding`), Consultor IA (`/chat`), Perfil (`/settings/profile`), Segurança (`/settings/security`), Exportação (`/settings/export`), Metas (`/settings/metas`) e Redirecionamento (`/goals`).
- **Componentes Reutilizáveis e Diálogos**: Cartões de métricas, seletor de mês, gráfico de categorias e legenda, cartão de diagnóstico, banner de onboarding, filtros/tabela/dropzone/exportação de transações, cartões de conta, formulários de perfil e metas, seção de contas Google conectadas, chat em painel/gaveta/bolhas/chips, e todos os modais do sistema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das rotas da aplicação renderizam nas seis faixas de resolução de referência (320px–375px, 376px–480px, 481px–767px, 768px–1023px, 1024px–1439px e >=1440px) sem gerar rolagem horizontal no documento principal (largura total da página igual à largura da viewport).
- **SC-002**: 100% dos fluxos interativos críticos (navegação pelo menu móvel/desktop, alternância de meses, aplicação de filtros, visualização/edição/exclusão de transações, criação/edição/exclusão de contas, preenchimento de formulários de perfil/metas/exportação, abertura/confirmação de diálogos e envio de mensagens no chat) permanecem integralmente operáveis em todas as faixas de resolução.
- **SC-003**: Zero ocorrências de texto cortado sem tratamento intencional, botões sobrepostos, cabeçalhos comprimidos ou diálogos com ação fora da área visível nas resoluções de referência, incluindo dispositivos de 320px de largura e telas de baixa altura vertical.
- **SC-004**: 100% dos testes automatizados existentes continuam aprovados após a implementação das melhorias responsivas, acrescidos de novos cenários de teste cobrindo comportamentos adaptativos críticos (como menu móvel, visualização mobile de dados e diálogos com rolagem).

## Assumptions

- Os breakpoints de adaptação serão guiados pelas necessidades reais de cada componente e layout (considerando o limiar padrão de navegação horizontal em telas maiores onde todos os links cabem sem aperto, e empilhamento em smartphones/tablets), utilizando prioritariamente os utilitários nativos do framework de estilos adotado no projeto.
- Para a tabela de transações em telas estreitas (`<768px`), a abordagem padrão preferencial será oferecer visualização em cartões responsivos empilhados (ou ocultamento progressivo com card resumo mantendo todos os 7 dados acessíveis sem rolagem lateral da página), preservando a tabela completa em telas médias e grandes.
- Alvos de interação em telas sensíveis ao toque priorizarão dimensão mínima confortável (~40px–44px de área clicável no mobile) sem inflar visualmente barras compactas em desktop.
- Nenhuma alteração será feita em contratos REST, regras de negócio do backend, esquema do banco de dados ou dependências externas desnecessárias.
