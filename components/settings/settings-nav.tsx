"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const SETTINGS_TABS = [
  {
    href: "/settings/profile",
    label: "Informações de Identidade",
    icon: User,
  },
  {
    href: "/settings/security",
    label: "Segurança & Sessão",
    icon: Shield,
  },
  {
    href: "/settings/export",
    label: "Exportar Dados",
    icon: Download,
  },
];

export function SettingsNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("border-b border-border mb-6", className)}>
      <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Abas de Configurações">
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 py-2.5 px-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
