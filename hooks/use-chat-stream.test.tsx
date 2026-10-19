import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useChatStream } from "./use-chat-stream";

describe("hooks/use-chat-stream", () => {
  const encoder = new TextEncoder();

  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deve inicializar com mensagens vazias, não transmitindo e com sessionId gerado", () => {
    const { result } = renderHook(() => useChatStream());

    expect(result.current.messages).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.sessionId).toBe("string");
    expect(result.current.sessionId.length).toBeGreaterThan(0);
  });

  it("deve enviar mensagem e acumular resposta do streaming com status complete", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"text": "Olá "}\n\n'));
        controller.enqueue(encoder.encode('data: {"text": "usuário!"}\n\n'));
        controller.enqueue(encoder.encode('data: {"done": true}\n\n'));
        controller.close();
      },
    });

    const mockResponse = new Response(stream, {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage("Minha dúvida financeira");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject({
      role: "user",
      content: "Minha dúvida financeira",
      status: "complete",
    });
    expect(result.current.messages[1]).toMatchObject({
      role: "model",
      content: "Olá usuário!",
      status: "complete",
    });
    expect(result.current.isStreaming).toBe(false);
  });

  it("deve permitir interromper a resposta via stopStream marcando status como interrupted", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"text": "Texto parcial "}\n\n'));
      },
    });

    const mockResponse = new Response(stream, {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChatStream());

    act(() => {
      void result.current.sendMessage("Pergunta longa");
    });

    // Simula a chegada do primeiro fragmento
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    // Usuário clica em parar
    act(() => {
      result.current.stopStream();
    });

    expect(result.current.isStreaming).toBe(false);
    const lastMsg = result.current.messages[result.current.messages.length - 1];
    expect(lastMsg.role).toBe("model");
    expect(lastMsg.status).toBe("interrupted");
    expect(lastMsg.content).toBe("Texto parcial ");
  });

  it("deve tratar erro 429 de limite de taxa com status error e mensagem amigável", async () => {
    const mockResponse = new Response(
      JSON.stringify({ message: "Rate limit exceeded" }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );

    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage("Pergunta rápida");
    });

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toContain("Limite de requisições excedido");
    const lastMsg = result.current.messages[result.current.messages.length - 1];
    expect(lastMsg.status).toBe("error");
    expect(lastMsg.error).toContain("Limite de requisições excedido");
  });

  it("deve tratar erro 403 de chave de IA ausente (BYOK)", async () => {
    const mockResponse = new Response(
      JSON.stringify({ message: "API key missing" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );

    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage("Pergunta sem chave");
    });

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toContain("BYOK");
    const lastMsg = result.current.messages[result.current.messages.length - 1];
    expect(lastMsg.status).toBe("error");
  });

  it("deve limpar o histórico e resetar sessionId via clearChat", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"text": "Resposta", "done": true}\n\n'));
        controller.close();
      },
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(stream));

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage("Teste");
    });

    expect(result.current.messages.length).toBe(2);
    const initialSessionId = result.current.sessionId;

    act(() => {
      result.current.clearChat();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.sessionId).not.toBe(initialSessionId);
    const stored = JSON.parse(window.sessionStorage.getItem("@finai:chat_session")!);
    expect(stored.messages).toEqual([]);
    expect(stored.sessionId).toBe(result.current.sessionId);
  });
});
