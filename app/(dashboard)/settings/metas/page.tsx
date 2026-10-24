"use client";

import * as React from "react";
import { useUserProfile, useUpdateFinancialProfile } from "@/hooks/use-user-profile";
import { FinancialProfileForm } from "@/components/profile/financial-profile-form";
import { Loader2, TrendingUp } from "lucide-react";

export default function SettingsMetasPage() {
  const { data: userProfile, isLoading, error } = useUserProfile();
  const { updateProfile: updateFinancial, isPending: isUpdatingFinancial } =
    useUpdateFinancialProfile();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">
          Carregando perfil de investidor e metas...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="size-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Perfil de Investidor & Metas
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Defina seu perfil de risco, objetivos e reserva de emergência para calibrar os diagnósticos e recomendações da IA.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar as informações de metas. Verifique sua conexão.
        </div>
      )}

      <FinancialProfileForm
        initialData={userProfile?.financialProfile}
        onSubmit={async (formData) => {
          await updateFinancial(formData);
        }}
        isPending={isUpdatingFinancial}
      />
    </div>
  );
}
