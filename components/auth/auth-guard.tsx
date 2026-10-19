"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAiKey?: boolean;
}

export function AuthGuard({ children, requireAiKey = true }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();

  React.useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Se a rota exige chave de IA e o usuário ainda não possui (hasAiKey === false),
    // e o usuário não está já na página de onboarding, redireciona para onboarding obrigatório
    if (requireAiKey && !user?.hasAiKey && pathname !== "/onboarding") {
      router.replace("/onboarding");
      return;
    }

    // Se o usuário já possui chave e está na página de onboarding, redireciona para o dashboard
    if (user?.hasAiKey && pathname === "/onboarding") {
      router.replace("/");
      return;
    }
  }, [isAuthenticated, isLoading, user, requireAiKey, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">Verificando credenciais...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireAiKey && !user?.hasAiKey && pathname !== "/onboarding") {
    return null;
  }

  return <>{children}</>;
}
