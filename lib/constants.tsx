import {
  Utensils,
  Coffee,
  Bus,
  ShoppingBasket,
  Wallet,
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
  CupSoda,
  Milk,
  Wine,
  Beer,
  GlassWater,
  Martini,
  Citrus,
  Droplet,
  Leaf,
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
import { Fixed, QuickItem } from "@/lib/types";
import { TFn } from "@/lib/i18n";

/* ================================================================
   Constants
================================================================ */
export const STORAGE_KEY = "survival-budget-v1";
export const DEFAULT_BUDGET = 13623;


export const CATEGORIES: { id: string; th: string; icon: React.ElementType }[] = [
  { id: "food", th: "อาหาร", icon: Utensils },
  { id: "drink", th: "เครื่องดื่ม", icon: Coffee },
  { id: "travel", th: "เดินทาง", icon: Bus },
  { id: "goods", th: "ของใช้", icon: ShoppingBasket },
  { id: "other", th: "อื่นๆ", icon: Wallet },
];
// รองรับข้อมูลเก่าที่เก็บเป็นชื่อภาษาไทย
export const catOf = (v: string) =>
  CATEGORIES.find((c) => c.id === v || c.th === v) ?? CATEGORIES[CATEGORIES.length - 1];

export const DEFAULT_TH: Record<string, string> = {
  q1: "ค่าข้าว",
  q2: "กาแฟ",
  q3: "เดินทาง",
  q4: "ข้าว+น้ำ",
};
export const DEFAULT_QUICK: QuickItem[] = [
  { id: "q1", label: "ค่าข้าว", amount: 50, category: "food", icon: "Utensils" },
  { id: "q2", label: "กาแฟ", amount: 40, category: "drink", icon: "Coffee" },
  { id: "q3", label: "เดินทาง", amount: 30, category: "travel", icon: "Bus" },
  { id: "q4", label: "ข้าว+น้ำ", amount: 70, category: "food", icon: "Utensils" },
];
export const quickLabel = (q: QuickItem, t: TFn) =>
  DEFAULT_TH[q.id] === q.label ? t(`quick.${q.id}`) : q.label;
export const noteLabel = (note: string, t: TFn) => {
  const k = Object.keys(DEFAULT_TH).find((x) => DEFAULT_TH[x] === note);
  return k ? t(`quick.${k}`) : note;
};

export const DEFAULT_FIXED: Fixed[] = [
  { id: "f1", name: "ค่าห้อง", amount: 0 },
  { id: "f2", name: "ค่าเดินทางฟิกซ์", amount: 0 },
  { id: "f3", name: "ค่าน้ำ/ค่าไฟ", amount: 0 },
  { id: "f4", name: "ค่าเน็ต", amount: 0 },
];
export const FIXED_TH: Record<string, string> = {
  f1: "ค่าห้อง",
  f2: "ค่าเดินทางฟิกซ์",
  f3: "ค่าน้ำ/ค่าไฟ",
  f4: "ค่าเน็ต",
};

// ไอคอนแบ่งตามหมวด + ชื่อแนะนำ [th, en, fr, de, icon]
export const ICON_GROUPS: {
  id: string;
  icons: Record<string, React.ElementType>;
  presets: [string, string, string, string, string][];
}[] = [
  {
    id: "food",
    icons: {
      Utensils, UtensilsCrossed, Soup, Pizza, Sandwich, Salad, Egg, Beef, Fish,
      Drumstick, Cookie, Croissant, Cake, Apple, Banana, Cherry, Popcorn, Candy, Wheat,
    },
    presets: [
      ["ข้าวมันไก่", "Chicken rice", "Poulet au riz", "Hähnchen mit Reis", "Drumstick"],
      ["ก๋วยเตี๋ยว", "Noodle soup", "Soupe de nouilles", "Nudelsuppe", "Soup"],
      ["ข้าวไข่เจียว", "Rice & omelette", "Riz & omelette", "Reis mit Omelett", "Egg"],
      ["ส้มตำ", "Papaya salad", "Salade de papaye", "Papayasalat", "Salad"],
      ["ขนม", "Snack", "Collation", "Snack", "Cookie"],
      ["ผลไม้", "Fruit", "Fruits", "Obst", "Apple"],
    ],
  },
  {
    id: "drink",
    icons: { Coffee, CupSoda, Milk, Wine, Beer, GlassWater, Martini, Citrus, Droplet, Leaf },
    presets: [
      ["กาแฟ", "Coffee", "Café", "Kaffee", "Coffee"],
      ["ชาเย็น", "Iced tea", "Thé glacé", "Eistee", "CupSoda"],
      ["น้ำเปล่า", "Water", "Eau", "Wasser", "GlassWater"],
      ["นม", "Milk", "Lait", "Milch", "Milk"],
      ["น้ำผลไม้", "Juice", "Jus", "Saft", "Citrus"],
      ["เบียร์", "Beer", "Bière", "Bier", "Beer"],
    ],
  },
  {
    id: "travel",
    icons: {
      Bus, BusFront, Car, CarTaxiFront, Bike, Train, TrainFront, Plane, Ship, Fuel,
      Footprints, TramFront, Truck, MapPin,
    },
    presets: [
      ["รถเมล์", "Bus", "Bus", "Bus", "Bus"],
      ["BTS/MRT", "BTS/MRT", "BTS/MRT", "BTS/MRT", "TrainFront"],
      ["แท็กซี่", "Taxi", "Taxi", "Taxi", "CarTaxiFront"],
      ["วินมอไซค์", "Motorbike taxi", "Moto-taxi", "Mototaxi", "Bike"],
      ["น้ำมัน", "Fuel", "Carburant", "Sprit", "Fuel"],
      ["ทางด่วน", "Toll", "Péage", "Maut", "Car"],
    ],
  },
  {
    id: "home",
    icons: {
      ShoppingBasket, ShoppingCart, ShoppingBag, Store, Package, Shirt, Gift, Home,
      Lamp, Bed, Bath, Sofa, Wrench, Hammer, Key, Brush, SprayCan, Droplets,
    },
    presets: [
      ["ของใช้", "Supplies", "Fournitures", "Besorgungen", "ShoppingBasket"],
      ["ซื้อของ", "Shopping", "Courses", "Einkauf", "ShoppingCart"],
      ["เสื้อผ้า", "Clothes", "Vêtements", "Kleidung", "Shirt"],
      ["ของขวัญ", "Gift", "Cadeau", "Geschenk", "Gift"],
      ["ซ่อมแซม", "Repairs", "Réparations", "Reparatur", "Wrench"],
    ],
  },
  {
    id: "bills",
    icons: {
      Wallet, CreditCard, Banknote, Coins, PiggyBank, Receipt, Zap, Wifi, Smartphone,
      Phone, Tv, Lightbulb, Plug, Landmark,
    },
    presets: [
      ["ค่าไฟ", "Electricity", "Électricité", "Strom", "Zap"],
      ["ค่าเน็ต", "Internet", "Internet", "Internet", "Wifi"],
      ["ค่าโทรศัพท์", "Phone bill", "Forfait mobile", "Handyrechnung", "Smartphone"],
      ["ค่าน้ำ", "Water bill", "Eau", "Wasser", "Droplet"],
      ["ผ่อนบัตร", "Card payment", "Carte de crédit", "Kreditkarte", "CreditCard"],
      ["ออมเงิน", "Savings", "Épargne", "Sparen", "PiggyBank"],
    ],
  },
  {
    id: "life",
    icons: {
      Pill, Stethoscope, HeartPulse, Dumbbell, Baby, PawPrint, Heart, Syringe, Smile, Scissors,
    },
    presets: [
      ["ยา", "Medicine", "Médicaments", "Medikamente", "Pill"],
      ["หาหมอ", "Doctor", "Médecin", "Arzt", "Stethoscope"],
      ["ฟิตเนส", "Gym", "Salle de sport", "Fitnessstudio", "Dumbbell"],
      ["ของลูก", "Kids", "Enfants", "Kinder", "Baby"],
      ["สัตว์เลี้ยง", "Pets", "Animaux", "Haustiere", "PawPrint"],
      ["ตัดผม", "Haircut", "Coiffeur", "Friseur", "Scissors"],
    ],
  },
  {
    id: "fun",
    icons: {
      Gamepad2, Film, Music, Headphones, Book, BookOpen, GraduationCap, Briefcase,
      Laptop, Camera, Ticket, PartyPopper, Palette, Umbrella, Gem, Star,
    },
    presets: [
      ["เกม", "Games", "Jeux", "Spiele", "Gamepad2"],
      ["ดูหนัง", "Movies", "Cinéma", "Kino", "Film"],
      ["เพลง", "Music", "Musique", "Musik", "Music"],
      ["หนังสือ", "Books", "Livres", "Bücher", "Book"],
      ["คอร์สเรียน", "Course", "Cours", "Kurs", "GraduationCap"],
      ["ค่างาน", "Work", "Travail", "Arbeit", "Briefcase"],
    ],
  },
];

export const ICONS: Record<string, React.ElementType> = Object.assign(
  {},
  ...ICON_GROUPS.map((g) => g.icons)
);
