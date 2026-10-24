"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Mail, Loader2, RotateCcw, AlertCircle } from "lucide-react";
import { confirm2FASchema } from "@/lib/validations/profile";

export interface TwoFactorSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
  onConfirm: (code: string) => Promise<unknown>;
  onResend: () => Promise<unknown>;
  isConfirming?: boolean;
  isResending?: boolean;
  initialCountdownSeconds?: number;
}

export function TwoFactorSetupModal({
  open,
  onOpenChange,
  userEmail,
  onConfirm,
  onResend,
  isConfirming = false,
  isResending = false,
  initialCountdownSeconds = 60,
}: TwoFactorSetupModalProps) {
  const [code, setCode] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = React.useState(
    initialCountdownSeconds
  );

  // Reinicia estado ao abrir
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setCode("");
      setErrorMessage(null);
      setSecondsRemaining(initialCountdownSeconds);
    }
  }

  // Timer regressivo
  React.useEffect(() => {
    if (!open || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [open, secondsRemaining]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(rawVal);
    if (errorMessage) setErrorMessage(null);
  };

  const handleConfirm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const validation = confirm2FASchema.safeParse({ code });
    if (!validation.success) {
      setErrorMessage(
        validation.error.issues[0]?.message || "O código deve conter 6 dígitos"
      );
      return;
    }

    try {
      await onConfirm(code);
      onOpenChange(false);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Código inválido ou expirado"
      );
    }
  };

  const handleResendCode = async () => {
    setErrorMessage(null);
    try {
      await onResend();
      setSecondsRemaining(initialCountdownSeconds);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Não foi possível reenviar o código no momento"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="two-factor-setup-modal"
        onClose={() => onOpenChange(false)}
        className="max-w-md"
      >
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            Ativar Autenticação em 2 Fatores (2FA)
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground pt-1">
            Enviamos um código de segurança de 6 dígitos para o e-mail:
            <br />
            <strong className="text-foreground flex items-center justify-center gap-1 mt-1 font-medium">
              <Mail className="size-3 text-primary inline" />
              <span>{userEmail || "seu e-mail cadastrado"}</span>
            </strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirm} className="space-y-4 pt-2">
          {errorMessage && (
            <div
              data-testid="two-factor-modal-error"
              className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-2 text-center">
            <label
              htmlFor="otp-code-input"
              className="text-xs font-semibold text-foreground block"
            >
              Digite o código de 6 dígitos:
            </label>
            <div className="flex justify-center">
              <Input
                id="otp-code-input"
                data-testid="otp-code-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={handleCodeChange}
                placeholder="000000"
                className="w-48 text-center text-2xl font-mono tracking-[0.5em] px-2 py-2 h-12"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Válido por 10 minutos após o envio.
            </p>
          </div>

          <div className="flex items-center justify-center text-xs text-muted-foreground pt-1">
            {secondsRemaining > 0 ? (
              <span data-testid="resend-countdown" className="text-muted-foreground">
                Reenviar código em <strong className="text-foreground">{secondsRemaining}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending || isConfirming}
                data-testid="resend-code-button"
                className="flex items-center gap-1.5 text-primary hover:underline font-medium cursor-pointer disabled:opacity-50"
              >
                {isResending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="size-3.5" />
                )}
                <span>Reenviar código para meu e-mail</span>
              </button>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isConfirming}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isConfirming || code.length !== 6}
              data-testid="confirm-2fa-button"
              className="gap-2"
            >
              {isConfirming && <Loader2 className="size-4 animate-spin" />}
              <span>Confirmar e Ativar</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
