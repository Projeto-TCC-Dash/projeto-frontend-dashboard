"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";

export function UserNav() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/50 border border-border/50 text-xs text-muted-foreground">
        <UserIcon className="size-3.5 text-foreground" />
        <span className="font-medium text-foreground max-w-[160px] truncate" title={user.email}>
          {user.email}
        </span>
      </div>

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
