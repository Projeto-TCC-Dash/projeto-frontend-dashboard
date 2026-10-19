# Quickstart: Validação da Gestão de Transações Financeiras

**Feature Branch**: `002-transactions-management`  
**Date**: 2026-10-19  
**Status**: Ready  

Este guia apresenta o roteiro prático e reprodutível para validar de ponta a ponta as funcionalidades de Gestão de Transações: listagem com filtros, upload drag-and-drop de extratos OFX/CSV, edição manual via Dialog e categorização automática em lote com BYOK.

---

## 1. Pré-Requisitos e Ambiente

1. **Repositório configurado**:
   ```bash
   pnpm install
   ```

2. **Servidor de desenvolvimento**:
   ```bash
   pnpm dev
   ```
   Acesse a aplicação em `http://localhost:3000`.

3. **Autenticação**:
   - Faça login com uma conta de teste ou registre um novo usuário em `/register`.
   - Certifique-se de que o usuário possui sessão ativa e acesso ao dashboard.

---

## 2. Cenário 1: Listagem e Filtragem de Transações (User Story 1 - P1)

### Objetivo
Validar a renderização das movimentações financeiras, formatação de valores em Real, badges das 9 categorias e funcionamento dos filtros por mês, categoria e origem.

### Passos de Validação
1. No menu de navegação, clique no link **Transações** (`/transactions`).
2. Observe que a listagem inicial exibe as movimentações do mês corrente (`YYYY-MM`).
3. Verifique a formatação monetária:
   - Receitas (valores positivos) exibidas com sinal positivo e destaque verde.
   - Despesas (valores negativos) exibidas com formatação padrão/vermelha.
4. No seletor de mês, altere para o mês anterior através do controle ou das setas de navegação. A lista deve atualizar instantaneamente.
5. No dropdown de **Categoria**, selecione `Alimentação`. A listagem deve filtrar e exibir exclusivamente despesas alimentícias.
6. No dropdown de **Origem**, selecione `OFX`. A listagem deve restringir os itens ao formato selecionado.
7. Altere o filtro para um mês sem lançamentos e confirme a renderização do estado vazio informativo (*empty state*).

---

## 3. Cenário 2: Upload Drag-and-Drop de Extratos OFX e CSV (User Story 2 - P2)

### Objetivo
Validar a captura de extratos por drag-and-drop ou seleção de arquivo, a validação no cliente (bloqueio > 10MB e extensões inválidas) e o feedback de extração/importação.

### Passos de Validação
1. **Teste de Rejeição Client-Side**:
   - Tente arrastar um arquivo inválido (ex: `relatorio.pdf` ou `planilha.xlsx`). O sistema deve recusar imediatamente antes do envio, alertando que apenas arquivos `.ofx` e `.csv` são suportados.
   - Tente arrastar múltiplos arquivos de uma só vez. A interface deve rejeitar o lote e orientar o envio de um único arquivo por operação.
2. **Teste de Sucesso**:
   - Arraste ou selecione um arquivo válido (ex: `extrato.ofx` ou `extrato.csv` < 10MB).
   - Observe a animação visual na área de soltura e o indicador de carregamento durante a requisição `POST /api/transactions/upload`.
   - Ao concluir, confirme a exibição do resumo de importação com os campos:
     - Total extraído
     - Lançamentos importados
     - Duplicidades descartadas
   - Verifique que as novas transações aparecem na tabela do mês correspondente sem necessidade de F5 / reload da página.

---

## 4. Cenário 3: Edição Manual de Descrição e Categoria via Modal (User Story 3 - P3)

### Objetivo
Validar a edição pontual de uma transação individual através de modal acessível (`Dialog`), mantendo a descrição original intacta para auditoria.

### Passos de Validação
1. Na tabela de transações, localize uma linha e clique no botão de ação **Editar**.
2. Confirme que o modal `Dialog` é aberto com foco adequado:
   - A descrição bancária original (`rawDescription`) e o valor original são exibidos de forma estática para conferência.
   - O campo de descrição limpa (`cleanDescription`) e o seletor das 9 categorias canônicas aparecem preenchidos com os valores atuais.
3. Altere a descrição para um texto personalizado (ex: "Supermercado Semanal") e mude a categoria para `Alimentação`.
4. Clique em **Salvar Alterações**:
   - O modal deve fechar.
   - A tabela deve refletir imediatamente a nova descrição e a nova categoria.
5. Abra o modal novamente e pressione a tecla `Escape` ou clique em **Cancelar**: confirme que nenhuma alteração foi persistida.

---

## 5. Cenário 4: Categorização Automática em Lote com Suporte BYOK (User Story 4 - P4)

### Objetivo
Validar a execução da IA para classificar transações em lote globalmente, com tratamento seguro caso a chave do Google AI Studio não esteja cadastrada.

### Passos de Validação
1. **Fluxo sem chave de IA configurada (`hasAiKey: false`)**:
   - Acesse a tela de transações com uma conta sem chave de IA ativa.
   - Observe a indicação de chave necessária.
   - Ao clicar em **Categorizar com IA**, confirme que o sistema abre o modal de ativação BYOK sem disparar requisição condenada ao erro 403.
2. **Fluxo com chave de IA ativa (`hasAiKey: true`)**:
   - Com a chave de IA cadastrada, clique no botão **Categorizar com IA**.
   - O botão deve entrar em estado desabilitado com indicador de processamento.
   - Ao término de `POST /api/transactions/categorize`, observe o banner/toast informativo:
     - Quantidade de estabelecimentos comerciais únicos analisados.
     - Quantidade de transações atualizadas.
   - Confirme que as transações antes marcadas como `Não Categorizado` foram reclassificadas com sucesso.

---

## 6. Verificação Automatizada (Gates de Qualidade)

Execute os comandos de validação automatizada no terminal:

```bash
# 1. Checagem estrita de tipos TypeScript (zero any)
pnpm typecheck

# 2. Análise de linting de código
pnpm lint

# 3. Bateria de testes automatizados unitários e de integração
pnpm test
```
