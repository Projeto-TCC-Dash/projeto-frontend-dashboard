# Quickstart: Validação do Módulo Fiscal, Investimentos Dedicados e Orçamentos

**Feature Branch**: `015-fiscal-advisory-planning` | **Date**: 2026-11-18

---

## 1. Validação Estática e Testes Automatizados

```bash
# 1. Checagem estrita de tipos TypeScript
pnpm typecheck

# 2. Testes dos novos hooks e validações
pnpm test hooks/use-fiscal.test.tsx hooks/use-budgets.test.tsx hooks/use-multi-month-analysis.test.tsx lib/validations/

# 3. Testes das novas páginas e componentes
pnpm test components/fiscal/ components/investments/ components/dashboard/monthly-budget-card.test.tsx app/\(dashboard\)/fiscal/ app/\(dashboard\)/investments/

# 4. Suíte completa do projeto
pnpm test
```

---

## 2. Roteiro de Verificação Manual no Navegador

Inicie o frontend (`pnpm dev`) com o backend ativo:

1. **Navegação Principal**:
   - Verifique que a barra superior (`Navbar`) e o menu móvel (`< 1024px`) exibem os links **Investimentos** (`/investments`) e **Fiscal** (`/fiscal`) com realce ativo ao navegar.

2. **Planejamento Fiscal (`/fiscal`)**:
   - Confirme a exibição permanente do aviso legal obrigatório (`FiscalLegalNotice`).
   - Alterne o ano (ex.: `2026`) e valide os cartões de Total Dedutível, Comprovado e Pendente.
   - Se o perfil estiver como PJ/Autônomo, confira a barra do teto MEI (`R$ 81.000,00`), pró-labore e dividendos.
   - Marque uma despesa como dedutível preenchendo categoria fiscal, CPF/CNPJ e status; confirme atualização dos totais.
   - Envie um comprovante PDF/PNG/JPG na área de OCR (com chave BYOK ativa) e vincule a transação sugerida; teste também sem chave para confirmar fallback amigável.
   - Clique em **Exportar PDF** e **Exportar XLSX** para confirmar o download do dossiê `dossie-fiscal-2026.{ext}`.

3. **Investimentos Dedicados (`/investments`)**:
   - Confira o gráfico de rosca das macroclasses sincronizado com a lista proporcional, o card de diagnóstico de aderência ao perfil de risco e o gráfico de evolução patrimonial.
   - Clique em **Atualizar Posição**, salve um novo valor para uma macroclasse e observe o recálculo instantâneo.

4. **Orçamentos Mensais e Multi-Mês no Dashboard (`/`)**:
   - Localize o card **Orçamentos do Mês**, configure um plano orçamentário mensal via modal e valide as faixas de cor (verde `< 70%`, amarelo `70–99,9%`, vermelho `≥ 100%`).
   - No gráfico de evolução histórica, alterne entre `3M`, `6M`, `12M` e `Tudo` observando a taxa média de poupança, média de despesas e o badge de tendência de custos fixos.
