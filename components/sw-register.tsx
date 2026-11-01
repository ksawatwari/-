"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";

const READY_KEY = "budgy-sw-ready";

/* ================================================================
   PWA: ลงทะเบียน service worker (/sw.js) + แถบออฟไลน์ + ปุ่มอัปเดตเวอร์ชัน
   + ขอให้เบราว์เซอร์ "เก็บข้อมูลถาวร" กัน localStorage โดนล้างเมื่อพื้นที่เต็ม
================================================================ */
export function SwRegister() {
  const t = useT();
  const [offline, setOffline] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [readyToast, setReadyToast] = useState(false);
  const updating = useRef(false);

  // สถานะออนไลน์/ออฟไลน์
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    try {
      navigator.storage?.persist?.();
    } catch {
      /* ignore */
    }
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;

    const sw = navigator.serviceWorker;
    const onControllerChange = () => {
      // รีเฟรชเฉพาะตอนผู้ใช้กดอัปเดตเอง (ครั้งแรกที่ SW เข้าควบคุมหน้า จะไม่รีเฟรช)
      if (updating.current) window.location.reload();
    };
    sw.addEventListener("controllerchange", onControllerChange);

    let timer: ReturnType<typeof setInterval> | undefined;
    sw.register("/sw.js")
      .then((reg) => {
        if (reg.waiting && sw.controller) setWaiting(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          nw?.addEventListener("statechange", () => {
            if (nw.state === "installed" && sw.controller) setWaiting(nw);
          });
        });
        timer = setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      })
      .catch(() => {});

    sw.ready.then((reg) => {
      // ส่งรายการไฟล์ที่โหลดไปแล้วให้ SW แคช → ออฟไลน์ได้ตั้งแต่เปิดครั้งแรก
      const urls = performance
        .getEntriesByType("resource")
        .map((e) => e.name)
        .filter((u) => u.startsWith(window.location.origin));
      urls.push(window.location.origin + "/");
      reg.active?.postMessage({ type: "CACHE_URLS", urls });
      try {
        if (!localStorage.getItem(READY_KEY)) {
          localStorage.setItem(READY_KEY, "1");
          setReadyToast(true);
          setTimeout(() => setReadyToast(false), 5000);
        }
      } catch {
        /* ignore */
      }
    });

    return () => {
      sw.removeEventListener("controllerchange", onControllerChange);
      if (timer) clearInterval(timer);
    };
  }, []);

  const applyUpdate = () => {
    updating.current = true;
    waiting?.postMessage({ type: "SKIP_WAITING" });
  };

  return (
    <>
      {offline && (
        <div
          className="fixed inset-x-0 top-0 z-[60] bg-slate-800 px-3 py-1.5 text-center text-xs text-white"
          style={{ paddingTop: "max(0.375rem, env(safe-area-inset-top))" }}
        >
          {t("pwa.offline")}
        </div>
      )}
      {waiting && (
        <button
          onClick={applyUpdate}
          className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg active:bg-emerald-600"
        >
          {t("pwa.update")}
        </button>
      )}
      {readyToast && !waiting && (
        <div className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-slate-800 px-5 py-3 text-sm text-white shadow-lg">
          {t("pwa.ready")}
        </div>
      )}
    </>
  );
}
