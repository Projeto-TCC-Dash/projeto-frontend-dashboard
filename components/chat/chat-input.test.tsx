import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ChatInput } from "./chat-input";

describe("components/chat/chat-input", () => {
  it("deve renderizar com campo de texto e botão de envio desabilitado inicialmente", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const textarea = screen.getByTestId("chat-textarea");
    const sendButton = screen.getByTestId("chat-send-button");

    expect(textarea).toBeInTheDocument();
    expect(sendButton).toBeDisabled();
  });

  it("deve habilitar o botão de envio quando o usuário digita e disparar onSend ao clicar", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const textarea = screen.getByTestId("chat-textarea");
    const sendButton = screen.getByTestId("chat-send-button");

    fireEvent.change(textarea, { target: { value: "Como investir meu saldo?" } });
    expect(sendButton).not.toBeDisabled();

    fireEvent.click(sendButton);
    expect(onSend).toHaveBeenCalledWith("Como investir meu saldo?");
    expect((textarea as HTMLTextAreaElement).value).toBe("");
  });

  it("deve disparar onSend ao pressionar a tecla Enter sem Shift", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const textarea = screen.getByTestId("chat-textarea");
    fireEvent.change(textarea, { target: { value: "Pergunta via Enter" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(onSend).toHaveBeenCalledWith("Pergunta via Enter");
  });

  it("não deve disparar onSend ao pressionar Shift + Enter", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const textarea = screen.getByTestId("chat-textarea");
    fireEvent.change(textarea, { target: { value: "Linha 1" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    expect(onSend).not.toHaveBeenCalled();
  });

  it("deve exibir botão Parar resposta durante streaming ativo e acionar onStop", () => {
    const onSend = vi.fn();
    const onStop = vi.fn();

    render(<ChatInput onSend={onSend} onStop={onStop} isStreaming={true} />);

    expect(screen.queryByTestId("chat-send-button")).not.toBeInTheDocument();
    const stopButton = screen.getByTestId("chat-stop-button");
    expect(stopButton).toBeInTheDocument();

    fireEvent.click(stopButton);
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
