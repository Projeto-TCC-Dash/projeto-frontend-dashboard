"use client";

import * as React from "react";
import {
  Sparkles,
  RefreshCw,
  Key,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FinancialAnalysis, FinancialProfile, FINANCIAL_GOAL_LABELS } from "@/src/types/api";
import { MarkdownRenderer } from "@/lib/markdown-renderer";
import { formatDateBR, computeEmergencyReserveGuideline } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export interface AiDiagnosisCardProps {
  analysis: FinancialAnalysis | null;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  hasAiKey?: boolean;
  onOpenAiKeyModal?: () => void;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
  financialProfile?: FinancialProfile | null;
  monthlyExpenses?: number;
}

export function AiDiagnosisCard({
  analysis,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  hasAiKey = true,
  onOpenAiKeyModal,
  error,
  onRetry,
  className,
  financialProfile,
  monthlyExpenses,
}: AiDiagnosisCardProps) {
  // 1. Estado quando o usuário não possui chave de IA configurada (BYOK Fallback)
  if (!hasAiKey) {
    return (
      <Card
        className={cn("border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-amber-500/5 via-card to-card", className)}
        data-testid="ai-diagnosis-card-byok-required"
      >
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Key className="size-5" />
              </div>
              <CardTitle className="text-base sm:text-lg">
                Ative seu Consultor Financeiro Inteligente
              </CardTitle>
            </div>
            <CardDescription>
              Gere diagnósticos automatizados do mês, análises de desvios e recomendações personalizadas com o Gemini.
            </CardDescription>
          </div>
          <Button
            type="button"
            onClick={onOpenAiKeyModal}
            className="bg-amber-600 text-white hover:bg-amber-700 shadow-sm transition-all gap-2 self-start sm:self-auto"
            aria-label="Configurar Chave de IA"
          >
            <Key className="size-4" />
            Configurar Chave de IA
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed border-amber-300/60 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-5 text-sm text-muted-foreground flex flex-col sm:flex-row items-center gap-4">
            <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-medium text-foreground">
                Sua chave de API do Google AI Studio é gratuita e pessoal.
              </p>
              <p className="text-xs text-muted-foreground">
                Com o modelo BYOK (Bring Your Own Key), seus dados são processados com total privacidade e você não paga mensalidades pelo assistente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 2. Estado de Erro na Chamada da IA
  if (error) {
    const isRateLimit = error.message.includes("429") || error.message.toLowerCase().includes("muitas requisições");
    const isServiceUnavailable = error.message.includes("503") || error.message.toLowerCase().includes("sobrecarregado");

    return (
      <Card
        className={cn("border-rose-200/60 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10", className)}
        data-testid="ai-diagnosis-card-error"
      >
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">
                Diagnóstico Temporariamente Indisponível
              </CardTitle>
              <CardDescription>
                {isRateLimit
                  ? "Limite de chamadas atingido temporariamente."
                  : isServiceUnavailable
                  ? "Serviço de IA upstream sob alta demanda no momento."
                  : "Não foi possível carregar a análise deste mês."}
              </CardDescription>
            </div>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw className="size-3.5" />
              Tentar novamente
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {error.message || "Tente atualizar o parecer ou aguarde alguns minutos."}
          </p>
        </CardContent>
      </Card>
    );
  }

  // 3. Estado de Carregamento (Skeleton)
  if (isLoading) {
    return (
      <Card className={cn("border-border animate-pulse", className)} data-testid="ai-diagnosis-card-loading">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3">
          <div className="space-y-2">
            <div className="h-5 w-52 bg-muted rounded" />
            <div className="h-4 w-72 bg-muted rounded" />
          </div>
          <div className="h-9 w-36 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
            <div className="h-4 w-4/6 bg-muted rounded" />
          </div>
          <div className="h-24 w-full bg-muted/60 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  // 4. Estado Vazio (Sem Análise para o Mês)
  if (!analysis) {
    return (
      <Card className={cn("border-border", className)} data-testid="ai-diagnosis-card-empty">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <CardTitle>Diagnóstico Mensal com IA</CardTitle>
          </div>
          {onRefresh && (
            <Button
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-1.5 self-start sm:self-auto"
            >
              <Sparkles className="size-4" />
              Gerar Análise
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhuma análise gerada para a competência selecionada. Clique em &quot;Gerar Análise&quot; para acionar o consultor.
          </div>
        </CardContent>
      </Card>
    );
  }

  // 5. Exibição Completa do Parecer e Recomendações
  const expenses = analysis.metrics?.totalExpenses ?? monthlyExpenses ?? 0;
  const guideline = computeEmergencyReserveGuideline(financialProfile?.incomeType, expenses);
  const activeGoals = financialProfile?.goals ?? [];

  return (
    <Card
      className={cn("border-border overflow-hidden transition-all duration-200", className)}
      data-testid="ai-diagnosis-card"
    >
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border/40">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <CardTitle className="text-base sm:text-lg">
                Parecer do Consultor Financeiro
              </CardTitle>
            </div>
            {analysis.cached ? (
              <Badge variant="secondary" className="gap-1 font-mono text-[11px]" title="Análise recuperada do cache">
                <Clock className="size-3" />
                Cache ativo 24h
              </Badge>
            ) : (
              <Badge variant="success" className="gap-1 font-mono text-[11px]">
                <Sparkles className="size-3" />
                Análise recém-gerada
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            Gerado em {formatDateBR(analysis.generatedAt)} pelo modelo Gemini através de sua chave BYOK.
          </CardDescription>
        </div>

        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-2 self-start sm:self-auto shrink-0"
            title="Ignora o cache e solicita nova análise ao Gemini"
            aria-label="Recalcular Diagnóstico"
          >
            <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin text-primary")} />
            {isRefreshing ? "Recalculando..." : "Recalcular Diagnóstico"}
          </Button>
        )}
      </CardHeader>

      <CardContent className="pt-5 space-y-6">
        {/* Diretriz Calibrada de Reserva de Emergência sob Medida */}
        <div
          className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 sm:p-5 space-y-2"
          data-testid="emergency-reserve-guideline"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <ShieldCheck className="size-4 text-sky-500" />
              <span>Diretriz de Reserva de Emergência sob Medida</span>
            </div>
            <Badge variant="outline" className="border-sky-500/30 text-sky-700 dark:text-sky-300 bg-sky-500/10 text-xs">
              {guideline.regimeLabel} • Meta: {guideline.monthsLabel}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {guideline.isCustomized ? (
              <>
                Com base no seu perfil ({guideline.regimeLabel}), a meta prudencial recomendada é de{" "}
                <span className="font-semibold text-foreground">{guideline.monthsLabel}</span> de despesas de consumo
                {guideline.formattedAmountRange ? (
                  <>
                    {" "}(faixa estimada: <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">{guideline.formattedAmountRange}</span>)
                  </>
                ) : null}.
              </>
            ) : (
              <>
                Adotando a média prudencial de mercado de{" "}
                <span className="font-semibold text-foreground">6 meses</span> de gastos
                {guideline.formattedAmountRange ? (
                  <>
                    {" "}(faixa estimada: <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">{guideline.formattedAmountRange}</span>)
                  </>
                ) : null}. Personalize seu regime em Configurações &gt; Perfil Financeiro.
              </>
            )}
          </p>
        </div>

        {/* Texto do Parecer em Markdown Sanitizado */}
        <div className="prose prose-sm dark:prose-invert max-w-none" data-testid="diagnosis-markdown-content">
          <MarkdownRenderer content={analysis.diagnosis} />
        </div>

        {/* Lista de Recomendações Práticas */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div
            className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-3"
            data-testid="diagnosis-recommendations-section"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Lightbulb className="size-4 text-amber-500" />
                <span>Recomendações Práticas para o seu Orçamento</span>
              </div>
              {activeGoals.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5" data-testid="user-active-goals-chips">
                  <span className="text-[11px] text-muted-foreground mr-1">Metas ativas:</span>
                  {activeGoals.map((goal) => (
                    <Badge key={goal} variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">
                      <Target className="size-3 mr-1 text-primary" />
                      {FINANCIAL_GOAL_LABELS[goal] || goal}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <ul className="grid gap-2 sm:grid-cols-1">
              {analysis.recommendations.map((rec, index) => (
                <li
                  key={`rec-${index}`}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed p-2.5 rounded-lg bg-card/60 border border-border/50"
                >
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
