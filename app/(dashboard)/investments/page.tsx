"use client"

import * as React from "react"
import Link from "next/link"
import {
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InvestmentAllocationDonut } from "@/components/investments/investment-allocation-donut"
import { InvestmentPortfolioCard } from "@/components/accounts/investment-portfolio-card"
import { InvestmentTimeSeriesChart } from "@/components/charts/investment-time-series-chart"
import { useAccounts } from "@/hooks/use-accounts"
import {
  useInvestmentPortfolio,
  useUpsertInvestmentHolding,
} from "@/hooks/use-investments"
import { useTransactions } from "@/hooks/use-transactions"
import { buildPatrimonyTimeSeries } from "@/lib/dashboard-charts"
import { formatCurrencyBRL } from "@/lib/formatters"
import { APP_ROUTES } from "@/src/types/api"

const RISK_PROFILE_LABELS: Record<string, string> = {
  CONSERVATIVE: "Conservador",
  MODERATE: "Moderado",
  AGGRESSIVE: "Agressivo",
}

export default function InvestmentsPage() {
  const { accounts, isLoading: isAccountsLoading } = useAccounts()
  const { portfolio, isLoading: isPortfolioLoading } = useInvestmentPortfolio()
  const { upsertHolding, isPending: isUpserting } =
    useUpsertInvestmentHolding()
  const { transactions: allTransactions } = useTransactions({})
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(
    null
  )

  React.useEffect(() => {
    if (!feedbackMessage) return
    const timer = setTimeout(() => setFeedbackMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [feedbackMessage])

  const patrimonySeries = React.useMemo(
    () => buildPatrimonyTimeSeries(allTransactions, accounts),
    [allTransactions, accounts]
  )

  const totalInvested = portfolio?.totalInvested ?? 0
  const riskProfileLabel = portfolio?.riskProfile
    ? (RISK_PROFILE_LABELS[portfolio.riskProfile] ?? portfolio.riskProfile)
    : "Não definido"
  const isAdherent = portfolio?.allocationDiagnosis?.adherentToRiskProfile ?? true
  const classesCount = portfolio?.holdings.filter((h) => h.amount > 0).length ?? 0

  return (
    <div data-testid="investments-page" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <TrendingUp className="size-6 text-primary" />
            Carteira de Investimentos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Distribuição por macroclasse, diagnóstico frente ao seu perfil de
            risco e evolução patrimonial.
          </p>
        </div>

        <Link
          href={APP_ROUTES.ACCOUNTS}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Wallet className="size-4" />
          Gerenciar Contas
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {feedbackMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* KPIs Consolidados da Carteira */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Investido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
              {formatCurrencyBRL(totalInvested)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {classesCount}{" "}
              {classesCount === 1
                ? "macroclasse ativa"
                : "macroclasses ativas"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Perfil de Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {riskProfileLabel}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Referência para recomendações da carteira
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Diagnóstico de Aderência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isAdherent ? (
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="size-3.5" />
                  Aderente ao Perfil
                </Badge>
              ) : (
                <Badge variant="warning" className="gap-1">
                  <AlertTriangle className="size-3.5" />
                  Desalinhamento Detectado
                </Badge>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {portfolio?.allocationDiagnosis?.recommendations?.[0] ??
                "Atualize suas posições para receber recomendações."}
            </p>
          </CardContent>
        </Card>
      </div>

      {!isAccountsLoading && accounts.length === 0 ? (
        <Card className="border-dashed p-6 text-center">
          <p className="text-sm font-medium text-foreground">
            Cadastre pelo menos uma conta ou corretora para registrar posições
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Suas alocações em Renda Fixa, Ações, FIIs ou Cripto ficam
            vinculadas às suas contas financeiras.
          </p>
          <div className="mt-4">
            <Link
              href={APP_ROUTES.ACCOUNTS}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              Cadastrar Conta
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <InvestmentAllocationDonut
              portfolio={portfolio}
              isLoading={isPortfolioLoading}
            />
          </div>
          <div className="xl:col-span-7">
            <InvestmentPortfolioCard
              portfolio={portfolio}
              accounts={accounts}
              isLoading={isPortfolioLoading}
              onUpsertHolding={async (dto) => {
                const res = await upsertHolding(dto)
                setFeedbackMessage("Posição de investimento atualizada!")
                return res
              }}
              isSubmitting={isUpserting}
            />
          </div>
        </div>
      )}

      {/* Gráfico de Evolução Patrimonial */}
      <InvestmentTimeSeriesChart
        title="Evolução Patrimonial"
        subtitle="Histórico consolidado dos saldos e patrimônio ao longo do tempo"
        seriesType="area"
        data={patrimonySeries}
        height={260}
      />
    </div>
  )
}
