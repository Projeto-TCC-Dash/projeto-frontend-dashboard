# Technical Research: Dashboard Financeiro com Métricas Consolidadas, Gráfico de Categorias e Parecer por IA

**Feature Branch**: `003-dashboard-metrics-analysis`  
**Date**: 2026-10-19  
**Status**: Completed  

---

## Decision 1: Gráfico de Distribuição por Categorias - Componente SVG Nativo Reativo vs Recharts/Chart.js

- **Context**: O dashboard necessita de um gráfico de rosca (Donut Chart) interativo, renderizando todas as categorias com despesa ativa (> R$ 0), com tooltips detalhados (nome da categoria, valor em BRL, percentual), legenda responsiva, tema dark/light e navegação por *drill-down* para `/transactions?month=YYYY-MM&category=...`.
- **Decision**: Implementar um componente de gráfico de rosca nativo baseado em SVG vetorial (`CategoryDonutChart`) estilizado com Tailwind CSS e tokens do design system.
- **Rationale**:
  1. **Compatibilidade Total com React 19**: Bibliotecas antigas como Recharts frequentemente apresentam alertas de *peer dependencies* e conflitos com React 19 / Server Components.
  2. **Performance e Zero Overhead de Pacotes**: Elimina dezenas de kilobytes de bibliotecas externas pesadas, alcançando renderização instantânea (<10ms) e transições suaves via CSS/SVG.
  3. **Acessibilidade e Interatividade Fina**: Permite controle direto sobre atributos ARIA (`role="img"`, `aria-label`), eventos de hover para tooltips contextuais e manipulação precisa de cliques para o redirecionamento *drill-down*.
  4. **Adaptabilidade Perfeita ao Tema**: Uso de classes utilitárias e variáveis CSS já existentes para modo claro e escuro (`dark:`), harmonizando com as 9 categorias canônicas.
- **Alternatives Considered**:
  - *Recharts*: Requer instalação de dependência adicional, dependente de `recharts` que apresenta avisos de tipagem e runtime com React 19.
  - *Chart.js com react-chartjs-2*: Dependência pesada baseada em Canvas que dificulta estilização via Tailwind e testes automatizados em ambiente DOM (`happy-dom`).

---

## Decision 2: Renderização Rica e Segura do Parecer Analítico em Markdown

- **Context**: O endpoint `GET /api/analysis/:month` retorna o diagnóstico em Markdown (`diagnosis: string`), contendo títulos (`###`), listas numeradas ou com marcadores, parágrafos e ênfases em negrito, além de uma lista de recomendações (`recommendations: string[]`).
- **Decision**: Desenvolver um componente seguro de renderização Markdown (`MarkdownContent` / `AiDiagnosisCard`) com sanitização integrada contra XSS e estilização tipográfica Tailwind.
- **Rationale**:
  1. **Segurança por Padrão**: Assegura sanitização completa, impedindo que tags script ou atributos maliciosos de HTML sejam inseridos no DOM caso a IA retorne fragmentos inseguros.
  2. **Layout Responsivo e Tipografia Fluida**: Títulos, parágrafos e listas são mapeados para componentes e classes do design system (`prose`-like mas leve), integrando perfeitamente aos temas dark/light sem quebras visuais em telas mobile.
  3. **Separação de Preocupações**: O diagnóstico em texto e a lista de recomendações (`recommendations`) são organizados em seções visuais distintas no card, facilitando a absorção pelo usuário.
- **Alternatives Considered**:
  - *`dangerouslySetInnerHTML` direto sem sanitização*: Rejeitado por violação crítica de segurança contra injeção de script.
  - *Bibliotecas pesadas de Markdown monolíticas*: Aumentam desnecessariamente o bundle para um subconjunto simples de formatação (títulos, negrito, listas).

---

## Decision 3: Estratégia de Dados Reativos com TanStack Query (`GET /api/analysis/:month`)

- **Context**: O dashboard precisa carregar os dados consolidados do mês selecionado, manter cache local para navegação instantânea entre meses e oferecer um botão "Recalcular Diagnóstico" que ignora o cache do backend (`?forceRefresh=true`).
- **Decision**: Criar o hook customizado `useFinancialAnalysis(month: string)` utilizando TanStack Query (`useQuery` e `useMutation`).
- **Rationale**:
  1. **Chaves de Cache Explícitas**: A query key será `['analysis', month]`, isolando dados por competência mensal com `staleTime: 5 * 60 * 1000` (5 minutos) e `gcTime: 30 * 60 * 1000` (30 minutos).
  2. **Suporte a Forçar Atualização**: O hook disponibilizará a função `refreshAnalysis()` que aciona a chamada `GET /api/analysis/:month?forceRefresh=true` com `isRefetching: true`, atualizando os dados da query de forma atômica e revalidando a tela sem reload.
  3. **Sincronização com Transações**: Quando o usuário adiciona, edita ou importa extratos na tela `/transactions`, a query `['analysis', month]` pode ser invalidada reativamente via `queryClient.invalidateQueries({ queryKey: ['analysis'] })`.
- **Alternatives Considered**:
  - *Estado local em `useState` + `useEffect`*: Rejeitado por violar o Princípio V da Constituição (Camada de Dados Reativa com Cache Inteligente via TanStack Query).

---

## Decision 4: Gestão do Estado de IA e Resiliência BYOK

- **Context**: A análise financeira é enriquecida por IA (Gemini). Se o usuário autenticado não possui chave de API configurada (`user.hasAiKey === false`), ou se a chamada à IA falhar com status `429` (limite de taxa) ou `503` (alta demanda upstream temporária), a interface deve permanecer estável e orientar o usuário.
- **Decision**:
  - Se `hasAiKey === false`: Renderizar os 4 cards de KPIs numéricos e o gráfico de distribuição de categorias normalmente. No container do parecer analítico, renderizar o estado amigável `AiKeyRequiredBanner` com explicação educativa e botão de 1 clique para abrir o modal BYOK (`AiKeyModal`).
  - Se a API retornar erro `429` ou `503`: Apresentar aviso contextual de cota ou sobrecarga temporária do Google AI Studio com botão de retentativa ("Tentar novamente"), sem bloquear os dados quantitativos já disponíveis.
- **Rationale**:
  - Em estrita conformidade com o Princípio III da Constituição, os recursos quantitativos matemáticos funcionam com resiliência enquanto os recursos de IA degradam graciosamente com recuperação assistida.
- **Alternatives Considered**:
  - *Bloquear a página inteira de dashboard*: Rejeitado porque os cálculos consolidados de receitas, despesas e saldo líquido são matemáticos e não dependem da IA para exibição básica.

---

## Decision 5: Formatação Numérica e Regras de Negócio de Déficit

- **Context**: Formatação de moeda em Real Brasileiro (BRL) e taxa de poupança (`savingsRate`) quando as despesas superam receitas.
- **Decision**:
  - Utilizar e expandir as funções puras de formatação já existentes em `lib/formatters.ts` (`formatCurrency`, `formatPercentage`, `formatMonthYear`).
  - Quando `totalExpenses > totalIncome` ou `totalIncome === 0`: A taxa de poupança é fixada em `0.0%` no indicador numérico, acompanhada de um badge semântico de alerta `"Sem poupança / Déficit orçamentário"`, conforme pactuado na sessão de clarificação.
- **Rationale**:
  - Evita inconsistências visuais, garante determinismo em testes unitários e protege a UX de comportamentos matemáticos estranhos (como percentuais negativos extremos).
