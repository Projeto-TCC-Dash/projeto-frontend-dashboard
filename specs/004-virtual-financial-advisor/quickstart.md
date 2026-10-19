# Quickstart & Verification Guide: Consultor Financeiro Virtual com Streaming SSE

**Feature Branch**: `004-virtual-financial-advisor`  
**Date**: 2026-10-19  
**Status**: Ready for Implementation  

---

## 1. Prerequisites & Environment Setup

1. Certifique-se de que as dependências do projeto estejam instaladas:
   ```bash
   pnpm install
   ```
2. Verifique se a compilação estática TypeScript e os testes existentes passam sem erros:
   ```bash
   pnpm typecheck
   pnpm test
   ```

---

## 2. Test Execution & Coverage Verification

A entrega desta funcionalidade é validada por uma suíte completa de testes automatizados com Vitest e React Testing Library, abrangendo o decodificador de streams SSE, o hook customizado de streaming com AbortController, os chips rápidos e os componentes do painel conversacional.

### 2.1 Executar os Testes da Funcionalidade

```bash
# Executa toda a suíte de testes em modo run único
pnpm test

# Executa especificamente os testes do consultor virtual (chat)
pnpm vitest run components/chat hooks/use-chat-stream lib/chat-stream-parser
```

### 2.2 Cenários Cobertos nos Testes Automatizados

1. **`lib/chat-stream-parser.test.ts`**:
   - Decodificação de chunks parciais em formato SSE (`data: {"text": "Olá"}\n\n`).
   - Reunião de dados fragmentados que chegam divididos entre múltiplos pacotes de rede.
   - Detecção do sinal de conclusão (`done: true`).
   - Extração correta de mensagens e códigos de erro emitidos no payload de erro.

2. **`hooks/use-chat-stream.test.tsx`**:
   - Envio de prompt com inclusão de `Authorization: Bearer <token>` e `sessionId`.
   - Acumulação progressiva de texto token a token com digitação fluida.
   - Interrupção imediata via `stopStream()` acionando o sinal do `AbortController` e congelando o texto parcial.
   - Persistência e restauração de mensagens no `sessionStorage`.
   - Limpeza e reinicialização de sessão ("Nova consulta") gerando novo UUID.
   - Tratamento de erro 403 (chave ausente), 429 (limite de cota) e 503 (alta demanda) com flag de retry.

3. **`components/chat/quick-suggestion-chips.test.tsx`**:
   - Geração dinâmica de perguntas a partir do orçamento do mês (maior categoria de despesa e taxa de poupança).
   - Fallback para perguntas educativas gerais quando o mês não possuir transações.
   - Disparo do evento de envio ao clicar em um chip.
   - Desabilitação dos chips durante o streaming ativo.

4. **`components/chat/chat-message-list.test.tsx`**:
   - Renderização correta de mensagens do usuário (`user`) e do assistente (`model`).
   - Suporte a Markdown estruturado (listas, ênfases e tabelas).
   - Exibição de alerta inline e botão "Tentar novamente" em bolhas com erro.
   - Exibição do badge de "Resposta interrompida" para respostas canceladas pelo usuário.

5. **`components/chat/chat-panel.test.tsx`**:
   - Comportamento de envio por clique no botão ou tecla Enter (sem Shift).
   - Alternância dinâmica entre botão "Enviar" e botão "Parar resposta".
   - Bloqueio de envio de mensagens vazias ou com espaços em branco.
   - Exibição do estado explicativo BYOK com botão para cadastro de chave quando `hasAiKey === false`.

6. **`components/chat/chat-drawer.test.tsx`**:
   - Abertura e fechamento da gaveta lateral a partir do botão flutuante e do cabeçalho.
   - Botão de atalho para expandir para a página dedicada `/chat`.

---

## 3. Manual E2E Validation Flow (Happy Path & Resilience)

1. **Acesso e Verificação BYOK**:
   - Faça login com um usuário sem chave de IA configurada (`hasAiKey: false`).
   - Abra o painel do consultor (via Drawer lateral ou `/chat`).
   - Valide que o painel exibe o bloqueio explicativo amigável e que o botão abre o modal de configuração de chave de IA.
2. **Perguntas Rápidas no Estado Vazio**:
   - Configure a chave de IA.
   - Observe os chips contextuais na área inicial vazia baseados no orçamento do mês.
   - Clique em um chip (ex: *"Como reduzir despesas em Alimentação?"*).
   - Valide que o chip é enviado como pergunta e que os chips são recolhidos.
3. **Streaming em Tempo Real com Digitação Progressiva**:
   - Observe a resposta do consultor sendo digitada continuamente em tempo real com auto-scroll suave.
   - Valide que a resposta formata corretamente elementos em Markdown.
4. **Interrupção Voluntária da Resposta**:
   - Envie uma nova pergunta: *"Faça uma análise profunda do meu planejamento anual com projeções detalhadas."*
   - Enquanto o texto estiver sendo gerado, clique em **"Parar resposta"**.
   - Valide que o streaming cessa imediatamente (< 100ms), o texto parcial recebido é mantido na bolha com o indicador de interrupção e o campo de digitação é liberado.
5. **Persistência de Sessão**:
   - Feche a gaveta lateral do chat, navegue para a tela de Transações (`/transactions`) e reabra o chat.
   - Valide que todo o histórico anterior e o `sessionId` foram preservados via `sessionStorage`.
6. **Nova Consulta**:
   - Clique no botão "Nova consulta".
   - Valide que o histórico é limpo, um novo `sessionId` é estabelecido e os chips de sugestão inicial voltam a ser exibidos.
