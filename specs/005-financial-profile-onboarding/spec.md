# Feature Specification: Perfil Financeiro, Regime de Renda e Metas do Usuário

**Feature Branch**: `feature/005-financial-profile-onboarding`

**Created**: 2026-10-19

**Status**: Implemented

**Input**: User description: "Criar tela e componentes de perfil financeiro voluntário consumindo GET /api/user/profile e PUT /api/user/profile, com regime de renda (CLT, PJ_AUTONOMO, PUBLIC_SERVANT, etc.), renda declarada em BRL, seleção múltipla de metas financeiras e perfil de risco, banner contextual no dashboard e invalidação reativa de cache."

## Clarifications

### Session 2026-10-19

- Q: Como o usuário deve acessar a tela de Perfil Financeiro a partir da navegação principal da aplicação? → A: Opção "Meu Perfil Financeiro" no menu suspenso do usuário na Navbar e link fixo de navegação na Sidebar apontando para `/settings/profile`.
- Q: Por quanto tempo a dispensa do banner de preenchimento do perfil no Dashboard deve persistir após o usuário clicar em "Dispensar"? → A: Persistir durante a sessão ativa do navegador via `sessionStorage`, voltando a ser exibido apenas em novas sessões de login caso o perfil permaneça incompleto.
- Q: Após salvar com sucesso as alterações do perfil financeiro na página de configurações, qual deve ser o comportamento de navegação da interface? → A: Permanecer na página `/settings/profile` exibindo notificação toast de confirmação e mantendo os dados salvos visíveis no formulário.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar e Preencher Perfil Financeiro Voluntário (Priority: P1)

Como um usuário autenticado que busca orientações financeiras personalizadas, quero acessar uma área de perfil financeiro para informar voluntariamente meu regime de renda, renda média mensal estimada, metas prioritárias e perfil de risco, para que os diagnósticos e recomendações da IA sejam adaptados à minha realidade.

**Why this priority**: É a jornada essencial desta feature. Sem o formulário de preenchimento e salvamento dos parâmetros de perfil, nenhum dos recursos subsequentes de personalização analítica pode ser alimentado.

**Independent Test**: Pode ser testado de forma independente acessando a página de configurações de perfil, preenchendo todos os campos válidos, submetendo e confirmando que os dados persistem e reaparecem ao recarregar a tela.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado sem perfil financeiro cadastrado, **When** navega até a tela de perfil financeiro através do link na Sidebar ou do menu na Navbar, **Then** visualiza o formulário com campos vazios/desmarcados e uma mensagem explicando que o preenchimento é opcional e serve para personalizar análises.
2. **Given** um formulário de perfil aberto, **When** o usuário seleciona um regime de renda (ex: "PJ / Autônomo"), digita a renda declarada (ex: R$ 8.500,00), seleciona metas (ex: "Reserva de Emergência" e "Investir a Longo Prazo") e escolhe o perfil de risco (ex: "Moderado"), e clica em salvar, **Then** o sistema exibe notificação toast de confirmação de sucesso, permanece na tela `/settings/profile` e mantém as seleções salvas visíveis.
3. **Given** um usuário com perfil já cadastrado previamente, **When** ele altera sua renda declarada ou adiciona uma nova meta e submete, **Then** os novos dados substituem os anteriores com confirmação imediata via toast.

---

### User Story 2 - Notificação Contextual e Acesso Ágil no Dashboard (Priority: P2)

Como um usuário que acabou de fazer login e ainda não configurou seu perfil financeiro, quero ver um lembrete sutil e amigável no painel inicial (Dashboard) explicando os benefícios da personalização, para que eu possa navegar diretamente para o preenchimento ou dispensar a notificação sem que meu fluxo de trabalho seja interrompido.

**Why this priority**: Aumenta a taxa de adoção do perfil personalizado de maneira não intrusiva, respeitando a voluntariedade e a autonomia do usuário.

**Independent Test**: Pode ser testado observando a presença do banner no dashboard quando o usuário não tiver perfil, clicando no botão de ação para navegar ao formulário, ou clicando no botão de dispensar para ocultar o banner na sessão.

**Acceptance Scenarios**:

1. **Given** um usuário logado cujo perfil financeiro ainda não foi configurado, **When** acessa o painel inicial (Dashboard), **Then** visualiza um card/banner convidando à personalização com botão de ação direta "Configurar Perfil" e opção de "Dispensar".
2. **Given** o banner de convite visível no Dashboard, **When** o usuário clica em "Dispensar", **Then** o banner é imediatamente ocultado e sua supressão é mantida no `sessionStorage` até o encerramento da sessão ativa.
3. **Given** um usuário que já preencheu seu perfil com sucesso, **When** acessa o painel inicial, **Then** o banner de convite de preenchimento não é mais exibido.

---

### User Story 3 - Sincronização e Atualização Automática das Análises (Priority: P3)

Como um usuário que acabou de atualizar suas metas ou regime de trabalho, quero que a inteligência financeira do sistema reflita minhas novas preferências sem que eu precise deslogar ou limpar dados manualmente.

**Why this priority**: Garante consistência de dados em toda a interface do usuário após a alteração do perfil.

**Independent Test**: Pode ser testado alterando uma meta financeira de "Quitar Dívidas" para "Reserva de Emergência", salvando o perfil e verificando que a interface recarrega as análises sincronizadas.

**Acceptance Scenarios**:

1. **Given** um usuário que alterou seu regime de renda de CLT para PJ/Autônomo, **When** a alteração é salva com sucesso, **Then** os dados de análise do painel são marcados para atualização automática e o usuário recebe feedback visual de que os diagnósticos futuros considerarão as novas diretrizes.

---

### Edge Cases

- **Entrada monetária inválida ou negativa**: O sistema deve impedir submissão com valores negativos ou caracteres alfanuméricos na renda declarada, mantendo o formato monetário consistente em moeda nacional (BRL).
- **Nenhuma meta selecionada**: O usuário pode optar por preencher apenas o regime de renda sem marcar nenhuma meta específica, ou vice-versa; o sistema não deve obrigar o preenchimento de todos os campos para salvar dados parciais.
- **Falha de conectividade ao salvar**: Caso ocorra falha de rede ou indisponibilidade no momento do salvamento, uma mensagem clara de erro deve ser exibida permitindo ao usuário tentar novamente sem perder os dados já digitados no formulário.
- **Usuário que decide não preencher**: Nenhuma tela ou funcionalidade essencial da aplicação (upload de extratos, listagem de transações, gráficos e chat) deve ser bloqueada ou degradada para usuários sem perfil.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer acesso direto à tela de perfil financeiro (`/settings/profile`) através de um link fixo na barra lateral (Sidebar) e de uma opção ("Meu Perfil Financeiro") no menu suspenso do usuário na Navbar.
- **FR-002**: O sistema DEVE permitir a seleção de um único Regime de Renda entre as opções disponíveis: CLT, PJ/Autônomo, Servidor Público, Empresário/Sócio, Estudante/Estagiário, Aposentado/Pensionista e Outro.
- **FR-003**: O sistema DEVE permitir a inserção voluntária do valor de Renda Mensal Declarada com formatação em moeda nacional (R$ - BRL).
- **FR-004**: O sistema DEVE permitir a seleção múltipla de Metas Financeiras prioritárias entre as alternativas: Reserva de Emergência, Quitar Dívidas, Comprar Imóvel, Investir a Longo Prazo e Controle de Gastos.
- **FR-005**: O sistema DEVE permitir a seleção de um único Perfil de Risco entre as opções: Conservador, Moderado e Agressivo.
- **FR-006**: O sistema DEVE exibir um banner discreto e dispensável no painel inicial (Dashboard) sugerindo o preenchimento do perfil quando este ainda não tiver sido configurado.
- **FR-007**: O sistema DEVE persistir a dispensa temporária do banner durante a sessão ativa do usuário através de armazenamento de sessão client-side (`sessionStorage`), voltando a exibi-lo apenas caso uma nova sessão de autenticação seja iniciada e o perfil permaneça não preenchido.
- **FR-008**: O sistema NUNCA DEVE bloquear fluxos principais (transações, gráficos, chat) para usuários que optarem por não preencher o perfil voluntário.
- **FR-009**: O sistema DEVE sincronizar imediatamente os dados de visualização e invalidar o cache de análises mensais na interface após qualquer atualização bem-sucedida do perfil.
- **FR-010**: O sistema DEVE exibir estados de carregamento (*loading states*) durante a recuperação e submissão dos dados do perfil, prevenindo submissões duplicadas acidentais.
- **FR-011**: O sistema DEVE manter o usuário na página de configurações após a submissão bem-sucedida, apresentando notificação de confirmação tipo toast e refletindo imediatamente o novo estado dos dados.

### Key Entities *(include if feature involves data)*

- **Perfil Financeiro do Usuário (`FinancialProfile`)**:
  - `incomeType`: Regime de trabalho e fonte de renda do usuário.
  - `declaredMonthlyIncome`: Valor numérico opcional da renda mensal estimada em reais.
  - `goals`: Lista de objetivos financeiros prioritários do usuário.
  - `riskProfile`: Nível de tolerância a oscilações e volatilidade financeira.
  - `updatedAt`: Data e hora da última alteração das preferências de perfil.
- **Banner de Onboarding Contextual**:
  - Representação visual no topo do dashboard com chamada para ação e controle de estado de exibição (visível/dispensado/concluído).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário consegue preencher e salvar seu perfil financeiro completo em menos de 60 segundos.
- **SC-002**: 100% das tentativas de submissão com valores monetários inválidos ou negativos são bloqueadas com feedback imediato e compreensível antes do envio.
- **SC-003**: O banner informativo do dashboard pode ser dispensado com exatamente 1 clique sem interromper a navegação.
- **SC-004**: Após salvar o perfil, os dados atualizados são exibidos na interface em menos de 1 segundo sem necessidade de recarregar manualmente a página do navegador.
- **SC-005**: A aplicação mantém 100% de disponibilidade e operabilidade para usuários com perfil ausente ou parcialmente preenchido.

## Assumptions

- O usuário já realizou login na aplicação e possui uma sessão válida ativa.
- Os serviços de backend fornecem endpoints de consulta e atualização do perfil do usuário autenticado.
- A moeda padrão utilizada para a renda declarada é o Real Brasileiro (BRL).
- Os textos informativos das opções de regime de renda e perfil de risco são apresentados em português claro e acessível a leigos em finanças.
