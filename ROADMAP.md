# 🗺️ Roadmap de Evolução — Frontend (v1.1.0 & v1.2.0+)

Este documento estabelece o planejamento estratégico, arquitetura de componentes e a esteira de desenvolvimento do **Frontend (`projeto-frontend-dashboard`)** para os ciclos **v1.1.0** e **v1.2.0**, em total conformidade com a Constituição Técnica, os princípios de **Schema-Driven Development (SDD)** e os fluxos do **Spec-Kit**.

---

## 📌 Status Atual do Projeto

| Versão | Status | Branches / Tags | Cobertura de Testes |
|---|---|---|---|
| **v1.0.0** | ✅ Concluída em Produção | Tag `v1.0.0` / Branch `master` | 151 testes unitários/integração verdes |
| **v1.1.0** | ✅ Concluída em Produção | Tag `v1.1.0` / Branches `develop` e `master` | 239 testes unitários/integração verdes |
| **v1.2.0** | ✅ Implementado & Validado | Branch `feature/009-profile-security-export` | 316 testes unitários/integração verdes |

### Histórico de Features Entregues (v1.0.0, v1.1.0 & v1.2.0)
- `specs/001-auth-shell-byok`: Autenticação JWT, Shell responsivo (Sidebar/Navbar), tema Dark/Light e modal BYOK Gemini.
- `specs/002-transactions-management`: Upload OFX/CSV, tabela paginada com 9 categorias iniciais, edição inline e classificação por IA.
- `specs/003-dashboard-metrics-analysis`: KPIs mensais, gráfico de rosca de categorias, diagnóstico do mês em cache e recomendações.
- `specs/004-virtual-financial-advisor`: Assistente virtual conversacional via streaming contínuo SSE com Google Gemini.
- `specs/005-financial-profile-onboarding`: Regime de renda, renda mensal declarada em BRL, metas financeiras e calibração de perfil.
- `specs/006-accounts-management`: Gestão de múltiplas contas e cartões, patrimônio líquido unificado e exclusão em cascata.
- `specs/007-transactions-extended-deletion-categories`: 11 categorias canônicas, vínculo de contas e exclusão pontual atômica.
- `specs/008-dashboard-invoice-segregation-profile`: Segregação contábil de faturas de cartão e diagnóstico IA calibrado por regime de renda.
- `specs/009-profile-security-export`: Identidade do usuário, segurança multicamadas (2FA via e-mail e Google OAuth) e central de exportação (CSV, PDF, XLSX).
- `specs/010-profile-goals-segregation`: Segregação de metas financeiras e formulário unificado de identidade (foto + nome) com salvamento atômico.
- `specs/011-settings-metas-profile`: Rota `/settings/metas` dedicada e isolada para perfil de investidor/metas, preservação de `/goals` como redirecionamento e âncora de conta em `/settings/profile`.

---

## 🎯 Visão Geral dos Ciclos v1.1.0 e v1.2.0

```mermaid
flowchart TD
    subgraph v110 ["Ciclo v1.1.0 (Entregue & Tag v1.1.0)"]
        F005["Feature 005: Perfil Financeiro, Regime de Renda e Metas"]
        F006["Feature 006: Gestão Multiconta e Cartões de Crédito (/accounts)"]
        F007["Feature 007: Exclusão de Transações, 11 Categorias e Associação de Contas"]
        F008["Feature 008: Dashboard com Segregação de Faturas e IA Calibrada"]
    end

    subgraph v120 ["Ciclo v1.2.0 (Implementado & Validado)"]
        F009["Feature 009: Perfil de Usuário, Segurança (2FA & Google) e Central de Exportação"]
        F010["Feature 010: Segregação de Metas e Identidade Unificada (Foto + Nome)"]
        F011["Feature 011: Rota /settings/metas e Redirecionador /goals"]
    end

    F005 --> F006 --> F007 --> F008
    F008 --> Release110["Release v1.1.0 (Merge develop -> master & Tag v1.1.0)"]
    Release110 --> F009
    F009 --> F010 --> F011
    F011 --> Release120["Release v1.2.0 (Merge develop -> master & Tag v1.2.0)"]
```

---

## 📋 Features Planejadas (Ciclo v1.1.0)

### 👤 Feature 005: Perfil Financeiro, Regime de Renda e Metas (`specs/005-financial-profile-onboarding`)
**Objetivo**: Permitir ao usuário personalizar seu contexto financeiro de forma 100% voluntária, fornecendo regime de renda, renda declarada, metas prioritárias e perfil de risco, que serão consumidos pelo Gemini para calibração das análises.

- **Contratos de API**:
  - `GET /api/user/profile`: Retorna dados cadastrais e o objeto `financialProfile`.
  - `PUT /api/user/profile`: Atualiza dados do perfil voluntário (invalida automaticamente cache de IA no backend).
- **Entregas de Interface & Componentes**:
  - Nova tela/seção `/settings/profile` (ou aba dedicada no shell de configurações).
  - Banner discreto no Dashboard convidando ao preenchimento do perfil (com opção de dispensar).
  - Seletor visual de **Regime de Renda**: `CLT`, `PJ_AUTONOMO`, `PUBLIC_SERVANT`, `ENTREPRENEUR`, `STUDENT`, `RETIRED`, `OTHER`.
  - Input de **Renda Mensal Declarada** com formatação de moeda brasileira (BRL) e validação de valores não negativos.
  - Seletor múltiplo em chips de **Metas Financeiras**: `RESERVA_EMERGENCIA`, `QUITAR_DIVIDAS`, `COMPRAR_IMOVEL`, `INVESTIR_LONGO_PRAZO`, `CONTROLE_GASTOS`.
  - Seletor de **Perfil de Risco**: `CONSERVATIVE`, `MODERATE`, `AGGRESSIVE`.
  - Invalidação reativa via TanStack Query (`userProfile`, `financialAnalysis`, `chatSession`).
- **Comandos Spec-Kit**:
  ```bash
  /speckit-specify Criar tela e componentes de perfil financeiro voluntário consumindo GET /api/user/profile e PUT /api/user/profile, com regime de renda, renda declarada em BRL, seleção múltipla de metas financeiras e perfil de risco, banner contextual no dashboard e invalidação reativa de cache.
  ```

---

### 🏦 Feature 006: Gestão Multiconta e Cartões de Crédito (`specs/006-accounts-management`)
**Objetivo**: Oferecer visão consolidada e detalhada de múltiplas contas e cartões, exibindo patrimônio líquido unificado e permitindo o gerenciamento completo de cada instituição.

- **Contratos de API**:
  - `GET /api/accounts`: Listagem de contas com saldo individual e `netWorth` consolidado.
  - `POST /api/accounts`: Criação de conta manual (`name`, `type`, `initialBalance`, `institution`, `color`).
  - `PATCH /api/accounts/:id`: Edição de metadados da conta.
  - `DELETE /api/accounts/:id?cascade=true|false`: Exclusão segura com política de cascata.
- **Entregas de Interface & Componentes**:
  - Nova rota e página `/accounts` com navegação na Sidebar/Navbar.
  - Card de Destaque: **Patrimônio Líquido Total** (`netWorth`) com indicador visual de saldo positivo/negativo.
  - Grid de Cards de Contas agrupadas ou categorizadas por tipo:
    - `CHECKING` (Conta Corrente)
    - `CREDIT_CARD` (Cartão de Crédito)
    - `INVESTMENT` (Investimentos)
    - `CASH` (Dinheiro em Espécie)
    - `OTHER` (Outras Contas)
  - Modal "Nova Conta" / "Editar Conta" com:
    - Input de nome/apelido.
    - Seletor de tipo de conta.
    - Input de saldo inicial em BRL.
    - Seletor de cor hexadecimal com paleta pré-definida e color picker.
  - Diálogo de Confirmação de Exclusão alertando sobre transações vinculadas e checkbox para exclusão em cascata (`cascade=true`).
- **Comandos Spec-Kit**:
  ```bash
  /speckit-specify Criar módulo de gestão de contas e cartões em /accounts consumindo GET /api/accounts, POST /api/accounts, PATCH /api/accounts/:id e DELETE /api/accounts/:id, exibindo cards de saldo por tipo, card de patrimônio líquido consolidado, modal de criação/edição com seletor de cor e diálogo de exclusão segura com suporte a cascade.
  ```

---

### 🏷️ Feature 007: Exclusão de Transações, 11 Categorias Canônicas e Associação de Contas (`specs/007-transactions-extended-deletion-categories`)
**Objetivo**: Estender a tela de transações com suporte às 11 categorias canônicas oficiais, vincular lançamentos a contas e permitir a exclusão pontual de transações duplicadas ou incorretas.

- **Contratos de API**:
  - `DELETE /api/transactions/:id`: Exclusão pontual atômica de transação.
  - `PATCH /api/transactions/:id`: Suporte à alteração de `accountId`, além de `category` e `cleanDescription`.
  - `POST /api/transactions/upload?accountId=<id>`: Upload de OFX/CSV com vinculação opcional à conta selecionada.
  - `GET /api/transactions?accountId=<id>`: Filtro por conta bancária.
- **Entregas de Interface & Componentes**:
  - Atualização do Enum e Badges para as **11 Categorias Canônicas**:
    - Adição de `Pagamento de Fatura` (#64748B) e `Investimentos` (#06B6D4).
  - Ação de **Excluir Transação** na tabela com diálogo de confirmação (alert dialog) e toast de feedback.
  - Dropdown de Conta no modal de upload de arquivos (permitindo associar o arquivo importado a uma conta específica).
  - Coluna ou Badge de Conta na tabela de transações.
  - Filtro por Conta no cabeçalho da tabela de transações.
  - Atualização do modal de edição inline para permitir transferir a transação para outra conta.
- **Comandos Spec-Kit**:
  ```bash
  /speckit-specify Estender módulo de transações adicionando suporte às 11 categorias canônicas (incluindo Pagamento de Fatura e Investimentos), ação de exclusão via DELETE /api/transactions/:id com diálogo de confirmação, seletor de conta no upload de extratos e filtro por conta na listagem.
  ```

---

### 📊 Feature 008: Dashboard com Segregação de Faturas e Diagnóstico IA Calibrado (`specs/008-dashboard-invoice-segregation-profile`)
**Objetivo**: Aprimorar o dashboard principal com segregação inteligente de faturas de cartão de crédito e integração do parecer calibrado do Gemini de acordo com o regime de renda e metas do usuário.

- **Contratos de API**:
  - `GET /api/analysis/:month`: Consumo do campo `invoiceSettlements` e parecer calibrado.
- **Entregas de Interface & Componentes**:
  - Ajuste no card de Despesas Primárias (Consumo Real) vs Quitação de Faturas:
    - Novo Card de KPI: **Quitação de Faturas** (`invoiceSettlements`), informando o valor de liquidação de cartão de crédito sem duplicar nas despesas primárias.
    - Saldo Líquido atualizado: `totalIncome - totalExpenses - invoiceSettlements`.
  - Ajuste no Gráfico de Rosca de Categorias: faturas de cartão são discriminadas corretamente sem distorcer o percentual de consumo.
  - Card de Diagnóstico do Mês com IA Calibrada:
    - Alerta de meta de **Reserva de Emergência sob medida** (exibe recomendação de 3 a 6 meses de gastos para CLT vs 6 a 12 meses para PJ/Autônomo).
    - Destaque das recomendações alinhadas às metas declaradas pelo usuário (ex: desendividamento prioritário quando a meta for `QUITAR_DIVIDAS`).
- **Comandos Spec-Kit**:
  ```bash
  /speckit-specify Atualizar o dashboard financeiro para exibir card segregado de Quitação de Faturas (invoiceSettlements), recalcular saldo líquido sem duplicidade contábil, ajustar gráfico de distribuição e exibir diagnóstico da IA com metas de reserva calibradas pelo perfil de renda do usuário.
  ```

---

### 🛡️ Feature 009: Perfil de Usuário, Segurança (2FA & Google) e Central de Exportação (`specs/009-profile-security-export`)
**Objetivo**: Oferecer gestão completa de identidade e perfil do usuário (avatar e nome), central de segurança avançada com vinculação de conta Google (OAuth 2.0), autenticação em dois fatores (2FA via e-mail com desafio OTP de 6 dígitos) e encerramento de sessão, além de uma central de exportação de dados financeiros formatados em CSV, PDF e XLSX.

- **Contratos de API**:
  - `POST /api/user/avatar`: Upload de avatar (`multipart/form-data`, validação de JPG/PNG/WebP até 5MB) com preview e invalidação de cache.
  - `DELETE /api/user/avatar`: Exclusão da foto de perfil personalizada com retorno ao fallback de iniciais.
  - `PUT /api/user/profile`: Atualização do nome de usuário (`name`, 2-100 caracteres) com sincronização imediata no shell.
  - `POST /api/auth/google/link` e `DELETE /api/auth/google/unlink`: Vinculação/desvinculação de conta Google com proteção contra desvinculação se for o único método de login.
  - `POST /api/auth/2fa/setup`: Disparo de e-mail com código OTP de 6 dígitos para o endereço do usuário logado.
  - `POST /api/auth/2fa/verify`: Ativação definitiva do 2FA após conferência de código OTP de 6 dígitos.
  - `DELETE /api/auth/2fa`: Desativação do 2FA mediante confirmação de senha/código de segurança.
  - `POST /api/auth/logout`: Revogação de sessão no servidor com expurgo de tokens em cookies/storage local e redirecionamento para `/login`.
  - `GET /api/export/transactions?format=csv|pdf|xlsx&month=YYYY-MM`: Download de extrato de transações com formatação localizada (BRL, datas PT-BR).
- **Entregas de Interface & Componentes**:
  - **Aba de Perfil (`/settings/profile`)**:
    - Componente de foto/avatar com visualizador, botão de upload com preview imediato, validação client-side (tamanho/tipo) e botão de exclusão com alerta de confirmação.
    - Formulário de identidade com input controlado para edição de nome de usuário e botão de salvar com feedback de sucesso/erro.
    - *(Aprimorado na Feature 010)*: Integrado no componente unificado `UserProfileIdentityForm` com salvamento atômico conjunto de foto e nome.
  - **Aba de Segurança (`/settings/security`)**:
    - Card de Métodos de Login com indicador visual de status de conta Google vinculada e ações de vincular/desvincular.
    - Card de Autenticação em 2 Fatores (2FA) com chave de ativação, modal de desafio OTP de 6 dígitos e badge de status (Ativo/Inativo).
    - Card de Encerramento de Sessão com botão de Logout seguro e diálogo de confirmação.
  - **Central de Exportação de Dados (`/settings/export` ou modal dedicado)**:
    - Seletor de formato (CSV, PDF, XLSX) com ícones e descrições claras de compatibilidade.
    - Filtro de período (Mês específico ou Todo o histórico).
    - Feedback visual de progresso/loading e acionamento nativo de download com nomenclatura padronizada (`transacoes-YYYY-MM.ext`).
- **Comandos Spec-Kit**:
  ```bash
  /speckit-specify Criar especificação para perfil de usuário (upload/edição/exclusão de avatar e nome), segurança da conta (vincular Google, 2FA via e-mail e logout) e central de exportação de relatórios em CSV, PDF e XLSX formatados.
  /speckit-plan
  /speckit-tasks
  /speckit-implement
  /speckit-converge
  ```

---

### 🎯 Feature 010: Segregação de Metas e Formulário Unificado de Identidade (`specs/010-profile-goals-segregation`)
**Objetivo**: Desacoplar a definição de metas e perfil de investidor das configurações cadastrais da conta, unificar a edição de foto e nome em um único formulário atômico, e posicionar o identificador do cabeçalho como âncora de entrada oficial para `/settings/profile`.

- **Entregas de Interface & Componentes**:
  - `UserProfileIdentityForm`: Formulário integrado de identidade com preview local instantâneo, descarte de memória via `URL.revokeObjectURL`, marcação pendente de exclusão de foto e botão "Salvar alterações" coordenado.
  - Cabeçalho `UserNav`: Exibição visual do avatar (ou iniciais) com link de redirecionamento para `/settings/profile`.
  - Desvinculação inicial de metas financeiras do shell de configurações pessoais.
- **Comandos Spec-Kit**:
  ```bash
  /speckit-specify Segregar metas financeiras da área de dados cadastrais, unificar edição de nome e avatar com salvamento conjunto e vincular clique no cabeçalho para /settings/profile.
  /speckit-plan
  /speckit-tasks
  /speckit-implement
  /speckit-converge
  ```

---

### 📈 Feature 011: Perfil de Investidor em `/settings/metas` e Isolamento de Shell (`specs/011-settings-metas-profile`)
**Objetivo**: Estabelecer a rota oficial `/settings/metas` para o perfil de investidor e metas patrimoniais, garantindo layout limpo e focado (sem abas de conta), link direto na Sidebar ("Perfil e Metas") e compatibilidade com a rota legada `/goals` via redirecionador.

- **Entregas de Interface & Componentes**:
  - Nova página `/settings/metas` renderizando exclusivamente `FinancialProfileForm`.
  - `SettingsLayout`: Isolamento condicional omitindo `SettingsNav` e cabeçalho de conta quando em `/settings/metas`.
  - `Sidebar`: Item "Perfil e Metas" apontando para `/settings/metas`.
  - Redirecionador automático em `app/(dashboard)/goals/page.tsx` para `/settings/metas`.
- **Comandos Spec-Kit**:
  ```bash
  /speckit-specify Configurar rota /settings/metas para perfil de investidor e metas patrimoniais, isolar layout de conta, atualizar Sidebar e redirecionar rota legada /goals.
  /speckit-plan
  /speckit-tasks
  /speckit-implement
  /speckit-converge
  ```

---

## 🛠️ Regras de Governança e Qualidade (Constituição Técnica)

Para todas as features do roadmap, as seguintes regras são inegociáveis:
1. **TypeScript Estrito & Zero `any`**: Tipagens dinâmicas devem ser resolvidas com Zod ou interfaces canônicas de `src/types/api.ts`.
2. **TanStack Query Reativo**: Mutações (`POST`, `PATCH`, `DELETE`) devem invalidar as queries relacionadas (`invalidateQueries`), garantindo consistência sem recarregamento de página.
3. **Portais para Modais**: Todos os modais (`Dialog`, `AlertDialog`) devem renderizar via `createPortal(..., document.body)` para evitar bugs de contêineres CSS (`backdrop-blur`).
4. **Resiliência de Rede**: Interceptar falhas de conexão no chat SSE e requisições HTTP, fornecendo mensagens amigáveis em português e opção de repetição.
5. **Cobertura de Testes**: Cada feature deve incluir testes de unidade e integração (Vitest + Testing Library) com 100% de aprovação antes do merge.

---

## 📅 Sequência Recomendada de Execução

1. **Ciclo v1.1.0 (Concluído)**: Features 005 a 008 entregues e consolidadas na tag `v1.1.0`.
2. **Ciclo v1.2.0 (Concluído & Validado)**:
   - Branch: `feature/009-profile-security-export`
   - Features consolidadas: 009, 010 e 011 entregues com **316 testes verdes** e 0 erros de tipagem.
   - Etapas concluídas: `/speckit-specify` ✅, `/speckit-plan` ✅, `/speckit-tasks` ✅, `/speckit-implement` ✅, `/speckit-converge` ✅
3. **Release v1.2.0**: Bateria de testes finais, merge de `feature/009-profile-security-export` em `develop` $\rightarrow$ `master` e criação da tag `v1.2.0`.
