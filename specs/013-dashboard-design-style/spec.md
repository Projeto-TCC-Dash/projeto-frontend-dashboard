# Feature Specification: Estilização Visual dos Dashboards, Visualizações Analíticas e Animações

**Feature Branch**: `feature/013-dashboard-design-style`

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "crie uma branch propria para definir o style do projeto. Eu quero que a estética fique a mesma, mas gostei de usar o tremor raw pra visualizacao de graficos e também o lightweight para futuros dashboards de investimentos. As animações eu gostei também de todas. Faça as especificações dessa implementação de design"

## Clarifications

### Session 2026-11-12

- Q: O card de Fluxo do Período deve ficar empilhado abaixo do card de Distribuição por Categorias ou em abas no mesmo card, e como deve funcionar a rolagem do Parecer do Consultor Financeiro quando o conteúdo exceder a altura dos dois cards no desktop (`≥ 1280px`) e em telas `< 1280px`? → A: Dois cards empilhados separados na coluna esquerda (**Distribuição por Categorias** acima e **Fluxo do Período** abaixo, sem abas) e, na coluna direita no desktop (`≥ 1280px`), card de **Parecer do Consultor Financeiro** com cabeçalho fixo e rolagem interna apenas no corpo; em telas `< 1280px`, altura natural no fluxo da página (Opção A).
- Q: Quando o conteúdo do Parecer do Consultor Financeiro no desktop (`≥ 1280px`) for menor que a altura somada dos dois cards da esquerda (ex.: parecer curto, BYOK pendente, estado vazio ou erro), a coluna direita deve manter a altura total combinada ou encolher ao conteúdo? → A: Manter sempre a altura total combinada dos dois cards da esquerda, alinhando a linha de base entre as duas colunas do Bento Grid em todos os estados, exibindo o conteúdo sem barra de rolagem quando couber e acionando rolagem interna no corpo apenas ao exceder essa altura (Opção A).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identidade Visual Preservada e Composição Refinada dos Dashboards (Priority: P1) 🎯 MVP

Como uma pessoa usuária acompanhando minhas finanças na plataforma, desejo que os painéis mantenham exatamente a estética minimalista e neutra que já reconheço nos modos claro e escuro, porém com melhor hierarquia visual, acabamento dos cartões de métricas e aproveitamento equilibrado do espaço em telas largas, para que a leitura dos meus resultados financeiros fique mais clara, elegante e imediata.

**Why this priority**: Preservar a identidade visual enquanto eleva o acabamento estrutural e a hierarquia de leitura garante evolução estética perceptível sem causar estranhamento aos usuários atuais nem comprometer a legibilidade já validada em todas as telas.

**Independent Test**: Pode ser testada abrindo o painel principal e a visão de contas nos modos claro e escuro, em smartphones e desktops, verificando a manutenção da paleta neutra e das cores semânticas existentes, o alinhamento equilibrado dos blocos em grade proporcional e a clareza tipográfica de rótulos, valores monetários e selos de status.

**Acceptance Scenarios**:

1. **Given** uma pessoa usuária autenticada acessando o painel principal no modo claro ou escuro, **When** a página é exibida, **Then** a paleta neutra, as cores semânticas (superávit, déficit, alerta e as 11 categorias oficiais), a tipografia tabular para valores e o estilo de bordas e cantos permanecem coerentes com a estética atual da plataforma.
2. **Given** os cinco cartões de resumo financeiro (Receitas Totais, Despesas Primárias, Quitação de Faturas, Saldo Líquido e Taxa de Poupança), **When** exibidos, **Then** apresentam hierarquia visual aprimorada (ícones em recipientes discretamente ambientados, contraste claro entre título, valor principal e contexto secundário, e selos de status integrados) mantendo exatamente os mesmos cálculos financeiros vigentes.
3. **Given** uma tela de desktop larga (`≥ 1280px`), **When** o painel principal organiza as seções analíticas e o cartão de diagnóstico inteligente abaixo dos indicadores, **Then** os blocos formam grade 7/5 em que a coluna esquerda empilha dois cards independentes (**Distribuição por Categorias** acima e **Fluxo do Período** abaixo) e a coluna direita exibe o **Parecer do Consultor Financeiro** com cabeçalho fixo e corpo rolável com o mouse dentro da altura equivalente aos dois cards da esquerda, mantendo empilhamento natural em telas médias e estreitas (`< 1280px`).
4. **Given** a alternância entre tema claro e tema escuro, **When** o usuário troca o tema, **Then** todos os cartões, cabeçalhos, recipientes de ícones e superfícies preservam contraste legível e coerência visual imediata.

---

### User Story 2 - Visualizações Analíticas Interativas e Comparativas no Painel (Priority: P1) 🎯 MVP

Como uma pessoa usuária analisando meus gastos e receitas do mês, desejo explorar gráficos analíticos mais ricos e interativos — combinando distribuição proporcional, ranking visual em barras, comparativo de fluxo do período e barras de progresso financeiro — para identificar rapidamente para onde vai meu dinheiro e auditar categorias com um toque ou clique.

**Why this priority**: Substituir a visualização manual isolada por um sistema de gráficos analíticos padronizados e interativos é o principal salto funcional e estético do dashboard, oferecendo maior profundidade de análise com os dados já disponíveis no período.

**Independent Test**: Pode ser testada acessando o painel principal em um mês com lançamentos variados, interagindo com o card de **Distribuição por Categorias** (gráfico proporcional + ranking em barras), consultando logo abaixo o card independente de **Fluxo do Período**, acionando o clique de auditoria filtrada em uma categoria e verificando estados vazios e de carregamento.

**Acceptance Scenarios**:

1. **Given** um mês com despesas registradas em múltiplas categorias, **When** o bloco de visualização analítica é carregado, **Then** exibe um gráfico interativo de distribuição proporcional acompanhado de tooltip flutuante com nome da categoria, valor em Real (BRL) e percentual, além de lista ranqueada com barras proporcionais de peso por categoria utilizando as cores oficiais de cada categoria.
2. **Given** o gráfico de distribuição e a lista ranqueada de categorias na mesma visão, **When** o usuário passa o cursor ou toca em uma fatia ou item da lista, **Then** o elemento correspondente é destacado de forma sincronizada nos dois controles e exibe o detalhamento da categoria em foco; ao clicar ou tocar para auditar, navega para a tela de transações já filtrada pela competência e categoria selecionadas.
3. **Given** o painel analítico com transações ou métricas consolidadas no mês selecionado, **When** o usuário visualiza a coluna analítica à esquerda do diagnóstico, **Then** encontra o card **Distribuição por Categorias** no topo e o card **Fluxo do Período** imediatamente abaixo como blocos separados (sem precisar alternar abas), visualizando claramente a comparação de entradas, despesas primárias e quitação de faturas da competência, além dos indicadores de progresso da taxa de poupança.
4. **Given** um mês sem despesas ou com dados ainda em carregamento, **When** o bloco analítico é exibido, **Then** apresenta esqueleto de carregamento proporcional à área do gráfico ou estado vazio ilustrado com orientação clara para importar extratos ou registrar transações.

---

### User Story 3 - Micro-Interações e Animações Fluidas com Acessibilidade de Movimento (Priority: P2)

Como uma pessoa usuária interagindo com o dashboard e navegando entre meses e páginas, desejo perceber transições fluidas nos números, entrada suave dos cartões, destaque discreto no cartão de inteligência artificial e reorganização animada de listas filtradas, para que a experiência pareça moderna, responsiva e agradável sem atrapalhar a leitura ou o desempenho.

**Why this priority**: As animações dão polimento e clareza às mudanças de estado (como troca de competência mensal, geração de diagnóstico e aplicação de filtros), diferenciando visualmente a plataforma sem alterar fluxos de trabalho.

**Independent Test**: Pode ser testada alternando entre meses com valores distintos no painel principal, visualizando os dois cards analíticos simultaneamente, acionando o recálculo do diagnóstico inteligente, filtrando categorias/transações e ativando a preferência de movimento reduzido do sistema operacional para verificar adaptação automática.

**Acceptance Scenarios**:

1. **Given** os cartões de métricas com valores monetários e percentuais exibidos, **When** os dados iniciais aparecem ou o usuário troca a competência mensal, **Then** os valores realizam transição numérica progressiva até o novo montante mantendo alinhamento tabular fixo (sem deslocamentos laterais nos cartões).
2. **Given** o carregamento inicial da tela principal ou a navegação entre itens do menu, **When** os blocos surgem ou o item ativo muda, **Then** os cartões executam entrada escalonada sutil e o indicador ativo de navegação desliza suavemente para o item selecionado.
3. **Given** o cartão de diagnóstico financeiro inteligente quando a chave de IA está ativa, **When** um diagnóstico está sendo gerado/recalculado ou entra em destaque visual, **Then** exibe uma animação discreta e elegante em sua borda ou superfície destacando a área de inteligência sem reduzir a legibilidade do texto em Markdown ou dos botões.
4. **Given** listas dinâmicas sujeitas a filtragem ou ordenação (como itens de legenda/ranking e listagens de movimentações), **When** critérios são alterados ou itens são removidos, **Then** os itens restantes reposicionam-se de forma suave e contínua.
5. **Given** um dispositivo com preferência do sistema operacional de movimento reduzido ativada, **When** qualquer tela ou interação animada é executada, **Then** transições decorativas longas, rolagem numérica prolongada e efeitos luminosos contínuos são automaticamente reduzidos ou suprimidos em respeito ao conforto visual do usuário.

---

### User Story 4 - Fundação Visual de Séries Temporais para Futuros Dashboards de Investimentos (Priority: P2)

Como uma pessoa usuária e mantenedora da plataforma preparando a evolução futura para acompanhamento de investimentos, desejo contar com um padrão visual e componente-base dedicado a gráficos financeiros temporais (evolução patrimonial, rentabilidade e séries de ativos), integrado aos temas claro e escuro da aplicação, para que futuras telas de investimentos nasçam com precisão visual de mercado financeiro e consistência total com o sistema.

**Why this priority**: Definir e padronizar desde já a base visual para séries temporais financeiras evita retrabalho futuro quando os endpoints e telas de carteira de investimentos forem construídos, mantendo alinhamento direto com a área já existente de contas de investimento.

**Independent Test**: Pode ser testada validando o componente-base de gráfico temporal financeiro com séries de exemplo em ambiente isolado de verificação/testes, testando troca de tema claro/escuro, leitura em cursor cruzado com formatação em Real (BRL), redimensionamento em diferentes larguras de container e exibição segura de estado vazio quando não houver série histórica disponível.

**Acceptance Scenarios**:

1. **Given** um bloco configurado para exibição de série temporal de investimentos recebendo pontos de data e valor, **When** renderizado, **Then** apresenta o gráfico financeiro com grade discreta, linha/área estilizada nas cores do tema ativo e legenda de valor e data em Real (BRL).
2. **Given** o gráfico temporal de investimentos interativo na tela, **When** o usuário move o ponteiro ou toca ao longo da linha do tempo e utiliza gestos ou rolagem para explorar períodos, **Then** exibe cursor cruzado (crosshair) preciso com leitura do ponto exato e permite zoom/deslocamento temporal sem travar a rolagem principal da página.
3. **Given** a alternância entre modo claro e modo escuro ou redimensionamento da janela/container, **When** o estado visual muda, **Then** as cores do fundo, eixos, linhas de grade e séries atualizam-se instantaneamente para acompanhar o tema ativo e o gráfico ajusta suas dimensões sem cortes ou distorções.
4. **Given** a ausência de histórico real de rentabilidade ou cotações na plataforma atual, **When** telas produtivas exibem contas ou resumos sem série histórica fornecida pelo servidor, **Then** o componente exibe estado vazio informativo coerente e nunca inventa dados fictícios de mercado como se fossem reais.

---

### Edge Cases

- **Alternância rápida de competência mensal**: Se o usuário avançar ou voltar vários meses em sequência rápida, as animações numéricas e transições visuais não podem acumular atrasos nem exibir valores intermediários de um mês anterior após os dados do mês final chegarem.
- **Valores financeiros extremos e negativos**: Receitas ou patrimônios na casa de milhões (ou déficits negativos altos) durante a transição numérica não devem causar quebra de linha abrupta nem expandir/encolher o cartão repetidamente a cada quadro da animação.
- **Categorias com participação mínima (< 1%)**: Em meses com muitas categorias, itens com percentual muito pequeno devem permanecer claramente visíveis e clicáveis na lista ranqueada em barras mesmo quando sua fatia no gráfico proporcional for muito fina.
- **Mês sem movimentações ou com apenas quitações de fatura**: Ao exibir 0% de taxa de poupança ou ausência de despesas primárias, gráficos comparativos, barras de progresso e animações devem assumir estado zerado/vazio elegante sem erros de divisão ou barras distorcidas.
- **Diagnóstico IA sem chave configurada, vazio, curto ou em erro temporário**: Quando a chave pessoal de IA não estiver configurada, não houver parecer gerado, o texto for curto ou houver falha temporária de serviço, o cartão de diagnóstico não deve exibir animação contínua sugestiva de processamento ativo de IA, o destaque visual deve refletir o estado de alerta, pendência ou prontidão e, no desktop (`≥ 1280px`), o card deve preservar a mesma altura combinada dos dois cards da esquerda mantendo a linha de base alinhada sem barra de rolagem desnecessária.
- **Dispositivos com GPU limitada ou preferência de movimento reduzido**: Todas as animações devem permanecer leves, não bloquear cliques durante a transição e respeitar imediatamente a configuração de acessibilidade do usuário.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema de design dos dashboards DEVE preservar integralmente a estética visual vigente — mantendo a paleta neutra nos modos claro e escuro, a tipografia limpa com alinhamento tabular para valores monetários, o raio de arredondamento harmônico e as cores semânticas oficiais (positivo, negativo, alerta e as 11 categorias canônicas).
- **FR-002**: O painel principal DEVE organizar sua área inferior em Bento Grid proporcional no desktop (`≥ 1280px`), empilhando os cards independentes de **Distribuição por Categorias** e **Fluxo do Período** na coluna esquerda e exibindo o **Parecer do Consultor Financeiro** na coluna direita exatamente igualado à altura combinada dos dois cards à esquerda em todos os estados (alinhando a base das duas colunas mesmo com conteúdo curto, BYOK pendente, estado vazio ou erro, com cabeçalho fixo e rolagem interna apenas no corpo quando o conteúdo exceder essa altura), preservando empilhamento natural e fluxo vertical contínuo da página em dispositivos `< 1280px` (320px a 1279px).
- **FR-003**: Os cartões de resumo financeiro DEVEM apresentar acabamento visual aprimorado (recipientes sutis para ícones, hierarquia tipográfica clara e badges de contexto) mantendo intactas todas as regras contábeis existentes, inclusive a segregação de quitação de faturas.
- **FR-004**: O sistema DEVE adotar visualizações analíticas padronizadas com gráficos interativos para o painel financeiro, contemplando no mínimo: distribuição proporcional por categorias com tooltip detalhado, lista ranqueada em barras proporcionais sincronizada com o gráfico e visão comparativa de fluxo/movimentação do período derivada dos dados disponíveis da competência.
- **FR-005**: A seleção e o destaque em visualizações de categorias DEVEM funcionar de forma bidirecional (entre gráfico e legenda/ranking), respondendo tanto a cursor quanto a toque, e mantendo a navegação direta (*drill-down*) para a auditoria de transações filtradas por mês e categoria.
- **FR-006**: Os dois blocos gráficos empilhados do painel (**Distribuição por Categorias** acima e **Fluxo do Período** abaixo) DEVEM ser exibidos simultaneamente como cards separados (sem ocultação por abas), exibindo estados de carregamento proporcionais e estados vazios instrutivos independentes quando não houver dados suficientes.
- **FR-007**: O sistema DEVE incorporar um componente-base reutilizável para gráficos financeiros de séries temporais destinado a futuros dashboards de investimentos, com contrato de dados desacoplado da origem de mercado, suporte a cursor cruzado (crosshair), leitura em Real (BRL), zoom/navegação temporal e redimensionamento automático ao container.
- **FR-008**: Todos os componentes de visualização de dados — tanto os gráficos analíticos atuais quanto a base temporal para investimentos — DEVEM sincronizar automaticamente suas cores, textos, eixos e tooltips ao alternar entre modo claro e modo escuro.
- **FR-009**: O componente-base de investimentos NÃO DEVE exibir cotações ou rentabilidades fictícias em telas produtivas quando não houver dados reais fornecidos, apresentando estado vazio padronizado até a integração futura dos dados de carteira.
- **FR-010**: Os valores monetários e percentuais principais dos cartões de métricas DEVEM executar animação numérica progressiva ao serem exibidos ou atualizados pela troca de mês, mantendo largura estável e formatação em Real (BRL) e percentual sem deslocar elementos adjacentes.
- **FR-011**: O sistema DEVE aplicar animações sutis de entrada escalonada nos cartões e blocos do dashboard, transição suave de layout no indicador ativo de navegação e animação automática ao filtrar, ordenar ou atualizar itens em listas dinâmicas.
- **FR-012**: O cartão de diagnóstico financeiro por IA DEVE apresentar um destaque visual animado discreto em sua borda ou superfície durante o processamento/recálculo de análise e acabamento sutil quando pronto, respeitando os estados de erro e chave BYOK pendente sem prejudicar a legibilidade do parecer.
- **FR-013**: Todas as animações e micro-interações DEVEM respeitar automaticamente a preferência de movimento reduzido do sistema operacional do usuário e nunca impedir cliques, leitura imediata ou validação por testes automatizados.

### Key Entities

- **Tema Visual e Tokens Semânticos**: Conjunto padronizado de cores de superfície, texto, borda, estados positivos/negativos/alerta e as 11 cores canônicas de categorias para os modos claro e escuro, garantindo consistência entre cartões, gráficos analíticos e séries temporais.
- **Item de Visualização Categórica**: Representação unificada de uma categoria de despesa ou movimentação contendo nome canônico, cor semântica, valor monetário em BRL e participação percentual, compartilhada entre o gráfico proporcional e o ranking em barras.
- **Série Financeira Temporal de Investimentos**: Estrutura desacoplada de pontos cronológicos (carimbo de data/tempo e valor ou série OHLC opcional) com metadados de moeda/escala para alimentação da base de gráficos de investimentos futuros.
- **Estado de Movimento e Destaque Visual**: Configuração contextual que coordena o nível de animação ativo (padrão ou movimento reduzido) e o estado visual do cartão de IA (ocioso, processando, pronto, erro ou chave pendente).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos blocos visuais do painel principal (cabeçalho, cartões de métricas, visualizações gráficas e diagnóstico inteligente) mantêm coerência visual nos modos claro e escuro com contraste adequado e zero quebras de layout entre 320px e 1440px+.
- **SC-002**: Usuários visualizam simultaneamente os cards **Distribuição por Categorias** e **Fluxo do Período** na coluna analítica e conseguem auditar qualquer categoria por clique/toque no gráfico ou no ranking em barras com resposta imediata (100% de sincronia entre o filtro aplicado e a categoria selecionada).
- **SC-003**: A alternância entre competências mensais atualiza os indicadores numéricos e gráficos de forma fluida, estabilizando valores e layout em menos de 500ms após a chegada dos dados e sem saltos horizontais perceptíveis nos cartões.
- **SC-004**: 100% das interações animadas respeitam a preferência de movimento reduzido do usuário, eliminando transições contínuas e deslocamentos quando ativada.
- **SC-005**: O componente-base para futuros gráficos de investimentos opera integralmente com dados de série temporal reais ou simulados em verificação isolada, ajustando-se automaticamente ao redimensionamento e à troca de tema claro/escuro sem perda de legibilidade.
- **SC-006**: 100% dos testes automatizados existentes na aplicação permanecem aprovados após a evolução visual, somados à cobertura de testes para os novos componentes de visualização, base de séries temporais e comportamentos de interação.

## Assumptions

- **Preservação estética**: A evolução de estilo mantém a identidade atual do produto (minimalismo neutro e limpo com acentos semânticos financeiros), sem introdução de paletas vibrantes invasivas ou mudança radical de tipografia.
- **Diretrizes de bibliotecas escolhidas pelo solicitante para o planejamento técnico**:
  - Visualizações analíticas do dashboard (gráfico proporcional de categorias, ranking em barras, comparativo de fluxo e indicadores de progresso) baseadas no padrão **Tremor Raw** (componentes copiáveis em código aberto compatíveis com a estilização atual).
  - Base reutilizável de séries temporais preparada para futuros dashboards de investimentos utilizando **Lightweight Charts** (TradingView), desacoplada de dados reais de mercado nesta etapa.
  - Conjunto completo das quatro frentes de animação aprovadas: transição numérica fluida nos KPIs (padrão *NumberFlow*), coreografia de entrada e transição de layout/indicador de navegação (padrão *Motion*), destaque animado discreto no cartão de diagnóstico por IA (padrão *Magic UI* usado de forma pontual) e animação automática em listas filtradas/ordenadas (padrão *AutoAnimate*).
- **Escopo de dados**: Todas as novas visualizações do dashboard atual consomem ou derivam exclusivamente dos dados já disponibilizados pelos fluxos existentes da aplicação (métricas mensais, transações do mês e contas), sem exigir criação de novos endpoints de backend nesta entrega.
- **Compatibilidade com entregas anteriores**: Todas as garantias de responsividade já especificadas e implementadas na aplicação devem ser integralmente preservadas nas novas grades, gráficos e animações.
