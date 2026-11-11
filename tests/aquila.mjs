import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const url = process.env.AQUILA_URL || "http://127.0.0.1:5173";
const results = [];
await fs.mkdir("audit-output/aquila", { recursive: true });
try {
  for (const [width, height] of [
    [1440, 900],
    [1024, 768],
    [820, 1180],
    [768, 1024],
    [390, 844],
    [320, 844],
  ]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url, { waitUntil: "networkidle" });
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page.waitForTimeout(650);
    await page.evaluate(async () => {
      await Promise.all(
        [...document.images].map((img) => {
          img.loading = "eager";
          return img.decode();
        }),
      );
    });
    assert.equal(await page.title(), "AQUILA — Uma nova perspectiva");
    assert.equal(await page.locator("h1").count(), 1);
    if (width > 900) {
      assert.ok(
        await page.locator(".nav").evaluate((el) => {
          const r = el.getBoundingClientRect();
          return (
            Math.abs((r.left + r.right) / 2 - innerWidth / 2) < 1 &&
            getComputedStyle(el).borderRadius === "999px" &&
            el.contains(document.querySelector(".scroll-brand")) &&
            el.contains(document.querySelector("#navigation")) &&
            el.contains(document.querySelector(".nav-action"))
          );
        }),
        `${width}: complete navigation capsule is centered`,
      );
    }
    const product = page.locator(".hero-art img");
    assert.equal(
      await product.evaluate((el) => getComputedStyle(el).animationName),
      "eyewear-entrance, eyewear-orbit",
    );
    assert.equal(
      await product.evaluate(
        (el) => getComputedStyle(el).animationIterationCount,
      ),
      "1, infinite",
    );
    await product.evaluate(async (el) => {
      await Promise.all(
        el
          .getAnimations()
          .filter(
            (animation) => animation.effect.getTiming().iterations !== Infinity,
          )
          .map((animation) => animation.finished),
      );
    });
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement.className),
      "skip-link",
    );
    await page.evaluate(() => document.activeElement.blur());
    const beforeMotion = await product.evaluate(
      (el) => getComputedStyle(el).transform,
    );
    await page.waitForTimeout(150);
    assert.notEqual(
      await product.evaluate((el) => getComputedStyle(el).transform),
      beforeMotion,
    );
    await page.getByRole("button", { name: "Pausar movimento" }).click();
    assert.equal(
      await product.evaluate((el) => getComputedStyle(el).animationPlayState),
      "paused",
    );
    const pausedTransform = await product.evaluate(
      (el) => getComputedStyle(el).transform,
    );
    await page.waitForTimeout(150);
    assert.equal(
      await product.evaluate((el) => getComputedStyle(el).transform),
      pausedTransform,
    );
    await page.getByRole("button", { name: "Retomar movimento" }).click();
    assert.equal(
      await product.evaluate((el) => getComputedStyle(el).animationPlayState),
      "running, running",
    );
    const brand = page.getByRole("link", {
      name: "AQUILA início",
      exact: true,
    });
    await page.evaluate(() => scrollTo(0, 132));
    await page.waitForFunction(() => {
      const p = Number(
        document
          .querySelector(".scroll-brand")
          .style.getPropertyValue("--brand-progress"),
      );
      return p > 0 && p < 1;
    });
    assert.ok(
      await page
        .locator(".brand-diagonal")
        .evaluate((el) => Number(getComputedStyle(el).opacity) > 0),
      "The diagonal appears only during the brand transition",
    );
    await page.evaluate(() => scrollTo(0, 300));
    await page.waitForFunction(
      () =>
        document
          .querySelector(".scroll-brand")
          .style.getPropertyValue("--brand-progress") === "1",
    );
    assert.equal(
      await page
        .locator(".brand-tail")
        .evaluate((el) => getComputedStyle(el).opacity),
      "0",
    );
    assert.equal(
      await page
        .locator(".brand-last-a")
        .evaluate((el) => getComputedStyle(el).opacity),
      "0",
    );
    assert.equal(
      await page
        .locator(".brand-diagonal")
        .evaluate((el) => getComputedStyle(el).opacity),
      "0",
    );
    assert.equal(
      await page
        .locator(".site-header")
        .evaluate((el) => el.getBoundingClientRect().top),
      0,
    );
    await page.screenshot({
      path: `audit-output/aquila/${width}-compact-brand.png`,
      clip: { x: 0, y: 0, width, height: width <= 900 ? 80 : 96 },
    });
    await brand.click();
    await page.waitForFunction(
      () =>
        document
          .querySelector(".scroll-brand")
          .style.getPropertyValue("--brand-progress") === "0",
    );
    for (const id of ["experiencia", "modelos", "origem", "duvidas"]) {
      await page.evaluate((id) => {
        const section = document.getElementById(id);
        scrollTo(0, section.getBoundingClientRect().top + scrollY);
      }, id);
      await page.waitForFunction(
        () => document.querySelector(".site-header").dataset.tone === "light",
      );
      assert.equal(
        await page.locator(".nav").evaluate((el) => getComputedStyle(el).color),
        "rgb(41, 34, 37)",
      );
    }
    await page.screenshot({
      path: `audit-output/aquila/${width}-light-navbar.png`,
    });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForFunction(
      () => document.querySelector(".site-header").dataset.tone === "dark",
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `${width}: horizontal overflow`,
    );
    if (width <= 900) {
      const menu = page.locator(".menu-toggle");
      await menu.click();
      assert.equal(await menu.getAttribute("aria-expanded"), "true");
      await page
        .getByRole("navigation")
        .getByRole("link", { name: "Os modelos" })
        .focus();
      await page.keyboard.press("Escape");
      assert.equal(await menu.getAttribute("aria-expanded"), "false");
      assert.equal(
        await menu.evaluate((el) => el === document.activeElement),
        true,
      );
    }
    const slider = page.getByRole("slider", { name: "Nitidez da imagem" });
    await slider.focus();
    await page.keyboard.press("End");
    assert.equal(await slider.inputValue(), "100");
    await page.getByRole("button", { name: "Recomeçar" }).click();
    assert.equal(await slider.inputValue(), "25");
    await page.getByRole("button", { name: "Ver a transformação" }).click();
    await page.waitForTimeout(600);
    assert.equal(await slider.inputValue(), "100");
    for (const model of ["Essencial", "Signature", "Prestige"]) {
      const opener = page.getByRole("button", {
        name: `Explorar conceito ${model}`,
      });
      await opener.click();
      assert.equal(
        await page
          .getByRole("dialog")
          .getByRole("heading", { level: 2 })
          .innerText(),
        `AQUILA ${model}`,
      );
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
      assert.equal(
        await page.locator("dialog").evaluate((el) => el.open),
        false,
      );
      assert.equal(
        await opener.evaluate((el) => el === document.activeElement),
        true,
      );
    }
    const question = page.getByRole("button", {
      name: "Já posso fazer um pedido?",
    });
    await question.click();
    assert.equal(await question.getAttribute("aria-expanded"), "true");
    await question.click();
    assert.equal(await question.getAttribute("aria-expanded"), "false");
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      axe.violations.map(({ id, nodes }) => ({
        id,
        elements: nodes.map((n) => n.target),
      })),
      [],
      `${width}: accessibility`,
    );
    assert.deepEqual(errors, [], `${width}: runtime errors`);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `audit-output/aquila/${width}-hero.png` });
    await page.screenshot({
      path: `audit-output/aquila/${width}-full.png`,
      fullPage: true,
    });
    results.push({
      width,
      height,
      overflow: false,
      runtimeErrors: errors,
      axeViolations: axe.violations.length,
      axeNeedsReview: axe.incomplete.length,
    });
    await context.close();
  }
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => scrollTo(0, 300));
  await page.waitForTimeout(80);
  assert.equal(
    await page
      .locator(".brand-tail")
      .evaluate((el) => getComputedStyle(el).opacity),
    "1",
  );
  await page.evaluate(() => scrollTo(0, 0));
  assert.equal(
    await page
      .locator(".enter-line")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  assert.equal(
    await page
      .locator(".hero-art img")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  assert.equal(
    await page
      .locator(".hero-aside")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  await page.getByRole("button", { name: "Ver a transformação" }).click();
  assert.equal(await page.getByRole("slider").inputValue(), "100");
  const opener = page.getByRole("button", {
    name: "Explorar conceito Essencial",
  });
  await opener.click();
  assert.equal(
    await page
      .getByRole("dialog")
      .evaluate((el) => getComputedStyle(el).transitionDuration),
    "0s",
  );
  await page.keyboard.press("Escape");
  await page.locator("dialog").waitFor({ state: "hidden" });
  await page.screenshot({ path: "audit-output/aquila/reduced-motion.png" });
  results.push({ reducedMotion: "passed" });
  await fs.writeFile(
    "audit-output/aquila/results.json",
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
