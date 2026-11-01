"use client";

import { useEffect, useRef, useState } from "react";
import { Lang, Data } from "@/lib/types";
import { LOCALES, LANGS, LangCtx, setLocale } from "@/lib/i18n";
import { fontFamilyOf } from "@/lib/fonts";
import { STORAGE_KEY } from "@/lib/constants";
import { defaultData } from "@/lib/utils";
import { ProfileScreen } from "@/components/profile";
import { applyTheme, ThemeBackdrop } from "@/components/theme";
import { AUTOLOCK_MS, LockScreen } from "@/components/lock";
import { SettingsScreen } from "@/components/settings";
import { Setup } from "@/components/setup";
import { Dashboard } from "@/components/dashboard";

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
  const [unlocked, setUnlocked] = useState(false);
  const hiddenAt = useRef(0);

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = { ...defaultData(), ...JSON.parse(raw) } as Data;
        applyTheme(saved.theme); // ตั้งสีก่อนแสดงผล กันกระพริบ
        setData(saved);
      }
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

  // เปลี่ยนสีธีม
  useEffect(() => {
    applyTheme(data.theme);
  }, [data.theme]);

  // ล็อกอัตโนมัติเมื่อออกจากแอปนานเกิน AUTOLOCK_MS
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt.current = Date.now();
      } else if (hiddenAt.current && Date.now() - hiddenAt.current > AUTOLOCK_MS) {
        setUnlocked(false);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const lang: Lang = LANGS.some((l) => l.id === data.lang) ? data.lang : "th";
  setLocale(LOCALES[lang]);

  // ฟอนต์ + lang ของทั้งเว็บ
  useEffect(() => {
    document.body.style.fontFamily = fontFamilyOf(data.font);
    document.documentElement.lang = lang;
  }, [data.font, lang]);

  let content: React.ReactNode;

  if (!loaded) {
    content = <div className="min-h-screen" />;
  } else if (data.lock && !unlocked) {
    content = (
      <LockScreen
        lock={data.lock}
        profile={data.profile}
        onUnlock={() => setUnlocked(true)}
        onReset={(l) => {
          setData((d) => ({ ...d, lock: l }));
          setUnlocked(true);
        }}
      />
    );
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
        theme={data.theme}
        pattern={data.pattern}
        onTheme={(id) => setData((d) => ({ ...d, theme: id }))}
        onPattern={(id) => setData((d) => ({ ...d, pattern: id }))}
        lock={data.lock}
        onLock={(l) => {
          setData((d) => ({ ...d, lock: l }));
          setUnlocked(true);
        }}
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
      {loaded && <ThemeBackdrop pattern={data.pattern} />}
      {content}
    </LangCtx.Provider>
  );
}
