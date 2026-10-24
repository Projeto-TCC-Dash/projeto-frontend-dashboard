"use client";

import * as React from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { validateAvatarFile } from "@/lib/validations/profile";
import { resolveAvatarUrl } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export interface UserAvatarUploaderProps {
  avatarUrl?: string | null;
  name?: string;
  email?: string;
  onUpload: (file: File) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  isUploading?: boolean;
  isDeleting?: boolean;
  className?: string;
}

export function getInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    return email.trim().slice(0, 2).toUpperCase();
  }
  return "U";
}

export function UserAvatarUploader({
  avatarUrl,
  name,
  email,
  onUpload,
  onDelete,
  isUploading = false,
  isDeleting = false,
  className,
}: UserAvatarUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // Limpa object URL do preview no desmontar ou quando o preview mudar
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const initials = getInitials(name, email);
  const resolvedAvatarUrl = resolveAvatarUrl(avatarUrl);
  const currentImage = previewUrl || resolvedAvatarUrl;
  const [imageError, setImageError] = React.useState(false);
  const [prevImage, setPrevImage] = React.useState<string | null>(currentImage);

  if (prevImage !== currentImage) {
    setPrevImage(currentImage);
    setImageError(false);
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value to allow selecting same file again if desired
    e.target.value = "";
    setErrorMessage(null);

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Arquivo de imagem inválido");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      await onUpload(file);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Falha ao enviar foto de perfil"
      );
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
    }
  };

  const handleConfirmDelete = async () => {
    setErrorMessage(null);
    try {
      await onDelete();
      setDeleteDialogOpen(false);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Falha ao remover foto de perfil"
      );
    }
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-6", className)}>
      <div className="relative group">
        <div
          data-testid="avatar-container"
          className="relative size-24 sm:size-28 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center shadow-sm"
        >
          {currentImage && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentImage}
              alt={name ? `Foto de perfil de ${name}` : "Foto de perfil"}
              data-testid="avatar-image"
              className="size-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              data-testid="avatar-fallback"
              className="size-full flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl sm:text-3xl select-none"
            >
              {initials}
            </div>
          )}

          {(isUploading || isDeleting) && (
            <div
              data-testid="avatar-loading-overlay"
              className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex items-center justify-center"
            >
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Botão de upload rápido sobre a foto */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isDeleting}
          data-testid="avatar-quick-upload-button"
          aria-label="Alterar foto de perfil"
          className="absolute bottom-0 right-0 size-8 rounded-full bg-primary text-primary-foreground shadow flex items-center justify-center hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Camera className="size-4" />
        </button>
      </div>

      <div className="flex flex-col items-center sm:items-start space-y-2 text-center sm:text-left">
        <div className="space-y-0.5">
          <h3 className="text-base font-semibold text-foreground">
            Foto de Perfil
          </h3>
          <p className="text-xs text-muted-foreground">
            Formatos suportados: JPG, PNG ou WEBP. Tamanho máximo de 5MB.
          </p>
        </div>

        {errorMessage && (
          <p
            data-testid="avatar-error-message"
            className="text-xs text-destructive font-medium"
          >
            {errorMessage}
          </p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            data-testid="avatar-file-input"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting}
            data-testid="avatar-upload-button"
            className="gap-1.5 text-xs"
          >
            {isUploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Camera className="size-3.5" />
            )}
            <span>Carregar nova foto</span>
          </Button>

          {currentImage && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isUploading || isDeleting}
              data-testid="avatar-delete-button"
              className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {isDeleting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              <span>Remover</span>
            </Button>
          )}
        </div>
      </div>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent onClose={() => setDeleteDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Remover foto de perfil?</DialogTitle>
            <DialogDescription>
              Sua foto será excluída e o sistema voltará a exibir as iniciais do
              seu nome ({initials}). Essa ação pode ser revertida fazendo upload de uma nova foto a qualquer momento.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              data-testid="avatar-confirm-delete-button"
              className="gap-2"
            >
              {isDeleting && <Loader2 className="size-4 animate-spin" />}
              <span>Sim, remover foto</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
