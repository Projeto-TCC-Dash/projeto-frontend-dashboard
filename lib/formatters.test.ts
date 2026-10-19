import { describe, it, expect } from "vitest";
import {
  formatCurrencyBRL,
  formatDateBR,
  getCurrentYearMonth,
  shiftYearMonth,
} from "./formatters";

describe("formatters", () => {
  describe("formatCurrencyBRL", () => {
    it("formats positive numbers in BRL currency format", () => {
      const result = formatCurrencyBRL(1250.5);
      // Non-breaking space or standard space depending on environment
      expect(result.replace(/\u00A0/g, " ")).toMatch(/R\$\s?1\.250,50/);
    });

    it("formats negative numbers with minus sign in BRL", () => {
      const result = formatCurrencyBRL(-89.9);
      expect(result.replace(/\u00A0/g, " ")).toMatch(/-R\$\s?89,90/);
    });

    it("formats zero in BRL", () => {
      const result = formatCurrencyBRL(0);
      expect(result.replace(/\u00A0/g, " ")).toMatch(/R\$\s?0,00/);
    });
  });

  describe("formatDateBR", () => {
    it("formats ISO UTC date string to DD/MM/AAAA", () => {
      const formatted = formatDateBR("2026-10-19T14:30:00Z");
      expect(formatted).toBe("19/10/2026");
    });

    it("handles date only string YYYY-MM-DD", () => {
      const formatted = formatDateBR("2026-05-02");
      expect(formatted).toBe("02/05/2026");
    });
  });

  describe("getCurrentYearMonth", () => {
    it("returns year-month in YYYY-MM format", () => {
      const ym = getCurrentYearMonth();
      expect(ym).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe("shiftYearMonth", () => {
    it("advances by given number of months", () => {
      expect(shiftYearMonth("2026-10", 1)).toBe("2026-11");
      expect(shiftYearMonth("2026-12", 1)).toBe("2027-01");
    });

    it("retreats by given number of months", () => {
      expect(shiftYearMonth("2026-10", -1)).toBe("2026-09");
      expect(shiftYearMonth("2026-01", -1)).toBe("2025-12");
    });
  });
});
