# Feature Specification: Dashboard Financeiro com Métricas Consolidadas, Gráfico de Categorias e Parecer Analítico por IA

**Feature Branch**: `003-dashboard-metrics-analysis`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "Criar tela de dashboard com métricas consolidadas (receitas, despesas, saldo, taxa de poupança), gráfico de distribuição de categorias e parecer analítico mensal em Markdown via GET /api/analysis"

## Clarifications

### Session 2026-10-19

- Q: Como a taxa de poupança deve ser exibida visualmente nos meses em que as despesas totais superam as receitas totais (saldo negativo no período)? (FR-005) → A: Fixar a taxa visualmente em 0% e exibir um badge/indicador textual de alerta ("Sem poupança / Déficit orçamentário"), garantindo consistência visual e clareza de que não houve acúmulo de capital no período.
- Q: Ao clicar em uma fatia do gráfico de categorias ou em um item da legenda, qual deve ser o comportamento de navegação do sistema? (FR-007) → A: Redirecionamento por drill-down: ao clicar na fatia ou no item da legenda, o usuário é encaminhado para a tela de transações com a competência e a categoria pré-filtradas na URL (`/transactions?month=YYYY-MM&category=<Categoria>`).
- Q: Quando o usuário clica no botão para reprocessar manualmente a análise do mês ("Atualizar Parecer"), como o sistema deve solicitar o recálculo ao backend? (FR-011) → A: Requisição direta via `GET /api/analysis/:month?forceRefresh=true` com invalidação e refetch imediato no TanStack Query, instruindo o backend a recalcular e renovar o parecer por IA ignorando o cache prévio.
- Q: No gráfico de distribuição de categorias, quando o usuário possuir despesas distribuídas em mais de 5 categorias distintas no mês, como as fatias devem ser exibidas visualmente? (FR-006) → A: Exibição completa: todas as categorias que possuírem despesa acumulada maior que zero no mês são renderizadas diretamente no gráfico de rosca com cores distintas e harmonizadas, garantindo granularidade total sem agrupamentos artificiais.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualização de Métricas Financeiras Consolidadas (Priority: P1)

Como uma pessoa usuária autenticada na plataforma, desejo visualizar imediatamente na tela principal do dashboard os indicadores essenciais do mês (receitas totais, despesas totais, saldo líquido e taxa de poupança), para que eu tenha uma visão instantânea e clara da minha saúde financeira no período.

**Why this priority**: Constitui o núcleo de valor analítico do produto. Antes de explorar gráficos detalhados ou laudos textuais profundos, o usuário precisa ter clareza numérica imediata sobre quanto ganhou, quanto gastou e qual o resultado financeiro líquido do mês.

**Independent Test**: Pode ser testado de forma autônoma acessando a página `/dashboard` com uma conta contendo transações registradas, verificando a renderização correta dos quatro cartões de métricas (Receitas, Despesas, Saldo Líquido e Taxa de Poupança) com valores monetários em Real (BRL) e percentual correspondente calculados e formatados adequadamente.

**Acceptance Scenarios**:

1. **Given** que o usuário autenticado acessa a tela de dashboard, **When** os dados do mês corrente são carregados, **Then** a interface apresenta 4 cartões de indicadores em destaque: Receitas Totais (destaque positivo/verde), Despesas Totais (destaque de saída), Saldo Líquido (valor resultante com indicação positiva ou negativa) e Taxa de Poupança (percentual de economia do período).
2. **Given** que o saldo líquido do mês é positivo, **When** o cartão de Saldo Líquido é exibido, **Then** o sistema exibe o valor formatado com sinal positivo e coloração indicativa de superávit.
3. **Given** que o saldo líquido do mês é negativo (despesas superam receitas), **When** o cartão de Saldo Líquido é exibido, **Then** o sistema exibe o valor com sinal negativo e coloração indicativa de déficit/alerta.
4. **Given** um mês em que as receitas totais sejam zero ou em que as despesas totais superem as receitas totais (saldo negativo), **When** a taxa de poupança é apresentada no cartão de indicadores, **Then** o sistema exibe 0% acompanhado de um indicador/badge de alerta ("Sem poupança / Déficit orçamentário"), evitando divisões por zero ou percentuais negativos anômalos.
5. **Given** que a requisição de métricas está em andamento, **When** a página está sendo carregada, **Then** os cartões de métricas exibem animação de carregamento (skeletons) preservando o layout sem saltos visuais.

---

### User Story 2 - Gráfico Interativo de Distribuição de Categorias (Priority: P2)

Como uma pessoa usuária, desejo visualizar a divisão das minhas despesas do mês por categoria em um gráfico interativo com percentuais e valores, para que eu identifique facilmente quais áreas do meu orçamento concentram os maiores gastos.

**Why this priority**: Proporciona compreensão visual rápida do comportamento de consumo sem exigir que o usuário analise linha por linha de suas movimentações bancárias.

**Independent Test**: Pode ser testado acessando o dashboard em um mês com transações categorizadas, interagindo com o gráfico de distribuição de categorias (passando o cursor ou tocando nos segmentos/fatias) e validando que o tooltip e a legenda apresentam as categorias canônicas corretas, os valores consolidados e os percentuais relativos calculados.

**Acceptance Scenarios**:

1. **Given** um mês com despesas distribuídas em categorias canônicas (ex: Moradia, Alimentação, Transporte), **When** a seção de gráfico de categorias é renderizada, **Then** a interface exibe um gráfico interativo em formato de rosca/pizza com cores distintas por categoria e legenda lateral/inferior informativa.
2. **Given** o gráfico de distribuição de categorias na tela, **When** o usuário passa o cursor ou toca sobre uma categoria ou fatia do gráfico, **Then** um tooltip contextual exibe o nome da categoria, o valor total gasto formatado em BRL e o percentual correspondente em relação ao total de despesas.
3. **Given** um mês em que não há despesas registradas, **When** o bloco do gráfico é carregado, **Then** a interface exibe um estado vazio ilustrado e amigável informando a inexistência de despesas no período e incentivando a adição/importação de movimentações.
4. **Given** um mês com despesas distribuídas em múltiplas categorias (inclusive mais de 5), **When** o gráfico organiza as fatias, **Then** todas as categorias com despesa acumulada maior que zero são exibidas diretamente no gráfico de rosca em ordem decrescente de valor com cores distintas e harmonizadas, garantindo legibilidade e granularidade total.
5. **Given** o gráfico de distribuição de categorias ou sua legenda, **When** o usuário clica sobre uma fatia específica ou sobre um item da legenda, **Then** o sistema realiza a navegação para `/transactions?month=YYYY-MM&category=<NomeDaCategoria>`, aplicando imediatamente os filtros de competência e categoria para auditoria das transações correspondentes.

---

### User Story 3 - Parecer Analítico Mensal por IA em Markdown com Resiliência BYOK (Priority: P3)

Como uma pessoa usuária, desejo ler um parecer analítico inteligente e estruturado sobre o meu mês financeiro com diagnósticos e recomendações práticas em texto formatado (Markdown), para compreender os motivos dos meus resultados e receber orientações claras de melhoria financeira.

**Why this priority**: É o grande diferencial de inteligência do produto em relação a planilhas convencionais, transformando dados quantitativos em conselhos práticos e inteligíveis através de IA.

**Independent Test**: Pode ser testado acessando o dashboard com um usuário que possui chave de IA configurada (`hasAiKey: true`), verificando a renderização rica do parecer em Markdown (títulos, listas, destaques) e as recomendações destacadas; e alternativamente com um usuário sem chave configurada (`hasAiKey: false`), confirmando a apresentação do aviso amigável de ativação com botão para o modal BYOK.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado com chave de IA configurada (`hasAiKey: true`), **When** os dados analíticos do mês são obtidos de `GET /api/analysis/:month`, **Then** a seção "Parecer do Especialista" exibe o texto analítico gerado (`diagnosis`) devidamente renderizado em Markdown com hierarquia tipográfica (títulos, parágrafos, listas de tópicos e destaques em negrito).
2. **Given** a análise carregada com sucesso, **When** o parecer inclui recomendações financeiras (`recommendations`), **Then** a interface exibe uma seção ou lista em destaque contendo cada uma das recomendações práticas para o usuário.
3. **Given** que a análise foi recuperada a partir do cache do backend (`cached: true`), **When** o parecer é visualizado, **Then** a interface exibe um indicador sutil de status de cache com data de expiração/geração e disponibiliza um botão "Recalcular Diagnóstico" que dispara `GET /api/analysis/:month?forceRefresh=true` para obter uma nova análise atualizada.
4. **Given** um usuário que ainda não configurou sua chave de API pessoal (`hasAiKey: false`), **When** o dashboard carrega a seção de diagnóstico de IA, **Then** os indicadores e o gráfico de categorias são exibidos normalmente, enquanto a área do parecer exibe um card acolhedor explicando o benefício da análise de IA e um botão de ação rápida "Configurar Chave de IA" que abre o modal de cadastro BYOK.
5. **Given** um cenário em que a chamada de análise via IA falhe temporariamente por taxa limite (`429`) ou sobrecarga upstream (`503`), **When** o erro é capturado, **Then** a interface não quebra e exibe uma mensagem informativa no bloco do parecer com botão para tentar novamente.

---

### User Story 4 - Navegação por Competência Mensal e Sincronização Reativa (Priority: P4)

Como uma pessoa usuária, desejo navegar entre diferentes meses e anos através de um seletor de competência no topo do dashboard, para que eu possa auditar históricos passados e comparar minha evolução mês a mês.

**Why this priority**: Permite que o usuário não fique limitado apenas ao mês atual, viabilizando planejamento financeiro contínuo e histórico.

**Independent Test**: Pode ser testado alterando o mês no seletor de competência de `2026-10` para `2026-09`, observando a transição de estado, a atualização sincronizada dos quatro cartões de métricas, do gráfico de categorias e do parecer analítico referente à nova competência selecionada.

**Acceptance Scenarios**:

1. **Given** a visualização do dashboard, **When** o usuário acessa a página, **Then** o seletor de competência inicializa por padrão com o mês e ano correntes no formato `YYYY-MM`.
2. **Given** o seletor de competência ativo, **When** o usuário seleciona um mês diferente (ex: mês anterior através de controles de navegação ou menu suspenso), **Then** o sistema dispara a consulta reativa para a nova competência (`GET /api/analysis/:month`), atualizando instantaneamente os dados de métricas, distribuição e diagnóstico.
3. **Given** que uma nova transação foi importada ou categorizada recentemente na tela de transações, **When** o usuário retorna ao dashboard, **Then** a camada de dados invalida o cache stale e recarrega os dados atualizados para o mês ativo.

---

### Edge Cases

- O que acontece se o usuário não possuir nenhuma transação no mês selecionado? O dashboard exibe métricas zeradas (R$ 0,00 de receitas e despesas), taxa de poupança em 0%, estado vazio ilustrado no gráfico de categorias com mensagem "Nenhuma movimentação neste mês" e orientação para cadastrar ou importar extratos.
- O que acontece quando as despesas superam as receitas no mês (déficit)? O cartão de Saldo Líquido exibe o valor negativo em vermelho/alerta e o cartão de Taxa de Poupança fixa em 0% com badge "Sem poupança / Déficit orçamentário".
- O que acontece se todas as despesas estiverem marcadas como "Não Categorizado"? O gráfico de distribuição exibirá 100% alocado em "Não Categorizado", com um alerta amigável sugerindo a categorização das transações para refinar a análise.
- O que acontece se o endpoint `GET /api/analysis` retornar erro `403` decorrente de token expirado? O sistema intercepta o erro globalmente, encerra a sessão com segurança e redireciona o usuário para a tela de login.
- O que acontece se o backend retornar um parecer vazio ou campo `diagnosis` ausente? A interface trata a ausência exibindo um placeholder "Diagnóstico indisponível para este período" sem quebrar a renderização da árvore de componentes.
- O que acontece se o usuário estiver em conexão instável ou lenta? Indicadores de carregamento (esqueletos/skeletons) permanecem ativos com timeout de resiliência e botão "Tentar novamente" em caso de falha de rede.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar uma rota protegida de dashboard (`/dashboard`) acessível apenas para usuários autenticados.
- **FR-002**: O sistema DEVE fornecer um seletor de competência mensal no topo da página de dashboard, inicializando com o mês atual no formato canônico `YYYY-MM`.
- **FR-003**: O sistema DEVE permitir a navegação entre meses (mês anterior, próximo mês ou escolha direta de competência), mantendo o estado sincronizado.
- **FR-004**: O sistema DEVE consumir o endpoint canônico `GET /api/analysis/:month` (onde `:month` é a competência no formato `YYYY-MM`), passando o token de autenticação no cabeçalho `Authorization: Bearer <token>`.
- **FR-005**: O sistema DEVE exibir 4 cartões de indicadores financeiros consolidados no dashboard:
  - **Receitas Totais**: soma consolidada de entradas no mês, formatada em Real (BRL) e com indicação visual positiva (verde).
  - **Despesas Totais**: soma consolidada de saídas no mês, formatada em Real (BRL) com destaque visual de despesa.
  - **Saldo Líquido**: diferença calculada entre receitas e despesas, com sinal explícito (+ ou -) e coloração dinâmica (verde para superávit, vermelho/alerta para déficit).
  - **Taxa de Poupança**: percentual calculado de economia (`savingsRate`), fixando visualmente em 0% acompanhado de indicador/badge de alerta ("Sem poupança / Déficit orçamentário") sempre que as despesas superarem as receitas ou quando as receitas forem zero, evitando números negativos ou divisões por zero.
- **FR-006**: O sistema DEVE exibir um gráfico de distribuição de categorias de despesas (`topCategories`), renderizando todas as categorias com despesa ativa (> R$ 0) em fatias com cores distintas harmonizadas com o tema visual e ordenadas de forma decrescente por volume financeiro.
- **FR-007**: O gráfico de distribuição DEVE ser interativo, exibindo tooltip com o nome da categoria, o montante em BRL e o percentual relativo ao total de despesas ao passar o cursor ou tocar na fatia; e ao clicar sobre uma fatia ou item da legenda, o sistema DEVE navegar para a rota de transações com os filtros de mês e categoria aplicados (`/transactions?month=YYYY-MM&category=<Categoria>`) para auditoria detalhada (*drill-down*).
- **FR-008**: O sistema DEVE exibir uma legenda descritiva de categorias identificada por cores harmonizadas com o tema visual ativo (dark ou light).
- **FR-009**: O sistema DEVE renderizar o parecer analítico mensal (`diagnosis`) na íntegra utilizando suporte a Markdown seguro (sanitizado contra injeções de script), garantindo renderização rica de títulos, listas, parágrafos e ênfases.
- **FR-010**: O sistema DEVE apresentar a lista de recomendações (`recommendations`) retornada pela API em um bloco dedicado e destacado para fácil leitura e consulta.
- **FR-011**: O sistema DEVE exibir o status do cache do parecer analítico (`cached: true/false`), informando a data/hora em que foi gerado e disponibilizando um botão de reprocessamento manual ("Recalcular Diagnóstico") que dispara `GET /api/analysis/:month?forceRefresh=true` com indicador de carregamento (spinner) e invalidação de cache no TanStack Query.
- **FR-012**: O sistema DEVE implementar tratamento de estado BYOK no bloco do parecer analítico:
  - Quando `user.hasAiKey === true`: consome e renderiza o parecer de IA normalmente.
  - Quando `user.hasAiKey === false`: os cards de métricas e o gráfico permanecem plenamente funcionais, mas o bloco do parecer exibe um card educativo informando a necessidade de configurar a chave pessoal de IA, acompanhado de um botão de ação primária que dispara a abertura do modal de configuração de chave BYOK.
- **FR-013**: O sistema DEVE exibir estados visuais de carregamento (skeletons) em todos os blocos do dashboard durante requisições assíncronas.
- **FR-014**: O sistema DEVE tratar graciosamente erros HTTP `429` (limite de requisições excedido) e `503` (serviço upstream de IA sobrecarregado), apresentando avisos contextuais no card analítico sem travar o restante da aplicação.
- **FR-015**: O sistema DEVE utilizar TanStack Query para gerenciar o cache das análises mensais (`['analysis', month]`), permitindo invalidação reativa quando novas transações forem criadas, editadas ou importadas.

### Key Entities *(include if feature involves data)*

- **FinancialMetrics**: Estrutura de métricas financeiras consolidadas do mês contendo `totalIncome` (número monetário), `totalExpenses` (número monetário), `netBalance` (número monetário), `savingsRate` (percentual numérico) e `topCategories` (coleção de categorias e seus percentuais).
- **CategoryMetric**: Métrica individual de despesa por categoria canônica contendo `category` (nome da categoria), `amount` (montante total gasto) e `percentage` (percentual relativo ao total de despesas).
- **FinancialAnalysis**: Entidade completa de parecer analítico retornada pelo backend contendo `cached` (booleano indicando origem de cache), `month` (string no formato `YYYY-MM`), `diagnosis` (texto formatado em Markdown), `recommendations` (lista de recomendações em texto), `metrics` (entidade `FinancialMetrics`), `generatedAt` (timestamp ISO) e `expiresAt` (timestamp ISO).
- **UserAiStatus**: Estado de ativação de inteligência artificial do usuário autenticado (`hasAiKey: boolean`), governando a disponibilidade visual do parecer analítico e as chamadas ao modal BYOK.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O tempo de renderização inicial do dashboard com dados em cache ou após carregamento de rede não ultrapassa 1 segundo em conexões de banda média.
- **SC-002**: 100% dos valores numéricos monetários e percentuais são formatados conforme as convenções brasileiras (`pt-BR`, ex: `R$ 1.250,50` e `25,4%`).
- **SC-003**: 100% dos usuários sem chave de IA configurada conseguem visualizar os cards de métricas e o gráfico de categorias sem bloqueio de tela, com redirecionamento de 1 clique para o modal de configuração de chave de IA.
- **SC-004**: O parecer analítico em Markdown é renderizado de forma totalmente legível e responsiva tanto em telas desktop quanto em dispositivos móveis, sem vazamento horizontal de layout.
- **SC-005**: Cobertura de testes automatizados com Vitest e Testing Library atestando os estados de renderização de métricas, alternância de meses, renderização do parecer em Markdown e fallback BYOK.

## Assumptions

- O usuário já realizou login na aplicação e possui token JWT válido armazenado no estado de sessão.
- O backend disponibiliza o contrato canônico de `GET /api/analysis/:month` (com suporte a `?forceRefresh=true`) conforme tipado em `src/types/api.ts` e na documentação de arquitetura.
- O cálculo da taxa de poupança no backend segue a fórmula `((totalIncome - totalExpenses) / totalIncome) * 100`, com tratamento para casos de renda nula.
- A biblioteca de renderização de Markdown utilizada no frontend sanitizará tags HTML inseguras por padrão para proteger a integridade do DOM do cliente.
- O gráfico de categorias agrupa dados baseados exclusivamente na lista canônica de categorias retornada no atributo `topCategories`.
- A alternância de competência mensal atualiza a rota ou o estado de query do TanStack Query sem requisições desnecessárias para meses já armazenados em cache durante o ciclo de vida da sessão.
