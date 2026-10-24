# Quickstart: Feature 008

## Como validar a segregação de faturas e diagnóstico calibrado

1. **Executar a suíte de testes**:
   ```bash
   pnpm test
   ```
2. **Iniciar o ambiente de desenvolvimento**:
   ```bash
   pnpm dev
   ```
3. **Acessar o Dashboard em `http://localhost:3001`**:
   - Observar o Grid de 5 Cards:
     - Receitas Totais
     - Despesas Primárias (Consumo real)
     - Quitação de Faturas (Segregado)
     - Saldo Líquido recalculado
     - Taxa de Poupança
   - Observar o Gráfico de Rosca com suporte a todas as 11 categorias canônicas (ex: Investimentos em Ciano, Pagamento de Fatura em Slate).
   - Observar no Card de Diagnóstico do Mês a faixa recomendada de Reserva de Emergência personalizada conforme o regime de renda (`CLT`, `PJ_AUTONOMO`, etc.) e os chips de metas ativas.
