import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const url = process.env.AQUILA_URL || "http://127.0.0.1:5175";
const reports = [];
await fs.mkdir("audit-output/aquila", { recursive: true });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      hasTouch: width === 390,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url, { waitUntil: "networkidle" });
    const hero = page.locator(".hero-product-canvas");
    await page.locator(".hero-product.is-ready canvas").waitFor();
    const start = Number(await hero.getAttribute("data-angle"));
    await page.waitForTimeout(width === 1440 ? 21000 : 700);
    const rotated = Number(await hero.getAttribute("data-angle"));
    assert.ok(
      rotated > start + (width === 1440 ? Math.PI * 2 : 0.1),
      "Hero rotates through a complete turn",
    );
    await page.getByRole("button", { name: "Pausar movimento" }).click();
    await page.waitForFunction(
      () =>
        document.querySelector(".hero-product-canvas").dataset.paused ===
        "true",
    );
    const still = await hero.getAttribute("data-angle");
    await page.waitForTimeout(300);
    assert.equal(await hero.getAttribute("data-angle"), still);
    await page.screenshot({
      path: `audit-output/aquila/${width}-turntable-hero.png`,
    });
    await page.getByRole("button", { name: "Retomar movimento" }).click();
    await page.waitForTimeout(350);
    assert.notEqual(await hero.getAttribute("data-angle"), still);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForTimeout(100);
    const reducedAngle = await hero.getAttribute("data-angle");
    await page.waitForTimeout(250);
    assert.equal(await hero.getAttribute("data-angle"), reducedAngle);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    for (const name of ["Essencial", "Signature", "Prestige"]) {
      await page
        .getByRole("button", { name: `Explorar conceito ${name}` })
        .click();
      const dialog = page.getByRole("dialog");
      await dialog.getByRole("button", { name: /Ver caixa/ }).click();
      const canvas = dialog.locator(".case-canvas");
      await page.waitForFunction(
        () => document.querySelector("#case-canvas")?.dataset.cameraPolar,
      );
      await canvas.scrollIntoViewIfNeeded();
      const initialYaw = await canvas.getAttribute("data-camera-yaw");
      const bounds = await canvas.boundingBox();
      await page.mouse.move(
        bounds.x + bounds.width * 0.6,
        bounds.y + bounds.height * 0.5,
      );
      await page.mouse.down();
      await page.mouse.move(
        bounds.x + bounds.width * 0.4,
        bounds.y + bounds.height * 0.65,
        { steps: 10 },
      );
      await page.mouse.up();
      const draggedYaw = await canvas.getAttribute("data-camera-yaw");
      assert.notEqual(draggedYaw, initialYaw, "Drag rotates the box");
      assert.equal(
        await dialog.locator("#case-opening").inputValue(),
        "0",
        "Drag never opens the box",
      );
      await dialog.locator("#case-opening").fill("100");
      await page.waitForFunction(
        () =>
          document.querySelector("#case-canvas").dataset.opening === "1.000",
      );
      assert.equal(
        await canvas.getAttribute("data-camera-yaw"),
        draggedYaw,
        "Opening retains the viewing angle",
      );
      await dialog
        .getByRole("button", { name: "Vista superior", exact: true })
        .click();
      assert.ok(Number(await canvas.getAttribute("data-camera-polar")) < 5);
      await dialog
        .getByRole("button", { name: "Restaurar vista", exact: true })
        .click();
      assert.equal(await canvas.getAttribute("data-camera-yaw"), initialYaw);
      await canvas.focus();
      const polar = Number(await canvas.getAttribute("data-camera-polar"));
      await page.keyboard.press("ArrowUp");
      assert.ok(Number(await canvas.getAttribute("data-camera-polar")) < polar);
      if (name === "Prestige") {
        assert.equal(await canvas.getAttribute("data-finish"), "rose-mat");
        await dialog.locator("#case-opening").fill("0");
        await page.waitForFunction(
          () =>
            document.querySelector("#case-canvas").dataset.opening === "0.000",
        );
        await dialog.locator(".case-viewer").screenshot({
          path: `audit-output/aquila/${width}-case-c-closed.png`,
        });
        await dialog.locator("#case-opening").fill("100");
        await page.waitForFunction(
          () =>
            document.querySelector("#case-canvas").dataset.opening === "1.000",
        );
        await dialog
          .getByRole("button", { name: "Vista superior", exact: true })
          .click();
        await dialog
          .locator(".case-viewer")
          .screenshot({ path: `audit-output/aquila/${width}-case-c-top.png` });
        if (width === 390) {
          await canvas.scrollIntoViewIfNeeded();
          const box = await canvas.boundingBox();
          const cdp = await context.newCDPSession(page);
          const x = box.x + box.width * 0.65,
            y = box.y + box.height * 0.4;
          const touch = (x, y) => [{ x, y, radiusX: 3, radiusY: 3 }];
          await cdp.send("Input.dispatchTouchEvent", {
            type: "touchStart",
            touchPoints: touch(x, y),
          });
          for (let i = 1; i <= 5; i++)
            await cdp.send("Input.dispatchTouchEvent", {
              type: "touchMove",
              touchPoints: touch(x - i * 12, y + i * 10),
            });
          await cdp.send("Input.dispatchTouchEvent", {
            type: "touchEnd",
            touchPoints: [],
          });
          assert.notEqual(
            await canvas.getAttribute("data-camera-yaw"),
            initialYaw,
          );
          assert.equal(
            await dialog.locator("#case-opening").inputValue(),
            "100",
          );
          await cdp.detach();
        }
      }
      await page.waitForTimeout(300);
      const axe = await new AxeBuilder({ page })
        .include("dialog")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        axe.violations.map((v) => ({
          id: v.id,
          targets: v.nodes.map((n) => n.target),
        })),
        [],
      );
      assert.equal(
        await dialog.evaluate((el) => el.scrollWidth > el.clientWidth),
        false,
      );
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
    }
    assert.deepEqual(errors, []);
    reports.push({
      width,
      heroRotation: "passed",
      heroPauseAndReducedMotion: "passed",
      casesMouseKeyboardAndTopView: "passed",
      openingIndependentOfView: "passed",
      touch: width === 390 ? "passed" : "n/a",
      accessibility: "passed",
    });
    await context.close();
  }
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator(".hero-product.is-ready canvas").waitFor();
  await page
    .locator(".hero-product-canvas canvas")
    .dispatchEvent("webglcontextlost", { cancelable: true });
  await page.waitForFunction(
    () =>
      !document.querySelector(".hero-product").classList.contains("is-ready"),
  );
  assert.equal(
    await page
      .locator(".hero-product img")
      .evaluate((el) => getComputedStyle(el).opacity),
    "1",
  );
  await page.close();
  await fs.writeFile(
    "audit-output/aquila/3d-results.json",
    JSON.stringify(reports, null, 2),
  );
  console.log(
    JSON.stringify({ reports, contextLossFallback: "passed" }, null, 2),
  );
} finally {
  await browser.close();
}
