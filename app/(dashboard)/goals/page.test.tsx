import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import * as React from "react";
import GoalsPage from "./page";
import { redirect } from "next/navigation";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("GoalsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve redirecionar para /settings/metas", () => {
    render(<GoalsPage />);
    expect(redirect).toHaveBeenCalledWith("/settings/metas");
  });
});
