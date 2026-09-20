import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const kesFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export function formatKES(amount: number): string {
  return kesFormatter.format(amount).replace("KES", "KSh");
}

export function formatWhatsAppNumber(phone: string): string {
  if (!phone || typeof phone !== "string") return "";
  // Remove spaces, plus signs, parentheses and dashes
  let digits = phone.replace(/[^0-9]/g, "");
  // If starts with 0 (local format), replace leading 0 with 254
  if (digits.startsWith("0") && !digits.startsWith("254")) {
    digits = "254" + digits.slice(1);
  }
  // If starts with country code without leading + (e.g., 254...), keep as-is
  // Ensure it doesn't have leading zeros beyond the first
  return digits;
}
