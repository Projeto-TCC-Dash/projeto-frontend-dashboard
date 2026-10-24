"use client";

import * as React from "react";
import { useUserProfile, useUpdateFinancialProfile } from "@/hooks/use-user-profile";
import { FinancialProfileForm } from "@/components/profile/financial-profile-form";
import { UserCheck, Loader2 } from "lucide-react";

export default function ProfileSettingsPage() {
  const { data: userProfile, isLoading, error } = useUserProfile();
  const { updateProfile, isPending } = useUpdateFinancialProfile();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">
          Carregando seu perfil financeiro...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Perfil Financeiro & Metas
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure voluntariamente suas informações de trabalho, renda e objetivos
              para orientações personalizadas da IA.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar as informações do perfil. Verifique sua conexão.
        </div>
      )}

      <FinancialProfileForm
        initialData={userProfile?.financialProfile}
        onSubmit={async (formData) => {
          await updateProfile(formData);
        }}
        isPending={isPending}
      />
    </div>
  );
}
