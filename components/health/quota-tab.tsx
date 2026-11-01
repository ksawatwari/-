"use client";

import { Plus, Trash2, RotateCcw } from "lucide-react";
import { Counter, HealthData, Quotas } from "@/lib/health-types";
import { ResolvedQuotas, computeTargets, GENERIC_TARGETS } from "@/lib/health-calc";
import { counterName, counterUnit } from "@/lib/health-store";
import { ICONS } from "@/lib/constants";
import { useT } from "@/lib/i18n";
import { fmt, uid } from "@/lib/utils";
import { NUTRIENT_UNIT } from "@/components/health/ui";

const QUOTA_KEYS: (keyof Quotas)[] = ["kcal", "protein", "carb", "fat", "sugar", "sodium", "fiber", "water"];
const KIND_HINT: Record<keyof Quotas, "hq.min" | "hq.max" | "hq.target"> = {
  kcal: "hq.target",
  protein: "hq.min",
  carb: "hq.target",
  fat: "hq.target",
  sugar: "hq.max",
  sodium: "hq.max",
  fiber: "hq.min",
  water: "hq.min",
};
const COUNTER_ICONS = ["CupSoda", "Coffee", "Candy", "Cookie", "Cake", "Pizza", "Beer", "Drumstick", "Wine", "Popcorn"];

export function QuotaTab({
  h,
  setH,
  q,
  year,
}: {
  h: HealthData;
  setH: (fn: (h: HealthData) => HealthData) => void;
  q: ResolvedQuotas;
  year: number;
}) {
  const t = useT();
  const auto: ResolvedQuotas = h.body ? { ...GENERIC_TARGETS, ...pick(computeTargets(h.body, year)) } : GENERIC_TARGETS;

  const setQuota = (k: keyof Quotas, v: string) => {
    const nv = parseFloat(v);
    setH((x) => {
      const quotas = { ...x.quotas };
      if (Number.isFinite(nv) && nv > 0) quotas[k] = nv;
      else delete quotas[k];
      return { ...x, quotas };
    });
  };
  const patchCounter = (id: string, p: Partial<Counter>) =>
    setH((x) => ({ ...x, counters: x.counters.map((c) => (c.id === id ? { ...c, ...p } : c)) }));
  const removeCounter = (c: Counter) => {
    if (!confirm(t("hq.delConfirm", { name: counterName(c, t) }))) return;
    setH((x) => ({ ...x, counters: x.counters.filter((k) => k.id !== c.id) }));
  };
  const addCounter = () =>
    setH((x) => ({
      ...x,
      counters: [
        ...x.counters,
        { id: "k_" + uid(), name: t("hq.newName"), unit: t("hq.newUnit"), max: 2, kcal: 100, sugar: 0, icon: "Cookie" },
      ],
    }));

  return (
    <>
      <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-sm font-medium text-slate-600">{t("hq.dailyTitle")}</h2>
        <p className="mb-3 text-xs text-slate-400">{t("hq.dailyHint")}</p>
        <ul className="space-y-2">
          {QUOTA_KEYS.map((k) => {
            const custom = h.quotas[k] !== undefined;
            const unit = NUTRIENT_UNIT[k];
            return (
              <li key={k} className="flex items-center gap-2 rounded-2xl bg-slate-50 p-2 pl-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-700">{t(`hn.${k}`)}</p>
                  <p className="text-[11px] text-slate-400">
                    {t(KIND_HINT[k])} · {t("hq.auto")}: {fmt(auto[k])} {unit}
                  </p>
                </div>
                <div className="relative w-28">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={h.quotas[k] ?? ""}
                    placeholder={String(fmt(q[k]).replace(/,/g, ""))}
                    onChange={(e) => setQuota(k, e.target.value)}
                    className={`w-full rounded-xl border bg-white px-3 py-2.5 pr-9 text-right text-sm outline-none focus:border-emerald-500 ${
                      custom ? "border-emerald-400 font-bold text-emerald-700" : "border-slate-200 text-slate-500"
                    }`}
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">{unit}</span>
                </div>
                <button
                  onClick={() => setQuota(k, "")}
                  disabled={!custom}
                  aria-label={t("hq.reset")}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 active:bg-slate-200 disabled:opacity-25"
                >
                  <RotateCcw size={15} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-sm font-medium text-slate-600">{t("hq.counterTitle")}</h2>
        <p className="mb-3 text-xs text-slate-400">{t("hq.counterHint")}</p>
        <ul className="space-y-3">
          {h.counters.map((c) => {
            const Icon = ICONS[c.icon] ?? Plus;
            return (
              <li key={c.id} className="rounded-2xl bg-slate-50 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600">
                    <Icon size={18} />
                  </span>
                  <input
                    value={counterName(c, t)}
                    onChange={(e) => patchCounter(c.id, { name: e.target.value.slice(0, 30) })}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => removeCounter(c)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-rose-400 active:bg-rose-50"
                    aria-label={t("common.delete")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {COUNTER_ICONS.map((k) => {
                    const Ic = ICONS[k];
                    if (!Ic) return null;
                    return (
                      <button
                        key={k}
                        onClick={() => patchCounter(c.id, { icon: k })}
                        aria-label={k}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          c.icon === k ? "bg-emerald-500 text-white" : "bg-white text-slate-500"
                        }`}
                      >
                        <Ic size={15} />
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-500">
                  <label>
                    {t("hq.max")}
                    <input
                      type="number"
                      inputMode="decimal"
                      value={c.max}
                      onChange={(e) => patchCounter(c.id, { max: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </label>
                  <label>
                    {t("hq.unit")}
                    <input
                      value={counterUnit(c, t)}
                      onChange={(e) => patchCounter(c.id, { unit: e.target.value.slice(0, 10) })}
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </label>
                  <label>
                    kcal/{t("hq.perUnit")}
                    <input
                      type="number"
                      inputMode="decimal"
                      value={c.kcal}
                      onChange={(e) => patchCounter(c.id, { kcal: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </label>
                  <label>
                    {t("hn.sugar")} g
                    <input
                      type="number"
                      inputMode="decimal"
                      value={c.sugar}
                      onChange={(e) => patchCounter(c.id, { sugar: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
        <button
          onClick={addCounter}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 py-3 text-slate-500 active:bg-slate-50"
        >
          <Plus size={18} /> {t("hq.add")}
        </button>
      </section>
    </>
  );
}

function pick(tg: ReturnType<typeof computeTargets>): ResolvedQuotas {
  return {
    kcal: tg.kcal,
    protein: tg.protein,
    carb: tg.carb,
    fat: tg.fat,
    fiber: tg.fiber,
    sugar: tg.sugar,
    sodium: tg.sodium,
    water: tg.water,
  };
}
