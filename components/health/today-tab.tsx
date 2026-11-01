"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Pencil, Plus, Trash2, Droplets } from "lucide-react";
import { FoodEntry, HealthData, Meal } from "@/lib/health-types";
import {
  NutrientKey,
  ResolvedQuotas,
  NUTRIENT_KIND,
  countsOf,
  nutrientState,
  sumFoods,
} from "@/lib/health-calc";
import { counterName, counterUnit } from "@/lib/health-store";
import { ICONS } from "@/lib/constants";
import { getLocale, useT } from "@/lib/i18n";
import { addDays, fmt, fromKey, toKey, uid } from "@/lib/utils";
import { NutrientBar, NUTRIENT_UNIT, useStatusText } from "@/components/health/ui";
import { FoodSheet, MEALS } from "@/components/health/food-sheet";

const BAR_KEYS: NutrientKey[] = ["protein", "carb", "fat", "sugar", "fiber", "sodium"];

export function TodayTab({
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
  const statusText = useStatusText();
  const [date, setDate] = useState(todayKey);
  const [sheet, setSheet] = useState<{ entry: FoodEntry | null; meal: Meal } | null>(null);

  const dayFoods = h.foods.filter((f) => f.dateKey === date);
  const total = sumFoods(dayFoods);
  const counts = countsOf(dayFoods, h.counters);
  const water = h.water[date] ?? 0;
  const isToday = date === todayKey;

  const shift = (n: number) => {
    const next = toKey(addDays(fromKey(date), n));
    if (next <= todayKey) setDate(next);
  };

  const saveFood = (e: FoodEntry) => {
    setH((x) => {
      const exists = x.foods.some((f) => f.id === e.id);
      const foods = exists ? x.foods.map((f) => (f.id === e.id ? e : f)) : [...x.foods, e];
      return { ...x, foods };
    });
    setSheet(null);
  };
  const removeFood = (id: string) => setH((x) => ({ ...x, foods: x.foods.filter((f) => f.id !== id) }));

  // ตัวนับ +1 : สร้างรายการอาหารพร้อมสารอาหารต่อหน่วยของตัวนับนั้น
  const bump = (cid: string) => {
    const c = h.counters.find((x) => x.id === cid);
    if (!c) return;
    const e: FoodEntry = {
      id: uid(),
      dateKey: date,
      ts: Date.now(),
      meal: "snack",
      name: counterName(c, t),
      kcal: c.kcal,
      protein: 0,
      carb: c.sugar,
      fat: 0,
      sugar: c.sugar,
      fiber: 0,
      sodium: 0,
      counts: { [cid]: 1 },
      source: "manual",
    };
    setH((x) => ({ ...x, foods: [...x.foods, e] }));
  };
  // ตัวนับ −1 : ย้อนรายการล่าสุดที่นับตัวนี้
  const undo = (cid: string) => {
    const last = [...dayFoods].reverse().find((f) => (f.counts?.[cid] ?? 0) > 0);
    if (!last) return;
    setH((x) => {
      const n = last.counts![cid];
      if (n <= 1) return { ...x, foods: x.foods.filter((f) => f.id !== last.id) };
      return {
        ...x,
        foods: x.foods.map((f) => (f.id === last.id ? { ...f, counts: { ...f.counts, [cid]: n - 1 } } : f)),
      };
    });
  };

  const addWater = (ml: number) =>
    setH((x) => ({ ...x, water: { ...x.water, [date]: Math.max(0, (x.water[date] ?? 0) + ml) } }));

  const left = q.kcal - total.kcal;
  const kcalState = nutrientState("kcal", total.kcal, q.kcal);
  const kcalPct = Math.min(100, (total.kcal / q.kcal) * 100);

  return (
    <>
      {/* เลือกวัน */}
      <div className="mb-3 flex items-center justify-between rounded-2xl bg-white px-2 py-1.5 shadow-sm">
        <button onClick={() => shift(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 active:bg-slate-100" aria-label="prev">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-slate-700">
          {isToday
            ? t("recent.today")
            : fromKey(date).toLocaleDateString(getLocale(), { weekday: "short", day: "numeric", month: "short" })}
        </span>
        <button
          onClick={() => shift(1)}
          disabled={isToday}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 active:bg-slate-100 disabled:opacity-30"
          aria-label="next"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* แคลอรี่ */}
      <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
        <div className="mb-1 flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500">{left >= 0 ? t("hs.kcalLeft") : t("hs.kcalOver")}</p>
            <p className={`text-4xl font-extrabold ${kcalState === "over" ? "text-rose-600" : "text-emerald-600"}`}>
              {fmt(Math.abs(left))}
              <span className="ml-1 text-base font-semibold text-slate-400">kcal</span>
            </p>
          </div>
          <p className="pb-1 text-sm text-slate-500">
            {fmt(total.kcal)} / {fmt(q.kcal)}
          </p>
        </div>
        <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${kcalState === "over" ? "bg-rose-500" : "bg-emerald-500"}`}
            style={{ width: `${kcalPct}%` }}
          />
        </div>
        <div className="space-y-3">
          {BAR_KEYS.map((k) => {
            const target = q[k];
            const st = nutrientState(k, total[k], target);
            return (
              <NutrientBar
                key={k}
                label={t(`hn.${k}`)}
                value={total[k]}
                target={target}
                unit={NUTRIENT_UNIT[k]}
                state={st}
                text={statusText(k, st, total[k], target)}
                muted={NUTRIENT_KIND[k] === "target"}
              />
            );
          })}
        </div>
      </section>

      {/* โควตา (ตัวนับ) */}
      {h.counters.length > 0 && (
        <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-medium text-slate-600">{t("hq.title")}</h2>
          <ul className="space-y-3">
            {h.counters.map((c) => {
              const n = counts[c.id] ?? 0;
              const Icon = ICONS[c.icon] ?? Plus;
              const over = n > c.max;
              const full = n === c.max;
              return (
                <li key={c.id} className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      over ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{counterName(c, t)}</p>
                    <p className={`text-xs ${over ? "text-rose-600" : full ? "text-amber-600" : "text-slate-400"}`}>
                      {n} / {c.max} {counterUnit(c, t)}
                      {over && ` · ${t("hq.overBy", { n: fmt(n - c.max), u: counterUnit(c, t) })}`}
                      {full && !over && ` · ${t("hq.full")}`}
                    </p>
                  </div>
                  <button
                    onClick={() => undo(c.id)}
                    disabled={n <= 0}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:bg-slate-200 disabled:opacity-30"
                    aria-label="-1"
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    onClick={() => bump(c.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white active:bg-emerald-600"
                    aria-label="+1"
                  >
                    <Plus size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* น้ำดื่ม */}
      <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Droplets size={16} className="text-sky-500" /> {t("hn.water")}
          </h2>
          <span className="text-sm text-slate-500">
            {fmt(water)} / {fmt(q.water)} ml
          </span>
        </div>
        <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-sky-400 transition-all duration-500" style={{ width: `${Math.min(100, (water / q.water) * 100)}%` }} />
        </div>
        <div className="flex gap-2">
          {[250, 500].map((ml) => (
            <button
              key={ml}
              onClick={() => addWater(ml)}
              className="flex-1 rounded-xl bg-sky-50 py-2.5 text-sm font-medium text-sky-700 active:bg-sky-100"
            >
              +{ml}
            </button>
          ))}
          <button
            onClick={() => addWater(-250)}
            disabled={water <= 0}
            className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-600 active:bg-slate-200 disabled:opacity-40"
          >
            −250
          </button>
        </div>
      </section>

      {/* มื้ออาหาร */}
      {MEALS.map((m) => {
        const list = dayFoods.filter((f) => f.meal === m).sort((a, b) => a.ts - b.ts);
        const sub = list.reduce((s, f) => s + f.kcal, 0);
        return (
          <section key={m} className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-600">
                {t(`hm.${m}`)} {sub > 0 && <span className="ml-1 text-xs text-slate-400">{fmt(sub)} kcal</span>}
              </h2>
              <button
                onClick={() => setSheet({ entry: null, meal: m })}
                className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600 active:bg-emerald-100"
              >
                <Plus size={14} /> {t("hf.addShort")}
              </button>
            </div>
            {list.length === 0 ? (
              <p className="py-2 text-center text-xs text-slate-300">—</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {list.map((f) => (
                  <li key={f.id} className="flex items-center gap-2 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{f.name}</p>
                      <p className="truncate text-xs text-slate-400">
                        {f.qty ? `${f.qty} · ` : ""}P {fmt(f.protein)} · C {fmt(f.carb)} · F {fmt(f.fat)}
                        {f.sugar > 0 ? ` · ${t("hn.sugar")} ${fmt(f.sugar)}` : ""}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{fmt(f.kcal)}</span>
                    <button
                      onClick={() => setSheet({ entry: f, meal: f.meal })}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 active:bg-slate-100"
                      aria-label={t("common.edit")}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => removeFood(f.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-rose-400 active:bg-rose-50"
                      aria-label={t("common.delete")}
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <p className="mb-2 text-center text-xs text-slate-400">{t("hf.approx")}</p>

      {sheet && (
        <FoodSheet
          key={sheet.entry?.id ?? "new"}
          initial={sheet.entry}
          meal={sheet.meal}
          dateKey={date}
          counters={h.counters}
          onSave={saveFood}
          onClose={() => setSheet(null)}
        />
      )}
    </>
  );
}
