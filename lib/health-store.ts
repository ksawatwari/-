import { Data } from "@/lib/types";
import { Counter, HealthData } from "@/lib/health-types";
import { DEFAULT_COUNTERS } from "@/lib/health-calc";
import { TFn } from "@/lib/i18n";

export const emptyHealth = (): HealthData => ({
  body: null,
  quotas: {},
  counters: DEFAULT_COUNTERS,
  foods: [],
  weights: [],
  water: {},
});

// อ่าน health จาก data (ข้อมูลเก่าที่ยังไม่มี = ค่าว่าง) และเติมฟิลด์ที่อาจขาดจากเวอร์ชันก่อน
export function getHealth(d: Pick<Data, "health">): HealthData {
  const h = d.health;
  if (!h) return emptyHealth();
  return {
    body: h.body ?? null,
    quotas: h.quotas ?? {},
    counters: h.counters && h.counters.length ? h.counters : DEFAULT_COUNTERS,
    foods: h.foods ?? [],
    weights: h.weights ?? [],
    water: h.water ?? {},
  };
}

// ชื่อ/หน่วยของตัวนับเริ่มต้นแปลตามภาษา (ถ้าผู้ใช้ไม่ได้แก้เอง)
export const counterName = (c: Counter, t: TFn) =>
  c.id === "sweet" && c.name === DEFAULT_COUNTERS[0].name ? t("hq.sweet") : c.name;
export const counterUnit = (c: Counter, t: TFn) =>
  c.id === "sweet" && c.unit === DEFAULT_COUNTERS[0].unit ? t("hq.glass") : c.unit;
