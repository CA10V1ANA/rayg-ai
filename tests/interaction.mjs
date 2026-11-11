import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({ headless: true });
const reports = [];
try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    console.log(`Checking ${viewport.width}px viewport`);
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("http://127.0.0.1:5173", { waitUntil: "networkidle" });
    await page.locator("#product-canvas canvas").waitFor();
    assert.equal(await page.locator("h1").count(), 1);
    await page.locator("#kit-tab-pro").click();
    assert.equal(
      await page.locator("#kit-tab-pro").getAttribute("aria-selected"),
      "true",
    );
    assert.match(
      await page.locator("#kit-panel").textContent(),
      /costura em azul esverdeado/,
    );
    await page.keyboard.press("ArrowRight");
    assert.equal(
      await page.locator("#kit-tab-ultra").getAttribute("aria-selected"),
      "true",
    );
    assert.match(await page.locator("#kit-panel").textContent(), /gaveta/);
    await page.keyboard.press("Home");
    assert.equal(
      await page.locator("#kit-tab-essencial").getAttribute("aria-selected"),
      "true",
    );
    await page.locator("#film-tab-focus").click();
    assert.match(
      await page.locator("#film-panel").textContent(),
      /Três camadas/,
    );
    await page.keyboard.press("ArrowRight");
    assert.equal(
      await page.locator("#film-tab-access").getAttribute("aria-selected"),
      "true",
    );
    await page
      .getByRole("button", { name: "Repetir animação da marca" })
      .click();
    await page.locator("#film-panel svg").waitFor();
    await page.locator("#film-tab-signature").click();
    const overflow = () =>
      page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
      }));
    let size = await overflow();
    assert.ok(size.scroll <= size.width, JSON.stringify(size));
    const initial = await page.locator("#clarity").textContent();
    await page.locator("#autofocus").click();
    await page.waitForFunction(
      () => document.querySelector("#clarity").textContent === "100%",
    );
    await page.waitForFunction(
      () => !document.querySelector("#autofocus").disabled,
    );
    assert.notEqual(initial, "100%");
    assert.equal(
      await page.locator("#vision-scene").evaluate((el) => el.style.filter),
      "blur(0px)",
    );
    await page.locator("#reset-focus").click();
    assert.equal(await page.locator("#diopter").inputValue(), "-4");
    await page.locator("#diopter").fill("0.5");
    assert.equal(await page.locator("#clarity").textContent(), "100%");
    await page.locator("#cost").fill("300");
    await page.locator("#replacements").fill("4");
    assert.match(await page.locator("#savings").textContent(), /950/);
    await page.locator("#replacements").fill("");
    assert.notEqual(await page.locator("#calc-error").textContent(), "");
    assert.equal(await page.locator("#savings").textContent(), "—");
    await page.locator("#cost").fill("250");
    await page.locator("#replacements").fill("5");
    for (const [key, price] of [
      ["essencial", "250"],
      ["pro", "400"],
      ["ultra", "750"],
    ]) {
      await page.locator(`[data-model="${key}"]`).click();
      assert.match(
        await page.locator("#order-total").textContent(),
        new RegExp(price),
      );
      await page.locator('input[value="parcelado"]').check();
      await page.getByRole("button", { name: "Concluir simulação" }).click();
      await page.locator("#checkout-success").waitFor();
      assert.match(
        await page.locator("#checkout-success").textContent(),
        /10x/,
      );
      await page.getByRole("button", { name: "Voltar à vitrine" }).click();
      assert.equal(
        await page.locator("dialog").evaluate((el) => el.open),
        false,
      );
    }
    await page.locator('[data-model="pro"]').click();
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("dialog").evaluate((el) => el.open), false);
    await page.locator("details").first().locator("summary").click();
    assert.equal(
      await page.locator("details").first().getAttribute("open"),
      "",
    );
    await page.locator("#contrast").click();
    await page.waitForTimeout(250);
    assert.equal(
      await page.locator("#contrast").getAttribute("aria-pressed"),
      "true",
    );
    const highContrast = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    console.log(
      `High contrast violations: ${highContrast.violations.map((v) => v.id).join(", ") || "none"}`,
    );
    await page.locator("#font-size").click();
    await page.locator("#font-size").click();
    size = await overflow();
    if (size.scroll > size.width)
      console.log(
        await page.evaluate(() =>
          Array.from(document.querySelectorAll("body *"))
            .filter((e) => e.getBoundingClientRect().right > innerWidth + 0.1)
            .map((e) => ({
              tag: e.tagName,
              cls: e.className,
              r: e.getBoundingClientRect().right,
            })),
        ),
      );
    assert.ok(size.scroll <= size.width, `enlarged: ${JSON.stringify(size)}`);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator("#font-size").textContent(), "A↺");
    assert.equal(
      await page.locator("#contrast").getAttribute("aria-pressed"),
      "true",
    );
    await page.locator("#font-size").click();
    await page.locator("#contrast").click();
    await page.waitForTimeout(250);
    if (viewport.width < 600) {
      await page.locator("#menu-toggle").click();
      assert.equal(
        await page.locator("#menu-toggle").getAttribute("aria-expanded"),
        "true",
      );
      await page.locator("#navigation a").first().click();
      assert.equal(
        await page.locator("#menu-toggle").getAttribute("aria-expanded"),
        "false",
      );
    }
    const normal = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    await page.locator("#rotate-product").click();
    assert.equal(
      await page.locator("#rotate-product").getAttribute("aria-pressed"),
      "true",
    );
    await page.locator("#rotate-product").click();
    reports.push({
      viewport,
      errors,
      accessibility: {
        normal: normal.violations,
        highContrast: highContrast.violations,
      },
    });
    assert.deepEqual(errors, []);
    await context.close();
  }
  const reduced = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await reduced.newPage();
  await page.goto("http://127.0.0.1:5173", { waitUntil: "networkidle" });
  await page.locator("#autofocus").click();
  await page.waitForFunction(
    () => document.querySelector("#clarity").textContent === "100%",
  );
  await page.locator("#film-tab-focus").click();
  assert.equal(
    await page
      .locator("#film-panel svg path")
      .first()
      .evaluate((el) => getComputedStyle(el).opacity),
    "1",
  );
  await page.getByRole("button", { name: "Repetir animação da marca" }).click();
  assert.equal(
    await page
      .locator("#film-panel svg path")
      .first()
      .evaluate((el) => getComputedStyle(el).opacity),
    "1",
  );
  await reduced.close();
  await mkdir("audit-output", { recursive: true });
  await writeFile(
    "audit-output/interactions.json",
    JSON.stringify(reports, null, 2),
  );
  const violations = reports.flatMap((r) => [
    ...r.accessibility.normal,
    ...r.accessibility.highContrast,
  ]);
  assert.equal(
    violations.length,
    0,
    violations
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join()).join("; ")}`)
      .join("\n"),
  );
  console.log(
    "Passed: desktop/mobile interactions, pricing, focus, calculator, persisted settings, menu, rotation, packaging keyboard tabs, brand sequences, reduced motion and WCAG AA accessibility.",
  );
} finally {
  await browser.close();
}
