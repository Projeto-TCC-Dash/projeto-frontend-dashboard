"use client";

import * as React from "react";
import {
  INCOME_TYPES,
  INCOME_TYPE_LABELS,
  FINANCIAL_GOALS,
  FINANCIAL_GOAL_LABELS,
  RISK_PROFILES,
  RISK_PROFILE_LABELS,
  type IncomeType,
  type FinancialGoal,
  type RiskProfile,
  type FinancialProfile,
  type UpdateFinancialProfileDTO,
} from "@/src/types/api";
import { parseBrlToNumber, formatBrlCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Info, Loader2, Sparkles, Target, Shield, Briefcase } from "lucide-react";

export interface FinancialProfileFormProps {
  initialData?: FinancialProfile;
  onSubmit: (data: UpdateFinancialProfileDTO) => void | Promise<void>;
  isPending?: boolean;
}

export function FinancialProfileForm({
  initialData,
  onSubmit,
  isPending = false,
}: FinancialProfileFormProps) {
  const [incomeType, setIncomeType] = React.useState<IncomeType | undefined>(
    initialData?.incomeType
  );
  const [incomeInput, setIncomeInput] = React.useState<string>(() =>
    initialData?.declaredMonthlyIncome !== undefined
      ? formatBrlCurrency(initialData.declaredMonthlyIncome)
      : ""
  );
  const [selectedGoals, setSelectedGoals] = React.useState<FinancialGoal[]>(() =>
    initialData?.goals || []
  );
  const [riskProfile, setRiskProfile] = React.useState<RiskProfile | undefined>(
    initialData?.riskProfile
  );
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Sincroniza se initialData mudar
  React.useEffect(() => {
    if (initialData) {
      if (initialData.incomeType) setIncomeType(initialData.incomeType);
      if (initialData.declaredMonthlyIncome !== undefined) {
        setIncomeInput(formatBrlCurrency(initialData.declaredMonthlyIncome));
      }
      if (initialData.goals) setSelectedGoals(initialData.goals);
      if (initialData.riskProfile) setRiskProfile(initialData.riskProfile);
    }
  }, [initialData]);

  const toggleGoal = (goal: FinancialGoal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleIncomeBlur = () => {
    const parsed = parseBrlToNumber(incomeInput);
    if (parsed !== undefined) {
      setIncomeInput(formatBrlCurrency(parsed));
    } else {
      setIncomeInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    const parsedIncome = parseBrlToNumber(incomeInput);

    const payload: UpdateFinancialProfileDTO = {
      incomeType,
      declaredMonthlyIncome: parsedIncome,
      goals: selectedGoals.length > 0 ? selectedGoals : undefined,
      riskProfile,
    };

    await onSubmit(payload);
    setSuccessMessage("Perfil financeiro atualizado com sucesso!");
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Banner de Voluntariedade e LGPD */}
      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="font-medium text-primary">Preenchimento 100% Voluntário</p>
          <p className="text-muted-foreground mt-0.5">
            Estes dados são protegidos e servem exclusivamente para calibrar a inteligência
            do Gemini, personalizando a meta de reserva de emergência e conselhos para a sua realidade.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400">
          <Check className="h-5 w-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1. Regime de Trabalho e Renda */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <CardTitle>Regime de Trabalho e Renda</CardTitle>
          </div>
          <CardDescription>
            Como você obtém sua renda principal? Isso define a recomendação ideal para sua reserva de emergência.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {INCOME_TYPES.map((type) => {
              const isSelected = incomeType === type;
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => setIncomeType(type)}
                  className={`flex items-center justify-between rounded-lg border p-3.5 text-left text-sm font-medium transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <span>{INCOME_TYPE_LABELS[type]}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Renda Mensal Declarada */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <CardTitle>Renda Mensal Declarada</CardTitle>
          </div>
          <CardDescription>
            Informe uma estimativa da sua receita líquida mensal em reais (opcional).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs space-y-1.5">
            <label
              htmlFor="declaredMonthlyIncome"
              className="text-sm font-medium text-foreground"
            >
              Renda Mensal Declarada
            </label>
            <div className="relative">
              <Input
                id="declaredMonthlyIncome"
                type="text"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                onBlur={handleIncomeBlur}
                placeholder="R$ 0,00"
                className="font-mono text-base"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Utilizado para cálculo de taxa de poupança teórica e dimensionamento de metas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Metas Financeiras Prioritárias */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Metas Financeiras Prioritárias</CardTitle>
          </div>
          <CardDescription>
            Selecione um ou mais objetivos prioritários para direcionar as recomendações da IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2.5">
            {FINANCIAL_GOALS.map((goal) => {
              const isSelected = selectedGoals.includes(goal);
              return (
                <button
                  type="button"
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow"
                      : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted"
                  }`}
                >
                  <span>{FINANCIAL_GOAL_LABELS[goal]}</span>
                  {isSelected && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Perfil de Risco */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Perfil de Tolerância a Risco</CardTitle>
          </div>
          <CardDescription>
            Qual é a sua postura diante de oscilações e volatilidade financeira?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
            {RISK_PROFILES.map((risk) => {
              const isSelected = riskProfile === risk;
              return (
                <button
                  type="button"
                  key={risk}
                  onClick={() => setRiskProfile(risk)}
                  className={`flex flex-col rounded-lg border p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {risk === "CONSERVATIVE" && "Conservador"}
                      {risk === "MODERATE" && "Moderado"}
                      {risk === "AGGRESSIVE" && "Agressivo"}
                    </span>
                    {isSelected && <Badge variant="default">Selecionado</Badge>}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {RISK_PROFILE_LABELS[risk]}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="submit"
          disabled={isPending}
          className="min-w-[160px]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Salvar Perfil
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
