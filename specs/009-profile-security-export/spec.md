# Feature Specification: Perfil de Usuário, Autenticação Social Google (Login & Vínculo) e Central de Exportação

**Feature Branch**: `feature/009-profile-security-export`

**Created**: 2026-10-24

**Updated**: 2026-10-30

**Status**: Specified (Aguardando Planejamento Técnico)

> **Nota de Evolução Arquitetural (Feature 010 & 011)**: A experiência de gerenciamento de dados de identidade pessoal (US1) foi integrada ao componente unificado `UserProfileIdentityForm` sob a Feature 010 ([specs/010-profile-goals-segregation](../010-profile-goals-segregation/spec.md)), enquanto as metas financeiras foram desacopladas para `/settings/metas` na Feature 011 ([specs/011-settings-metas-profile](../011-settings-metas-profile/spec.md)).

**Input**: User description: "Implementar o módulo completo de Perfil, Vínculo Social com Google e Central de Exportação de Dados Financeiros, 100% alinhado aos contratos do backend:
1. Perfil e Avatar: Upload multipart/form-data via POST /api/user/avatar, exclusão via DELETE /api/user/avatar, atualização de nome via PATCH /api/user/profile e consulta via GET /api/user/profile.
2. Vínculo e Login Google (OAuth 2.0 / GIS): Login social no frontend via @react-oauth/google enviando idToken para POST /api/auth/google. Se o backend responder 401/404, o frontend deve avisar que a conta Google não está vinculada e instruir o usuário a entrar com e-mail/senha para vincular no perfil. Na tela de perfil (/settings/security), vincular (POST /api/auth/google/link) e desvincular (DELETE /api/auth/google/unlink) com trava se Google for o único método sem senha local.
3. Central de Exportação: Download de extratos filtrados (format=csv|xlsx|pdf) via GET /api/transactions/export.
4. Remoção estrita e permanente de 2FA e Cloudflare Turnstile."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gerenciamento de Identidade, Nome e Foto de Perfil (Priority: P1) 🎯 MVP

Como uma pessoa usuária autenticada na plataforma financeira, desejo acessar a aba de perfil da minha conta para visualizar meus dados cadastrais, atualizar meu nome de exibição e fazer upload ou remoção da minha foto de perfil, para que minha conta reflita minha identidade visual no dashboard e na barra de navegação.

**Why this priority**: Estabelece a identidade pessoal do usuário no sistema, personalizando a experiência visual e conferindo confiança ao utilizar a ferramenta.

**Independent Test**: Pode ser testado na aba `/settings/profile`: alterar o nome de exibição, selecionar um arquivo de imagem (JPG, PNG ou WebP até 5MB), visualizar a prévia instantânea, salvar as modificações e confirmar que o nome e a foto refletem imediatamente no avatar do topo da aplicação. Em seguida, testar a remoção do avatar e confirmar o retorno ao fallback de iniciais do nome.

**Acceptance Scenarios**:

1. **Given** a página `/settings/profile`, **When** carregada, **Then** exibe o avatar atual (ou fallback com iniciais), o nome de exibição, o e-mail cadastrado (somente leitura) e a data de criação da conta.
2. **Given** o formulário de identidade, **When** o usuário escolhe um arquivo de imagem válido (JPG, PNG ou WebP com tamanho <= 5MB), **Then** a interface apresenta um preview visual imediato do avatar no cliente antes de qualquer requisição ao servidor.
3. **Given** uma foto de perfil já cadastrada, **When** o usuário aciona a opção de remoção e confirma o salvamento, **Then** o sistema executa a exclusão física no backend (`DELETE /api/user/avatar`), desvincula o avatar e restaura o componente visual de iniciais do nome.
4. **Given** a edição de nome e/ou foto de perfil, **When** o usuário clica em "Salvar alterações", **Then** o sistema despacha as requisições apropriadas (`PATCH /api/user/profile` para o nome e `POST /api/user/avatar` multipart para o arquivo), exibe feedback de sucesso e sincroniza o cabeçalho (`UserNav`).
5. **Given** a seleção de um arquivo inválido (> 5MB ou formato incompatível), **When** avaliado pelo cliente, **Then** a interface intercepta antes do envio, exibe mensagem clara em português e preserva o avatar anterior.

---

### User Story 2 - Login Social com Google na Tela de Entrada (Priority: P1) 🎯 MVP

Como uma pessoa usuária com conta Google previamente vinculada, desejo realizar login na tela de autenticação (`/login`) utilizando um botão "Entrar com o Google" com um clique, para agilizar meu acesso à plataforma sem a necessidade de digitar e-mail e senha convencionais.

**Why this priority**: Reduz o atrito no fluxo de autenticação diário para usuários que utilizam o ecossistema Google, mantendo conformidade com as diretrizes visuais e de segurança do Google Identity Services (GIS).

**Independent Test**: Pode ser testado na tela `/login`: acionar o botão de login com o Google, autenticar na janela popup do Google e verificar se o `idToken` é enviado a `POST /api/auth/google`. Em caso de sucesso, confirmar o redirecionamento ao dashboard (ou onboarding de chave de IA se `hasAiKey: false`). Em caso de conta Google não vinculada (erro 401/404 do backend), verificar que a tela exibe orientação amigável instruindo o usuário a entrar com e-mail/senha para vincular sua conta no perfil.

**Acceptance Scenarios**:

1. **Given** a tela de login (`/login`), **When** renderizada, **Then** disponibiliza o botão oficial do Google ("Entrar com o Google") separado do formulário tradicional de e-mail e senha por um divisor ("ou continue com").
2. **Given** que o usuário clica em "Entrar com o Google" e autoriza o consentimento na janela do Google, **When** a credencial JWT (`idToken`) é emitida pelo Google Identity Services, **Then** o frontend envia o payload `{ idToken }` para `POST /api/auth/google`.
3. **Given** uma resposta 200 OK do endpoint `POST /api/auth/google`, **When** o token de sessão é recebido, **Then** o sistema armazena o token de autenticação, hidrata o usuário na sessão e redireciona para o dashboard (ou `/onboarding` se `hasAiKey: false`).
4. **Given** que a conta Google utilizada NÃO está vinculada a nenhum perfil cadastrado (retorno 401 ou 404 do backend), **When** o erro é interceptado, **Then** a interface apresenta um alerta claro: *"Nenhuma conta vinculada a este perfil Google. Faça login com seu e-mail e senha tradicionais e vincule sua conta Google nas configurações de Segurança."*
5. **Given** que o usuário fecha voluntariamente a janela popup do Google ou cancela o consentimento, **When** o evento de cancelamento ocorre, **Then** o frontend restaura o botão e a interface ao estado inicial sem disparar erros intrusivos.

---

### User Story 3 - Vínculo e Desvinculação de Conta Google no Perfil de Segurança (Priority: P2)

Como uma pessoa usuária autenticada na plataforma, desejo gerenciar a vinculação da minha conta Google na aba de Segurança (`/settings/security`), para associar minha credencial do Google à minha conta financeira existente ou desvinculá-la quando não desejar mais o login social.

**Why this priority**: Dá controle e flexibilidade à governança da conta, permitindo alternar ou associar credenciais sociais com salvaguardas explícitas contra bloqueio de acesso (lockout).

**Independent Test**: Pode ser testado na aba `/settings/security` na seção "Contas Conectadas": clicar em "Conectar Conta Google", autorizar no popup, verificar a chamada para `POST /api/auth/google/link` e conferir a atualização do status para "Conectado" com o e-mail Google associado. Em seguida, testar o fluxo de desvinculação (`DELETE /api/auth/google/unlink`) com diálogo de confirmação e validar a trava de segurança quando a conta não possui senha local cadastrada.

**Acceptance Scenarios**:

1. **Given** a seção "Contas Conectadas" em `/settings/security`, **When** o usuário não possui vínculo com o Google (`googleLinked: false`), **Then** exibe o badge "Não vinculado" e o botão "Conectar Conta Google".
2. **Given** que o usuário clica em "Conectar Conta Google", **When** o popup do Google retorna o `idToken`, **Then** o frontend dispara `POST /api/auth/google/link` enviando `{ idToken }`, atualiza os dados em cache do TanStack Query e exibe o status "Conectado" com o e-mail Google e a data de vinculação.
3. **Given** uma tentativa de vincular uma conta Google que já está associada a outro usuário (erro 409 Conflict), **When** interceptado, **Then** a interface informa que a conta Google selecionada já se encontra em uso por outro perfil no sistema.
4. **Given** uma conta Google conectada e uma senha local ativa (`hasLocalPassword: true`), **When** o usuário clica em "Desvincular Google" e confirma no diálogo modal, **Then** o sistema executa `DELETE /api/auth/google/unlink`, restaura o status para "Não vinculado" e exibe aviso de confirmação.
5. **Given** uma conta Google que constitui o único método de login do usuário (`hasLocalPassword: false`), **When** o usuário clica em desvincular o Google, **Then** a interface impede o desvínculo, abrindo um modal de aviso informativo explicando que ele deve cadastrar uma senha local antes de poder desvincular a conta Google.

---

### User Story 4 - Central de Exportação de Dados Financeiros (CSV, XLSX e PDF) (Priority: P2)

Como uma pessoa usuária que necessita arquivar comprovantes, prestar contas ou declarar impostos, desejo dispor de uma central dedicada de exportação de dados (`/settings/export`) para baixar meus lançamentos nos formatos CSV estruturado, XLSX formatado e PDF diagramado, aplicando filtros opcionais de período, conta bancária e categoria.

**Why this priority**: Assegura soberania sobre os próprios dados (LGPD) e atende necessidades fiscais e de auditoria contábil com relatórios profissionais.

**Independent Test**: Pode ser testado na aba `/settings/export`: selecionar os filtros desejados (ex: mês específico, conta bancária e categoria), acionar o download para cada formato (CSV, XLSX e PDF), validando que a chamada a `GET /api/transactions/export` recebe os query params corretos e que o navegador inicia o download do arquivo com os headers e nomes canônicos retornados pelo backend.

**Acceptance Scenarios**:

1. **Given** a aba `/settings/export`, **When** carregada, **Then** exibe controles de filtros: seleção de período (mês específico `YYYY-MM` ou intervalo `startDate` e `endDate`), seletor de conta bancária e seletor de categoria canônica.
2. **Given** os filtros definidos, **When** o usuário aciona "Exportar CSV", **Then** o frontend invoca `GET /api/transactions/export?format=csv&...`, recebe o stream de texto UTF-8 delimitado por ponto e vírgula com BOM (`\uFEFF`) e inicia o download do arquivo `.csv`.
3. **Given** os filtros definidos, **When** o usuário aciona "Exportar XLSX", **Then** o frontend invoca `GET /api/transactions/export?format=xlsx&...`, recebe a planilha Excel formatada com valores em BRL e inicia o download do arquivo `.xlsx`.
4. **Given** os filtros definidos, **When** o usuário aciona "Exportar PDF", **Then** o frontend invoca `GET /api/transactions/export?format=pdf&...`, recebe o documento PDF com cabeçalho institucional e resumo de KPIs e inicia o download do arquivo `.pdf`.
5. **Given** uma solicitação de download em andamento, **When** o backend está compilando o arquivo, **Then** os botões exibem estado de carregamento (`isPending`), impedindo cliques múltiplos simultâneos e emitindo toast de sucesso ou erro amigável ao finalizar.

---

### User Story 5 - Encerramento Seguro de Sessão (Logout) (Priority: P3)

Como uma pessoa usuária da plataforma, desejo dispor de uma ação de encerramento seguro de sessão na tela de configurações de segurança e no menu de usuário, para desconectar meu acesso ativo com invalidação de credenciais no cliente.

**Why this priority**: Evita que sessões permaneçam abertas indevidamente em dispositivos compartilhados ou após término de uso.

**Independent Test**: Pode ser testado na aba `/settings/security` ou no menu do usuário clicando em "Sair da Sessão": validar a destruição dos tokens locais (`auth_token`, `auth_user`), limpeza do cache do TanStack Query e redirecionamento para `/login`.

**Acceptance Scenarios**:

1. **Given** a tela `/settings/security`, **When** renderizada, **Then** exibe a seção de Encerramento de Sessão com botão proeminente "Sair da Sessão".
2. **Given** o clique em "Sair da Sessão", **When** acionado, **Then** os tokens locais de autenticação são expurgados do `localStorage`, o estado do `AuthProvider` é redefinido para não autenticado e o usuário é redirecionado imediatamente para `/login`.

---

## Edge Cases

- **Upload de arquivo inválido ou corrompido**: Se o usuário selecionar um arquivo com extensão não permitida ou superior a 5MB, a interface deve interceptar no cliente via Zod/validador antes de efetuar a requisição, exibindo mensagem amigável e preservando o avatar anterior.
- **Tentativa de desvincular único método de acesso**: Bloqueio ativo no cliente via modal informativo quando `hasLocalPassword: false`, alinhado ao retorno de erro 400 do backend (`Não é possível desvincular a conta Google pois ela é o único método de autenticação da conta. Cadastre uma senha antes de desvincular.`).
- **Conta Google já vinculada a outro usuário**: Tratamento do código HTTP 409 retornando mensagem explicativa na interface sem corromper o estado atual.
- **Login social com conta Google não vinculada**: Tratamento do código HTTP 401 ou 404 em `POST /api/auth/google`, orientando o usuário com mensagem didática na tela de login a entrar com e-mail e senha tradicionais e vincular a conta na aba de Segurança.
- **Cancelamento voluntário de popup Google**: Fechamento voluntário do modal/popup do Google pelo usuário deve restaurar o estado visual do botão sem lançar exceções não tratadas nem travar a tela.
- **Exportação de período sem lançamentos**: Tratamento resiliente pelo backend retornando extrato zerado ou vazio com cabeçalhos consistentes.
- **2FA e Cloudflare Turnstile**: Nenhuma tela, input, validação ou dependência desses mecanismos deve estar presente.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer visualização e edição de dados cadastrais na rota `/settings/profile`, permitindo alterar o nome de exibição através de requisição `PATCH /api/user/profile`.
- **FR-002**: O sistema DEVE permitir upload de foto de perfil via `POST /api/user/avatar` (`multipart/form-data`, campo `file`), aceitando formatos JPG, PNG e WebP com tamanho limite de 5MB.
- **FR-003**: O sistema DEVE permitir exclusão de foto de perfil via `DELETE /api/user/avatar`, restaurando o avatar com as iniciais do nome.
- **FR-004**: O sistema DEVE oferecer prévia instantânea client-side no componente de avatar antes da persistência no servidor.
- **FR-005**: A tela de login (`/login`) DEVE disponibilizar a opção de login social com Google através da biblioteca oficial `@react-oauth/google`, despachando a credencial JWT `{ idToken }` para o endpoint `POST /api/auth/google`.
- **FR-006**: Ao receber resposta 200 de `POST /api/auth/google`, a aplicação DEVE persistir a sessão de forma segura e redirecionar para `/dashboard` (ou `/onboarding` se `hasAiKey: false`).
- **FR-007**: Ao receber resposta 401 ou 404 de `POST /api/auth/google`, o frontend DEVE exibir mensagem clara orientando o usuário a efetuar login com e-mail/senha e realizar a vinculação no perfil.
- **FR-008**: A seção "Contas Conectadas" na rota `/settings/security` DEVE exibir o status de vinculação do Google (`googleLinked`, `googleEmail`, `googleLinkedAt`).
- **FR-009**: O sistema DEVE permitir a vinculação da conta Google logada através de `POST /api/auth/google/link` enviando `{ idToken }`.
- **FR-010**: O sistema DEVE permitir a desvinculação da conta Google através de `DELETE /api/auth/google/unlink`.
- **FR-011**: O sistema DEVE impedir a desvinculação da conta Google se `hasLocalPassword: false`, alertando o usuário sobre a necessidade de definir uma senha antes da ação.
- **FR-012**: O sistema DEVE fornecer a central de exportação em `/settings/export` consumindo `GET /api/transactions/export` com os formatos `csv`, `xlsx` e `pdf`.
- **FR-013**: A central de exportação DEVE suportar os filtros opcionais `month` (`YYYY-MM`), `startDate`, `endDate`, `accountId` e `category`.
- **FR-014**: O sistema DEVE acionar o download do arquivo preservando a codificação adequada (UTF-8 com BOM para CSV, binário para XLSX e PDF) e o nome indicado no header `Content-Disposition`.
- **FR-015**: O sistema DEVE fornecer ação de logout seguro, destruindo tokens no cliente e redirecionando para a rota de login pública.
- **FR-016**: O sistema NÃO DEVE incluir componentes, validações, rotas ou dependências de 2FA ou Cloudflare Turnstile.

---

### Key Entities

- **UserProfile**: `{ id: string; email: string; name?: string; avatarUrl?: string | null; hasAiKey: boolean; security?: UserSecuritySettings; createdAt?: string }`
- **UserSecuritySettings**: `{ hasLocalPassword: boolean; googleLinked: boolean; googleEmail?: string; googleLinkedAt?: string }`
- **GoogleAuthPayload**: `{ idToken: string }`
- **ExportFilterParams**: `{ format: 'csv' | 'xlsx' | 'pdf'; month?: string; startDate?: string; endDate?: string; accountId?: string; category?: string }`

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O upload e preview de fotos de perfil ocorrem em menos de 100ms no cliente para imagens até 5MB.
- **SC-002**: 100% dos fluxos de cancelamento ou fechamento de popup do Google mantêm a tela de login ou segurança responsiva sem congelamento de interface.
- **SC-003**: 100% das tentativas de desvinculação do Google sem senha local ativa são bloqueadas no cliente com orientação explicativa.
- **SC-004**: Download de relatórios financeiros (CSV, XLSX e PDF) disparado diretamente com headers nativos e salvamento no sistema de arquivos do usuário.
- **SC-005**: 100% de aprovação na suíte de testes unitários e de integração com Vitest (`pnpm test`) e zero erros estáticos no TypeScript (`pnpm typecheck`).
