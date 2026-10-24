"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  User,
  ImagePlus,
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
type Avatar =
  | { kind: "default" }
  | { kind: "preset"; key: string }
  | { kind: "photo"; src: string };
type Profile = { name: string; avatar: Avatar };
type Data = {
  setupDone: boolean;
  budget: number;
  fixed: Fixed[];
  endDate: string; // yyyy-mm-dd (วันสุดท้ายของรอบ)
  txs: Tx[];
  quick: QuickItem[];
  profile: Profile | null;
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
  profile: null,
});

/* ---------- Page ---------- */
export default function Page() {
  const [data, setData] = useState<Data>(defaultData);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());
  const [editingSetup, setEditingSetup] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

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

  if (!data.profile || editingProfile) {
    return (
      <ProfileScreen
        initial={data.profile}
        isEdit={!!data.profile}
        onCancel={() => setEditingProfile(false)}
        onSave={(p) => {
          setData((d) => ({ ...d, profile: p }));
          setEditingProfile(false);
        }}
      />
    );
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
      onOpenProfile={() => setEditingProfile(true)}
    />
  );
}

/* ---------- Profile ---------- */
const FONT = "font-[family-name:var(--font-anuphan)]";

const Face = ({ y = 36, smile = true }: { y?: number; smile?: boolean }) => (
  <>
    <circle cx="25" cy={y} r="2.3" fill="#374151" />
    <circle cx="39" cy={y} r="2.3" fill="#374151" />
    <circle cx="20" cy={y + 6} r="3.2" fill="#F9A8D4" opacity="0.6" />
    <circle cx="44" cy={y + 6} r="3.2" fill="#F9A8D4" opacity="0.6" />
    {smile && (
      <path
        d={`M29 ${y + 8} Q32 ${y + 11} 35 ${y + 8}`}
        stroke="#374151"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    )}
  </>
);

const AVATARS: { key: string; bg: string; art: React.ReactNode }[] = [
  {
    key: "cat",
    bg: "#FDE68A",
    art: (
      <>
        <polygon points="14,28 17,8 30,20" fill="#FDBA74" />
        <polygon points="50,28 47,8 34,20" fill="#FDBA74" />
        <polygon points="18,24 19,13 26,20" fill="#FBCFE8" />
        <polygon points="46,24 45,13 38,20" fill="#FBCFE8" />
        <circle cx="32" cy="36" r="20" fill="#FDBA74" />
        <Face smile={false} />
        <polygon points="30,40 34,40 32,42.5" fill="#F472B6" />
        <path
          d="M32 42.5 Q29 46 26.5 44.5 M32 42.5 Q35 46 37.5 44.5"
          stroke="#374151"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    key: "dog",
    bg: "#BAE6FD",
    art: (
      <>
        <ellipse cx="14" cy="34" rx="6" ry="13" fill="#A16207" transform="rotate(12 14 34)" />
        <ellipse cx="50" cy="34" rx="6" ry="13" fill="#A16207" transform="rotate(-12 50 34)" />
        <circle cx="32" cy="36" r="19" fill="#FDE6C4" />
        <Face smile={false} />
        <ellipse cx="32" cy="41" rx="3.6" ry="2.6" fill="#374151" />
        <path
          d="M32 43.5 V46 M32 46 Q29.5 48.5 27.5 46.5 M32 46 Q34.5 48.5 36.5 46.5"
          stroke="#374151"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    key: "bunny",
    bg: "#FBCFE8",
    art: (
      <>
        <ellipse cx="23" cy="15" rx="5.5" ry="13" fill="#fff" />
        <ellipse cx="41" cy="15" rx="5.5" ry="13" fill="#fff" />
        <ellipse cx="23" cy="16" rx="2.8" ry="9" fill="#F9A8D4" />
        <ellipse cx="41" cy="16" rx="2.8" ry="9" fill="#F9A8D4" />
        <circle cx="32" cy="40" r="18" fill="#fff" />
        <Face y={40} />
        <ellipse cx="32" cy="44" rx="2" ry="1.4" fill="#F472B6" />
      </>
    ),
  },
  {
    key: "bear",
    bg: "#FED7AA",
    art: (
      <>
        <circle cx="16" cy="21" r="7.5" fill="#92400E" />
        <circle cx="48" cy="21" r="7.5" fill="#92400E" />
        <circle cx="16" cy="21" r="4" fill="#D6A77A" />
        <circle cx="48" cy="21" r="4" fill="#D6A77A" />
        <circle cx="32" cy="36" r="20" fill="#C08457" />
        <ellipse cx="32" cy="43" rx="9" ry="7" fill="#F3DDBF" />
        <Face smile={false} />
        <ellipse cx="32" cy="41" rx="3.2" ry="2.4" fill="#374151" />
        <path
          d="M32 43.5 V46 M32 46 Q29.5 48 28 46.5 M32 46 Q34.5 48 36 46.5"
          stroke="#374151"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    key: "panda",
    bg: "#D1FAE5",
    art: (
      <>
        <circle cx="15" cy="20" r="7" fill="#1F2937" />
        <circle cx="49" cy="20" r="7" fill="#1F2937" />
        <circle cx="32" cy="36" r="20" fill="#fff" />
        <ellipse cx="24" cy="34" rx="5" ry="6.5" fill="#1F2937" transform="rotate(20 24 34)" />
        <ellipse cx="40" cy="34" rx="5" ry="6.5" fill="#1F2937" transform="rotate(-20 40 34)" />
        <circle cx="24.5" cy="34" r="2" fill="#fff" />
        <circle cx="39.5" cy="34" r="2" fill="#fff" />
        <ellipse cx="32" cy="42" rx="3" ry="2.2" fill="#1F2937" />
        <path d="M29 46 Q32 49 35 46" stroke="#1F2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="19" cy="44" r="3" fill="#F9A8D4" opacity="0.7" />
        <circle cx="45" cy="44" r="3" fill="#F9A8D4" opacity="0.7" />
      </>
    ),
  },
  {
    key: "penguin",
    bg: "#BFDBFE",
    art: (
      <>
        <ellipse cx="32" cy="38" rx="19" ry="22" fill="#1F2937" />
        <ellipse cx="32" cy="41" rx="13" ry="17" fill="#fff" />
        <circle cx="26" cy="33" r="2.2" fill="#374151" />
        <circle cx="38" cy="33" r="2.2" fill="#374151" />
        <circle cx="21.5" cy="39" r="3" fill="#F9A8D4" opacity="0.6" />
        <circle cx="42.5" cy="39" r="3" fill="#F9A8D4" opacity="0.6" />
        <polygon points="28.5,37 35.5,37 32,42 " fill="#FB923C" />
      </>
    ),
  },
  {
    key: "chick",
    bg: "#FEF9C3",
    art: (
      <>
        <path
          d="M28 17 Q29 9 32 15 Q34 8 37 17"
          fill="#FDE047"
          stroke="#FDE047"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="37" r="21" fill="#FDE047" />
        <ellipse cx="12" cy="42" rx="3.5" ry="6" fill="#FACC15" transform="rotate(15 12 42)" />
        <ellipse cx="52" cy="42" rx="3.5" ry="6" fill="#FACC15" transform="rotate(-15 52 42)" />
        <Face y={34} smile={false} />
        <polygon points="28.5,39 35.5,39 32,44" fill="#FB923C" />
      </>
    ),
  },
  {
    key: "fox",
    bg: "#FFEDD5",
    art: (
      <>
        <polygon points="12,30 14,8 29,19" fill="#FB923C" />
        <polygon points="52,30 50,8 35,19" fill="#FB923C" />
        <polygon points="16,24 17,14 24,20" fill="#1F2937" />
        <polygon points="48,24 47,14 40,20" fill="#1F2937" />
        <circle cx="32" cy="36" r="20" fill="#FB923C" />
        <polygon points="13,37 32,57 51,37 32,43" fill="#fff" />
        <Face y={35} smile={false} />
        <circle cx="32" cy="51" r="2.3" fill="#1F2937" />
      </>
    ),
  },
  {
    key: "frog",
    bg: "#D9F99D",
    art: (
      <>
        <ellipse cx="32" cy="40" rx="22" ry="17" fill="#4ADE80" />
        <circle cx="21" cy="24" r="9" fill="#4ADE80" />
        <circle cx="43" cy="24" r="9" fill="#4ADE80" />
        <circle cx="21" cy="24" r="5.5" fill="#fff" />
        <circle cx="43" cy="24" r="5.5" fill="#fff" />
        <circle cx="21.5" cy="24.5" r="2.7" fill="#1F2937" />
        <circle cx="42.5" cy="24.5" r="2.7" fill="#1F2937" />
        <path d="M22 42 Q32 52 42 42" stroke="#166534" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="16" cy="41" r="3.2" fill="#F9A8D4" opacity="0.7" />
        <circle cx="48" cy="41" r="3.2" fill="#F9A8D4" opacity="0.7" />
      </>
    ),
  },
  {
    key: "kid",
    bg: "#E0E7FF",
    art: (
      <>
        <ellipse cx="32" cy="64" rx="22" ry="14" fill="#A5B4FC" />
        <circle cx="32" cy="30" r="15" fill="#5B3A29" />
        <rect x="18" y="30" width="28" height="20" rx="10" fill="#5B3A29" />
        <circle cx="32" cy="34" r="12" fill="#FDE2C8" />
        <path d="M19 32 Q20 19 32 19 Q44 19 45 32 Q38 25 32 26 Q25 25 19 32Z" fill="#5B3A29" />
        <circle cx="27" cy="35" r="1.9" fill="#374151" />
        <circle cx="37" cy="35" r="1.9" fill="#374151" />
        <circle cx="23.5" cy="40" r="2.5" fill="#F9A8D4" opacity="0.6" />
        <circle cx="40.5" cy="40" r="2.5" fill="#F9A8D4" opacity="0.6" />
        <path d="M30 41 Q32 43 34 41" stroke="#374151" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </>
    ),
  },
];

function AvatarView({ avatar, className = "" }: { avatar: Avatar; className?: string }) {
  let inner: React.ReactNode;
  if (avatar.kind === "photo") {
    // eslint-disable-next-line @next/next/no-img-element
    inner = <img src={avatar.src} alt="" className="h-full w-full object-cover" />;
  } else if (avatar.kind === "preset") {
    const a = AVATARS.find((x) => x.key === avatar.key);
    inner = a ? (
      <svg viewBox="0 0 64 64" className="h-full w-full">
        <rect width="64" height="64" fill={a.bg} />
        {a.art}
      </svg>
    ) : (
      <User className="h-1/2 w-1/2 text-slate-300" strokeWidth={1.75} />
    );
  } else {
    inner = <User className="h-1/2 w-1/2 text-slate-300" strokeWidth={1.75} />;
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ${className}`}
    >
      {inner}
    </div>
  );
}

function resizeImage(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("image"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        const s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function ProfileScreen({
  initial,
  isEdit,
  onSave,
  onCancel,
}: {
  initial: Profile | null;
  isEdit: boolean;
  onSave: (p: Profile) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [avatar, setAvatar] = useState<Avatar>(initial?.avatar ?? { kind: "default" });
  const [picking, setPicking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canSave = name.trim().length > 0;
  const submit = () => {
    if (!canSave) return;
    onSave({ name: name.trim(), avatar });
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const src = await resizeImage(f);
      setAvatar({ kind: "photo", src });
    } catch {
      alert("เปิดรูปนี้ไม่ได้ ลองเลือกรูปอื่น (JPG/PNG)");
    }
  };

  return (
    <main
      className={`flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-slate-50 px-4 py-8 ${FONT}`}
    >
      <div className="w-full max-w-sm rounded-[2rem] bg-white p-7 shadow-xl">
        <h1 className="mb-6 text-center text-lg font-semibold text-slate-700">
          {isEdit ? "แก้ไขโปรไฟล์" : "สร้างโปรไฟล์ของคุณ"}
        </h1>

        <div className="relative mx-auto h-36 w-36">
          <AvatarView
            avatar={avatar}
            className="h-36 w-36 border-4 border-white shadow-lg ring-1 ring-slate-100"
          />
          <button
            onClick={() => setPicking((v) => !v)}
            aria-label="เปลี่ยนรูปโปรไฟล์"
            className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md active:bg-emerald-600"
          >
            <Pencil size={18} />
          </button>
        </div>

        {picking && (
          <div className="mt-5 rounded-2xl bg-slate-50 p-3">
            <div className="grid grid-cols-5 gap-2">
              {AVATARS.map((a) => {
                const selected = avatar.kind === "preset" && avatar.key === a.key;
                return (
                  <button
                    key={a.key}
                    onClick={() => setAvatar({ kind: "preset", key: a.key })}
                    aria-label={a.key}
                    className={`overflow-hidden rounded-full ring-2 active:scale-95 ${
                      selected ? "ring-emerald-500" : "ring-transparent"
                    }`}
                  >
                    <AvatarView
                      avatar={{ kind: "preset", key: a.key }}
                      className="aspect-square w-full"
                    />
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-medium text-slate-600 shadow-sm active:bg-slate-100"
            >
              <ImagePlus size={18} /> เลือกรูปจากเครื่อง
            </button>
            <button
              onClick={() => setAvatar({ kind: "default" })}
              className="mt-2 w-full py-2 text-xs text-slate-400 active:text-slate-600"
            >
              ใช้รูปเริ่มต้น
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFile}
            />
          </div>
        )}

        <input
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="คุณชื่ออะไร?"
          className={`mt-6 w-full rounded-2xl border border-slate-200 px-4 py-4 text-center text-lg text-slate-700 outline-none placeholder:font-light placeholder:text-slate-300 focus:border-emerald-400 ${FONT}`}
        />

        <div className="mt-5 flex gap-3">
          {isEdit && (
            <button
              onClick={onCancel}
              className="flex-1 rounded-2xl bg-slate-100 py-4 font-semibold text-slate-600 active:bg-slate-200"
            >
              ยกเลิก
            </button>
          )}
          <button
            onClick={submit}
            disabled={!canSave}
            className="flex-[2] rounded-2xl bg-emerald-500 py-4 font-bold text-white active:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400"
          >
            {isEdit ? "บันทึก" : "เริ่มเลย"}
          </button>
        </div>
      </div>
    </main>
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
  onOpenProfile,
}: {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  now: Date;
  onOpenSetup: () => void;
  onOpenProfile: () => void;
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
      profile: data.profile,
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
        {/* Profile banner */}
        <div className="relative mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 p-4 shadow-md">
          <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/15" />
          <div className="pointer-events-none absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-4">
            <button
              onClick={onOpenProfile}
              aria-label="แก้ไขโปรไฟล์"
              className="shrink-0 rounded-full active:scale-95"
            >
              <AvatarView
                avatar={data.profile?.avatar ?? { kind: "default" }}
                className="h-16 w-16 border-4 border-white/70 shadow"
              />
            </button>
            <p className={`min-w-0 truncate text-xl font-semibold text-white ${FONT}`}>
              สวัสดี, {data.profile?.name ?? ""}
            </p>
          </div>
        </div>

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
