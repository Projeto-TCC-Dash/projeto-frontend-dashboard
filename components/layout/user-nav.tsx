"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";

export function UserNav() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/settings/profile"
        className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Meu Perfil Financeiro"
      >
        <UserIcon className="size-3.5 text-foreground" />
        <span className="font-medium text-foreground max-w-[160px] truncate">
          {user.email}
        </span>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        onClick={logout}
        className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
        title="Encerrar sessão"
      >
        <LogOut className="size-3.5" />
        <span className="hidden md:inline">Sair</span>
      </Button>
    </div>
  );
}
