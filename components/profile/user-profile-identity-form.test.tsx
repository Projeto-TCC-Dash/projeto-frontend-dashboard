import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { UserProfileIdentityForm } from "./user-profile-identity-form";

describe("UserProfileIdentityForm Component", () => {
  const defaultProps = {
    initialName: "Débora Goulart",
    email: "debora@teste.com",
    avatarUrl: "https://storage.exemplo.com/avatar.png",
    onSubmit: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:preview-url"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("deve renderizar campos com os dados iniciais, avatar e email desabilitado", () => {
    render(<UserProfileIdentityForm {...defaultProps} />);

    const emailInput = screen.getByTestId("user-email-input");
    expect(emailInput).toHaveValue("debora@teste.com");
    expect(emailInput).toBeDisabled();

    const nameInput = screen.getByTestId("user-name-input");
    expect(nameInput).toHaveValue("Débora Goulart");

    const avatarImg = screen.getByTestId("avatar-image");
    expect(avatarImg.getAttribute("src")).toBe("https://storage.exemplo.com/avatar.png");

    // Botão de salvar deve estar desabilitado se não houver alteração
    expect(screen.getByTestId("save-identity-button")).toBeDisabled();
  });

  it("deve habilitar o botão de salvar quando o nome for alterado e chamar onSubmit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<UserProfileIdentityForm {...defaultProps} onSubmit={onSubmit} />);

    const nameInput = screen.getByTestId("user-name-input");
    fireEvent.change(nameInput, { target: { value: "Débora H. Goulart" } });

    const submitBtn = screen.getByTestId("save-identity-button");
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Débora H. Goulart",
        avatarFile: null,
        removeAvatar: false,
      });
      expect(screen.getByTestId("profile-identity-success")).toBeInTheDocument();
    });
  });

  it("deve atualizar preview local ao selecionar imagem e submeter de forma coordenada", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<UserProfileIdentityForm {...defaultProps} onSubmit={onSubmit} />);

    const fileInput = screen.getByTestId("avatar-file-input");
    const fakeFile = new File(["dummy"], "avatar.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [fakeFile] } });

    // Preview gerado sem chamar onSubmit imediatamente
    expect(URL.createObjectURL).toHaveBeenCalledWith(fakeFile);
    expect(screen.getByTestId("avatar-image").getAttribute("src")).toBe("blob:preview-url");
    expect(onSubmit).not.toHaveBeenCalled();

    // Botão de salvar habilitado
    const submitBtn = screen.getByTestId("save-identity-button");
    expect(submitBtn).toBeEnabled();

    // Altera o nome também para validar salvamento atômico
    const nameInput = screen.getByTestId("user-name-input");
    fireEvent.change(nameInput, { target: { value: "Débora Nova" } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Débora Nova",
        avatarFile: fakeFile,
        removeAvatar: false,
      });
      expect(screen.getByTestId("profile-identity-success")).toBeInTheDocument();
    });
  });

  it("deve marcar remoção de foto ao confirmar diálogo e enviar removeAvatar no submit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<UserProfileIdentityForm {...defaultProps} onSubmit={onSubmit} />);

    const removeBtn = screen.getByTestId("avatar-delete-button");
    fireEvent.click(removeBtn);

    // Diálogo de confirmação aberto
    const confirmDeleteBtn = screen.getByTestId("avatar-confirm-delete-button");
    fireEvent.click(confirmDeleteBtn);

    // Agora exibe fallback de iniciais
    expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("DG");

    // Botão habilitado para salvar
    const submitBtn = screen.getByTestId("save-identity-button");
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: undefined,
        avatarFile: null,
        removeAvatar: true,
      });
    });
  });

  it("deve validar tamanho máximo do arquivo de imagem", async () => {
    render(<UserProfileIdentityForm {...defaultProps} />);

    const fileInput = screen.getByTestId("avatar-file-input");
    const oversizedFile = new File(["a".repeat(100)], "big.png", { type: "image/png" });
    Object.defineProperty(oversizedFile, "size", { value: 6 * 1024 * 1024 });

    fireEvent.change(fileInput, { target: { files: [oversizedFile] } });

    expect(screen.getByTestId("profile-identity-error")).toHaveTextContent(
      "A imagem deve ter no máximo 5MB"
    );
  });

  it("deve validar tamanho mínimo do nome e exibir erro sem chamar onSubmit", async () => {
    const onSubmit = vi.fn();
    render(<UserProfileIdentityForm {...defaultProps} onSubmit={onSubmit} />);

    const nameInput = screen.getByTestId("user-name-input");
    fireEvent.change(nameInput, { target: { value: "A" } });

    const submitBtn = screen.getByTestId("save-identity-button");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId("profile-identity-error")).toHaveTextContent(
        "O nome deve ter no mínimo 2 caracteres"
      );
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("deve exibir erro quando onSubmit rejeitar com falha", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Erro de conexão com o servidor"));
    render(<UserProfileIdentityForm {...defaultProps} onSubmit={onSubmit} />);

    const nameInput = screen.getByTestId("user-name-input");
    fireEvent.change(nameInput, { target: { value: "Débora Alterada" } });

    fireEvent.click(screen.getByTestId("save-identity-button"));

    await waitFor(() => {
      expect(screen.getByTestId("profile-identity-error")).toHaveTextContent(
        "Erro de conexão com o servidor"
      );
    });
  });
});
