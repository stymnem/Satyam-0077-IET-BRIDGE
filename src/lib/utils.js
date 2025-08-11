import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format date without time (local browser time)
export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

// Old formatDateTime (local browser time)
export function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Format date only in IST
export function formatDateIST(value) {
  const date = parseAsUTCIfNoTimezone(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

// Format date + time in IST
export function formatDateTimeIST(value) {
  const date = parseAsUTCIfNoTimezone(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Helper: If timestamp string has no timezone info,
 * append "Z" so it's parsed as UTC.
 */
function parseAsUTCIfNoTimezone(value) {
  if (!value) return new Date(NaN);

  // Check if value is a string and has no timezone offset or Z
  if (typeof value === "string" && !/[Z+-]\d{2}:?\d{2}$/.test(value)) {
    return new Date(value + "Z");
  }
  return new Date(value);
}
