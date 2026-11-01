"use client";

import { ReactNode } from "react";
import { NutrientKey, NutrientState, NUTRIENT_KIND } from "@/lib/health-calc";
import { useT } from "@/lib/i18n";
import { fmt } from "@/lib/utils";

export const NUTRIENT_UNIT: Record<NutrientKey | "water", string> = {
  kcal: "kcal",
  protein: "g",
  carb: "g",
  fat: "g",
  sugar: "g",
  fiber: "g",
  sodium: "mg",
  water: "ml",
};

// แถบ segmented เล็กๆ เลือกค่าเดียว
export function Seg<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T | undefined;
  options: { id: T; label: ReactNode }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={String(o.id)}
          type="button"
          onClick={() => onChange(o.id)}
          className={`flex-1 rounded-xl py-2.5 text-sm font-medium ${
            value === o.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Field({
  label,
  unit,
  value,
  onChange,
  placeholder,
  inputMode = "decimal",
  type = "number",
}: {
  label: string;
  unit?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "decimal" | "numeric" | "text";
  type?: "number" | "text";
}) {
  return (
    <label className="block text-xs font-medium text-slate-500">
      {label}
      <div className="relative mt-1">
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-base text-slate-800 outline-none focus:border-emerald-500"
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            {unit}
          </span>
        )}
      </div>
    </label>
  );
}

const STATE_STYLE: Record<NutrientState, { bar: string; text: string }> = {
  ok: { bar: "bg-emerald-500", text: "text-emerald-600" },
  near: { bar: "bg-amber-400", text: "text-amber-600" },
  over: { bar: "bg-rose-500", text: "text-rose-600" },
  low: { bar: "bg-amber-400", text: "text-amber-600" },
};

// ข้อความสถานะของสารอาหาร: ขาด / ครบ / ใกล้เต็ม / เกิน / เหลือ
export function useStatusText() {
  const t = useT();
  return (key: NutrientKey | "water", state: NutrientState, value: number, target: number): string => {
    const u = NUTRIENT_UNIT[key];
    const diff = Math.abs(target - value);
    const kind = key === "water" ? "min" : NUTRIENT_KIND[key];
    if (kind === "min") return state === "ok" ? t("hs.done") : t("hs.lack", { n: fmt(diff), u });
    if (state === "over") return t("hs.over", { n: fmt(value - target), u });
    if (state === "near") return t("hs.near");
    return t("hs.left", { n: fmt(diff), u });
  };
}

export function NutrientBar({
  label,
  value,
  target,
  unit,
  state,
  text,
  muted,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  state: NutrientState;
  text: string;
  muted?: boolean; // target-kind ที่ยังไม่ถึงเป้า ไม่ต้องเตือนสีเหลือง
}) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  const st = muted && state === "low" ? { bar: "bg-emerald-400", text: "text-slate-400" } : STATE_STYLE[state];
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">
          {fmt(value)} / {fmt(target)} {unit}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all duration-500 ${st.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`mt-0.5 text-xs ${st.text}`}>{text}</p>
    </div>
  );
}
