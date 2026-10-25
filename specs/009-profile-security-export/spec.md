# Feature Specification: Perfil de Usuário, Segurança (2FA & Google Auth) e Central de Exportação

**Feature Branch**: `feature/009-profile-security-export`

**Created**: 2026-10-24

**Status**: Implemented

> **Nota de Evolução Arquitetural (Feature 010 & 011)**: A experiência de gerenciamento de dados de identidade pessoal (US1) foi aprimorada e unificada sob a Feature 010 ([specs/010-profile-goals-segregation](../010-profile-goals-segregation/spec.md)), integrando a manipulação de avatar e o nome em um único componente com salvamento atômico (`UserProfileIdentityForm`), enquanto as metas financeiras foram desacopladas para `/settings/metas` na Feature 011 ([specs/011-settings-metas-profile](../011-settings-metas-profile/spec.md)).

**Input**: User description: "Crie uma especificação de novas features, onde o usuário vai poder visualizar seu perfil em uma aba, podendo adicionar/editar/excluir foto de usuário, editar nome de usuário, vincular conta do google, autenticaçao com 2 fatores, 2FA (via email), sair da sessão. Além de ter uma área onde vai ser possivel exportar dados em CSV, PDF e XLSX formatados."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gerenciamento de Identidade, Nome e Foto de Perfil (Priority: P1) 🎯 MVP

Como uma pessoa usuária autenticada na plataforma, desejo acessar uma aba dedicada do meu perfil para visualizar meus dados cadastrais, editar meu nome de exibição e adicionar, atualizar ou excluir minha foto de perfil, para que minha experiência na plataforma seja personalizada e meu avatar seja reconhecido na barra de navegação e nos módulos do sistema.

**Why this priority**: A gestão de identidade básica e personalização visual é a base de identificação e engajamento do usuário na plataforma.

**Independent Test**: Pode ser testado acessando as configurações de perfil, alterando o nome de exibição, fazendo upload de uma nova imagem de perfil, confirmando que o avatar na barra de navegação e na página reflete a nova imagem, e posteriormente removendo a foto para validar que o avatar retorna às iniciais do nome.

**Acceptance Scenarios**:

1. **Given** a tela de configurações de perfil, **When** o usuário acessa a aba "Meu Perfil", **Then** a interface renderiza o avatar atual, o nome de exibição, o e-mail cadastrado e a data de criação da conta.
2. **Given** o componente de avatar, **When** o usuário clica em "Adicionar foto" ou "Alterar foto", **Then** um seletor de arquivos permite escolher uma imagem (formatos JPG, PNG ou WebP com tamanho de até 5MB), exibindo preview imediato antes da confirmação.
3. **Given** uma foto de perfil já cadastrada, **When** o usuário clica em "Remover foto" e confirma a ação, **Then** a imagem é desvinculada do perfil e o avatar passa a exibir as iniciais do nome do usuário com fundo temático.
4. **Given** o formulário de dados pessoais, **When** o usuário altera o campo "Nome completo / exibição" e clica em "Salvar alterações", **Then** o sistema valida o preenchimento, persiste os dados, emite notificação de sucesso e atualiza o nome exibido no cabeçalho do sistema.

---

### User Story 2 - Autenticação em Dois Fatores (2FA via E-mail) e Segurança de Sessão (Priority: P1) 🎯 MVP

Como uma pessoa usuária preocupada com a proteção das minhas informações financeiras, desejo ativar a autenticação em dois fatores (2FA) com validação de código temporário por e-mail, e dispor de uma ação clara para encerrar minha sessão com segurança, para impedir acessos não autorizados aos meus lançamentos bancários e patrimônio.

**Why this priority**: A integridade e segurança de dados financeiros sensíveis exige camadas modernas de proteção contra vazamento de credenciais e controle de sessão ativo.

**Independent Test**: Pode ser testado na seção de segurança solicitando a ativação do 2FA, recebendo o código de verificação de 6 dígitos no e-mail cadastrado, inserindo-o para confirmar a ativação, e validando que o status do 2FA muda para "Ativado"; em seguida, acionar a opção "Sair da Sessão" e verificar que a sessão é encerrada com redirecionamento para o login.

**Acceptance Scenarios**:

1. **Given** a aba de segurança do usuário, **When** o status atual do 2FA é "Desativado", **Then** a interface exibe um interruptor/botão "Ativar 2FA via E-mail" acompanhado de texto explicativo sobre o funcionamento da verificação em duas etapas.
2. **Given** a solicitação de ativação do 2FA, **When** o usuário clica em "Ativar", **Then** o sistema dispara um código de confirmação de 6 dígitos para o e-mail cadastrado e abre um diálogo modal para inserção do código temporário com temporizador de expiração e opção de reenvio.
3. **Given** o diálogo modal de confirmação do 2FA aberto, **When** o usuário digita o código correto de 6 dígitos, **Then** o sistema ativa o 2FA para a conta, exibe confirmação visual de sucesso e atualiza o badge de segurança para "2FA Ativo via E-mail".
4. **Given** o 2FA ativo na conta, **When** o usuário opta por "Desativar 2FA", **Then** o sistema exige a confirmação por senha ou código de segurança antes de reverter a proteção.
5. **Given** uma pessoa autenticada em qualquer área do sistema, **When** ela aciona a ação "Sair da sessão" (Logout), **Then** os tokens de acesso locais são revogados e destruídos, o cache em memória é limpo e a navegação é redirecionada para a tela de login.

---

### User Story 3 - Vínculo de Conta Google (Social Account Linking) (Priority: P2)

Como uma pessoa usuária que utiliza o ecossistema Google, desejo vincular minha conta Google à minha conta financeira existente, para que eu possa realizar login de forma rápida e segura com um único clique (Single Sign-On).

**Why this priority**: Facilita a rotina de autenticação do usuário, reduz atrito de login e fornece alternativa segura baseada no ecossistema de identidade Google.

**Independent Test**: Pode ser testado acessando a aba de contas vinculadas, clicando em "Vincular com Google", completando o fluxo de consentimento na janela do Google, e verificando que a interface passa a exibir a conta Google vinculada com o endereço de e-mail associado.

**Acceptance Scenarios**:

1. **Given** a seção "Contas Conectadas", **When** o usuário não possui vínculo com Google, **Then** um card com o logotipo do Google e o botão "Conectar Conta Google" é disponibilizado.
2. **Given** o clique em "Conectar Conta Google", **When** o fluxo OAuth2 é concluído com êxito, **Then** a interface atualiza exibindo o selo "Vinculado", acompanhado do e-mail Google conectado e da data de vinculação.
3. **Given** uma conta Google vinculada e uma senha local ativa, **When** o usuário clica em "Desvincular Google", **Then** um diálogo de confirmação solicita confirmação e, ao aceitar, desfaz o vínculo preservando o acesso habitual por e-mail e senha.
4. **Given** um usuário que autenticou originalmente apenas via Google (sem senha local prévia), **When** ele tenta desvincular o Google, **Then** o sistema exige o cadastramento de uma senha local antes de permitir a desvinculação, impedindo bloqueio de conta.

---

### User Story 4 - Central de Exportação de Dados Financeiros (CSV, PDF e XLSX) (Priority: P2)

Como uma pessoa usuária que necessita arquivar meus comprovantes financeiros, declarar impostos ou realizar análises personalizadas em softwares externos, desejo dispor de uma área dedicada para exportar meus lançamentos e relatórios consolidados nos formatos CSV, PDF formatado e XLSX, com filtros flexíveis de período e contas.

**Why this priority**: Garante soberania e portabilidade total dos dados ao usuário (alinhada aos direitos LGPD de portabilidade), permitindo prestação de contas, contabilidade externa e backup independente.

**Independent Test**: Pode ser testado na aba/tela de Exportação selecionando o mês vigente, aplicando filtros opcionais de categoria/conta, selecionando o formato desejado (CSV, PDF ou XLSX) e clicando em "Exportar": o sistema deve gerar o arquivo formatado e disparar o download com sucesso.

**Acceptance Scenarios**:

1. **Given** a tela de exportação de dados, **When** o usuário acessa o módulo, **Then** a interface apresenta opções para selecionar: período (mês específico, intervalo customizado ou histórico completo), filtro por conta bancária e filtro por categoria.
2. **Given** os filtros definidos, **When** o usuário escolhe a opção "Exportar CSV", **Then** o sistema gera um arquivo `.csv` codificado em UTF-8 com cabeçalho padrão (`Data, Descrição, Categoria, Conta, Tipo, Valor`) e separadores compatíveis com softwares brasileiros de planilha.
3. **Given** os filtros definidos, **When** o usuário escolhe a opção "Exportar XLSX", **Then** o sistema gera uma pasta de trabalho `.xlsx` estruturada com colunas formatadas para moeda brasileira (BRL), estilos de cabeçalho e aba de resumo consolidado com KPIs do período.
4. **Given** os filtros definidos, **When** o usuário escolhe a opção "Exportar Relatório em PDF", **Then** o sistema compila um documento PDF diagramado contendo cabeçalho institucional, sumário executivo com KPIs (receitas, despesas, faturas, saldo líquido) e a tabela discriminada de lançamentos pronta para impressão ou arquivamento fiscal.
5. **Given** uma solicitação de exportação em processamento, **When** o arquivo está sendo gerado, **Then** um indicador visual de progresso informa o status e desabilita cliques múltiplos até a conclusão do download.

---

### Edge Cases

- **Upload de arquivo de foto inválido ou corrompido**: Se o usuário selecionar um arquivo que não seja imagem ou que exceda o tamanho limite de 5MB, a interface deve interceptar imediatamente antes do upload, exibindo mensagem clara em português e mantendo o avatar anterior intacto.
- **Expiração do código 2FA temporário**: O código enviado por e-mail possui janela de expiração (ex: 5 minutos); caso o usuário insira após esse prazo, a interface informa que o código expirou e oferece botão de ação com um clique para "Reenviar novo código".
- **Tentativa de desvincular o único método de login**: Se a conta for criada exclusivamente via Google OAuth e o usuário não possuir senha local cadastrada, a desvinculação da conta Google é bloqueada até que o usuário defina uma senha de acesso.
- **Exportação de período sem nenhuma movimentação**: Ao solicitar exportação para um período sem lançamentos, o sistema alerta amigavelmente que não existem transações no intervalo selecionado antes de gerar um arquivo vazio.
- **Navegação com sessão expirada ou invalidada durante a exportação**: Se a sessão for encerrada em outra aba ou o token expirar, a tentativa de exportação redireciona de forma elegante para a autenticação com preservação do estado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar uma aba/seção dedicada de "Meu Perfil" permitindo visualizar e atualizar o nome de exibição do usuário.
- **FR-002**: O sistema DEVE permitir upload, visualização prévia, atualização e exclusão de foto de perfil (avatar), aceitando formatos JPG, PNG e WebP com tamanho máximo de 5MB.
- **FR-003**: Ao remover a foto de perfil, o sistema DEVE renderizar de forma determinística um avatar alternativo contendo as iniciais do nome do usuário.
- **FR-004**: O sistema DEVE permitir a ativação e desativação da Autenticação em Dois Fatores (2FA) com validação de código de segurança de 6 dígitos enviado ao e-mail do usuário.
- **FR-005**: Quando o 2FA estiver ativado na conta, o fluxo de login subsequente DEVE exigir a validação do código temporário recebido por e-mail antes de conceder acesso aos recursos protegidos.
- **FR-006**: O sistema DEVE fornecer ação de encerramento seguro de sessão ("Sair da Sessão"), invalidando o token no cliente e redirecionando para a rota de login pública.
- **FR-007**: O sistema DEVE permitir vincular e desvincular uma conta Google ao perfil existente através de fluxo OAuth2 padrão.
- **FR-008**: O sistema DEVE impedir a desvinculação da conta Google caso esta seja a única via de acesso cadastrada pelo usuário sem senha local associada.
- **FR-009**: O sistema DEVE disponibilizar uma área de exportação de dados financeiros com filtros por intervalo de datas/mês, conta financeira e categoria.
- **FR-010**: O sistema DEVE ser capaz de exportar os lançamentos financeiros no formato CSV estruturado com codificação UTF-8.
- **FR-011**: O sistema DEVE ser capaz de exportar os lançamentos financeiros no formato XLSX com colunas estilizadas e células formatadas em moeda brasileira (BRL).
- **FR-012**: O sistema DEVE ser capaz de gerar e exportar um relatório consolidado em PDF diagramado contendo resumo de KPIs e listagem de transações para impressão e comprovação fiscal.

### Key Entities *(include if feature involves data)*

- **Perfil do Usuário (`UserProfile`)**: Entidade que reúne identidade cadastral (`id`, `name`, `email`, `avatarUrl`), perfil financeiro voluntário (`financialProfile`), credenciais de segurança e preferências da conta.
- **Configuração de Segurança (`SecuritySettings`)**: Configurações relativas a `twoFactorEnabled` (status do 2FA via e-mail), `hasLocalPassword` (existência de senha clássica) e `googleLinked` (detalhes da conta Google associada: e-mail e data de vinculação).
- **Parâmetros de Exportação (`ExportFilters`)**: Critérios informados pelo usuário para geração de arquivos, incluindo `format` (`CSV`, `XLSX`, `PDF`), `startDate`, `endDate`, `accountId` e `category`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos usuários conseguem atualizar seu nome e foto de perfil com preview em menos de 10 segundos.
- **SC-002**: Redução a zero de bloqueios acidentais de conta ao impedir desvinculação do Google sem senha local previamente definida.
- **SC-003**: 100% de sucesso na entrega do código 2FA de 6 dígitos no fluxo de ativação via e-mail.
- **SC-004**: Geração e download de arquivos de exportação (CSV, XLSX e PDF) em menos de 5 segundos para períodos com até 5.000 lançamentos.
- **SC-005**: 100% de aprovação na suíte de testes automatizados com cobertura para todos os novos componentes de formulário, fluxos de segurança e geradores de exportação.

## Assumptions

- O envio de e-mails para validação do código 2FA é orquestrado pelo serviço de mensageria de e-mail do backend (ex: SMTP / Resend / SendGrid).
- A geração dos arquivos nos formatos CSV, XLSX e PDF pode ser realizada através de bibliotecas especializadas e leves no cliente ou via endpoints dedicados do backend com streaming de arquivo.
- O upload de fotos de perfil pode armazenar o arquivo em CDN / bucket seguro ou como string base64 / imagem persistida no backend.
