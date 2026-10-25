# Feature Specification: Autenticação, Shell Base e Gestão BYOK da Chave de IA

**Feature Branch**: `001-auth-shell-byok`

**Created**: 2026-10-19

**Status**: Implemented

**Input**: User description: "Criar fluxo de autenticação com login e cadastro (JWT), layout responsivo base com barra de navegação e tema dark/light, e modal/página para cadastro e teste ativo da chave de API do Google AI Studio (BYOK) via PUT /api/user/ai-key com indicação visual de status da IA."

## Clarifications

### Session 2026-10-19

- Q: Ao realizar o primeiro acesso ou cadastro com uma conta sem chave de IA configurada (`hasAiKey: false`), como a aplicação deve guiar o usuário em relação à configuração da chave de API do Google AI Studio (BYOK)? → A: A configuração da chave é uma etapa mandatória de onboarding para liberar o acesso ao dashboard. Se o teste ativo retornar serviço sob alta demanda (`ACTIVE_PROVISIONAL_DEMAND`), a chave é persistida com sucesso no backend, o usuário recebe confirmação com alerta informativo sobre a alta demanda temporária do Google AI Studio e tem sua navegação liberada para prosseguir para o dashboard.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Autenticação e Controle de Sessão do Usuário (Priority: P1)

Como uma pessoa usuária da plataforma financeira, desejo criar uma conta com meu e-mail e senha e realizar login de forma segura, mantendo minha sessão ativa entre recarregamentos de página e com proteção contra acessos não autorizados.

**Why this priority**: É a fundação de segurança e identidade da aplicação. Todas as demais funcionalidades (dados financeiros sensíveis e configuração da chave pessoal de IA) dependem de um usuário autenticado.

**Independent Test**: Pode ser testado de forma autônoma completando o fluxo de cadastro com dados válidos, realizando login, comprovando a persistência da sessão após recarregamento e verificando o bloqueio de acesso a rotas protegidas quando deslogado.

**Acceptance Scenarios**:

1. **Given** que o usuário não possui conta no sistema, **When** submete o formulário de cadastro com um e-mail válido e senha com no mínimo 8 caracteres, **Then** o sistema cria o usuário, inicia a sessão e o encaminha para o fluxo de ativação da conta.
2. **Given** que o usuário já possui cadastro ativo, **When** informa seu e-mail e senha corretos na tela de login, **Then** o sistema valida as credenciais, armazena a sessão com segurança e direciona o usuário para a interface correspondente ao seu estado de ativação.
3. **Given** que o usuário informa credenciais inválidas na tela de login, **When** aciona a submissão, **Then** o sistema exibe mensagem de erro clara e mantém o usuário na tela de login sem vazar detalhes sobre a existência do e-mail.
4. **Given** que o usuário está autenticado, **When** aciona o comando de "Sair" (Logout), **Then** a sessão é destruída e o usuário é redirecionado imediatamente para a página de login.
5. **Given** que um visitante não autenticado tenta acessar uma rota protegida diretamente pela URL, **When** a rota é carregada, **Then** o sistema intercepta a navegação e o redireciona para a tela de login.

---

### User Story 2 - Layout Shell Responsivo com Navegação e Alternância de Tema (Priority: P2)

Como uma pessoa usuária autenticada, desejo navegar pelas seções da aplicação por meio de uma barra de navegação responsiva e intuitiva, identificando meu e-mail logado e podendo alternar confortavelmente entre os temas visual claro e escuro a qualquer momento.

**Why this priority**: Estabelece a casca (shell) ergonômica comum a todas as telas do sistema, garantindo consistência visual, adaptabilidade a dispositivos móveis e acessibilidade visual.

**Independent Test**: Pode ser testado de forma autônoma acessando qualquer área autenticada, alternando o tema entre claro e escuro, verificando a preservação da escolha após recarregar e operando o menu de navegação em telas com resoluções de desktop e de smartphones.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado no painel, **When** visualiza a interface em um monitor desktop, **Then** o sistema exibe a estrutura de cabeçalho/barra lateral com links de navegação acessíveis, o e-mail do usuário e o botão de tema.
2. **Given** um usuário autenticado acessando por um dispositivo móvel, **When** abre a aplicação, **Then** a barra de navegação se adapta a um menu móvel recolhível sem sobreposição indevida de elementos nem barra de rolagem horizontal.
3. **Given** que o usuário prefere o modo escuro, **When** clica no seletor de tema, **Then** toda a interface transiciona imediatamente para a paleta escura, gravando a preferência para visitas subsequentes.
4. **Given** que o usuário tem um tema preferido gravado, **When** recarrega a página ou abre uma nova aba, **Then** a interface inicializa diretamente no tema previamente configurado sem piscar de tela (*flash* indesejado).

---

### User Story 3 - Gestão e Teste Ativo da Chave de API Google AI Studio (BYOK) (Priority: P3)

Como uma pessoa usuária autenticada, desejo cadastrar e testar minha chave pessoal de API do Google AI Studio (Bring Your Own Key) em etapa inicial obrigatória e através de modal acessível no cabeçalho, visualizando com clareza o status de conectividade da IA para operar os recursos inteligentes da plataforma.

**Why this priority**: Habilita o diferencial do produto (diagnósticos e categorização por inteligência artificial) sem repassar custos de cota da API ao operador da plataforma, assegurando que todo usuário ativo na plataforma tenha chave funcional cadastrada.

**Independent Test**: Pode ser testado de forma autônoma completando o onboarding de cadastro da chave após o registro, inserindo uma chave, submetendo o teste ativo e verificando o feedback visual e a liberação de navegação para o dashboard.

**Acceptance Scenarios**:

1. **Given** um usuário recém-cadastrado ou sem chave configurada (`hasAiKey: false`), **When** realiza a autenticação, **Then** o sistema exibe obrigatoriamente a interface de configuração da chave de IA, bloqueando o acesso prévio às rotas do dashboard.
2. **Given** que a interface de cadastro de chave de IA é exibida, **When** o usuário a visualiza, **Then** o sistema exibe instruções de uso, link direto para obter a chave gratuita no Google AI Studio e um campo seguro para colar a chave.
3. **Given** que o usuário informa uma chave de API válida, **When** clica em "Salvar e Testar", **Then** o sistema aciona a validação ativa, exibe estado de carregamento e confirma a ativação com status "Conexão Verificada" (`ACTIVE_VERIFIED`), atualizando o status no cabeçalho para verde e liberando o acesso ao dashboard.
4. **Given** que a chave de API é testada sob alta demanda temporária do provedor (`ACTIVE_PROVISIONAL_DEMAND`), **When** o teste é concluído, **Then** o sistema persiste a chave com sucesso no backend, exibe alerta informativo de que o registro foi realizado com sucesso mas que o serviço do Google opera sob alta demanda temporária, e libera o usuário para prosseguir para o dashboard com badge em amarelo/atenção.
5. **Given** que o usuário informa uma chave inválida ou revogada, **When** submete o teste, **Then** o sistema rejeita o avanço, não salva a chave e apresenta mensagem de erro explícita orientando o usuário a revisar a chave no portal do Google.
6. **Given** um usuário com chave já configurada no dashboard, **When** clica no indicador de status no cabeçalho, **Then** o sistema abre o modal de gerenciamento permitindo atualizar ou retestar sua chave de API a qualquer momento.

---

### Edge Cases

- **Tentativa de cadastro com e-mail duplicado**: O sistema deve apresentar mensagem amigável informando que o e-mail já se encontra registrado, oferecendo atalho para a tela de login.
- **Tentativa de acesso direto ao dashboard sem chave de IA cadastrada**: Se um usuário autenticado com `hasAiKey: false` tentar navegar diretamente para qualquer rota interna do dashboard, o sistema deve interceptar a navegação e apresentá-lo à etapa obrigatória de cadastro da chave de IA.
- **Falha de conectividade durante login ou cadastro**: O sistema deve exibir aviso de indisponibilidade de rede sem congelar a tela nem perder os campos já preenchidos.
- **Expiração de token durante navegação ativa**: Ao detectar término da validade da sessão, o sistema deve direcionar o usuário à tela de login com notificação explicando que a sessão expirou.
- **Usuário logado tentando acessar rotas de `/login` ou `/register`**: O sistema deve redirecionar de forma transparente o usuário de volta ao fluxo apropriado (dashboard se já tiver chave, ou tela de configuração de chave se pendente).
- **Formato inválido de chave de API**: O modal/tela de configuração de chave deve validar caracteres espúrios ou comprimento antes de permitir a submissão do teste ativo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer tela de cadastro (`/register`) com campos de e-mail e senha, exigindo validação de formato de e-mail e tamanho mínimo de 8 caracteres na senha.
- **FR-002**: O sistema DEVE fornecer tela de login (`/login`) para autenticação de usuários já registrados.
- **FR-003**: O sistema DEVE armazenar de maneira segura o identificador de sessão (JWT) no cliente e adicioná-lo automaticamente a todas as requisições autenticadas da aplicação.
- **FR-004**: O sistema DEVE proteger todas as rotas restritas da aplicação, redirecionando usuários não autenticados para a tela de login.
- **FR-005**: O sistema DEVE redirecionar usuários já autenticados que tentarem acessar as páginas de login ou cadastro diretamente para o painel principal (ou para a etapa de cadastro da chave caso ainda não possuam).
- **FR-006**: O sistema DEVE fornecer ação de encerramento de sessão (Logout) acessível a partir do menu do usuário, limpando os dados de autenticação locais e retornando para a tela de login.
- **FR-007**: O sistema DEVE disponibilizar uma estrutura de casca responsiva (shell) composta por barra superior/lateral de navegação, adaptável para dispositivos móveis e desktops.
- **FR-008**: O sistema DEVE exibir na casca de navegação a identificação do usuário logado (endereço de e-mail).
- **FR-009**: O sistema DEVE oferecer alternância imediata entre tema visual claro (light) e escuro (dark), persistindo a preferência do usuário entre recarregamentos e visitas futuras.
- **FR-010**: O sistema DEVE exibir um indicador visual de status da inteligência artificial (chave de IA) na barra de navegação, com estados visuais distintos para: não configurada, ativa/verificada (`ACTIVE_VERIFIED`) e demanda provisória (`ACTIVE_PROVISIONAL_DEMAND`).
- **FR-011**: O sistema DEVE disponibilizar interface de onboarding mandatória para usuários recém-cadastrados ou sem chave (`hasAiKey: false`), condicionando o acesso às áreas internas do dashboard à validação da chave do Google AI Studio.
- **FR-012**: O sistema DEVE disponibilizar modal de gerenciamento da chave de API acessível diretamente pelo indicador de status no cabeçalho ou menu de configurações para usuários com chave já cadastrada.
- **FR-013**: As interfaces de configuração da chave DEVEM fornecer link externo direto e orientações simples para o portal do Google AI Studio, permitindo que a pessoa usuária gere sua chave gratuita.
- **FR-014**: O sistema DEVE submeter a chave informada para validação ativa no backend via `PUT /api/user/ai-key` e exibir o resultado detalhado do teste de conexão sem recarregar a página.
- **FR-015**: Caso o teste ativo da chave resulte em alta demanda temporária (`ACTIVE_PROVISIONAL_DEMAND`), o sistema DEVE salvar a chave com sucesso no backend, emitir notificação informativa de sucesso alertando sobre a alta demanda do provedor, e liberar o usuário para prosseguir para o dashboard com o indicador em estado de atenção.

### Key Entities *(include if feature involves data)*

- **AuthenticatedUser**: Representa a pessoa usuária autenticada na sessão corrente, contendo identificador único (`id`), e-mail cadastrado (`email`) e indicador booleano de posse de chave de inteligência artificial (`hasAiKey`).
- **UserSession**: Representa o estado da sessão ativa no navegador do cliente, incluindo o token de acesso (JWT) e o mecanismo de interceptação de requisições.
- **AiKeyStatus**: Representa o estado operacional da chave de inteligência artificial do usuário, compreendendo os estados:
  - `NOT_CONFIGURED`: Nenhuma chave cadastrada.
  - `ACTIVE_VERIFIED`: Chave cadastrada, ativa e com conexão confirmada com o modelo.
  - `ACTIVE_PROVISIONAL_DEMAND`: Chave cadastrada e aceita, porém com alerta upstream de alta demanda temporária.
  - `INVALID_OR_REVOKED`: Chave rejeitada no teste de autenticidade.
- **ThemePreference**: Preferência de exibição visual do usuário (`light`, `dark` ou conformidade com o sistema operacional).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pessoas usuárias conseguem completar o fluxo de cadastro e acessar a plataforma em menos de 30 segundos em condições normais de preenchimento.
- **SC-002**: 100% das tentativas de acesso direto a rotas protegidas por visitantes sem autenticação válida são interceptadas e encaminhadas para a página de login.
- **SC-003**: A alternância entre os temas claro e escuro acontece instantaneamente (tempo de resposta perceptível inferior a 100 milissegundos) sem causar oscilações visuais de renderização (*flashes*).
- **SC-004**: O layout shell mantém legibilidade e operabilidade completas em telas com larguras variando de 320 pixels (smartphones compactos) a 2560 pixels (telas ultrawide), sem surgimento de rolagem horizontal indesejada.
- **SC-005**: O processo de submissão e teste ativo da chave de API exibe retorno visual do status da conexão para a pessoa usuária em menos de 3 segundos em conexões estáveis.
- **SC-006**: 100% dos usuários que acessam o dashboard possuem chave de API cadastrada e conseguem identificar visualmente no cabeçalho se a conexão está verificada ou em demanda provisória.

## Assumptions

- O backend disponibiliza os endpoints `POST /api/auth/register`, `POST /api/auth/login` retornando token JWT e dados do usuário (`{ id, email, hasAiKey }`), e `PUT /api/user/ai-key` aceitando a chave e retornando status ativo (`{ success, message, status }`).
- A aplicação utiliza padrão de idioma em Português do Brasil (pt-BR) para os textos da interface.
- O fluxo inicial de autenticação contempla cadastro direto por e-mail e senha, sem exigir confirmação de e-mail com envio de link transacional nesta primeira iteração.
- O tema selecionado pelo usuário tem preferência salva no armazenamento local do navegador para manter consistência antes de qualquer requisição ao servidor.
- A chave de API do Google AI Studio nunca é exposta em logs de depuração do navegador, respeitando a privacidade e os princípios da Constituição do projeto.
