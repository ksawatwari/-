// ฐานข้อมูลอาหารไทยที่พบบ่อย (ค่าประมาณต่อ 1 หน่วยบริโภคทั่วไป)
// ค่าจริงต่างกันตามร้าน/ปริมาณ — ใช้เป็นจุดตั้งต้น แก้ตัวเลขได้ตอนบันทึก
export type FoodGroup = "rice" | "noodle" | "dish" | "protein" | "snack" | "fruit" | "drink";

export type FoodPreset = {
  id: string;
  th: string;
  en: string;
  servingTh: string;
  servingEn: string;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  sugar: number;
  fiber: number;
  sodium: number; // mg
  group: FoodGroup;
  sweet?: boolean; // เครื่องดื่มหวาน → นับเข้าโควตา "เครื่องดื่มหวาน"
};

export const FOOD_GROUPS: FoodGroup[] = ["rice", "noodle", "dish", "protein", "snack", "fruit", "drink"];

export const FOOD_PRESETS: FoodPreset[] = [
  { id: "rice", th: "ข้าวสวย", en: "Steamed rice", servingTh: "1 จาน (~200 g)", servingEn: "1 plate (~200 g)", kcal: 260, protein: 5, carb: 57, fat: 0.5, sugar: 0, fiber: 0.5, sodium: 5, group: "rice" },
  { id: "khaomunkai", th: "ข้าวมันไก่", en: "Hainanese chicken rice", servingTh: "1 จาน", servingEn: "1 plate", kcal: 590, protein: 25, carb: 70, fat: 22, sugar: 3, fiber: 1, sodium: 1000, group: "rice" },
  { id: "krapao", th: "ข้าวกะเพราหมูสับไข่ดาว", en: "Basil pork rice + fried egg", servingTh: "1 จาน", servingEn: "1 plate", kcal: 610, protein: 26, carb: 62, fat: 30, sugar: 4, fiber: 2, sodium: 1300, group: "rice" },
  { id: "khaophad", th: "ข้าวผัดหมู", en: "Pork fried rice", servingTh: "1 จาน", servingEn: "1 plate", kcal: 590, protein: 18, carb: 77, fat: 22, sugar: 3, fiber: 1.5, sodium: 1150, group: "rice" },
  { id: "moothod", th: "ข้าวหมูทอดกระเทียม", en: "Garlic pork rice", servingTh: "1 จาน", servingEn: "1 plate", kcal: 600, protein: 24, carb: 68, fat: 24, sugar: 2, fiber: 1, sodium: 950, group: "rice" },
  { id: "khaakamoo", th: "ข้าวขาหมู", en: "Stewed pork leg rice", servingTh: "1 จาน", servingEn: "1 plate", kcal: 690, protein: 26, carb: 70, fat: 33, sugar: 5, fiber: 2, sodium: 1400, group: "rice" },
  { id: "moodaeng", th: "ข้าวหมูแดง", en: "BBQ pork rice", servingTh: "1 จาน", servingEn: "1 plate", kcal: 540, protein: 22, carb: 78, fat: 17, sugar: 12, fiber: 1, sodium: 1000, group: "rice" },
  { id: "khaokai", th: "ข้าวไข่เจียวหมูสับ", en: "Omelette rice", servingTh: "1 จาน", servingEn: "1 plate", kcal: 520, protein: 18, carb: 52, fat: 26, sugar: 1, fiber: 0.5, sodium: 700, group: "rice" },
  { id: "gaengkiew", th: "ข้าวแกงเขียวหวานไก่", en: "Green curry chicken + rice", servingTh: "1 จาน", servingEn: "1 plate", kcal: 580, protein: 22, carb: 70, fat: 22, sugar: 6, fiber: 3, sodium: 1300, group: "rice" },
  { id: "khaotom", th: "ข้าวต้มหมู", en: "Pork rice porridge", servingTh: "1 ชาม", servingEn: "1 bowl", kcal: 260, protein: 12, carb: 38, fat: 6, sugar: 1, fiber: 1, sodium: 1100, group: "rice" },
  { id: "khaoniew", th: "ข้าวเหนียว", en: "Sticky rice", servingTh: "1 ห่อ (~100 g)", servingEn: "1 pack (~100 g)", kcal: 200, protein: 4, carb: 43, fat: 0.5, sugar: 0, fiber: 1, sodium: 5, group: "rice" },
  { id: "padthai", th: "ผัดไทยกุ้งสด", en: "Pad Thai with shrimp", servingTh: "1 จาน", servingEn: "1 plate", kcal: 640, protein: 22, carb: 80, fat: 23, sugar: 18, fiber: 3, sodium: 1500, group: "noodle" },
  { id: "kwaytiao", th: "ก๋วยเตี๋ยวหมูน้ำใส", en: "Pork noodle soup", servingTh: "1 ชาม", servingEn: "1 bowl", kcal: 340, protein: 17, carb: 48, fat: 8, sugar: 4, fiber: 2, sodium: 1600, group: "noodle" },
  { id: "bami", th: "บะหมี่หมูแดงแห้ง", en: "Dry egg noodles + BBQ pork", servingTh: "1 ชาม", servingEn: "1 bowl", kcal: 480, protein: 20, carb: 65, fat: 16, sugar: 8, fiber: 2, sodium: 1500, group: "noodle" },
  { id: "radna", th: "ราดหน้าหมู", en: "Noodles in gravy", servingTh: "1 จาน", servingEn: "1 plate", kcal: 480, protein: 20, carb: 60, fat: 16, sugar: 5, fiber: 3, sodium: 1700, group: "noodle" },
  { id: "padsiew", th: "ผัดซีอิ๊วหมู", en: "Stir-fried noodles w/ soy sauce", servingTh: "1 จาน", servingEn: "1 plate", kcal: 620, protein: 20, carb: 80, fat: 24, sugar: 10, fiber: 3, sodium: 1600, group: "noodle" },
  { id: "mama", th: "บะหมี่กึ่งสำเร็จรูป (ต้ม)", en: "Instant noodles", servingTh: "1 ซอง", servingEn: "1 pack", kcal: 300, protein: 6, carb: 43, fat: 12, sugar: 2, fiber: 2, sodium: 1700, group: "noodle" },
  { id: "somtam", th: "ส้มตำไทย", en: "Papaya salad (Thai)", servingTh: "1 จาน", servingEn: "1 plate", kcal: 120, protein: 3, carb: 24, fat: 2, sugar: 16, fiber: 4, sodium: 1200, group: "dish" },
  { id: "tomyum", th: "ต้มยำกุ้งน้ำใส", en: "Tom yum goong (clear)", servingTh: "1 ถ้วย", servingEn: "1 bowl", kcal: 100, protein: 13, carb: 6, fat: 3, sugar: 3, fiber: 1, sodium: 1300, group: "dish" },
  { id: "larb", th: "ลาบหมู", en: "Pork larb", servingTh: "1 จาน", servingEn: "1 plate", kcal: 220, protein: 20, carb: 6, fat: 13, sugar: 2, fiber: 2, sodium: 1100, group: "dish" },
  { id: "gaiyang", th: "ไก่ย่าง (น่อง)", en: "Grilled chicken drumstick", servingTh: "1 น่อง", servingEn: "1 piece", kcal: 230, protein: 26, carb: 3, fat: 12, sugar: 2, fiber: 0, sodium: 600, group: "protein" },
  { id: "chickbreast", th: "อกไก่ต้ม/ย่าง (ไม่มีหนัง)", en: "Chicken breast (skinless)", servingTh: "100 g", servingEn: "100 g", kcal: 165, protein: 31, carb: 0, fat: 3.6, sugar: 0, fiber: 0, sodium: 75, group: "protein" },
  { id: "eggfry", th: "ไข่ดาว", en: "Fried egg", servingTh: "1 ฟอง", servingEn: "1 egg", kcal: 95, protein: 6, carb: 0.5, fat: 7.5, sugar: 0.3, fiber: 0, sodium: 95, group: "protein" },
  { id: "eggboil", th: "ไข่ต้ม", en: "Boiled egg", servingTh: "1 ฟอง", servingEn: "1 egg", kcal: 75, protein: 6.5, carb: 0.5, fat: 5, sugar: 0.3, fiber: 0, sodium: 65, group: "protein" },
  { id: "moopping", th: "หมูปิ้ง", en: "Grilled pork skewer", servingTh: "1 ไม้", servingEn: "1 skewer", kcal: 90, protein: 6, carb: 6, fat: 5, sugar: 4, fiber: 0, sodium: 180, group: "protein" },
  { id: "gaengjued", th: "แกงจืดเต้าหู้หมูสับ", en: "Tofu & pork clear soup", servingTh: "1 ถ้วย", servingEn: "1 bowl", kcal: 90, protein: 8, carb: 4, fat: 5, sugar: 1, fiber: 0.5, sodium: 800, group: "dish" },
  { id: "phadphak", th: "ผัดผักรวม", en: "Stir-fried mixed vegetables", servingTh: "1 จาน", servingEn: "1 plate", kcal: 130, protein: 4, carb: 10, fat: 9, sugar: 5, fiber: 3, sodium: 700, group: "dish" },
  { id: "bread", th: "ขนมปังแผ่น", en: "Bread slice", servingTh: "1 แผ่น", servingEn: "1 slice", kcal: 80, protein: 3, carb: 15, fat: 1, sugar: 1.5, fiber: 1, sodium: 150, group: "snack" },
  { id: "sandwich", th: "แซนด์วิชแฮมชีส", en: "Ham & cheese sandwich", servingTh: "1 ชิ้น", servingEn: "1 piece", kcal: 300, protein: 13, carb: 32, fat: 13, sugar: 5, fiber: 2, sodium: 800, group: "snack" },
  { id: "corn", th: "ข้าวโพดต้ม", en: "Boiled corn", servingTh: "1 ฝัก", servingEn: "1 cob", kcal: 120, protein: 3, carb: 26, fat: 1, sugar: 5, fiber: 3, sodium: 5, group: "snack" },
  { id: "chips", th: "มันฝรั่งทอดกรอบ", en: "Potato chips", servingTh: "1 ถุงเล็ก (30 g)", servingEn: "1 small bag (30 g)", kcal: 160, protein: 2, carb: 15, fat: 10, sugar: 0.5, fiber: 1, sodium: 170, group: "snack" },
  { id: "icecream", th: "ไอศกรีมกะทิ", en: "Coconut ice cream", servingTh: "1 สกู๊ป", servingEn: "1 scoop", kcal: 150, protein: 2, carb: 18, fat: 8, sugar: 15, fiber: 0.5, sodium: 30, group: "snack" },
  { id: "yogurt", th: "โยเกิร์ตรสธรรมชาติ", en: "Plain yogurt", servingTh: "1 ถ้วย (150 g)", servingEn: "1 cup (150 g)", kcal: 90, protein: 5, carb: 7, fat: 5, sugar: 7, fiber: 0, sodium: 60, group: "snack" },
  { id: "banana", th: "กล้วยหอม", en: "Banana", servingTh: "1 ลูก", servingEn: "1 piece", kcal: 90, protein: 1, carb: 23, fat: 0.3, sugar: 12, fiber: 2, sodium: 1, group: "fruit" },
  { id: "orange", th: "ส้ม", en: "Orange", servingTh: "1 ผล", servingEn: "1 piece", kcal: 60, protein: 1, carb: 15, fat: 0.2, sugar: 12, fiber: 3, sodium: 0, group: "fruit" },
  { id: "apple", th: "แอปเปิ้ล", en: "Apple", servingTh: "1 ลูก", servingEn: "1 piece", kcal: 95, protein: 0.5, carb: 25, fat: 0.3, sugar: 19, fiber: 4, sodium: 2, group: "fruit" },
  { id: "guava", th: "ฝรั่ง", en: "Guava", servingTh: "½ ผล", servingEn: "½ fruit", kcal: 55, protein: 2, carb: 12, fat: 0.5, sugar: 7, fiber: 5, sodium: 2, group: "fruit" },
  { id: "mango", th: "มะม่วงสุก", en: "Ripe mango", servingTh: "½ ผล", servingEn: "½ fruit", kcal: 100, protein: 1, carb: 25, fat: 0.5, sugar: 22, fiber: 2, sodium: 2, group: "fruit" },
  { id: "watermelon", th: "แตงโม", en: "Watermelon", servingTh: "1 ชิ้นใหญ่ (200 g)", servingEn: "1 large slice (200 g)", kcal: 60, protein: 1, carb: 15, fat: 0.3, sugar: 12, fiber: 1, sodium: 2, group: "fruit" },
  { id: "icedcoffee", th: "กาแฟเย็น (นม+น้ำตาล)", en: "Iced coffee w/ milk & sugar", servingTh: "1 แก้ว", servingEn: "1 glass", kcal: 250, protein: 4, carb: 36, fat: 10, sugar: 32, fiber: 0, sodium: 80, group: "drink", sweet: true },
  { id: "bubbletea", th: "ชานมไข่มุก", en: "Bubble milk tea", servingTh: "1 แก้ว", servingEn: "1 glass", kcal: 450, protein: 3, carb: 78, fat: 12, sugar: 45, fiber: 1, sodium: 100, group: "drink", sweet: true },
  { id: "thaitea", th: "ชาเย็น", en: "Thai iced tea", servingTh: "1 แก้ว", servingEn: "1 glass", kcal: 320, protein: 3, carb: 50, fat: 12, sugar: 40, fiber: 0, sodium: 60, group: "drink", sweet: true },
  { id: "cola", th: "น้ำอัดลม", en: "Soft drink", servingTh: "1 กระป๋อง (325 ml)", servingEn: "1 can (325 ml)", kcal: 140, protein: 0, carb: 35, fat: 0, sugar: 35, fiber: 0, sodium: 45, group: "drink", sweet: true },
  { id: "greentea", th: "ชาเขียวพร้อมดื่ม (หวาน)", en: "Bottled sweet green tea", servingTh: "1 ขวด (500 ml)", servingEn: "1 bottle (500 ml)", kcal: 190, protein: 0, carb: 46, fat: 0, sugar: 44, fiber: 0, sodium: 50, group: "drink", sweet: true },
  { id: "orangejuice", th: "น้ำส้มกล่อง", en: "Boxed orange juice", servingTh: "1 กล่อง (200 ml)", servingEn: "1 box (200 ml)", kcal: 90, protein: 1, carb: 21, fat: 0, sugar: 20, fiber: 0, sodium: 10, group: "drink", sweet: true },
  { id: "yakult", th: "นมเปรี้ยว/โยเกิร์ตดริ๊งค์", en: "Drinking yogurt", servingTh: "1 ขวด", servingEn: "1 bottle", kcal: 140, protein: 2, carb: 30, fat: 1, sugar: 26, fiber: 0, sodium: 50, group: "drink", sweet: true },
  { id: "milk", th: "นมจืด", en: "Plain milk", servingTh: "1 กล่อง (200 ml)", servingEn: "1 box (200 ml)", kcal: 130, protein: 7, carb: 9.5, fat: 7, sugar: 9.5, fiber: 0, sodium: 100, group: "drink" },
  { id: "americano", th: "อเมริกาโน่ (ไม่ใส่น้ำตาล)", en: "Americano (no sugar)", servingTh: "1 แก้ว", servingEn: "1 cup", kcal: 5, protein: 0.3, carb: 0, fat: 0, sugar: 0, fiber: 0, sodium: 5, group: "drink" },
];
