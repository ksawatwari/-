"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Utensils,
  Coffee,
  Bus,
  ShoppingBasket,
  Wallet,
  Trash2,
  Pencil,
  Settings,
  Plus,
  X,
  Check,
  Flame,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  RotateCcw,
  // อาหาร
  UtensilsCrossed,
  Soup,
  Pizza,
  Sandwich,
  Salad,
  Egg,
  Beef,
  Fish,
  Drumstick,
  Cookie,
  Croissant,
  Cake,
  Apple,
  Banana,
  Cherry,
  Popcorn,
  Candy,
  Wheat,
  // เครื่องดื่ม
  CupSoda,
  Milk,
  Wine,
  Beer,
  GlassWater,
  Martini,
  Citrus,
  Droplet,
  Leaf,
  // เดินทาง
  BusFront,
  Car,
  CarTaxiFront,
  Bike,
  Train,
  TrainFront,
  Plane,
  Ship,
  Fuel,
  Footprints,
  TramFront,
  Truck,
  MapPin,
  // ของใช้/บ้าน
  ShoppingCart,
  ShoppingBag,
  Store,
  Package,
  Shirt,
  Gift,
  Home,
  Lamp,
  Bed,
  Bath,
  Sofa,
  Wrench,
  Hammer,
  Key,
  Brush,
  SprayCan,
  Droplets,
  // บิล/การเงิน
  CreditCard,
  Banknote,
  Coins,
  PiggyBank,
  Receipt,
  Zap,
  Wifi,
  Smartphone,
  Phone,
  Tv,
  Lightbulb,
  Plug,
  Landmark,
  // สุขภาพ/ชีวิต
  Pill,
  Stethoscope,
  HeartPulse,
  Dumbbell,
  Baby,
  PawPrint,
  Heart,
  Syringe,
  Smile,
  Scissors,
  // บันเทิง/งาน
  Gamepad2,
  Film,
  Music,
  Headphones,
  Book,
  BookOpen,
  GraduationCap,
  Briefcase,
  Laptop,
  Camera,
  Ticket,
  PartyPopper,
  Palette,
  Umbrella,
  Gem,
  Star,
} from "lucide-react";

/* ---------- Types ---------- */
type Fixed = { id: string; name: string; amount: number };
type Tx = {
  id: string;
  amount: number;
  category: string;
  note: string;
  dateKey: string;
  ts: number;
  icon?: string;
};
type QuickItem = {
  id: string;
  label: string;
  amount: number;
  category: string;
  icon: string;
};
type Data = {
  setupDone: boolean;
  budget: number;
  fixed: Fixed[];
  endDate: string; // yyyy-mm-dd (วันสุดท้ายของรอบ)
  txs: Tx[];
  quick: QuickItem[];
};

/* ---------- Constants ---------- */
const STORAGE_KEY = "survival-budget-v1";
const DEFAULT_BUDGET = 13623;

const CATEGORIES: { name: string; icon: React.ElementType }[] = [
  { name: "อาหาร", icon: Utensils },
  { name: "เครื่องดื่ม", icon: Coffee },
  { name: "เดินทาง", icon: Bus },
  { name: "ของใช้", icon: ShoppingBasket },
  { name: "อื่นๆ", icon: Wallet },
];

const DEFAULT_QUICK: QuickItem[] = [
  { id: "q1", label: "ค่าข้าว", amount: 50, category: "อาหาร", icon: "Utensils" },
  { id: "q2", label: "กาแฟ", amount: 40, category: "เครื่องดื่ม", icon: "Coffee" },
  { id: "q3", label: "เดินทาง", amount: 30, category: "เดินทาง", icon: "Bus" },
  { id: "q4", label: "ข้าว+น้ำ", amount: 70, category: "อาหาร", icon: "Utensils" },
];

// ไอคอนแบ่งตามหมวด + ชื่อแนะนำ [ชื่อ, ไอคอน]
const ICON_GROUPS: {
  name: string;
  icons: Record<string, React.ElementType>;
  presets: [string, string][];
}[] = [
  {
    name: "อาหาร",
    icons: {
      Utensils, UtensilsCrossed, Soup, Pizza, Sandwich, Salad, Egg, Beef, Fish,
      Drumstick, Cookie, Croissant, Cake, Apple, Banana, Cherry, Popcorn, Candy, Wheat,
    },
    presets: [
      ["ข้าวมันไก่", "Drumstick"], ["ก๋วยเตี๋ยว", "Soup"], ["ข้าวไข่เจียว", "Egg"],
      ["ส้มตำ", "Salad"], ["ข้าวหมูทอด", "Beef"], ["ข้าวปลา", "Fish"],
      ["แซนด์วิช", "Sandwich"], ["ขนม", "Cookie"], ["ผลไม้", "Apple"], ["ขนมปัง", "Croissant"],
    ],
  },
  {
    name: "เครื่องดื่ม",
    icons: { Coffee, CupSoda, Milk, Wine, Beer, GlassWater, Martini, Citrus, Droplet, Leaf },
    presets: [
      ["กาแฟ", "Coffee"], ["ชาเย็น", "CupSoda"], ["น้ำเปล่า", "GlassWater"],
      ["นม", "Milk"], ["น้ำผลไม้", "Citrus"], ["ชาเขียว", "Leaf"], ["เบียร์", "Beer"],
    ],
  },
  {
    name: "เดินทาง",
    icons: {
      Bus, BusFront, Car, CarTaxiFront, Bike, Train, TrainFront, Plane, Ship, Fuel,
      Footprints, TramFront, Truck, MapPin,
    },
    presets: [
      ["รถเมล์", "Bus"], ["BTS/MRT", "TrainFront"], ["แท็กซี่", "CarTaxiFront"],
      ["วินมอไซค์", "Bike"], ["น้ำมัน", "Fuel"], ["ทางด่วน", "Car"], ["เรือ", "Ship"],
    ],
  },
  {
    name: "ของใช้/บ้าน",
    icons: {
      ShoppingBasket, ShoppingCart, ShoppingBag, Store, Package, Shirt, Gift, Home,
      Lamp, Bed, Bath, Sofa, Wrench, Hammer, Key, Brush, SprayCan, Droplets,
    },
    presets: [
      ["ของใช้", "ShoppingBasket"], ["ซื้อของ", "ShoppingCart"], ["เสื้อผ้า", "Shirt"],
      ["ของขวัญ", "Gift"], ["ของใช้ทำความสะอาด", "SprayCan"], ["ซ่อมแซม", "Wrench"],
    ],
  },
  {
    name: "บิล/การเงิน",
    icons: {
      Wallet, CreditCard, Banknote, Coins, PiggyBank, Receipt, Zap, Wifi, Smartphone,
      Phone, Tv, Lightbulb, Plug, Landmark,
    },
    presets: [
      ["ค่าไฟ", "Zap"], ["ค่าเน็ต", "Wifi"], ["ค่าโทรศัพท์", "Smartphone"],
      ["ค่าน้ำ", "Droplet"], ["ผ่อนบัตร", "CreditCard"], ["ออมเงิน", "PiggyBank"],
    ],
  },
  {
    name: "สุขภาพ/ชีวิต",
    icons: {
      Pill, Stethoscope, HeartPulse, Dumbbell, Baby, PawPrint, Heart, Syringe, Smile, Scissors,
    },
    presets: [
      ["ยา", "Pill"], ["หาหมอ", "Stethoscope"], ["ฟิตเนส", "Dumbbell"],
      ["ของลูก", "Baby"], ["สัตว์เลี้ยง", "PawPrint"], ["ตัดผม", "Scissors"],
    ],
  },
  {
    name: "บันเทิง/งาน",
    icons: {
      Gamepad2, Film, Music, Headphones, Book, BookOpen, GraduationCap, Briefcase,
      Laptop, Camera, Ticket, PartyPopper, Palette, Umbrella, Gem, Star,
    },
    presets: [
      ["เกม", "Gamepad2"], ["ดูหนัง", "Film"], ["เพลง", "Music"],
      ["หนังสือ", "Book"], ["คอร์สเรียน", "GraduationCap"], ["ค่างาน", "Briefcase"],
    ],
  },
];

const ICONS: Record<string, React.ElementType> = Object.assign(
  {},
  ...ICON_GROUPS.map((g) => g.icons)
);

const DEFAULT_FIXED: Fixed[] = [
  { id: "f1", name: "ค่าห้อง", amount: 0 },
  { id: "f2", name: "ค่าเดินทางฟิกซ์", amount: 0 },
  { id: "f3", name: "ค่าน้ำ/ค่าไฟ", amount: 0 },
  { id: "f4", name: "ค่าเน็ต", amount: 0 },
];

/* ---------- Helpers ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const diffDays = (a: Date, b: Date) =>
  Math.round(
    (Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
      Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) /
      86400000
  );
const monthEndKey = (d: Date) =>
  toKey(new Date(d.getFullYear(), d.getMonth() + 1, 0));
const fmt = (n: number) =>
  Math.round(n).toLocaleString("th-TH", { maximumFractionDigits: 0 });
const uid = () => Math.random().toString(36).slice(2, 10);

const defaultData = (): Data => ({
  setupDone: false,
  budget: DEFAULT_BUDGET,
  fixed: DEFAULT_FIXED,
  endDate: monthEndKey(new Date()),
  txs: [],
  quick: DEFAULT_QUICK,
});

/* ---------- Page ---------- */
export default function Page() {
  const [data, setData] = useState<Data>(defaultData);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());
  const [editingSetup, setEditingSetup] = useState(false);

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData({ ...defaultData(), ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  // save
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data, loaded]);

  // อัปเดตเวลาทุกนาที เพื่อให้ข้ามวันแล้วคำนวณใหม่อัตโนมัติ
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  if (!loaded) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (!data.setupDone || editingSetup) {
    return (
      <Setup
        data={data}
        now={now}
        isEdit={data.setupDone}
        onCancel={() => setEditingSetup(false)}
        onSave={(next) => {
          setData(next);
          setEditingSetup(false);
        }}
      />
    );
  }

  return (
    <Dashboard
      data={data}
      setData={setData}
      now={now}
      onOpenSetup={() => setEditingSetup(true)}
    />
  );
}

/* ---------- Setup ---------- */
function Setup({
  data,
  now,
  isEdit,
  onSave,
  onCancel,
}: {
  data: Data;
  now: Date;
  isEdit: boolean;
  onSave: (d: Data) => void;
  onCancel: () => void;
}) {
  const todayKey = toKey(now);
  const defaultDaysLeft = Math.max(
    1,
    diffDays(now, fromKey(data.endDate)) + 1
  );

  const [budget, setBudget] = useState(String(data.budget));
  const [fixed, setFixed] = useState<{ id: string; name: string; amount: string }[]>(
    data.fixed.map((f) => ({ ...f, amount: f.amount ? String(f.amount) : "" }))
  );
  const [days, setDays] = useState(
    String(isEdit ? defaultDaysLeft : Math.max(1, diffDays(now, fromKey(monthEndKey(now))) + 1))
  );

  const budgetNum = Number(budget) || 0;
  const fixedTotal = fixed.reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const net = budgetNum - fixedTotal;
  const daysNum = Math.max(1, Math.floor(Number(days) || 1));
  const perDay = net / daysNum;

  const submit = () => {
    if (budgetNum <= 0) return alert("กรุณาใส่งบตั้งต้น");
    onSave({
      ...data,
      setupDone: true,
      budget: budgetNum,
      fixed: fixed
        .filter((f) => f.name.trim() || Number(f.amount))
        .map((f) => ({ id: f.id, name: f.name.trim() || "ค่าใช้จ่าย", amount: Number(f.amount) || 0 })),
      endDate: toKey(addDays(fromKey(todayKey), daysNum - 1)),
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <div className="mx-auto max-w-md px-4 pt-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {isEdit ? "ตั้งค่างบประมาณ" : "ตั้งค่าเริ่มต้น"}
            </h1>
            <p className="text-sm text-slate-500">Survival Mode · Daily Safe-to-Spend</p>
          </div>
        </div>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            งบตั้งต้นประจำเดือน (บาท)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-2xl font-bold text-slate-800 outline-none focus:border-emerald-500"
          />
        </section>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-600">ค่าใช้จ่ายคงที่</h2>
            <span className="text-sm font-semibold text-rose-500">−{fmt(fixedTotal)}</span>
          </div>
          <div className="space-y-2">
            {fixed.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                <input
                  value={f.name}
                  placeholder="ชื่อรายการ"
                  onChange={(e) =>
                    setFixed((arr) => arr.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                  }
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 text-base outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  inputMode="decimal"
                  value={f.amount}
                  placeholder="0"
                  onChange={(e) =>
                    setFixed((arr) => arr.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))
                  }
                  className="w-28 rounded-xl border border-slate-200 px-3 py-3 text-right text-base outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => setFixed((arr) => arr.filter((_, j) => j !== i))}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 active:bg-slate-100"
                  aria-label="ลบ"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setFixed((arr) => [...arr, { id: uid(), name: "", amount: "" }])}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 active:bg-slate-50"
          >
            <Plus size={16} /> เพิ่มรายการ
          </button>
        </section>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            จำนวนวันที่เหลือ (รวมวันนี้)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-28 rounded-xl border border-slate-200 px-4 py-3 text-xl font-bold outline-none focus:border-emerald-500"
            />
            <button
              onClick={() =>
                setDays(String(Math.max(1, diffDays(now, fromKey(monthEndKey(now))) + 1)))
              }
              className="rounded-xl bg-slate-100 px-3 py-3 text-sm font-medium text-slate-600 active:bg-slate-200"
            >
              ถึงสิ้นเดือน
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            ระบบคำนวณจากวันที่จริงให้อัตโนมัติ แก้ไขเองได้ถ้ารอบของคุณไม่ตรงสิ้นเดือน
          </p>
        </section>

        <section className="mb-6 rounded-2xl bg-emerald-50 p-4">
          <div className="flex justify-between text-sm text-emerald-800">
            <span>เงินใช้จ่ายจริง (Net)</span>
            <b>{fmt(net)} บาท</b>
          </div>
          <div className="mt-1 flex justify-between text-sm text-emerald-800">
            <span>ใช้ได้วันละประมาณ</span>
            <b>{fmt(Math.max(0, perDay))} บาท</b>
          </div>
          {net < 0 && (
            <p className="mt-2 text-xs text-rose-600">ค่าใช้จ่ายคงที่เกินงบตั้งต้น กรุณาตรวจสอบ</p>
          )}
        </section>

        <div className="flex gap-3">
          {isEdit && (
            <button
              onClick={onCancel}
              className="flex-1 rounded-2xl bg-slate-200 py-4 text-base font-semibold text-slate-700 active:bg-slate-300"
            >
              ยกเลิก
            </button>
          )}
          <button
            onClick={submit}
            className="flex-[2] rounded-2xl bg-emerald-500 py-4 text-base font-bold text-white active:bg-emerald-600"
          >
            {isEdit ? "บันทึก" : "เริ่มใช้งาน"}
          </button>
        </div>
      </div>
    </main>
  );
}

/* ---------- Quick Button Editor ---------- */
function QuickEditor({
  item,
  isNew,
  onSave,
  onDelete,
  onClose,
}: {
  item: QuickItem;
  isNew: boolean;
  onSave: (q: QuickItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(item.label);
  const [amountStr, setAmountStr] = useState(item.amount ? String(item.amount) : "");
  const [category, setCategory] = useState(item.category);
  const [icon, setIcon] = useState(item.icon);
  const [g, setG] = useState(() => {
    const i = ICON_GROUPS.findIndex((x) => item.icon in x.icons);
    return i >= 0 ? i : 0;
  });

  const group = ICON_GROUPS[g];
  const Preview = ICONS[icon] ?? Wallet;
  const amountNum = Number(amountStr);
  const canSave = label.trim().length > 0 && amountNum > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="mx-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {isNew ? "เพิ่มปุ่มบันทึกด่วน" : "แก้ไขปุ่มบันทึกด่วน"}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400" aria-label="ปิด">
            <X size={20} />
          </button>
        </div>

        {/* Preview */}
        <div className="mb-4 flex h-16 items-center justify-between rounded-2xl bg-slate-100 px-4">
          <span className="flex min-w-0 items-center gap-2 text-slate-700">
            <Preview size={20} className="shrink-0" />
            <span className="truncate font-medium">{label || "ชื่อรายการ"}</span>
          </span>
          <span className="ml-2 font-bold text-slate-800">{amountNum > 0 ? fmt(amountNum) : "0"}</span>
        </div>

        <div className="mb-3 flex gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="ชื่อรายการ"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            inputMode="decimal"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder="บาท"
            className="w-24 rounded-xl border border-slate-200 px-3 py-3 text-right text-lg font-bold outline-none focus:border-emerald-500"
          />
        </div>

        <p className="mb-1 text-xs font-medium text-slate-500">หมวดหมู่รายจ่าย</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.name}
              onClick={() => setCategory(c.name)}
              className={`rounded-full px-3 py-2 text-sm ${
                category === c.name ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <p className="mb-1 text-xs font-medium text-slate-500">เลือกโลโก้ (แยกตามหมวด)</p>
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {ICON_GROUPS.map((x, i) => (
            <button
              key={x.name}
              onClick={() => setG(i)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-sm ${
                g === i ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {x.name}
            </button>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {group.presets.map(([name, key]) => (
            <button
              key={name}
              onClick={() => {
                setLabel(name);
                setIcon(key);
              }}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 active:bg-emerald-50"
            >
              {name}
            </button>
          ))}
        </div>

        <div className="mb-5 grid grid-cols-6 gap-2">
          {Object.entries(group.icons).map(([key, Ic]) => (
            <button
              key={key}
              onClick={() => setIcon(key)}
              aria-label={key}
              className={`flex h-12 items-center justify-center rounded-xl ${
                icon === key ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              <Ic size={20} />
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          {!isNew && (
            <button
              onClick={() => onDelete(item.id)}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 active:bg-rose-100"
              aria-label="ลบปุ่ม"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button
            disabled={!canSave}
            onClick={() =>
              onSave({ id: item.id, label: label.trim(), amount: amountNum, category, icon })
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-bold text-white active:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Check size={18} /> บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard({
  data,
  setData,
  now,
  onOpenSetup,
}: {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  now: Date;
  onOpenSetup: () => void;
}) {
  const todayKey = toKey(now);

  const calc = useMemo(() => {
    const fixedTotal = data.fixed.reduce((s, f) => s + f.amount, 0);
    const net = data.budget - fixedTotal;
    const spentTotal = data.txs.reduce((s, t) => s + t.amount, 0);
    const spentToday = data.txs
      .filter((t) => t.dateKey === todayKey)
      .reduce((s, t) => s + t.amount, 0);
    const spentBeforeToday = spentTotal - spentToday;

    const rawDays = diffDays(now, fromKey(data.endDate)) + 1;
    const expired = rawDays < 1;
    const daysLeft = Math.max(1, rawDays);

    // งบที่เหลือ ณ เช้าวันนี้ ÷ จำนวนวันที่เหลือ (รวมวันนี้)
    // ใช้ไม่หมดเมื่อวาน → ยอดทบเข้ามาเอง / ใช้เกิน → โควตาลดลงเอง
    const allowanceToday = (net - spentBeforeToday) / daysLeft;
    const remainingToday = allowanceToday - spentToday;
    const remainingNet = net - spentTotal;
    const tomorrow = daysLeft > 1 ? remainingNet / (daysLeft - 1) : 0;
    const pct = net > 0 ? (remainingNet / net) * 100 : 0;

    return {
      net,
      spentTotal,
      spentToday,
      daysLeft,
      expired,
      allowanceToday,
      remainingToday,
      remainingNet,
      tomorrow,
      pct,
    };
  }, [data, now, todayKey]);

  const zone: "green" | "yellow" | "red" =
    calc.pct > 60 ? "green" : calc.pct >= 25 ? "yellow" : "red";

  const zoneStyle = {
    green: { bar: "bg-emerald-500", text: "text-emerald-600", label: "🟢 ปลอดภัย", bg: "bg-emerald-50" },
    yellow: { bar: "bg-amber-400", text: "text-amber-600", label: "🟡 ระวัง", bg: "bg-amber-50" },
    red: { bar: "bg-rose-500", text: "text-rose-600", label: "🔴 Survival Mode", bg: "bg-rose-50" },
  }[zone];

  const showSurvival = zone === "red" || calc.daysLeft <= 5;

  // Quick log
  const addTx = (amount: number, category: string, note = "", icon?: string) => {
    if (!(amount > 0)) return;
    const tx: Tx = {
      id: uid(),
      amount,
      category,
      note,
      dateKey: todayKey,
      ts: Date.now(),
      icon,
    };
    setData((d) => ({ ...d, txs: [tx, ...d.txs] }));
  };

  const [amountStr, setAmountStr] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [note, setNote] = useState("");

  const submitCustom = () => {
    const n = Number(amountStr);
    if (!(n > 0)) return;
    addTx(n, category, note.trim());
    setAmountStr("");
    setNote("");
  };

  // Quick button customization
  const [quickEdit, setQuickEdit] = useState(false);
  const [qEditor, setQEditor] = useState<{ item: QuickItem; isNew: boolean } | null>(null);

  const saveQuick = (q: QuickItem) => {
    setData((d) => {
      const exists = d.quick.some((x) => x.id === q.id);
      return {
        ...d,
        quick: exists ? d.quick.map((x) => (x.id === q.id ? q : x)) : [...d.quick, q],
      };
    });
    setQEditor(null);
  };
  const deleteQuick = (id: string) => {
    setData((d) => ({ ...d, quick: d.quick.filter((x) => x.id !== id) }));
    setQEditor(null);
  };

  // Edit
  const [editing, setEditing] = useState<Tx | null>(null);
  const [eAmount, setEAmount] = useState("");
  const [eCat, setECat] = useState(CATEGORIES[0].name);
  const [eNote, setENote] = useState("");

  const openEdit = (t: Tx) => {
    setEditing(t);
    setEAmount(String(t.amount));
    setECat(t.category);
    setENote(t.note);
  };
  const saveEdit = () => {
    const n = Number(eAmount);
    if (!editing || !(n > 0)) return;
    setData((d) => ({
      ...d,
      txs: d.txs.map((t) =>
        t.id === editing.id ? { ...t, amount: n, category: eCat, note: eNote.trim() } : t
      ),
    }));
    setEditing(null);
  };
  const removeTx = (id: string) =>
    setData((d) => ({ ...d, txs: d.txs.filter((t) => t.id !== id) }));

  const resetAll = () => {
    if (!confirm("เริ่มรอบใหม่? ประวัติรายจ่ายทั้งหมดจะถูกลบ")) return;
    setData({
      ...defaultData(),
      setupDone: false,
      budget: data.budget,
      fixed: data.fixed,
      quick: data.quick,
    });
  };

  const recent = data.txs.slice(0, 20);
  const catIcon = (name: string) => CATEGORIES.find((c) => c.name === name)?.icon ?? Wallet;

  const perMeal = Math.max(0, calc.allowanceToday) / 3;
  const perMealLeft = Math.max(0, calc.remainingToday) / 3;
  const barWidth = Math.max(0, Math.min(100, calc.pct));

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">
              {now.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="text-lg font-bold text-slate-800">เหลืออีก {calc.daysLeft} วัน</h1>
          </div>
          <button
            onClick={onOpenSetup}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm active:bg-slate-100"
            aria-label="ตั้งค่า"
          >
            <Settings size={20} />
          </button>
        </header>

        {calc.expired && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>
              รอบที่ตั้งไว้สิ้นสุดแล้ว กด <b>ตั้งค่า</b> หรือ <b>เริ่มรอบใหม่</b> ด้านล่างเพื่อเริ่มรอบถัดไป
            </span>
          </div>
        )}

        {/* Safe to spend */}
        <section className={`mb-4 rounded-3xl p-5 shadow-sm ${zoneStyle.bg}`}>
          <p className="text-sm font-medium text-slate-500">ใช้ได้อีกวันนี้ (Safe-to-Spend)</p>
          <p className={`mt-1 text-5xl font-extrabold tracking-tight ${calc.remainingToday < 0 ? "text-rose-600" : zoneStyle.text}`}>
            {calc.remainingToday < 0 ? "−" : ""}฿{fmt(Math.abs(calc.remainingToday))}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            งบวันนี้ ฿{fmt(Math.max(0, calc.allowanceToday))} · ใช้ไปแล้ว ฿{fmt(calc.spentToday)}
          </p>
          {calc.daysLeft > 1 && (
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <TrendingUp size={14} />
              พรุ่งนี้จะได้วันละ ฿{fmt(Math.max(0, calc.tomorrow))}
              {calc.remainingToday > 0 && " (รวมยอดทบแล้ว)"}
              {calc.remainingToday < 0 && " (ถูกหักจากส่วนที่ใช้เกิน)"}
            </p>
          )}
        </section>

        {/* Survival bar */}
        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className={`font-semibold ${zoneStyle.text}`}>{zoneStyle.label}</span>
            <span className="text-slate-500">{Math.max(0, Math.round(calc.pct))}%</span>
          </div>
          <div className="relative h-5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${zoneStyle.bar}`}
              style={{ width: `${barWidth}%` }}
            />
            <div className="absolute inset-y-0 left-[25%] w-px bg-white/80" />
            <div className="absolute inset-y-0 left-[60%] w-px bg-white/80" />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>เหลือ ฿{fmt(calc.remainingNet)}</span>
            <span>จาก ฿{fmt(calc.net)}</span>
          </div>
        </section>

        {/* Survival insights */}
        {showSurvival && (
          <section className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="mb-1 flex items-center gap-2 font-semibold text-rose-700">
              <Flame size={18} /> โหมดกู้วิกฤต
            </div>
            <p className="text-sm text-rose-800">
              เหลือวันละ <b>฿{fmt(Math.max(0, calc.allowanceToday))}</b> ➔ มื้อละ{" "}
              <b>฿{fmt(perMeal)}</b>
            </p>
            <p className="mt-1 text-xs text-rose-700">
              วันนี้ที่เหลือ ฿{fmt(Math.max(0, calc.remainingToday))} ≈ มื้อละ ฿{fmt(perMealLeft)} (แบ่ง 3 มื้อ)
            </p>
            {calc.remainingNet < 0 && (
              <p className="mt-1 text-xs font-semibold text-rose-700">
                ใช้เกินงบรวมแล้ว ฿{fmt(Math.abs(calc.remainingNet))}
              </p>
            )}
          </section>
        )}

        {/* Quick log */}
        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-600">
              {quickEdit ? "แตะปุ่มเพื่อแก้ไข" : "บันทึกด่วน (แตะครั้งเดียว)"}
            </h2>
            <button
              onClick={() => setQuickEdit((v) => !v)}
              className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium ${
                quickEdit ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {quickEdit ? <Check size={14} /> : <Pencil size={14} />}
              {quickEdit ? "เสร็จ" : "ปรับแต่ง"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {data.quick.map((q) => {
              const Icon = ICONS[q.icon] ?? Wallet;
              return (
                <button
                  key={q.id}
                  onClick={() =>
                    quickEdit
                      ? setQEditor({ item: q, isNew: false })
                      : addTx(q.amount, q.category, q.label, q.icon)
                  }
                  className={`flex h-16 items-center justify-between rounded-2xl px-4 text-left active:scale-95 ${
                    quickEdit
                      ? "border-2 border-dashed border-emerald-300 bg-emerald-50"
                      : "bg-slate-100 active:bg-emerald-100"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2 text-slate-700">
                    <Icon size={20} className="shrink-0" />
                    <span className="truncate font-medium">{q.label}</span>
                  </span>
                  <span className="ml-2 font-bold text-slate-800">{fmt(q.amount)}</span>
                </button>
              );
            })}
            {quickEdit && (
              <button
                onClick={() =>
                  setQEditor({
                    item: { id: uid(), label: "", amount: 0, category: CATEGORIES[0].name, icon: "Utensils" },
                    isNew: true,
                  })
                }
                className="flex h-16 items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 active:bg-slate-50"
              >
                <Plus size={18} /> เพิ่มปุ่ม
              </button>
            )}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const active = category === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => setCategory(c.name)}
                    className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm ${
                      active ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon size={14} /> {c.name}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitCustom()}
                placeholder="จำนวนเงิน"
                className="w-32 rounded-xl border border-slate-200 px-3 py-3 text-lg font-bold outline-none focus:border-emerald-500"
              />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitCustom()}
                placeholder="โน้ต (ไม่บังคับ)"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={submitCustom}
              disabled={!(Number(amountStr) > 0)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-base font-bold text-white active:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Plus size={20} /> บันทึกรายจ่าย
            </button>
          </div>
        </section>

        {/* Recent */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-medium text-slate-600">รายการล่าสุด</h2>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">ยังไม่มีรายการ</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((t) => {
                const Icon = (t.icon && ICONS[t.icon]) || catIcon(t.category);
                const isToday = t.dateKey === todayKey;
                return (
                  <li key={t.id} className="flex items-center gap-3 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {t.note || t.category}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isToday ? "วันนี้" : fromKey(t.dateKey).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}{" "}
                        · {new Date(t.ts).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} · {t.category}
                      </p>
                    </div>
                    <span className="font-bold text-slate-800">−{fmt(t.amount)}</span>
                    <button
                      onClick={() => openEdit(t)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 active:bg-slate-100"
                      aria-label="แก้ไข"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => removeTx(t.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-rose-400 active:bg-rose-50"
                      aria-label="ลบ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <button
          onClick={resetAll}
          className="mx-auto mt-6 flex items-center gap-1 text-xs text-slate-400 active:text-slate-600"
        >
          <RotateCcw size={12} /> เริ่มรอบใหม่
        </button>
      </div>

      {qEditor && (
        <QuickEditor
          key={qEditor.item.id}
          item={qEditor.item}
          isNew={qEditor.isNew}
          onSave={saveQuick}
          onDelete={deleteQuick}
          onClose={() => setQEditor(null)}
        />
      )}

      {/* Edit sheet */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setEditing(null)}>
          <div
            className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">แก้ไขรายการ</h3>
              <button onClick={() => setEditing(null)} className="p-2 text-slate-400" aria-label="ปิด">
                <X size={20} />
              </button>
            </div>
            <input
              type="number"
              inputMode="decimal"
              value={eAmount}
              onChange={(e) => setEAmount(e.target.value)}
              className="mb-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-2xl font-bold outline-none focus:border-emerald-500"
            />
            <div className="mb-3 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setECat(c.name)}
                  className={`rounded-full px-3 py-2 text-sm ${
                    eCat === c.name ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <input
              value={eNote}
              onChange={(e) => setENote(e.target.value)}
              placeholder="โน้ต"
              className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
            />
            <button
              onClick={saveEdit}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-bold text-white active:bg-emerald-600"
            >
              <Check size={18} /> บันทึกการแก้ไข
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
