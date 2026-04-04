const noColor = "NO_COLOR" in process.env;

function wrap(code: string, text: string): string {
  if (noColor) return text;
  return `\x1b[${code}m${text}\x1b[0m`;
}

export const bold = (t: string) => wrap("1", t);
export const dim = (t: string) => wrap("2", t);
export const green = (t: string) => wrap("32", t);
export const yellow = (t: string) => wrap("33", t);
export const cyan = (t: string) => wrap("36", t);
export const red = (t: string) => wrap("31", t);

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "\u2026";
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function padRight(str: string, len: number): string {
  return str.length >= len ? str : str + " ".repeat(len - str.length);
}
