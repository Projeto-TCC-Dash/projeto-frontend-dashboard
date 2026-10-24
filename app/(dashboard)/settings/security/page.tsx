"use client";

import * as React from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useTwoFactorAuth } from "@/hooks/use-two-factor-auth";
import { TwoFactorSetupModal } from "@/components/security/two-factor-setup-modal";
import { ConnectedAccountsSection } from "@/components/security/connected-accounts-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  ShieldOff,
  LogOut,
  Loader2,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

export default function SecuritySettingsPage() {
  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useUserProfile();
  const {
    requestEnable,
    confirmEnable,
    disable2FA,
    logout,
    isRequesting,
    isConfirming,
    isDisabling,
  } = useTwoFactorAuth();

  const [setupModalOpen, setSetupModalOpen] = React.useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [successBanner, setSuccessBanner] = React.useState<string | null>(null);

  const security = userProfile?.security;
  const is2FAEnabled = Boolean(security?.twoFactorEnabled);

  const handleStartEnable2FA = async () => {
    setActionError(null);
    try {
      await requestEnable();
      setSetupModalOpen(true);
    } catch (err: unknown) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Erro ao solicitar código de ativação do 2FA"
      );
    }
  };

  const handleConfirm2FA = async (code: string) => {
    setActionError(null);
    try {
      await confirmEnable({ code });
      setSuccessBanner("Autenticação em dois fatores ativada com sucesso!");
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err: unknown) {
      throw err;
    }
  };

  const handleResendCode = async () => {
    await requestEnable();
  };

  const handleConfirmDisable2FA = async () => {
    setActionError(null);
    try {
      await disable2FA();
      setDisableDialogOpen(false);
      setSuccessBanner("Autenticação em dois fatores desativada.");
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Erro ao desativar o 2FA"
      );
    }
  };

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

      {actionError && (
        <div
          data-testid="security-action-error"
          className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <AlertCircle className="size-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Seção 1: Autenticação em Dois Fatores (2FA) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              <span>Autenticação em Dois Fatores (2FA via E-mail)</span>
            </div>
            {is2FAEnabled ? (
              <Badge
                data-testid="2fa-status-badge"
                variant="default"
                className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs"
              >
                <ShieldCheck className="size-3.5" />
                <span>Ativado</span>
              </Badge>
            ) : (
              <Badge
                data-testid="2fa-status-badge"
                variant="secondary"
                className="gap-1 text-xs"
              >
                <ShieldOff className="size-3.5" />
                <span>Desativado</span>
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Exige um código temporário de 6 dígitos enviado para seu e-mail cadastrado a cada novo login, impedindo acessos não autorizados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border/70 bg-card/50">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {is2FAEnabled
                  ? "Sua conta está protegida com autenticação em duas etapas"
                  : "Aumente a segurança do seu patrimônio ativando o 2FA"}
              </p>
              <p className="text-xs text-muted-foreground">
                {is2FAEnabled
                  ? `Os códigos de segurança são enviados para ${userProfile?.email}`
                  : "Recomendado para proteger seus dados financeiros e extratos bancários."}
              </p>
            </div>

            <div className="shrink-0">
              {is2FAEnabled ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDisableDialogOpen(true)}
                  disabled={isDisabling}
                  data-testid="toggle-2fa-button"
                  className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive w-full sm:w-auto"
                >
                  {isDisabling && <Loader2 className="size-3.5 animate-spin" />}
                  <span>Desativar 2FA</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleStartEnable2FA}
                  disabled={isRequesting}
                  data-testid="toggle-2fa-button"
                  className="gap-1.5 text-xs w-full sm:w-auto"
                >
                  {isRequesting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-3.5" />
                  )}
                  <span>Ativar 2FA via E-mail</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Contas Conectadas (Google) */}
      <ConnectedAccountsSection
        googleLinked={security?.googleLinked}
        googleEmail={security?.googleEmail}
        googleLinkedAt={security?.googleLinkedAt}
        hasLocalPassword={security?.hasLocalPassword ?? true}
      />

      {/* Seção 3: Encerramento de Sessão (Logout) */}
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

      {/* Modal OTP de Ativação do 2FA */}
      <TwoFactorSetupModal
        open={setupModalOpen}
        onOpenChange={setSetupModalOpen}
        userEmail={userProfile?.email}
        onConfirm={handleConfirm2FA}
        onResend={handleResendCode}
        isConfirming={isConfirming}
        isResending={isRequesting}
      />

      {/* Modal de Desativação do 2FA */}
      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent
          data-testid="disable-2fa-dialog"
          onClose={() => setDisableDialogOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>Desativar Autenticação em 2 Fatores?</DialogTitle>
            <DialogDescription>
              Ao desativar o 2FA, sua conta voltará a exigir apenas a senha (ou login Google) para entrar.
              Sua segurança contra acessos indevidos será reduzida.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDisableDialogOpen(false)}
              disabled={isDisabling}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDisable2FA}
              disabled={isDisabling}
              data-testid="confirm-disable-2fa-button"
              className="gap-2"
            >
              {isDisabling && <Loader2 className="size-4 animate-spin" />}
              <span>Sim, desativar</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
