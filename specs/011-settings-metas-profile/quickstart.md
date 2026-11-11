# Quickstart & Validation Guide: Perfil de Investidor e Metas (/settings/metas)

**Feature**: `011-settings-metas-profile`  
**Date**: 2026-10-24  
**Status**: Ready

## Cenários de Validação Ponta a Ponta

### Cenário 1: Acesso a Perfil e Metas via Menu Lateral
1. No menu lateral do dashboard, clique no item **"Perfil e Metas"**.
2. **Resultado Esperado**:
   - A aplicação navega para a URL `/settings/metas`.
   - A página carrega unicamente o formulário de perfil de investidor (tolerância a risco, metas financeiras prioritárias, renda declarada e regime de trabalho).
   - Nenhuma aba de configurações de conta (`SettingsNav`) é exibida na tela.

### Cenário 2: Atualização do Perfil de Risco do Investidor
1. Na página `/settings/metas`, altere a opção de perfil de risco (ex: selecione "Moderado").
2. Clique no botão de salvar alterações.
3. **Resultado Esperado**:
   - Mensagem de sucesso confirma que o perfil financeiro/investidor foi atualizado.
   - Os dados persistem sem recarregar a página.

### Cenário 3: Acesso Exclusivo a `/settings/profile` pelo Cabeçalho
1. No cabeçalho superior (navbar), clique no avatar/nome do usuário (`UserNav`).
2. **Resultado Esperado**:
   - A aplicação navega para `/settings/profile`.
   - O layout de configurações da conta com as abas (`SettingsNav`) é exibido normalmente.
   - O formulário unificado de foto e nome de exibição é apresentado.

### Cenário 4: Redirecionamento da Rota Anterior (`/goals`)
1. Digite diretamente na barra de navegação `/goals`.
2. **Resultado Esperado**:
   - O sistema redireciona com sucesso para `/settings/metas`.
