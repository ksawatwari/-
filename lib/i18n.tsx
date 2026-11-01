"use client";

import { createContext, useContext } from "react";
import {
  Coffee,
  Settings,
  Home,
  Copy,
} from "lucide-react";
import { Lang, Fixed } from "@/lib/types";

/* ================================================================
   i18n  (th, en, fr, de)
================================================================ */
export const LANG_IDX: Record<Lang, number> = { th: 0, en: 1, fr: 2, de: 3 };
export const LOCALES: Record<Lang, string> = {
  th: "th-TH",
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
};
export const LANGS: { id: Lang; flag: string; native: string }[] = [
  { id: "th", flag: "🇹🇭", native: "ไทย" },
  { id: "en", flag: "🇬🇧", native: "English" },
  { id: "fr", flag: "🇫🇷", native: "Français" },
  { id: "de", flag: "🇩🇪", native: "Deutsch" },
];

export type Row = [string, string, string, string];
export const D: Record<string, Row> = {
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

  // theme
  "theme.title": ["สีธีม", "Theme color", "Couleur du thème", "Designfarbe"],
  "theme.colorDesc": ["เลือกโทนสีของแอป", "Pick the app's color tone", "Choisissez la teinte de l'application", "Farbton der App wählen"],
  "theme.pattern": ["ลวดลายพื้นหลัง", "Background pattern", "Motif d'arrière-plan", "Hintergrundmuster"],
  "theme.patternDesc": ["ลายจางๆ อยู่ที่ขอบจอ ไม่บังข้อความ", "Soft art at the screen edges, never behind your text", "Motif discret sur les bords, jamais derrière le texte", "Dezente Motive am Rand, nie hinter dem Text"],
  "theme.cartoon": ["การ์ตูนมินิมอล", "Minimal cartoon", "Dessin minimal", "Minimal-Cartoon"],
  "theme.impress": ["อิมเพรสชันนิสม์", "Impressionism", "Impressionnisme", "Impressionismus"],
  "theme.c.emerald": ["มรกต", "Emerald", "Émeraude", "Smaragd"],
  "theme.c.lavender": ["ลาเวนเดอร์", "Lavender", "Lavande", "Lavendel"],
  "theme.c.rosegold": ["โรสโกลด์", "Rose gold", "Or rose", "Roségold"],
  "theme.c.sage": ["เซจ", "Sage", "Sauge", "Salbei"],
  "theme.c.terracotta": ["เทอราคอตตา", "Terracotta", "Terre cuite", "Terrakotta"],
  "theme.c.mist": ["ฟ้าหมอก", "Mist blue", "Bleu brume", "Nebelblau"],
  "theme.c.mocha": ["มอคค่า", "Mocha", "Moka", "Mokka"],
  "theme.c.charcoal": ["ดำชาร์โคล", "Charcoal", "Charbon", "Anthrazit"],
  "theme.c.pearl": ["ขาวไข่มุก", "Pearl", "Perle", "Perlweiß"],
  "theme.p.none": ["เรียบ", "Plain", "Uni", "Schlicht"],
  "theme.p.clouds": ["เมฆน้อย", "Little clouds", "Petits nuages", "Wölkchen"],
  "theme.p.sprout": ["ต้นกล้า", "Sprouts", "Pousses", "Sprösslinge"],
  "theme.p.lilies": ["สระบัว", "Water lilies", "Nymphéas", "Seerosen"],
  "theme.p.sunrise": ["อรุณรุ่ง", "Sunrise", "Soleil levant", "Sonnenaufgang"],
  "theme.p.meadow": ["ทุ่งป๊อปปี้", "Poppy field", "Champ de coquelicots", "Mohnfeld"],

  // app lock
  "lock.title": [
    "รหัสผ่านเข้าแอป",
    "App passcode",
    "Code de l'appli",
    "App-Code",
  ],
  "lock.desc": [
    "ต้องใส่รหัสตัวเลขก่อนเข้าใช้งาน",
    "Ask for a numeric code before opening the app",
    "Demander un code avant d'ouvrir l'appli",
    "Vor dem Öffnen der App einen Zahlencode verlangen",
  ],
  "lock.enable": [
    "ตั้งรหัสผ่าน",
    "Set a passcode",
    "Définir un code",
    "Code festlegen",
  ],
  "lock.change": [
    "เปลี่ยนรหัสผ่าน",
    "Change passcode",
    "Changer le code",
    "Code ändern",
  ],
  "lock.newRecovery": [
    "สร้างรหัสกู้คืนใหม่",
    "Create a new recovery code",
    "Créer un nouveau code de récupération",
    "Neuen Wiederherstellungscode erstellen",
  ],
  "lock.disable": [
    "ปิดรหัสผ่าน",
    "Turn off passcode",
    "Désactiver le code",
    "Code ausschalten",
  ],
  "lock.on": [
    "เปิดอยู่",
    "On",
    "Activé",
    "Ein",
  ],
  "lock.autoNote": [
    "ล็อกอัตโนมัติเมื่อออกจากแอปเกิน 30 วินาที",
    "Locks automatically after 30 seconds away from the app",
    "Se verrouille après 30 secondes hors de l'appli",
    "Sperrt automatisch, wenn du die App 30 Sekunden verlässt",
  ],
  "lock.enter": [
    "ใส่รหัสผ่าน",
    "Enter passcode",
    "Saisissez le code",
    "Code eingeben",
  ],
  "lock.wrong": [
    "รหัสไม่ถูกต้อง ลองอีกครั้ง",
    "Wrong passcode. Try again.",
    "Code incorrect. Réessayez.",
    "Falscher Code. Versuche es erneut.",
  ],
  "lock.wait": [
    "ใส่ผิดหลายครั้ง รออีก {s} วินาที",
    "Too many attempts. Wait {s}s",
    "Trop d'essais. Attendez {s} s",
    "Zu viele Versuche. Warte {s} s",
  ],
  "lock.forgot": [
    "ลืมรหัสผ่าน?",
    "Forgot passcode?",
    "Code oublié ?",
    "Code vergessen?",
  ],
  "lock.forgotDesc": [
    "เลือกวิธีรีเซ็ตรหัสผ่าน",
    "Choose how to reset your passcode",
    "Choisissez comment réinitialiser votre code",
    "Wähle, wie du deinen Code zurücksetzt",
  ],
  "lock.useRec": [
    "ใช้รหัสกู้คืน",
    "Use my recovery code",
    "Utiliser mon code de récupération",
    "Wiederherstellungscode verwenden",
  ],
  "lock.noRec": [
    "ไม่มีรหัสกู้คืนแล้ว?",
    "No recovery code?",
    "Pas de code de récupération ?",
    "Kein Wiederherstellungscode?",
  ],
  "lock.recEnter": [
    "กรอกรหัสกู้คืน",
    "Enter recovery code",
    "Saisissez le code de récupération",
    "Wiederherstellungscode eingeben",
  ],
  "lock.recEnterDesc": [
    "รหัส 12 ตัวที่ได้ตอนตั้งรหัสผ่าน",
    "The 12-character code you got when setting the passcode",
    "Le code à 12 caractères reçu lors de la création du code",
    "Der 12-stellige Code aus der Einrichtung",
  ],
  "lock.recBad": [
    "รหัสกู้คืนไม่ถูกต้อง",
    "Invalid recovery code",
    "Code de récupération invalide",
    "Ungültiger Wiederherstellungscode",
  ],
  "lock.verify": [
    "ตรวจสอบ",
    "Verify",
    "Vérifier",
    "Prüfen",
  ],
  "lock.wipe": [
    "ล้างข้อมูลทั้งหมดแล้วเริ่มใหม่",
    "Erase all data and start over",
    "Effacer toutes les données et recommencer",
    "Alle Daten löschen und neu beginnen",
  ],
  "lock.wipeWarn": [
    "ข้อมูลทั้งหมดในเครื่องนี้จะถูกลบถาวรและกู้คืนไม่ได้ ใช้เป็นทางเลือกสุดท้ายเท่านั้น",
    "All data on this device will be permanently erased and can't be recovered. Use this as a last resort only.",
    "Toutes les données de cet appareil seront définitivement effacées. À utiliser en dernier recours uniquement.",
    "Alle Daten auf diesem Gerät werden endgültig gelöscht und können nicht wiederhergestellt werden. Nur als letzter Ausweg.",
  ],
  "lock.wipeConfirm": [
    "ยืนยัน ลบทั้งหมด",
    "Yes, erase everything",
    "Oui, tout effacer",
    "Ja, alles löschen",
  ],
  "lock.newPin": [
    "ตั้งรหัสผ่านใหม่",
    "Create a passcode",
    "Créez un code",
    "Neuen Code festlegen",
  ],
  "lock.oldPin": [
    "ใส่รหัสผ่านปัจจุบัน",
    "Enter current passcode",
    "Saisissez le code actuel",
    "Aktuellen Code eingeben",
  ],
  "lock.disableAsk": [
    "ใส่รหัสผ่านเพื่อปิดการล็อก",
    "Enter passcode to turn off the lock",
    "Saisissez le code pour désactiver le verrou",
    "Code eingeben, um die Sperre auszuschalten",
  ],
  "lock.newRecAsk": [
    "ใส่รหัสผ่านเพื่อสร้างรหัสกู้คืนใหม่",
    "Enter passcode to create a new recovery code",
    "Saisissez le code pour créer un nouveau code de récupération",
    "Code eingeben, um einen neuen Wiederherstellungscode zu erstellen",
  ],
  "lock.confirmPin": [
    "ใส่อีกครั้งเพื่อยืนยัน",
    "Enter it again to confirm",
    "Saisissez-le à nouveau",
    "Zur Bestätigung erneut eingeben",
  ],
  "lock.mismatch": [
    "รหัสไม่ตรงกัน ลองตั้งใหม่อีกครั้ง",
    "Codes don't match. Try again.",
    "Les codes ne correspondent pas. Réessayez.",
    "Codes stimmen nicht überein. Versuche es erneut.",
  ],
  "lock.digits": [
    "{n} หลัก",
    "{n} digits",
    "{n} chiffres",
    "{n} Ziffern",
  ],
  "lock.resetNew": [
    "ยืนยันตัวตนสำเร็จ ตั้งรหัสผ่านใหม่ได้เลย",
    "Verified. Create a new passcode.",
    "Vérifié. Créez un nouveau code.",
    "Bestätigt. Lege einen neuen Code fest.",
  ],
  "lock.recTitle": [
    "รหัสกู้คืน",
    "Recovery code",
    "Code de récupération",
    "Wiederherstellungscode",
  ],
  "lock.recDesc": [
    "จดหรือคัดลอกเก็บไว้ในที่ปลอดภัย ใช้รีเซ็ตรหัสผ่านเมื่อลืม และจะแสดงครั้งนี้ครั้งเดียว",
    "Write it down or copy it somewhere safe. You'll need it to reset a forgotten passcode. It's shown only once.",
    "Notez-le ou copiez-le en lieu sûr. Il servira à réinitialiser un code oublié. Il ne s'affiche qu'une seule fois.",
    "Notiere oder kopiere ihn an einem sicheren Ort. Du brauchst ihn, um einen vergessenen Code zurückzusetzen. Er wird nur einmal angezeigt.",
  ],
  "lock.copy": [
    "คัดลอก",
    "Copy",
    "Copier",
    "Kopieren",
  ],
  "lock.copied": [
    "คัดลอกแล้ว",
    "Copied",
    "Copié",
    "Kopiert",
  ],
  "lock.saved": [
    "ฉันเก็บรหัสนี้ไว้แล้ว",
    "I've saved this code",
    "J'ai enregistré ce code",
    "Ich habe den Code gespeichert",
  ],

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

export function tr(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const row = D[key];
  let s = row ? row[LANG_IDX[lang]] : key;
  if (vars) {
    for (const k of Object.keys(vars)) s = s.split(`{${k}}`).join(String(vars[k]));
  }
  return s;
}

export const LangCtx = createContext<Lang>("th");
export type TFn = (key: string, vars?: Record<string, string | number>) => string;
export function useT(): TFn {
  const lang = useContext(LangCtx);
  return (key, vars) => tr(lang, key, vars);
}
export function useLang(): Lang {
  return useContext(LangCtx);
}


let LOCALE = "th-TH";
export const getLocale = () => LOCALE;
export const setLocale = (l: string) => {
  LOCALE = l;
};
