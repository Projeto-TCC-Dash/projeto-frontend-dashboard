import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import {
  UserAvatarUploader,
  getInitials,
} from "./user-avatar-uploader";

describe("getInitials helper", () => {
  it("deve retornar iniciais de nome completo", () => {
    expect(getInitials("Débora Goulart")).toBe("DG");
    expect(getInitials("Maria Santos Silva")).toBe("MS");
  });

  it("deve retornar primeiros 2 caracteres de nome único", () => {
    expect(getInitials("Carlos")).toBe("CA");
  });

  it("deve retornar primeiros caracteres do email caso não haja nome", () => {
    expect(getInitials(undefined, "debora@email.com")).toBe("DE");
  });

  it("deve retornar 'U' como fallback geral", () => {
    expect(getInitials(undefined, undefined)).toBe("U");
  });
});

describe("UserAvatarUploader Component", () => {
  const defaultProps = {
    avatarUrl: null,
    name: "Débora Goulart",
    email: "debora@teste.com",
    onUpload: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-avatar");
    window.URL.revokeObjectURL = vi.fn();
  });

  it("deve renderizar fallback com iniciais quando avatarUrl for nulo", () => {
    render(<UserAvatarUploader {...defaultProps} />);

    expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("DG");
    expect(screen.queryByTestId("avatar-image")).toBeNull();
    // Botão de remover não deve aparecer sem foto existente
    expect(screen.queryByTestId("avatar-delete-button")).toBeNull();
  });

  it("deve renderizar imagem e botão de remoção quando avatarUrl estiver preenchido", () => {
    render(
      <UserAvatarUploader
        {...defaultProps}
        avatarUrl="https://storage.exemplo.com/avatar.webp"
      />
    );

    const image = screen.getByTestId("avatar-image");
    expect(image).toHaveAttribute("src", "https://storage.exemplo.com/avatar.webp");
    expect(screen.getByTestId("avatar-delete-button")).toBeInTheDocument();
  });

  it("deve chamar onUpload ao selecionar arquivo válido de imagem", async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined);
    render(<UserAvatarUploader {...defaultProps} onUpload={onUpload} />);

    const input = screen.getByTestId("avatar-file-input");
    const file = new File(["valid image"], "photo.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith(file);
    });
  });

  it("deve exibir mensagem de erro e não chamar onUpload ao selecionar arquivo inválido (> 5MB)", async () => {
    const onUpload = vi.fn();
    render(<UserAvatarUploader {...defaultProps} onUpload={onUpload} />);

    const input = screen.getByTestId("avatar-file-input");
    const largeFile = new File([new Uint8Array(6 * 1024 * 1024)], "huge.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByTestId("avatar-error-message")).toHaveTextContent(
        "A imagem deve ter no máximo 5MB"
      );
    });
    expect(onUpload).not.toHaveBeenCalled();
  });

  it("deve abrir diálogo de confirmação e chamar onDelete ao confirmar", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <UserAvatarUploader
        {...defaultProps}
        avatarUrl="https://storage.exemplo.com/avatar.webp"
        onDelete={onDelete}
      />
    );

    // Clica no botão de remover para abrir diálogo
    const removeBtn = screen.getByTestId("avatar-delete-button");
    fireEvent.click(removeBtn);

    expect(
      screen.getByText("Remover foto de perfil?")
    ).toBeInTheDocument();

    // Clica em confirmar no modal
    const confirmBtn = screen.getByTestId("avatar-confirm-delete-button");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  it("deve exibir overlay de loading quando isUploading ou isDeleting for true", () => {
    const { rerender } = render(
      <UserAvatarUploader {...defaultProps} isUploading={true} />
    );
    expect(screen.getByTestId("avatar-loading-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("avatar-upload-button")).toBeDisabled();

    rerender(<UserAvatarUploader {...defaultProps} isDeleting={true} />);
    expect(screen.getByTestId("avatar-loading-overlay")).toBeInTheDocument();
  });
});
