# Research: Perfil Financeiro, Regime de Renda e Metas do Usuário

**Feature**: `005-financial-profile-onboarding`  
**Date**: 2026-10-19  
**Status**: Completed  

---

## 1. Modelagem do Perfil e Contratos Canônicos

### Decisão
Utilizar a estrutura canônica definida no backend (`GET /api/user/profile` e `PUT /api/user/profile`) com os enums:
- **IncomeType**: `CLT`, `PJ_AUTONOMO`, `PUBLIC_SERVANT`, `ENTREPRENEUR`, `STUDENT`, `RETIRED`, `OTHER`.
- **FinancialGoal**: `RESERVA_EMERGENCIA`, `QUITAR_DIVIDAS`, `COMPRAR_IMOVEL`, `INVESTIR_LONGO_PRAZO`, `CONTROLE_GASTOS`.
- **RiskProfile**: `CONSERVATIVE`, `MODERATE`, `AGGRESSIVE`.

### Racional
- Mantém 100% de paridade contratual com o backend já implementado e documentado em `frontend.md`.
- Os valores são tipados de forma imutável com `as const` e inferidos pelo Zod (`z.enum`), assegurando conformidade com o Princípio I da Constituição (Zero `any`).

---

## 2. Experiência de Preenchimento Voluntário e UX de Moeda BRL

### Decisão
Implementar o input de renda mensal declarada com formatação monetária progressiva em Real Brasileiro (BRL) através de um formatador utilitário puro (`lib/formatters.ts`), limpando separadores antes da submissão para enviar um valor numérico decimal (`number` ou `undefined`).

### Racional
- Evita erros de digitação e inconsistências de vírgula versus ponto.
- Se o usuário apagar o campo ou não preencher, o payload enviará `declaredMonthlyIncome: undefined`, preservando a opcionalidade total da informação (LGPD / Princípio VI).

### Alternativas Consideradas
- **Input text cru com máscara regex complexa**: Frequentemente quebra em dispositivos móveis e navegadores diferentes.
- **Input number nativo (`<input type="number">`)**: Não suporta separadores de milhar brasileiros (`R$ 1.500,00`) e exibe seletores de incremento verticais que poluem a interface.

---

## 3. Gestão de Estado de Sessão para o Banner de Onboarding

### Decisão
Utilizar `sessionStorage` com a chave `dismiss_profile_banner` para controlar a dispensa do banner durante a sessão ativa do usuário.

### Racional
- Conforme decidido na fase de clarificação, se o usuário fechar o banner no Dashboard, ele não será incomodado novamente enquanto navegar na mesma sessão.
- Quando ele abrir uma nova aba/sessão ou fizer novo login, o banner voltará a ser exibido caso o perfil continue não configurado, oferecendo reengajamento sutil e não intrusivo.

### Alternativas Consideradas
- **`localStorage`**: Faria a dispensa persistir para sempre entre sessões, reduzindo severamente o incentivo de preenchimento.
- **Flag no banco de dados (`hasDismissedBanner: boolean`)**: Adicionaria mutação extra no backend e persistência desnecessária no banco para uma preferência efêmera de cliente.

---

## 4. Reatividade e Caching com TanStack Query

### Decisão
Criar o hook `useUserProfile` e a mutation `useUpdateFinancialProfile` encapsulando as chamadas a `apiClient.get('/api/user/profile')` e `apiClient.put('/api/user/profile', data)`. Ao salvar com sucesso:
1. `queryClient.setQueryData(['user-profile'], updatedProfile)`
2. `queryClient.invalidateQueries({ queryKey: ['financial-analysis'] })`
3. Exibição de toast de sucesso.

### Racional
- Garante que os cards de análise e gráficos do Dashboard saibam imediatamente que o perfil mudou, forçando a busca do parecer calibrado da IA na próxima consulta sem recarregar a tela.
- Atende estritamente ao Princípio V da Constituição (Camada de Dados Reativa com Cache Inteligente).
