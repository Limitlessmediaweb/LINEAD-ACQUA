// Scansione automatica WCAG 2.1 AA con axe-core. Uso: node scripts/axe.mjs [baseUrl]
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const base = process.argv[2] || "http://localhost:3211";
const b = await chromium.launch();
for (const path of ["/", "/flotta/aurora", "/cantiere", "/contatti", "/privacy", "/nulla"]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.addInitScript(() => sessionStorage.setItem("lda-intro-vista", "1"));
  await p.goto(base + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const r = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  console.log(`\n${path}: ${r.violations.length} violazioni`);
  for (const v of r.violations) console.log(` - [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length}) e.g. ${v.nodes[0].target.join(" ")} ${v.nodes[0].any?.[0]?.message?.slice(0,120) || ""}`);
  await ctx.close();
}
await b.close();
