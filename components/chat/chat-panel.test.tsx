import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatPanel } from "./chat-panel";
import * as authHook from "@/hooks/use-auth";
import * as chatHook from "@/hooks/use-chat-stream";

vi.mock("@/hooks/use-auth");
vi.mock("@/hooks/use-chat-stream");

describe("components/chat/chat-panel", () => {
  const mockSendMessage = vi.fn();
  const mockStopStream = vi.fn();
  const mockClearChat = vi.fn();
  const mockRetryLastMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(authHook, "useAuth").mockReturnValue({
      user: { id: "u-1", email: "user@test.com", hasAiKey: true },
      token: "mock-token",
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      updateUser: vi.fn(),
      logout: vi.fn(),
    });

    vi.spyOn(chatHook, "useChatStream").mockReturnValue({
      messages: [],
      isStreaming: false,
      sessionId: "session-123",
      error: null,
      sendMessage: mockSendMessage,
      stopStream: mockStopStream,
      clearChat: mockClearChat,
      retryLastMessage: mockRetryLastMessage,
    });
  });

  it("deve renderizar o cabeçalho e estado vazio quando não houver mensagens", () => {
    render(
      <ChatPanel
        emptyState={<div data-testid="empty-chips">Sugestões aqui</div>}
      />
    );

    expect(screen.getByText("Consultor Financeiro IA")).toBeInTheDocument();
    expect(screen.getByTestId("empty-chips")).toBeInTheDocument();
  });

  it("deve exibir banner explicativo BYOK quando hasAiKey for false", () => {
    vi.spyOn(authHook, "useAuth").mockReturnValue({
      user: { id: "u-1", email: "user@test.com", hasAiKey: false },
      token: "mock-token",
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      updateUser: vi.fn(),
      logout: vi.fn(),
    });

    render(<ChatPanel />);

    expect(screen.getByTestId("byok-missing-banner")).toBeInTheDocument();
    expect(
      screen.getByText(/Chave do Google AI Studio Necessária/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("configure-ai-key-button")).toBeInTheDocument();
  });

  it("deve exibir botão Nova consulta quando houver mensagens e acionar clearChat", () => {
    vi.spyOn(chatHook, "useChatStream").mockReturnValue({
      messages: [
        {
          id: "1",
          role: "user",
          content: "Pergunta 1",
          status: "complete",
        },
      ],
      isStreaming: false,
      sessionId: "session-123",
      error: null,
      sendMessage: mockSendMessage,
      stopStream: mockStopStream,
      clearChat: mockClearChat,
      retryLastMessage: mockRetryLastMessage,
    });

    render(<ChatPanel />);

    const clearButton = screen.getByTestId("clear-chat-button");
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(mockClearChat).toHaveBeenCalledTimes(1);
  });
});
