# Feature Specification: Evolução Visual de Gráficos e Histórico Financeiro Consolidado Multi-Mês

**Feature Branch**: `014-multi-month-charts-evolution`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "Crie especificações para essas mudanças: melhoria visual de gráficos, gráfico total de todos os meses demonstrando subida/evolução, polimento estético nos gráficos existentes (donut, fluxo do período), sparklines nos KPIs e alocação patrimonial."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gráfico de Evolução Financeira Consolidada Multi-Mês (Priority: P1) 🎯 MVP

Como uma pessoa usuária acompanhando minha saúde financeira no longo prazo, desejo visualizar um gráfico histórico unificado que consolide receitas, despesas e a curva contínua de subida do saldo acumulado ao longo de todos os meses registrados (com filtros para 6 meses, 12 meses ou Todo o Histórico), para que eu compreenda com clareza minha evolução patrimonial e a consistência da minha economia ao longo do tempo.

**Why this priority**: É a entrega central solicitada pelo usuário para superar a restrição da análise isolada de um único mês, permitindo enxergar visualmente a tendência de crescimento financeiro (a "subida") e a solidez do orçamento ao longo de múltiplos períodos.

**Independent Test**: Pode ser testada acessando o painel principal com múltiplos meses de lançamentos, selecionando os intervalos temporais (6M, 12M e Todo o Histórico) e constatando a renderização combinada das barras de receitas/despesas com a curva de área contínua do saldo acumulado em ascensão, incluindo tooltips com discriminação completa dos valores e indicador de variação no período.

**Acceptance Scenarios**:

1. **Given** um histórico de transações abrangendo dois ou mais meses, **When** o usuário visualiza o gráfico de evolução histórica no dashboard, **Then** o sistema exibe barras mensais lado a lado para receitas totais (verde esmeralda) e despesas primárias (rosa/vermelho), combinadas com uma curva suave sobreposta com gradiente indicando a trajetória de subida do saldo acumulado no período.
2. **Given** a curva de saldo acumulado ao longo dos meses, **When** o saldo acumulado for crescente (superávits sucessivos), **Then** a área preenchida abaixo da curva exibe gradiente ascendente em verde esmeralda com destaque luminoso no último ponto; caso haja períodos de déficit, a inflexão na curva é demonstrada com clareza sem quebrar o gráfico.
3. **Given** o seletor de horizonte temporal do gráfico histórico (filtros rápidos "Últimos 6 meses", "Últimos 12 meses" e "Todo o Histórico"), **When** o usuário altera a seleção de período, **Then** a escala do eixo temporal e os totais se recalculam de forma suave em menos de 300ms mantendo os dados consolidados legíveis.
4. **Given** uma pessoa usuária com regime de renda e renda declarada configurados em seu perfil financeiro (ex.: meta de reserva de emergência recomendada de 6 a 12 meses), **When** o gráfico histórico é exibido, **Then** apresenta uma linha de referência visual horizontal pontilhada indicando a meta de reserva para contextualizar a aproximação da curva acumulada em relação ao objetivo estipulado.
5. **Given** a navegação pelo gráfico com cursor ou toque, **When** o usuário posiciona o cursor sobre uma competência mensal específica, **Then** um tooltip enriquecido exibe o mês de competência, total de receitas, total de despesas, quitação de faturas, saldo líquido daquele mês e o saldo acumulado até aquele momento.

---

### User Story 2 - Incremento Visual e Interatividade nos Gráficos Existentes do Dashboard (Priority: P1) 🎯 MVP

Como uma pessoa usuária explorando o painel financeiro mensal, desejo que os gráficos de distribuição por categorias e de fluxo do período apresentem acabamento visual superior — cantos arredondados nas fatias, gradientes verticais, limites estéticos de largura de barras, modo de visualização acumulada do mês e saldo líquido discriminado nos tooltips — para que a leitura dos meus dados cotidianos seja visualmente refinada e prazerosa.

**Why this priority**: Eleva imediatamente a qualidade perceptível da interface sem custos adicionais de infraestrutura ou dependências externas, aproveitando todo o poder de renderização dos componentes já instalados no projeto.

**Independent Test**: Pode ser testada inspecionando o gráfico de rosca de categorias e o card de fluxo do período na página inicial do dashboard, verificando cantos curvos nas fatias, alternância entre visão diária e visão acumulada no card de fluxo, ausência de barras excessivamente grossas em meses com poucos lançamentos e cálculo dinâmico do saldo no tooltip flutuante.

**Acceptance Scenarios**:

1. **Given** o gráfico de rosca de distribuição por categorias, **When** renderizado com as categorias ativas do mês, **Then** cada segmento circular exibe cantos arredondados nas extremidades (`cornerRadius`), e ao passar o cursor ou tocar em uma fatia, ela recebe expansão radial suave em destaque mantendo total sincronia bidirecional com a lista de categorias.
2. **Given** o card de fluxo do período, **When** o usuário interage com o novo controle de modo de visualização no cabeçalho do card, **Then** pode alternar entre "Movimentação por Data" (gráfico de barras por dia) e "Saldo Acumulado no Mês" (gráfico de área contínua ilustrando como as receitas elevam o saldo e as despesas diárias o decrementam ao longo dos dias do mês).
3. **Given** uma competência com poucos lançamentos (ex.: 1 a 4 dias com movimentação), **When** o gráfico de barras do período é exibido, **Then** a largura das barras respeita um limite máximo harmônico (`maxBarSize`), impedindo que fiquem esticadas ou desproporcionais, e aplica um gradiente vertical sutil do topo para a base.
4. **Given** a exibição do tooltip em qualquer data ou barra do fluxo do período, **When** o usuário inspeciona o detalhe flutuante, **Then** o tooltip exibe receitas, despesas, faturas e calcula automaticamente o saldo líquido pontual daquela data (`receitas - despesas - faturas`) com indicação de superávit (+) ou déficit (-).

---

### User Story 3 - Indicadores de Tendência e Mini Sparklines nos Cartões de Métricas (Priority: P2)

Como uma pessoa usuária consultando os indicadores rápidos no topo do painel, desejo identificar prontamente se minhas receitas, despesas e saldo líquido aumentaram ou diminuíram em relação ao mês anterior (MoM), acompanhados por mini curvas de tendência (sparklines) diretamente nos cartões, para ter uma percepção visual instantânea do ritmo dos meus gastos e ganhos.

**Why this priority**: Proporciona leitura executiva instantânea no primeiro segundo de acesso ao dashboard, enriquecendo os cartões de métricas existentes com dados contextuais de tendência sem poluir o visual minimalista.

**Independent Test**: Pode ser testada alternando meses com histórico prévio cadastrado e verificando se os cartões de Receitas Totais, Despesas Primárias e Saldo Líquido exibem o selo comparativo percentual correto e a mini linha de tendência de 32px no rodapé do cartão.

**Acceptance Scenarios**:

1. **Given** os cartões de métricas principais com dados do mês atual e do mês imediatamente anterior, **When** renderizados, **Then** exibem um selo discreto de variação percentual com seta indicativa (ex.: "↑ +8,5% vs mês ant.") respeitando a semântica financeira (alta em receitas é positiva/verde, alta em despesas é alerta/vermelho, queda em despesas é positiva/verde).
2. **Given** os cartões de resumo financeiro com histórico dos últimos meses, **When** exibidos, **Then** apresentam uma mini sparkline discreta e elegante em sua base ilustrando a trajetória das últimas competências com gradiente suave integrado à paleta do tema ativo.
3. **Given** um mês inicial sem competência anterior registrada no sistema, **When** os cartões são visualizados, **Then** omitem suavemente o selo comparativo e a sparkline sem apresentar erros ou valores inválidos como `NaN` ou `0%`.

---

### User Story 4 - Distribuição de Alocação de Ativos e Gráfico Temporal na Gestão de Contas (Priority: P3)

Como uma pessoa usuária gerenciando múltiplas contas e investimentos em `/accounts`, desejo visualizar uma barra segmentada horizontal de alocação de patrimônio por tipo de conta (Conta Corrente, Investimentos, Dinheiro e Cartão de Crédito) e contar com o gráfico temporal financeiro ativo para evolução patrimonial, para que eu visualize com precisão como meu patrimônio está distribuído e crescendo.

**Why this priority**: Conecta os recursos já construídos de séries temporais financeiras (TradingView Lightweight Charts) ao ecossistema produtivo de contas e oferece visão executiva imediata da carteira de ativos da pessoa usuária.

**Independent Test**: Pode ser testada acessando a rota `/accounts` com diferentes contas cadastradas, observando a barra horizontal proporcional colorida de alocação de patrimônio abaixo do card de Patrimônio Líquido Total e a presença do gráfico temporal financeiro ativo.

**Acceptance Scenarios**:

1. **Given** uma ou mais contas cadastradas com saldos positivos ou negativos na página `/accounts`, **When** o card de Patrimônio Líquido Total é renderizado, **Then** exibe imediatamente abaixo do saldo uma barra proporcional horizontal segmentada destacando a participação de cada tipo de conta (Conta Corrente, Investimento, Dinheiro e Cartão) com suas cores canônicas e rótulos percentuais.
2. **Given** a existência de movimentações e saldos históricos consolidados de contas, **When** a seção de evolução patrimonial é carregada, **Then** exibe o gráfico financeiro temporal interativo com linha/área, suporte a cursor cruzado (crosshair) e alternância automática entre temas claro e escuro.
3. **Given** um usuário que ainda não possui histórico suficiente para traçar a evolução temporal de patrimônio, **When** acessa a seção, **Then** o componente exibe estado explicativo informativo convidando à continuidade do uso para geração da série histórica.

---

### Edge Cases

- **Primeiro mês de uso da pessoa usuária (sem histórico prévio)**: O gráfico multi-mês deve renderizar o ponto do mês único como base sólida de partida, exibindo indicação sutil de que os próximos meses alimentarão a curva de subida, sem falhas de renderização no Recharts por falta de múltiplos pontos no eixo X.
- **Competências intercaladas sem lançamentos (meses vazios entre transações)**: Se houver intervalo de meses sem transações (ex.: lançamentos em Janeiro e depois apenas em Abril), o cálculo acumulado deve manter linha horizontal plana constante (sustentando o saldo acumulado anterior), sem quedas abruptas para zero.
- **Histórico com saldo acumulado negativo persistente (déficit acumulado)**: A curva do gráfico combinado deve posicionar-se visualmente abaixo da linha de referência zero (`y = 0`) com preenchimento em tom semântico de alerta/rose suave, mantendo perfeita legibilidade da grade e dos eixos.
- **Dispositivos com preferência de movimento reduzido (`prefers-reduced-motion`)**: As animações de transição numérica, o desenho progressivo das curvas e os gradientes luminosos devem estabilizar-se instantaneamente, respeitando as diretrizes de acessibilidade e conforto visual.
- **Telas muito estreitas em smartphones (320px a 375px)**: Os seletores de período (6M, 12M, Tudo) e os alternadores de modo (Diário/Acumulado) devem quebrar em linhas ou scroll horizontal suave com áreas de toque adequadas (mínimo de 44px de altura utilizável), sem provocar rolagem horizontal na página.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer um componente de gráfico combinado histórico multi-mês no dashboard principal (`ComposedChart`), exibindo barras mensais para receitas e despesas primárias e linha/área suave contínua (`monotone`) para o saldo financeiro acumulado.
- **FR-002**: O gráfico histórico multi-mês DEVE disponibilizar seletores de período configuráveis (no mínimo "6M", "12M" e "Tudo"), recalculando os pontos e adaptando a escala temporal no cliente sem recarregamento de página.
- **FR-003**: O gráfico histórico DEVE exibir uma linha de referência visual horizontal (`ReferenceLine`) no valor zero (`y = 0`) para delimitar claramente superávit e déficit acumulados.
- **FR-004**: Quando o perfil financeiro do usuário contiver renda declarada e metas ativas, o gráfico histórico DEVE traçar uma linha de referência visual pontilhada com a meta calculada de reserva de emergência, permitindo visualizar a ascensão do saldo em direção ao objetivo.
- **FR-005**: O card de fluxo do período (`PeriodCashflowCard`) DEVE disponibilizar um alternador no cabeçalho entre o modo "Diário" (barras por data) e o modo "Acumulado" (área contínua que evidencia as variações e a curva de saldo no decorrer dos dias do mês).
- **FR-006**: As barras do gráfico de fluxo financeiro DEVEM aplicar gradiente vertical suave e respeitar um limite de largura máxima (`maxBarSize: 28`) para evitar barras desproporcionais em períodos com poucos registros.
- **FR-007**: O tooltip flutuante do fluxo do período DEVE discriminar o saldo líquido do ponto em análise (`receitas - despesas - faturas`), com sinalização explícita de superávit ou déficit.
- **FR-008**: O gráfico de rosca de categorias (`DonutChart`) DEVE implementar cantos arredondados nas fatias (`cornerRadius`) e destaque com expansão radial suave no elemento em foco (hover ou toque ativo).
- **FR-009**: Os cartões de métricas principais (`MetricCard` e `MetricCardsGrid`) DEVEM exibir selos de variação percentual mês a mês (MoM) com semântica financeira adequada (inversão semântica para despesas) e mini sparklines visuais de tendência.
- **FR-010**: A página de contas (`/accounts`) DEVE incluir uma barra proporcional segmentada horizontal de alocação de patrimônio líquido por tipo de conta, com indicação percentual e cores canônicas.
- **FR-011**: O sistema DEVE ativar a exibição de séries temporais financeiras para evolução patrimonial utilizando o componente existente de séries temporais baseado em TradingView Lightweight Charts integrado ao tema ativo.
- **FR-012**: O agrupamento e consolidação dos dados históricos multi-mês DEVE ser realizado sem invocar endpoints analíticos de inteligência artificial em loop, reutilizando as fontes de dados de transações e contas para garantir tempo de resposta imediato e custo zero no servidor.
- **FR-013**: Todas as novas visualizações e refinamentos DEVEM adaptar-se automaticamente aos modos claro e escuro (`next-themes`) e respeitar a preferência do usuário para movimento reduzido (`prefers-reduced-motion`).

### Key Entities

- **Ponto Consolidado Multi-Mês**: Entidade que representa uma competência mensal agregada, contendo identificador de competência (`YYYY-MM`), rótulo amigável (ex.: `Out/26`), montante total de receitas, montante total de despesas primárias, montante de quitação de faturas, saldo líquido do mês e saldo acumulado consolidado até aquele ponto.
- **Série Temporal de Caixa Diário Acumulado**: Conjunto cronológico de dias do mês selecionado contendo a data formatada, movimentações do dia e a curva contínua do saldo de caixa evoluindo dia a dia.
- **Indicador de Tendência MoM**: Métrica comparativa calculada entre o mês vigente e o mês imediatamente anterior, expressa em percentual de variação, direção da tendência (alta, queda, estável) e cor semântica financeira associada.
- **Segmento de Alocação Patrimonial**: Representação proporcional de uma classe de conta (Corrente, Investimentos, Dinheiro, Cartão) contendo valor consolidado, percentual sobre o patrimônio total e cor canônica de identificação.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos usuários conseguem identificar visualmente em menos de 3 segundos se o saldo financeiro acumulado está em trajetória ascendente (subida) ou descendente através do gráfico histórico consolidado.
- **SC-002**: A alternância entre os intervalos de tempo (6M, 12M, Tudo) e entre os modos do fluxo (Diário vs. Acumulado) atualiza a interface em menos de 300ms sem travamentos de renderização.
- **SC-003**: 100% dos gráficos e cartões refinados mantêm contraste legível e proporções visuais consistentes nos modos claro e escuro em telas de 320px até mais de 1440px.
- **SC-004**: Nenhuma chamada em loop para geração de parecer de IA é disparada durante a construção dos históricos multi-mês, preservando cota e garantindo performance instantânea no cliente.
- **SC-005**: 100% dos testes unitários e de integração existentes no projeto permanecem aprovados após as alterações visuais, acompanhados por novos testes automatizados para as novas funções de agregação histórica e componentes gráficos.

## Assumptions

- **Aproveitamento de stack e bibliotecas vigentes**: O projeto continuará utilizando exclusivamente as bibliotecas já homologadas no `package.json` (`recharts`, `lightweight-charts`, `motion`, `@number-flow/react`, `lucide-react`, Tailwind CSS v4), sem introdução de novas dependências externas.
- **Consolidação de dados no cliente e compatibilidade de API**: A agregação multi-mês será calculada a partir do histórico de transações obtido pela listagem de transações existente ou parâmetros de intervalo suportados, evitando a necessidade de alterações complexas ou quebras de contrato com o backend.
- **Preservação das diretrizes da Spec 013**: O layout em Bento Grid do dashboard, as cores canônicas oficiais das 11 categorias e o design limpo e minimalista permanecem integralmente preservados, servindo de base para os novos refinamentos estéticos.
- **Localização**: Todas as formatações monetárias, percentuais e rotas de datas seguem estritamente o padrão brasileiro (BRL `R$ 0,00`, percentuais `0,0%` e datas `DD/MM` ou `Mês/Ano`).
