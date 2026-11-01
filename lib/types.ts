   

/* ================================================================
   Types
================================================================ */
export type Lang = "th" | "en" | "fr" | "de";
export type Fixed = { id: string; name: string; amount: number };
export type Tx = {
  id: string;
  amount: number;
  category: string;
  note: string;
  dateKey: string;
  ts: number;
  icon?: string;
  income?: boolean; // true = เงินเข้า (เพิ่มยอด) / ไม่ใส่ = รายจ่าย (หักยอด)
  ref?: string; // รหัสอ้างอิงสลิป ใช้กันบันทึกซ้ำ
};
export type QuickItem = {
  id: string;
  label: string;
  amount: number;
  category: string;
  icon: string;
};
// หมวดหมู่ที่ปรับแต่งได้ — name ว่าง = ใช้ชื่อแปลของหมวดเริ่มต้น / icon = key ใน ICONS
export type CustomCat = { id: string; name?: string; icon: string };
export type Avatar =
  | { kind: "default" }
  | { kind: "preset"; key: string }
  | { kind: "photo"; src: string };
export type Profile = { name: string; avatar: Avatar };
export type LockData = {
  len: 4 | 6;
  salt: string;
  hash: string; // hash ของรหัสผ่าน (ไม่เก็บรหัสจริง)
  rSalt: string;
  rHash: string; // hash ของรหัสกู้คืน
};
export type Data = {
  setupDone: boolean;
  budget: number;
  fixed: Fixed[];
  endDate: string; // yyyy-mm-dd (วันสุดท้ายของรอบ)
  txs: Tx[];
  quick: QuickItem[];
  profile: Profile | null;
  lang: Lang;
  font: string;
  lock: LockData | null; // รหัสผ่านเข้าแอป — null = ไม่ล็อก
  theme: string; // id สีธีม
  pattern: string; // id ลวดลายพื้นหลัง
  categories?: CustomCat[]; // ไม่มี = หมวดเริ่มต้น
  catBudgets?: Record<string, number>; // งบสูงสุดต่อหมวดต่อรอบ (id หมวด → บาท)
};
