"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Type,
  Languages,
  ScanLine,
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

/* ================================================================
   Types
================================================================ */
type Lang = "th" | "en" | "fr" | "de";
type Fixed = { id: string; name: string; amount: number };
type Tx = {
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
  lang: Lang;
  font: string;
  appKey: string; // รหัสเชื่อมกับ /api/inbox (APP_KEY) — ว่าง = ปิดการเชื่อม SCB
};

type InboxEvent = {
  id: string;
  dir: "in" | "out";
  amount: number;
  dateKey: string;
  time: string;
  counterparty: string;
  ref: string;
};

/* ================================================================
   i18n  (th, en, fr, de)
================================================================ */
const LANG_IDX: Record<Lang, number> = { th: 0, en: 1, fr: 2, de: 3 };
const LOCALES: Record<Lang, string> = {
  th: "th-TH",
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
};
const LANGS: { id: Lang; flag: string; native: string }[] = [
  { id: "th", flag: "🇹🇭", native: "ไทย" },
  { id: "en", flag: "🇬🇧", native: "English" },
  { id: "fr", flag: "🇫🇷", native: "Français" },
  { id: "de", flag: "🇩🇪", native: "Deutsch" },
];

type Row = [string, string, string, string];
const D: Record<string, Row> = {
  // common
  "common.save": ["บันทึก", "Save", "Enregistrer", "Speichern"],
  "common.cancel": ["ยกเลิก", "Cancel", "Annuler", "Abbrechen"],
  "common.close": ["ปิด", "Close", "Fermer", "Schließen"],
  "common.back": ["กลับ", "Back", "Retour", "Zurück"],
  "common.done": ["เสร็จ", "Done", "Terminé", "Fertig"],
  "common.edit": ["แก้ไข", "Edit", "Modifier", "Bearbeiten"],
  "common.delete": ["ลบ", "Delete", "Supprimer", "Löschen"],

  // profile
  "profile.create": ["สร้างโปรไฟล์ของคุณ", "Create your profile", "Créez votre profil", "Erstelle dein Profil"],
  "profile.edit": ["แก้ไขโปรไฟล์", "Edit profile", "Modifier le profil", "Profil bearbeiten"],
  "profile.change": ["เปลี่ยนรูปโปรไฟล์", "Change photo", "Changer la photo", "Foto ändern"],
  "profile.upload": ["เลือกรูปจากเครื่อง", "Choose from device", "Choisir depuis l'appareil", "Aus Galerie wählen"],
  "profile.default": ["ใช้รูปเริ่มต้น", "Use default picture", "Utiliser l'image par défaut", "Standardbild verwenden"],
  "profile.namePh": ["คุณชื่ออะไร?", "What's your name?", "Comment vous appelez-vous ?", "Wie heißt du?"],
  "profile.start": ["เริ่มเลย", "Let's go", "C'est parti", "Los geht's"],
  "profile.uploadError": [
    "เปิดรูปนี้ไม่ได้ ลองเลือกรูปอื่น (JPG/PNG)",
    "Can't open this image. Try another one (JPG/PNG)",
    "Impossible d'ouvrir cette image. Essayez-en une autre (JPG/PNG)",
    "Dieses Bild lässt sich nicht öffnen. Versuche ein anderes (JPG/PNG)",
  ],
  "banner.hello": ["สวัสดี, {name}", "Hello, {name}", "Bonjour, {name}", "Hallo, {name}"],

  // setup
  "setup.titleFirst": ["ตั้งค่าเริ่มต้น", "Initial setup", "Configuration initiale", "Ersteinrichtung"],
  "setup.titleEdit": ["ตั้งค่างบประมาณ", "Budget settings", "Paramètres du budget", "Budget-Einstellungen"],
  "setup.budget": [
    "งบตั้งต้นประจำเดือน (บาท)",
    "Monthly starting budget (THB)",
    "Budget mensuel de départ (THB)",
    "Monatliches Startbudget (THB)",
  ],
  "setup.fixed": ["ค่าใช้จ่ายคงที่", "Fixed costs", "Charges fixes", "Fixkosten"],
  "setup.itemName": ["ชื่อรายการ", "Item name", "Nom", "Bezeichnung"],
  "setup.addItem": ["เพิ่มรายการ", "Add item", "Ajouter", "Hinzufügen"],
  "setup.days": [
    "จำนวนวันที่เหลือ (รวมวันนี้)",
    "Days left (including today)",
    "Jours restants (aujourd'hui inclus)",
    "Verbleibende Tage (inkl. heute)",
  ],
  "setup.toEnd": ["ถึงสิ้นเดือน", "Until month end", "Jusqu'à fin du mois", "Bis Monatsende"],
  "setup.daysHint": [
    "ระบบคำนวณจากวันที่จริงให้อัตโนมัติ แก้ไขเองได้ถ้ารอบของคุณไม่ตรงสิ้นเดือน",
    "Calculated automatically from today's date. Adjust it if your cycle doesn't end at month end.",
    "Calculé automatiquement à partir de la date du jour. Modifiez-le si votre cycle ne se termine pas en fin de mois.",
    "Wird automatisch aus dem heutigen Datum berechnet. Passe es an, wenn dein Zyklus nicht zum Monatsende endet.",
  ],
  "setup.net": [
    "เงินใช้จ่ายจริง (Net)",
    "Net spendable money",
    "Argent réellement disponible",
    "Verfügbares Geld (netto)",
  ],
  "setup.perDay": ["ใช้ได้วันละประมาณ", "About per day", "Environ par jour", "Etwa pro Tag"],
  "setup.negative": [
    "ค่าใช้จ่ายคงที่เกินงบตั้งต้น กรุณาตรวจสอบ",
    "Fixed costs exceed the starting budget. Please check.",
    "Les charges fixes dépassent le budget de départ. Veuillez vérifier.",
    "Die Fixkosten übersteigen das Startbudget. Bitte prüfen.",
  ],
  "setup.start": ["เริ่มใช้งาน", "Get started", "Commencer", "Loslegen"],
  "setup.needBudget": [
    "กรุณาใส่งบตั้งต้น",
    "Please enter a starting budget",
    "Veuillez saisir un budget de départ",
    "Bitte gib ein Startbudget ein",
  ],
  "setup.unnamed": ["ค่าใช้จ่าย", "Expense", "Dépense", "Ausgabe"],
  "fixed.f1": ["ค่าห้อง", "Rent", "Loyer", "Miete"],
  "fixed.f2": ["ค่าเดินทางฟิกซ์", "Fixed transport", "Transport fixe", "Feste Fahrtkosten"],
  "fixed.f3": ["ค่าน้ำ/ค่าไฟ", "Water/Electricity", "Eau/Électricité", "Wasser/Strom"],
  "fixed.f4": ["ค่าเน็ต", "Internet", "Internet", "Internet"],

  // settings
  "settings.title": ["ตั้งค่า", "Settings", "Paramètres", "Einstellungen"],
  "settings.budgetDesc": [
    "งบตั้งต้น ค่าใช้จ่ายคงที่ และจำนวนวัน",
    "Starting budget, fixed costs and days left",
    "Budget de départ, charges fixes et jours restants",
    "Startbudget, Fixkosten und verbleibende Tage",
  ],
  "settings.font": ["ฟอนต์", "Font", "Police", "Schriftart"],
  "settings.fontDesc": [
    "เลือกฟอนต์ที่ใช้ทั้งระบบ",
    "Choose the font used across the app",
    "Choisissez la police de toute l'application",
    "Wähle die Schriftart für die ganze App",
  ],
  "settings.language": ["ภาษา", "Language", "Langue", "Sprache"],
  "settings.langDesc": [
    "เปลี่ยนภาษาทั้งระบบ",
    "Change the language of the whole app",
    "Changer la langue de toute l'application",
    "Sprache der gesamten App ändern",
  ],
  "settings.active": ["ใช้งานอยู่", "Active", "Actif", "Aktiv"],

  // dashboard
  "dash.daysLeft": ["เหลืออีก {n} วัน", "{n} days left", "Encore {n} jours", "Noch {n} Tage"],
  "dash.daysLeft1": ["เหลืออีก {n} วัน", "{n} day left", "Encore {n} jour", "Noch {n} Tag"],
  "dash.expired": [
    "รอบที่ตั้งไว้สิ้นสุดแล้ว เปิดตั้งค่า หรือกด “เริ่มรอบใหม่” ด้านล่างเพื่อเริ่มรอบถัดไป",
    "Your cycle has ended. Open Settings or tap “Start a new cycle” below.",
    "Votre cycle est terminé. Ouvrez les paramètres ou touchez « Nouveau cycle » ci-dessous.",
    "Dein Zyklus ist beendet. Öffne die Einstellungen oder tippe unten auf „Neuer Zyklus“.",
  ],
  "dash.safe": [
    "ใช้ได้อีกวันนี้ (Safe-to-Spend)",
    "Left to spend today (Safe-to-Spend)",
    "Disponible aujourd'hui (Safe-to-Spend)",
    "Heute noch verfügbar (Safe-to-Spend)",
  ],
  "dash.todayBudget": [
    "งบวันนี้ ฿{a} · ใช้ไปแล้ว ฿{b}",
    "Today's budget ฿{a} · spent ฿{b}",
    "Budget du jour ฿{a} · dépensé ฿{b}",
    "Heutiges Budget ฿{a} · ausgegeben ฿{b}",
  ],
  "dash.tomorrow": [
    "พรุ่งนี้จะได้วันละ ฿{n}",
    "Tomorrow: ฿{n} per day",
    "Demain : ฿{n} par jour",
    "Morgen: ฿{n} pro Tag",
  ],
  "dash.carried": ["(รวมยอดทบแล้ว)", "(incl. carry-over)", "(report inclus)", "(inkl. Übertrag)"],
  "dash.cut": [
    "(หักจากส่วนที่ใช้เกินแล้ว)",
    "(reduced by overspending)",
    "(réduit par le dépassement)",
    "(durch Überschreitung gekürzt)",
  ],
  "zone.green": ["ปลอดภัย", "Safe", "Sécurité", "Sicher"],
  "zone.yellow": ["ระวัง", "Careful", "Prudence", "Vorsicht"],
  "zone.red": ["Survival Mode", "Survival Mode", "Survival Mode", "Survival Mode"],
  "bar.left": ["เหลือ ฿{n}", "Left ฿{n}", "Reste ฿{n}", "Übrig ฿{n}"],
  "bar.of": ["จาก ฿{n}", "of ฿{n}", "sur ฿{n}", "von ฿{n}"],
  "surv.title": ["โหมดกู้วิกฤต", "Survival mode", "Mode survie", "Überlebensmodus"],
  "surv.line": [
    "เหลือวันละ ฿{a} ➔ มื้อละ ฿{b}",
    "฿{a} per day ➔ ฿{b} per meal",
    "฿{a} par jour ➔ ฿{b} par repas",
    "฿{a} pro Tag ➔ ฿{b} pro Mahlzeit",
  ],
  "surv.today": [
    "วันนี้ที่เหลือ ฿{a} ≈ มื้อละ ฿{b} (แบ่ง 3 มื้อ)",
    "Left today ฿{a} ≈ ฿{b} per meal (3 meals)",
    "Reste aujourd'hui ฿{a} ≈ ฿{b} par repas (3 repas)",
    "Heute übrig ฿{a} ≈ ฿{b} pro Mahlzeit (3 Mahlzeiten)",
  ],
  "surv.over": [
    "ใช้เกินงบรวมแล้ว ฿{n}",
    "Over the total budget by ฿{n}",
    "Dépassement total de ฿{n}",
    "Gesamtbudget um ฿{n} überschritten",
  ],

  // quick log
  "quick.title": [
    "บันทึกด่วน (แตะครั้งเดียว)",
    "Quick log (one tap)",
    "Saisie rapide (un tap)",
    "Schnell erfassen (ein Tipp)",
  ],
  "quick.editTitle": [
    "แตะปุ่มเพื่อแก้ไข",
    "Tap a button to edit",
    "Touchez un bouton pour le modifier",
    "Tippe auf eine Taste zum Bearbeiten",
  ],
  "quick.customize": ["ปรับแต่ง", "Customize", "Personnaliser", "Anpassen"],
  "quick.add": ["เพิ่มปุ่ม", "Add button", "Ajouter un bouton", "Taste hinzufügen"],
  "quick.amountPh": ["จำนวนเงิน", "Amount", "Montant", "Betrag"],
  "quick.notePh": ["โน้ต (ไม่บังคับ)", "Note (optional)", "Note (facultatif)", "Notiz (optional)"],
  "quick.log": ["บันทึกรายจ่าย", "Log expense", "Enregistrer la dépense", "Ausgabe erfassen"],
  "quick.q1": ["ค่าข้าว", "Meal", "Repas", "Essen"],
  "quick.q2": ["กาแฟ", "Coffee", "Café", "Kaffee"],
  "quick.q3": ["เดินทาง", "Transport", "Transport", "Fahrt"],
  "quick.q4": ["ข้าว+น้ำ", "Meal + drink", "Repas + boisson", "Essen + Getränk"],

  // recent
  "recent.title": ["รายการล่าสุด", "Recent transactions", "Dernières opérations", "Letzte Ausgaben"],
  "recent.empty": ["ยังไม่มีรายการ", "Nothing yet", "Rien pour l'instant", "Noch keine Einträge"],
  "recent.today": ["วันนี้", "Today", "Aujourd'hui", "Heute"],
  "edit.title": ["แก้ไขรายการ", "Edit entry", "Modifier l'entrée", "Eintrag bearbeiten"],
  "edit.save": ["บันทึกการแก้ไข", "Save changes", "Enregistrer", "Änderungen speichern"],
  "edit.notePh": ["โน้ต", "Note", "Note", "Notiz"],
  "reset.btn": ["เริ่มรอบใหม่", "Start a new cycle", "Nouveau cycle", "Neuer Zyklus"],
  "reset.confirm": [
    "เริ่มรอบใหม่? ประวัติรายจ่ายทั้งหมดจะถูกลบ",
    "Start a new cycle? All expense history will be deleted.",
    "Démarrer un nouveau cycle ? Tout l'historique sera supprimé.",
    "Neuen Zyklus starten? Der gesamte Ausgabenverlauf wird gelöscht.",
  ],

  // SCB auto-link
  "scb.title": ["เชื่อม SCB อัตโนมัติ", "Auto-link SCB", "Lien automatique SCB", "SCB automatisch verknüpfen"],
  "scb.desc": [
    "รับแจ้งเตือนเงินเข้า-ออกจากมือถือ แล้วบันทึกและคำนวณยอดให้เอง",
    "Record money in/out automatically from your phone's notifications",
    "Enregistre automatiquement les entrées/sorties d'argent depuis les notifications du téléphone",
    "Ein- und Ausgänge automatisch aus Handy-Benachrichtigungen erfassen",
  ],
  "scb.keyPh": [
    "รหัสเชื่อมต่อ (APP_KEY)",
    "Connection key (APP_KEY)",
    "Clé de connexion (APP_KEY)",
    "Verbindungsschlüssel (APP_KEY)",
  ],
  "scb.save": ["บันทึกและทดสอบ", "Save & test", "Enregistrer et tester", "Speichern & testen"],
  "scb.testing": ["กำลังทดสอบ…", "Testing…", "Test en cours…", "Teste…"],
  "scb.ok": ["เชื่อมต่อสำเร็จ", "Connected", "Connecté", "Verbunden"],
  "scb.bad": [
    "เชื่อมต่อไม่ได้ ตรวจรหัสหรือการตั้งค่าเซิร์ฟเวอร์",
    "Can't connect. Check the key or server setup.",
    "Connexion impossible. Vérifiez la clé ou la configuration du serveur.",
    "Verbindung fehlgeschlagen. Prüfe Schlüssel oder Server-Einrichtung.",
  ],
  "scb.in": ["เงินเข้า SCB", "SCB deposit", "Entrée SCB", "SCB-Eingang"],
  "scb.out": ["เงินออก SCB", "SCB payment", "Sortie SCB", "SCB-Ausgang"],
  "scb.synced": [
    "เพิ่มจาก SCB {n} รายการ",
    "Added {n} from SCB",
    "{n} ajoutée(s) depuis SCB",
    "{n} von SCB hinzugefügt",
  ],

  // slip scanner
  "scan.title": ["สแกนสลิป", "Scan slip", "Scanner un reçu", "Beleg scannen"],
  "scan.camera": ["ถ่ายสลิป", "Take photo", "Prendre une photo", "Foto aufnehmen"],
  "scan.gallery": ["เลือกรูป", "From gallery", "Galerie", "Galerie"],
  "scan.hint": [
    "อ่านในเครื่องคุณเอง ไม่ส่งรูปออกไปไหน ไม่มีค่าใช้จ่าย เลือกได้หลายรูปพร้อมกัน",
    "Read on your device. Images never leave your phone. Free. You can pick several at once.",
    "Lecture sur l'appareil. Aucune image n'est envoyée. Gratuit. Plusieurs images possibles.",
    "Auf dem Gerät gelesen. Bilder verlassen dein Handy nicht. Kostenlos. Mehrere Bilder möglich.",
  ],
  "scan.loading": [
    "กำลังอ่านสลิป {i}/{n}…",
    "Reading slip {i}/{n}…",
    "Lecture du reçu {i}/{n}…",
    "Beleg {i}/{n} wird gelesen…",
  ],
  "scan.firstTime": [
    "ครั้งแรกต้องโหลดข้อมูลภาษา (ประมาณ 10 MB) โหลดครั้งเดียว ครั้งต่อไปจะเร็วขึ้น",
    "First time: downloading language data (about 10 MB), only once. Faster next time.",
    "Première fois : téléchargement des données de langue (environ 10 Mo), une seule fois.",
    "Erstes Mal: Sprachdaten werden geladen (ca. 10 MB), nur einmal. Danach schneller.",
  ],
  "scan.review": ["ตรวจสอบรายการ", "Review entries", "Vérifier les opérations", "Einträge prüfen"],
  "scan.expense": ["รายจ่าย", "Expense", "Dépense", "Ausgabe"],
  "scan.income": ["รายรับ", "Income", "Revenu", "Einnahme"],
  "scan.noAmount": [
    "อ่านยอดเงินไม่ได้ กรอกเองได้เลย",
    "Couldn't read the amount. Enter it manually.",
    "Montant illisible. Saisissez-le.",
    "Betrag nicht lesbar. Bitte eingeben.",
  ],
  "scan.dup": [
    "สลิปนี้อาจเคยบันทึกแล้ว",
    "This slip may already be saved",
    "Ce reçu est peut-être déjà enregistré",
    "Dieser Beleg wurde evtl. schon gespeichert",
  ],
  "scan.saveAll": ["บันทึก {n} รายการ", "Save {n} entries", "Enregistrer {n} opérations", "{n} Einträge speichern"],
  "scan.saved": ["บันทึกแล้ว {n} รายการ", "Saved {n} entries", "{n} opérations enregistrées", "{n} Einträge gespeichert"],
  "scan.slipNote": ["สลิปโอนเงิน", "Transfer slip", "Reçu de virement", "Überweisungsbeleg"],
  "scan.error": [
    "อ่านสลิปไม่สำเร็จ ลองถ่ายใหม่ให้ชัดขึ้น หรือเช็กอินเทอร์เน็ตตอนโหลดครั้งแรก",
    "Couldn't read the slip. Try a clearer photo, and check your connection on first use.",
    "Lecture impossible. Essayez une photo plus nette et vérifiez la connexion à la première utilisation.",
    "Beleg nicht lesbar. Versuche ein schärferes Foto und prüfe beim ersten Mal die Verbindung.",
  ],
  "scan.remove": ["เอาออก", "Remove", "Retirer", "Entfernen"],

  // quick editor
  "qe.new": ["เพิ่มปุ่มบันทึกด่วน", "Add quick button", "Ajouter un bouton rapide", "Schnelltaste hinzufügen"],
  "qe.edit": ["แก้ไขปุ่มบันทึกด่วน", "Edit quick button", "Modifier le bouton rapide", "Schnelltaste bearbeiten"],
  "qe.baht": ["บาท", "THB", "THB", "THB"],
  "qe.category": ["หมวดหมู่รายจ่าย", "Expense category", "Catégorie de dépense", "Ausgabenkategorie"],
  "qe.pickIcon": [
    "เลือกโลโก้ (แยกตามหมวด)",
    "Pick an icon (by category)",
    "Choisir une icône (par catégorie)",
    "Symbol wählen (nach Kategorie)",
  ],
  "qe.delete": ["ลบปุ่ม", "Delete button", "Supprimer le bouton", "Taste löschen"],

  // categories
  "cat.food": ["อาหาร", "Food", "Repas", "Essen"],
  "cat.drink": ["เครื่องดื่ม", "Drinks", "Boissons", "Getränke"],
  "cat.travel": ["เดินทาง", "Transport", "Transport", "Fahrt"],
  "cat.goods": ["ของใช้", "Supplies", "Fournitures", "Besorgungen"],
  "cat.other": ["อื่นๆ", "Other", "Autre", "Sonstiges"],
  "grp.food": ["อาหาร", "Food", "Alimentation", "Essen"],
  "grp.drink": ["เครื่องดื่ม", "Drinks", "Boissons", "Getränke"],
  "grp.travel": ["เดินทาง", "Transport", "Transport", "Verkehr"],
  "grp.home": ["ของใช้/บ้าน", "Home & goods", "Maison & courses", "Haus & Besorgungen"],
  "grp.bills": ["บิล/การเงิน", "Bills & money", "Factures & argent", "Rechnungen & Geld"],
  "grp.life": ["สุขภาพ/ชีวิต", "Health & life", "Santé & vie", "Gesundheit & Leben"],
  "grp.fun": ["บันเทิง/งาน", "Fun & work", "Loisirs & travail", "Freizeit & Arbeit"],
};

function tr(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const row = D[key];
  let s = row ? row[LANG_IDX[lang]] : key;
  if (vars) {
    for (const k of Object.keys(vars)) s = s.split(`{${k}}`).join(String(vars[k]));
  }
  return s;
}

const LangCtx = createContext<Lang>("th");
type TFn = (key: string, vars?: Record<string, string | number>) => string;
function useT(): TFn {
  const lang = useContext(LangCtx);
  return (key, vars) => tr(lang, key, vars);
}
function useLang(): Lang {
  return useContext(LangCtx);
}

/* ================================================================
   Fonts
================================================================ */
const FONTS: { id: string; name: string; cssVar: string }[] = [
  { id: "anuphan", name: "Anuphan", cssVar: "--font-anuphan" },
  { id: "prompt", name: "Prompt", cssVar: "--font-prompt" },
  { id: "kanit", name: "Kanit", cssVar: "--font-kanit" },
  { id: "sarabun", name: "Sarabun", cssVar: "--font-sarabun" },
  { id: "mali", name: "Mali", cssVar: "--font-mali" },
  { id: "mitr", name: "Mitr", cssVar: "--font-mitr" },
];
const fontFamilyOf = (id: string) => {
  const f = FONTS.find((x) => x.id === id) ?? FONTS[0];
  return `var(${f.cssVar}), system-ui, sans-serif`;
};

/* ================================================================
   Constants
================================================================ */
const STORAGE_KEY = "survival-budget-v1";
const DEFAULT_BUDGET = 13623;

let LOCALE = "th-TH";

const CATEGORIES: { id: string; th: string; icon: React.ElementType }[] = [
  { id: "food", th: "อาหาร", icon: Utensils },
  { id: "drink", th: "เครื่องดื่ม", icon: Coffee },
  { id: "travel", th: "เดินทาง", icon: Bus },
  { id: "goods", th: "ของใช้", icon: ShoppingBasket },
  { id: "other", th: "อื่นๆ", icon: Wallet },
];
// รองรับข้อมูลเก่าที่เก็บเป็นชื่อภาษาไทย
const catOf = (v: string) =>
  CATEGORIES.find((c) => c.id === v || c.th === v) ?? CATEGORIES[CATEGORIES.length - 1];

const DEFAULT_TH: Record<string, string> = {
  q1: "ค่าข้าว",
  q2: "กาแฟ",
  q3: "เดินทาง",
  q4: "ข้าว+น้ำ",
};
const DEFAULT_QUICK: QuickItem[] = [
  { id: "q1", label: "ค่าข้าว", amount: 50, category: "food", icon: "Utensils" },
  { id: "q2", label: "กาแฟ", amount: 40, category: "drink", icon: "Coffee" },
  { id: "q3", label: "เดินทาง", amount: 30, category: "travel", icon: "Bus" },
  { id: "q4", label: "ข้าว+น้ำ", amount: 70, category: "food", icon: "Utensils" },
];
const quickLabel = (q: QuickItem, t: TFn) =>
  DEFAULT_TH[q.id] === q.label ? t(`quick.${q.id}`) : q.label;
const noteLabel = (note: string, t: TFn) => {
  const k = Object.keys(DEFAULT_TH).find((x) => DEFAULT_TH[x] === note);
  return k ? t(`quick.${k}`) : note;
};

const DEFAULT_FIXED: Fixed[] = [
  { id: "f1", name: "ค่าห้อง", amount: 0 },
  { id: "f2", name: "ค่าเดินทางฟิกซ์", amount: 0 },
  { id: "f3", name: "ค่าน้ำ/ค่าไฟ", amount: 0 },
  { id: "f4", name: "ค่าเน็ต", amount: 0 },
];
const FIXED_TH: Record<string, string> = {
  f1: "ค่าห้อง",
  f2: "ค่าเดินทางฟิกซ์",
  f3: "ค่าน้ำ/ค่าไฟ",
  f4: "ค่าเน็ต",
};

// ไอคอนแบ่งตามหมวด + ชื่อแนะนำ [th, en, fr, de, icon]
const ICON_GROUPS: {
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

const ICONS: Record<string, React.ElementType> = Object.assign(
  {},
  ...ICON_GROUPS.map((g) => g.icons)
);

/* ================================================================
   Helpers
================================================================ */
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
  Math.round(n).toLocaleString(LOCALE, { maximumFractionDigits: 0 });
const uid = () => Math.random().toString(36).slice(2, 10);

const defaultData = (): Data => ({
  setupDone: false,
  budget: DEFAULT_BUDGET,
  fixed: DEFAULT_FIXED,
  endDate: monthEndKey(new Date()),
  txs: [],
  quick: DEFAULT_QUICK,
  profile: null,
  lang: "th",
  font: "anuphan",
  appKey: "",
});

/* ================================================================
   Page
================================================================ */
export default function Page() {
  const [data, setData] = useState<Data>(defaultData);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());
  const [editingSetup, setEditingSetup] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingSettings, setEditingSettings] = useState(false);

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
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const lang: Lang = LANGS.some((l) => l.id === data.lang) ? data.lang : "th";
  LOCALE = LOCALES[lang];

  // ฟอนต์ + lang ของทั้งเว็บ
  useEffect(() => {
    document.body.style.fontFamily = fontFamilyOf(data.font);
    document.documentElement.lang = lang;
  }, [data.font, lang]);

  // ดึงรายการเงินเข้า/ออกจาก SCB ที่มือถือส่งเข้า Firestore มาบันทึกอัตโนมัติ
  const txsRef = useRef<Tx[]>([]);
  txsRef.current = data.txs;
  const syncingRef = useRef(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const key = data.appKey;
    if (!loaded || !key) return;
    let alive = true;

    const run = async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      try {
        const r = await fetch("/api/inbox", { headers: { "x-key": key }, cache: "no-store" });
        if (!r.ok) return;
        const j = (await r.json()) as { events?: InboxEvent[] };
        const events = j.events ?? [];
        if (events.length === 0) return;

        const known = [...txsRef.current];
        const added: Tx[] = [];
        for (const ev of events) {
          const when = fromKey(ev.dateKey);
          const [hh, mi] = ev.time.split(":").map(Number);
          when.setHours(hh || 0, mi || 0, 0, 0);
          const ts = when.getTime();
          const income = ev.dir === "in";
          // กันซ้ำกับสลิปที่สแกน/รายการที่เพิ่มไปแล้ว (ยอดเท่ากัน ทิศทางเดียวกัน เวลาห่างไม่เกิน 3 นาที)
          const dup = known.some(
            (x) =>
              !!x.income === income &&
              ((x.ref !== undefined && x.ref === ev.ref) ||
                (x.amount === ev.amount && x.dateKey === ev.dateKey && Math.abs(x.ts - ts) <= 180000))
          );
          if (dup) continue;
          const tx: Tx = {
            id: `scb_${ev.id}`,
            amount: ev.amount,
            category: "other",
            note: ev.counterparty || tr(lang, income ? "scb.in" : "scb.out"),
            dateKey: ev.dateKey,
            ts,
            icon: income ? "Banknote" : "Receipt",
            income: income || undefined,
            ref: ev.ref,
          };
          added.push(tx);
          known.push(tx);
        }

        if (added.length > 0) {
          setData((d) => ({
            ...d,
            txs: [...added.filter((n) => !d.txs.some((x) => x.id === n.id)), ...d.txs].sort(
              (a, b) => b.ts - a.ts
            ),
          }));
        }
        await fetch("/api/inbox", {
          method: "POST",
          headers: { "x-key": key, "content-type": "application/json" },
          body: JSON.stringify({ ids: events.map((e) => e.id) }),
        });
        if (added.length > 0 && alive) {
          setToast(tr(lang, "scb.synced", { n: added.length }));
          setTimeout(() => setToast(""), 3500);
        }
      } catch {
        /* ออฟไลน์/เซิร์ฟเวอร์ยังไม่พร้อม — ลองใหม่รอบหน้า */
      } finally {
        syncingRef.current = false;
      }
    };

    void run();
    const timer = setInterval(run, 30000);
    const onVis = () => {
      if (document.visibilityState === "visible") void run();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [loaded, data.appKey, lang]);

  let content: React.ReactNode;

  if (!loaded) {
    content = <div className="min-h-screen bg-slate-50" />;
  } else if (!data.profile || editingProfile) {
    content = (
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
  } else if (!data.setupDone || editingSetup) {
    content = (
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
  } else if (editingSettings) {
    content = (
      <SettingsScreen
        lang={lang}
        font={data.font}
        onLang={(l) => setData((d) => ({ ...d, lang: l }))}
        onFont={(f) => setData((d) => ({ ...d, font: f }))}
        appKey={data.appKey}
        onAppKey={(k) => setData((d) => ({ ...d, appKey: k }))}
        onBudget={() => {
          setEditingSettings(false);
          setEditingSetup(true);
        }}
        onBack={() => setEditingSettings(false)}
      />
    );
  } else {
    content = (
      <Dashboard
        data={data}
        setData={setData}
        now={now}
        onOpenSettings={() => setEditingSettings(true)}
        onOpenProfile={() => setEditingProfile(true)}
      />
    );
  }

  return (
    <LangCtx.Provider value={lang}>
      {content}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-slate-800 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </LangCtx.Provider>
  );
}

/* ================================================================
   Avatars / Profile
================================================================ */
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
        <polygon points="28.5,37 35.5,37 32,42" fill="#FB923C" />
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
  const t = useT();
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
      alert(t("profile.uploadError"));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-slate-50 px-4 py-8">
      <div className="w-full max-w-sm rounded-[2rem] bg-white p-7 shadow-xl">
        <h1 className="mb-6 text-center text-lg font-semibold text-slate-700">
          {isEdit ? t("profile.edit") : t("profile.create")}
        </h1>

        <div className="relative mx-auto h-36 w-36">
          <AvatarView
            avatar={avatar}
            className="h-36 w-36 border-4 border-white shadow-lg ring-1 ring-slate-100"
          />
          <button
            onClick={() => setPicking((v) => !v)}
            aria-label={t("profile.change")}
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
              <ImagePlus size={18} /> {t("profile.upload")}
            </button>
            <button
              onClick={() => setAvatar({ kind: "default" })}
              className="mt-2 w-full py-2 text-xs text-slate-400 active:text-slate-600"
            >
              {t("profile.default")}
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
          placeholder={t("profile.namePh")}
          className="mt-6 w-full rounded-2xl border border-slate-200 px-4 py-4 text-center text-lg text-slate-700 outline-none placeholder:font-light placeholder:text-slate-300 focus:border-emerald-400"
        />

        <div className="mt-5 flex gap-3">
          {isEdit && (
            <button
              onClick={onCancel}
              className="flex-1 rounded-2xl bg-slate-100 py-4 font-semibold text-slate-600 active:bg-slate-200"
            >
              {t("common.cancel")}
            </button>
          )}
          <button
            onClick={submit}
            disabled={!canSave}
            className="flex-[2] rounded-2xl bg-emerald-500 py-4 font-bold text-white active:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400"
          >
            {isEdit ? t("common.save") : t("profile.start")}
          </button>
        </div>
      </div>
    </main>
  );
}

/* ================================================================
   Settings
================================================================ */
function OptionRow({
  active,
  onClick,
  children,
  style,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const t = useT();
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={style}
      className={`flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3.5 text-left transition ${
        active
          ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-[0_0_0_3px_rgba(52,211,153,0.25),0_0_20px_rgba(16,185,129,0.45)]"
          : "border-transparent bg-slate-50 text-slate-700 active:bg-slate-100"
      }`}
    >
      <span className={active ? "[text-shadow:0_0_10px_rgba(16,185,129,0.55)]" : ""}>
        {children}
      </span>
      {active && (
        <span
          title={t("settings.active")}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.8)]"
        >
          <Check size={16} strokeWidth={3} />
          <span className="sr-only">{t("settings.active")}</span>
        </span>
      )}
    </button>
  );
}

function SettingsScreen({
  lang,
  font,
  appKey,
  onLang,
  onFont,
  onAppKey,
  onBudget,
  onBack,
}: {
  lang: Lang;
  font: string;
  appKey: string;
  onLang: (l: Lang) => void;
  onFont: (f: string) => void;
  onAppKey: (k: string) => void;
  onBudget: () => void;
  onBack: () => void;
}) {
  const t = useT();
  const [keyDraft, setKeyDraft] = useState(appKey);
  const [st, setSt] = useState<"idle" | "testing" | "ok" | "bad">("idle");
  const saveKey = async () => {
    const k = keyDraft.trim();
    onAppKey(k);
    if (!k) {
      setSt("idle");
      return;
    }
    setSt("testing");
    try {
      const r = await fetch("/api/inbox", { headers: { "x-key": k }, cache: "no-store" });
      setSt(r.ok ? "ok" : "bad");
    } catch {
      setSt("bad");
    }
  };
  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      <div className="mx-auto max-w-md px-4 pt-6">
        <header className="mb-5 flex items-center gap-2">
          <button
            onClick={onBack}
            aria-label={t("common.back")}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm active:bg-slate-100"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">{t("settings.title")}</h1>
        </header>

        {/* งบประมาณ */}
        <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
          <button
            onClick={onBudget}
            className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3.5 text-left active:bg-slate-100"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Wallet size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-slate-800">{t("setup.titleEdit")}</span>
              <span className="block text-xs text-slate-500">{t("settings.budgetDesc")}</span>
            </span>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </section>

        {/* ฟอนต์ */}
        <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Type size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-slate-800">{t("settings.font")}</h2>
              <p className="text-xs text-slate-500">{t("settings.fontDesc")}</p>
            </div>
          </div>
          <div className="space-y-2">
            {FONTS.map((f) => (
              <OptionRow
                key={f.id}
                active={font === f.id}
                onClick={() => onFont(f.id)}
                style={{ fontFamily: fontFamilyOf(f.id) }}
              >
                <span className="block text-base font-semibold">{f.name}</span>
                <span className="block text-sm opacity-70">สวัสดี Hello Bonjour Äö ฿1,234</span>
              </OptionRow>
            ))}
          </div>
        </section>

        {/* ภาษา */}
        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Languages size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-slate-800">{t("settings.language")}</h2>
              <p className="text-xs text-slate-500">{t("settings.langDesc")}</p>
            </div>
          </div>
          <div className="space-y-2">
            {LANGS.map((l) => (
              <OptionRow key={l.id} active={lang === l.id} onClick={() => onLang(l.id)}>
                <span className="flex items-center gap-3 text-base font-semibold">
                  <span className="text-xl">{l.flag}</span>
                  {l.native}
                </span>
              </OptionRow>
            ))}
          </div>
        </section>

        {/* เชื่อม SCB อัตโนมัติ */}
        <section className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Smartphone size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-slate-800">{t("scb.title")}</h2>
              <p className="text-xs text-slate-500">{t("scb.desc")}</p>
            </div>
          </div>
          <input
            value={keyDraft}
            onChange={(e) => {
              setKeyDraft(e.target.value);
              setSt("idle");
            }}
            placeholder={t("scb.keyPh")}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
          <button
            onClick={saveKey}
            className="mt-3 w-full rounded-2xl bg-emerald-500 py-3.5 font-semibold text-white active:bg-emerald-600"
          >
            {t("scb.save")}
          </button>
          {st === "testing" && <p className="mt-2 text-sm text-slate-500">{t("scb.testing")}</p>}
          {st === "ok" && (
            <p className="mt-2 flex items-center gap-1 text-sm font-medium text-emerald-600">
              <Check size={16} /> {t("scb.ok")}
            </p>
          )}
          {st === "bad" && <p className="mt-2 text-sm text-rose-600">{t("scb.bad")}</p>}
        </section>
      </div>
    </main>
  );
}

/* ================================================================
   Setup (งบประมาณ)
================================================================ */
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
  const t = useT();
  const todayKey = toKey(now);
  const defaultDaysLeft = Math.max(1, diffDays(now, fromKey(data.endDate)) + 1);

  const [budget, setBudget] = useState(String(data.budget));
  const [fixed, setFixed] = useState<{ id: string; name: string; amount: string }[]>(
    data.fixed.map((f) => ({
      id: f.id,
      name: FIXED_TH[f.id] === f.name ? t(`fixed.${f.id}`) : f.name,
      amount: f.amount ? String(f.amount) : "",
    }))
  );
  const [days, setDays] = useState(
    String(
      isEdit
        ? defaultDaysLeft
        : Math.max(1, diffDays(now, fromKey(monthEndKey(now))) + 1)
    )
  );

  const budgetNum = Number(budget) || 0;
  const fixedTotal = fixed.reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const net = budgetNum - fixedTotal;
  const daysNum = Math.max(1, Math.floor(Number(days) || 1));
  const perDay = net / daysNum;

  const submit = () => {
    if (budgetNum <= 0) return alert(t("setup.needBudget"));
    onSave({
      ...data,
      setupDone: true,
      budget: budgetNum,
      fixed: fixed
        .filter((f) => f.name.trim() || Number(f.amount))
        .map((f) => ({
          id: f.id,
          name: f.name.trim() || t("setup.unnamed"),
          amount: Number(f.amount) || 0,
        })),
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
              {isEdit ? t("setup.titleEdit") : t("setup.titleFirst")}
            </h1>
            <p className="text-sm text-slate-500">Survival Mode · Daily Safe-to-Spend</p>
          </div>
        </div>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            {t("setup.budget")}
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
            <h2 className="text-sm font-medium text-slate-600">{t("setup.fixed")}</h2>
            <span className="text-sm font-semibold text-rose-500">−{fmt(fixedTotal)}</span>
          </div>
          <div className="space-y-2">
            {fixed.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                <input
                  value={f.name}
                  placeholder={t("setup.itemName")}
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
                  aria-label={t("common.delete")}
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
            <Plus size={16} /> {t("setup.addItem")}
          </button>
        </section>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            {t("setup.days")}
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
              {t("setup.toEnd")}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">{t("setup.daysHint")}</p>
        </section>

        <section className="mb-6 rounded-2xl bg-emerald-50 p-4">
          <div className="flex justify-between text-sm text-emerald-800">
            <span>{t("setup.net")}</span>
            <b>{fmt(net)} ฿</b>
          </div>
          <div className="mt-1 flex justify-between text-sm text-emerald-800">
            <span>{t("setup.perDay")}</span>
            <b>{fmt(Math.max(0, perDay))} ฿</b>
          </div>
          {net < 0 && <p className="mt-2 text-xs text-rose-600">{t("setup.negative")}</p>}
        </section>

        <div className="flex gap-3">
          {isEdit && (
            <button
              onClick={onCancel}
              className="flex-1 rounded-2xl bg-slate-200 py-4 text-base font-semibold text-slate-700 active:bg-slate-300"
            >
              {t("common.cancel")}
            </button>
          )}
          <button
            onClick={submit}
            className="flex-[2] rounded-2xl bg-emerald-500 py-4 text-base font-bold text-white active:bg-emerald-600"
          >
            {isEdit ? t("common.save") : t("setup.start")}
          </button>
        </div>
      </div>
    </main>
  );
}

/* ================================================================
   Quick Button Editor
================================================================ */
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
  const t = useT();
  const lang = useLang();
  const initialLabel = quickLabel(item, t);
  const [label, setLabel] = useState(initialLabel);
  const [amountStr, setAmountStr] = useState(item.amount ? String(item.amount) : "");
  const [category, setCategory] = useState(catOf(item.category).id);
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
            {isNew ? t("qe.new") : t("qe.edit")}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400" aria-label={t("common.close")}>
            <X size={20} />
          </button>
        </div>

        {/* Preview */}
        <div className="mb-4 flex h-16 items-center justify-between rounded-2xl bg-slate-100 px-4">
          <span className="flex min-w-0 items-center gap-2 text-slate-700">
            <Preview size={20} className="shrink-0" />
            <span className="truncate font-medium">{label || t("setup.itemName")}</span>
          </span>
          <span className="ml-2 font-bold text-slate-800">
            {amountNum > 0 ? fmt(amountNum) : "0"}
          </span>
        </div>

        <div className="mb-3 flex gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t("setup.itemName")}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            inputMode="decimal"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder={t("qe.baht")}
            className="w-24 rounded-xl border border-slate-200 px-3 py-3 text-right text-lg font-bold outline-none focus:border-emerald-500"
          />
        </div>

        <p className="mb-1 text-xs font-medium text-slate-500">{t("qe.category")}</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-full px-3 py-2 text-sm ${
                category === c.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {t(`cat.${c.id}`)}
            </button>
          ))}
        </div>

        <p className="mb-1 text-xs font-medium text-slate-500">{t("qe.pickIcon")}</p>
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {ICON_GROUPS.map((x, i) => (
            <button
              key={x.id}
              onClick={() => setG(i)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-sm ${
                g === i ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {t(`grp.${x.id}`)}
            </button>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {group.presets.map((p) => {
            const name = p[LANG_IDX[lang]];
            return (
              <button
                key={p[0]}
                onClick={() => {
                  setLabel(name);
                  setIcon(p[4]);
                }}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 active:bg-emerald-50"
              >
                {name}
              </button>
            );
          })}
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
              aria-label={t("qe.delete")}
            >
              <Trash2 size={20} />
            </button>
          )}
          <button
            disabled={!canSave}
            onClick={() =>
              onSave({
                id: item.id,
                // ถ้าไม่ได้แก้ชื่อ เก็บชื่อเดิมไว้ (ปุ่มเริ่มต้นจะยังแปลภาษาตามระบบได้)
                label: label.trim() === initialLabel ? item.label : label.trim(),
                amount: amountNum,
                category,
                icon,
              })
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-bold text-white active:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Check size={18} /> {t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Slip scanner (OCR ในเครื่อง — ไม่เสียค่า API / ไม่ส่งรูปออกนอกเครื่อง)
================================================================ */
type Draft = {
  id: string;
  amount: string;
  note: string;
  dateKey: string;
  time: string; // HH:MM
  income: boolean;
  ref: string;
  dup: boolean;
  thumb: string;
};

type OcrWorker = {
  recognize: (img: string) => Promise<{ data: { text: string } }>;
  terminate: () => Promise<unknown>;
};

const MONTH_PATS = [
  "ม\\.?\\s?ค\\.?|มกราคม|jan",
  "ก\\.?\\s?พ\\.?|กุมภาพันธ์|feb",
  "มี\\.?\\s?ค\\.?|มีนาคม|mar",
  "เม\\.?\\s?ย\\.?|เมษายน|apr",
  "พ\\.?\\s?ค\\.?|พฤษภาคม|may",
  "มิ\\.?\\s?ย\\.?|มิถุนายน|jun",
  "ก\\.?\\s?ค\\.?|กรกฎาคม|jul",
  "ส\\.?\\s?ค\\.?|สิงหาคม|aug",
  "ก\\.?\\s?ย\\.?|กันยายน|sep",
  "ต\\.?\\s?ค\\.?|ตุลาคม|oct",
  "พ\\.?\\s?ย\\.?|พฤศจิกายน|nov",
  "ธ\\.?\\s?ค\\.?|ธันวาคม|dec",
];

function parseSlip(raw: string, now: Date) {
  // OCR ภาษาไทยชอบเว้นวรรคระหว่างตัวอักษร ตัดออกก่อน
  const text = raw.replace(/([\u0E00-\u0E7F])[ \t]+(?=[\u0E00-\u0E7F])/g, "$1");

  // --- ยอดเงิน: เลือกตัวเลขทศนิยม 2 ตำแหน่งที่อยู่หลังคำว่า "จำนวน/Amount" ก่อน ข้ามค่าธรรมเนียม
  const re = /\d{1,3}(?:,\d{3})+\.\d{2}|\d+\.\d{2}/g;
  let amount: number | null = null;
  let fallback: number | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const v = parseFloat(m[0].replace(/,/g, ""));
    if (!(v > 0)) continue;
    const before = text.slice(Math.max(0, m.index - 22), m.index);
    if (/ค่าธรรม|fee/i.test(before)) continue;
    if (/จ.{0,3}นวน|amount/i.test(before)) {
      amount = v;
      break;
    }
    if (fallback === null) fallback = v;
  }
  if (amount === null) amount = fallback;

  // --- วันที่
  let date: Date | null = null;
  let dateEnd = 0;
  for (let i = 0; i < 12 && !date; i++) {
    const mm = new RegExp(`(\\d{1,2})\\s*(?:${MONTH_PATS[i]})\\s*\\.?\\s*(\\d{2,4})`, "i").exec(text);
    if (!mm) continue;
    const day = Number(mm[1]);
    let y = Number(mm[2]);
    if (y < 100) y = y >= 50 ? 2500 + y : 2000 + y;
    if (y >= 2400) y -= 543;
    const cand = new Date(y, i, day);
    if (cand.getMonth() === i && cand.getDate() === day) {
      date = cand;
      dateEnd = mm.index + mm[0].length;
    }
  }
  if (date && (toKey(date) > toKey(now) || diffDays(date, now) > 400)) date = null;

  // --- เวลา
  let time = "";
  const tm = /(\d{1,2}):(\d{2})/.exec(text.slice(date ? dateEnd : 0)) ?? /(\d{1,2}):(\d{2})/.exec(text);
  if (tm && Number(tm[1]) < 24 && Number(tm[2]) < 60) time = `${pad(Number(tm[1]))}:${tm[2]}`;
  if (!time) time = date ? "12:00" : `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const dateKey = toKey(date ?? now);

  // --- รหัสอ้างอิง (กันบันทึกซ้ำ)
  const rm = /(?:รหัสอ้างอิง|เลขที่รายการ|เลขอ้างอิง|ref(?:erence)?\.?(?:\s*no\.?)?)\s*[:：]?\s*([A-Za-z0-9]{8,})/i.exec(text);
  const ref = rm ? rm[1] : `${amount ?? 0}|${dateKey}|${time}`;

  // --- ชื่อผู้รับ
  let note = "";
  const lines = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  const keyRe = /^(?:ไปยัง|ถึง|to\b|ผู้รับ)/i;
  const idx = lines.findIndex((l) => keyRe.test(l));
  if (idx >= 0) {
    let cand = lines[idx].replace(keyRe, "").replace(/^[:：\s]+/, "");
    if (cand.replace(/[^\u0E00-\u0E7FA-Za-z]/g, "").length < 2) cand = lines[idx + 1] ?? "";
    note = cand
      .replace(/[0-9xX*\-_|:]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 40);
  }

  // สลิปที่สแกนถือเป็น "รายจ่าย" เสมอ (ไม่เดาเองว่าเป็นรายรับ เพราะคำว่า "ผู้รับ/รับเงิน" มีอยู่ในสลิปโอนออกด้วย)
  // ถ้าเป็นเงินเข้าจริง ผู้ใช้กดสลับเป็น "รายรับ" เองในหน้าตรวจสอบ
  return { amount, dateKey, time, ref, note };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}

// ย่อรูป + ทำขาวดำเพิ่มคอนทราสต์ให้ OCR อ่านเร็วและแม่นขึ้น
async function prepImage(file: File): Promise<{ ocr: string; thumb: string }> {
  const img = await loadImage(file);
  const scale = Math.min(1, 1200 / img.width, 2600 / img.height);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.filter = "grayscale(1) contrast(1.25)";
  ctx.drawImage(img, 0, 0, w, h);
  const ocr = c.toDataURL("image/jpeg", 0.92);

  const tc = document.createElement("canvas");
  const tw = 72;
  const th = Math.min(128, Math.round((tw * img.height) / img.width));
  tc.width = tw;
  tc.height = th;
  tc.getContext("2d")?.drawImage(img, 0, 0, tw, th);
  const thumb = tc.toDataURL("image/jpeg", 0.7);

  return { ocr, thumb };
}

function SlipScanner({
  existing,
  now,
  onSaveTxs,
}: {
  existing: Tx[];
  now: Date;
  onSaveTxs: (list: Tx[]) => void;
}) {
  const t = useT();
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<OcrWorker | null>(null);
  const [busy, setBusy] = useState<{ i: number; n: number } | null>(null);
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    return () => {
      workerRef.current?.terminate().catch(() => {});
      workerRef.current = null;
    };
  }, []);

  const getWorker = async (): Promise<OcrWorker> => {
    if (workerRef.current) return workerRef.current;
    const { createWorker } = await import("tesseract.js");
    const w = (await createWorker(["tha", "eng"])) as unknown as OcrWorker;
    workerRef.current = w;
    return w;
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0 || busy) return;
    const list = files.slice(0, 15);
    const out: Draft[] = [];
    setBusy({ i: 1, n: list.length });
    try {
      const worker = await getWorker();
      for (let k = 0; k < list.length; k++) {
        setBusy({ i: k + 1, n: list.length });
        try {
          const { ocr, thumb } = await prepImage(list[k]);
          const { data } = await worker.recognize(ocr);
          const p = parseSlip(data.text, now);
          out.push({
            id: uid(),
            amount: p.amount ? String(p.amount) : "",
            note: p.note || t("scan.slipNote"),
            dateKey: p.dateKey,
            time: p.time,
            income: false,
            ref: p.ref,
            dup: false,
            thumb,
          });
        } catch {
          /* ข้ามรูปที่อ่านไม่ได้ */
        }
      }
    } catch {
      setBusy(null);
      alert(t("scan.error"));
      return;
    }
    setBusy(null);
    if (out.length === 0) {
      alert(t("scan.error"));
      return;
    }
    const known = new Set(existing.map((x) => x.ref).filter((r): r is string => !!r));
    for (const d of out) {
      if (known.has(d.ref)) d.dup = true;
      known.add(d.ref);
    }
    setDrafts(out);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arr = Array.from(e.target.files ?? []);
    e.target.value = "";
    void handleFiles(arr);
  };

  const upd = (id: string, patch: Partial<Draft>) =>
    setDrafts((arr) => (arr ? arr.map((d) => (d.id === id ? { ...d, ...patch } : d)) : arr));

  const validCount = drafts ? drafts.filter((d) => Number(d.amount) > 0).length : 0;

  const saveAll = () => {
    if (!drafts) return;
    const list: Tx[] = [];
    for (const d of drafts) {
      const amt = Number(d.amount);
      if (!(amt > 0)) continue;
      const [hh, mi] = d.time.split(":").map(Number);
      const when = fromKey(d.dateKey);
      when.setHours(hh || 0, mi || 0, 0, 0);
      list.push({
        id: uid(),
        amount: amt,
        category: "other",
        note: d.note.trim(),
        dateKey: d.dateKey,
        ts: when.getTime(),
        icon: d.income ? "Banknote" : "Receipt",
        income: d.income || undefined,
        ref: d.ref,
      });
    }
    if (list.length === 0) return;
    onSaveTxs(list);
    setDrafts(null);
    setToast(t("scan.saved", { n: list.length }));
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <>
      <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <ScanLine size={18} />
          </span>
          <h2 className="text-sm font-medium text-slate-600">{t("scan.title")}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => camRef.current?.click()}
            disabled={!!busy}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-500 font-semibold text-white active:bg-emerald-600 disabled:opacity-50"
          >
            <Camera size={20} /> {t("scan.camera")}
          </button>
          <button
            onClick={() => galRef.current?.click()}
            disabled={!!busy}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-100 font-semibold text-slate-700 active:bg-slate-200 disabled:opacity-50"
          >
            <ImagePlus size={20} /> {t("scan.gallery")}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">{t("scan.hint")}</p>

        {busy && (
          <div className="mt-3 flex items-start gap-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            <span className="mt-0.5 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-emerald-300 border-t-emerald-600" />
            <span>
              {t("scan.loading", { i: busy.i, n: busy.n })}
              {!workerRef.current && (
                <span className="mt-1 block text-xs text-emerald-600">{t("scan.firstTime")}</span>
              )}
            </span>
          </div>
        )}

        <input
          ref={camRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onPick}
        />
        <input
          ref={galRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onPick}
        />
      </section>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-slate-800 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {drafts && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={() => setDrafts(null)}
        >
          <div
            className="mx-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{t("scan.review")}</h3>
              <button
                onClick={() => setDrafts(null)}
                className="p-2 text-slate-400"
                aria-label={t("common.close")}
              >
                <X size={20} />
              </button>
            </div>

            {drafts.map((d) => {
              const bad = !(Number(d.amount) > 0);
              return (
                <div
                  key={d.id}
                  className={`mb-3 rounded-2xl border p-3 ${
                    bad ? "border-rose-300 bg-rose-50" : "border-slate-200"
                  }`}
                >
                  <div className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.thumb}
                      alt=""
                      className="h-16 w-12 shrink-0 rounded-lg bg-slate-100 object-cover"
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          inputMode="decimal"
                          value={d.amount}
                          onChange={(e) => upd(d.id, { amount: e.target.value })}
                          placeholder={t("quick.amountPh")}
                          className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-lg font-bold outline-none focus:border-emerald-500"
                        />
                        <input
                          value={d.note}
                          onChange={(e) => upd(d.id, { note: e.target.value })}
                          placeholder={t("quick.notePh")}
                          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-400">
                          {fromKey(d.dateKey).toLocaleDateString(LOCALE, {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          · {d.time}
                        </span>
                        <div className="flex overflow-hidden rounded-full bg-slate-100 text-xs font-medium">
                          <button
                            onClick={() => upd(d.id, { income: false })}
                            className={`px-3 py-1.5 ${
                              !d.income ? "bg-rose-500 text-white" : "text-slate-500"
                            }`}
                          >
                            {t("scan.expense")}
                          </button>
                          <button
                            onClick={() => upd(d.id, { income: true })}
                            className={`px-3 py-1.5 ${
                              d.income ? "bg-emerald-500 text-white" : "text-slate-500"
                            }`}
                          >
                            {t("scan.income")}
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setDrafts((arr) => {
                          const next = (arr ?? []).filter((x) => x.id !== d.id);
                          return next.length ? next : null;
                        })
                      }
                      className="h-8 w-8 shrink-0 text-slate-400"
                      aria-label={t("scan.remove")}
                    >
                      <X size={16} className="mx-auto" />
                    </button>
                  </div>
                  {bad && <p className="mt-2 text-xs text-rose-600">{t("scan.noAmount")}</p>}
                  {d.dup && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle size={12} /> {t("scan.dup")}
                    </p>
                  )}
                </div>
              );
            })}

            <button
              onClick={saveAll}
              disabled={validCount === 0}
              className="sticky bottom-0 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-bold text-white shadow-lg active:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              <Check size={18} /> {t("scan.saveAll", { n: validCount })}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ================================================================
   Dashboard
================================================================ */
function Dashboard({
  data,
  setData,
  now,
  onOpenSettings,
  onOpenProfile,
}: {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  now: Date;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}) {
  const t = useT();
  const todayKey = toKey(now);

  const calc = useMemo(() => {
    const fixedTotal = data.fixed.reduce((s, f) => s + f.amount, 0);
    const net = data.budget - fixedTotal;
    // รายรับ (income) นับเป็นลบ = เพิ่มยอดคงเหลือ
    const signed = (x: Tx) => (x.income ? -x.amount : x.amount);
    const spentTotal = data.txs.reduce((s, x) => s + signed(x), 0);
    const spentToday = data.txs
      .filter((x) => x.dateKey === todayKey)
      .reduce((s, x) => s + signed(x), 0);
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
    green: { bar: "bg-emerald-500", text: "text-emerald-600", emoji: "🟢", bg: "bg-emerald-50" },
    yellow: { bar: "bg-amber-400", text: "text-amber-600", emoji: "🟡", bg: "bg-amber-50" },
    red: { bar: "bg-rose-500", text: "text-rose-600", emoji: "🔴", bg: "bg-rose-50" },
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
  const [category, setCategory] = useState("food");
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

  // Edit transaction
  const [editing, setEditing] = useState<Tx | null>(null);
  const [eAmount, setEAmount] = useState("");
  const [eCat, setECat] = useState("food");
  const [eNote, setENote] = useState("");

  const openEdit = (x: Tx) => {
    setEditing(x);
    setEAmount(String(x.amount));
    setECat(catOf(x.category).id);
    setENote(noteLabel(x.note, t));
  };
  const saveEdit = () => {
    const n = Number(eAmount);
    if (!editing || !(n > 0)) return;
    const original = noteLabel(editing.note, t);
    setData((d) => ({
      ...d,
      txs: d.txs.map((x) =>
        x.id === editing.id
          ? {
              ...x,
              amount: n,
              category: eCat,
              note: eNote.trim() === original ? x.note : eNote.trim(),
            }
          : x
      ),
    }));
    setEditing(null);
  };
  const removeTx = (id: string) =>
    setData((d) => ({ ...d, txs: d.txs.filter((x) => x.id !== id) }));

  const resetAll = () => {
    if (!confirm(t("reset.confirm"))) return;
    setData({
      ...defaultData(),
      setupDone: false,
      budget: data.budget,
      fixed: data.fixed,
      quick: data.quick,
      profile: data.profile,
      lang: data.lang,
      font: data.font,
      appKey: data.appKey,
    });
  };

  const recent = data.txs.slice(0, 20);

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
              aria-label={t("profile.edit")}
              className="shrink-0 rounded-full active:scale-95"
            >
              <AvatarView
                avatar={data.profile?.avatar ?? { kind: "default" }}
                className="h-16 w-16 border-4 border-white/70 shadow"
              />
            </button>
            <p className="min-w-0 truncate text-xl font-semibold text-white">
              {t("banner.hello", { name: data.profile?.name ?? "" })}
            </p>
          </div>
        </div>

        {/* Header */}
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">
              {now.toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="text-lg font-bold text-slate-800">
              {t(calc.daysLeft === 1 ? "dash.daysLeft1" : "dash.daysLeft", { n: calc.daysLeft })}
            </h1>
          </div>
          <button
            onClick={onOpenSettings}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm active:bg-slate-100"
            aria-label={t("settings.title")}
          >
            <Settings size={20} />
          </button>
        </header>

        {calc.expired && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{t("dash.expired")}</span>
          </div>
        )}

        {/* Safe to spend */}
        <section className={`mb-4 rounded-3xl p-5 shadow-sm ${zoneStyle.bg}`}>
          <p className="text-sm font-medium text-slate-500">{t("dash.safe")}</p>
          <p
            className={`mt-1 text-5xl font-extrabold tracking-tight ${
              calc.remainingToday < 0 ? "text-rose-600" : zoneStyle.text
            }`}
          >
            {calc.remainingToday < 0 ? "−" : ""}฿{fmt(Math.abs(calc.remainingToday))}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {t("dash.todayBudget", {
              a: fmt(Math.max(0, calc.allowanceToday)),
              b: fmt(calc.spentToday),
            })}
          </p>
          {calc.daysLeft > 1 && (
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <TrendingUp size={14} className="shrink-0" />
              <span>
                {t("dash.tomorrow", { n: fmt(Math.max(0, calc.tomorrow)) })}
                {calc.remainingToday > 0 && ` ${t("dash.carried")}`}
                {calc.remainingToday < 0 && ` ${t("dash.cut")}`}
              </span>
            </p>
          )}
        </section>

        {/* Survival bar */}
        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className={`font-semibold ${zoneStyle.text}`}>
              {zoneStyle.emoji} {t(`zone.${zone}`)}
            </span>
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
            <span>{t("bar.left", { n: fmt(calc.remainingNet) })}</span>
            <span>{t("bar.of", { n: fmt(calc.net) })}</span>
          </div>
        </section>

        {/* Survival insights */}
        {showSurvival && (
          <section className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="mb-1 flex items-center gap-2 font-semibold text-rose-700">
              <Flame size={18} /> {t("surv.title")}
            </div>
            <p className="text-sm font-semibold text-rose-800">
              {t("surv.line", {
                a: fmt(Math.max(0, calc.allowanceToday)),
                b: fmt(perMeal),
              })}
            </p>
            <p className="mt-1 text-xs text-rose-700">
              {t("surv.today", {
                a: fmt(Math.max(0, calc.remainingToday)),
                b: fmt(perMealLeft),
              })}
            </p>
            {calc.remainingNet < 0 && (
              <p className="mt-1 text-xs font-semibold text-rose-700">
                {t("surv.over", { n: fmt(Math.abs(calc.remainingNet)) })}
              </p>
            )}
          </section>
        )}

        {/* Slip scanner */}
        <SlipScanner
          existing={data.txs}
          now={now}
          onSaveTxs={(list) =>
            setData((d) => ({
              ...d,
              txs: [...list, ...d.txs].sort((a, b) => b.ts - a.ts),
            }))
          }
        />

        {/* Quick log */}
        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-600">
              {quickEdit ? t("quick.editTitle") : t("quick.title")}
            </h2>
            <button
              onClick={() => setQuickEdit((v) => !v)}
              className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium ${
                quickEdit ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {quickEdit ? <Check size={14} /> : <Pencil size={14} />}
              {quickEdit ? t("common.done") : t("quick.customize")}
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
                    <span className="truncate font-medium">{quickLabel(q, t)}</span>
                  </span>
                  <span className="ml-2 font-bold text-slate-800">{fmt(q.amount)}</span>
                </button>
              );
            })}
            {quickEdit && (
              <button
                onClick={() =>
                  setQEditor({
                    item: { id: uid(), label: "", amount: 0, category: "food", icon: "Utensils" },
                    isNew: true,
                  })
                }
                className="flex h-16 items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 active:bg-slate-50"
              >
                <Plus size={18} /> {t("quick.add")}
              </button>
            )}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const active = category === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm ${
                      active ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon size={14} /> {t(`cat.${c.id}`)}
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
                placeholder={t("quick.amountPh")}
                className="w-32 rounded-xl border border-slate-200 px-3 py-3 text-lg font-bold outline-none focus:border-emerald-500"
              />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitCustom()}
                placeholder={t("quick.notePh")}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={submitCustom}
              disabled={!(Number(amountStr) > 0)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-base font-bold text-white active:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Plus size={20} /> {t("quick.log")}
            </button>
          </div>
        </section>

        {/* Recent */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-medium text-slate-600">{t("recent.title")}</h2>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">{t("recent.empty")}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((x) => {
                const cat = catOf(x.category);
                const Icon = (x.icon && ICONS[x.icon]) || cat.icon;
                const isToday = x.dateKey === todayKey;
                return (
                  <li key={x.id} className="flex items-center gap-3 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {x.note ? noteLabel(x.note, t) : t(`cat.${cat.id}`)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isToday
                          ? t("recent.today")
                          : fromKey(x.dateKey).toLocaleDateString(LOCALE, {
                              day: "numeric",
                              month: "short",
                            })}{" "}
                        ·{" "}
                        {new Date(x.ts).toLocaleTimeString(LOCALE, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {t(`cat.${cat.id}`)}
                      </p>
                    </div>
                    <span
                      className={`font-bold ${x.income ? "text-emerald-600" : "text-slate-800"}`}
                    >
                      {x.income ? "+" : "−"}
                      {fmt(x.amount)}
                    </span>
                    <button
                      onClick={() => openEdit(x)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 active:bg-slate-100"
                      aria-label={t("common.edit")}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => removeTx(x.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-rose-400 active:bg-rose-50"
                      aria-label={t("common.delete")}
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
          <RotateCcw size={12} /> {t("reset.btn")}
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
              <h3 className="text-lg font-bold text-slate-800">{t("edit.title")}</h3>
              <button
                onClick={() => setEditing(null)}
                className="p-2 text-slate-400"
                aria-label={t("common.close")}
              >
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
                  key={c.id}
                  onClick={() => setECat(c.id)}
                  className={`rounded-full px-3 py-2 text-sm ${
                    eCat === c.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {t(`cat.${c.id}`)}
                </button>
              ))}
            </div>
            <input
              value={eNote}
              onChange={(e) => setENote(e.target.value)}
              placeholder={t("edit.notePh")}
              className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
            />
            <button
              onClick={saveEdit}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-bold text-white active:bg-emerald-600"
            >
              <Check size={18} /> {t("edit.save")}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
