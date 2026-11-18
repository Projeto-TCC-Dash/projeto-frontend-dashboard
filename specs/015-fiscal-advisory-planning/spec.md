# Feature Specification: Módulo Fiscal, Investimentos Dedicados e Planejamento Orçamentário

**Feature Branch**: `015-fiscal-advisory-planning`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "Módulo Fiscal (IRPF, PJ/MEI, OCR de recibos e exportação de dossiê), Orçamentos Mensais por categoria com faixas de alerta, Página dedicada de Carteira de Investimentos com macroclasses e diagnóstico de risco, e Análise Multi-Mês com tendências, adicionando visualizações dedicadas na barra de navegação para o módulo fiscal e para investimentos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Página Dedicada de Planejamento Fiscal na Navegação Principal (Priority: P1) 🎯 MVP

Como uma pessoa usuária pessoa física ou empreendedora (PJ/MEI), desejo acessar uma página dedicada de Planejamento Fiscal diretamente pela barra de navegação principal para organizar minhas despesas dedutíveis do Imposto de Renda ao longo do ano, enviar comprovantes com leitura automática de dados, acompanhar meu faturamento frente ao teto do MEI (quando aplicável) e exportar meu dossiê anual auditável.

**Why this priority**: Centraliza a organização tributária anual em uma área própria e visível na navegação principal, reduzindo o risco de malha fina por comprovantes ausentes e economizando tempo na preparação da declaração anual.

**Independent Test**: Pode ser testada acessando o novo item "Fiscal" na barra de navegação principal, alternando o ano-base, marcando uma transação como dedutível com categoria fiscal e documento do prestador, enviando uma imagem/PDF de recibo para conciliação automática, visualizando o progresso do teto PJ/MEI (para perfis PJ) e acionando o download do dossiê em PDF ou planilha.

**Acceptance Scenarios**:

1. **Given** uma pessoa usuária autenticada em qualquer tela do sistema, **When** observa a barra de navegação principal (desktop e menu móvel), **Then** visualiza um item dedicado para o módulo **Fiscal** que conduz à página exclusiva de Planejamento Fiscal.
2. **Given** o acesso à página de Planejamento Fiscal com ano selecionado (ex.: 2026), **When** os dados anuais são carregados, **Then** exibe o resumo consolidado com o total de despesas dedutíveis, o montante já comprovado documentalmente, o montante pendente de comprovação (com destaque de alerta preventivo) e a distribuição por categoria fiscal (Saúde, Educação, Previdência Complementar PGBL, Pensão Alimentícia Judicial, Livro-Caixa Profissional e Outras Dedutíveis).
3. **Given** a lista de movimentações elegíveis no módulo fiscal, **When** o usuário ativa a marcação de dedutível em um lançamento, seleciona a categoria fiscal, informa CPF ou CNPJ e nome do prestador e define o status documental (`Pendente`, `Confirmado` ou `Isento`), **Then** o sistema persiste a classificação e atualiza imediatamente os totalizadores anuais.
4. **Given** o envio de um arquivo de recibo ou nota fiscal (PDF, PNG ou JPG até 10 MB) na área de envio por arraste ou seleção, **When** a leitura inteligente extrai os dados do comprovante e sugere lançamentos bancários compatíveis com nível de confiança, **Then** o usuário pode vincular e conciliar o lançamento com um clique; caso o usuário não possua chave de IA ativa, o sistema exibe orientação clara para ativação sem travar o restante da tela.
5. **Given** um usuário cujo perfil de renda seja PJ/Autônomo ou Empresário, **When** acessa o Planejamento Fiscal, **Then** visualiza o painel complementar PJ exibindo faturamento bruto acumulado no ano, barra de progresso em relação ao teto referencial do MEI (R$ 81.000,00) com alerta visual a partir de 80%, total de pró-labore e dividendos distribuídos.
6. **Given** a necessidade de compartilhar os dados com um contador ou arquivar registros, **When** o usuário solicita a exportação do Dossiê Fiscal Anual em formato PDF ou planilha, **Then** o arquivo formatado é baixado automaticamente com nome identificador do ano.
7. **Given** qualquer tela ou subfluxo do módulo fiscal, **When** exibido ao usuário, **Then** apresenta de forma permanente e legível o aviso legal obrigatório informando que a ferramenta atua na organização e planejamento financeiro-tributário, não substituindo a escrituração nem o parecer formal de um contador legalmente habilitado.

---

### User Story 2 - Página Dedicada de Carteira de Investimentos na Navegação Principal (Priority: P1) 🎯 MVP

Como uma pessoa usuária acompanhando a construção do meu patrimônio, desejo acessar uma página dedicada de Investimentos diretamente na barra de navegação principal para visualizar a distribuição consolidada da minha carteira por macroclasses de ativos, receber diagnóstico de aderência ao meu perfil de risco, atualizar os saldos alocados e acompanhar minha evolução patrimonial.

**Why this priority**: Separa claramente a gestão cotidiana de contas correntes/cartões da análise estratégica de alocação patrimonial e risco, tornando os insights de investimentos protagonistas em uma experiência exclusiva.

**Independent Test**: Pode ser testada clicando no item "Investimentos" na barra de navegação principal, verificando o gráfico proporcional com as macroclasses de ativos, o card de diagnóstico comparando a alocação com o perfil de risco do usuário e suas recomendações práticas, além do cadastro/atualização de saldo em uma macroclasse com recálculo imediato da carteira.

**Acceptance Scenarios**:

1. **Given** uma pessoa usuária autenticada navegando pela plataforma, **When** observa a barra de navegação principal (desktop e mobile), **Then** encontra o item dedicado **Investimentos** conduzindo à página exclusiva da carteira patrimonial.
2. **Given** posições cadastradas na carteira de investimentos, **When** a página dedicada é aberta, **Then** apresenta o valor total investido, um gráfico proporcional (rosca) combinado a uma lista detalhada com percentuais para as seis macroclasses (Renda Fixa, Ações Brasil, Fundos Imobiliários, Liquidez e Reserva de Emergência, Investimentos Internacionais e Criptoativos).
3. **Given** o perfil de risco configurado pelo usuário (Conservador, Moderado ou Agressivo), **When** o diagnóstico da carteira é exibido, **Then** indica visualmente se a alocação atual está aderente ao perfil ou requer rebalanceamento, apresentando a lista de recomendações consultivas personalizadas.
4. **Given** o desejo de registrar ou ajustar o montante de uma macroclasse em uma conta específica, **When** o usuário preenche o formulário de atualização de posição (conta vinculada, macroclasse, valor e observação opcional) e salva, **Then** a distribuição percentual, o patrimônio total e o diagnóstico de risco são recalculados imediatamente.
5. **Given** a ausência de posições registradas ou de perfil de risco definido, **When** o usuário visita a página de Investimentos, **Then** visualiza orientação clara convidando ao registro inicial de posições ou à definição de seu perfil de investidor, sem exibir valores fictícios.

---

### User Story 3 - Planejamento e Acompanhamento de Orçamentos Mensais (Priority: P2)

Como uma pessoa usuária controlando meus gastos mensais, desejo definir limites financeiros para o orçamento global do mês e para cada categoria de despesa, visualizando barras de progresso coloridas conforme o nível de consumo em tempo real, para evitar estouros antes do fechamento do mês.

**Why this priority**: Transforma o painel de acompanhamento passivo em uma ferramenta proativa de controle orçamentário, alertando visualmente quando categorias críticas se aproximam ou ultrapassam o limite planejado.

**Independent Test**: Pode ser testada acessando o widget "Orçamentos do Mês" no painel principal, configurando um teto global e limites por categoria no modal de edição, e verificando a atualização das barras de consumo com suas cores semânticas (verde abaixo de 70%, amarelo/laranja entre 70% e 99,9%, vermelho a partir de 100%), sem dupla contagem de pagamentos de fatura.

**Acceptance Scenarios**:

1. **Given** o painel principal no mês de competência selecionado com orçamento configurado, **When** o bloco "Orçamentos do Mês" é exibido, **Then** apresenta o limite global definido, o valor já gasto, o percentual consumido e barras individuais por categoria com faixa de status visual: Regular (verde, abaixo de 70%), Atenção (amarelo/âmbar, de 70% a 99,9%) e Excedido (vermelho, igual ou superior a 100%).
2. **Given** um mês com quitações de fatura de cartão registradas, **When** o consumo orçamentário é exibido, **Then** reflete apenas o consumo real primário sem somar duplamente os pagamentos de fatura.
3. **Given** a necessidade de criar ou ajustar os limites do mês vigente, **When** o usuário aciona a edição do orçamento, define o limite total e os tetos por categoria e salva, **Then** os novos limites e os percentuais de consumo são imediatamente recalculados e exibidos.
4. **Given** um mês sem plano orçamentário definido, **When** o bloco é renderizado, **Then** exibe estado convidativo claro com botão para definir o orçamento daquele mês em poucos passos.

---

### User Story 4 - Análise Multi-Mês Consolidada e Sinergia Contextual com o Consultor (Priority: P3)

Como uma pessoa usuária analisando tendências de médio e longo prazo, desejo visualizar indicadores agregados de múltiplos meses (janelas de 3, 6 e 12 meses) com média de taxa de poupança, média de gastos e tendência dos custos fixos, bem como contar com sugestões contextualizadas no consultor financeiro caso haja alertas orçamentários ou metas tributárias.

**Why this priority**: Complementa o gráfico histórico visual já existente com métricas consolidadas de tendência de custos fixos e fortalece a coerência entre os alertas visuais do painel e os conselhos do assistente virtual.

**Independent Test**: Pode ser testada alternando o seletor de janela temporal (3M, 6M, 12M) na visualização histórica do painel e verificando a exibição da taxa média de poupança, da média mensal de despesas e do indicador de tendência de custos fixos (Estável, Em Alta ou Em Queda), além de acionar sugestões rápidas no consultor virtual.

**Acceptance Scenarios**:

1. **Given** a seção de evolução histórica no painel financeiro, **When** o usuário consulta os períodos de 3, 6 ou 12 meses, **Then** visualiza, além da série mês a mês de receitas, despesas e poupança, os indicadores resumidos de taxa média de poupança, média mensal de despesas e status de tendência dos custos fixos (Estável, Em Alta com categoria de alerta, ou Em Queda).
2. **Given** uma categoria com orçamento em estado de Atenção ou Excedido no mês corrente, **When** o usuário abre o Consultor Financeiro virtual, **Then** encontra sugestões contextuais pertinentes ao controle orçamentário, planejamento fiscal ou rebalanceamento de investimentos para iniciar a conversa com um clique.

---

### Edge Cases

- **Envio de comprovante fiscal sem chave de IA configurada**: Se o usuário tentar usar a leitura automática de recibo (OCR) sem ter sua chave pessoal de IA ativada, o sistema deve impedir a perda do contexto, explicar claramente o motivo e oferecer acesso direto ao modal/configuração da chave sem bloquear a classificação manual de despesas dedutíveis.
- **Documento fiscal inválido no preenchimento manual**: Ao informar CPF ou CNPJ do prestador na classificação fiscal de uma despesa, formatos diferentes de 11 dígitos (CPF) ou 14 dígitos (CNPJ) devem ser validados com mensagem clara antes do envio.
- **Arquivo de recibo fora do padrão**: Arquivos maiores que 10 MB ou em formatos diferentes de PDF, PNG ou JPG devem ser rejeitados no cliente com aviso explicativo antes de consumir banda ou tentar processar.
- **Conciliação de recibo sem correspondência automática**: Caso o recibo enviado não corresponda a nenhuma transação bancária recente (lista de sugestões vazia), o usuário deve visualizar os dados extraídos do documento com orientação para revisar seus extratos ou classificar manualmente o lançamento correspondente.
- **Usuário CLT acessando o módulo Fiscal**: Para regimes não-PJ (como CLT ou Servidor Público), o painel específico de teto do MEI/PJ deve permanecer oculto ou claramente marcado como não aplicável, mantendo a tela limpa e focada nas deduções de Pessoa Física.
- **Orçamento com soma das categorias superior ao teto global**: O formulário de criação/edição de orçamento deve alertar visualmente o usuário caso a soma dos limites individuais das categorias ultrapasse o limite global informado, mantendo validação transparente de valores positivos.
- **Meses sem histórico suficiente na análise multi-mês**: Quando o usuário possuir menos meses de histórico do que a janela selecionada (ex.: 2 meses em janela de 12M), os indicadores médios e tendências devem ser exibidos sem falhas ou divisões por zero.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A barra de navegação principal (desktop e dispositivos móveis) DEVE incorporar dois novos destinos dedicados e acessíveis: **Fiscal** (Planejamento Fiscal) e **Investimentos** (Carteira de Investimentos), preservando a fluidez e a responsividade em todas as larguras de tela.
- **FR-002**: A página de Planejamento Fiscal DEVE permitir a seleção do ano-base de apuração e exibir um resumo consolidado com: total de despesas dedutíveis, total já comprovado documentalmente, total pendente de comprovação e detalhamento agrupado pelas 6 categorias fiscais oficiais (Saúde, Educação, Previdência Complementar, Pensão Alimentícia, Despesas de Livro-Caixa e Outras Dedutíveis).
- **FR-003**: O usuário DEVE poder classificar ou editar o enquadramento fiscal de transações elegíveis, informando obrigatoriamente se é dedutível, a categoria fiscal, o status documental (`Pendente`, `Confirmado` ou `Isento`) e, opcionalmente, o CPF/CNPJ (11 ou 14 dígitos numéricos), nome do prestador, valor dedutível e observações.
- **FR-004**: A página de Planejamento Fiscal DEVE disponibilizar uma área de envio de comprovantes (PDF, PNG ou JPG de até 10 MB) com extração inteligente de dados (OCR) e exibição das transações bancárias sugeridas para conciliação com indicação de nível de confiança (Alta, Média ou Baixa), permitindo vincular com um clique.
- **FR-005**: Quando o serviço de leitura inteligente de recibos exigir chave pessoal de IA e o usuário ainda não a tiver configurado, o sistema DEVE apresentar estado informativo com botão de ativação da chave sem prejudicar o funcionamento das demais funções fiscais manuais.
- **FR-006**: Para usuários com perfil de renda compatível com Pessoa Jurídica/Autônomo ou Empresário, a página de Planejamento Fiscal DEVE exibir o painel PJ contendo faturamento bruto acumulado no ano, percentual e barra de progresso frente ao teto referencial anual do MEI (R$ 81.000,00) com alerta visual a partir de 80%, além dos totais de pró-labore e dividendos.
- **FR-007**: A página de Planejamento Fiscal DEVE permitir o download do Dossiê Fiscal Anual completo nos formatos PDF e planilha (XLSX), exibindo feedback de progresso durante a geração do arquivo.
- **FR-008**: Todas as visualizações da página de Planejamento Fiscal DEVEM exibir de forma permanente e destacada o aviso legal obrigatório: *"AVISO LEGAL: Esta ferramenta atua na organização e planejamento financeiro-tributário, não substituindo a escrituração nem o parecer formal de um contador legalmente habilitado."*
- **FR-009**: A página dedicada de Investimentos DEVE exibir o patrimônio total investido, um gráfico proporcional (rosca) combinado à listagem detalhada das 6 macroclasses de ativos (Renda Fixa, Ações Brasil, Fundos Imobiliários, Liquidez/Reserva, Internacional e Criptoativos) e um painel de diagnóstico consultivo indicando a aderência ao perfil de risco e as recomendações estratégicas geradas pelo sistema.
- **FR-010**: A página dedicada de Investimentos DEVE permitir cadastrar ou atualizar o valor alocado em qualquer macroclasse vinculada a uma conta do usuário, recalculando imediatamente a composição da carteira e os diagnósticos.
- **FR-011**: O painel financeiro principal DEVE incorporar o widget "Orçamentos do Mês" exibindo o consumo frente ao limite global e os limites individuais por categoria para a competência selecionada, utilizando codificação visual por cores para os estados Regular (`< 70%`), Atenção (`70% a 99,9%`) e Excedido (`≥ 100%`).
- **FR-012**: O widget de orçamentos DEVE disponibilizar fluxo modal ou formulário inline para criar ou atualizar o plano orçamentário do mês (teto global e limites por categoria), validando valores positivos maiores que zero.
- **FR-013**: A visualização histórica multi-mês do painel principal DEVE suportar as janelas de análise de 3, 6 e 12 meses e exibir os indicadores agregados de taxa média de poupança, média mensal de despesas e status de tendência dos custos fixos (Estável, Em Alta ou Em Queda).
- **FR-014**: Todos os novos módulos, gráficos, tabelas e modais DEVEM seguir a estética minimalista vigente, adaptar-se automaticamente aos temas claro e escuro, funcionar sem quebras entre 320px e 1440px+ e manter conformidade estrita de acessibilidade e movimento reduzido.

### Key Entities

- **Classificação Fiscal de Transação**: Enquadramento tributário associado a um lançamento de despesa contendo indicador de dedutibilidade, categoria fiscal (Saúde, Educação, Previdência, Pensão, Livro-Caixa ou Outras), documento do prestador (CPF/CNPJ), nome do prestador, valor dedutível, status de comprovação (`Pendente`, `Confirmado`, `Isento`) e notas.
- **Resumo Fiscal Anual**: Consolidação por ano-base contendo totais dedutíveis (geral, confirmado e pendente), distribuição por categoria fiscal e indicadores opcionais de faturamento PJ/MEI (receita bruta acumulada, percentual do teto de R$ 81.000,00, pró-labore e dividendos).
- **Comprovante Extraído (OCR)**: Resultado do processamento de um recibo ou nota contendo identificador do documento, dados extraídos (documento, prestador, valor, data de emissão e descrição) e lista de sugestões de transações bancárias compatíveis com grau de confiança.
- **Plano Orçamentário Mensal**: Orçamento da competência (`YYYY-MM`) composto por teto global, gasto consolidado, percentual consumido, status global (`Regular`, `Atenção`, `Excedido`) e detalhamento equivalente por categoria de despesa.
- **Posição e Carteira de Investimentos**: Consolidação patrimonial composta pelo total investido, perfil de risco do investidor, indicador de aderência, lista de recomendações e posições por macroclasse de ativo (Renda Fixa, Ações, FIIs, Liquidez, Internacional, Cripto) com valor, percentual e conta associada.
- **Resumo Histórico Multi-Mês**: Agregação em janelas de 3, 6 ou 12 meses contendo série mensal de receitas/despesas/poupança, média de taxa de poupança, média de gastos e tendência dos custos fixos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos usuários autenticados conseguem navegar diretamente pelo menu principal para as páginas dedicadas de **Fiscal** e **Investimentos** em 1 clique/toque, tanto em desktop quanto em dispositivos móveis.
- **SC-002**: Usuários conseguem classificar uma despesa como dedutível do IRPF ou conciliar um comprovante via OCR com a transação correspondente em menos de 30 segundos, vendo os totalizadores anuais atualizados imediatamente.
- **SC-003**: Usuários com perfil PJ visualizam instantaneamente o percentual consumido do teto anual de referência do MEI com alerta visual claro ao atingir ou superar 80% do limite.
- **SC-004**: 100% dos usuários conseguem definir ou editar tetos de orçamento mensal por categoria e identificar visualmente em menos de 2 segundos quais categorias estão regulares (verde), em atenção (amarelo) ou excedidas (vermelho).
- **SC-005**: Usuários visualizam na página dedicada de Investimentos a distribuição completa das 6 macroclasses de ativos e o diagnóstico de aderência ao perfil de risco, conseguindo atualizar uma posição em menos de 20 segundos.
- **SC-006**: 100% das telas fiscais mantêm visível o aviso legal obrigatório em modos claro e escuro e em qualquer resolução de tela entre 320px e 1440px+.

## Assumptions

- **Alinhamento de contratos com o backend**: A especificação assume os recursos já disponíveis no servidor de backend do projeto (`/home/debhg/Projetos/projeto-backend-dashboard`), incluindo eventuais ajustes de compatibilidade de nomes de campos entre a documentação resumo e o esquema real implementado no servidor (a serem mapeados na fase de planejamento técnico).
- **Preservação de rotas e navegação existentes**: As rotas já existentes (Dashboard, Contas, Extratos, Metas e Consultor) continuam íntegras; as novas páginas de **Fiscal** e **Investimentos** somam-se à barra de navegação mantendo o padrão responsivo da aplicação.
- **Reaproveitamento da base visual**: As visualizações de gráficos e progresso reutilizam a biblioteca de componentes visuais e tokens semânticos vigentes (padronizados na Spec 013 e Spec 014) sem alteração disruptiva da identidade minimalista.
- **Fluxo BYOK transparente**: O recurso de OCR de recibos fiscais respeita o mesmo modelo de chave pessoal de IA (BYOK) já adotado pelo diagnóstico e categorização automática da plataforma.
