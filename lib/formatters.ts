/**
 * Utilitários puros de formatação monetária, datas e competências mensais.
 */

export function formatCurrencyBRL(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function formatDateBR(dateIso: string): string {
  // Support both full ISO string (with T) and simple YYYY-MM-DD
  const datePart = dateIso.split("T")[0];
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return dateIso;
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function shiftYearMonth(yearMonth: string, offsetMonths: number): string {
  const [yearStr, monthStr] = yearMonth.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // Month in JS Date is 0-indexed (0 to 11)
  const date = new Date(year, month - 1 + offsetMonths, 1);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  return `${nextYear}-${nextMonth}`;
}
