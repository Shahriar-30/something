import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCIES } from "./constants";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as a currency string based on the provided currency code.
 * @param {number} amount - The numeric value to format
 * @param {string} currencyCode - The ISO currency code (e.g., 'USD', 'BDT')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currencyCode = "USD") {
  const currency = CURRENCIES.find((c) => c.code === currencyCode) || {
    symbol: "$",
    code: "USD",
  };

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.code,
    currencyDisplay: "symbol",
  }).format(amount);
}
