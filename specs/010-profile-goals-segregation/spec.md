# Feature Specification: Segregação de Metas Financeiras e Central de Perfil de Usuário

**Feature Branch**: `feature/010-profile-goals-segregation`

**Created**: 2026-10-24

**Status**: Draft

**Input**: User description: "eu gostaria de alterar a parte de editar perfil. Quero que a aba de perfil e metas seja somente para traçar meta, e que toda a parte de alteração de perfil fique para quando o usuario clicar no seu nome/email. Ajeitar também a parte de foto de perfil, quero que fique junto com a abade informacao de identidade, entao quando salva alteracao, que salve a foto e a alteracao do nome junto. A aba de segurança e sessao e central de exportacao devera ir para a aba de perfil separada também."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ponto de Entrada Exclusivo para Metas e Perfil Financeiro (Priority: P1) 🎯 MVP

Como uma pessoa usuária focada em sua gestão financeira pessoal, desejo acessar uma seção exclusiva de "Metas e Perfil Financeiro" pelo menu lateral do dashboard, sem a presença de formulários de dados cadastrais, uploads de avatar ou configurações de conta, para que eu possa planejar meus objetivos de reserva, perfil de risco e metas de curto, médio e longo prazo com foco e clareza.

**Why this priority**: Elimina a confusão cognitiva gerada pela mistura de configurações de identidade do usuário com o planejamento financeiro, garantindo que o fluxo principal de finanças seja direto e coeso.

**Independent Test**: Pode ser testado clicando no item "Perfil e Metas" no menu lateral de navegação e verificando que a página renderizada exibe unicamente o formulário de metas financeiras (renda mensal, reserva de emergência, perfil de risco e objetivos), sem abas de configurações de conta ou campos de nome/avatar.

**Acceptance Scenarios**:

1. **Given** a barra lateral de navegação do dashboard, **When** o usuário clica no item correspondente a metas ("Perfil e Metas"), **Then** o sistema navega para uma visualização dedicada exclusivamente ao planejamento financeiro e metas patrimoniais.
2. **Given** a página de metas financeiras, **When** o usuário insere ou atualiza sua renda estimada, reserva desejada e objetivos financeiros e confirma, **Then** as metas são persistidas com sucesso e um aviso visual de confirmação é exibido.
3. **Given** a página de metas financeiras, **When** inspecionada visualmente, **Then** não devem constar opções de edição de nome, upload de foto, configurações de segurança/2FA ou central de exportação de dados nesta tela.

---

### User Story 2 - Acesso à Área de Perfil e Conta ao Clicar no Nome/E-mail (Priority: P1) 🎯 MVP

Como uma pessoa usuária autenticada na plataforma, desejo que clicar sobre o meu nome, e-mail ou avatar localizado no cabeçalho superior (barra de navegação) me direcione para a área completa de configurações de perfil e conta, para que eu tenha um ponto de acesso intuitivo e padronizado às minhas preferências de identidade e segurança.

**Why this priority**: Segue as convenções de usabilidade e arquitetura de informação modernas na web, separando naturalmente as operações de conta pessoal do domínio funcional de finanças.

**Independent Test**: Pode ser testado clicando no indicador de usuário no topo da tela (onde constam nome, e-mail e avatar) e verificando que a aplicação abre a tela de perfil de usuário com as abas administrativas da conta.

**Acceptance Scenarios**:

1. **Given** qualquer página do painel logado com o cabeçalho superior visível, **When** o usuário clica no componente de identificação de usuário (avatar, nome ou e-mail), **Then** o sistema navega imediatamente para a área de edição de perfil de usuário.
2. **Given** o componente de identificação no cabeçalho, **When** renderizado, **Then** exibe o avatar atualizado (ou as iniciais do nome) e o identificador do usuário com feedback visual interativo de clique (hover/foco).

---

### User Story 3 - Formulário Unificado de Identidade com Salvamento Conjunto de Nome e Foto (Priority: P1) 🎯 MVP

Como uma pessoa usuária que deseja atualizar suas credenciais visuais e cadastrais, desejo que a seleção da foto de perfil fique integrada à seção de informações de identidade, permitindo que eu altere meu nome de exibição e escolha uma nova foto (ou solicite a exclusão da foto atual) simultaneamente, aplicando ambas as alterações juntas ao clicar em um único botão "Salvar alterações".

**Why this priority**: Evita salvamentos parciais desconectados, simplifica a interface eliminando múltiplos botões redundantes de confirmação e impede o envio desnecessário de arquivos antes que o usuário decida salvar o formulário.

**Independent Test**: Pode ser testado acessando as informações de identidade no perfil, digitando um novo nome, selecionando um novo arquivo de imagem (verificando o preview local em tela) e acionando "Salvar alterações": o sistema deve persistir tanto o nome quanto a imagem em conjunto, atualizando o cabeçalho com os novos dados em uma única ação de sucesso.

**Acceptance Scenarios**:

1. **Given** a aba de informações de identidade do perfil de usuário, **When** o formulário é carregado, **Then** a foto de perfil (com opções de adicionar/alterar ou remover), o campo de nome de exibição e o e-mail cadastrado (em modo somente leitura) são apresentados em um único conjunto integrado.
2. **Given** a seleção de uma nova imagem de perfil, **When** o arquivo é selecionado no dispositivo, **Then** o sistema gera uma pré-visualização instantânea na tela, mantendo a alteração em estado pendente sem disparar salvamento imediato no servidor.
3. **Given** uma foto já existente, **When** o usuário escolhe a ação de remover foto, **Then** a visualização substitui provisoriamente a imagem pelas iniciais do usuário e registra a remoção como pendente de confirmação.
4. **Given** alterações pendentes de nome e/ou de foto de perfil, **When** o usuário clica no botão unificado "Salvar alterações", **Then** o sistema valida os dados, executa a persistência conjunta do nome e da foto (upload da nova imagem ou remoção da antiga), exibe feedback de sucesso e reflete as alterações instantaneamente no cabeçalho do sistema.
5. **Given** um formulário sem nenhuma alteração pendente de nome ou foto, **When** inspecionado, **Then** o botão "Salvar alterações" permanece desabilitado para evitar requisições redundantes.

---

### User Story 4 - Centralização de Segurança, Sessão e Exportação na Área de Perfil (Priority: P2)

Como uma pessoa usuária gerenciando sua conta, desejo que as abas de "Segurança & Sessão" (com autenticação em dois fatores, contas vinculadas e logout) e "Central de Exportação" (com exportação de lançamentos em CSV, PDF e XLSX) fiquem organizadas dentro da área de perfil de usuário, para que todas as ferramentas de administração de conta residam em um mesmo local coeso.

**Why this priority**: Consolida todas as configurações operacionais e de governança da conta pessoal sob a navegação de perfil, mantendo a experiência de uso limpa e previsível.

**Independent Test**: Pode ser testado acessando o perfil de usuário a partir do clique no cabeçalho, navegando entre as abas "Informações de Identidade", "Segurança & Sessão" e "Central de Exportação", e confirmando que cada aba funciona de forma independente e consistente dentro do layout do perfil.

**Acceptance Scenarios**:

1. **Given** a área de perfil de usuário acessada via cabeçalho, **When** visualizada, **Then** a navegação apresenta as abas: "Informações de Identidade", "Segurança & Sessão" e "Central de Exportação".
2. **Given** a aba "Segurança & Sessão", **When** selecionada, **Then** o usuário gerencia a ativação/desativação de 2FA por e-mail, visualiza contas vinculadas e tem acesso ao encerramento de sessão.
3. **Given** a aba "Central de Exportação", **When** selecionada, **Then** o usuário pode configurar e disparar a exportação de dados financeiros nos formatos CSV, PDF e XLSX.

---

### Edge Cases

- **Cancelamento ou descarte de alterações na foto de perfil**: Se o usuário selecionar uma nova foto gerando preview, mas navegar para outra página sem clicar em "Salvar alterações", as alterações pendentes devem ser descartadas e a foto original preservada sem corromper a memória da aplicação.
- **Falha no salvamento conjunto**: Caso o envio da nova foto falhe (por exemplo, instabilidade de rede ou limite de tamanho), o sistema deve informar claramente o erro ao usuário, não deixar o estado do formulário em inconsistência e permitir tentar salvar novamente.
- **Tentativa de selecionar arquivo não suportado**: Se o usuário selecionar um arquivo que não seja uma imagem válida (JPEG, PNG ou WebP) ou que exceda 5MB, a interface deve exibir um aviso de validação imediato e manter o estado anterior da foto.
- **Acesso direto a links antigos de perfil**: Se o usuário possuir um link direto salvo para a rota anterior de perfil/metas, a navegação deve orientá-lo ou carregá-la respeitando a nova segregação de responsabilidades.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer uma tela/seção dedicada exclusivamente à definição e edição de metas financeiras pessoais (reserva de emergência, perfil de risco e metas patrimoniais), acessível diretamente pelo menu lateral de navegação.
- **FR-002**: A tela de metas financeiras NÃO DEVE conter campos de identificação pessoal do usuário (nome, e-mail, foto), abas de segurança ou central de exportação de relatórios.
- **FR-003**: O sistema DEVE permitir que o usuário acesse a área de configurações de perfil e conta clicando em seu identificador (nome, e-mail ou avatar) presente no cabeçalho da aplicação.
- **FR-004**: O sistema DEVE unificar a gestão de foto de perfil (adicionar, alterar, pré-visualizar e marcar para remoção) e a edição de nome de exibição em um único formulário de informações de identidade.
- **FR-005**: Ao clicar no botão de confirmação ("Salvar alterações") do formulário de identidade, o sistema DEVE salvar conjuntamente as modificações de nome e as alterações de foto de perfil (novo arquivo ou remoção da imagem existente).
- **FR-006**: A seleção de uma nova foto de perfil DEVE exibir pré-visualização instantânea no cliente antes da confirmação do formulário, sem persistir o arquivo no servidor antes do clique em "Salvar alterações".
- **FR-007**: A solicitação de remoção da foto existente no formulário de identidade DEVE exibir temporariamente as iniciais do nome do usuário e ser confirmada apenas ao salvar o formulário.
- **FR-008**: O botão de submissão do formulário de identidade DEVE permanecer desabilitado se não houver modificações pendentes no nome ou na foto de perfil.
- **FR-009**: A área de perfil de usuário DEVE conter a navegação entre as abas: "Informações de Identidade", "Segurança & Sessão" e "Central de Exportação".
- **FR-010**: A aba "Segurança & Sessão" DEVE permitir o gerenciamento de autenticação em dois fatores (2FA), contas conectadas e opção de encerramento seguro de sessão.
- **FR-011**: A aba "Central de Exportação" DEVE permitir o download dos relatórios financeiros consolidados em formatos CSV, PDF e XLSX.

### Key Entities

- **Perfil de Usuário (Identidade)**: Dados cadastrais e visuais da pessoa usuária (nome completo de exibição, e-mail de acesso e avatar/foto de perfil).
- **Metas e Perfil Financeiro**: Informações estritamente financeiras do usuário (renda mensal estimada, tolerância a risco, valor da reserva de emergência e metas de curto/médio/longo prazo).
- **Configurações de Segurança e Conta**: Estado de proteção da conta (2FA via e-mail ativado/desativado, contas de provedores externos vinculadas e credenciais de sessão).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das opções de edição de nome, foto e segurança são segregadas da área de metas financeiras, resultando em uma página de metas com foco 100% financeiro.
- **SC-002**: O usuário consegue acessar todas as configurações de perfil e conta a partir de um único clique no seu nome/avatar no cabeçalho em menos de 1 segundo de transição de tela.
- **SC-003**: A alteração simultânea de nome e foto de perfil é concluída com um único clique no botão de salvar, reduzindo os cliques necessários para atualização cadastral em pelo menos 50% em comparação ao modelo anterior de múltiplos botões.
- **SC-004**: 100% das imagens inválidas ou superiores a 5MB são validadas e recusadas antes do envio, prevenindo erros de carregamento e tráfego desnecessário.
- **SC-005**: As abas de Segurança & Sessão e Central de Exportação são 100% acessíveis e operacionais dentro da navegação de perfil de usuário.

## Assumptions

- O endpoint ou serviços de atualização de perfil e de upload/deleção de avatar continuam operacionais no ecossistema e são orquestrados de forma transparente para o usuário.
- O e-mail do usuário permanece como campo identificador único de somente leitura no formulário de identidade, gerenciado via rotas de autenticação.
- O componente de cabeçalho está presente em todas as telas autenticadas do dashboard, servindo como âncora permanente para o acesso ao perfil do usuário.
