import { z } from "zod";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_YEAR = 2000;

// A real calendar day as YYYY-MM-DD. Date.parse alone accepts "2024-02-31"
// (rolls over to March 2), so round-trip the value to reject impossible dates.
export function isValidDateString(value: string) {
  if (!DATE_PATTERN.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);
  if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return false;
  }

  const year = date.getUTCFullYear();
  return year >= MIN_YEAR && year <= new Date().getUTCFullYear() + 1;
}

export const dateStringSchema = z.string().refine(isValidDateString);
