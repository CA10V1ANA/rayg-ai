import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const url = process.env.AQUILA_URL || "http://127.0.0.1:5175";
const results = [];
await fs.mkdir("audit-output/aquila", { recursive: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url, { waitUntil: "networkidle" });
    const title = page.locator("#origem h2");
    assert.equal(
      await title.evaluate((el) => getComputedStyle(el.parentElement).opacity),
      "0",
      "Unvisited sections wait for scrolling",
    );
    await page.locator("#focusRange").focus();
    assert.equal(
      await page
        .locator(".focus-controls")
        .evaluate((el) => getComputedStyle(el).opacity),
      "1",
      "Keyboard focus reveals a pending control immediately",
    );
    await page.locator("#origem").scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector("#origem h2").parentElement)
          .opacity === "1",
    );
    await page.waitForTimeout(800);
    assert.equal(
      await title.evaluate((el) => getComputedStyle(el.parentElement).filter),
      "blur(0px)",
    );
    await page.screenshot({
      path: `audit-output/aquila/${width}-scroll-story.png`,
    });
    await page.evaluate(() => scrollTo(0, 0));
    assert.equal(
      await title.evaluate((el) => getComputedStyle(el.parentElement).opacity),
      "1",
      "Revealed content stays visible",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await page
        .locator(".t-acc")
        .first()
        .evaluate((el) => getComputedStyle(el).opacity),
      "1",
      "Changing preference immediately reveals pending content",
    );
    await page.emulateMedia({ reducedMotion: "no-preference" });
    assert.equal(
      await title.evaluate((el) => getComputedStyle(el.parentElement).opacity),
      "1",
    );
    if (width === 390) {
      await page.getByRole("button", { name: "Menu +", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Principal" })
        .waitFor({ state: "visible" });
      await page.keyboard.press("Escape");
      await page
        .getByRole("navigation", { name: "Principal" })
        .waitFor({ state: "hidden" });
    }
    const opener = page.getByRole("button", {
      name: "Explorar conceito Essencial",
    });
    await opener.click();
    const dialog = page.getByRole("dialog");
    await page.waitForTimeout(300);
    assert.equal(
      await dialog.evaluate(
        (el) => getComputedStyle(el, "::backdrop").backgroundColor,
      ),
      "rgba(0, 0, 0, 0.733)",
    );
    await dialog.getByRole("button", { name: /Ver caixa/ }).click();
    await dialog.getByRole("button", { name: /Preencher dados/ }).click();
    await page.waitForTimeout(300);
    await dialog.getByLabel("Nome completo").fill("Pessoa Exemplo");
    await dialog
      .getByLabel("E-mail", { exact: true })
      .fill("pessoa@example.com");
    await dialog.getByLabel("CPF", { exact: true }).fill("52998224725");
    await dialog.getByLabel("Celular com DDD").fill("85999999999");
    await dialog.getByRole("button", { name: /Ir para pagamento/ }).click();
    await page.waitForTimeout(350);
    const travel = await dialog.evaluate(async (el) => {
      [...el.querySelectorAll("button")]
        .find((button) => button.textContent.includes("← Voltar"))
        .click();
      await new Promise((resolve) => setTimeout(resolve, 80));
      const outgoing = el.querySelector(".flow-stage[inert]");
      const incoming = el.querySelector(".flow-stage:not([inert])");
      const x = (node) =>
        node ? new DOMMatrix(getComputedStyle(node).transform).m41 : null;
      return {
        outgoingX: x(outgoing),
        incomingX: x(incoming),
        outgoingHidden: outgoing?.getAttribute("aria-hidden"),
      };
    });
    assert.ok(
      travel.outgoingX > 0 && travel.incomingX < 0,
      JSON.stringify(travel),
    );
    assert.equal(travel.outgoingHidden, "true");
    await page.waitForTimeout(300);
    assert.equal(
      await dialog.locator(".flow-stage").count(),
      1,
      "Overlapping exit cleans up",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await dialog.getByRole("button", { name: /← Voltar/ }).click();
    await page.waitForFunction(() => {
      const panel = document.querySelector(".flow-stage:not([inert])");
      return (
        panel &&
        getComputedStyle(panel).opacity === "1" &&
        getComputedStyle(panel).transform === "none"
      );
    });
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert.equal(
      await opener.evaluate((el) => el === document.activeElement),
      true,
    );
    assert.deepEqual(errors, []);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    results.push({
      width,
      scrollReveal: "passed",
      reducedMotionToggle: "passed",
      modalDirectionAndOverlap: "passed",
      backdrop: "passed",
      mobileMenu: width === 390 ? "passed" : "n/a",
    });
    await page.close();
  }
  const staticPage = await browser.newPage();
  await staticPage.addInitScript(() => {
    window.IntersectionObserver = undefined;
  });
  await staticPage.goto(url);
  assert.equal(
    await staticPage
      .locator("#origem h2")
      .evaluate((el) => getComputedStyle(el.parentElement).opacity),
    "1",
    "Content stays visible without IntersectionObserver",
  );
  await staticPage.close();
  const reducedPage = await browser.newPage({ reducedMotion: "reduce" });
  await reducedPage.goto(url);
  assert.equal(
    await reducedPage.locator(".t-stagger-line:not(.is-shown)").count(),
    0,
  );
  await reducedPage.close();
  await fs.writeFile(
    "audit-output/aquila/motion-results.json",
    JSON.stringify(results, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        results,
        noObserverFallback: "passed",
        reducedMotionAtLoad: "passed",
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
