# API Contracts: Feature 008

## `GET /api/analysis/:month`

Retorna as métricas consolidadas e diagnóstico em linguagem natural para o mês informado, segregando as liquidações de fatura.

### Resposta HTTP 200 OK
```json
{
  "cached": true,
  "month": "2026-10",
  "diagnosis": "No mês de outubro de 2026, seu perfil de gastos apresentou forte disciplina financeira...",
  "recommendations": [
    "Mantenha a pontualidade na liquidação integral da fatura do seu cartão de crédito para evitar encargos rotativos.",
    "Avalie oportunidades de otimização nos gastos com alimentação que representaram 45% do orçamento primário."
  ],
  "metrics": {
    "totalIncome": 8500.00,
    "totalExpenses": 3200.00,
    "invoiceSettlements": 2400.00,
    "netBalance": 5300.00,
    "savingsRate": 62.4,
    "topCategories": [
      {
        "category": "Alimentação",
        "amount": 1440.00,
        "percentage": 45.0
      },
      {
        "category": "Transporte",
        "amount": 800.00,
        "percentage": 25.0
      },
      {
        "category": "Lazer",
        "amount": 500.00,
        "percentage": 15.6
      }
    ]
  },
  "generatedAt": "2026-10-19T21:00:00.000Z",
  "expiresAt": "2026-10-20T21:00:00.000Z"
}
```
