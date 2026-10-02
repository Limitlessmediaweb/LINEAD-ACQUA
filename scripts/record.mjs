// Registra i video per i social con Playwright e li converte in MP4 H.264 yuv420p.
// Uso: node scripts/record.mjs film-mobile|walktour-mobile|film-desktop [baseUrl]
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const which = process.argv[2];
const base = process.argv[3] || "http://localhost:3211";
const mobile = which !== "film-desktop";
const vw = mobile ? 390 : 1440, vh = mobile ? 844 : 900, dpr = mobile ? 2 : 1;
const tmp = path.resolve("screenshots/_rec"); fs.mkdirSync(tmp, { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--headless=new", "--use-angle=d3d11", "--ignore-gpu-blocklist", "--enable-gpu-rasterization", "--autoplay-policy=no-user-gesture-required"],
});
const ctx = await browser.newContext({
  viewport: { width: vw, height: vh }, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile,
  recordVideo: { dir: tmp, size: { width: vw * dpr, height: vh * dpr } },
});
const page = await ctx.newPage();
if (which === "walktour-mobile") await page.addInitScript(() => sessionStorage.setItem("lda-intro-vista", "1"));
await page.goto(base + "/", { waitUntil: "load" });

// apre il "cancello" WebGL come farebbe il primo tocco
await page.evaluate(() => window.dispatchEvent(new Event("pointerdown")));

// scorrimento lento e costante, guidato da requestAnimationFrame dentro la pagina
const glide = (from, to, pxPerSec) =>
  page.evaluate(([from, to, v]) => new Promise((res) => {
    let y = from, last = performance.now();
    const step = (t) => {
      const end = to < 0 ? document.documentElement.scrollHeight - innerHeight : to; // la pagina cresce mentre i capitoli si armano
      y = Math.min(end, y + v * ((t - last) / 1000)); last = t;
      const l = window.__lenis; if (l) l.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
      if (y < end) requestAnimationFrame(step); else res();
    };
    requestAnimationFrame(step);
  }), [from, to, pxPerSec]);

const top = (sel, f = 0) => page.evaluate(([sel, f]) => {
  const el = document.querySelector(sel); const box = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
  const r = box.getBoundingClientRect(); return r.top + scrollY + Math.max(0, r.height - innerHeight) * f;
}, [sel, f]);

if (which === "walktour-mobile") {
  // arma i capitoli fino al IV scendendo in ordine, poi riparte dall'inizio del capitolo
  await page.waitForTimeout(1500);
  for (let i = 0; i < 6; i++) { await page.evaluate(() => window.scrollBy(0, innerHeight * 1.5)); await page.waitForTimeout(300); }
  const y0 = await top("#bordo", 0); await page.evaluate((y) => window.scrollTo(0, y - 10), y0); await page.waitForTimeout(2500);
  const y1 = await top("#bordo", 1);
  await glide(y0 - 10, y1 + 200, 260);
  await page.waitForTimeout(800);
} else {
  await page.waitForTimeout(9800); // intro completa
  await page.evaluate(() => window.dispatchEvent(new Event("pointerdown")));
  await page.waitForTimeout(1500);
  const end = which === "film-desktop" ? (await top("#giorno", 1)) + 300 : -1;
  await glide(0, end, mobile ? 520 : 420);
  await page.waitForTimeout(1500);
}
const video = page.video();
await ctx.close(); await browser.close();
const src = await video.path();
const out = path.resolve(`screenshots/${which}.mp4`);
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", src, "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart", out]);
fs.rmSync(src);
console.log("ok", out, execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=width,height", "-of", "csv=p=0", out]).toString().trim().replace(/\n/g, " "));
