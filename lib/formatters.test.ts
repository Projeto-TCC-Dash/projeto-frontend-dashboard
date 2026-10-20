import { describe, it, expect } from "vitest";
import {
  formatCurrencyBRL,
  formatPercentage,
  formatDateBR,
  formatMonthYear,
  getCurrentYearMonth,
  shiftYearMonth,
  calculateSavingsRate,
  parseBrlToNumber,
  formatBrlCurrency,
} from "./formatters";

describe("formatters", () => {
  describe("formatCurrencyBRL", () => {
    it("formats positive numbers in BRL currency format", () => {
      const result = formatCurrencyBRL(1250.5);
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

  describe("formatPercentage", () => {
    it("formats decimals as pt-BR percentage", () => {
      expect(formatPercentage(25.4)).toBe("25,4%");
      expect(formatPercentage(0)).toBe("0,0%");
      expect(formatPercentage(100)).toBe("100,0%");
    });

    it("supports custom decimal places", () => {
      expect(formatPercentage(32.768, 2)).toBe("32,77%");
      expect(formatPercentage(32.768, 0)).toBe("33%");
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

  describe("formatMonthYear", () => {
    it("formats YYYY-MM into full Portuguese month name and year", () => {
      expect(formatMonthYear("2026-10")).toBe("Outubro de 2026");
      expect(formatMonthYear("2025-01")).toBe("Janeiro de 2025");
      expect(formatMonthYear("2026-12")).toBe("Dezembro de 2026");
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

  describe("calculateSavingsRate", () => {
    it("calculates positive savings rate when income exceeds expenses", () => {
      const res = calculateSavingsRate(10000, 6000);
      expect(res.rate).toBe(40);
      expect(res.isDeficit).toBe(false);
      expect(res.formattedRate).toBe("40,0%");
      expect(res.statusLabel).toBe("Superávit orçamentário");
    });

    it("handles deficit when expenses exceed income by fixing rate at 0% with alert flag", () => {
      const res = calculateSavingsRate(5000, 7000);
      expect(res.rate).toBe(0);
      expect(res.isDeficit).toBe(true);
      expect(res.formattedRate).toBe("0,0%");
      expect(res.statusLabel).toBe("Sem poupança / Déficit orçamentário");
    });

    it("handles zero income with positive expenses as deficit with 0%", () => {
      const res = calculateSavingsRate(0, 1500);
      expect(res.rate).toBe(0);
      expect(res.isDeficit).toBe(true);
      expect(res.formattedRate).toBe("0,0%");
      expect(res.statusLabel).toBe("Sem poupança / Déficit orçamentário");
    });

    it("handles zero income and zero expenses safely", () => {
      const res = calculateSavingsRate(0, 0);
      expect(res.rate).toBe(0);
      expect(res.isDeficit).toBe(false);
      expect(res.formattedRate).toBe("0,0%");
      expect(res.statusLabel).toBe("Sem movimentações");
    });

    it("handles exact budget equality (expenses === income) safely as 0% rate", () => {
      const res = calculateSavingsRate(3000, 3000);
      expect(res.rate).toBe(0);
      expect(res.isDeficit).toBe(false);
      expect(res.formattedRate).toBe("0,0%");
      expect(res.statusLabel).toBe("Equilíbrio financeiro");
    });
  });

  describe("parseBrlToNumber", () => {
    it("converte string formatada em BRL para float", () => {
      expect(parseBrlToNumber("1.500,50")).toBe(1500.5);
      expect(parseBrlToNumber("R$ 1.500,50")).toBe(1500.5);
      expect(parseBrlToNumber("1000")).toBe(1000);
      expect(parseBrlToNumber("0,00")).toBe(0);
    });

    it("retorna undefined para entradas vazias ou nulas", () => {
      expect(parseBrlToNumber("")).toBeUndefined();
      expect(parseBrlToNumber("   ")).toBeUndefined();
      expect(parseBrlToNumber(undefined)).toBeUndefined();
      expect(parseBrlToNumber(null)).toBeUndefined();
    });

    it("aceita números diretamente", () => {
      expect(parseBrlToNumber(2500)).toBe(2500);
      expect(parseBrlToNumber(NaN)).toBeUndefined();
    });
  });

  describe("formatBrlCurrency", () => {
    it("formata números válidos para string monetária BRL", () => {
      const res = formatBrlCurrency(1500.5);
      expect(res.replace(/\u00A0/g, " ")).toMatch(/R\$\s?1\.500,50/);
    });

    it("retorna string vazia para valores nulos ou indefinidos", () => {
      expect(formatBrlCurrency(undefined)).toBe("");
      expect(formatBrlCurrency(null)).toBe("");
      expect(formatBrlCurrency(NaN)).toBe("");
    });
  });
});
