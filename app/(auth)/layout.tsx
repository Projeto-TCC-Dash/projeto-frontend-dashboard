import * as React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-muted/30 px-4 py-6 sm:p-6 lg:p-8">
      <div className="w-full max-w-md min-w-0 space-y-5 sm:space-y-6">
        <div className="flex flex-col items-center space-y-1.5 text-center">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Plataforma Financeira
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestão inteligente e diagnósticos com IA
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
