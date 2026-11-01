"use client";

import { useState } from "react";
import { X, Check, Search } from "lucide-react";
import { Counter, FoodEntry, Meal } from "@/lib/health-types";
import { FOOD_GROUPS, FOOD_PRESETS, FoodPreset } from "@/lib/health-foods";
import { counterName } from "@/lib/health-store";
import { useLang, useT } from "@/lib/i18n";
import { uid } from "@/lib/utils";
import { Field } from "@/components/health/ui";

export const MEALS: Meal[] = ["breakfast", "lunch", "dinner", "snack"];

const num = (s: string) => {
  const n = parseFloat(s);
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const show = (n: number) => (n ? String(Math.round(n * 10) / 10) : "");

type Form = {
  name: string;
  kcal: string;
  protein: string;
  carb: string;
  fat: string;
  sugar: string;
  fiber: string;
  sodium: string;
};

const fromPreset = (p: FoodPreset, mult: number, name: string): Form => ({
  name,
  kcal: show(p.kcal * mult),
  protein: show(p.protein * mult),
  carb: show(p.carb * mult),
  fat: show(p.fat * mult),
  sugar: show(p.sugar * mult),
  fiber: show(p.fiber * mult),
  sodium: show(p.sodium * mult),
});

/* ================================================================
   เพิ่ม/แก้ไขรายการอาหาร: เลือกจากฐานอาหารไทย หรือกรอกเอง
   (ขั้น 7b จะเพิ่มโหมด "AI วิเคราะห์จากข้อความ/รูป" เข้ามาที่นี่)
================================================================ */
export function FoodSheet({
  initial,
  meal: initialMeal,
  dateKey,
  counters,
  onSave,
  onClose,
}: {
  initial: FoodEntry | null; // null = เพิ่มใหม่
  meal: Meal;
  dateKey: string;
  counters: Counter[];
  onSave: (e: FoodEntry) => void;
  onClose: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const pName = (p: FoodPreset) => (lang === "th" ? p.th : p.en);
  const pServing = (p: FoodPreset) => (lang === "th" ? p.servingTh : p.servingEn);

  const [step, setStep] = useState<"pick" | "form">(initial ? "form" : "pick");
  const [meal, setMeal] = useState<Meal>(initial?.meal ?? initialMeal);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<string>("all");
  const [preset, setPreset] = useState<FoodPreset | null>(null);
  const [mult, setMult] = useState(1);
  const [more, setMore] = useState(!!initial && (initial.sugar > 0 || initial.fiber > 0 || initial.sodium > 0));
  const [form, setForm] = useState<Form>(() =>
    initial
      ? {
          name: initial.name,
          kcal: show(initial.kcal),
          protein: show(initial.protein),
          carb: show(initial.carb),
          fat: show(initial.fat),
          sugar: show(initial.sugar),
          fiber: show(initial.fiber),
          sodium: show(initial.sodium),
        }
      : { name: "", kcal: "", protein: "", carb: "", fat: "", sugar: "", fiber: "", sodium: "" }
  );
  const [counts, setCounts] = useState<Record<string, number>>(initial?.counts ?? {});

  const set = (k: keyof Form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k !== "name") setPreset(null); // แก้ตัวเลขเอง = เลิกผูกกับรายการสำเร็จรูป
  };

  const pick = (p: FoodPreset) => {
    setPreset(p);
    setMult(1);
    setForm(fromPreset(p, 1, pName(p)));
    setMore(true);
    // เครื่องดื่มหวานนับเข้าโควตาให้อัตโนมัติ
    setCounts(p.sweet && counters.some((c) => c.id === "sweet") ? { sweet: 1 } : {});
    setStep("form");
  };

  const changeMult = (m: number) => {
    const v = Math.max(0.5, Math.min(10, m));
    setMult(v);
    if (preset) {
      setForm(fromPreset(preset, v, form.name || pName(preset)));
      if (preset.sweet && counts.sweet) setCounts((c) => ({ ...c, sweet: v }));
    }
  };

  const ql = q.trim().toLowerCase();
  const list = FOOD_PRESETS.filter(
    (p) =>
      (group === "all" || p.group === group) &&
      (!ql || p.th.toLowerCase().includes(ql) || p.en.toLowerCase().includes(ql))
  );

  const canSave = form.name.trim().length > 0 && num(form.kcal) > 0;
  const save = () => {
    if (!canSave) return;
    const cleaned: Record<string, number> = {};
    for (const k of Object.keys(counts)) if (counts[k] > 0) cleaned[k] = counts[k];
    onSave({
      id: initial?.id ?? uid(),
      dateKey: initial?.dateKey ?? dateKey,
      ts: initial?.ts ?? Date.now(),
      meal,
      name: form.name.trim().slice(0, 60),
      qty: preset ? (mult === 1 ? pServing(preset) : `${mult} × ${pServing(preset)}`) : initial?.qty,
      kcal: num(form.kcal),
      protein: num(form.protein),
      carb: num(form.carb),
      fat: num(form.fat),
      sugar: num(form.sugar),
      fiber: num(form.fiber),
      sodium: num(form.sodium),
      counts: Object.keys(cleaned).length ? cleaned : undefined,
      source: preset ? "preset" : initial?.source ?? "manual",
      ingredients: initial?.ingredients,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="mx-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {initial ? t("hf.edit") : t("hf.add")}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400" aria-label={t("common.close")}>
            <X size={20} />
          </button>
        </div>

        {/* มื้อ */}
        <div className="mb-4 flex gap-2">
          {MEALS.map((m) => (
            <button
              key={m}
              onClick={() => setMeal(m)}
              className={`flex-1 rounded-full py-2 text-xs font-medium ${
                meal === m ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {t(`hm.${m}`)}
            </button>
          ))}
        </div>

        {step === "pick" ? (
          <>
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("hf.search")}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {["all", ...FOOD_GROUPS].map((g) => (
                <button
                  key={g}
                  onClick={() => setGroup(g)}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs ${
                    group === g ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {t(`hg.${g}`)}
                </button>
              ))}
            </div>
            <ul className="mb-3 max-h-[42vh] divide-y divide-slate-100 overflow-y-auto rounded-2xl border border-slate-100">
              {list.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => pick(p)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left active:bg-emerald-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-800">{pName(p)}</span>
                      <span className="block text-xs text-slate-400">{pServing(p)}</span>
                    </span>
                    <span className="shrink-0 text-sm font-bold text-slate-600">{p.kcal} kcal</span>
                  </button>
                </li>
              ))}
              {list.length === 0 && <li className="p-4 text-center text-sm text-slate-400">{t("hf.none")}</li>}
            </ul>
            <p className="mb-3 text-center text-xs text-slate-400">{t("hf.approx")}</p>
            <button
              onClick={() => setStep("form")}
              className="w-full rounded-2xl border-2 border-dashed border-slate-300 py-3 text-slate-600 active:bg-slate-50"
            >
              {t("hf.manual")}
            </button>
          </>
        ) : (
          <>
            {preset && (
              <div className="mb-3 flex items-center justify-between rounded-2xl bg-emerald-50 px-3 py-2">
                <span className="text-sm text-emerald-700">
                  {pServing(preset)} ×
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeMult(mult - 0.5)}
                    className="h-9 w-9 rounded-xl bg-white text-lg font-bold text-slate-600 active:bg-slate-100"
                    aria-label="-"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-bold text-slate-800">{mult}</span>
                  <button
                    onClick={() => changeMult(mult + 0.5)}
                    className="h-9 w-9 rounded-xl bg-white text-lg font-bold text-slate-600 active:bg-slate-100"
                    aria-label="+"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="mb-3">
              <Field
                label={t("hf.name")}
                type="text"
                inputMode="text"
                value={form.name}
                onChange={(v) => set("name", v)}
                placeholder={t("hf.namePh")}
              />
            </div>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <Field label={t("hn.kcal")} unit="kcal" value={form.kcal} onChange={(v) => set("kcal", v)} />
              <Field label={t("hn.protein")} unit="g" value={form.protein} onChange={(v) => set("protein", v)} />
              <Field label={t("hn.carb")} unit="g" value={form.carb} onChange={(v) => set("carb", v)} />
              <Field label={t("hn.fat")} unit="g" value={form.fat} onChange={(v) => set("fat", v)} />
            </div>
            {more ? (
              <div className="mb-3 grid grid-cols-3 gap-3">
                <Field label={t("hn.sugar")} unit="g" value={form.sugar} onChange={(v) => set("sugar", v)} />
                <Field label={t("hn.fiber")} unit="g" value={form.fiber} onChange={(v) => set("fiber", v)} />
                <Field label={t("hn.sodium")} unit="mg" value={form.sodium} onChange={(v) => set("sodium", v)} />
              </div>
            ) : (
              <button onClick={() => setMore(true)} className="mb-3 text-sm text-emerald-600">
                + {t("hf.more")}
              </button>
            )}

            {counters.length > 0 && (
              <div className="mb-4 rounded-2xl bg-slate-50 p-3">
                <p className="mb-2 text-xs font-medium text-slate-500">{t("hf.countAs")}</p>
                <div className="flex flex-wrap gap-2">
                  {counters.map((c) => {
                    const on = (counts[c.id] ?? 0) > 0;
                    return (
                      <button
                        key={c.id}
                        onClick={() =>
                          setCounts((x) => ({ ...x, [c.id]: on ? 0 : 1 }))
                        }
                        className={`rounded-full px-3 py-1.5 text-sm ${
                          on ? "bg-emerald-500 text-white" : "bg-white text-slate-600"
                        }`}
                      >
                        {counterName(c, t)}
                        {on ? ` ×${counts[c.id]}` : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {!initial && (
                <button
                  onClick={() => {
                    setStep("pick");
                    setPreset(null);
                  }}
                  className="rounded-2xl bg-slate-100 px-5 py-4 font-medium text-slate-600 active:bg-slate-200"
                >
                  {t("common.back")}
                </button>
              )}
              <button
                disabled={!canSave}
                onClick={save}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-bold text-white active:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400"
              >
                <Check size={18} /> {t("common.save")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
