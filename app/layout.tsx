import type { Metadata, Viewport } from "next";
import { Anuphan, Prompt, Kanit, Sarabun, Mali, Mitr } from "next/font/google";
import "./globals.css";

const anuphan = Anuphan({
  subsets: ["latin", "thai"],
  variable: "--font-anuphan",
  display: "swap",
});
const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
});
const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
  display: "swap",
});
const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun",
  display: "swap",
});
const mali = Mali({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mali",
  display: "swap",
});
const mitr = Mitr({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-mitr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Survival Budget",
  description: "บริหารเงินให้อยู่รอดถึงสิ้นเดือน",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontVars = [
    anuphan.variable,
    prompt.variable,
    kanit.variable,
    sarabun.variable,
    mali.variable,
    mitr.variable,
  ].join(" ");

  return (
    <html lang="th">
      <body
        className={fontVars}
        style={{ fontFamily: "var(--font-anuphan), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
