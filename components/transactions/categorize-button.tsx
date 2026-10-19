"use client";

import * as React from "react";
import { Sparkles, Loader2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CategorizeButtonProps {
  hasAiKey: boolean;
  isCategorizing?: boolean;
  onCategorize: () => void;
  onOpenAiKeyModal: () => void;
}

export function CategorizeButton({
  hasAiKey,
  isCategorizing = false,
  onCategorize,
  onOpenAiKeyModal,
}: CategorizeButtonProps) {
  if (!hasAiKey) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onOpenAiKeyModal}
        className="border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60"
        aria-label="Ativar IA para Categorizar"
      >
        <Key className="mr-1.5 size-4 text-amber-600 dark:text-amber-400" />
        Ativar IA para Categorizar
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      disabled={isCategorizing}
      onClick={onCategorize}
      className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
      aria-label="Categorizar com IA"
    >
      {isCategorizing ? (
        <>
          <Loader2 className="mr-1.5 size-4 animate-spin" />
          Categorizando...
        </>
      ) : (
        <>
          <Sparkles className="mr-1.5 size-4" />
          Categorizar com IA
        </>
      )}
    </Button>
  );
}
