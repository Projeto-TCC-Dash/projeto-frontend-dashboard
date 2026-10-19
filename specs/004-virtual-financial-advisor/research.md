# Architectural and Technology Research: Painel Conversacional de Consultoria Financeira Virtual com Streaming SSE

**Feature**: `004-virtual-financial-advisor`  
**Date**: 2026-10-19  
**Status**: Completed  

---

## 1. Consumo de Server-Sent Events (SSE) via `fetch` e `ReadableStream`

### Contexto & Desafio
A funcionalidade de chat com consultoria financeira requer consumo em tempo real de `POST /api/chat/stream`, transmitindo o token JWT de autenticação no cabeçalho `Authorization: Bearer <token>` e o corpo JSON `{ message, sessionId }`.

### Alternativas Avaliadas
1. **API Nativa `EventSource`**:
   - *Limitação*: A especificação padrão de `EventSource` no navegador suporta apenas requisições `GET` e não permite customização de headers HTTP no cliente (impossibilitando envio nativo do Bearer token e payload no corpo). Requereria bibliotecas de polyfill adicionais ou cookies de sessão.
2. **Bibliotecas de terceiros (ex: `@microsoft/fetch-event-source` ou `eventsource-parser`)**:
   - *Avaliação*: Adicionam dependências externas ao projeto quando o Next.js 16 / React 19 já possui suporte total a streams nativos. A Constituição do projeto (Princípio II e Princípio IV) exige explicitamente o uso da API nativa `ReadableStream` sem dependências externas desnecessárias.
3. **Nativo `fetch` + `ReadableStream` + `TextDecoder`**:
   - *Vantagens*: Totalmente padrão Web APIs, zero dependências, controle preciso de bufferização UTF-8 progressiva, suporte direto a `AbortController` e compatibilidade estrita com TypeScript.

### Decisão
- Utilizar a API nativa `fetch` combinada com `response.body.getReader()`, decodificador `TextDecoder("utf-8", { stream: true })` e parser de linhas SSE (`data: {...}\n\n`).

### Mecanismo de Parsing do Stream
```typescript
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ message, sessionId }),
  signal: abortController.signal
});

const reader = response.body.getReader();
const decoder = new TextDecoder('utf-8');
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  // Processamento linha a linha para capturar eventos "data: ..."
}
```

---

## 2. Renderização de Digitação Progressiva e Performance no React 19

### Contexto & Desafio
Em streams com alta taxa de emissão de tokens, renderizar a cada caractere pode disparar centenas de reconciliações por segundo, causando engasgos no DOM e saltos indesejados de scroll.

### Decisão & Estratégia de Performance
1. **Isolamento da Mensagem Ativa**:
   - A lista de mensagens históricas já finalizadas permanece imutável e envolvida em componentes puros (`React.memo`).
   - Apenas o nó da mensagem do assistente em transmissão recebe atualizações de texto acumulado.
2. **Buffer de Atualização Suave**:
   - O chunk SSE é anexado ao estado textual da mensagem ativa via callback de estado do React, garantindo que atualizações rápidas sejam processadas sem congelamento da thread de UI.
3. **Rolagem Automática Suave com Detecção de Intenção do Usuário**:
   - O contêiner de rolagem monitora a distância do usuário até o fundo da conversa (`scrollHeight - scrollTop - clientHeight`).
   - Se o usuário estiver próximo ao fundo (< 80px), o auto-scroll acompanha a digitação suavemente (`behavior: 'smooth'`).
   - Se o usuário rolar intencionalmente para cima para reler mensagens anteriores, o auto-scroll é pausado e um botão flutuante discreto ("Rolar para baixo") é exibido com indicador de novas mensagens.

---

## 3. Persistência de Histórico de Sessão e Privacidade Financeira (`sessionStorage`)

### Contexto & Decisão
Em conformidade com a Clarificação 2 (Sessão 2026-10-19):
- O histórico de mensagens e o `sessionId` são armazenados no `sessionStorage` do navegador sob a chave `@finai:chat_session`.
- **Comportamento**:
  - Transições de tela (ex: Dashboard -> Transações -> Chat) e recarregamentos acidentais (F5) preservam integralmente o histórico da conversa e o identificador da sessão.
  - O encerramento da aba/janela do navegador ou o clique voluntário no botão "Nova consulta" / "Limpar histórico" descarta os dados e zera o estado, gerando um novo UUID v4 para `sessionId`.
  - Essa abordagem protege a confidencialidade das orientações financeiras em computadores compartilhados ou corporativos.

---

## 4. Algoritmo de Geração Dinâmica dos Chips de Perguntas Rápidas

### Contexto & Decisão
Os chips de atalho são montados dinamicamente inspecionando o cache do TanStack Query da análise financeira do mês atual (`['analysis', currentMonth]`), conforme a Clarificação 3 (Sessão 2026-10-19):
- **Cenário A - Usuário possui dados no mês**:
  1. *Maior ofensor de despesas*: "Como reduzir meus gastos com [TopCategory]?"
  2. *Avaliação de taxa de poupança*: Se poupança < 20%: "Como alcançar a meta de 20% de economia este mês?"; Se poupança >= 20%: "Onde alocar meu excedente financeiro do mês?"
  3. *Auditoria de atipicidades*: "Qual foi a despesa mais atípica deste mês?"
  4. *Capacidade de investimento*: "Consigo investir R$ 500 com meu saldo atual?"
- **Cenário B - Usuário sem transações no mês (Cold Start)**:
  1. "Qual a regra orçamentária 50-30-20 e como usá-la?"
  2. "Como montar uma reserva de emergência?"
  3. "Quais os primeiros passos para organizar minhas finanças?"
  4. "Como planejar metas de curto e longo prazo?"
- **Ciclo de Exibição**: Apresentados na área central do chat no estado vazio; recolhidos após a primeira mensagem enviada para desobstruir a área de leitura.

---

## 5. Arquitetura do Modelo Híbrido: Drawer Lateral e Tela Dedicada (`/chat`)

### Decisão
Em conformidade com a Clarificação 1 (Sessão 2026-10-19):
- **Componente Base Reutilizável**: `ChatPanel` encapsula todo o layout interno do chat (cabeçalho da sessão, lista de mensagens, chips de sugestão vazios, barra de entrada com botão parar/enviar e alertas inline).
- **Gaveta Lateral (`ChatDrawer`)**:
  - Integrado ao `DashboardLayout` via `ChatDrawerProvider` / `useChatDrawer`.
  - Acessível por botão de atalho no Navbar e botão flutuante de acesso rápido no canto inferior direito do dashboard.
  - Oferece botão para expandir diretamente para a tela cheia (`/chat`).
- **Tela Dedicada (`/chat`)**:
  - Rota `app/(dashboard)/chat/page.tsx` para foco absoluto em conversas densas ou telas menores.
  - Compartilha o mesmo hook de estado e `sessionStorage`, garantindo sincronização em tempo real entre o Drawer e a página `/chat`.

---

## 6. Tratamento de Exceções e Resiliência BYOK

### Resiliência Alinhada à Constituição (Princípio III):
- **Usuário sem Chave (`hasAiKey: false`)**:
  - O `ChatPanel` exibe estado vazio ilustrado com mensagem pedagógica explicando a importância da chave do Google AI Studio e botão "Configurar Chave de IA" abrindo o `AiKeyModal` pré-existente.
- **Erros 429 (Taxa Excedida) e 503 (Alta Demanda Upstream)**:
  - Capturados pelo parser de stream; a mensagem do assistente renderiza um alerta inline vermelho/âmbar com texto claro e botão de ação "Tentar novamente".
- **Interrupção Voluntária ("Parar resposta")**:
  - Dispara `abortController.abort()`. O stream encerra a conexão imediatamente, preserva o texto acumulado até aquele instante e anota a mensagem com badge sutil de "Resposta interrompida".
