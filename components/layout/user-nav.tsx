"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { resolveAvatarUrl } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

function getInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (email && email.trim()) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
}

export function UserNav() {
  const { user, logout } = useAuth();
  const { data: userProfile } = useUserProfile();
  const [imageError, setImageError] = React.useState(false);
  const [prevAvatarUrl, setPrevAvatarUrl] = React.useState<string | null>(null);

  const displayName = userProfile?.name || user?.email;
  const avatarUrl = resolveAvatarUrl(userProfile?.avatarUrl);
  const initials = getInitials(userProfile?.name, user?.email);

  if (prevAvatarUrl !== avatarUrl) {
    setPrevAvatarUrl(avatarUrl);
    setImageError(false);
  }

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/settings/profile"
        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Configurações da Conta e Perfil"
      >
        {avatarUrl && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={`Foto de perfil de ${displayName}`}
            className="size-6 rounded-full object-cover border border-border"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="size-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
            {initials}
          </div>
        )}

        <div className="flex flex-col text-left max-w-[140px] sm:max-w-[180px]">
          <span className="font-medium text-foreground truncate text-xs">
            {displayName}
          </span>
          {userProfile?.name && (
            <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
              {user.email}
            </span>
          )}
        </div>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        onClick={logout}
        className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
        title="Encerrar sessão"
        aria-label="Encerrar sessão"
      >
        <LogOut className="size-3.5" />
        <span className="hidden md:inline">Sair</span>
      </Button>
    </div>
  );
}
