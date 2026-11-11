"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { AiKeyForm } from "@/components/ai-key/ai-key-form"
import { Sparkles, KeyRound, ShieldCheck } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()

  function handleSuccess() {
    // Redireciona para o painel principal
    setTimeout(() => {
      router.push("/")
    }, 1500)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8 sm:py-12">
      <div className="space-y-2 text-center">
        <div className="mb-2 inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Ativação da Inteligência Financeira (BYOK)
        </h1>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground sm:text-base">
          Para liberar o acesso ao dashboard, conecte sua chave gratuita do
          Google AI Studio. Suas análises serão processadas com privacidade
          usando sua própria cota.
        </p>
      </div>

      <Card className="border-border shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <KeyRound className="size-5" />
            <CardTitle>Cadastrar Chave do Google Gemini</CardTitle>
          </div>
          <CardDescription>
            A chave é armazenada de forma segura e utilizada exclusivamente para
            categorizar suas transações e gerar seus diagnósticos mensais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AiKeyForm onSuccess={handleSuccess} showHelpLink={true} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 text-xs text-muted-foreground sm:grid-cols-2">
        <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/40 p-3.5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
          <span>
            <strong>Privacidade por Design</strong>: Seus dados bancários e
            extratos nunca são utilizados para treinamento de modelos públicos.
          </span>
        </div>
        <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/40 p-3.5">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            <strong>Cota Gratuita do Gemini</strong>: O Google AI Studio oferece
            cota gratuita generosa para modelos como Gemini 1.5 e 2.0 Flash.
          </span>
        </div>
      </div>
    </div>
  )
}
