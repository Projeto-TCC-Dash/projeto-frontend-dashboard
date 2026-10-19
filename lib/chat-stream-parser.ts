import { ChatStreamChunk } from "@/src/types/api";

/**
 * Analisa um buffer de texto acumulado contendo dados no formato Server-Sent Events (SSE).
 * Extrai todos os blocos completos iniciados por 'data:' e retorna os chunks parseados
 * juntamente com o fragmento restante que ainda não foi delimitado por quebra de linha dupla.
 */
export function parseSseBuffer(buffer: string): {
  chunks: ChatStreamChunk[];
  remainingBuffer: string;
} {
  const chunks: ChatStreamChunk[] = [];
  
  // Normaliza quebras de linha para \n
  const normalizedBuffer = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  
  // No padrão SSE, eventos completos são delimitados por \n\n
  const blocks = normalizedBuffer.split("\n\n");
  
  // O último elemento pode ser um bloco incompleto
  const remainingBuffer = blocks.pop() ?? "";

  for (const block of blocks) {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) continue;

    // Linhas de comentário ou heartbeat SSE começam com ':'
    if (trimmedBlock.startsWith(":")) continue;

    const lines = trimmedBlock.split("\n");
    for (const line of lines) {
      if (line.startsWith("data:")) {
        const rawJson = line.slice(5).trim();
        if (!rawJson) continue;

        try {
          const parsed = JSON.parse(rawJson) as unknown;
          if (typeof parsed === "object" && parsed !== null) {
            chunks.push(parsed as ChatStreamChunk);
          }
        } catch {
          // Se for string pura não-JSON (fallback defensivo)
          chunks.push({ text: rawJson });
        }
      }
    }
  }

  return { chunks, remainingBuffer };
}

/**
 * Consome um ReadableStream nativo e emite assincronamente os ChatStreamChunks decodificados em UTF-8.
 */
export async function* parseChatStream(
  stream: ReadableStream<Uint8Array>,
  signal?: AbortSignal
): AsyncGenerator<ChatStreamChunk, void, unknown> {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) {
        break;
      }

      const { done, value } = await reader.read();

      if (done) {
        buffer += decoder.decode(); // Finaliza decodificação
        if (buffer.trim()) {
          const { chunks } = parseSseBuffer(buffer + "\n\n");
          for (const chunk of chunks) {
            yield chunk;
          }
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const { chunks, remainingBuffer } = parseSseBuffer(buffer);
      buffer = remainingBuffer;

      for (const chunk of chunks) {
        yield chunk;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
