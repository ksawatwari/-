import type { Config } from "tailwindcss";

// สีของแอปอ่านจากตัวแปร CSS (ตั้งค่าตามธีมที่เลือกใน app/page.tsx → applyTheme)
// emerald-* = สีหลักของธีม, teal-500 = สีปลายของแบนเนอร์ไล่เฉด, slate-50/100/200 = พื้นหลังอ่อนที่ปรับตามธีม
const rgb = (name: string) => `rgb(var(${name}) / <alpha-value>)`;
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        emerald: Object.fromEntries(SHADES.map((s) => [s, rgb(`--ac-${s}`)])),
        teal: { 500: rgb("--ac-alt") },
        slate: {
          50: rgb("--sl-50"),
          100: rgb("--sl-100"),
          200: rgb("--sl-200"),
        },
      },
    },
  },
  plugins: [],
};

export default config;
