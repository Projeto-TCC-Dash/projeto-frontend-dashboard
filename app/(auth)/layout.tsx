import * as React from "react";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-muted/30">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center justify-center size-12 rounded-2xl bg-primary text-primary-foreground shadow-md">
            <Sparkles className="size-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Plataforma Financeira
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestão inteligente e diagnósticos com IA
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
