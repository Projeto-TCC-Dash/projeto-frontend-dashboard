"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SettingsNav } from "@/components/settings/settings-nav"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isMetas = pathname?.startsWith("/settings/metas")

  if (isMetas) {
    return <>{children}</>
  }

  return (
    <div className="mx-auto max-w-4xl min-w-0 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Configurações da Conta
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seus dados de identidade, configure a segurança da conta e
          exporte relatórios financeiros completos.
        </p>
      </div>

      <SettingsNav />

      <div className="min-w-0">{children}</div>
    </div>
  )
}
