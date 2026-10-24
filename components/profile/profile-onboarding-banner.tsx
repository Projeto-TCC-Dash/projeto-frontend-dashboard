"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export interface ProfileOnboardingBannerProps {
  hasProfile?: boolean;
}

export function ProfileOnboardingBanner({
  hasProfile = false,
}: ProfileOnboardingBannerProps) {
  const router = useRouter();

  // Lê de forma segura o sessionStorage após montagem client-side
  const [isDismissed, setIsDismissed] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem("dismiss_profile_banner") === "true";
    } catch {
      return false;
    }
  });

  if (hasProfile || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    try {
      sessionStorage.setItem("dismiss_profile_banner", "true");
    } catch {
      // Ignora erro em modo restrito
    }
    setIsDismissed(true);
  };

  const handleConfigure = () => {
    router.push("/settings/profile");
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm sm:text-base">
              Personalize suas orientações financeiras
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Informe seu regime de renda e metas prioritárias para que o Gemini calcule
              a reserva de emergência sob medida e sugira estratégias para o seu momento de vida.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Dispensar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfigure}
            className="gap-1.5 text-xs shadow-sm"
          >
            Configurar Perfil
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
