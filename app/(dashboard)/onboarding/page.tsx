"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AiKeyForm } from "@/components/ai-key/ai-key-form";
import { Sparkles, KeyRound, ShieldCheck } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();

  function handleSuccess() {
    // Redireciona para o painel principal
    setTimeout(() => {
      router.push("/");
    }, 1500);
  }

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-primary/10 text-primary mb-2">
          <Sparkles className="size-6 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Ativação da Inteligência Financeira (BYOK)
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
          Para liberar o acesso ao dashboard, conecte sua chave gratuita do Google AI Studio. Suas análises serão processadas com privacidade usando sua própria cota.
        </p>
      </div>

      <Card className="border-border shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <KeyRound className="size-5" />
            <CardTitle>Cadastrar Chave do Google Gemini</CardTitle>
          </div>
          <CardDescription>
            A chave é armazenada de forma segura e utilizada exclusivamente para categorizar suas transações e gerar seus diagnósticos mensais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AiKeyForm onSuccess={handleSuccess} showHelpLink={true} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-muted/40 border border-border/50">
          <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            <strong>Privacidade por Design</strong>: Seus dados bancários e extratos nunca são utilizados para treinamento de modelos públicos.
          </span>
        </div>
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-muted/40 border border-border/50">
          <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
          <span>
            <strong>Cota Gratuita do Gemini</strong>: O Google AI Studio oferece cota gratuita generosa para modelos como Gemini 1.5 e 2.0 Flash.
          </span>
        </div>
      </div>
    </div>
  );
}
