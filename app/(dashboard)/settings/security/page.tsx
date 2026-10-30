"use client";

import * as React from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useAuth } from "@/hooks/use-auth";
import { ConnectedAccountsSection } from "@/components/security/connected-accounts-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function SecuritySettingsPage() {
  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useUserProfile();
  const { logout } = useAuth();

  const [successBanner, setSuccessBanner] = React.useState<string | null>(null);

  const security = userProfile?.security;

  if (isProfileLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">
          Carregando configurações de segurança...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {profileError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar as informações de segurança. Verifique sua conexão.
        </div>
      )}

      {successBanner && (
        <div
          data-testid="security-success-banner"
          className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400"
        >
          <CheckCircle2 className="size-5 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Seção 1: Contas Conectadas (Google) */}
      <ConnectedAccountsSection
        googleLinked={security?.googleLinked}
        googleEmail={security?.googleEmail}
        googleLinkedAt={security?.googleLinkedAt}
        hasLocalPassword={security?.hasLocalPassword ?? true}
      />

      {/* Seção 2: Encerramento de Sessão (Logout) */}
      <Card className="shadow-sm border-destructive/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <LogOut className="size-5" />
            <span>Sessão & Desconexão</span>
          </CardTitle>
          <CardDescription>
            Encerre sua sessão ativa com segurança neste dispositivo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-destructive/5 border border-destructive/10">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">
                Sair da Conta FinAI
              </p>
              <p className="text-xs text-muted-foreground">
                Remove os tokens locais de autenticação e redireciona para a tela de login.
              </p>
            </div>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={logout}
              data-testid="security-logout-button"
              className="gap-2 text-xs shrink-0"
            >
              <LogOut className="size-3.5" />
              <span>Sair da Sessão</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
