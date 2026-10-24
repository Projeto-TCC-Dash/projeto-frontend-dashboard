import { IncomeType } from "@/src/types/api";

/**
 * Utilitários puros de formatação monetária, datas, competências mensais e cálculo de poupança.
 */

export function formatCurrencyBRL(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return (
    new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value) + "%"
  );
}

export function formatDateBR(dateIso: string): string {
  // Support both full ISO string (with T) and simple YYYY-MM-DD
  const datePart = dateIso.split("T")[0];
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return dateIso;
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

const MONTH_NAMES_PT: Record<string, string> = {
  "01": "Janeiro",
  "02": "Fevereiro",
  "03": "Março",
  "04": "Abril",
  "05": "Maio",
  "06": "Junho",
  "07": "Julho",
  "08": "Agosto",
  "09": "Setembro",
  "10": "Outubro",
  "11": "Novembro",
  "12": "Dezembro",
};

export function formatMonthYear(yearMonth: string): string {
  const [year, month] = yearMonth.split("-");
  const monthName = MONTH_NAMES_PT[month] || month;
  return `${monthName} de ${year}`;
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

export interface SavingsRateCalculation {
  rate: number;
  isDeficit: boolean;
  formattedRate: string;
  statusLabel: string;
}

export function calculateSavingsRate(
  totalIncome: number,
  totalExpenses: number
): SavingsRateCalculation {
  if (totalIncome <= 0) {
    const isDeficit = totalExpenses > 0;
    return {
      rate: 0,
      isDeficit,
      formattedRate: "0,0%",
      statusLabel: isDeficit
        ? "Sem poupança / Déficit orçamentário"
        : "Sem movimentações",
    };
  }

  if (totalExpenses >= totalIncome) {
    const isDeficit = totalExpenses > totalIncome;
    return {
      rate: 0,
      isDeficit,
      formattedRate: "0,0%",
      statusLabel: isDeficit
        ? "Sem poupança / Déficit orçamentário"
        : "Equilíbrio financeiro",
    };
  }

  const netBalance = totalIncome - totalExpenses;
  const rawRate = (netBalance / totalIncome) * 100;
  // Round to 1 decimal place
  const rate = Math.round(rawRate * 10) / 10;

  return {
    rate,
    isDeficit: false,
    formattedRate: formatPercentage(rate, 1),
    statusLabel: "Superávit orçamentário",
  };
}

/**
 * Converte string digitada pelo usuário em moeda BRL (ex: "1.500,50" ou "R$ 1.500,50")
 * para número de ponto flutuante (ex: 1500.5). Retorna undefined se vazio.
 */
export function parseBrlToNumber(value: string | number | undefined | null): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") return isNaN(value) ? undefined : value;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // Remove símbolos de moeda, espaços e pontos separadores de milhar
  const sanitized = trimmed
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const num = parseFloat(sanitized);
  return isNaN(num) ? undefined : num;
}

/**
 * Formata um número ou string numérica para exibição amigável em campo monetário BRL.
 */
export function formatBrlCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export interface EmergencyReserveGuideline {
  minMonths: number;
  maxMonths: number;
  minAmount: number;
  maxAmount: number;
  monthsLabel: string;
  formattedAmountRange: string;
  isCustomized: boolean;
  regimeLabel: string;
}

export function computeEmergencyReserveGuideline(
  incomeType?: IncomeType,
  monthlyExpenses: number = 0
): EmergencyReserveGuideline {
  const safeExpenses = Math.max(0, monthlyExpenses);
  let minMonths = 6;
  let maxMonths = 6;
  let isCustomized = false;
  let regimeLabel = "Padrão de Mercado";

  if (incomeType === "CLT") {
    minMonths = 3;
    maxMonths = 6;
    isCustomized = true;
    regimeLabel = "CLT";
  } else if (incomeType === "PUBLIC_SERVANT") {
    minMonths = 3;
    maxMonths = 6;
    isCustomized = true;
    regimeLabel = "Servidor Público";
  } else if (incomeType === "PJ_AUTONOMO") {
    minMonths = 6;
    maxMonths = 12;
    isCustomized = true;
    regimeLabel = "PJ / Autônomo";
  } else if (incomeType === "ENTREPRENEUR") {
    minMonths = 6;
    maxMonths = 12;
    isCustomized = true;
    regimeLabel = "Empresário";
  }

  const minAmount = safeExpenses * minMonths;
  const maxAmount = safeExpenses * maxMonths;

  const monthsLabel =
    minMonths === maxMonths
      ? `${minMonths} meses`
      : `${minMonths} a ${maxMonths} meses`;

  let formattedAmountRange = "";
  if (safeExpenses > 0) {
    if (minMonths === maxMonths) {
      formattedAmountRange = formatCurrencyBRL(minAmount);
    } else {
      formattedAmountRange = `${formatCurrencyBRL(minAmount)} a ${formatCurrencyBRL(maxAmount)}`;
    }
  }

  return {
    minMonths,
    maxMonths,
    minAmount,
    maxAmount,
    monthsLabel,
    formattedAmountRange,
    isCustomized,
    regimeLabel,
  };
}
