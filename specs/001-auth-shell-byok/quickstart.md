# Guia Rápido de Validação (Quickstart): Autenticação, Shell Base e BYOK

**Feature**: `001-auth-shell-byok`  
**Date**: 2026-10-19  

Este guia descreve os cenários de teste manuais e automatizados para validar a entrega da Feature 1 fim a fim.

---

## 1. Pré-Requisitos e Setup

1. Instalar dependências necessárias do projeto:
   ```bash
   pnpm install
   ```
2. Garantir conformidade de tipagem estrita e lint:
   ```bash
   pnpm typecheck
   pnpm lint
   ```
3. Executar o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```
   Acesse a aplicação em `http://localhost:3000`.

---

## 2. Cenários de Validação Fim a Fim

### Cenário 1: Proteção de Rota e Redirecionamento
1. Em uma janela anônima, acesse diretamente `http://localhost:3000/` ou `http://localhost:3000/dashboard`.
2. **Resultado Esperado**: O sistema detecta a ausência de sessão ativa e redireciona automaticamente para `http://localhost:3000/login`.

### Cenário 2: Fluxo de Cadastro e Redirecionamento para Onboarding
1. Acesse `http://localhost:3000/register`.
2. Tente submeter com senha curta (< 8 caracteres).
   - **Resultado Esperado**: O formulário bloqueia o envio e exibe alerta visual de senha mínima de 8 caracteres.
3. Preencha um e-mail válido (ex: `usuario.teste@example.com`) e senha `SenhaForte123!`.
4. Clique em "Criar Conta".
5. **Resultado Esperado**: O backend cria o usuário, retorna o token JWT e a entidade `User` com `hasAiKey: false`. A aplicação armazena a sessão e direciona o usuário imediatamente para a tela de ativação obrigatória `http://localhost:3000/onboarding`.

### Cenário 3: Validação Ativa da Chave BYOK com Sucesso (`ACTIVE_VERIFIED`)
1. Na tela de onboarding (ou no modal de chave de IA), cole uma chave válida do Google AI Studio (`AIzaSy...`).
2. Clique em "Salvar e Testar Conexão".
3. **Resultado Esperado**:
   - Botão entra em estado de carregamento (`isPending`).
   - A requisição `PUT /api/user/ai-key` retorna sucesso com status `ACTIVE_VERIFIED`.
   - O sistema exibe toast de confirmação e redireciona o usuário para o dashboard principal (`/`).
   - No cabeçalho da aplicação, o indicador de status da IA exibe badge verde com o rótulo "IA Conectada".

### Cenário 4: Validação da Chave sob Alta Demanda Temporária (`ACTIVE_PROVISIONAL_DEMAND`)
1. Simule uma resposta `200` com `{ success: true, message: "Alta demanda", status: "ACTIVE_PROVISIONAL_DEMAND" }`.
2. **Resultado Esperado**:
   - A chave é salva no backend.
   - O sistema exibe notificação informativa de sucesso avisando sobre a alta demanda do Google AI Studio.
   - O usuário tem o avanço liberado para o dashboard principal.
   - O cabeçalho exibe badge em tom de atenção (amarelo) com o rótulo "Alta Demanda (Provisório)".

### Cenário 5: Rejeição de Chave Inválida
1. Tente cadastrar uma chave inválida ou revogada (ex: `AIzaSyInvalida1234567890`).
2. Clique em "Salvar e Testar Conexão".
3. **Resultado Esperado**:
   - A requisição falha com status de erro explicativo.
   - O sistema exibe o erro ao usuário, não altera a chave anterior e bloqueia o avanço.

### Cenário 6: Responsividade do Shell e Alternância de Tema
1. No painel autenticado, pressione a tecla de atalho `D` ou clique no botão de alternância de tema no cabeçalho.
2. **Resultado Esperado**: A interface alterna entre claro e escuro instantaneamente (< 100ms) sem flashes na tela. Recarregue a página e certifique-se de que o tema preferido foi preservado.
3. Redimensione a janela para 375px (emulador de celular).
4. **Resultado Esperado**: A navegação se adapta a menu hambúrguer recolhível sem gerar barra de rolagem horizontal.

### Cenário 7: Logout e Revogação Local
1. No menu de usuário (exibindo o e-mail cadastrado), clique em "Sair".
2. **Resultado Esperado**: O token é expurgado do `localStorage`, o contexto de autenticação é limpo e a tela transiciona para `/login`.
