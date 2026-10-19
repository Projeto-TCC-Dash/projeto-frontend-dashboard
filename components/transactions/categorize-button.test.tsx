import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { CategorizeButton } from "./categorize-button";

describe("CategorizeButton component", () => {
  it("renders active button and triggers onCategorize when hasAiKey is true", () => {
    const onCategorize = vi.fn();
    render(
      <CategorizeButton
        hasAiKey={true}
        isCategorizing={false}
        onCategorize={onCategorize}
        onOpenAiKeyModal={vi.fn()}
      />
    );

    const btn = screen.getByRole("button", { name: /Categorizar com IA/i });
    expect(btn).toBeDefined();
    fireEvent.click(btn);
    expect(onCategorize).toHaveBeenCalled();
  });

  it("shows loading state when isCategorizing is true", () => {
    render(
      <CategorizeButton
        hasAiKey={true}
        isCategorizing={true}
        onCategorize={vi.fn()}
        onOpenAiKeyModal={vi.fn()}
      />
    );

    expect(screen.getByText(/Categorizando/i)).toBeDefined();
    const btn = screen.getByRole("button");
    expect(btn.hasAttribute("disabled")).toBe(true);
  });

  it("triggers onOpenAiKeyModal when clicked and hasAiKey is false", () => {
    const onOpenAiKeyModal = vi.fn();
    render(
      <CategorizeButton
        hasAiKey={false}
        isCategorizing={false}
        onCategorize={vi.fn()}
        onOpenAiKeyModal={onOpenAiKeyModal}
      />
    );

    const btn = screen.getByRole("button", { name: /Ativar IA para Categorizar/i });
    expect(btn).toBeDefined();
    fireEvent.click(btn);
    expect(onOpenAiKeyModal).toHaveBeenCalled();
  });
});
