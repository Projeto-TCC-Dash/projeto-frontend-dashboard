"use client";

import * as React from "react";
import { useAiKey } from "@/hooks/use-ai-key";
import { aiKeySchema, type AiKeyFormData } from "@/lib/validations/ai-key";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface AiKeyFormProps {
  onSuccess?: (status?: "ACTIVE_VERIFIED" | "ACTIVE_PROVISIONAL_DEMAND") => void;
  showHelpLink?: boolean;
}

export function AiKeyForm({ onSuccess, showHelpLink = true }: AiKeyFormProps) {
  const { saveAndTestKey, isPending } = useAiKey();

  const [apiKey, setApiKey] = React.useState("");
  const [showKey, setShowKey] = React.useState(false);
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [resultMessage, setResultMessage] = React.useState<{
    type: "success" | "warning" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldError(null);
    setResultMessage(null);

    const validation = aiKeySchema.safeParse({ apiKey });
    if (!validation.success) {
      setFieldError(validation.error.issues[0]?.message || "Chave de API inválida");
      return;
    }

    try {
      const response = await saveAndTestKey({ apiKey: validation.data.apiKey });

      if (response.status === "ACTIVE_PROVISIONAL_DEMAND") {
        setResultMessage({
          type: "warning",
          text: "Chave registrada com sucesso! Nota: Os servidores do Google AI Studio estão operando sob alta demanda temporária. A conexão está ativa, mas pode haver lentidão momentânea.",
        });
        if (onSuccess) {
          onSuccess("ACTIVE_PROVISIONAL_DEMAND");
        }
      } else {
        setResultMessage({
          type: "success",
          text: "Conexão verificada com sucesso! Sua chave pessoal do Google Gemini está ativa e operacional.",
        });
        if (onSuccess) {
          onSuccess("ACTIVE_VERIFIED");
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao validar chave. Verifique se a chave é válida e possui permissões ativas no Google AI Studio.";
      setResultMessage({
        type: "error",
        text: message,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {resultMessage && (
        <div
          role="alert"
          className={`flex items-start gap-2.5 p-3.5 text-sm rounded-lg border ${
            resultMessage.type === "success"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              : resultMessage.type === "warning"
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {resultMessage.type === "success" && (
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
          )}
          {resultMessage.type === "warning" && (
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          )}
          {resultMessage.type === "error" && (
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{resultMessage.text}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="apiKey"
          className="text-sm font-medium text-foreground flex items-center justify-between"
        >
          <span>Chave de API do Google AI Studio</span>
          {showHelpLink && (
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-normal"
            >
              Obter chave gratuita no Google
              <ExternalLink className="size-3" />
            </a>
          )}
        </label>

        <div className="relative">
          <Input
            id="apiKey"
            name="apiKey"
            type={showKey ? "text" : "password"}
            placeholder="AIzaSy..."
            autoComplete="off"
            spellCheck={false}
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              if (fieldError) setFieldError(null);
            }}
            disabled={isPending}
            className="pr-10 font-mono text-xs sm:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showKey ? "Ocultar chave" : "Exibir chave"}
          >
            {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || apiKey.trim().length === 0}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Testando Conexão Ativa com Gemini...
          </>
        ) : (
          "Salvar e Testar Conexão"
        )}
      </Button>
    </form>
  );
}
