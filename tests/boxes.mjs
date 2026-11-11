import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
await mkdir("audit-output", { recursive: true });
const browser = await chromium.launch();
const reports = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:5173/", {
      waitUntil: "domcontentloaded",
    });
    await page.locator("#product-canvas canvas").waitFor();
    await page.screenshot({ path: `audit-output/product-first-${width}.png` });
    await page.locator("#kit-tab-pro").click();
    await page.locator("#case-canvas canvas").waitFor();
    await page.waitForFunction(
      () => !document.querySelector("#case-toggle").disabled,
    );
    await page
      .locator(".case-viewer")
      .screenshot({ path: `audit-output/case-${width}-closed.png` });
    for (const key of ["pro", "essencial", "ultra"]) {
      await page.locator(`#kit-tab-${key}`).click();
      await page.waitForFunction(
        (value) =>
          document.querySelector("#case-canvas").dataset.variant === value,
        key,
      );
      await page.locator("#case-opening").fill("0");
      await page.waitForFunction(
        () =>
          document.querySelector("#case-canvas").dataset.opening === "0.000",
      );
      assert.equal(
        await page.locator("#case-canvas").getAttribute("data-camera-yaw"),
        "33.7",
      );
      await page.locator("#case-toggle").click();
      await page.waitForFunction(
        () =>
          document.querySelector("#case-canvas").dataset.opening === "1.000",
      );
      assert.equal(
        await page.locator("#case-canvas").getAttribute("data-camera-yaw"),
        "0.0",
      );
      assert.equal(
        await page.locator("#case-canvas").getAttribute("data-lid-angle"),
        key === "essencial" ? "18.0" : key === "ultra" ? "112.0" : "106.0",
      );
      assert.equal(
        await page.locator("#case-canvas").getAttribute("data-mechanism"),
        key === "essencial"
          ? "lift-off"
          : key === "ultra"
            ? "staged-drawer"
            : "hinged",
      );
      if (key === "essencial") {
        assert.equal(
          await page.locator("#case-canvas").getAttribute("data-lid-lift"),
          "1.700",
        );
        assert.equal(
          await page.locator("#case-canvas").getAttribute("data-lid-slide"),
          "4.800",
        );
      }
      if (key === "ultra")
        assert.equal(
          await page.locator("#case-canvas").getAttribute("data-drawer-offset"),
          "1.800",
        );
      await page
        .locator(".case-viewer")
        .screenshot({ path: `audit-output/case-${width}-${key}-open.png` });
      await page.locator("#case-opening").fill("50");
      await page.waitForFunction(
        () =>
          document.querySelector("#case-canvas").dataset.opening === "0.500",
      );
      const yaw = Number(
        await page.locator("#case-canvas").getAttribute("data-camera-yaw"),
      );
      assert.ok(yaw > 0 && yaw < 33.7);
      if (key === "pro")
        assert.equal(
          await page.locator("#case-canvas").getAttribute("data-lid-angle"),
          "53.0",
        );
      if (key === "essencial")
        assert.equal(
          await page.locator("#case-canvas").getAttribute("data-lid-lift"),
          "1.700",
        );
      if (key === "ultra") {
        assert.equal(
          await page.locator("#case-canvas").getAttribute("data-drawer-offset"),
          "0.000",
        );
        assert.ok(
          Number(
            await page.locator("#case-canvas").getAttribute("data-lid-angle"),
          ) > 100,
        );
        await page.locator("#case-opening").fill("75");
        await page.waitForFunction(
          () =>
            document.querySelector("#case-canvas").dataset.opening === "0.750",
        );
        assert.equal(
          await page.locator("#case-canvas").getAttribute("data-lid-angle"),
          "112.0",
        );
        const offset = Number(
          await page.locator("#case-canvas").getAttribute("data-drawer-offset"),
        );
        assert.ok(offset > 0 && offset < 1.8);
      }
      await page.locator("#case-toggle").click();
      await page.waitForFunction(
        () =>
          document.querySelector("#case-canvas").dataset.opening === "0.000",
      );
    }
    await page.locator("#kit-tab-essencial").click();
    await page.locator("#case-toggle").click();
    await page.waitForFunction(
      () => document.querySelector("#case-canvas").dataset.opening === "1.000",
    );
    await page.locator("#kit-tab-pro").click();
    assert.equal(await page.locator("#case-opening").inputValue(), "0");
    await page.waitForFunction(
      () =>
        document.querySelector("#case-canvas").dataset.variant === "pro" &&
        document.querySelector("#case-canvas").dataset.opening === "0.000",
    );
    await page.locator("#kit-tab-essencial").click();
    assert.equal(await page.locator("#case-opening").inputValue(), "100");
    await page.waitForFunction(
      () =>
        document.querySelector("#case-canvas").dataset.variant ===
          "essencial" &&
        document.querySelector("#case-canvas").dataset.opening === "1.000",
    );
    await page.locator("#kit-tab-ultra").click();
    await page.locator("#case-toggle").click();
    await page.locator("#case-toggle").click();
    await page.waitForFunction(
      () => document.querySelector("#case-canvas").dataset.opening === "0.000",
    );
    await page.locator("#case-opening").focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await page.locator("#case-opening").inputValue(), "1");
    await page.locator(".kit-reference summary").click();
    await page.waitForFunction(
      () => document.querySelector(".kit-reference img").naturalWidth > 0,
    );
    await page.locator(".kit-reference summary").click();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.locator("#contrast").click();
    await page.waitForTimeout(250);
    const contrast = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    reports.push({
      width,
      errors,
      normal: result.violations,
      highContrast: contrast.violations,
    });
    await context.close();
  }
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:5173/");
  await page.locator("#kit-tab-pro").click();
  await page.waitForFunction(
    () => !document.querySelector("#case-toggle").disabled,
  );
  await page.locator("#case-toggle").click();
  await page.waitForFunction(
    () => document.querySelector("#case-canvas").dataset.opening === "1.000",
  );
  await context.close();
  await writeFile(
    "audit-output/boxes-report.json",
    JSON.stringify(reports, null, 2),
  );
  assert.deepEqual(
    reports.flatMap((r) => r.errors),
    [],
  );
  const violations = reports.flatMap((r) => [...r.normal, ...r.highContrast]);
  assert.equal(
    violations.length,
    0,
    violations
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join()).join("; ")}`)
      .join("\n"),
  );
  console.log(
    "Passed: removable lid, hinged lid, two-stage Ultra drawer, independent plan states, reversal, keyboard, reduced motion, responsive layout and WCAG AA.",
  );
} finally {
  await browser.close();
}
