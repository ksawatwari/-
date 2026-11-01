/* Budgy service worker — ใช้งานออฟไลน์ได้
 * ข้อมูลผู้ใช้อยู่ใน localStorage อยู่แล้ว ดังนั้นแค่แคชตัวแอป (HTML + JS/CSS/ฟอนต์) ก็เปิดใช้ออฟไลน์ได้เต็มรูปแบบ
 * แก้โค้ดแอปแล้วอยากให้เครื่องผู้ใช้ล้างแคชเก่า → เปลี่ยน VERSION ด้านล่าง
 */
const VERSION = "v1";
const STATIC = `budgy-static-${VERSION}`; // /_next/static/*, ไอคอน, ฟอนต์ (ชื่อไฟล์มี hash → cache-first ได้)
const PAGES = `budgy-pages-${VERSION}`; // หน้า HTML (network-first)
const CDN = `budgy-cdn-${VERSION}`; // ไฟล์ OCR (tesseract) จาก CDN
const KEEP = [STATIC, PAGES, CDN];
const MAX_STATIC = 250;
const CDN_HOSTS = ["cdn.jsdelivr.net", "tessdata.projectnaptha.com", "unpkg.com"];
const PRECACHE = ["/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGES);
      const statics = await caches.open(STATIC);
      await Promise.allSettled([pages.add("/"), ...PRECACHE.map((u) => statics.add(u))]);
      // ไม่ skipWaiting เอง — รอให้ผู้ใช้กดอัปเดต (กันหน้าจอรีเฟรชกลางคัน)
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n.startsWith("budgy-") && !KEEP.includes(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg.type === "SKIP_WAITING") {
    self.skipWaiting();
  } else if (msg.type === "CACHE_URLS" && Array.isArray(msg.urls)) {
    // หน้าส่งรายการไฟล์ที่โหลดไปแล้ว (ก่อน SW ทำงาน) มาให้แคชทันที → เปิดออฟไลน์ได้ตั้งแต่ครั้งแรก
    event.waitUntil(precacheUrls(msg.urls));
  }
});

async function precacheUrls(urls) {
  const cache = await caches.open(STATIC);
  const wanted = urls.filter((u) => {
    try {
      const x = new URL(u);
      return x.origin === self.location.origin && !x.pathname.startsWith("/api/") && x.pathname !== "/sw.js" && x.pathname !== "/";
    } catch {
      return false;
    }
  });
  await Promise.allSettled(
    wanted.map(async (u) => {
      if (await cache.match(u)) return;
      const res = await fetch(u);
      if (res.ok) await cache.put(u, res);
    })
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (req.headers.get("range")) return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/api/") || url.pathname === "/sw.js") return; // ต้องออนไลน์เสมอ
    if (req.headers.get("RSC") || url.searchParams.has("_rsc")) return;
    if (req.mode === "navigate") {
      event.respondWith(networkFirstPage(req, url));
      return;
    }
    if (url.pathname.startsWith("/_next/static/") || /\.(?:png|jpg|jpeg|svg|ico|webp|woff2?|json)$/i.test(url.pathname)) {
      event.respondWith(cacheFirst(req, STATIC, MAX_STATIC));
      return;
    }
    event.respondWith(staleWhileRevalidate(req, STATIC));
    return;
  }

  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(req, CDN, 40));
  }
});

function fetchWithTimeout(req, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(req, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

async function networkFirstPage(req, url) {
  const cache = await caches.open(PAGES);
  const key = url.pathname === "/" ? "/" : req;
  try {
    const res = await fetchWithTimeout(req, 4000);
    if (res.ok && res.type === "basic") cache.put(key, res.clone());
    return res;
  } catch {
    return (await cache.match(key)) || (await cache.match("/")) || offlineResponse();
  }
}

async function cacheFirst(req, cacheName, max) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) {
      await cache.put(req, res.clone());
      trimCache(cache, max);
    }
    return res;
  } catch {
    return Response.error();
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const net = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return hit || (await net) || Response.error();
}

async function trimCache(cache, max) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

function offlineResponse() {
  return new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title>' +
      '<body style="font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;color:#334155">' +
      "<div><h2>ออฟไลน์ / Offline</h2><p>เปิดแอพตอนออนไลน์สักครั้งเพื่อให้ใช้งานออฟไลน์ได้<br>Open the app once online to enable offline use.</p>" +
      '<button onclick="location.reload()" style="padding:10px 20px;border-radius:12px;border:0;background:#10b981;color:#fff;font-size:16px">ลองใหม่ / Retry</button></div>',
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
