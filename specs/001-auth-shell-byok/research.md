# Research: Autenticação, Shell Base e Gestão BYOK da Chave de IA

**Feature**: `001-auth-shell-byok`  
**Date**: 2026-10-19  
**Status**: Completed  

---

## 1. Gestão de Sessão JWT e Interceptação de Requisições

### Decisão
Implementar cliente de API centralizado (`lib/api-client.ts`) com armazenamento de token JWT em `localStorage` e sincronização no `AuthContext` (`hooks/use-auth.ts`). A proteção de rotas privadas será garantida por um guard de navegação client-side nos layouts protegidos e redirecionamento de usuários deslogados para `/login` (e usuários logados sem chave para `/onboarding`).

### Racional
- O backend do ecossistema é uma API REST desacoplada que emite e valida tokens no cabeçalho `Authorization: Bearer <token>` (Princípio VI da Constituição).
- O armazenamento centralizado no cliente com interceptor unificado em `api-client.ts` assegura que nenhuma requisição a rotas protegidas precise anexar o header manualmente.
- O redirecionamento no App Router com React 19 / Next.js 16 ocorre sem flashes de conteúdo não autenticado graças ao estado inicial de verificação (`isLoading` / `isAuthenticated`).

### Alternativas Consideradas
- **Cookies HttpOnly via Next.js Route Handlers (BFF/Proxy)**: Adicionaria complexidade de servidor intermediário desnecessária para este estágio do frontend, onde a API de backend já expõe CORS e autenticação Bearer padrão.
- **Armazenamento exclusivo em memória (sem persistência)**: Forçaria re-autenticação a cada F5/recarregamento de página, violando o critério de aceitação de manter a sessão ativa.

---

## 2. Validação Declarativa de Formulários e Segurança de Tipos

### Decisão
Utilizar schemas **Zod** (`zod`) para tipar e validar as entradas de cadastro (`registerSchema`), login (`loginSchema`) e chave de API (`aiKeySchema`).

### Racional
- Atende ao Princípio I da Constituição (TypeScript Estrito e Zero "any"): o Zod permite inferir tipos seguros em tempo de compilação via `z.infer<typeof schema>` sem necessidade de duplicar interfaces.
- Regras de negócio como "senha mínima de 8 caracteres", formato de e-mail e chave válida com formato inicial do Google AI Studio (`AIzaSy...`) são validadas antes do envio de qualquer pacote de rede.

### Alternativas Consideradas
- **Validação manual imperativa com `if/else`**: Propenso a falhas, código verboso e difícil manutenção em múltiplos formulários.
- **Yup / Joi**: Zod possui melhor integração com TypeScript nativo e ecossistema Next.js/Shadcn sem overhead.

---

## 3. Camada de Dados Reativa com TanStack Query

### Decisão
Adotar `@tanstack/react-query` gerenciado via `QueryClientProvider` no `components/providers.tsx`. As ações de login, registro e envio da chave de IA serão implementadas através de `useMutation`, com invalidação reativa de queries de perfil e atualização imediata do cache do usuário.

### Racional
- Conforme ratificado no Princípio V da Constituição, mutações (`POST`, `PUT`, `PATCH`) devem disparar invalidação direcionada de chaves de query (`['user']`, `['auth']`), mantendo todo o shell sincronizado sem reload.
- Permite controle determinístico dos estados `isPending`, `isError`, `isSuccess` e mensagens de erro retornadas pelo backend.

### Alternativas Consideradas
- **Estado global manual com Context/Redux/Zustand puro para requisições**: Exigiria implementação manual de caching, retry, deduplicação de requisições e flags de loading.

---

## 4. Design do Shell Responsivo e Alternância de Tema

### Decisão
Reaproveitar o `ThemeProvider` já presente em `components/theme-provider.tsx` (baseado em `next-themes`), compondo a casca da aplicação com Tailwind CSS v4, `@base-ui/react` e ícones `lucide-react`.

### Racional
- O projeto já possui a infraestrutura de cores e variáveis CSS do Tailwind v4 (`--color-background`, `--color-foreground`, `--color-primary`, etc.) configurada em `app/globals.css` e o provider em `components/theme-provider.tsx`.
- A alternância ocorre em menos de 10ms via manipulação de classe `.dark` no elemento raiz `<html>`, cumprindo com folga o critério de sucesso SC-003 (< 100ms sem flickering).

### Alternativas Consideradas
- **Controle customizado de tema com CSS manual**: Desnecessário, dado que `next-themes` já está instalado e integrado no `app/layout.tsx`.

---

## 5. Experiência de Onboarding e Validação Ativa da Chave BYOK

### Decisão
O estado `hasAiKey: boolean` retornado na autenticação e na entidade `User` determina o fluxo:
1. Se `hasAiKey === false`: usuário é direcionado para a tela/etapa de onboarding (`/onboarding`). O acesso a rotas do dashboard é bloqueado até a validação da chave.
2. Ao submeter a chave via `PUT /api/user/ai-key`:
   - Se resposta `status: "ACTIVE_VERIFIED"`: exibe toast/alerta de sucesso, atualiza `hasAiKey: true`, define status como verde e redireciona para o dashboard.
   - Se resposta `status: "ACTIVE_PROVISIONAL_DEMAND"`: exibe alerta de sucesso com aviso de alta demanda momentânea do Google AI Studio, atualiza `hasAiKey: true`, define status como amarelo/atenção e libera o avanço para o dashboard.
   - Se resposta com erro de validação (ex: 400 ou 401 do provedor): bloqueia avanço, exibe mensagem clara com erro retornado e mantém o campo pronto para correção.
3. No Shell do Dashboard:
   - Exibir badge com indicador no topo.
   - Clique no badge abre modal para retestar ou substituir a chave a qualquer momento.

### Racional
- Cumpre rigorosamente a decisão tomada na etapa de clarificação e respeita o Princípio III da Constituição (UX Resiliente BYOK).
