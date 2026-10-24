"use client";

import * as React from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { UserProfileIdentityForm } from "@/components/profile/user-profile-identity-form";
import { Loader2 } from "lucide-react";

export default function ProfileSettingsPage() {
  const {
    data: userProfile,
    isLoading,
    error,
    updateIdentity,
    isUpdatingIdentity,
  } = useUserProfile();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">
          Carregando informações do perfil...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar as informações do perfil. Verifique sua conexão.
        </div>
      )}

      {/* Formulário Unificado de Identidade (Foto + Nome) */}
      <UserProfileIdentityForm
        initialName={userProfile?.name}
        email={userProfile?.email || ""}
        avatarUrl={userProfile?.avatarUrl}
        onSubmit={async (payload) => {
          await updateIdentity(payload);
        }}
        isPending={isUpdatingIdentity}
      />
    </div>
  );
}
