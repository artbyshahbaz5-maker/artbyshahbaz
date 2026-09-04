import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number): string {
  if (!price) return "Price on Request";
  const str = String(price).trim();
  if (str.toLowerCase().includes("pkr") || str.toLowerCase().includes("rs")) {
    return str;
  }
  const num = Number(str.replace(/[^0-9.-]+/g, ""));
  if (isNaN(num)) return str;
  return `PKR ${num.toLocaleString("en-PK")}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function truncate(text: string, length: number): string {
  if (!text || text.length <= length) return text || "";
  return text.substring(0, length) + "...";
}
