# Quickstart & Validation Guide: Segregação de Metas e Central de Perfil

**Feature**: `010-profile-goals-segregation`  
**Date**: 2026-10-24  
**Status**: Ready

## Pré-requisitos
- Dependências instaladas (`pnpm install`).
- Servidor de desenvolvimento rodando (`pnpm dev`) ou ambiente de testes disponível.
- Usuário autenticado na aplicação.

---

## Cenários de Validação Ponta a Ponta

### Cenário 1: Validação da Aba Dedicada de Metas Financeiras
1. No menu lateral do dashboard, clique no item **"Perfil e Metas"**.
2. **Resultado Esperado**:
   - A URL no navegador navega para `/goals`.
   - A página exibe o formulário de metas financeiras (`FinancialProfileForm`: renda estimada, reserva de emergência, perfil de risco e objetivos).
   - Nenhuma informação de identidade de usuário (nome, e-mail, foto), abas de configurações ou central de exportação é exibida nesta página.
3. Preencha ou altere a reserva de emergência ou objetivos e clique em "Salvar Metas".
4. **Resultado Esperado**: Feedback visual de confirmação de metas atualizadas.

---

### Cenário 2: Acesso ao Perfil de Usuário pelo Cabeçalho
1. No cabeçalho superior (navbar), localize o componente de identificação do usuário com avatar e nome/e-mail (`UserNav`).
2. Clique no identificador do usuário.
3. **Resultado Esperado**:
   - A aplicação navega para `/settings/profile`.
   - As abas de navegação de configurações são renderizadas: "Informações de Identidade", "Segurança & Sessão" e "Central de Exportação".
   - A aba ativa inicial é "Informações de Identidade".

---

### Cenário 3: Salvamento Conjunto e Atômico de Nome e Foto de Perfil
1. Na aba `/settings/profile` ("Informações de Identidade"):
   - Observe que a foto e o nome estão reunidos no mesmo formulário.
   - O botão "Salvar alterações" inicia desabilitado.
2. Altere o nome de exibição no campo de texto.
3. Clique em "Escolher foto" e selecione uma imagem válida (JPEG/PNG/WebP até 5MB).
4. **Resultado Esperado**:
   - O preview da imagem é exibido imediatamente em tela.
   - Nenhuma requisição de upload é disparada ainda.
   - O botão "Salvar alterações" torna-se habilitado.
5. Clique em **"Salvar alterações"**.
6. **Resultado Esperado**:
   - O sistema realiza o upload da imagem e a atualização do nome de forma coordenada.
   - Um aviso toast de sucesso confirma a operação ("Perfil atualizado com sucesso").
   - O avatar e o nome no cabeçalho superior (`UserNav`) atualizam imediatamente com os novos valores.
   - O botão "Salvar alterações" retorna ao estado desabilitado até novas modificações.

---

### Cenário 4: Navegação entre Abas de Configuração
1. Na página de configurações, clique na aba **"Segurança & Sessão"** (`/settings/security`).
   - Verifique os controles de contas vinculadas e opção de logout.
2. Clique na aba **"Central de Exportação"** (`/settings/export`).
   - Verifique os controles de geração e download de arquivos CSV, PDF e XLSX.

---

## Comandos de Validação Automatizada

Para validar a integridade dos testes e dos contratos de tipagem:

```bash
# Executar a suíte de testes unitários e de integração
pnpm test

# Executar checagem estrita de tipos TypeScript
pnpm typecheck

# Executar linter
pnpm lint
```
