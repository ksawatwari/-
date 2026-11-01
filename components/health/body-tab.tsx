"use client";

import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { Activity, BodyProfile, Goal, HealthData, Sex } from "@/lib/health-types";
import {
  ACTIVITY_FACTOR,
  computeTargets,
  upsertWeight,
  whtr,
  whtrClass,
  BmiClass,
} from "@/lib/health-calc";
import { useT } from "@/lib/i18n";
import { fmt } from "@/lib/utils";
import { Field, Seg } from "@/components/health/ui";

const ACTIVITIES = Object.keys(ACTIVITY_FACTOR) as Activity[];
const GOALS: Goal[] = ["lose", "maintain", "gain", "muscle"];
const PACES = [0.25, 0.5, 0.75, 1];

const BMI_COLOR: Record<BmiClass, string> = {
  under: "bg-sky-400",
  normal: "bg-emerald-500",
  over: "bg-amber-400",
  obese1: "bg-orange-500",
  obese2: "bg-rose-500",
};

const n = (s: string) => {
  const v = parseFloat(s);
  return Number.isFinite(v) && v > 0 ? v : 0;
};

export function BodyTab({
  h,
  setH,
  todayKey,
  year,
}: {
  h: HealthData;
  setH: (fn: (h: HealthData) => HealthData) => void;
  todayKey: string;
  year: number;
}) {
  const t = useT();
  const b = h.body;
  const [sex, setSex] = useState<Sex>(b?.sex ?? "male");
  const [age, setAge] = useState(b ? String(b.age + Math.max(0, year - b.ageYear)) : "");
  const [height, setHeight] = useState(b ? String(b.heightCm) : "");
  const [weight, setWeight] = useState(b ? String(b.weightKg) : "");
  const [waist, setWaist] = useState(b?.waistCm ? String(b.waistCm) : "");
  const [activity, setActivity] = useState<Activity>(b?.activity ?? "light");
  const [goal, setGoal] = useState<Goal>(b?.goal ?? "maintain");
  const [target, setTarget] = useState(b?.targetKg ? String(b.targetKg) : "");
  const [pace, setPace] = useState(b?.pace ?? 0.5);
  const [saved, setSaved] = useState(false);

  const valid = n(age) >= 10 && n(age) <= 100 && n(height) >= 100 && n(height) <= 230 && n(weight) >= 25 && n(weight) <= 300;

  const draft: BodyProfile | null = valid
    ? {
        sex,
        age: Math.round(n(age)),
        ageYear: year,
        heightCm: n(height),
        weightKg: n(weight),
        waistCm: n(waist) || undefined,
        activity,
        goal,
        targetKg: n(target) || undefined,
        pace,
      }
    : null;
  const r = draft ? computeTargets(draft, year) : null;

  const save = () => {
    if (!draft) return;
    setH((x) => ({
      ...x,
      body: draft,
      weights: upsertWeight(x.weights, todayKey, draft.weightKg),
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // คำเตือนความปลอดภัย
  const warns: string[] = [];
  if (r && draft) {
    if (goal === "lose" && r.bmiClass === "under") warns.push(t("hb.warnUnder"));
    if (goal === "lose" && draft.targetKg && draft.targetKg < r.range[0]) warns.push(t("hb.warnTarget", { n: r.range[0] }));
    if (r.clamped) warns.push(t("hb.warnClamp"));
    if (goal === "lose" && draft.targetKg && draft.targetKg >= draft.weightKg) warns.push(t("hb.warnDir"));
    if ((goal === "gain" || goal === "muscle") && draft.targetKg && draft.targetKg <= draft.weightKg) warns.push(t("hb.warnDir"));
  }

  // แถบ BMI: ช่วง 15–35
  const bmiPos = r ? Math.max(0, Math.min(100, ((r.bmi - 15) / 20) * 100)) : 0;
  const segs: { cls: BmiClass; from: number; to: number }[] = [
    { cls: "under", from: 15, to: 18.5 },
    { cls: "normal", from: 18.5, to: 23 },
    { cls: "over", from: 23, to: 25 },
    { cls: "obese1", from: 25, to: 30 },
    { cls: "obese2", from: 30, to: 35 },
  ];

  return (
    <>
      <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-medium text-slate-600">{t("hb.about")}</h2>
        <div className="mb-3">
          <Seg<Sex>
            value={sex}
            onChange={setSex}
            options={[
              { id: "male", label: t("hb.male") },
              { id: "female", label: t("hb.female") },
            ]}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label={t("hb.age")} unit={t("hb.yr")} value={age} onChange={setAge} inputMode="numeric" />
          <Field label={t("hb.height")} unit="cm" value={height} onChange={setHeight} />
          <Field label={t("hb.weight")} unit="kg" value={weight} onChange={setWeight} />
        </div>
        <div className="mt-3">
          <Field label={t("hb.waist")} unit="cm" value={waist} onChange={setWaist} placeholder={t("hb.optional")} />
        </div>
      </section>

      <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-medium text-slate-600">{t("hb.activity")}</h2>
        <div className="space-y-2">
          {ACTIVITIES.map((a) => (
            <button
              key={a}
              onClick={() => setActivity(a)}
              className={`w-full rounded-2xl px-4 py-3 text-left ${
                activity === a ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-700 active:bg-slate-100"
              }`}
            >
              <span className="block text-sm font-semibold">{t(`ha.${a}`)}</span>
              <span className={`block text-xs ${activity === a ? "text-emerald-50" : "text-slate-400"}`}>{t(`ha.${a}.d`)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-medium text-slate-600">{t("hb.goal")}</h2>
        <div className="mb-3 grid grid-cols-2 gap-2">
          {GOALS.map((g) => (
            <button
              key={g}
              onClick={() => setGoal(g)}
              className={`rounded-2xl px-3 py-3 text-left ${
                goal === g ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-700 active:bg-slate-100"
              }`}
            >
              <span className="block text-sm font-semibold">{t(`hg2.${g}`)}</span>
              <span className={`block text-xs ${goal === g ? "text-emerald-50" : "text-slate-400"}`}>{t(`hg2.${g}.d`)}</span>
            </button>
          ))}
        </div>
        <Field label={t("hb.targetKg")} unit="kg" value={target} onChange={setTarget} placeholder={t("hb.optional")} />
        {(goal === "lose" || goal === "gain") && (
          <div className="mt-3">
            <p className="mb-1 text-xs font-medium text-slate-500">{t("hb.pace")}</p>
            <Seg<number>
              value={pace}
              onChange={setPace}
              options={PACES.map((p) => ({ id: p, label: `${p}` }))}
            />
            <p className="mt-1 text-xs text-slate-400">{t("hb.paceHint")}</p>
          </div>
        )}
      </section>

      {/* ผลคำนวณ */}
      {r && draft ? (
        <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-medium text-slate-600">{t("hb.result")}</h2>

          <div className="mb-1 flex items-end justify-between">
            <p className="text-3xl font-extrabold text-slate-800">
              {r.bmi} <span className="text-sm font-semibold text-slate-400">BMI</span>
            </p>
            <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${BMI_COLOR[r.bmiClass]}`}>
              {t(`hbmi.${r.bmiClass}`)}
            </span>
          </div>
          <div className="relative mb-1 mt-3 flex h-3 overflow-hidden rounded-full">
            {segs.map((s) => (
              <div key={s.cls} className={`${BMI_COLOR[s.cls]} opacity-80`} style={{ width: `${((s.to - s.from) / 20) * 100}%` }} />
            ))}
          </div>
          <div className="relative h-3">
            <div className="absolute -top-0.5 h-3 w-3 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-slate-700 bg-white" style={{ left: `${bmiPos}%` }} />
          </div>
          <p className="mb-4 text-xs text-slate-400">
            {t("hb.healthyRange", { a: r.range[0], b: r.range[1] })}
          </p>

          {draft.waistCm && (
            <p className="mb-3 text-sm text-slate-600">
              {t("hb.whtr")}: <b>{whtr(draft.waistCm, draft.heightCm).toFixed(2)}</b> · {t(`hw.${whtrClass(whtr(draft.waistCm, draft.heightCm))}`)}
            </p>
          )}

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">BMR</p>
              <p className="text-lg font-bold text-slate-800">{fmt(r.bmr)} <span className="text-xs font-normal text-slate-400">kcal</span></p>
              <p className="text-[11px] text-slate-400">{t("hb.bmrDesc")}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">TDEE</p>
              <p className="text-lg font-bold text-slate-800">{fmt(r.tdee)} <span className="text-xs font-normal text-slate-400">kcal</span></p>
              <p className="text-[11px] text-slate-400">{t("hb.tdeeDesc")}</p>
            </div>
          </div>

          <div className="mb-3 rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs text-emerald-700">{t("hb.dailyTarget")}</p>
            <p className="text-3xl font-extrabold text-emerald-600">
              {fmt(r.kcal)} <span className="text-sm font-semibold">kcal</span>
            </p>
            <p className="text-xs text-emerald-700">
              {r.delta === 0 ? t("hb.deltaZero") : r.delta < 0 ? t("hb.deltaCut", { n: fmt(-r.delta) }) : t("hb.deltaAdd", { n: fmt(r.delta) })}
              {r.weeks ? ` · ${t("hb.weeks", { n: r.weeks })}` : ""}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white py-2">
                <p className="text-[11px] text-slate-400">{t("hn.protein")}</p>
                <p className="font-bold text-slate-700">{r.protein} g</p>
              </div>
              <div className="rounded-xl bg-white py-2">
                <p className="text-[11px] text-slate-400">{t("hn.carb")}</p>
                <p className="font-bold text-slate-700">{r.carb} g</p>
              </div>
              <div className="rounded-xl bg-white py-2">
                <p className="text-[11px] text-slate-400">{t("hn.fat")}</p>
                <p className="font-bold text-slate-700">{r.fat} g</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-emerald-700">
              {t("hb.limits", { sugar: r.sugar, sodium: fmt(r.sodium), water: fmt(r.water), fiber: r.fiber })}
            </p>
          </div>

          {warns.map((w) => (
            <p key={w} className="mb-2 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
              <AlertTriangle size={16} className="mt-px shrink-0" /> {w}
            </p>
          ))}
          <p className="text-[11px] leading-relaxed text-slate-400">{t("hb.disclaimer")}</p>
        </section>
      ) : (
        <p className="mb-4 rounded-2xl bg-white p-4 text-center text-sm text-slate-400 shadow-sm">{t("hb.fillIn")}</p>
      )}

      <button
        onClick={save}
        disabled={!valid}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-bold text-white active:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400"
      >
        <Check size={18} /> {saved ? t("hb.saved") : t("common.save")}
      </button>
    </>
  );
}
