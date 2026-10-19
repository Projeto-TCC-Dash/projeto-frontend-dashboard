import * as React from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Navbar } from "@/components/layout/navbar";
import { ChatDrawerProvider } from "@/components/chat/chat-drawer-context";
import { ChatDrawer } from "@/components/chat/chat-drawer";
import { ChatFloatingButton } from "@/components/chat/chat-floating-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAiKey={true}>
      <ChatDrawerProvider>
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <Navbar />
          <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <ChatDrawer />
          <ChatFloatingButton />
        </div>
      </ChatDrawerProvider>
    </AuthGuard>
  );
}
