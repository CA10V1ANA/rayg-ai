import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
await mkdir("audit-output", { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport });
    await page.goto("http://127.0.0.1:5173", { waitUntil: "networkidle" });
    await page.locator("#film-tab-signature").click();
    await page.waitForTimeout(3200);
    await page
      .locator("#marca")
      .screenshot({ path: `audit-output/brand-${viewport.width}.png` });
    await page.locator("#kit-tab-ultra").click();
    await page.waitForTimeout(500);
    // Omit fixed navigation only in these tall section-only presentation captures.
    // The regular audit retains the actual header in its viewport screenshots.
    await page.addStyleTag({
      content: ".header,.skip-link{visibility:hidden!important}",
    });
    await page
      .locator("#estojos")
      .screenshot({ path: `audit-output/kits-${viewport.width}.png` });
    await page.close();
  }
} finally {
  await browser.close();
}
