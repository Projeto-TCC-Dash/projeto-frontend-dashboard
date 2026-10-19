import { describe, it, expect } from "vitest";
import {
  validateStatementFile,
  updateTransactionSchema,
  MAX_FILE_SIZE_BYTES,
} from "./transaction";

describe("transaction validations", () => {
  describe("validateStatementFile", () => {
    it("accepts valid .ofx file within 10MB limit", () => {
      const file = new File(["dummy content"], "extrato.ofx", {
        type: "application/x-ofx",
      });
      const result = validateStatementFile(file);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("accepts valid .csv file within 10MB limit", () => {
      const file = new File(["dummy,csv,content"], "extrato.csv", {
        type: "text/csv",
      });
      const result = validateStatementFile(file);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("accepts case-insensitive extension (.OFX and .CSV)", () => {
      const file = new File(["content"], "EXTRATO.OFX");
      const result = validateStatementFile(file);
      expect(result.isValid).toBe(true);
    });

    it("rejects files exceeding 10MB", () => {
      // Mock large file size
      const largeFile = new File(["content"], "extrato.ofx");
      Object.defineProperty(largeFile, "size", {
        value: MAX_FILE_SIZE_BYTES + 1,
      });

      const result = validateStatementFile(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/10MB/);
    });

    it("rejects unsupported extensions", () => {
      const file = new File(["content"], "extrato.pdf", {
        type: "application/pdf",
      });
      const result = validateStatementFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/\.ofx|\.csv/i);
    });
  });

  describe("updateTransactionSchema", () => {
    it("validates valid payload with category and cleanDescription", () => {
      const parsed = updateTransactionSchema.safeParse({
        cleanDescription: "Supermercado XYZ",
        category: "Alimentação",
      });
      expect(parsed.success).toBe(true);
    });

    it("rejects empty cleanDescription", () => {
      const parsed = updateTransactionSchema.safeParse({
        cleanDescription: "   ",
        category: "Alimentação",
      });
      expect(parsed.success).toBe(false);
    });

    it("rejects invalid category not in canonical categories", () => {
      const parsed = updateTransactionSchema.safeParse({
        cleanDescription: "Compra",
        category: "CategoriaInexistente",
      });
      expect(parsed.success).toBe(false);
    });
  });
});
