import { chromium } from "@playwright/test";
const [w, h] = (process.argv[2] || "1440x900").split("x").map(Number);
const b = await chromium.launch({ args: ["--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: w, height: h } });
const errs=[]; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type()==="error" && errs.push(m.text()));
await p.goto(process.argv[3] || "http://localhost:3210/", { waitUntil: "domcontentloaded" });
const t0 = Date.now();
for (const t of [1.5, 2.6, 3.4, 4.2, 5.2, 6.4, 7.6, 9]) {
  const wait = t*1000 - (Date.now()-t0); if (wait>0) await p.waitForTimeout(wait);
  await p.screenshot({ path: `screenshots/dev/intro-${w}-${String(t).replace(".","_")}.png` });
}
console.log(errs.join("\n") || "no errors");
await b.close();
