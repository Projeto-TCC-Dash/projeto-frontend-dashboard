# Quickstart & Validation Guide: Feature 009

Este documento descreve os cenários de validação ponta a ponta para verificar o correto funcionamento da Feature 009.

---

## 1. Pré-Requisitos
1. Backend rodando localmente na porta 3000 (`http://localhost:3000`) a partir de `projeto-backend-dashboard`.
2. Frontend rodando na porta 3001 (`http://localhost:3001`).
3. Variável de ambiente `NEXT_PUBLIC_GOOGLE_CLIENT_ID` configurada no `.env.local` (ou mockada durante os testes).

---

## 2. Cenários de Validação

### Cenário 1: Gestão de Nome e Foto de Perfil (`/settings/profile`)
1. Faça login na plataforma com credenciais habituais e navegue para `/settings/profile` (ou clique no avatar no cabeçalho).
2. No componente de avatar, clique para selecionar um arquivo de imagem (`.png`, `.jpg` ou `.webp` até 5MB).
3. Verifique se o preview instantâneo da foto é exibido imediatamente no formulário.
4. Altere o campo "Nome de exibição" para um novo valor e clique em "Salvar alterações".
5. Observe o toast de sucesso e valide que o nome e a foto no componente `UserNav` (no cabeçalho superior) são sincronizados em tempo real.
6. Clique na opção "Remover foto", confirme o salvamento e verifique se o avatar volta a exibir o círculo temático com as iniciais do nome.

### Cenário 2: Login Rápido com Google na Tela de Entrada (`/login`)
1. Acesse a tela de login desautenticado (`/login`).
2. Observe a renderização do botão oficial "Entrar com o Google" separado por divisor visual.
3. Clique em "Entrar com o Google". Na janela popup do Google, selecione uma conta Google que **NÃO esteja vinculada**.
4. Valide que o backend retorna 401/404 e a interface exibe a mensagem de orientação:
   > *"Nenhuma conta vinculada a este perfil Google. Faça login com suas credenciais para vincular."*
5. Entre com e-mail e senha tradicionais e conclua o fluxo do Cenário 3 abaixo para vincular a conta Google.
6. Saia da sessão e tente novamente o botão "Entrar com o Google": agora o login deve ser autenticado diretamente e redirecionar para o dashboard.

### Cenário 3: Vinculação e Desvinculação com Trava de Segurança (`/settings/security`)
1. Autenticado, navegue para `/settings/security` na seção "Contas Conectadas".
2. Clique em "Conectar Conta Google", complete a autorização no popup do Google.
3. Observe a atualização automática para o badge "Conectado", exibindo o e-mail Google associado e a data da conexão.
4. Teste a guarda de desvinculação: se a conta não possuir senha local (`hasLocalPassword: false`), valide que o sistema bloqueia o clique em desvincular exibindo aviso impeditivo.
5. Se possuir senha local ativa, clique em "Desvincular Google", confirme no diálogo modal e verifique que o status reverte para "Não vinculado".

### Cenário 4: Central de Exportação de Dados (`/settings/export`)
1. Navegue para a aba `/settings/export`.
2. Selecione o período desejado (ex: mês atual) e filtros opcionais de conta bancária ou categoria.
3. Clique no botão de exportação para **CSV**: verifique o download do arquivo `extrato-YYYY-MM.csv` com codificação UTF-8 (delimitado por `;`).
4. Clique no botão de exportação para **XLSX**: verifique o download do arquivo `.xlsx` com células monetárias formatadas em BRL.
5. Clique no botão de exportação para **PDF**: verifique o download do relatório `.pdf` com cabeçalho institucional e resumo de KPIs.
6. Valide que durante o download de cada relatório, o botão correspondente exibe indicador de carregamento e bloqueia cliques repetidos.

---

## 3. Testes Automatizados

Execute os testes com Vitest e React Testing Library:
```bash
pnpm test
pnpm typecheck
pnpm lint
```
