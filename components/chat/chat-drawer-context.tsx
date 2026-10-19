"use client";

import * as React from "react";

interface ChatDrawerContextValue {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const ChatDrawerContext = React.createContext<ChatDrawerContextValue | undefined>(undefined);

export function ChatDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const openDrawer = React.useCallback(() => setIsOpen(true), []);
  const closeDrawer = React.useCallback(() => setIsOpen(false), []);
  const toggleDrawer = React.useCallback(() => setIsOpen((prev) => !prev), []);

  const value = React.useMemo(
    () => ({
      isOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    }),
    [isOpen, openDrawer, closeDrawer, toggleDrawer]
  );

  return (
    <ChatDrawerContext.Provider value={value}>
      {children}
    </ChatDrawerContext.Provider>
  );
}

export function useChatDrawer(): ChatDrawerContextValue {
  const context = React.useContext(ChatDrawerContext);
  return (
    context ?? {
      isOpen: false,
      openDrawer: () => {},
      closeDrawer: () => {},
      toggleDrawer: () => {},
    }
  );
}
