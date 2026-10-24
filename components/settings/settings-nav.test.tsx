import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { SettingsNav } from "./settings-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/security",
}));

describe("SettingsNav Component", () => {
  it("deve renderizar links para as abas de Identidade, Segurança e Exportação", () => {
    render(<SettingsNav />);

    expect(screen.getByText("Informações de Identidade")).toBeInTheDocument();
    expect(screen.getByText("Segurança & Sessão")).toBeInTheDocument();
    expect(screen.getByText("Exportar Dados")).toBeInTheDocument();

    const identityLink = screen.getByRole("link", { name: /Informações de Identidade/i });
    expect(identityLink).toHaveAttribute("href", "/settings/profile");

    const activeLink = screen.getByRole("link", { name: /Segurança & Sessão/i });
    expect(activeLink).toHaveAttribute("href", "/settings/security");
    expect(activeLink.className).toContain("text-primary");
  });
});
