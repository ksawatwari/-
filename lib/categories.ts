import { ElementType } from "react";
import { CustomCat, Data, Tx } from "@/lib/types";
import { TFn } from "@/lib/i18n";
import { CATEGORIES, ICONS } from "@/lib/constants";
import { Wallet } from "lucide-react";

// หมวดที่ผู้ใช้กำหนดเองได้ (หมวดเริ่มต้น 5 หมวดก็แก้ชื่อ/ไอคอนได้ ยกเว้นลบ "อื่นๆ" ไม่ได้)
export type CatView = { id: string; name: string; icon: ElementType; builtin: boolean };

export const OTHER_ID = "other";
const BUILTIN_ICON: Record<string, string> = {
  food: "Utensils",
  drink: "Coffee",
  travel: "Bus",
  goods: "ShoppingBasket",
  other: "Wallet",
};

export const defaultCats = (): CustomCat[] =>
  CATEGORIES.map((c) => ({ id: c.id, icon: BUILTIN_ICON[c.id] }));

// รายการหมวดดิบจาก data (ข้อมูลเก่าที่ยังไม่มี categories = หมวดเริ่มต้น) และรับประกันว่ามี "other" เสมอ
export function rawCats(d: Pick<Data, "categories">): CustomCat[] {
  const list = d.categories && d.categories.length > 0 ? d.categories : defaultCats();
  return list.some((c) => c.id === OTHER_ID)
    ? list
    : [...list, { id: OTHER_ID, icon: "Wallet" }];
}

export function toViews(list: CustomCat[], t: TFn): CatView[] {
  return list.map((c) => ({
    id: c.id,
    name: c.name && c.name.trim() ? c.name : t(`cat.${c.id}`),
    icon: ICONS[c.icon] ?? Wallet,
    builtin: c.id in BUILTIN_ICON,
  }));
}

// หา view ของหมวดจาก id — รองรับข้อมูลเก่าที่เก็บชื่อไทย และหมวดที่ถูกลบ (ตกไป "อื่นๆ")
export function catFind(views: CatView[], id: string): CatView {
  const direct = views.find((c) => c.id === id);
  if (direct) return direct;
  const legacy = CATEGORIES.find((c) => c.th === id);
  const viaLegacy = legacy && views.find((c) => c.id === legacy.id);
  if (viaLegacy) return viaLegacy;
  return views.find((c) => c.id === OTHER_ID) ?? views[views.length - 1];
}

// ยอดจ่ายต่อหมวด (นับเฉพาะรายจ่าย) ในรอบปัจจุบัน
export function spentByCat(txs: Tx[], views: CatView[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const x of txs) {
    if (x.income) continue;
    const id = catFind(views, x.category).id;
    out[id] = (out[id] ?? 0) + x.amount;
  }
  return out;
}
