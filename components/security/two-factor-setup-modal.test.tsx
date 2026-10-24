import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { TwoFactorSetupModal } from "./two-factor-setup-modal";

describe("TwoFactorSetupModal Component", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    userEmail: "debora@teste.com",
    onConfirm: vi.fn().mockResolvedValue(undefined),
    onResend: vi.fn().mockResolvedValue(undefined),
    initialCountdownSeconds: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar modal com e-mail do usuário e botão confirmar desabilitado inicialmente", () => {
    render(<TwoFactorSetupModal {...defaultProps} />);

    expect(screen.getByText("debora@teste.com")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-2fa-button")).toBeDisabled();
  });

  it("deve permitir apenas dígitos e limitar a 6 caracteres", () => {
    render(<TwoFactorSetupModal {...defaultProps} />);

    const input = screen.getByTestId("otp-code-input");
    fireEvent.change(input, { target: { value: "12ab34cd5678" } });

    expect(input).toHaveValue("123456");
    expect(screen.getByTestId("confirm-2fa-button")).toBeEnabled();
  });

  it("deve chamar onConfirm ao submeter código válido e fechar o modal", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();

    render(
      <TwoFactorSetupModal
        {...defaultProps}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    );

    const input = screen.getByTestId("otp-code-input");
    fireEvent.change(input, { target: { value: "654321" } });

    const submitBtn = screen.getByTestId("confirm-2fa-button");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith("654321");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("deve exibir mensagem de erro se a confirmação falhar", async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error("Código expirado ou inválido"));

    render(<TwoFactorSetupModal {...defaultProps} onConfirm={onConfirm} />);

    const input = screen.getByTestId("otp-code-input");
    fireEvent.change(input, { target: { value: "000000" } });

    fireEvent.click(screen.getByTestId("confirm-2fa-button"));

    await waitFor(() => {
      expect(screen.getByTestId("two-factor-modal-error")).toHaveTextContent(
        "Código expirado ou inválido"
      );
    });
  });

  it("deve exibir botão de reenvio quando o countdown chegar a zero", async () => {
    const onResend = vi.fn().mockResolvedValue(undefined);

    render(
      <TwoFactorSetupModal
        {...defaultProps}
        initialCountdownSeconds={0}
        onResend={onResend}
      />
    );

    const resendBtn = screen.getByTestId("resend-code-button");
    expect(resendBtn).toBeInTheDocument();

    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(onResend).toHaveBeenCalledTimes(1);
    });
  });
});
