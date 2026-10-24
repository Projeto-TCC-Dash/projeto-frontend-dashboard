import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { ConnectedAccountsSection } from "./connected-accounts-section";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("ConnectedAccountsSection Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  it("deve renderizar estado não conectado e permitir vincular", async () => {
    const onLink = vi.fn().mockResolvedValue(undefined);

    render(
      <ConnectedAccountsSection
        googleLinked={false}
        hasLocalPassword={true}
        onLink={onLink}
      />,
      { wrapper }
    );

    expect(screen.getByText("Não vinculado")).toBeInTheDocument();
    const linkBtn = screen.getByTestId("link-google-button");
    expect(linkBtn).toBeInTheDocument();

    fireEvent.click(linkBtn);

    await waitFor(() => {
      expect(onLink).toHaveBeenCalledTimes(1);
    });
  });

  it("deve renderizar estado conectado com email e data de vínculo", () => {
    render(
      <ConnectedAccountsSection
        googleLinked={true}
        googleEmail="debora.google@gmail.com"
        googleLinkedAt="2026-10-20T14:00:00Z"
        hasLocalPassword={true}
      />,
      { wrapper }
    );

    expect(screen.getByText("Conectado")).toBeInTheDocument();
    expect(screen.getByText(/debora.google@gmail.com/)).toBeInTheDocument();
    expect(screen.getByTestId("unlink-google-button")).toBeInTheDocument();
  });

  it("deve bloquear desvinculação se hasLocalPassword for false", async () => {
    const onUnlink = vi.fn();

    render(
      <ConnectedAccountsSection
        googleLinked={true}
        googleEmail="debora.google@gmail.com"
        hasLocalPassword={false}
        onUnlink={onUnlink}
      />,
      { wrapper }
    );

    const unlinkBtn = screen.getByTestId("unlink-google-button");
    fireEvent.click(unlinkBtn);

    // Diálogo de bloqueio deve estar aberto
    expect(screen.getByTestId("unlink-blocked-dialog")).toBeInTheDocument();
    expect(
      screen.getByText("Desvinculação Bloqueada")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/única forma de acesso/i)
    ).toBeInTheDocument();
    expect(onUnlink).not.toHaveBeenCalled();

    // Botão Compreendi fecha o diálogo
    fireEvent.click(screen.getByTestId("close-blocked-dialog-button"));
    await waitFor(() => {
      expect(screen.queryByTestId("unlink-blocked-dialog")).toBeNull();
    });
  });

  it("deve permitir desvinculação com confirmação se hasLocalPassword for true", async () => {
    const onUnlink = vi.fn().mockResolvedValue(undefined);

    render(
      <ConnectedAccountsSection
        googleLinked={true}
        googleEmail="debora.google@gmail.com"
        hasLocalPassword={true}
        onUnlink={onUnlink}
      />,
      { wrapper }
    );

    const unlinkBtn = screen.getByTestId("unlink-google-button");
    fireEvent.click(unlinkBtn);

    expect(screen.getByTestId("unlink-confirm-dialog")).toBeInTheDocument();
    expect(
      screen.getByText("Desvincular conta Google?")
    ).toBeInTheDocument();

    const confirmBtn = screen.getByTestId("confirm-unlink-button");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(onUnlink).toHaveBeenCalledTimes(1);
    });
  });

  it("deve exibir banner de erro se onLink rejeitar", async () => {
    const onLink = vi.fn().mockRejectedValue(new Error("Falha no OAuth Google"));

    render(
      <ConnectedAccountsSection
        googleLinked={false}
        hasLocalPassword={true}
        onLink={onLink}
      />,
      { wrapper }
    );

    fireEvent.click(screen.getByTestId("link-google-button"));

    await waitFor(() => {
      expect(screen.getByTestId("google-auth-error")).toHaveTextContent(
        "Falha no OAuth Google"
      );
    });
  });
});
