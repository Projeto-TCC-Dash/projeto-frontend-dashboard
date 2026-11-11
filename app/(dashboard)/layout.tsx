import * as React from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { ChatDrawerProvider } from "@/components/chat/chat-drawer-context"
import { ChatDrawer } from "@/components/chat/chat-drawer"
import { ChatFloatingButton } from "@/components/chat/chat-floating-button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAiKey={true}>
      <ChatDrawerProvider>
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <Navbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <ChatDrawer />
          <ChatFloatingButton />
        </div>
      </ChatDrawerProvider>
    </AuthGuard>
  )
}
