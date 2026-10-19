import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar | Plataforma Financeira",
  description: "Acesse sua conta para visualizar seus diagnósticos e métricas financeiras.",
};

export default function LoginPage() {
  return <LoginForm />;
}
