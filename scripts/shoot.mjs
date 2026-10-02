// Screenshot di verifica con Playwright.
// Uso: node scripts/shoot.mjs --url http://localhost:3210/ --w 1440 --h 900 --out screenshots/check --at 0,0.5,1 [--intro] [--sel #linea]
// --at: posizioni come frazioni dello scroll totale (oppure, con --sel, frazioni del capitolo: inizio/metà/fine del pin)
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true]);
    return acc;
  }, [])
);
const url = args.url || "http://localhost:3210/";
const w = +(args.w || 1440);
const h = +(args.h || 900);
const out = args.out || "screenshots/check";
const at = String(args.at || "0").split(",").map(Number);
const wait = +(args.wait || 2600);
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: args.reduced ? "reduce" : "no-preference", isMobile: w < 768, hasTouch: w < 768 });
const page = await ctx.newPage();
const logs = [];
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
if (!args.intro) await page.addInitScript(() => sessionStorage.setItem("lda-intro-vista", "1"));
await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(args.intro ? +(args.introwait || 2500) : 2000);

const tag = args.tag || `${w}x${h}`;
// --plan "linea:0.1,0.5|giorno:0,1" = più capitoli in una sola sessione
const plan = args.plan ? String(args.plan).split("|").flatMap((p) => { const [s, fr] = p.split(":"); return fr.split(",").map((f) => ["#" + s, +f]); }) : at.map((f) => [args.sel, f]);
for (const [sel, f] of plan) {
  const y = await page.evaluate(
    ([f, sel]) => {
      if (sel) {
        const el = document.querySelector(sel);
        const pin = el?.closest(".pin-spacer") || el;
        const top = pin.getBoundingClientRect().top + window.scrollY;
        const len = Math.max(0, pin.getBoundingClientRect().height - window.innerHeight);
        return top + len * f;
      }
      return (document.documentElement.scrollHeight - window.innerHeight) * f;
    },
    [f, sel]
  );
  await page.evaluate((y) => {
    const l = window.__lenis;
    window.scrollTo(0, y);
    if (l) l.scrollTo(y, { immediate: true, force: true });
  }, y);
  await page.waitForTimeout(wait);
  const name = path.join(out, `${tag}-${sel ? sel.replace(/[^a-z]/gi, "") + "-" : ""}${String(Math.round(f * 100)).padStart(3, "0")}.png`);
  await page.screenshot({ path: name });
  console.log("shot", name);
}
console.log(logs.length ? logs.slice(0, 30).join("\n") : "no console errors");
await browser.close();
