"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateUserProfileSchema, validateAvatarFile } from "@/lib/validations/profile";
import { resolveAvatarUrl } from "@/lib/formatters";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  User as UserIcon,
  Camera,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserProfileIdentitySubmitPayload {
  name?: string;
  avatarFile?: File | null;
  removeAvatar?: boolean;
}

export interface UserProfileIdentityFormProps {
  initialName?: string;
  email: string;
  avatarUrl?: string | null;
  onSubmit: (payload: UserProfileIdentitySubmitPayload) => Promise<unknown>;
  isPending?: boolean;
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

export function UserProfileIdentityForm({
  initialName = "",
  email,
  avatarUrl,
  onSubmit,
  isPending = false,
  className,
}: UserProfileIdentityFormProps) {
  const [name, setName] = React.useState(initialName);
  const [pendingAvatarFile, setPendingAvatarFile] = React.useState<File | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = React.useState<string | null>(null);
  const [pendingAvatarRemove, setPendingAvatarRemove] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Sincroniza se initialName mudar externamente
  const [prevInitialName, setPrevInitialName] = React.useState(initialName);
  if (initialName !== prevInitialName) {
    setPrevInitialName(initialName);
    setName(initialName || "");
  }

  // Liberação segura de memória para o preview temporário de avatar
  React.useEffect(() => {
    return () => {
      if (pendingAvatarPreview) {
        URL.revokeObjectURL(pendingAvatarPreview);
      }
    };
  }, [pendingAvatarPreview]);

  const initials = getInitials(name || initialName, email);
  const [hasImageError, setHasImageError] = React.useState(false);

  const resolvedAvatarUrl = resolveAvatarUrl(avatarUrl);

  // Determina qual imagem renderizar (preview local > imagem original > fallback)
  let activeImage: string | null = null;
  if (!pendingAvatarRemove) {
    if (pendingAvatarPreview) {
      activeImage = pendingAvatarPreview;
    } else if (resolvedAvatarUrl) {
      activeImage = resolvedAvatarUrl;
    }
  }

  React.useEffect(() => {
    setHasImageError(false);
  }, [activeImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";
    setError(null);

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      setError(validation.error || "Arquivo de imagem inválido");
      return;
    }

    if (pendingAvatarPreview) {
      URL.revokeObjectURL(pendingAvatarPreview);
    }

    const objectUrl = URL.createObjectURL(file);
    setPendingAvatarPreview(objectUrl);
    setPendingAvatarFile(file);
    setPendingAvatarRemove(false);
  };

  const handleConfirmRemovePhoto = () => {
    if (pendingAvatarPreview) {
      URL.revokeObjectURL(pendingAvatarPreview);
      setPendingAvatarPreview(null);
    }
    setPendingAvatarFile(null);
    setPendingAvatarRemove(true);
    setDeleteDialogOpen(false);
  };

  const isNameDirty = name.trim() !== (initialName || "").trim();
  const isAvatarDirty = pendingAvatarFile !== null || pendingAvatarRemove;
  const isDirty = isNameDirty || isAvatarDirty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (isNameDirty) {
      const validation = updateUserProfileSchema.safeParse({ name });
      if (!validation.success) {
        setError(validation.error.issues[0]?.message || "Nome inválido");
        return;
      }
    }

    try {
      await onSubmit({
        name: isNameDirty ? name.trim() : undefined,
        avatarFile: pendingAvatarFile,
        removeAvatar: pendingAvatarRemove,
      });

      if (pendingAvatarPreview) {
        URL.revokeObjectURL(pendingAvatarPreview);
        setPendingAvatarPreview(null);
      }
      setPendingAvatarFile(null);
      setPendingAvatarRemove(false);

      setSuccessMessage("Perfil atualizado com sucesso!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar dados do perfil"
      );
    }
  };

  return (
    <Card className={cn("w-full shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UserIcon className="size-5 text-primary" />
          <span>Informações de Identidade</span>
        </CardTitle>
        <CardDescription>
          Gerencie sua foto de perfil e seus dados de exibição visíveis no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {successMessage && (
            <div
              data-testid="profile-identity-success"
              className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div
              data-testid="profile-identity-error"
              className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Seção Integrada de Foto de Perfil */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-border/60 bg-muted/20">
            <div className="relative group shrink-0">
              <div
                data-testid="avatar-container"
                className="relative size-20 sm:size-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center shadow-sm"
              >
                {activeImage && !hasImageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeImage}
                    alt={name ? `Foto de perfil de ${name}` : "Foto de perfil"}
                    data-testid="avatar-image"
                    className="size-full object-cover"
                    onError={() => setHasImageError(true)}
                  />
                ) : (
                  <div
                    data-testid="avatar-fallback"
                    className="size-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl sm:text-2xl select-none"
                  >
                    {initials}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                data-testid="avatar-quick-upload-button"
                aria-label="Alterar foto de perfil"
                className="absolute bottom-0 right-0 size-7 rounded-full bg-primary text-primary-foreground shadow flex items-center justify-center hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Camera className="size-3.5" />
              </button>
            </div>

            <div className="flex flex-col items-center sm:items-start space-y-2 text-center sm:text-left flex-1">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Foto de Perfil
                </h4>
                <p className="text-xs text-muted-foreground">
                  Formatos suportados: JPG, PNG ou WEBP (até 5MB).
                </p>
                {pendingAvatarFile && (
                  <p className="text-xs text-primary font-medium mt-1">
                    Nova foto selecionada (será salva ao clicar em Salvar Alterações).
                  </p>
                )}
                {pendingAvatarRemove && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    Foto marcada para exclusão (será removida ao salvar).
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-0.5">
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
                  disabled={isPending}
                  data-testid="avatar-upload-button"
                  className="gap-1.5 text-xs h-8"
                >
                  <Camera className="size-3.5" />
                  <span>{activeImage ? "Alterar foto" : "Escolher foto"}</span>
                </Button>

                {activeImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={isPending}
                    data-testid="avatar-delete-button"
                    className="gap-1.5 text-xs h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Remover</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Campos de Nome e E-mail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo E-mail (Somente leitura) */}
            <div className="space-y-1.5">
              <label
                htmlFor="user-email-field"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
              >
                <span>E-mail da Conta</span>
                <span title="Campo protegido">
                  <Lock className="size-3 text-muted-foreground" />
                </span>
              </label>
              <Input
                id="user-email-field"
                data-testid="user-email-input"
                type="email"
                value={email}
                disabled
                className="bg-muted/50 cursor-not-allowed text-muted-foreground text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                O e-mail é o identificador único da sua conta e não pode ser alterado diretamente.
              </p>
            </div>

            {/* Campo Nome de Exibição */}
            <div className="space-y-1.5">
              <label
                htmlFor="user-name-field"
                className="text-xs font-semibold text-foreground"
              >
                Nome de Exibição
              </label>
              <Input
                id="user-name-field"
                data-testid="user-name-input"
                type="text"
                placeholder="Ex: Maria da Silva"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isPending}
                className="text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Mínimo de 2 caracteres e máximo de 100 caracteres.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border/50">
            <Button
              type="submit"
              disabled={isPending || !isDirty}
              data-testid="save-identity-button"
              className="gap-2 text-xs"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              <span>Salvar Alterações</span>
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Diálogo de confirmação para remoção de foto */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent onClose={() => setDeleteDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Remover foto de perfil?</DialogTitle>
            <DialogDescription>
              A foto será desvinculada do seu perfil e o sistema passará a exibir as iniciais ({initials}). A remoção será efetivada ao clicar em &quot;Salvar Alterações&quot;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmRemovePhoto}
              data-testid="avatar-confirm-delete-button"
            >
              Sim, remover foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
