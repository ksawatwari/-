import { Data } from "@/lib/types";
import { getLocale } from "@/lib/i18n";
import { DEFAULT_BUDGET, DEFAULT_QUICK, DEFAULT_FIXED } from "@/lib/constants";

/* ================================================================
   Helpers
================================================================ */
export const pad = (n: number) => String(n).padStart(2, "0");
export const toKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const diffDays = (a: Date, b: Date) =>
  Math.round(
    (Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
      Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) /
      86400000
  );
export const monthEndKey = (d: Date) =>
  toKey(new Date(d.getFullYear(), d.getMonth() + 1, 0));
export const fmt = (n: number) =>
  Math.round(n).toLocaleString(getLocale(), { maximumFractionDigits: 0 });
export const uid = () => Math.random().toString(36).slice(2, 10);

export const defaultData = (): Data => ({
  setupDone: false,
  budget: DEFAULT_BUDGET,
  fixed: DEFAULT_FIXED,
  endDate: monthEndKey(new Date()),
  txs: [],
  quick: DEFAULT_QUICK,
  profile: null,
  lang: "th",
  font: "anuphan",
  lock: null,
  theme: "emerald",
  pattern: "none",
});
