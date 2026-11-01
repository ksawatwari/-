# Step 1 — แยก app/page.tsx ออกเป็นหลายไฟล์

วิธีใส่: แตก zip นี้ทับที่ root ของโปรเจกต์ (โฟลเดอร์เดียวกับ package.json)
  - app/page.tsx  → "ทับ" ไฟล์เดิม (เหลือ ~170 บรรทัด)
  - ที่เหลือเป็นไฟล์ใหม่ทั้งหมดใน lib/ และ components/

โครงสร้างหลังแยก
  app/page.tsx                  ตัวหลัก: โหลด/บันทึกข้อมูล + เลือกหน้าที่จะแสดง
  lib/types.ts                  type ทั้งหมด (Tx, Data, Profile ...)
  lib/i18n.tsx                  คำแปล 4 ภาษา + useT() + getLocale()/setLocale()
  lib/fonts.ts                  รายการฟอนต์
  lib/constants.tsx             หมวดหมู่, ไอคอน, ค่าเริ่มต้นปุ่มด่วน/รายจ่ายคงที่
  lib/utils.ts                  toKey/fromKey/fmt/uid/defaultData
  components/profile.tsx        โปรไฟล์ + อวตาร
  components/theme.tsx          ธีมสี + ลวดลาย
  components/lock.tsx           ล็อกรหัสผ่าน
  components/settings.tsx       หน้าตั้งค่า
  components/setup.tsx          ตั้งงบ
  components/quick-editor.tsx   แก้ปุ่มด่วน
  components/slip-scanner.tsx   สแกนสลิป OCR
  components/dashboard.tsx      หน้าหลัก

พฤติกรรมของแอพไม่เปลี่ยน — ย้ายโค้ดอย่างเดียว
สิ่งเดียวที่ปรับ: ตัวแปร global `LOCALE` เปลี่ยนเป็น getLocale()/setLocale()
เพราะ ES module แก้ตัวแปรข้ามไฟล์ตรงๆ ไม่ได้
