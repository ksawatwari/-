// คำแปลของฟีเจอร์ใหม่ (th, en, fr, de) — รวมเข้า D ใน lib/i18n.tsx ด้วย Object.assign
// ขั้นถัดไปเพิ่มคำใหม่ในไฟล์นี้ต่อได้เลย
import { HEALTH } from "@/lib/i18n-health";

type Row = [string, string, string, string];

export const EXTRA: Record<string, Row> = {
  ...HEALTH,
  // งบรายหมวด
  "cb.title": ["งบรายหมวด", "Category budgets", "Budgets par catégorie", "Budgets nach Kategorie"],
  "cb.manage": ["จัดการหมวด", "Manage", "Gérer", "Verwalten"],
  "cb.empty": [
    "ยังไม่ได้ตั้งงบรายหมวด ลองตั้งเพดาน เช่น กาแฟไม่เกิน 800 บาทต่อรอบ แล้วแอพจะเตือนเมื่อใกล้เต็ม",
    "No category budgets yet. Set a cap, e.g. coffee max 800 per cycle, and the app will warn you when it's nearly full.",
    "Aucun budget par catégorie. Fixez un plafond, p. ex. café max 800 par cycle, et l'app vous alertera.",
    "Noch keine Kategorie-Budgets. Setze z. B. max. 800 für Kaffee pro Zyklus – die App warnt dich rechtzeitig.",
  ],
  "cb.set": ["ตั้งงบรายหมวด", "Set category budgets", "Définir les budgets", "Budgets festlegen"],
  "cb.left": ["เหลือ {n}", "{n} left", "Reste {n}", "{n} übrig"],
  "cb.over": ["เกิน {n}", "{n} over", "Dépassé de {n}", "{n} drüber"],
  "cb.warn": ["ใกล้เต็มแล้ว", "Almost full", "Presque atteint", "Fast voll"],

  // จัดการหมวด
  "cm.title": ["หมวดหมู่และงบ", "Categories & budgets", "Catégories et budgets", "Kategorien & Budgets"],
  "cm.hint": [
    "ตั้งชื่อ ไอคอน และเพดานงบต่อรอบ (เว้นว่าง = ไม่จำกัด)",
    "Set the name, icon and a budget cap per cycle (empty = no limit)",
    "Nom, icône et plafond par cycle (vide = illimité)",
    "Name, Symbol und Limit pro Zyklus (leer = unbegrenzt)",
  ],
  "cm.name": ["ชื่อหมวด", "Category name", "Nom de la catégorie", "Kategoriename"],
  "cm.budget": ["งบ/รอบ", "Budget/cycle", "Budget/cycle", "Budget/Zyklus"],
  "cm.add": ["เพิ่มหมวด", "Add category", "Ajouter une catégorie", "Kategorie hinzufügen"],
  "cm.newName": ["หมวดใหม่", "New category", "Nouvelle catégorie", "Neue Kategorie"],
  "cm.delConfirm": [
    "ลบหมวด “{name}”? รายการเดิมในหมวดนี้จะย้ายไป “อื่นๆ”",
    "Delete “{name}”? Its transactions will move to “Other”.",
    "Supprimer « {name} » ? Ses opérations iront dans « Autre ».",
    "„{name}“ löschen? Die Buchungen wechseln zu „Sonstiges“.",
  ],
  "cm.emptyName": [
    "ใส่ชื่อให้ครบทุกหมวดก่อนบันทึก",
    "Name every category before saving",
    "Nommez chaque catégorie avant d'enregistrer",
    "Bitte alle Kategorien benennen",
  ],
  "cm.lockedOther": ["หมวดนี้ลบไม่ได้", "Can't be deleted", "Non supprimable", "Nicht löschbar"],

  // รายการ + ค้นหา/กรอง
  "tag.hint": [
    "💡 ใส่ #แท็ก ในโน้ตได้ เช่น ข้าวมันไก่ #ทริป",
    "💡 Add #tags in the note, e.g. lunch #trip",
    "💡 Ajoutez des #tags dans la note, ex. déjeuner #voyage",
    "💡 #Tags in der Notiz nutzen, z. B. Mittag #Reise",
  ],
  "tl.search": [
    "ค้นหา โน้ต #แท็ก หมวด หรือจำนวนเงิน",
    "Search note, #tag, category or amount",
    "Rechercher note, #tag, catégorie ou montant",
    "Suche Notiz, #Tag, Kategorie oder Betrag",
  ],
  "tl.filters": ["ตัวกรอง", "Filters", "Filtres", "Filter"],
  "tl.all": ["ทั้งหมด", "All", "Tout", "Alle"],
  "tl.out": ["รายจ่าย", "Expenses", "Dépenses", "Ausgaben"],
  "tl.in": ["รายรับ", "Income", "Revenus", "Einnahmen"],
  "tl.from": ["ตั้งแต่", "From", "Du", "Von"],
  "tl.to": ["ถึง", "To", "Au", "Bis"],
  "tl.min": ["ขั้นต่ำ", "Min", "Min", "Min"],
  "tl.max": ["สูงสุด", "Max", "Max", "Max"],
  "tl.clear": ["ล้างตัวกรอง", "Clear filters", "Effacer les filtres", "Filter löschen"],
  "tl.result": ["พบ {n} รายการ", "{n} found", "{n} résultat(s)", "{n} gefunden"],
  "tl.sumOut": ["จ่าย {n}", "Spent {n}", "Dépensé {n}", "Ausgegeben {n}"],
  "tl.sumIn": ["รับ {n}", "In {n}", "Reçu {n}", "Erhalten {n}"],
  "tl.more": ["แสดงเพิ่ม", "Show more", "Voir plus", "Mehr anzeigen"],
  "tl.showAll": ["ดูทั้งหมด ({n})", "View all ({n})", "Tout voir ({n})", "Alle anzeigen ({n})"],
  "tl.noMatch": [
    "ไม่พบรายการที่ตรงกับตัวกรอง",
    "No transactions match",
    "Aucune opération ne correspond",
    "Keine passenden Buchungen",
  ],
  "tl.select": ["เลือกหลายรายการ", "Select", "Sélectionner", "Auswählen"],
  "tl.selected": ["เลือกแล้ว {n}", "{n} selected", "{n} sélectionné(s)", "{n} ausgewählt"],
  "tl.selAll": ["เลือกทั้งหมด", "Select all", "Tout sélectionner", "Alle auswählen"],
  "tl.move": ["ย้ายหมวด", "Change category", "Changer de catégorie", "Kategorie ändern"],
  "tl.delSel": ["ลบที่เลือก", "Delete selected", "Supprimer", "Auswahl löschen"],
  "tl.delConfirm": [
    "ลบ {n} รายการ?",
    "Delete {n} transactions?",
    "Supprimer {n} opérations ?",
    "{n} Buchungen löschen?",
  ],

  // PWA / ออฟไลน์
  "pwa.offline": [
    "ออฟไลน์ — ใช้งานได้ปกติ ข้อมูลบันทึกในเครื่อง",
    "Offline — everything still works, data is saved on this device",
    "Hors ligne — tout fonctionne, données enregistrées sur l'appareil",
    "Offline – alles funktioniert, Daten bleiben auf dem Gerät",
  ],
  "pwa.update": [
    "มีเวอร์ชันใหม่ — แตะเพื่ออัปเดต",
    "New version available — tap to update",
    "Nouvelle version — touchez pour mettre à jour",
    "Neue Version – zum Aktualisieren tippen",
  ],
  "pwa.ready": [
    "พร้อมใช้งานออฟไลน์แล้ว ✓",
    "Ready to use offline ✓",
    "Utilisable hors ligne ✓",
    "Offline nutzbar ✓",
  ],
};
