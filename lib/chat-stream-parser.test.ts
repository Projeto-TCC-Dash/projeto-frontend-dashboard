import { describe, it, expect } from "vitest";
import { parseSseBuffer, parseChatStream } from "./chat-stream-parser";

describe("lib/chat-stream-parser - parseSseBuffer", () => {
  it("deve extrair chunks individuais de um buffer SSE completo", () => {
    const input = 'data: {"text": "Olá", "done": false}\n\n';
    const { chunks, remainingBuffer } = parseSseBuffer(input);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual({ text: "Olá", done: false });
    expect(remainingBuffer).toBe("");
  });

  it("deve processar múltiplos eventos SSE no mesmo buffer", () => {
    const input =
      'data: {"text": "Economizar "}\n\ndata: {"text": "é importante."}\n\ndata: {"done": true, "sessionId": "sess-1"}\n\n';
    const { chunks, remainingBuffer } = parseSseBuffer(input);

    expect(chunks).toHaveLength(3);
    expect(chunks[0].text).toBe("Economizar ");
    expect(chunks[1].text).toBe("é importante.");
    expect(chunks[2].done).toBe(true);
    expect(chunks[2].sessionId).toBe("sess-1");
    expect(remainingBuffer).toBe("");
  });

  it("deve reter buffers incompletos para o próximo pacote de rede", () => {
    const part1 = 'data: {"text": "Parte 1"}\n\ndata: {"text": "Par';
    const result1 = parseSseBuffer(part1);

    expect(result1.chunks).toHaveLength(1);
    expect(result1.chunks[0].text).toBe("Parte 1");
    expect(result1.remainingBuffer).toBe('data: {"text": "Par');

    // Concatena a continuação do pacote
    const part2 = result1.remainingBuffer + 'te 2"}\n\n';
    const result2 = parseSseBuffer(part2);

    expect(result2.chunks).toHaveLength(1);
    expect(result2.chunks[0].text).toBe("Parte 2");
    expect(result2.remainingBuffer).toBe("");
  });

  it("deve ignorar comentários SSE e linhas em branco", () => {
    const input = ': keep-alive ping\n\n\n\ndata: {"text": "Conteúdo válido"}\n\n';
    const { chunks } = parseSseBuffer(input);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].text).toBe("Conteúdo válido");
  });

  it("deve capturar payloads de erro canônicos (429 / 503)", () => {
    const input =
      'data: {"error": "Limite de taxa excedido", "code": "RATE_LIMIT_EXCEEDED", "statusCode": 429}\n\n';
    const { chunks } = parseSseBuffer(input);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].error).toBe("Limite de taxa excedido");
    expect(chunks[0].code).toBe("RATE_LIMIT_EXCEEDED");
    expect(chunks[0].statusCode).toBe(429);
  });

  it("deve prover fallback se a linha de dados for texto plano", () => {
    const input = "data: Olá mundo sem formatação JSON\n\n";
    const { chunks } = parseSseBuffer(input);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].text).toBe("Olá mundo sem formatação JSON");
  });
});

describe("lib/chat-stream-parser - parseChatStream (AsyncGenerator)", () => {
  it("deve consumir um ReadableStream e emitir todos os chunks sequencialmente", async () => {
    const encoder = new TextEncoder();
    const chunksToSend = [
      encoder.encode('data: {"text": "Olá "}\n\n'),
      encoder.encode('data: {"text": "mundo!"}\n\n'),
      encoder.encode('data: {"done": true}\n\n'),
    ];

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunksToSend) {
          controller.enqueue(chunk);
        }
        controller.close();
      },
    });

    const emitted: string[] = [];
    let isDone = false;

    for await (const chunk of parseChatStream(stream)) {
      if (chunk.text) emitted.push(chunk.text);
      if (chunk.done) isDone = true;
    }

    expect(emitted).toEqual(["Olá ", "mundo!"]);
    expect(isDone).toBe(true);
  });

  it("deve respeitar a interrupção via AbortSignal", async () => {
    const encoder = new TextEncoder();
    const abortController = new AbortController();

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"text": "Token 1"}\n\n'));
        controller.enqueue(encoder.encode('data: {"text": "Token 2"}\n\n'));
        controller.close();
      },
    });

    const received: string[] = [];

    for await (const chunk of parseChatStream(stream, abortController.signal)) {
      if (chunk.text) {
        received.push(chunk.text);
        abortController.abort(); // Interrompe após o primeiro
      }
    }

    expect(received).toEqual(["Token 1"]);
  });
});
