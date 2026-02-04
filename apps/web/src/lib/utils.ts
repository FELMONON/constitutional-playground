import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function calculateWordDiff(original: string, revised: string): {
  added: number;
  removed: number;
  unchanged: number;
} {
  const originalWords = new Set(original.toLowerCase().split(/\s+/));
  const revisedWords = new Set(revised.toLowerCase().split(/\s+/));

  let added = 0;
  let removed = 0;
  let unchanged = 0;

  revisedWords.forEach((word) => {
    if (originalWords.has(word)) {
      unchanged++;
    } else {
      added++;
    }
  });

  originalWords.forEach((word) => {
    if (!revisedWords.has(word)) {
      removed++;
    }
  });

  return { added, removed, unchanged };
}
