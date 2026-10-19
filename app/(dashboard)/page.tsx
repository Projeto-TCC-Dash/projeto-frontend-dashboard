import type { Metadata } from "next";
import { Sparkles, TrendingUp, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Dashboard Financeiro | FinAI",
  description: "Visão consolidada de métricas financeiras e diagnósticos por inteligência artificial.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Painel Financeiro Inteligente
            </h1>
            <Badge variant="success">IA Ativa</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Acompanhe o fluxo de caixa mensal, a taxa de poupança e as análises geradas pelo Gemini.
          </p>
        </div>
      </div>

      {/* Grid de Resumo Financeiro (Mock / Pré-visualização do Shell) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Totais</CardTitle>
            <ArrowUpRight className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              R$ 0,00
            </div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando importação de extratos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <ArrowDownRight className="size-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              R$ 0,00
            </div>
            <p className="text-xs text-muted-foreground mt-1">0 transações contabilizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            <Wallet className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ 0,00
            </div>
            <p className="text-xs text-muted-foreground mt-1">Balanço do mês atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Poupança</CardTitle>
            <TrendingUp className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              0,0%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Meta sugerida: 20%+</p>
          </CardContent>
        </Card>
      </div>

      {/* Card de Diagnóstico IA */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <CardTitle>Diagnóstico Mensal com IA</CardTitle>
          </div>
          <CardDescription>
            Assim que você importar seus extratos (.ofx ou .csv), seu consultor financeiro gerará o parecer analítico completo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            <p className="text-sm">Nenhum extrato processado para a competência selecionada.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
