# Quickstart & Validation Guide: Responsividade Completa da Aplicação

**Feature Branch**: `012-full-app-responsiveness` | **Date**: 2026-11-11

Este guia define os cenários de validação manual e automatizada para comprovar a conformidade visual e funcional da aplicação em todas as resoluções de referência.

---

## 1. Pré-Requisitos
1. Subir o servidor de desenvolvimento do frontend: `pnpm dev` (porta `3001`) com backend ativo na porta `3000`.
2. Ter uma conta autenticada (ou conta de seed `teste.usuario@exemplo.com`) para validar dados reais em Dashboard, Contas e Transações.
3. Abrir o DevTools do navegador em modo responsivo (Device Toolbar) testando as 6 larguras-chave:
   - `320px` (Smartphone pequeno, ex: 320x568)
   - `376px` e `480px` (Smartphones médios/grandes)
   - `768px` (Tablet)
   - `1024px` (Notebook compacto)
   - `1440px` (Desktop)

---

## 2. Cenários de Validação Ponta a Ponta

### Cenário 1: Navegação e Shell Global (320px, 768px, 1024px, 1440px)
1. Em **320px**, percorrer `/login`, `/register`, `/`, `/accounts`, `/transactions`, `/settings/profile`, `/settings/security`, `/settings/export`, `/settings/metas` e `/chat`.
2. Verificar que a barra de rolagem horizontal da janela permanece inativa (`scrollWidth <= innerWidth`).
3. Acionar o botão hambúrguer do menu móvel em `320px` e `768px`, navegar para outra rota e validar o fechamento automático (além do fechamento via `Escape` e clique fora).
4. Em `1024px` e `1440px`, confirmar retorno limpo à navegação horizontal inline sem menu hambúrguer visível.

### Cenário 2: Painel Financeiro e Gráfico de Categorias (320px → 1440px)
1. Em `/`, alternar meses usando o seletor de competência em `320px` e `480px`.
2. Confirmar que os 5 cartões de KPI exibem valores monetários completos sem sobreposição nem aperto excessivo em `1024px` e `1440px`.
3. Verificar que o gráfico de rosca e a legenda cabem integralmente em `320px`, sem corte lateral, e que tocar em uma categoria navega para `/transactions` filtrada.

### Cenário 3: Transações, Filtros e Exportação (320px, 768px, 1440px)
1. Em `/transactions` a `320px`, abrir os dropdowns de Categoria, Origem e Conta Bancária (inclusive com nomes longos) verificando que não expandem a página.
2. Com lançamentos listados, validar em `<768px` a apresentação legível em cartões móveis (exibindo descrição, data, categoria, conta, origem, valor e ações de editar/excluir com toque confortável) e em `>=768px` a tabela completa alinhada.
3. Em `/settings/export` a `320px`, escolher **"Intervalo Customizado"** e confirmar que os dois campos de data empilham sem cortar o ícone de calendário e os 3 botões de exportação funcionam.

### Cenário 4: Modais, Formulários e Chat em Altura Reduzida (`320x568` e Mobile)
1. Em `320x568`, abrir os diálogos de **Nova Conta**, **Excluir Conta**, **Editar Transação**, **Excluir Transação** e **Chave de IA**, confirmando que o diálogo rola internamente sem esconder o botão de confirmar/salvar.
2. Em `/chat` e na gaveta lateral do consultor, simular entrada longa (URL longa / bloco de código / lista) e verificar quebra limpa dentro da bolha e campo de envio sempre visível.
3. Verificar nas páginas longas que o botão flutuante do consultor não bloqueia os botões de salvar no rodapé ao rolar até o fim.

---

## 3. Verificação Automatizada

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Todos os testes unitários/de integração existentes e os novos testes responsivos devem passar 100%, com zero erros de tipagem e build de produção limpo.
