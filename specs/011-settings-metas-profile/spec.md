# Feature Specification: Rota de Perfil de Investidor e Metas (/settings/metas)

**Feature Branch**: `feature/011-settings-metas-profile`

**Created**: 2026-10-24

**Status**: Implemented

**Input**: User description: "Onde ficou a tela de perfil de investimento? EU quero que o /settings/profile seja somente quando o usuário clicar no seu nome, o link de perfil e metas da navbar, devera ser /settings/metas, onde deverá ter somente o perfil de investidor do usuario"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acesso ao Perfil de Investidor e Metas via `/settings/metas` (Priority: P1) 🎯 MVP

Como uma pessoa usuária focada em seus investimentos e planejamento financeiro, desejo que o item "Perfil e Metas" no menu de navegação principal (navbar/sidebar) direcione para a rota `/settings/metas`, onde posso visualizar e configurar exclusivamente o meu perfil de investidor (tolerância a risco, regime de renda, reserva de emergência e metas prioritárias de investimento), para que eu encontre e gerencie facilmente minha estratégia de alocação sem interferência de dados cadastrais da conta.

**Why this priority**: Atende diretamente à expectativa de localização do perfil de investidor em `/settings/metas`, estabelecendo um endereço previsível e focado para as metas e a tolerância ao risco do usuário.

**Independent Test**: Pode ser testado clicando no item "Perfil e Metas" no menu de navegação e validando que o navegador carrega a rota `/settings/metas`, exibindo o card de perfil de investidor (conservador, moderado, agressivo), regime de trabalho, renda mensal e objetivos prioritários, sem conter formulários de alteração de nome ou upload de foto de usuário.

**Acceptance Scenarios**:

1. **Given** o menu de navegação principal (sidebar/navbar), **When** o usuário clica no item "Perfil e Metas", **Then** a aplicação navega para a URL `/settings/metas`.
2. **Given** a página `/settings/metas`, **When** renderizada, **Then** apresenta unicamente o formulário de perfil de investidor e planejamento financeiro (seleção de perfil de risco, metas financeiras prioritárias, renda mensal e regime de trabalho).
3. **Given** a página `/settings/metas`, **When** o usuário altera seu perfil de investidor (ex: de Conservador para Moderado) ou seus objetivos e clica em salvar, **Then** as preferências são salvas com sucesso e uma notificação de confirmação é apresentada.
4. **Given** a página `/settings/metas`, **When** inspecionada visualmente, **Then** não apresenta campos de edição de nome, foto de perfil, dados pessoais ou abas administrativas de segurança de conta.

---

### User Story 2 - Entrada em `/settings/profile` Restrita ao Clique no Nome/Avatar do Usuário (Priority: P1) 🎯 MVP

Como uma pessoa usuária autenticada na plataforma, desejo que a rota `/settings/profile` seja aberta com exclusividade ao clicar no meu nome, e-mail ou avatar no topo da tela (barra superior de navegação), garantindo que os dados cadastrais (foto de perfil, nome completo de exibição e e-mail) fiquem em seu local específico de administração pessoal.

**Why this priority**: Garante uma separação limpa e consistente entre o domínio de dados de identidade pessoal (`/settings/profile`) e o domínio de planejamento e perfil de investidor (`/settings/metas`).

**Independent Test**: Pode ser testado clicando no indicador de usuário no topo da tela e confirmando que a rota aberta é estritamente `/settings/profile`, exibindo o formulário unificado de foto de perfil e nome de exibição.

**Acceptance Scenarios**:

1. **Given** qualquer página do painel autenticado, **When** o usuário clica no identificador com seu nome, e-mail ou avatar no cabeçalho superior, **Then** a aplicação navega diretamente para `/settings/profile`.
2. **Given** a página `/settings/profile`, **When** acessada, **Then** renderiza exclusivamente o formulário de informações de identidade (foto de perfil e nome de exibição) acompanhado das abas de administração de conta (Segurança e Exportação).

---

### User Story 3 - Coerência e Clareza na Navegação de Configurações (Priority: P2)

Como uma pessoa usuária navegando entre recursos da aplicação, desejo que o layout de `/settings/metas` ofereça uma experiência limpa e focada no perfil de investidor, com título explicativo e orientação contextual sobre como essas informações calibram a inteligência financeira do sistema.

**Why this priority**: Evita ruídos visuais e confusão na interface, proporcionando clareza sobre o propósito do perfil de investidor.

**Independent Test**: Pode ser testado acessando `/settings/metas` e conferindo a legibilidade do cabeçalho da página ("Perfil de Investidor & Metas") e a ausência de elementos conflitantes.

**Acceptance Scenarios**:

1. **Given** a página `/settings/metas`, **When** visualizada, **Then** exibe título claro destacando o Perfil de Investidor e Metas com orientações sobre a personalização dos diagnósticos.
2. **Given** um acesso direto à rota legada `/goals`, **When** requisitado, **Then** o sistema redireciona suavemente para `/settings/metas` ou carrega o conteúdo correspondente preservando compatibilidade.

---

### Edge Cases

- **Acesso direto via URL digitada**: Se o usuário digitar diretamente `/settings/metas` na barra de endereços, a aplicação deve carregar a tela de perfil de investidor sem erros e com os dados atuais previamente cadastrados.
- **Redirecionamento de rotas anteriores**: Se houver links legados ou favoritos apontando para `/goals`, o sistema deve redirecionar de forma transparente para `/settings/metas`.
- **Alteração do perfil de risco sem alterar outros campos**: Se o usuário mudar apenas o perfil de risco (ex: Conservador para Agressivo) em `/settings/metas`, a submissão deve salvar a alteração com sucesso e manter inalterados a renda e as metas anteriores.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer a rota `/settings/metas` dedicada exclusivamente ao formulário de perfil de investidor e metas financeiras.
- **FR-002**: A rota `/settings/metas` DEVE conter as opções de seleção do Perfil de Risco (Conservador, Moderado, Agressivo), Metas Financeiras Prioritárias, Renda Mensal Declarada e Regime de Trabalho.
- **FR-003**: A rota `/settings/metas` NÃO DEVE conter campos de identificação pessoal (nome, foto de perfil, e-mail) ou abas de gerenciamento de conta (contas vinculadas, exportação).
- **FR-004**: O item de menu "Perfil e Metas" na barra de navegação principal (navbar/sidebar) DEVE apontar especificamente para a rota `/settings/metas`.
- **FR-005**: O acesso à rota `/settings/profile` DEVE ocorrer com exclusividade a partir do clique no identificador do usuário (nome, e-mail ou avatar) no cabeçalho superior (`UserNav`).
- **FR-006**: A rota `/settings/profile` DEVE renderizar o formulário unificado de informações de identidade (foto e nome) e os controles de conta.

### Key Entities

- **Perfil de Investidor (Investor Profile)**: Classificação de tolerância a risco (Conservador, Moderado, Agressivo) e objetivos patrimoniais que calibram as análises da plataforma.
- **Metas Financeiras**: Objetivos prioritários definidos pelo usuário (reserva de emergência, quitação de dívidas, investimentos de longo prazo, etc.).
- **Navegação da Aplicação**: Rotas mapeadas para os pontos de entrada no menu lateral (`/settings/metas`) e no cabeçalho (`/settings/profile`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O item "Perfil e Metas" na barra de navegação direciona 100% das vezes para a URL `/settings/metas`.
- **SC-002**: 100% dos campos presentes em `/settings/metas` são estritamente relacionados a perfil de investidor e metas financeiras, com zero campos de dados pessoais ou controles de segurança misturados.
- **SC-003**: O clique no nome/avatar no cabeçalho direciona para `/settings/profile` em menos de 1 segundo de resposta.
- **SC-004**: O salvamento das alterações do perfil de investidor em `/settings/metas` é concluído com feedback visual de confirmação sem recarregar a página.

## Assumptions

- O formulário `FinancialProfileForm` já existente possui todos os campos necessários para o perfil de investidor (perfil de risco, objetivos, renda e regime de trabalho).
- As rotas `/settings/security` e `/settings/export` continuam acessíveis através da área de perfil aberta pelo identificador do usuário.
- O redirecionamento de `/goals` para `/settings/metas` assegura que nenhum fluxo fique órfão no sistema.
