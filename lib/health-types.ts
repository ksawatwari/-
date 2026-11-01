// ชนิดข้อมูลของโมดูลสุขภาพ (เก็บใน Data.health)
export type Sex = "male" | "female";
export type Activity = "sedentary" | "light" | "moderate" | "active" | "very";
export type Goal = "lose" | "maintain" | "gain" | "muscle";
export type Meal = "breakfast" | "lunch" | "dinner" | "snack";

export type BodyProfile = {
  sex: Sex;
  age: number; // อายุ ณ ปี ageYear
  ageYear: number; // ปี ค.ศ. ที่กรอกอายุ (ใช้คำนวณอายุปัจจุบันเมื่อเวลาผ่านไป)
  heightCm: number;
  weightKg: number;
  waistCm?: number;
  activity: Activity;
  goal: Goal;
  targetKg?: number;
  pace: number; // กก./สัปดาห์ ที่ต้องการลด/เพิ่ม (ใช้กับ lose/gain)
};

// ค่าที่ผู้ใช้ตั้งเอง ทับค่าที่ระบบคำนวณให้ — ไม่ใส่ = ใช้ค่าอัตโนมัติ
export type Quotas = {
  kcal?: number; // แคลอรี่ต่อวัน (เป้า)
  protein?: number; // โปรตีนขั้นต่ำ (g)
  carb?: number; // คาร์บ (g)
  fat?: number; // ไขมัน (g)
  sugar?: number; // น้ำตาลไม่เกิน (g)
  sodium?: number; // โซเดียมไม่เกิน (mg)
  fiber?: number; // ใยอาหารขั้นต่ำ (g)
  water?: number; // น้ำดื่มขั้นต่ำ (ml)
};

// ตัวนับโควตา เช่น "เครื่องดื่มหวาน ไม่เกินวันละ 1 แก้ว" — กดปุ่ม +1 จะสร้างรายการอาหารพร้อมสารอาหารต่อหน่วย
export type Counter = {
  id: string;
  name: string;
  unit: string;
  max: number;
  kcal: number; // ต่อ 1 หน่วย
  sugar: number; // g ต่อ 1 หน่วย
  icon: string; // key ใน ICONS
};

export type Nutrients = {
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  sugar: number;
  fiber: number;
  sodium: number; // mg
};

export type FoodEntry = Nutrients & {
  id: string;
  dateKey: string;
  ts: number;
  meal: Meal;
  name: string;
  qty?: string;
  counts?: Record<string, number>; // counterId → จำนวนหน่วยที่รายการนี้นับ
  source: "manual" | "preset" | "ai";
  ingredients?: { name: string; amount: string }[]; // ส่วนผสม (AI จะเติมในขั้น 7b)
};

export type WeightEntry = { dateKey: string; kg: number };

export type HealthData = {
  body: BodyProfile | null;
  quotas: Quotas;
  counters: Counter[];
  foods: FoodEntry[];
  weights: WeightEntry[];
  water: Record<string, number>; // dateKey → ml
};
