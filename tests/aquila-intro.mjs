import assert from "node:assert/strict";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const url = process.env.AQUILA_URL || "http://127.0.0.1:5175";
try {
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const intro = page.getByRole("dialog", { name: "Abertura AQUILA" });
    await intro.waitFor();
    await page.evaluate(() => {
      const node = document.querySelector(".site-intro");
      window.introReview = { phases: [node.dataset.phase] };
      window.introReview.samples = { ascending: [], left: [] };
      const sample = () => {
        const phase = node.dataset.phase;
        if (window.introReview.samples[phase]) {
          const matrix = new DOMMatrix(getComputedStyle(node.querySelector(".intro-signature")).transform);
          window.introReview.samples[phase].push([matrix.e, matrix.f]);
        }
        if (node.isConnected) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
      const observer = new MutationObserver(() => {
        const phase = node.dataset.phase;
        if (!window.introReview.phases.includes(phase))
          window.introReview.phases.push(phase);
        if (phase === "ascending") {
          const mark = node.querySelector(".brandmark").getBoundingClientRect();
          const letters = node.querySelector(".wordmark").getBoundingClientRect();
          window.introReview.stacked = letters.top >= mark.bottom;
          window.introReview.centered = Math.abs(mark.x + mark.width / 2 - innerWidth / 2) < 1;
          window.introReview.siteHidden = getComputedStyle(document.querySelector(".site-content")).visibility;
          window.introReview.titlePaused = getComputedStyle(document.querySelector(".enter-line")).animationPlayState;
        }
        if (phase === "landed") {
          const a = node
            .querySelector(".intro-logo .brandmark")
            .getBoundingClientRect();
          const b = document
            .querySelector(".scroll-brand .brandmark")
            .getBoundingClientRect();
          const c = node
            .querySelector(".intro-logo .wordmark")
            .getBoundingClientRect();
          const d = document
            .querySelector(".scroll-brand .wordmark")
            .getBoundingClientRect();
          window.introReview.landing = [
            a.x - b.x,
            a.y - b.y,
            a.width - b.width,
            c.x - d.x,
            c.y - d.y,
          ];
          observer.disconnect();
        }
      });
      observer.observe(node, {
        attributes: true,
        attributeFilter: ["data-phase"],
      });
    });
    assert.equal(
      await page.locator(".site-content").evaluate((el) => el.inert),
      true,
    );
    await page.keyboard.press("Tab");
    assert.match(
      await page.evaluate(() => document.activeElement.textContent),
      /Pular abertura/,
    );
    await page.waitForTimeout(700);
    await page.screenshot({
      path: `audit-output/aquila/${width}-site-intro.png`,
    });
    const axe = await new AxeBuilder({ page })
      .include(".site-intro")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      axe.violations.map((v) => ({
        id: v.id,
        targets: v.nodes.map((n) => n.target),
      })),
      [],
    );
    await intro.waitFor({ state: "hidden", timeout: 6000 });
    const choreography = await page.evaluate(() => window.introReview);
    assert.deepEqual(choreography.phases, [
      "drawing",
      "letters",
      "ascending",
      "left",
      "landed",
    ]);
    assert.equal(choreography.stacked, true, "QUILA sits below the completed symbol");
    assert.equal(choreography.centered, true, "Symbol remains centered before ascent");
    assert.equal(choreography.siteHidden, "hidden");
    assert.equal(choreography.titlePaused, "paused");
    const spread = (samples, axis) => Math.max(...samples.map(p => p[axis])) - Math.min(...samples.map(p => p[axis]));
    assert.ok(choreography.samples.ascending.length > 2);
    assert.ok(choreography.samples.left.length > 2);
    assert.ok(spread(choreography.samples.ascending, 0) < 1, "Ascent has no horizontal movement");
    assert.ok(spread(choreography.samples.left, 1) < 1, "Left leg has no vertical movement");
    assert.ok(
      choreography.landing.every((delta) => Math.abs(delta) <= 1),
      JSON.stringify(choreography.landing),
    );
    assert.equal(
      await page.locator(".site-content").evaluate((el) => el.inert),
      false,
    );
    assert.equal(
      await page.locator(".intro-particles").count(),
      0,
      "Canvas is disposed after the intro",
    );
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("dialog", { name: "Abertura AQUILA" }).waitFor();
    await page.keyboard.press("Escape");
    await page.locator(".site-intro").waitFor({ state: "hidden" });
    await page.waitForFunction(
      () => document.getElementById("conteudo") === document.activeElement,
    );
    assert.equal(
      await page
        .locator("#conteudo")
        .evaluate((el) => el === document.activeElement),
      true,
    );
    assert.deepEqual(errors, []);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    console.log(
      `${width}: desenho central, letras abaixo, subida reta, percurso à esquerda e chegada precisa, teclado e acessibilidade aprovados`,
    );
    await context.close();
  }
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator(".site-intro").waitFor({ state: "hidden" });
  assert.equal(
    await page.locator(".site-content").evaluate((el) => el.inert),
    false,
  );
  console.log("Movimento reduzido: abertura dispensada sem animação.");
  await page.close();
} finally {
  await browser.close();
}
