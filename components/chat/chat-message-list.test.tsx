import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ChatMessageList } from "./chat-message-list";
import { ChatMessage } from "@/src/types/api";

describe("components/chat/chat-message-list", () => {
  it("deve renderizar o emptyState quando a lista estiver vazia", () => {
    render(
      <ChatMessageList
        messages={[]}
        emptyState={<div data-testid="custom-empty">Sem mensagens ainda</div>}
      />
    );

    expect(screen.getByTestId("custom-empty")).toBeInTheDocument();
    expect(screen.getByText("Sem mensagens ainda")).toBeInTheDocument();
  });

  it("deve renderizar mensagens de usuário e modelo com seus respectivos papéis", () => {
    const messages: ChatMessage[] = [
      {
        id: "1",
        role: "user",
        content: "Como economizar R$ 200 este mês?",
        timestamp: "2026-10-19T14:30:00Z",
        status: "complete",
      },
      {
        id: "2",
        role: "model",
        content: "Para economizar **R$ 200**, avalie cortar despesas em **Lazer**.",
        timestamp: "2026-10-19T14:30:05Z",
        status: "complete",
      },
    ];

    render(<ChatMessageList messages={messages} />);

    expect(screen.getByText("Você")).toBeInTheDocument();
    expect(screen.getByText("Consultor Financeiro")).toBeInTheDocument();
    expect(screen.getByText("Como economizar R$ 200 este mês?")).toBeInTheDocument();
    expect(screen.getByText(/Para economizar/)).toBeInTheDocument();
  });

  it("deve exibir cursor pulsante quando a mensagem do modelo estiver em streaming", () => {
    const messages: ChatMessage[] = [
      {
        id: "1",
        role: "model",
        content: "Digitando resposta...",
        status: "streaming",
      },
    ];

    render(<ChatMessageList messages={messages} />);

    expect(screen.getByTestId("streaming-cursor")).toBeInTheDocument();
  });

  it("deve exibir badge de interrupção quando status for interrupted", () => {
    const messages: ChatMessage[] = [
      {
        id: "1",
        role: "model",
        content: "Resposta cortada pelo usuário",
        status: "interrupted",
      },
    ];

    render(<ChatMessageList messages={messages} />);

    expect(screen.getByTestId("message-interrupted-badge")).toBeInTheDocument();
    expect(screen.getByText("Geração interrompida")).toBeInTheDocument();
  });

  it("deve exibir caixa de erro com botão Tentar novamente e acionar callback onRetry", () => {
    const onRetry = vi.fn();
    const messages: ChatMessage[] = [
      {
        id: "1",
        role: "user",
        content: "Qual meu saldo?",
        status: "complete",
      },
      {
        id: "2",
        role: "model",
        content: "",
        status: "error",
        error: "Limite de cota excedido (429)",
      },
    ];

    render(<ChatMessageList messages={messages} onRetry={onRetry} />);

    expect(screen.getByTestId("message-error-box")).toBeInTheDocument();
    expect(screen.getByText("Limite de cota excedido (429)")).toBeInTheDocument();

    const retryBtn = screen.getByTestId("message-retry-button");
    fireEvent.click(retryBtn);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
