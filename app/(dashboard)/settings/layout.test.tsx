import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import SettingsLayout from "./layout";

let mockPathname = "/settings/profile";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("SettingsLayout Component", () => {
  it("deve renderizar o cabeçalho de configurações da conta e SettingsNav quando a rota for /settings/profile", () => {
    mockPathname = "/settings/profile";
    render(
      <SettingsLayout>
        <div data-testid="settings-child">Conteúdo de Perfil</div>
      </SettingsLayout>
    );

    expect(screen.getByText("Configurações da Conta")).toBeInTheDocument();
    expect(screen.getByText(/Gerencie seus dados de identidade/i)).toBeInTheDocument();
    expect(screen.getByTestId("settings-child")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Abas de Configurações" })).toBeInTheDocument();
  });

  it("NÃO deve renderizar o cabeçalho de conta nem SettingsNav quando a rota for /settings/metas", () => {
    mockPathname = "/settings/metas";
    render(
      <SettingsLayout>
        <div data-testid="metas-child">Conteúdo de Metas</div>
      </SettingsLayout>
    );

    expect(screen.queryByText("Configurações da Conta")).toBeNull();
    expect(screen.queryByRole("navigation", { name: "Abas de Configurações" })).toBeNull();
    expect(screen.getByTestId("metas-child")).toBeInTheDocument();
  });
});
