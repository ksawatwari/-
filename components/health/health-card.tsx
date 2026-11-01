"use client";

import { HeartPulse, ChevronRight, Droplets } from "lucide-react";
import { Data } from "@/lib/types";
import { countsOf, nutrientState, resolveQuotas, sumFoods } from "@/lib/health-calc";
import { counterName, getHealth } from "@/lib/health-store";
import { useT } from "@/lib/i18n";
import { fmt } from "@/lib/utils";
import { HealthTabId } from "@/components/health/health-screen";

/* ================================================================
   การ์ดสรุปสุขภาพวันนี้บนหน้าหลัก — แตะเพื่อเปิดหน้าสุขภาพ
================================================================ */
export function HealthCard({
  data,
  todayKey,
  onOpen,
}: {
  data: Data;
  todayKey: string;
  onOpen: (tab: HealthTabId) => void;
}) {
  const t = useT();
  const h = getHealth(data);
  const q = resolveQuotas(h.body, h.quotas, new Date().getFullYear());
  const foods = h.foods.filter((f) => f.dateKey === todayKey);
  const total = sumFoods(foods);
  const counts = countsOf(foods, h.counters);
  const water = h.water[todayKey] ?? 0;
  const st = nutrientState("kcal", total.kcal, q.kcal);
  const pct = Math.min(100, (total.kcal / q.kcal) * 100);

  return (
    <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <HeartPulse size={16} className="text-rose-400" /> {t("health.title")}
        </h2>
        <button
          onClick={() => onOpen("today")}
          className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 active:bg-slate-200"
        >
          {t("health.open")} <ChevronRight size={14} />
        </button>
      </div>

      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-semibold text-slate-700">{t("hn.kcal")}</span>
        <span className="text-slate-500">
          {fmt(total.kcal)} / {fmt(q.kcal)} kcal
        </span>
      </div>
      <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${st === "over" ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
          {t("hn.protein")} {fmt(total.protein)}/{fmt(q.protein)} g
        </span>
        <span
          className={`rounded-full px-3 py-1.5 ${
            total.sugar > q.sugar ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"
          }`}
        >
          {t("hn.sugar")} {fmt(total.sugar)}/{fmt(q.sugar)} g
        </span>
        {h.counters.map((c) => {
          const n = counts[c.id] ?? 0;
          return (
            <span
              key={c.id}
              className={`rounded-full px-3 py-1.5 ${n > c.max ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"}`}
            >
              {counterName(c, t)} {n}/{c.max}
            </span>
          );
        })}
        <span className="flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1.5 text-sky-700">
          <Droplets size={12} /> {fmt(water)}/{fmt(q.water)}
        </span>
      </div>

      {!h.body && (
        <button
          onClick={() => onOpen("body")}
          className="mt-3 w-full rounded-xl bg-emerald-50 py-2.5 text-sm font-medium text-emerald-700 active:bg-emerald-100"
        >
          {t("health.setup")}
        </button>
      )}
    </section>
  );
}
