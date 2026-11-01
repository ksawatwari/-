// สูตรคำนวณสุขภาพ — ฟังก์ชันล้วน (ไม่แตะ React) ใช้ซ้ำได้ทั้งหน้าจอและ API ในขั้น 7b
// ค่าที่ได้เป็น "ค่าประมาณทั่วไป" ไม่ใช่คำแนะนำทางการแพทย์
import {
  Activity,
  BodyProfile,
  Counter,
  FoodEntry,
  Goal,
  Nutrients,
  Quotas,
  Sex,
} from "@/lib/health-types";

export const ACTIVITY_FACTOR: Record<Activity, number> = {
  sedentary: 1.2, // นั่งทำงาน แทบไม่ออกกำลัง
  light: 1.375, // ออกกำลัง 1–3 วัน/สัปดาห์
  moderate: 1.55, // 3–5 วัน/สัปดาห์
  active: 1.725, // 6–7 วัน/สัปดาห์
  very: 1.9, // หนักมาก / งานใช้แรง
};

const KCAL_PER_KG = 7700; // พลังงานต่อน้ำหนักตัว 1 กก. (ค่าประมาณมาตรฐาน)
const r1 = (n: number) => Math.round(n * 10) / 10;

/* ---------------- BMI ---------------- */
export const bmi = (kg: number, cm: number): number => kg / Math.pow(cm / 100, 2);

export type BmiClass = "under" | "normal" | "over" | "obese1" | "obese2";
// เกณฑ์เอเชีย-แปซิฟิก (ที่กรมอนามัยไทยใช้): <18.5 ผอม, 18.5–22.9 ปกติ, 23–24.9 ท้วม, 25–29.9 อ้วน, ≥30 อ้วนมาก
export const bmiClass = (b: number): BmiClass =>
  b < 18.5 ? "under" : b < 23 ? "normal" : b < 25 ? "over" : b < 30 ? "obese1" : "obese2";

export const healthyRange = (cm: number): [number, number] => {
  const m2 = Math.pow(cm / 100, 2);
  return [r1(18.5 * m2), r1(22.9 * m2)];
};

// ดัชนีรอบเอวต่อส่วนสูง: <0.5 ดี, 0.5–0.59 เสี่ยง, ≥0.6 เสี่ยงสูง
export const whtr = (waist: number, cm: number): number => waist / cm;
export type WhtrClass = "good" | "risk" | "high";
export const whtrClass = (v: number): WhtrClass => (v < 0.5 ? "good" : v < 0.6 ? "risk" : "high");

/* ---------------- พลังงาน ---------------- */
// Mifflin–St Jeor
export const bmr = (sex: Sex, kg: number, cm: number, age: number): number =>
  10 * kg + 6.25 * cm - 5 * age + (sex === "male" ? 5 : -161);

export const ageNow = (b: BodyProfile, year: number): number => b.age + Math.max(0, year - b.ageYear);

const PROTEIN_PER_KG: Record<Goal, number> = { lose: 1.8, maintain: 1.2, gain: 1.5, muscle: 2.0 };

export type Targets = {
  bmi: number;
  bmiClass: BmiClass;
  range: [number, number];
  bmr: number;
  tdee: number;
  kcal: number;
  delta: number; // kcal ที่ปรับจาก TDEE (ลบ = ลด)
  clamped: boolean; // true = โดนกันไม่ให้ต่ำเกินเกณฑ์ปลอดภัย
  protein: number;
  carb: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  water: number;
  weeks: number | null; // ประมาณกี่สัปดาห์ถึงน้ำหนักเป้าหมาย
};

export function computeTargets(body: BodyProfile, year: number): Targets {
  const age = ageNow(body, year);
  const b = bmi(body.weightKg, body.heightCm);
  const base = bmr(body.sex, body.weightKg, body.heightCm, age);
  const td = base * ACTIVITY_FACTOR[body.activity];

  const pace = Math.min(1, Math.max(0.1, body.pace || 0.5));
  let delta = 0;
  if (body.goal === "lose") delta = -Math.min(1000, (pace * KCAL_PER_KG) / 7);
  else if (body.goal === "gain") delta = Math.min(700, (pace * KCAL_PER_KG) / 7);
  else if (body.goal === "muscle") delta = 300;

  const floor = body.sex === "male" ? 1500 : 1200;
  let kcal = td + delta;
  let clamped = false;
  if (body.goal === "lose" && kcal < floor) {
    kcal = floor;
    clamped = true;
  }
  kcal = Math.round(kcal / 10) * 10;

  const protein = Math.round(Math.min(PROTEIN_PER_KG[body.goal] * body.weightKg, (0.35 * kcal) / 4));
  const fat = Math.round((0.25 * kcal) / 9);
  const carb = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  const fiber = Math.max(20, Math.round((14 * kcal) / 1000));
  const water = Math.round((body.weightKg * 35) / 100) * 100;

  let weeks: number | null = null;
  if (body.targetKg && body.targetKg > 0) {
    const diff = body.targetKg - body.weightKg;
    const rate = (Math.abs(kcal - td) * 7) / KCAL_PER_KG; // กก./สัปดาห์ ตามแผนจริง
    const right =
      (body.goal === "lose" && diff < 0) || ((body.goal === "gain" || body.goal === "muscle") && diff > 0);
    if (right && rate > 0.05) weeks = Math.ceil(Math.abs(diff) / rate);
  }

  return {
    bmi: r1(b),
    bmiClass: bmiClass(b),
    range: healthyRange(body.heightCm),
    bmr: Math.round(base),
    tdee: Math.round(td),
    kcal,
    delta: Math.round(kcal - td),
    clamped,
    protein,
    carb,
    fat,
    fiber,
    sugar: 24, // น้ำตาลเติมไม่เกิน ~6 ช้อนชา/วัน (กรมอนามัย)
    sodium: 2000, // mg (WHO)
    water,
    weeks,
  };
}

// ยังไม่กรอกข้อมูลร่างกาย → ใช้ค่ากลางสำหรับผู้ใหญ่ทั่วไป
export const GENERIC_TARGETS = {
  kcal: 2000,
  protein: 60,
  carb: 270,
  fat: 55,
  fiber: 28,
  sugar: 24,
  sodium: 2000,
  water: 2000,
};
export type ResolvedQuotas = typeof GENERIC_TARGETS;

export function resolveQuotas(body: BodyProfile | null, quotas: Quotas, year: number): ResolvedQuotas {
  const auto: ResolvedQuotas = body ? pickQuotaKeys(computeTargets(body, year)) : { ...GENERIC_TARGETS };
  const out = { ...auto };
  (Object.keys(out) as (keyof ResolvedQuotas)[]).forEach((k) => {
    const v = quotas[k];
    if (typeof v === "number" && v > 0) out[k] = v;
  });
  return out;
}
const pickQuotaKeys = (t: Targets): ResolvedQuotas => ({
  kcal: t.kcal,
  protein: t.protein,
  carb: t.carb,
  fat: t.fat,
  fiber: t.fiber,
  sugar: t.sugar,
  sodium: t.sodium,
  water: t.water,
});

/* ---------------- รวมยอด / สถานะ ---------------- */
export const emptyNutrients = (): Nutrients => ({
  kcal: 0,
  protein: 0,
  carb: 0,
  fat: 0,
  sugar: 0,
  fiber: 0,
  sodium: 0,
});

export function sumFoods(list: Nutrients[]): Nutrients {
  const s = emptyNutrients();
  for (const x of list) {
    s.kcal += x.kcal || 0;
    s.protein += x.protein || 0;
    s.carb += x.carb || 0;
    s.fat += x.fat || 0;
    s.sugar += x.sugar || 0;
    s.fiber += x.fiber || 0;
    s.sodium += x.sodium || 0;
  }
  return s;
}

export function countsOf(list: FoodEntry[], counters: Counter[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of counters) out[c.id] = 0;
  for (const f of list) {
    if (!f.counts) continue;
    for (const k of Object.keys(f.counts)) out[k] = (out[k] ?? 0) + f.counts[k];
  }
  return out;
}

export type NutrientKey = "kcal" | "protein" | "carb" | "fat" | "sugar" | "fiber" | "sodium";
// min = ต้องกินให้ถึง / max = ห้ามเกิน / target = ใกล้เป้า
export const NUTRIENT_KIND: Record<NutrientKey, "min" | "max" | "target"> = {
  kcal: "target",
  protein: "min",
  carb: "target",
  fat: "target",
  sugar: "max",
  fiber: "min",
  sodium: "max",
};

export type NutrientState = "low" | "ok" | "near" | "over";
export function nutrientState(key: NutrientKey, value: number, target: number): NutrientState {
  if (!(target > 0)) return "ok";
  const ratio = value / target;
  const kind = NUTRIENT_KIND[key];
  if (kind === "min") return ratio >= 1 ? "ok" : "low";
  if (kind === "max") return ratio > 1 ? "over" : ratio >= 0.85 ? "near" : "ok";
  return ratio > 1.1 ? "over" : ratio >= 0.95 ? "ok" : "low"; // target
}

/* ---------------- วันที่ ---------------- */
const p2 = (n: number) => String(n).padStart(2, "0");
const keyOf = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const dateOf = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
// n วันย้อนหลังจนถึง endKey (เรียงเก่า→ใหม่)
export function dayKeys(endKey: string, n: number): string[] {
  const end = dateOf(endKey);
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(keyOf(new Date(end.getFullYear(), end.getMonth(), end.getDate() - i)));
  }
  return out;
}

export function kcalByDay(foods: FoodEntry[], keys: string[]): number[] {
  const m: Record<string, number> = {};
  for (const f of foods) m[f.dateKey] = (m[f.dateKey] ?? 0) + (f.kcal || 0);
  return keys.map((k) => Math.round(m[k] ?? 0));
}

// เพิ่ม/แทนที่น้ำหนักของวันนั้น แล้วเรียงตามวัน
export function upsertWeight<T extends { dateKey: string; kg: number }>(list: T[], dateKey: string, kg: number): T[] {
  const rest = list.filter((w) => w.dateKey !== dateKey);
  return [...rest, { dateKey, kg } as T].sort((a, b) => (a.dateKey < b.dateKey ? -1 : 1));
}

/* ---------------- ค่าเริ่มต้นของตัวนับ ---------------- */
export const DEFAULT_COUNTERS: Counter[] = [
  { id: "sweet", name: "เครื่องดื่มหวาน", unit: "แก้ว", max: 1, kcal: 150, sugar: 25, icon: "CupSoda" },
];
