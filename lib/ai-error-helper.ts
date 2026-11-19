export type AiErrorCategory =
  | "auth"
  | "rate_limit"
  | "model_unavailable"
  | "network"
  | "unknown"

export interface ClassifiedAiError {
  category: AiErrorCategory
  title: string
  description: string
  actionType: "open_key_modal" | "retry"
}

export function classifyAiError(
  errorOrMessage: Error | string | null | undefined
): ClassifiedAiError {
  const raw =
    typeof errorOrMessage === "string"
      ? errorOrMessage
      : (errorOrMessage?.message ?? "")
  const msg = raw.toLowerCase()

  if (
    msg.includes("chave") ||
    msg.includes("api key") ||
    msg.includes("revogada") ||
    msg.includes("inválida") ||
    msg.includes("expirada") ||
    msg.includes("401") ||
    msg.includes("403")
  ) {
    return {
      category: "auth",
      title: "Chave de IA inválida ou expirada",
      description:
        raw ||
        "Sua chave da API Gemini parece inválida, expirada ou sem permissão. Atualize sua chave em Configurações → Segurança.",
      actionType: "open_key_modal",
    }
  }

  if (
    msg.includes("429") ||
    msg.includes("limite") ||
    msg.includes("cota") ||
    msg.includes("muitas requisições") ||
    msg.includes("quota")
  ) {
    return {
      category: "rate_limit",
      title: "Limite de uso da chave atingido",
      description:
        raw ||
        "Você atingiu o limite temporário de uso no Google AI Studio. Aguarde cerca de 1 minuto e tente novamente ou verifique sua cota.",
      actionType: "open_key_modal",
    }
  }

  if (
    msg.includes("modelo") ||
    msg.includes("incompatibilidade") ||
    msg.includes("não foi encontrado")
  ) {
    return {
      category: "model_unavailable",
      title: "Serviço de IA em manutenção",
      description:
        raw ||
        "O serviço de IA está temporariamente indisponível na plataforma. Tente novamente mais tarde; sua chave não precisa ser alterada.",
      actionType: "retry",
    }
  }

  if (
    msg.includes("503") ||
    msg.includes("alta demanda") ||
    msg.includes("sobrecarregado") ||
    msg.includes("conexão") ||
    msg.includes("network") ||
    msg.includes("timeout")
  ) {
    return {
      category: "network",
      title: "IA temporariamente indisponível",
      description:
        raw ||
        "Os servidores do Google Gemini estão com alta demanda ou instabilidade no momento. Aguarde alguns segundos e tente novamente.",
      actionType: "retry",
    }
  }

  return {
    category: "unknown",
    title: "Não foi possível concluir a análise",
    description:
      raw || "Tente atualizar o parecer ou aguarde alguns minutos.",
    actionType: "retry",
  }
}
