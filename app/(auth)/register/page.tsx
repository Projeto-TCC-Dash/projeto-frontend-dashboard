import { RegisterForm } from "@/components/auth/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastrar | Plataforma Financeira",
  description: "Crie sua conta para gerenciar extratos e receber diagnósticos de IA.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
