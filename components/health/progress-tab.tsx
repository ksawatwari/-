"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { HealthData } from "@/lib/health-types";
import { ResolvedQuotas, countsOf, dayKeys, kcalByDay, sumFoods, upsertWeight } from "@/lib/health-calc";
import { useT } from "@/lib/i18n";
import { fmt } from "@/lib/utils";
import { KcalBars, WeightLine } from "@/components/health/charts";

export function ProgressTab({
  h,
  setH,
  todayKey,
  q,
}: {
  h: HealthData;
  setH: (fn: (h: HealthData) => HealthData) => void;
  todayKey: string;
  q: ResolvedQuotas;
}) {
  const t = useT();
  const [kg, setKg] = useState("");

  const days = dayKeys(todayKey, 7);
  const values = kcalByDay(h.foods, days);
  const logged = values.filter((v) => v > 0);
  const avg = logged.length ? Math.round(logged.reduce((a, b) => a + b, 0) / logged.length) : 0;
  const overDays = values.filter((v) => v > q.kcal * 1.1).length;

  const weekFoods = h.foods.filter((f) => days.includes(f.dateKey));
  const wsum = sumFoods(weekFoods);
  const loggedDays = Math.max(1, new Set(weekFoods.map((f) => f.dateKey)).size);
  const sweetTotal = h.counters.length
    ? Object.values(countsOf(weekFoods, h.counters)).reduce((a, b) => a + b, 0)
    : 0;

  const weights = h.weights.slice(-60);
  const first = weights[0];
  const last = weights[weights.length - 1];
  const target = h.body?.targetKg;

  const addWeight = () => {
    const v = parseFloat(kg);
    if (!(v >= 25 && v <= 300)) return;
    setH((x) => ({
      ...x,
      weights: upsertWeight(x.weights, todayKey, v),
      body: x.body ? { ...x.body, weightKg: v } : x.body,
    }));
    setKg("");
  };

  return (
    <>
      <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-sm font-medium text-slate-600">{t("hp.weightTitle")}</h2>
        {weights.length >= 1 ? (
          <>
            <div className="mb-2 flex items-end gap-4">
              <p className="text-3xl font-extrabold text-slate-800">
                {last.kg} <span className="text-sm font-semibold text-slate-400">kg</span>
              </p>
              {first && weights.length > 1 && (
                <p className={`pb-1 text-sm font-medium ${last.kg - first.kg <= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  {last.kg - first.kg > 0 ? "+" : ""}
                  {(Math.round((last.kg - first.kg) * 10) / 10).toString()} kg
                </p>
              )}
              {target ? (
                <p className="pb-1 text-sm text-slate-400">
                  🎯 {target} ({t("hp.toGo", { n: Math.abs(Math.round((last.kg - target) * 10) / 10) })})
                </p>
              ) : null}
            </div>
            <WeightLine points={weights} target={target} label={t("hp.weightTitle")} />
          </>
        ) : (
          <p className="py-4 text-center text-sm text-slate-400">{t("hp.noWeight")}</p>
        )}
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addWeight()}
            placeholder={t("hp.todayWeight")}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-500"
          />
          <button
            onClick={addWeight}
            disabled={!(parseFloat(kg) >= 25)}
            className="flex items-center gap-1 rounded-xl bg-emerald-500 px-5 font-bold text-white active:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Check size={18} /> {t("common.save")}
          </button>
        </div>
      </section>

      <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-sm font-medium text-slate-600">{t("hp.kcalTitle")}</h2>
        <p className="mb-2 text-xs text-slate-400">{t("hp.kcalHint", { n: fmt(q.kcal) })}</p>
        <KcalBars days={days} values={values} target={q.kcal} label={t("hp.kcalTitle")} />
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-slate-50 py-2">
            <p className="text-[11px] text-slate-400">{t("hp.avg")}</p>
            <p className="font-bold text-slate-700">{fmt(avg)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 py-2">
            <p className="text-[11px] text-slate-400">{t("hp.overDays")}</p>
            <p className={`font-bold ${overDays > 0 ? "text-rose-600" : "text-slate-700"}`}>{overDays}</p>
          </div>
          <div className="rounded-xl bg-slate-50 py-2">
            <p className="text-[11px] text-slate-400">{t("hp.logged")}</p>
            <p className="font-bold text-slate-700">{logged.length}/7</p>
          </div>
        </div>
      </section>

      <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-medium text-slate-600">{t("hp.weekAvg")}</h2>
        {weekFoods.length === 0 ? (
          <p className="py-2 text-center text-sm text-slate-400">{t("hp.noFood")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {(["protein", "carb", "fat", "sugar", "fiber"] as const).map((k) => (
              <div key={k} className="flex items-baseline justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-slate-500">{t(`hn.${k}`)}</span>
                <span className="font-bold text-slate-700">
                  {fmt(wsum[k] / loggedDays)} <span className="text-[11px] font-normal text-slate-400">/ {fmt(q[k])} g</span>
                </span>
              </div>
            ))}
            <div className="flex items-baseline justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span className="text-slate-500">{t("hp.quotaItems")}</span>
              <span className="font-bold text-slate-700">{fmt(sweetTotal)}</span>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
