import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
await mkdir("audit-output", { recursive: true });
const browser = await chromium.launch();
try {
  for (const width of [1440, 900, 390, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
    const brand = page.locator(".scroll-brand");
    const center = await brand.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2;
    });
    assert.ok(
      Math.abs(center - width / 2) < 1,
      `Brand is not centered at ${width}`,
    );
    const overlaps = await page.evaluate(() => {
      const b = document.querySelector(".scroll-brand").getBoundingClientRect();
      return Array.from(
        document.querySelectorAll(
          ".header a:not(.scroll-brand),.header button",
        ),
      )
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.width &&
            r.height &&
            r.left < b.right &&
            r.right > b.left &&
            r.top < b.bottom &&
            r.bottom > b.top
          );
        })
        .map((el) => el.textContent.trim());
    });
    assert.deepEqual(overlaps, [], `Header overlap at ${width}`);
    if (width === 1440 || width === 390) {
      const initial = await new AxeBuilder({ page })
        .include(".header")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        initial.violations.map((v) => v.id),
        [],
      );
    }
    await page.screenshot({ path: `audit-output/navbar-${width}-top.png` });
    await page.evaluate(() =>
      window.scrollTo({ top: 400, behavior: "instant" }),
    );
    await page.waitForFunction(
      () =>
        Math.abs(
          Number(
            document
              .querySelector(".scroll-brand-art > g > text:last-child")
              .getAttribute("x"),
          ) - 122,
        ) < 0.1,
    );
    const letters = await page
      .locator(".scroll-brand-art text")
      .evaluateAll((els) =>
        els
          .filter((el) => {
            let opacity = 1;
            for (
              let p = el;
              p && p.tagName.toLowerCase() !== "svg";
              p = p.parentElement
            )
              opacity *= Number(getComputedStyle(p).opacity);
            return opacity > 0.9;
          })
          .map((el) => el.textContent)
          .join(""),
      );
    assert.equal(letters, "RAI");
    await page.screenshot({
      path: `audit-output/navbar-${width}-scrolled.png`,
    });
    if (width === 1440 || width === 390) {
      const result = await new AxeBuilder({ page })
        .include(".header")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        result.violations.map((v) => v.id),
        [],
      );
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForFunction(
      () =>
        Number(
          document
            .querySelector(".scroll-brand-art > g > text:last-child")
            .getAttribute("x"),
        ) > 316,
    );
    await context.close();
  }
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
  await page.waitForTimeout(150);
  assert.equal(
    await page.locator(".scroll-brand-art text").last().getAttribute("x"),
    "317",
  );
  await page.close();
  console.log(
    "Passed: centered brand, no overlaps at 1440/900/390/320px, RAYG AI → RAI and back, header accessibility, reduced motion.",
  );
} finally {
  await browser.close();
}
