// Misura reale (CPU 4×, viewport mobile): candidati LCP, long task, classe finale. Uso: node scripts/marks.mjs
import { chromium } from "@playwright/test";
const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--headless=new"] });
const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await p.addInitScript(() => { window.__lcp = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lcp.push([Math.round(e.startTime), e.size, e.element ? (e.element.tagName + "." + String(e.element.className).slice(0, 40)) : e.url]))).observe({ type: "largest-contentful-paint", buffered: true }); window.__lt = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: "longtask", buffered: true }); });
await p.goto("http://localhost:3211/", { waitUntil: "load" });
await p.waitForTimeout(9000);
console.log(await p.evaluate(() => ({ marks: performance.getEntriesByType("mark").map((m) => m.name + "@" + Math.round(m.startTime)), dcl: Math.round(performance.getEntriesByType("navigation")[0].domContentLoadedEventEnd), lt: window.__lt, lcp: window.__lcp, cls: document.documentElement.className })));
await b.close();
