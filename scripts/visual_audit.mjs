#!/usr/bin/env node
/**
 * Automated UI Visual & DOM Audit Script using Playwright
 * Usage: node visual_audit.mjs <url> [outputDir]
 */
import fs from "node:fs";
import path from "node:path";

const targetUrl = process.argv[2] || "http://localhost:3000";
const outDir = path.resolve(process.argv[3] || "./.ui-audit");

const VIEWPORTS = [
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "mobile-390x844", width: 390, height: 844 },
];

async function runAudit() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.error(
      "Playwright is not installed in the current project. Run `npx playwright install chromium` or `npm i -D playwright`.",
    );
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = {
    url: targetUrl,
    timestamp: new Date().toISOString(),
    viewports: {},
  };

  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      const consoleErrors = [];
      const pageErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => pageErrors.push(err.message));

      await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(600);
      // Validate deferred reference assets even when their disclosure is closed.
      await page.evaluate(async () => {
        await Promise.all(
          Array.from(document.images).map((img) => {
            img.loading = "eager";
            return img.decode().catch(() => null);
          }),
        );
      });
      // Reveal scroll-triggered sections before taking a full-page capture.
      const height = await page.evaluate(
        () => document.documentElement.scrollHeight,
      );
      for (let y = 0; y < height; y += vp.height - 100) {
        await page.evaluate(
          (top) => window.scrollTo({ top, behavior: "instant" }),
          y,
        );
        await page.waitForTimeout(80);
      }
      await page.waitForTimeout(700);
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.waitForTimeout(200);

      const metrics = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const brokenImages = Array.from(document.querySelectorAll("img"))
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.getAttribute("src") || "<inline-img>");

        return {
          hasHorizontalOverflow: docWidth > winWidth,
          scrollWidth: docWidth,
          viewportWidth: winWidth,
          brokenImages,
        };
      });

      const screenshotPath = path.join(outDir, `${vp.name}.png`);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-hero.png`) });
      await page.screenshot({ path: screenshotPath, fullPage: true });

      report.viewports[vp.name] = {
        screenshot: screenshotPath,
        ...metrics,
        consoleErrors,
        pageErrors,
      };

      await context.close();
    }

    const reportPath = path.join(outDir, "audit-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}

runAudit().catch((err) => {
  console.error("Audit failed:", err.message);
  process.exit(1);
});
