"use client";

import { Settings } from "lucide-react";
import { Tx } from "@/lib/types";
import { useT } from "@/lib/i18n";
import { CatView, spentByCat } from "@/lib/categories";
import { fmt } from "@/lib/utils";

/* ================================================================
   การ์ดงบรายหมวด — แถบความคืบหน้าของแต่ละหมวดที่ตั้งเพดานไว้
================================================================ */
export function CategoryBudgets({
  cats,
  budgets,
  txs,
  onManage,
}: {
  cats: CatView[];
  budgets: Record<string, number>;
  txs: Tx[];
  onManage: () => void;
}) {
  const t = useT();
  const spent = spentByCat(txs, cats);
  const rows = cats.filter((c) => (budgets[c.id] ?? 0) > 0);

  return (
    <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-600">{t("cb.title")}</h2>
        <button
          onClick={onManage}
          className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 active:bg-slate-200"
        >
          <Settings size={14} /> {t("cb.manage")}
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="text-center">
          <p className="mb-3 text-sm text-slate-400">{t("cb.empty")}</p>
          <button
            onClick={onManage}
            className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white active:bg-emerald-600"
          >
            {t("cb.set")}
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => {
            const cap = budgets[c.id];
            const used = spent[c.id] ?? 0;
            const pct = (used / cap) * 100;
            const over = used > cap;
            const warn = !over && pct >= 80;
            const bar = over ? "bg-rose-500" : warn ? "bg-amber-400" : "bg-emerald-500";
            const text = over ? "text-rose-600" : warn ? "text-amber-600" : "text-slate-400";
            const Icon = c.icon;
            return (
              <li key={c.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <Icon size={16} className="text-slate-500" /> {c.name}
                  </span>
                  <span className="text-slate-500">
                    {fmt(used)} / {fmt(cap)}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${bar}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <p className={`mt-1 text-xs ${text}`}>
                  {over
                    ? t("cb.over", { n: fmt(used - cap) })
                    : warn
                    ? `${t("cb.warn")} · ${t("cb.left", { n: fmt(cap - used) })}`
                    : t("cb.left", { n: fmt(cap - used) })}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
