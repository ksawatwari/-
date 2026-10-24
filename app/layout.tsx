import type { Metadata, Viewport } from "next";
import { Anuphan } from "next/font/google";
import "./globals.css";

const anuphan = Anuphan({
  subsets: ["latin", "thai"],
  variable: "--font-anuphan",
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
  return (
    <html lang="th">
      <body className={anuphan.variable}>{children}</body>
    </html>
  );
}
