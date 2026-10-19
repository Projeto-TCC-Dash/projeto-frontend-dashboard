import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatDrawer } from "./chat-drawer";
import { ChatFloatingButton } from "./chat-floating-button";
import { ChatDrawerProvider, useChatDrawer } from "./chat-drawer-context";
const mockPush = vi.fn();
let mockPathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "u-1", email: "user@test.com", hasAiKey: true },
    token: "mock-token",
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-chat-stream", () => ({
  useChatStream: () => ({
    messages: [],
    isStreaming: false,
    sessionId: "mock-session",
    error: null,
    sendMessage: vi.fn(),
    stopStream: vi.fn(),
    clearChat: vi.fn(),
    retryLastMessage: vi.fn(),
  }),
}));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function DrawerTestWrapper({ initialOpen = false }: { initialOpen?: boolean }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ChatDrawerProvider>
        <OpenController initialOpen={initialOpen} />
        <ChatDrawer />
        <ChatFloatingButton />
      </ChatDrawerProvider>
    </QueryClientProvider>
  );
}

function OpenController({ initialOpen }: { initialOpen: boolean }) {
  const { openDrawer } = useChatDrawer();
  React.useEffect(() => {
    if (initialOpen) openDrawer();
  }, [initialOpen, openDrawer]);
  return null;
}

import * as React from "react";

describe("components/chat/chat-drawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/";
  });

  it("não deve renderizar o drawer quando fechado", () => {
    render(<DrawerTestWrapper initialOpen={false} />);
    expect(screen.queryByTestId("chat-drawer-overlay")).not.toBeInTheDocument();
  });

  it("deve renderizar o drawer e fechar ao clicar no botão de fechar", () => {
    render(<DrawerTestWrapper initialOpen={true} />);

    expect(screen.getByTestId("chat-drawer-overlay")).toBeInTheDocument();
    const closeBtn = screen.getByTestId("close-drawer-button");
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId("chat-drawer-overlay")).not.toBeInTheDocument();
  });

  it("deve fechar o drawer ao pressionar a tecla Escape", () => {
    render(<DrawerTestWrapper initialOpen={true} />);

    expect(screen.getByTestId("chat-drawer-overlay")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByTestId("chat-drawer-overlay")).not.toBeInTheDocument();
  });

  it("deve navegar para /chat ao clicar no botão de expandir para tela cheia", () => {
    render(<DrawerTestWrapper initialOpen={true} />);

    const expandBtn = screen.getByTestId("expand-to-fullscreen-button");
    fireEvent.click(expandBtn);

    expect(mockPush).toHaveBeenCalledWith("/chat");
    expect(screen.queryByTestId("chat-drawer-overlay")).not.toBeInTheDocument();
  });

  it("deve exibir o botão flutuante quando o drawer estiver fechado e fora da rota /chat", () => {
    render(<DrawerTestWrapper initialOpen={false} />);

    const floatingBtn = screen.getByTestId("chat-floating-button");
    expect(floatingBtn).toBeInTheDocument();

    fireEvent.click(floatingBtn);
    expect(screen.getByTestId("chat-drawer-overlay")).toBeInTheDocument();
  });

  it("não deve exibir o botão flutuante se a rota atual for /chat", () => {
    mockPathname = "/chat";

    render(<DrawerTestWrapper initialOpen={false} />);
    expect(screen.queryByTestId("chat-floating-button")).not.toBeInTheDocument();
  });
});
