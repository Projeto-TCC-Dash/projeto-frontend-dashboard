"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AiKeyForm } from "./ai-key-form";

interface AiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiKeyModal({ open, onOpenChange }: AiKeyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Configuração da Chave de IA (BYOK)</DialogTitle>
          <DialogDescription>
            Insira sua chave do Google AI Studio. O sistema fará um teste ativo de conexão para garantir que os diagnósticos e o assistente operem com sucesso.
          </DialogDescription>
        </DialogHeader>

        <AiKeyForm
          onSuccess={() => {
            // Fecha após breve feedback visual
            setTimeout(() => {
              onOpenChange(false);
            }, 1200);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
