"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChatMessage, ChatMessageStatus } from "@/src/types/api";
import { getStoredToken } from "@/lib/api-client";
import { parseChatStream } from "@/lib/chat-stream-parser";

const CHAT_STORAGE_KEY = "@finai:chat_session";

interface StoredChatSession {
  sessionId: string;
  messages: ChatMessage[];
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function loadInitialSession(): { sessionId: string; messages: ChatMessage[] } {
  if (typeof window === "undefined") {
    return { sessionId: generateId(), messages: [] };
  }

  try {
    const stored = window.sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StoredChatSession;
      if (parsed && typeof parsed.sessionId === "string" && Array.isArray(parsed.messages)) {
        return {
          sessionId: parsed.sessionId,
          messages: parsed.messages,
        };
      }
    }
  } catch {
    // Falha silenciosa em caso de armazenamento inacessível
  }

  const newSessionId = generateId();
  return { sessionId: newSessionId, messages: [] };
}

export interface UseChatStreamReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  sessionId: string;
  error: string | null;
  sendMessage: (prompt: string) => Promise<void>;
  stopStream: () => void;
  clearChat: () => void;
  retryLastMessage: () => Promise<void>;
}

export function useChatStream(): UseChatStreamReturn {
  const [session, setSession] = useState<{ sessionId: string; messages: ChatMessage[] }>(
    loadInitialSession
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sincroniza estado com o sessionStorage a cada alteração
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify({
          sessionId: session.sessionId,
          messages: session.messages,
        })
      );
    } catch {
      // Ignora erros de cota do sessionStorage
    }
  }, [session]);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    // Marca a última mensagem do assistente como 'interrupted' caso estivesse em streaming
    setSession((prev) => {
      const lastMsg = prev.messages[prev.messages.length - 1];
      if (lastMsg && lastMsg.role === "model" && lastMsg.status === "streaming") {
        const updated = [...prev.messages];
        updated[updated.length - 1] = {
          ...lastMsg,
          status: "interrupted" as ChatMessageStatus,
        };
        return { ...prev, messages: updated };
      }
      return prev;
    });
  }, []);

  const clearChat = useCallback(() => {
    stopStream();
    const newSessionId = generateId();
    setSession({ sessionId: newSessionId, messages: [] });
    setError(null);
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(CHAT_STORAGE_KEY);
      } catch {
        // Ignora
      }
    }
  }, [stopStream]);

  const sendMessage = useCallback(
    async (prompt: string) => {
      const cleanPrompt = prompt.trim();
      if (!cleanPrompt || isStreaming) return;

      setError(null);

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: cleanPrompt,
        timestamp: new Date().toISOString(),
        status: "complete",
      };

      const assistantMsgId = generateId();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "model",
        content: "",
        timestamp: new Date().toISOString(),
        status: "streaming",
      };

      // Adiciona mensagem do usuário e placeholder da resposta
      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, userMsg, assistantMsg],
      }));

      setIsStreaming(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const token = getStoredToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const response = await fetch(`${baseUrl}/api/chat/stream`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: cleanPrompt,
            sessionId: session.sessionId,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          let errorMsg = `Erro na comunicação com o assistente (${response.status})`;

          if (response.status === 401) {
            errorMsg = "Sessão expirada. Faça login novamente para continuar.";
          } else if (response.status === 403) {
            errorMsg = "Chave de inteligência artificial (BYOK) não configurada.";
          } else if (response.status === 429) {
            errorMsg = "Limite de requisições excedido. Aguarde alguns instantes antes de enviar nova pergunta.";
          } else if (response.status === 503) {
            errorMsg = "O serviço de IA está com alta demanda momentânea no Google AI Studio. Tente novamente.";
          } else {
            try {
              const errorData = await response.json();
              if (errorData?.message) errorMsg = errorData.message;
            } catch {
              // Mantém mensagem padrão
            }
          }

          setError(errorMsg);

          setSession((prev) => {
            const updated = [...prev.messages];
            const idx = updated.findIndex((m) => m.id === assistantMsgId);
            if (idx !== -1) {
              updated[idx] = {
                ...updated[idx],
                status: "error",
                error: errorMsg,
              };
            }
            return { ...prev, messages: updated };
          });

          return;
        }

        if (!response.body) {
          throw new Error("Resposta sem corpo de transmissão.");
        }

        for await (const chunk of parseChatStream(response.body, controller.signal)) {
          if (chunk.error) {
            setError(chunk.error);
            setSession((prev) => {
              const updated = [...prev.messages];
              const idx = updated.findIndex((m) => m.id === assistantMsgId);
              if (idx !== -1) {
                updated[idx] = {
                  ...updated[idx],
                  status: "error",
                  error: chunk.error,
                };
              }
              return { ...prev, messages: updated };
            });
            break;
          }

          if (chunk.sessionId && chunk.sessionId !== session.sessionId) {
            setSession((prev) => ({ ...prev, sessionId: chunk.sessionId! }));
          }

          if (chunk.text) {
            setSession((prev) => {
              const updated = [...prev.messages];
              const idx = updated.findIndex((m) => m.id === assistantMsgId);
              if (idx !== -1) {
                updated[idx] = {
                  ...updated[idx],
                  content: updated[idx].content + chunk.text,
                };
              }
              return { ...prev, messages: updated };
            });
          }

          if (chunk.done) {
            setSession((prev) => {
              const updated = [...prev.messages];
              const idx = updated.findIndex((m) => m.id === assistantMsgId);
              if (idx !== -1) {
                updated[idx] = {
                  ...updated[idx],
                  status: "complete",
                };
              }
              return { ...prev, messages: updated };
            });
          }
        }

        // Finalização caso done não tenha sido recebido explicitamente
        setSession((prev) => {
          const updated = [...prev.messages];
          const idx = updated.findIndex((m) => m.id === assistantMsgId);
          if (idx !== -1 && updated[idx].status === "streaming") {
            updated[idx] = {
              ...updated[idx],
              status: "complete",
            };
          }
          return { ...prev, messages: updated };
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // Interrupção manual do usuário
          setSession((prev) => {
            const updated = [...prev.messages];
            const idx = updated.findIndex((m) => m.id === assistantMsgId);
            if (idx !== -1) {
              updated[idx] = {
                ...updated[idx],
                status: "interrupted",
              };
            }
            return { ...prev, messages: updated };
          });
        } else {
          const failureMessage =
            err instanceof Error ? err.message : "Falha na conexão com o assistente financeiro.";
          setError(failureMessage);
          setSession((prev) => {
            const updated = [...prev.messages];
            const idx = updated.findIndex((m) => m.id === assistantMsgId);
            if (idx !== -1) {
              updated[idx] = {
                ...updated[idx],
                status: "error",
                error: failureMessage,
              };
            }
            return { ...prev, messages: updated };
          });
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [isStreaming, session.sessionId]
  );

  const retryLastMessage = useCallback(async () => {
    // Localiza a última mensagem do usuário
    const lastUserMsg = [...session.messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      // Remove a última mensagem com erro do assistente, se houver
      setSession((prev) => {
        const lastMsg = prev.messages[prev.messages.length - 1];
        if (lastMsg && lastMsg.role === "model" && lastMsg.status === "error") {
          return { ...prev, messages: prev.messages.slice(0, -1) };
        }
        return prev;
      });
      await sendMessage(lastUserMsg.content);
    }
  }, [sendMessage, session.messages]);

  return {
    messages: session.messages,
    isStreaming,
    sessionId: session.sessionId,
    error,
    sendMessage,
    stopStream,
    clearChat,
    retryLastMessage,
  };
}
